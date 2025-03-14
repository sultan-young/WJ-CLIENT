import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import html2canvas from "html2canvas";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import { Button, Row, Col } from "antd";
import { useAuth } from "../../../context/AuthContext"; // 假设有权限上下文
import { exportImage } from "../../../services/productService";
import "./index.css";

const ExportOrder = forwardRef(
  ({ supplierForm, orderForm, shippingDate, suppliers }, ref) => {
    const { supplier: supplierId } = supplierForm.current
      ? // eslint-disable-next-line no-unsafe-optional-chaining
        supplierForm?.current?.getFieldValue()
      : "";
    const orderList = orderForm.current ? orderForm.current.getValues() : [];
    const suppliersData = suppliers?.find((a) => a.id === supplierId);
    const { user } = useAuth(); // 获取当前用户信息
    const isAdmin = user?.name === "admin";
    const contentRef = useRef(null);
    const cardRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // 检测是否为移动设备
    useEffect(() => {
      const checkMobile = () => {
        //一张a4纸的宽度
        setIsMobile(window.innerWidth < 595); // 根据实际情况调整断点
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => {
        window.removeEventListener("resize", checkMobile);
      };
    }, []);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      exportAsImage,
      exportAsPDF,
      downloadAsImage,
      downloadAsPDF,
      exportOrderFile,
    }));

    // 预加载所有图片
    useEffect(() => {
      const preloadImages = async () => {
        if (!contentRef.current) return;

        const images = Array.from(contentRef.current.querySelectorAll("img"));

        // 等待所有图片加载完成
        await Promise.all(
          images.map((img) => {
            if (img.complete) return Promise.resolve();

            return new Promise((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => {
                console.error(`Failed to load image: ${img.src}`);
                resolve(); // 即使加载失败也继续
              };
            });
          })
        );
      };

      preloadImages();
    }, []);

    const getProductPrice = (item) => {
      let price = item.costPriceRMB;

      if (item.priceLinkSuppliers === 1) {
       price = (item.costSuppliersLinkPricesRMB || []).find(priceObj => priceObj.id === supplierId)?.price || price 
      }

      return price
    }

    // 创建专门用于导出的内容（确保每行至少4个商品）
    const createExportContent = async (imageUrlBase65Map) => {
      if (!contentRef.current) return null;

      // 判断是否需要创建特殊导出布局
      const needsSpecialLayout = isMobile;

      if (!needsSpecialLayout) {
        // 如果不需要特殊布局，直接克隆原始内容
        const clone = contentRef.current.cloneNode(true);

        // 处理图片
        const clonedImages = Array.from(clone.querySelectorAll("img"));
        clonedImages.forEach((img) => {
          img.src = imageUrlBase65Map[img.src] || img.src;
        });

        // 修复计数标签在导出时的样式问题
        const countLabels = Array.from(
          clone.querySelectorAll(".product-card-count")
        );
        countLabels.forEach((label) => {
          label.style.paddingBottom = "10px";
          label.style.fontSize = "14px";
        });

        return clone;
      }

      // 创建特殊导出布局
      const exportContainer = document.createElement("div");
      exportContainer.className = "style-1";

      // 复制原始内容的结构，但修改产品网格
      const originalContent = contentRef.current;

      // 创建订单卡片
      const orderCard = document.createElement("div");
      orderCard.className = "order-card";

      const orderCardInner = document.createElement("div");
      orderCardInner.className = "order-card-inner";

      // 复制基本信息部分
      const basicInfoSection = originalContent.querySelector(
        ".order-card-inner > div:first-child"
      );
      if (basicInfoSection) {
        orderCardInner.appendChild(basicInfoSection.cloneNode(true));
      }

      // 复制订单内容部分
      const orderContentSection =
        originalContent.querySelector(".order-content");
      if (orderContentSection) {
        orderCardInner.appendChild(orderContentSection.cloneNode(true));
      }

      // 创建订单详情部分，但使用4列布局
      const orderNotesOriginal = originalContent.querySelector(".order-notes");
      if (orderNotesOriginal) {
        const orderNotes = orderNotesOriginal.cloneNode(false);
        orderNotes.className = "order-notes";

        // 复制标题
        const orderNotesLabel =
          orderNotesOriginal.querySelector(".order-item-label");
        if (orderNotesLabel) {
          orderNotes.appendChild(orderNotesLabel.cloneNode(true));
        }

        // 创建内容容器
        const orderNotesContent = document.createElement("div");
        orderNotesContent.className = "order-notes-content";

        // 创建新的Row，强制使用4列布局
        const newRow = document.createElement("div");
        newRow.style.display = "grid";
        newRow.style.gridTemplateColumns = "repeat(4, 1fr)";
        newRow.style.gap = "16px";

        // 复制所有产品卡片，但调整布局
        const productCards = Array.from(
          originalContent.querySelectorAll(".product-card")
        );
        productCards.forEach((card) => {
          const colDiv = document.createElement("div");
          colDiv.style.marginBottom = "16px";
          colDiv.style.paddingBottom = "16px";

          const clonedCard = card.cloneNode(true);
          // 处理卡片中的图片
          const cardImage = clonedCard.querySelector("img");
          if (cardImage) {
            cardImage.src = imageUrlBase65Map[cardImage.src] || cardImage.src;
          }

          // 修复计数标签在导出时的样式问题
          const countLabel = clonedCard.querySelector(".product-card-count");
          if (countLabel) {
            countLabel.style.paddingBottom = "6px";
            countLabel.style.fontSize = "14px";
          }

          colDiv.appendChild(clonedCard);
          newRow.appendChild(colDiv);
        });

        orderNotesContent.appendChild(newRow);

        // 复制总价信息（如果是管理员）
        if (isAdmin) {
          const totalPriceInfo = orderNotesOriginal.querySelector(
            ".order-notes-content > div:last-child"
          );
          if (totalPriceInfo) {
            orderNotesContent.appendChild(totalPriceInfo.cloneNode(true));
          }
        }

        orderNotes.appendChild(orderNotesContent);
        orderCardInner.appendChild(orderNotes);
      }

      // 复制订单备注部分
      const orderRemarks = originalContent.querySelector(
        ".order-notes:nth-of-type(2)"
      );
      if (orderRemarks) {
        orderCardInner.appendChild(orderRemarks.cloneNode(true));
      } else {
        // 备用方法：查找所有order-notes，获取最后一个
        const allOrderNotes = originalContent.querySelectorAll(".order-notes");
        if (allOrderNotes.length > 1) {
          orderCardInner.appendChild(
            allOrderNotes[allOrderNotes.length - 1].cloneNode(true)
          );
        }
      }

      // 复制水印
      const watermark = originalContent.querySelector(".company-watermark");
      if (watermark) {
        orderCardInner.appendChild(watermark.cloneNode(true));
      }

      orderCard.appendChild(orderCardInner);
      exportContainer.appendChild(orderCard);

      return exportContainer;
    };

    // 完全重写的导出函数 - 使用DOM克隆和绝对定位确保捕获全部内容
    const captureEntireContent = async () => {
      if (!cardRef.current || !contentRef.current) return null;

      setIsExporting(true);

      const imageUrls = orderList.map((item) => item.images[0]?.url || "");
      const base64Result = await exportImage({
        imageUrls,
      });
      const imageUrlBase65Map = (base64Result.result || []).reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {}
      );

      try {
        // 1. 创建一个临时容器
        const tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.top = "0";
        tempContainer.style.width = isMobile
          ? "695px"
          : `${contentRef.current.offsetWidth}px`;
        document.body.appendChild(tempContainer);

        // 2. 创建导出内容（根据屏幕大小决定是否使用特殊布局）
        const exportContent = await createExportContent(imageUrlBase65Map);
        if (!exportContent) {
          throw new Error("Failed to create export content");
        }

        // 3. 将导出内容添加到临时容器
        tempContainer.appendChild(exportContent);

        // 4. 等待所有图片加载完成
        const clonedImages = Array.from(exportContent.querySelectorAll("img"));
        await Promise.all(
          clonedImages.map((img) => {
            if (img.complete) return Promise.resolve();

            return new Promise((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => {
                console.error(`Failed to load cloned image: ${img.src}`);
                resolve();
              };
            });
          })
        );

        // 5. 使用html2canvas捕获克隆元素
        const canvas = await html2canvas(exportContent, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: "white",
          scale: 2,
          logging: true,
          imageTimeout: 30000,
          onclone: (_, element) => {
            console.log(
              "Clone dimensions:",
              element.offsetWidth,
              element.offsetHeight
            );
          },
        });

        // 6. 清理临时元素
        document.body.removeChild(tempContainer);

        return canvas;
      } catch (error) {
        console.error("Error capturing content:", error);
        return null;
      } finally {
        setIsExporting(false);
      }
    };

    // 导出为图片
    const exportAsImage = async () => {
      try {
        const canvas = await captureEntireContent();
        if (!canvas) return null;

        return canvas.toDataURL("image/png", 1.0);
      } catch (error) {
        console.error("Error exporting as image:", error);
        return null;
      }
    };

    // 导出为PDF
    const exportAsPDF = async () => {
      try {
        const canvas = await captureEntireContent();
        if (!canvas) return null;

        const imgData = canvas.toDataURL("image/png", 1.0);

        // 计算PDF尺寸 (考虑scale=2)
        const pdfWidth = canvas.width / 2;
        const pdfHeight = canvas.height / 2;

        // 创建PDF
        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
          unit: "px",
          format: [pdfWidth, pdfHeight],
        });

        // 添加图像到PDF
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        return pdf.output("dataurlstring");
      } catch (error) {
        console.error("Error exporting as PDF:", error);
        return null;
      }
    };

    // 导出img和pdf
    const exportOrderFile = async () => {
      await downloadAsImage();
      await downloadAsPDF();
    };

    const downloadAsImage = async () => {
      // setIsExporting(true);
      try {
        const imageData = await exportAsImage();
        console.log(imageData, "imagedata");
        if (imageData) {
          const link = document.createElement("a");
          link.href = imageData;
          const timeStr = dayjs().format("YYYY-MM-DD HH:mm:ss");
          link.download = `${suppliersData?.name}-${timeStr}.png`;

          link.click();
        }
      } finally {
        setIsExporting(false);
      }
    };

    const downloadAsPDF = async () => {
      // setIsExporting(true);
      try {
        const pdfData = await exportAsPDF();
        if (pdfData) {
          const link = document.createElement("a");
          link.href = pdfData;
          const timeStr = dayjs().format("YYYY-MM-DD HH:mm:ss");
          link.download = `${suppliersData?.name}-${timeStr}.pdf`;
          link.click();
        }
      } finally {
        setIsExporting(false);
      }
    };

    const priceList = orderList?.map((order) => order.count * getProductPrice(order));
    const totalPrice = priceList.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);

    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-6 flex gap-2">
          <Button onClick={downloadAsImage} type="link">
            导出为图片
          </Button>
          <Button onClick={downloadAsPDF} type="link">
            导出为pdf
          </Button>
        </div>
        <div ref={cardRef}>
          <div className="style-1" ref={contentRef}>
            <div className="order-card">
              <div className="order-card-inner">
                <div className="order-item-label">基本信息</div>
                <div className="order-content">
                  <div className="order-item important">
                    <div className="order-item-label">供应商名称:</div>
                    <div className="order-item-value">
                      {suppliersData?.name}
                    </div>
                  </div>
                  <div className="order-item important">
                    <div className="order-item-label">下单日期:</div>
                    <div className="order-item-value">
                      {dayjs().format("YYYY-MM-DD")}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="order-item important">
                      <div className="order-item-label">订单总额:</div>
                      <div className="order-item-value">{totalPrice}</div>
                    </div>
                  )}
                </div>

                <div className="order-notes">
                  <div className="order-item-label">订单详情</div>
                  <div className="order-notes-content">
                    <Row gutter={[16, 16]}>
                      {orderList.map((item, index) => (
                        <Col
                          xs={12} // 手机宽度下每行显示 1 个
                          sm={12} // 小屏幕宽度下每行显示 2 个
                          md={6} // 中等屏幕宽度下每行显示 3 个
                          lg={4} // 大屏幕宽度下每行显示 4 个
                          xl={4} // 超大屏幕宽度下每行显示 6 个
                          key={index}
                          style={{ marginBottom: 16, paddingBottom: 16 }}
                        >
                          <div className="product-card">
                            <div
                              style={{
                                height: "150px",
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                key={item.images[0]?.picturebedId}
                                style={{
                                  objectFit: "cover", // 保持原比例
                                  maxWidth: "100%",
                                  // maxHeight: "100%",
                                  width: "auto",
                                  // height: "100%",
                                }}
                                src={item.images[0]?.url || "/placeholder.svg"}
                              />
                            </div>

                            <div className="product-card-count">
                              x{item.count}
                            </div>
                            <span
                              className="product-card-title"
                              style={{ padding: "6px 0", textAlign: "center" }}
                            >{`${item.sku}(${item.nameCn})`}</span>

                            {isAdmin && (
                              <span
                                className="product-card-desc"
                                style={{
                                  marginBottom: 12,
                                  fontSize: 14,
                                  textAlign: "center",
                                  marginTop: 0,
                                }}
                              >
                                总额：
                                <span className="product-card-price">
                                  {`${getProductPrice(item)}*${item.count}=${
                                    getProductPrice(item) * item.count
                                  }`}
                                </span>
                              </span>
                            )}
                          </div>
                        </Col>
                      ))}
                    </Row>
                    {isAdmin && (
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "#000",
                          wordWrap: "break-word",
                        }}
                      >
                        本次应支付：
                        {orderList?.length > 1 && `${priceList?.join("+")}=`}
                        <span style={{ color: "#fb914d", fontSize: "18px" }}>
                          {totalPrice}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {/* <div className="order-notes">
                  <div className="order-item-label">订单备注</div>
                  <div className="order-notes-content">
                    请在工作日发货，周末不在家。如有问题请联系手机号。产品请使用环保包装，谢谢！
                  </div>
                </div> */}

                <div className="company-watermark">造物无界</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default ExportOrder;

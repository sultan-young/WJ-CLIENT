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
import { Table, Button, Row, Col, Input, DatePicker } from "antd";
import { usePreloadData } from "../../../context/AppContext";
import { exportImage } from "../../../services/productService";
import "./index.css";

const ExportOrder = forwardRef(({ supplierForm, orderForm }, ref) => {
  const { supplier: supplierId } = supplierForm.current
    ? // eslint-disable-next-line no-unsafe-optional-chaining
      supplierForm?.current?.getFieldValue()
    : "";
  const orderList = orderForm.current ? orderForm.current.getValues() : [];
  const { suppliers } = usePreloadData();

  const suppliersData = suppliers?.find((a) => a.id === supplierId);

  const contentRef = useRef(null);
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

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

  // 完全重写的导出函数 - 使用DOM克隆和绝对定位确保捕获全部内容
  const captureEntireContent = async () => {
    if (!cardRef.current || !contentRef.current) return null;

    setIsExporting(true);

    const imageUrls = orderList.map((item) => item.images[0]?.url || "");
    console.log(imageUrls, 11);
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
      tempContainer.style.width = `${contentRef.current.offsetWidth}px`;
      document.body.appendChild(tempContainer);

      // 2. 克隆要导出的内容
      const clone = contentRef.current.cloneNode(true);

      // 3. 设置克隆元素的样式
      clone.style.width = `${contentRef.current.offsetWidth}px`;
      clone.style.backgroundColor = "white";
      clone.style.position = "static";
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.padding = contentRef.current.style.padding || "24px";

      // 4. 处理克隆元素中的所有图片
      const clonedImages = Array.from(clone.querySelectorAll("img"));
      clonedImages.forEach((img) => {
        img.src = imageUrlBase65Map[img.src];
        img.style.maxWidth = "none";
        img.style.maxHeight = "none";
      });

      // 5. 将克隆元素添加到临时容器
      tempContainer.appendChild(clone);

      // 6. 等待所有图片加载完成
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

      // 7. 使用html2canvas捕获克隆元素
      const canvas = await html2canvas(clone, {
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

      // 8. 清理临时元素
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

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6 flex gap-2">
        <Button onClick={downloadAsImage} type="link">
          导出为图片
        </Button>
        <Button onClick={downloadAsPDF} type="link">
          导图为pdf
        </Button>
      </div>
      <div  ref={cardRef}>
      <div className="style-1" ref={contentRef}>
        <div className="order-card">
          <div className="order-card-inner">
            <div className="order-header">
              <h1 className="order-title">{suppliersData?.name}(ORD20240311-8765)</h1>
            </div>

            <div className="order-content">
              <div className="order-column">
                <div className="order-item important">
                  <div className="order-item-label">发货日期</div>
                  <div className="order-item-value">2024年3月15日</div>
                </div>

                {/* <div className="order-item">
                  <div className="order-item-label">订单创建日期</div>
                  <div className="order-item-value">2024年3月11日</div>
                </div> */}
              </div>

              <div className="order-column">
                <div className="order-item important">
                  <div className="order-item-label">订单金额</div>
                  <div className="order-item-value">¥2,580.00</div>
                </div>

                {/* <div className="order-item">
                  <div className="order-item-label">支付方式</div>
                  <div className="order-item-value">微信支付</div>
                </div> */}
              </div>

              <div className="order-column">
                <div className="order-item important">
                  <div className="order-item-label">订单金额</div>
                  <div className="order-item-value">¥2,580.00</div>
                </div>

                {/* <div className="order-item">
                  <div className="order-item-label">支付方式</div>
                  <div className="order-item-value">微信支付</div>
                </div> */}
              </div>
            </div>

            <div className="order-notes">
              <div className="order-item-label">订单详情</div>
              <div className="order-notes-content">
                <Row gutter={16}>
                  {orderList.map((item, index) => (
                    <Col
                      span={4}
                      key={index}
                      style={{ marginBottom: 16, paddingBottom: 16 }}
                    >
                      <div className="product-card">
                        <img
                          key={item.images[0].picturebedId}
                          style={{
                            objectFit: "cover",
                            height: "150px",
                          }}
                          src={item.images[0].url}
                        />
                        <span
                          className="product-card-title"
                          style={{ margin: "6px 0" }}
                        >{`${item.nameCN}(${item.sku})`}</span>
                        <span
                          className="product-card-desc"
                          style={{ marginBottom: 12 }}
                        >
                          订购数量:
                          <span className="product-card-count">
                            {item.count}
                          </span>
                        </span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
            <div className="order-notes">
              <div className="order-item-label">订单备注</div>
              <div className="order-notes-content">
                请在工作日发货，周末不在家。如有问题请联系手机号。产品请使用环保包装，谢谢！
              </div>
            </div>

            <div className="company-watermark">造物无界</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
});

export default ExportOrder;

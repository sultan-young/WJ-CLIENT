import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Table, Button, Row, Col, Input, DatePicker } from "antd";
import { usePreloadData } from "../../../context/AppContext";

export default ({ supplierForm, orderForm }) => {
  const { supplier: supplierId } = supplierForm.current
    ? supplierForm?.current?.getFieldValue()
    : "";
  const orderList = orderForm.current ? orderForm.current.getValues() : [];
  const { suppliers } = usePreloadData();

  const suppliersData = suppliers?.find((a) => a.id === supplierId);

  const contentRef = useRef(null);
  const cardRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 预加载所有图片
  useEffect(() => {
    const preloadImages = async () => {
      if (!contentRef.current) return;

      const images = Array.from(contentRef.current.querySelectorAll("img"));

      // 确保所有图片都设置了crossOrigin
      images.forEach((img) => {
        img.crossOrigin = "anonymous";
      });

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
        img.crossOrigin = "anonymous";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Export as image
      const imageData = await exportAsImage();

      // Export as PDF
      const pdfData = await exportAsPDF();

      // Here you would typically send the form data along with the exported files
      console.log("Image data available:", !!imageData);
      console.log("PDF data available:", !!pdfData);

      // Mock API call to submit data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("订单已提交成功，并已导出内容！");
    } catch (error) {
      console.error("Error during submission:", error);
      alert("提交订单时出错");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadAsImage = async () => {
    setIsExporting(true);
    try {
      const imageData = await exportAsImage();
      if (imageData) {
        const link = document.createElement("a");
        link.href = imageData;
        link.download = "order-content.png";
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const downloadAsPDF = async () => {
    setIsExporting(true);
    try {
      const pdfData = await exportAsPDF();
      if (pdfData) {
        const link = document.createElement("a");
        link.href = pdfData;
        link.download = "order-content.pdf";
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6 flex gap-2">
        <Button onClick={downloadAsImage} variant="outline" type="button">
          Preview as Image
        </Button>
        <Button onClick={downloadAsPDF} variant="outline" type="button">
          Preview as PDF
        </Button>
      </div>

      {/* This div will be captured for export */}
      <div ref={cardRef} className="bg-white p-6 rounded-lg shadow-sm">
        <div ref={contentRef}>
          <div>
            <h3>供应商：</h3>
            <div className="supplier-content">
              <span>姓名：{suppliersData?.name}</span>
              <span>电话：{suppliersData?.phone}</span>
              <span>邮箱：{suppliersData?.email}</span>
            </div>
          </div>
          <div>
            <h3>选中货品</h3>

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
                      // src={item.images[0].url}
                      src="https://sjc.microlink.io/aqwGUNvYhwYFuchX_7s7E8lKE0-diEdDUnm2w7ni5wKYfMRpH7PBOFBewSsYEUCHShMedbEZWtZu-mNnrbT4lQ.jpeg"
                      crossOrigin="anonymous"
                    />
                    {/* <Image.PreviewGroup>
                      {item.images.map((item) => (
                        <Image
                          key={item.picturebedId}
                          style={{
                            objectFit: "cover",
                            height: "150px",
                          }}
                          src={item.url}
                        />
                      ))}
                    </Image.PreviewGroup> */}
                    <span
                      className="product-card-title"
                      style={{ margin: "6px 0" }}
                    >{`${item.nameCN}(${item.sku})`}</span>
                    <span
                      className="product-card-desc"
                      style={{ marginBottom: 12 }}
                    >
                      订购数量:
                      <span className="product-card-count">{item.count}</span>
                    </span>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

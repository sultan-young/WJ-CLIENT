"use client";
import { useState, useRef } from "react";
import { Button, message, Space } from "antd";
import ShippingTable from "./ShippingTable";
import { Upload } from "lucide-react";
import { processJsonData } from "../utils/upload";
import { exportToExcel } from "../utils/export";
import JsonInputDrawer from "./JsonInputDrawer";
import { makeYwOrder } from "../../../services/makeOrder";

export function DataProcessor() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const tableRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      const processedData = processJsonData(jsonData);
      console.log(processedData);
      setData(processedData);
    } catch (error) {
      console.error("Error processing file:", error);
      message.error("处理文件时出错，请检查文件格式是否正确");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJsonSubmit = (makeOrderDataList = [], onSuccess) => {
    setIsLoading(true);
    try {
      const processedData = makeOrderDataList
        .map((item) => processJsonData(JSON.parse(item.orderData), item.shop))
        .flat();
      setData(processedData);
      onSuccess();
    } catch (error) {
      console.error("Error processing JSON:", error);
      message.error("处理JSON数据时出错，请检查格式是否正确");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    const data = tableRef.current.exportData || [];
    const result = await makeYwOrder({ orderList: data });
    if (data.length === 0) {
      message.error("没有数据可导出");
      return;
    }
    // console.log(tableRef.current);
    exportToExcel(result);
    // exportToExcel(data);
  };

  return (
    <div>
      <div style={{ paddingTop: "1.5rem" }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <Space>
              <Button
                variant="outline"
                style={{ width: "100%", maxWidth: "auto" }} // w-full sm:w-auto
              >
                <label
                  style={{
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem", // gap-2
                  }}
                >
                  <Upload style={{ height: "1rem", width: "1rem" }} />{" "}
                  <span>上传JSON数据</span>
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                </label>
              </Button>
              {/* <Button
                onClick={() => {
                  setOpen(true);
                }}
                disabled={isLoading}
                style={{ width: "100%", maxWidth: "auto" }} // w-full sm:w-auto
              >
                输入json数据
              </Button> */}
              <JsonInputDrawer onSubmit={handleJsonSubmit} />
              <Button
                onClick={handleExport}
                disabled={data.length === 0 || isLoading}
                style={{ width: "100%", maxWidth: "auto" }} // w-full sm:w-auto
              >
                导出燕文Excel
              </Button>
            </Space>
            {isLoading && (
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                处理中，请稍候...
              </p>
            )}
          </div>
          {data.length > 0 ? (
            <ShippingTable dataSource={data} ref={tableRef} />
          ) : (
            <div
              style={{
                textAlign: "center",
                paddingTop: "3rem",
                paddingBottom: "3rem",
                color: "#6b7280",
              }}
            >
              {isLoading ? "正在处理数据..." : "上传JSON文件以查看数据"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

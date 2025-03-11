"use client";
import { useState } from "react";
import { Button } from "antd";
import ShippingTable from "./ShippingTable";
import { Upload } from "lucide-react";
import { processJsonData } from "../utils/upload";
import { exportToExcel } from "../utils/export";

export function DataProcessor() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      const processedData = processJsonData(jsonData);
      setData(processedData);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("处理文件时出错，请检查文件格式是否正确");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      alert("没有数据可导出");
      return;
    }
    exportToExcel(data);
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
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
              <Button
                onClick={handleExport}
                disabled={data.length === 0 || isLoading}
                style={{ width: "100%", maxWidth: "auto" }} // w-full sm:w-auto
              >
                导出Excel
              </Button>
            </div>
            {isLoading && (
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                处理中，请稍候...
              </p>
            )}
          </div>
          {data.length > 0 ? (
            <ShippingTable dataSource={data} />
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

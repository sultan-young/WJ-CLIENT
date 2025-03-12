import React, { useState } from "react";
import { Button, Drawer, Input } from "antd";

const JsonInputDrawer = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [jsonText, setJsonText] = useState("");

  const onClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!jsonText.trim()) {
      setError("请输入JSON数据");
      return;
    }

    try {
      // Validate JSON format
      JSON.parse(jsonText);
      setError(null);
      setJsonText("");
      onSubmit(jsonText, () => {
        setOpen(false);
      });
    } catch (err) {
      setError("JSON格式不正确，请检查后重试");
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
        // disabled={isLoading}
        style={{ width: "100%", maxWidth: "auto" }} // w-full sm:w-auto
      >
        输入json数据
      </Button>
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3>输入json数据</h3>
              <span style={{ color: "#A1A1A7", fontSize: "14px" }}>
                请在下方文本框中粘贴或者输入JSON数据，然后点击提交处理
              </span>
            </div>
            <Button onClick={handleSubmit}>提交</Button>
          </div>
        }
        width={580}
        closable={false}
        onClose={onClose}
        open={open}
        destroyOnClose
      >
        <div className="p-4">
          <Input.TextArea
            placeholder="在此粘贴JSON数据..."
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            autoSize={false}
            style={{
              minHeight: "300px",
              height: "76vh",
              fontFamily: "monospace",
              fontSize: "0.875rem",
            }}
          />
          {error && (
            <p
              style={{
                fontSize: "0.875rem",
                color: "#dc2626",
                marginTop: "0.5rem",
              }}
            >
              {error}
            </p>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default JsonInputDrawer;

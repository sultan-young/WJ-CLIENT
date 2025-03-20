import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Space,
} from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";
import { getShopList } from "../../../services/shopService";

const JsonInputDrawer = ({ onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [shopOptions, setShopOptions] = useState([]);

  const fetchShopData = async () => {
    const shopData = await getShopList();
    setShopOptions(
      shopData.map((shop) => ({
        label: `${shop.shopAbbr} (${shop.shopName})`,
        value: shop.shopAbbr,
      }))
    );
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const onClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    const formData = await form.validateFields();

    try {
      // Validate JSON format

      for (let item of formData.rows) {
        JSON.parse(item.orderData);
      }
      onSubmit(formData.rows, () => {
        setOpen(false);
      });
    } catch (err) {
      message.error("JSON格式不正确，请检查后重试");
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
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          </div>
        }
        width={800}
        closable={false}
        onClose={onClose}
        open={open}
        destroyOnClose
      >
        <Form form={form} initialValues={{ rows: [{}] }}>
          <Form.List name="rows">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key}>
                    <Space align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, "shop"]}
                        label="制单店铺"
                        rules={[{ required: true, message: "请选择国家" }]}
                        style={{ width: 300 }}
                      >
                        <Select placeholder="选择店铺" options={shopOptions} />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(name)}>
                        删除
                      </Button>
                    </Space>
                    <Form.Item
                      {...restField}
                      label="制单数据"
                      name={[name, "orderData"]}
                      rules={[{ required: true, message: "请输入内容" }]}
                      style={{ flex: 1 }}
                    >
                      <Input.TextArea
                        placeholder="输入文本内容"
                        autoSize={{ maxRows: 3, minRows: 2 }}
                      />
                    </Form.Item>
                    <Divider />
                  </div>
                ))}

                <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
                  <Button type="dashed" onClick={() => add()}>
                    新增一行
                  </Button>
                </div>
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>
    </>
  );
};

export default JsonInputDrawer;

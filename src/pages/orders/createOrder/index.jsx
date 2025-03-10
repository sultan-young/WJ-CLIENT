import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePreloadData } from "../../../context/AppContext";
import {
  Button,
  Steps,
  Form,
  Select,
  message,
  Drawer,
  Space,
  Card,
  Row,
  Col,
  Image,
  Badge,
} from "antd";
import "./index.css";
import { mockList } from "./util";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import ExportForm from "./exportOrder";
const { Meta } = Card;

const CreateOrder = forwardRef((props, ref) => {
  const [createOrderDrawer, openCreateOrderDrawer] = useState(false);
  const selectSupplierFormRef = useRef();
  const selectOrderFormRef = useRef(null);
  const exportOrderFormRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    open: async () => {
      openCreateOrderDrawer(true);
    },
  }));

  // 当前步骤 0=> 选中供应商, 1=>选中商品和数量下订单, 2=>选择预发货时间，选择是否需要在完成订单时候强制上传图片和订单号
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = async () => {
    // 选择供应商阶段
    if (currentStep === 0) {
      await selectSupplierFormRef.current.validateFields();
    }
    // 选择商品阶段
    if (currentStep === 1) {
      // 未选中
      if (!selectOrderFormRef.current.verifySelectStatus()) {
        message.error("至少选中一个产品");
        return;
      }
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }

    if (currentStep === 2) {
      setIsSubmitting(true);
      submitOrder();
    }
  };

  const submitOrder = async () => {
    const supplierId = selectSupplierFormRef.current.getFieldValue().supplier;

    const orderList = selectOrderFormRef.current.getValues().map((item) => ({
      sku: item.sku,
      id: item.id,
      count: item.count,
    }));

    const { exportOrderFile } = exportOrderFormRef.current;
    // console.log(exportAsImage, exportAsPDF, 999);
    const submitData = {
      supplierId,
      orderList,
    };
    console.log(submitData, "submitData");

    try {
      // downloadAsPDF
      // Export as image
      await exportOrderFile();

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

  const preStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <Drawer
      title="新建订单"
      open={createOrderDrawer}
      onClose={() => openCreateOrderDrawer(false)}
      footer={null}
      width={1200}
      extra={
        <Space>
          {currentStep === 0 ? (
            <></>
          ) : (
            <Button onClick={preStep}>上一步</Button>
          )}
          <Button type="primary" onClick={nextStep}>
            {currentStep === 2 ? "提交" : "下一步"}
          </Button>
        </Space>
      }
    >
      <Steps
        current={currentStep}
        style={{ marginBottom: "20px" }}
        items={[
          { title: "选择供应商" },
          { title: "选择商品" },
          { title: "核对" },
        ]}
      />

      <div style={{ display: currentStep === 0 ? "block" : "none" }}>
        <SelectSupplier ref={selectSupplierFormRef} />
      </div>

      <div style={{ display: currentStep === 1 ? "block" : "none" }}>
        <SelectOrder ref={selectOrderFormRef} data={mockList} />
      </div>
      <div style={{ display: currentStep === 2 ? "block" : "none" }}>
        <ExportForm
          ref={exportOrderFormRef}
          supplierForm={selectSupplierFormRef}
          orderForm={selectOrderFormRef}
        />
      </div>
    </Drawer>
  );
});

// 选择供应商
const SelectSupplier = React.forwardRef((props, ref) => {
  const { suppliers } = usePreloadData();

  const supplierOptions = useMemo(() => {
    return suppliers.map((item) => ({ label: item.name, value: item.id }));
  }, [suppliers]);

  return (
    <Form ref={ref} layout="vertical" onFinish={() => {}}>
      <Form.Item
        label="选择供应商"
        name="supplier"
        rules={[{ required: true, message: "请选择供应商" }]}
      >
        <Select options={supplierOptions} />
      </Form.Item>
    </Form>
  );
});
// 选择订单
const SelectOrder = React.forwardRef(({ data }, ref) => {
  const [quantities, setQuantities] = useState({});
  useImperativeHandle(ref, () => ({
    verifySelectStatus: () => {
      const sum = Object.values(quantities).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
      return sum > 0;
    },
    getValues: () => {
      const selectedCards = data
        .map((item, index) => ({ ...item, count: quantities[index] }))
        .filter((item) => item.count > 0);
      return selectedCards;
    },
  }));

  const handleQuantityChange = (event, index, delta) => {
    event.stopPropagation();
    setQuantities((prev) => ({
      ...prev,
      [index]: Math.max((prev[index] || 0) + delta, 0),
    }));
  };
  const selectedCards = data.filter((_, index) => quantities[index] > 0);

  return (
    <div className="product-image-card" style={{ padding: "20px" }}>
      <Row gutter={16}>
        {data.map((item, index) => (
          <Col span={4} key={index} style={{ marginBottom: 16 }}>
            <Badge count={quantities[index]}>
              <div className="product-card">
                <Image.PreviewGroup>
                  {item.images.map((item) => (
                    <Image
                      key={item.picturebedId}
                      style={{ objectFit: "cover", height: "150px" }}
                      src={item.url}
                    />
                  ))}
                </Image.PreviewGroup>
                <span className="product-card-title">{`${item.nameCN}(${item.sku})`}</span>
                <span className="product-card-desc">{`仓库剩余库存 ${item.stock}`}</span>
                <div style={{ textAlign: "center", marginTop: 4 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: "10px",
                    }}
                  >
                    <Space size="large">
                      <Space.Compact>
                        <Button
                          disabled={!quantities[index]}
                          onClick={(e) => handleQuantityChange(e, index, -1)}
                          icon={<MinusOutlined />}
                        />
                        <Button variant="text">{quantities[index] || 0}</Button>
                        <Button
                          onClick={(e) => handleQuantityChange(e, index, 1)}
                          icon={<PlusOutlined />}
                        />
                      </Space.Compact>
                    </Space>
                  </div>
                </div>
              </div>
            </Badge>
          </Col>
        ))}
      </Row>
    </div>
  );
});

export default CreateOrder;

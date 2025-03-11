import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { usePreloadData } from "../../../context/AppContext";
import { Button, Steps, message, Drawer, Space } from "antd";
import "./index.css";
import ExportForm from "./exportOrder";
import Step1WithSupplier from "./Step1WithSupplier";
import Step2WithOrder from "./Step2WithOrder";
import { createSupplierOrder } from "../../../services/supplierOrder";

const CreateOrder = forwardRef((props, ref) => {
  const [createOrderDrawer, openCreateOrderDrawer] = useState(false);
  const selectSupplierFormRef = useRef();
  const [supplierId, setSupplierId] = useState("");
  const [shippingDate, setShippingDate] = useState("");
  const selectOrderFormRef = useRef(null);
  const exportOrderFormRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { suppliers } = usePreloadData();
  // 当前步骤 0=> 选中供应商, 1=>选中商品和数量下订单, 2=>选择预发货时间，选择是否需要在完成订单时候强制上传图片和订单号
  const [currentStep, setCurrentStep] = useState(0);

  const resetState = () => {
    setCurrentStep(0);
    setSupplierId("");
    setShippingDate("");
    setIsSubmitting(false);
    selectSupplierFormRef.current &&
      selectSupplierFormRef.current.resetFields();
    selectOrderFormRef.current?.formData &&
      selectOrderFormRef.current.formData.resetFields();
  };
  useEffect(() => {
    if (!createOrderDrawer) {
      resetState();
    }
  }, [createOrderDrawer]);
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    open: async () => {
      openCreateOrderDrawer(true);
    },
  }));

  const preStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const nextStep = async () => {
    // 选择供应商阶段
    if (currentStep === 0) {
      await selectSupplierFormRef.current.validateFields();
      setSupplierId(selectSupplierFormRef.current.getFieldValue().supplier);
    }
    // 选择商品阶段
    if (currentStep === 1) {
      await selectOrderFormRef.current.formData.validateFields();
      setShippingDate(
        selectOrderFormRef.current.formData.getFieldValue().shippingDate
      );
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
    const orderList = selectOrderFormRef.current.getValues().map((item) => ({
      sku: item.sku,
      id: item.id,
      count: item.count,
    }));

    const submitData = {
      supplierId,
      orderList,
      shippingDate,
    };
    console.log(submitData, orderList, "submitData");
    await createSupplierOrder(submitData)
    message.success('创建成功')
  };

  return (
    <Drawer
      title="新建订单"
      open={createOrderDrawer}
      onClose={() => openCreateOrderDrawer(false)}
      footer={null}
      width={1200}
      destroyOnClose
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
        <Step1WithSupplier ref={selectSupplierFormRef} suppliers={suppliers} />
      </div>

      <div style={{ display: currentStep === 1 ? "block" : "none" }}>
        <Step2WithOrder ref={selectOrderFormRef} supplierId={supplierId} />
      </div>
      <div style={{ display: currentStep === 2 ? "block" : "none" }}>
        <ExportForm
          ref={exportOrderFormRef}
          supplierForm={selectSupplierFormRef}
          orderForm={selectOrderFormRef}
          shippingDate={shippingDate}
          suppliers={suppliers}
        />
      </div>
    </Drawer>
  );
});

export default CreateOrder;

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { usePreloadData } from "../../../context/AppContext";
import { Button, Steps, message, Drawer, Space } from "antd";
import "./index.less";
import ExportForm from "./exportOrder";
import Step1WithSupplier from "./Step1WithSupplier";
import Step2WithOrder from "./Step2WithOrder";
import {
  createSupplierOrder,
  updateSupplierOrder,
} from "../../../services/supplierOrder";

const PAGE_MODE = {
  CREATE: 1,
  EDIT: 2,
  PREVIEW: 3,
};

const CreateOrder = forwardRef(({ afterFinishAction }, ref) => {
  const [createOrderDrawerVisible, setCreateOrderDrawerVisible] =
    useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [shippingDate, setShippingDate] = useState("");
  const selectSupplierFormRef = useRef(null);
  const selectOrderFormRef = useRef(null);
  const exportOrderFormRef = useRef(null);
  const { suppliers } = usePreloadData();
  // 当前步骤 0=> 选中供应商, 1=>选中商品和数量下订单, 2=>选择预发货时间，选择是否需要在完成订单时候强制上传图片和订单号
  const [currentStep, setCurrentStep] = useState(0);

  // 页面模式
  const [pageMode, setPageMode] = useState(PAGE_MODE.EDIT);
  const [pageInitialData, setPageInitialData] = useState(null);

  useEffect(() => {
    if (pageMode === PAGE_MODE.EDIT) {
      selectSupplierFormRef.current?.setFieldValue(
        "supplier",
        pageInitialData?.supplierId
      );
    }

    if (pageMode === PAGE_MODE.PREVIEW) {
      selectSupplierFormRef.current?.setFieldValue(
        "supplier",
        pageInitialData?.supplierId
      );
    }
  }, [pageMode, createOrderDrawerVisible, pageInitialData?.supplierId]);

  const resetState = () => {
    setCurrentStep(0);
    setSupplierId("");
    setShippingDate("");
    setPageInitialData(null);
    setPageMode(PAGE_MODE.CREATE);
    selectSupplierFormRef.current &&
      selectSupplierFormRef.current.resetFields();
    selectOrderFormRef.current?.formData &&
      selectOrderFormRef.current.formData.resetFields();
  };
  useEffect(() => {
    if (!createOrderDrawerVisible) {
      resetState();
    }
  }, [createOrderDrawerVisible]);
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    // 1 新增模式 2为编辑模式
    open: async (mode = 1, data) => {
      setCreateOrderDrawerVisible(true);
      setPageInitialData(data);
      setPageMode(mode);
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
      // await selectOrderFormRef.current.formData.validateFields();
      // setShippingDate(
      //   selectOrderFormRef.current.formData.getFieldValue().shippingDate
      // );

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
      await submitOrder();
      afterFinishAction();
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
    if (pageMode === PAGE_MODE.CREATE) {
      await createSupplierOrder(submitData);
      message.success("创建成功");
    }
    if (pageMode === PAGE_MODE.EDIT) {
      await updateSupplierOrder({
        ...submitData,
        id: pageInitialData.id,
      });
      message.success("编辑成功");
    }
    setCreateOrderDrawerVisible(false);
  };

  return (
    <Drawer
      title="新建订单"
      open={createOrderDrawerVisible}
      onClose={() => setCreateOrderDrawerVisible(false)}
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
        <Step2WithOrder
          ref={selectOrderFormRef}
          defaultSelectOrder={pageInitialData?.orderList}
          supplierId={supplierId}
        />
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

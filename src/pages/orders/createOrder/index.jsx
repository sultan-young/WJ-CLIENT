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
  DatePicker,
  Radio,
  Card,
  Row,
  Col,
  Image,
  Badge,
} from "antd";
import "./index.css";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
const { Meta } = Card;

const CreateOrder = forwardRef((props, ref) => {
  const [createOrderDrawer, openCreateOrderDrawer] = useState(false);
  const selectSupplierFormRef = useRef();
  const selectOrderFormRef = useRef(null);
  const setupOrderFormRef = useRef(null);

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
    // 设置订单阶段
    if (currentStep === 2) {
      const result = await setupOrderFormRef.current.validateFields();
      console.log(result, 1111);
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }

    if (currentStep === 2) {
      submitOrder();
    }
  };

  const submitOrder = () => {
    const supplierId = selectSupplierFormRef.current.getFieldValue().supplier;
    const {
      needShipPictures,
      needShipTrackNumber,
      estimatedShipDate: shipDate,
    } = setupOrderFormRef.current.getFieldValue();
    const orderList = selectOrderFormRef.current.getValues().map((item) => ({
      sku: item.sku,
      id: item.id,
      count: item.count,
    }));

    const submitData = {
      supplierId,
      needShipPictures,
      needShipTrackNumber,
      shipDate,
      orderList,
    };
    console.log(submitData, 'submitData')
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
          { title: "设置" },
        ]}
      />

      <div style={{ display: currentStep === 0 ? "block" : "none" }}>
        <SelectSupplier ref={selectSupplierFormRef} />
      </div>

      <div style={{ display: currentStep === 1 ? "block" : "none" }}>
        <SelectOrder ref={selectOrderFormRef} data={list111} />
      </div>
      <div style={{ display: currentStep === 2 ? "block" : "none" }}>
        <SetupOrder ref={setupOrderFormRef} />
      </div>
    </Drawer>
  );
});

// 选择供应商
const SelectSupplier = React.forwardRef((props, ref) => {
  const { suppliers } = usePreloadData();
  const [selectedSupplier, setSelectedSupplier] = useState();

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
        <Select options={supplierOptions} onChange={setSelectedSupplier} />
      </Form.Item>
    </Form>
  );
});
// 选择订单
const SelectOrder = React.forwardRef(({ data }, ref) => {
  const [quantities, setQuantities] = useState({});
  const [previewVisible, setPreviewVisible] = useState(false);

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
      {/* <Button
        type="primary"
        style={{ marginBottom: 20 }}
        onClick={() => setPreviewVisible(true)}
        disabled={selectedCards.length === 0}
      >
        预览选中卡片（{selectedCards.length}）
      </Button> */}

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

      <Drawer
        title={`已选中卡片（${selectedCards.length}）`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
        height={200}
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {selectedCards.map((item, index) => (
            <div key={index} style={{ marginBottom: 24 }}>
              <Image
                src={item.url}
                alt={item.name}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>{item.name}</h3>
                <span>数量: {quantities[data.indexOf(item)]}</span>
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
});
const SetupOrder = React.forwardRef((props, ref) => {
  const option = [
    {
      label: "是",
      value: 1,
    },
    {
      label: "否",
      value: 0,
    },
  ];

  return (
    <Form
      ref={ref}
      labelCol={{
        span: 4,
      }}
      wrapperCol={{
        span: 20,
      }}
      layout="horizontal"
      initialValues={{
        needShipPictures: 1, // 设置初始值
        needShipTrackNumber: 0, // 设置初始值
      }}
    >
      <Form.Item label="要求上传发货图片" name="needShipPictures">
        <Radio.Group
          options={option}
          optionType="button"
          size="small"
          buttonStyle="outline"
        />
      </Form.Item>
      <Form.Item label="要求上传发货单号" name="needShipTrackNumber">
        <Radio.Group
          options={option}
          size="small"
          optionType="button"
          buttonStyle="outline"
        />
      </Form.Item>
      <Form.Item
        label="预计发货时间"
        name="estimatedShipDate"
        rules={[{ required: true, message: "请选择发货时间" }]}
      >
        <DatePicker placeholder="请选择预计发货时间" />
      </Form.Item>
    </Form>
  );
});

export default CreateOrder;

let list111 = [
  /**
   * Paste one or more documents here
   */
  {
    sku: "B_0000",
    shelf: "B",
    index: "0000",
    suppliers: [
      {
        $oid: "67cbfa833c83898c06163d75",
      },
    ],
    stock: 0,
    nameCN: "爱心眼球",
    images: [
      {
        name: "example.jpg",
        picturebedId: "67cc4f7e066befcec6e161f0",
        size: 287631,
        uid: "rc-upload-1741442921019-2",
        url: "https://pic1.imgdb.cn/item/67cc4f7e066befcec6e161f0.jpg",
        _id: {
          $oid: "67cc4f80e186963e50d7b073",
        },
      },
    ],
    price: 0,
    shippingFee: 0,
    tags: [],
    status: 0,
    createdAt: {
      $date: "2025-03-08T14:09:04.466Z",
    },
    __v: 0,
  },
  /**
   * Paste one or more documents here
   */
  {
    sku: "B_0000",
    shelf: "B",
    index: "0000",
    suppliers: [
      {
        $oid: "67cbfa833c83898c06163d75",
      },
    ],
    stock: 0,
    nameCN: "爱心眼球",
    images: [
      {
        name: "example.jpg",
        picturebedId: "67cc4f7e066befcec6e161f0",
        size: 287631,
        uid: "rc-upload-1741442921019-2",
        url: "https://pic1.imgdb.cn/item/67cc4f7e066befcec6e161f0.jpg",
        _id: {
          $oid: "67cc4f80e186963e50d7b073",
        },
      },
    ],
    price: 0,
    shippingFee: 0,
    tags: [],
    status: 0,
    createdAt: {
      $date: "2025-03-08T14:09:04.466Z",
    },
    __v: 0,
  },
  /**
   * Paste one or more documents here
   */
  {
    sku: "B_0002",
    shelf: "B",
    index: "0002",
    suppliers: [
      {
        $oid: "67cc4f5ae186963e50d7b064",
      },
    ],
    stock: 3,
    nameCN: "黑底蓝瞳",
    images: [
      {
        name: "Handcrafted Resin Eyeball Jewelry, Sweet Eyeball Pendant, Gothic Charm.jpg",
        picturebedId: "67cc4b6a066befcec6e15f26",
        size: 81675,
        uid: "rc-upload-1741442997128-2",
        url: "https://pic1.imgdb.cn/item/67cc4b6a066befcec6e15f26.jpg",
        _id: {
          $oid: "67cc4fd9e186963e50d7b095",
        },
      },
    ],
    price: 0,
    shippingFee: 0,
    tags: [],
    status: 0,
    createdAt: {
      $date: "2025-03-08T14:10:33.103Z",
    },
    __v: 0,
  },
  {
    sku: "B_0000",
    shelf: "B",
    index: "0000",
    suppliers: [
      {
        $oid: "67cbfa833c83898c06163d75",
      },
    ],
    stock: 0,
    nameCN: "爱心眼球",
    images: [
      {
        name: "example.jpg",
        picturebedId: "67cc4f7e066befcec6e161f0",
        size: 287631,
        uid: "rc-upload-1741442921019-2",
        url: "https://pic1.imgdb.cn/item/67cc4f7e066befcec6e161f0.jpg",
        _id: {
          $oid: "67cc4f80e186963e50d7b073",
        },
      },
    ],
    price: 0,
    shippingFee: 0,
    tags: [],
    status: 0,
    createdAt: {
      $date: "2025-03-08T14:09:04.466Z",
    },
    __v: 0,
  },
  /**
   * Paste one or more documents here
   */
  {
    sku: "B_0000",
    shelf: "B",
    index: "0000",
    suppliers: [
      {
        $oid: "67cbfa833c83898c06163d75",
      },
    ],
    stock: 0,
    nameCN: "爱心眼球",
    images: [
      {
        name: "example.jpg",
        picturebedId: "67cc4f7e066befcec6e161f0",
        size: 287631,
        uid: "rc-upload-1741442921019-2",
        url: "https://pic1.imgdb.cn/item/67cc4f7e066befcec6e161f0.jpg",
        _id: {
          $oid: "67cc4f80e186963e50d7b073",
        },
      },
    ],
    price: 0,
    shippingFee: 0,
    tags: [],
    status: 0,
    createdAt: {
      $date: "2025-03-08T14:09:04.466Z",
    },
    __v: 0,
  },
  /**
   * Paste one or more documents here
   */
  {
    sku: "B_0002",
    shelf: "B",
    index: "0002",
    suppliers: [
      {
        $oid: "67cc4f5ae186963e50d7b064",
      },
    ],
    stock: 3,
    nameCN: "黑底蓝瞳",
    images: [
      {
        name: "Handcrafted Resin Eyeball Jewelry, Sweet Eyeball Pendant, Gothic Charm.jpg",
        picturebedId: "67cc4b6a066befcec6e15f26",
        size: 81675,
        uid: "rc-upload-1741442997128-2",
        url: "https://pic1.imgdb.cn/item/67cc4b6a066befcec6e15f26.jpg",
        _id: {
          $oid: "67cc4fd9e186963e50d7b095",
        },
      },
    ],
    price: 0,
    shippingFee: 0,
    tags: [],
    status: 0,
    createdAt: {
      $date: "2025-03-08T14:10:33.103Z",
    },
    __v: 0,
  },
];

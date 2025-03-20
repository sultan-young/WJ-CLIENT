import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  Button,
  message,
  Space,
  Input,
  DatePicker,
  Popconfirm,
  List,
  Menu,
  Card,
  Tag,
  Badge,
  Drawer,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";
import ProductCardForSelectOrder from "../../../components/Card/ProductCardForSelectOrder";
import CreateOrder from "../createOrder";
import {
  deleteSupplierOrder,
  fitchSupplierOrder,
  updateSupplierOrderStatus,
} from "../../../services/supplierOrder";
import styles from "./index.module.less";
import ImageGallery from "../../../components/ImageGalleryContainer";
import Meta from "antd/es/card/Meta";
import { searchProduct } from "../../../services/productService";
import {
  filterAndTransferProductData,
  productDataAddCountDfs,
} from "../common/processProductData";
import PreviewOrder from "../PreviewOrder";
import SearchBox from "../../../components/searchBox";

const menuItems = [
  {
    label: "已发货",
    key: 2,
  },
  {
    label: "制作中",
    key: 1,
  },
  {
    label: "已完成",
    key: 3,
  },
  {
    label: "全部订单",
    key: "all",
  },
];

const getUrlsByOrderList = (orderList) => {
  let imageUrls = orderList
    .map((order) => (order?.images[0] || {}).url)
    .filter((url) => !!url);
  return imageUrls;
};

const OrderManagement = () => {
  const createOrderRef = useRef();
  const [searchValue, setSearchValue] = useState("");
  const [orders, setOrders] = useState([]);
  const [previewOrderData, setPreviewOrderData] = useState({});
  const [selectedMenuKey, setSelectedMenuKey] = useState("2");
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    fetchPageData();
  }, [selectedMenuKey, searchValue]);

  const fetchPageData = async () => {
    setPageLoading(true);
    try {
      const result = await fitchSupplierOrder({
        queryParams: {
          orderStatus: +selectedMenuKey ? +selectedMenuKey : null,
          content: searchValue,
        },
      });
      setOrders(result);
    } catch (error) {
    } finally {
      setPageLoading(false);
    }
  };

  // 辅助函数：计算自然日差异（正数）
  const getDayDifference = (date1, date2) =>
    Math.abs(dayjs(date1).startOf("day").diff(date2, "day"));

  // 辅助函数：校验有效日期
  const isValidDate = (date) => dayjs(date).isValid();

  const getOrderStatusString = (status, shippingDate) => {
    const todayTime = dayjs().startOf("day");
    const shippingTime = dayjs(shippingDate).startOf("day");

    // 按状态处理
    switch (status) {
      case 1: // 制作中
        if (shippingTime.isAfter(todayTime)) {
          return `距离发货还有 ${getDayDifference(shippingTime, todayTime)} 天`;
        }
        if (shippingTime.isBefore(todayTime)) {
          return (
            <span>
              <span className={styles["postpone"]}>
                已延期{getDayDifference(todayTime, shippingTime)} 天
              </span>
              ，请催促发货
            </span>
          );
        }
        return "预计今日发货";

      case 2: // 已发货
        if (todayTime.isBefore(shippingTime)) return "发货时间异常";
        return `已发货 ${getDayDifference(todayTime, shippingTime)} 天`;

      default:
        return "未知状态";
    }
  };

  const columns = [
    {
      title: "发货时间",
      dataIndex: "shippingDate",
      render: (date) => dayjs(date).format("YYYY-MM-DD"),
      sorter: (a, b) =>
        dayjs(a.expectedDelivery).unix() - dayjs(b.expectedDelivery).unix(),
    },
    {
      title: "产品图片",
      dataIndex: "orderList",
      width: 200,
      render: (orderList, record) => {
        let imageUrls = orderList
          .map((order) => (order?.images[0] || {}).url)
          .filter((url) => !!url);
        console.log(orderList, imageUrls, 111);
        return <ImageGallery images={imageUrls} />;
      },
    },
    // {
    //   title: "状态",
    //   dataIndex: "status",
    //   render: (status, record) => {
    //     const orderMap = {
    //       1: "制作中",
    //       2: "已发货",
    //       3: "已完成",
    //       4: "已删除",
    //     };

    //     return (
    //       <span
    //         style={{
    //           color:
    //             status === "pending" && dayjs().isAfter(record.expectedDelivery)
    //               ? "red"
    //               : "inherit",
    //         }}
    //       >
    //         {orderMap[status]}
    //       </span>
    //     );
    //   },
    // },
    {
      title: "操作",
      dataIndex: "action",
      width: 150,
      render: (_, record) => (
        <Spin size="small" wrap={true}>
          <Button
            onClick={() => previewOrder(record)}
            className="order-btn"
            type="link"
            size="small"
          >
            查看
          </Button>
          <Button
            onClick={() => updateOrder(record)}
            className="order-btn"
            type="link"
            size="small"
          >
            编辑
          </Button>
          <Button
            onClick={() => exportOrder(record)}
            className="order-btn"
            type="link"
            size="small"
          >
            导出
          </Button>
          <Popconfirm
            title="确认删除订单吗？删除后将无法恢复"
            onConfirm={() => deleteOrder(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button className="order-btn" type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Spin>
      ),
    },
  ];

  const previewOrder = async (orderData) => {
    const result = await searchProduct({
      queryParams: {
        type: 9,
        content: orderData.supplierId,
      },
    });
    const countMap = orderData.orderList.reduce((prev, current) => {
      prev[current.id] = current.count;
      return prev;
    }, {});
    const reviewProductList = productDataAddCountDfs(
      filterAndTransferProductData(result),
      countMap
    );
    setPreviewOrderData({
      visible: true,
      shippingDate: orderData.shippingDate,
      supplierId: orderData.supplierId,
      orderList: reviewProductList,
      id: orderData.id,
    });
  };

  const updateOrder = async (record) => {
    handleCreateOrder(2, record);
  };

  const exportOrder = async () => {};

  const deleteOrder = async ({ id }) => {
    await deleteSupplierOrder({ id });
    message.success("删除成功");
    fetchPageData();
  };

  const completeOrder = async ({ id, status }) => {
    await updateSupplierOrderStatus({ id, status: status + 1 });
    message.success("操作成功");
    fetchPageData();
  };

  const handleCreateOrder = (mode = 1, data) => {
    createOrderRef.current.open(mode, data);
  };

  const onClickMenu = (item) => {
    {
      setSelectedMenuKey(item.key);
    }
  };

  const onSearch = (value) => {
    setSearchValue(value.content)
  }

  return (
    <div className={styles["container"]} style={{ padding: 20 }}>
      <header>
        <div
          style={{
            padding: "12px 0",
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          <SearchBox placeholder="可以通过供应商名称，手机尾号，订单号进行搜索" onSearch={(value) => onSearch(value)}/>

          <Space>
            <Button type="primary" onClick={() => handleCreateOrder(1)}>
              新建订单
            </Button>
          </Space>
        </div>

        <Menu
          onClick={onClickMenu}
          selectedKeys={selectedMenuKey}
          mode="horizontal"
          items={menuItems}
        />
      </header>
      <CreateOrder ref={createOrderRef} afterFinishAction={fetchPageData} />
      <div className={styles["list-container"]}>
        <List
          loading={pageLoading}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 6,
          }}
          dataSource={orders}
          renderItem={(order) => (
            <List.Item key={order.id}>
              <Badge.Ribbon text={order.supplier.name}>
                <Card
                  cover={
                    <ImageGallery
                      images={getUrlsByOrderList(order.orderList)}
                    />
                  }
                  actions={[
                    <Space size="small" wrap={true}>
                      <Button
                        onClick={() => previewOrder(order)}
                        className="order-btn"
                        type="link"
                        size="small"
                      >
                        查看
                      </Button>
                      <Button
                        onClick={() => updateOrder(order)}
                        className="order-btn"
                        type="link"
                        size="small"
                      >
                        编辑
                      </Button>
                      <Popconfirm
                        title={`请在核对无误之后进行${
                          order.status == 1 ? "发货" : "收货"
                        }确认，该操作不可逆`}
                        onConfirm={() => completeOrder(order)}
                        okText="确认"
                        cancelText="取消"
                      >
                        <Button
                          className="order-btn"
                          type="link"
                          size="small"
                          danger
                        >
                          {order.status === 2 ? "确认收货" : "确认发货"}
                        </Button>
                      </Popconfirm>
                      <Popconfirm
                        title="确认删除订单吗？删除后将无法恢复"
                        onConfirm={() => deleteOrder(order)}
                        okText="确认"
                        cancelText="取消"
                      >
                        <Button
                          className="order-btn"
                          type="link"
                          size="small"
                          danger
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>,
                  ]}
                >
                  <Meta
                    title={getOrderStatusString(
                      order.status,
                      order.shippingDate
                    )}
                  />
                  <div className={styles["shop-date-wrapper"]}>
                    预计发货时间:
                    <span className={styles["shop-date"]}>
                      {dayjs(order.shippingDate).format("YYYY-MM-DD")}
                    </span>
                  </div>
                  <span>订单号: {order.id}</span>
                  <ul>
                    {order.orderList.map((item) => {
                      return (
                        <Tag key={item.id} style={{ marginTop: "4px" }}>
                          {item.sku} * {item.count}
                        </Tag>
                      );
                    })}
                  </ul>
                </Card>
              </Badge.Ribbon>
            </List.Item>
          )}
        />
      </div>
      <Drawer
        onClose={() => setPreviewOrderData({ visible: false })}
        title={`预览订单-${previewOrderData.id}`}
        width={1200}
        destroyOnClose
        open={previewOrderData.visible}
      >
        <PreviewOrder
          shippingDate={previewOrderData.shippingDate}
          supplierId={previewOrderData.supplierId}
          orderList={previewOrderData.orderList}
        />
      </Drawer>
    </div>
  );
};

// 供应商视图组件
// const SupplierView = () => {
//   const [completeModalVisible, setCompleteModalVisible] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<Order>();
//   const [fileList, setFileList] = useState<UploadFile[]>([]);

//   const handleComplete = (order) => {
//     setSelectedOrder(order);
//     setCompleteModalVisible(true);
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <Table
//         columns={[
//           ...columns,
//           {
//             title: '操作',
//             render: (_, record) => record.status === 'pending' && (
//               <Button onClick={() => handleComplete(record)}>完成订单</Button>
//             ),
//           },
//         ]}
//         dataSource={orders}
//         rowKey="id"
//       />

//       <Modal
//         title="完成订单"
//         open={completeModalVisible}
//         onCancel={() => setCompleteModalVisible(false)}
//         onOk={() => {
//           // 这里处理上传逻辑
//           setCompleteModalVisible(false);
//         }}
//       >
//         <Form layout="vertical">
//           <Form.Item
//             label="快递单号"
//             name="trackingNumber"
//           >
//             <Input />
//           </Form.Item>
//           <Form.Item
//             label="发货凭证"
//             name="deliveryProof"
//             rules={[{ required: true, message: '请上传发货凭证' }]}
//           >
//             <Upload
//               fileList={fileList}
//               onChange={({ fileList }) => setFileList(fileList)}
//               beforeUpload={() => false}
//             >
//               <Button>上传图片</Button>
//             </Upload>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

export default OrderManagement;

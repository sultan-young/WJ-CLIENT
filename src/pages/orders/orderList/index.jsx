import React, { useMemo, useRef, useState } from "react";
import { Table, Button, message, Space, Input, DatePicker } from "antd";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";
import "./index.css";
import ProductCardForSelectOrder from "../../../components/Card/ProductCardForSelectOrder";
import CreateOrder from "../createOrder";
import { usePreloadData } from "../../../context/AppContext";
import { tableList } from "./util";

const OrderManagement = () => {
  const createOrderRef = useRef();
  const { suppliers } = usePreloadData();

  // const [data, setData] = useState<Or>(initialData);
  const [searchOrderNumber, setSearchOrderNumber] = useState("");
  const [searchCreationTime, setSearchCreationTime] = useState(null);

  const supplierOptions = useMemo(() => {
    return suppliers.map((item) => ({ label: item.name, value: item.id }));
  }, [suppliers]);

  const [orders, setOrders] = useState(tableList);

  const columns = [
    {
      title: "订单号",
      dataIndex: "orderNo",
      render: (text) => text || "--",
    },
    {
      title: "供应商",
      dataIndex: "supplier",
      render: (item) => supplierOptions.find((o) => o.value === item)?.label,
    },
    {
      title: "商品",
      dataIndex: "products",
      render: (products) => (
        <div>
          {products.map((a) => (
            <div key={a.id}>
              {a.name}-{a.sku} (x{a.quantity})
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "发货时间",
      dataIndex: "expectedDelivery",
      render: (date) => dayjs(date).format("YYYY-MM-DD"),
      sorter: (a, b) =>
        dayjs(a.expectedDelivery).unix() - dayjs(b.expectedDelivery).unix(),
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (status, record) => (
        <span
          style={{
            color:
              status === "pending" && dayjs().isAfter(record.expectedDelivery)
                ? "red"
                : "inherit",
          }}
        >
          {status === "pending" ? "待发货" : "已完成"}
        </span>
      ),
    },
    {
      title: "操作",
      dataIndex: "action",
      render: (status, record) => (
        <Space size="middle">
          <a>查看</a>
          <a>编辑</a>
          <a>导出</a>
          <a>删除</a>
        </Space>
      ),
    },
  ];

  const handleCreateOrder = () => {
    createOrderRef.current.open();
  };

  const handleSearch = () => {
    console.log(searchOrderNumber, searchCreationTime);
  };

  const resetSearch = () => {
    setSearchOrderNumber("");
    setSearchCreationTime(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          marginBottom: "16px",
          padding: "24px 0",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <Space wrap>
          <div>
            <span style={{ marginRight: "8px" }}>订单号:</span>
            <Input
              placeholder="请输入订单号"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              style={{ width: "200px" }}
              prefix={<SearchOutlined />}
            />
          </div>

          <div>
            <span style={{ marginRight: "8px" }}>创建时间:</span>
            <DatePicker
              // locale={locale}
              value={searchCreationTime}
              onChange={(date) => setSearchCreationTime(date)}
              style={{ width: "200px" }}
            />
          </div>

          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>

          <Button onClick={resetSearch}>重置</Button>
        </Space>
      </div>
      <Button
        type="primary"
        onClick={handleCreateOrder}
        style={{ marginBottom: 16 }}
      >
        新建订单
      </Button>

      <CreateOrder ref={createOrderRef} />

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        rowClassName={(record) =>
          record.status === "pending" &&
          dayjs().isAfter(record.expectedDelivery)
            ? "overdue-order"
            : ""
        }
      />
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

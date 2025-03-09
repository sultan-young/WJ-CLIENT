import React, { useMemo, useRef, useState } from "react";
import {
  Table,
  Button,
  message,
} from "antd";
import dayjs from "dayjs";
import "./index.css";
import ProductCardForSelectOrder from "../../../components/Card/ProductCardForSelectOrder";
import CreateOrder from "../createOrder";

// Mock数据
const mockProducts = [
  {
    id: "1",
    name: "商品1",
    sku: "SKU001",
    image: "https://via.placeholder.com/50",
  },
  {
    id: "2",
    name: "商品2",
    sku: "SKU002",
    image: "https://via.placeholder.com/50",
  },
];

const mockOrders = [
  {
    id: "1",
    supplier: "A",
    products: [{ product: mockProducts[0], quantity: 2 }],
    expectedDelivery: "2023-08-01",
    status: "pending",
  },
];

const OrderManagement = () => {
      const createOrderRef = useRef();
  
  // const [orders, setOrders] = useState(mockOrders);

  // const columns = [
  //   {
  //     title: "供应商",
  //     dataIndex: "supplier",
  //     render: (value) => supplierOptions.find((o) => o.value === value)?.label,
  //   },
  //   {
  //     title: "商品",
  //     dataIndex: "products",
  //     render: (products) => (
  //       <div>
  //         {products.map((p) => (
  //           <div
  //             key={p.product.id}
  //             style={{ display: "flex", alignItems: "center", margin: "8px 0" }}
  //           >
  //             <img
  //               src={p.product.image}
  //               alt={p.product.name}
  //               style={{ width: 50, marginRight: 8 }}
  //             />
  //             <span>
  //               {p.product.name} (x{p.quantity})
  //             </span>
  //           </div>
  //         ))}
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "发货时间",
  //     dataIndex: "expectedDelivery",
  //     render: (date) => dayjs(date).format("YYYY-MM-DD"),
  //     sorter: (a, b) =>
  //       dayjs(a.expectedDelivery).unix() - dayjs(b.expectedDelivery).unix(),
  //   },
  //   {
  //     title: "状态",
  //     dataIndex: "status",
  //     render: (status, record) => (
  //       <span
  //         style={{
  //           color:
  //             status === "pending" && dayjs().isAfter(record.expectedDelivery)
  //               ? "red"
  //               : "inherit",
  //         }}
  //       >
  //         {status === "pending" ? "待发货" : "已完成"}
  //       </span>
  //     ),
  //   },
  // ];

  const handleCreateOrder = () => {
    createOrderRef.current.open()
  };


  return (
    <div style={{ padding: 20 }}>
      <Button
        type="primary"
        onClick={handleCreateOrder}
        style={{ marginBottom: 16 }}
      >
        新建订单
      </Button>

      <CreateOrder ref={createOrderRef}/>

      {/* <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        rowClassName={(record) =>
          record.status === "pending" &&
          dayjs().isAfter(record.expectedDelivery)
            ? "overdue-order"
            : ""
        }
      /> */}
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
import { Table } from "antd";

const ShippingTable = ({ dataSource = [] }) => {
  const columns = [
    {
      title: "序号",
      dataIndex: "index",
      fixed: "left",
      width: 66,
      render: (text, record, index) => index + 1,
    },
    { title: "订单id", dataIndex: "buyer_id", fixed: "left" },
    { title: "姓名", dataIndex: "name", fixed: "left" },
    { title: "邮箱", dataIndex: "email", key: "email" },
    { title: "国家", dataIndex: "country", key: "country" },
    { title: "州", dataIndex: "state", key: "state" },
    { title: "城市", dataIndex: "city", key: "city" },
    { title: "邮编", dataIndex: "zip", key: "zip" },
    { title: "具体地址", dataIndex: "first_line", key: "first_line" },
    { title: "门牌号", dataIndex: "second_line", key: "second_line" },
    {
      title: "SKU编号",
      dataIndex: "product_identifier",
      key: "product_identifier",
      render: (text, record) =>
        record.products.map((product, idx) => (
          <div key={idx}>{product.product_identifier}</div>
        )),
    },
    {
      title: "数量",
      dataIndex: "quantity",
      key: "quantity",
      width: 66,
      render: (text, record) =>
        record.products.map((product, idx) => (
          <div key={idx}>{product.quantity}</div>
        )),
    },
    { title: "产品标题", dataIndex: "title", key: "title" },
  ];

  return (
    <div>
      <Table
        bordered
        // className={styles.customTable}
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: "max-content", y: "calc(100vh - 270px)" }}
        pagination={false}
        rowKey="buyer_id"
      />
    </div>
  );
};

export default ShippingTable;

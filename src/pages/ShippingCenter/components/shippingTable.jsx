import { Table } from "antd";

const ShippingTable = ({ dataSource = [] }) => {
  const columns = [
    { title: "订单id", dataIndex: "buyer_id" },
    { title: "姓名", dataIndex: "name" },
    { title: "邮箱 2", dataIndex: "email", key: "email" },
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
        scroll={{ x: "max-content" }}
        pagination={false}
        rowKey="buyer_id"
      />
    </div>
  );
};

export default ShippingTable;

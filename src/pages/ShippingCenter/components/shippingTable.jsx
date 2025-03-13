import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Table, Input, Typography, Form, Popconfirm } from "antd";

const ShippingTable = forwardRef(({ dataSource = [] }, ref) => {
  const [editingKey, setEditingKey] = useState("");
  const [form] = Form.useForm();
  const [data, setData] = useState(dataSource);

  useEffect(() => {
    setData(dataSource);
  }, [dataSource]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    exportData: data,
  }));

  const isEditing = (record) => {
    // if (!!editingKey) return false;
    return record.buyer_id === editingKey;
  };

  const edit = (record) => {
    form.setFieldsValue({
      option: "", // 初始化备注字段
      ...record, // 填充其他字段
    });
    setEditingKey(record.buyer_id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (buyer_id) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => buyer_id === item.buyer_id);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "订单Id",
      dataIndex: "buyer_id",
      fixed: "left",
    },
    { title: "姓名", dataIndex: "name", fixed: "left" },
    { title: "国家", dataIndex: "country" },
    { title: "州", dataIndex: "state" },
    { title: "城市", dataIndex: "city" },
    { title: "邮编", dataIndex: "zip" },
    { title: "具体地址", dataIndex: "first_line" },
    { title: "门牌号", dataIndex: "second_line" },
    {
      title: "SKU编号",
      dataIndex: "product_identifier",
      render: (text, record) =>
        record.products.map((product, idx) => (
          <div key={idx}>{product.product_identifier}</div>
        )),
    },
    {
      title: "数量",
      dataIndex: "quantity",
      render: (text, record) =>
        record.products.map((product, idx) => (
          <div key={idx}>{product.quantity}</div>
        )),
    },
    {
      title: "选项",
      dataIndex: "option",
      editable: true, // 标记为可编辑列
      width: 150,
    },
    {
      title: "个性化定制",
      dataIndex: "personalisation",
      width: 150,
      render: (text, record) =>
        record.products.map((product, idx) => (
          <div key={idx}>{product.personalisation}</div>
        )),
    },
    {
      title: "商家备注",
      dataIndex: "merchant_notes",
      width: 150,
      render: (text) => text?.map?.((a) => a.note)?.join(","),
    },
    {
      title: "操作",
      dataIndex: "action",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.buyer_id)}
              style={{ marginInlineEnd: 8 }}
            >
              保存
            </Typography.Link>
            <Popconfirm title="确定取消吗？" onConfirm={cancel}>
              <a>取消</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
          >
            编辑
          </Typography.Link>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record), // 只对当前编辑的行生效
      }),
    };
  });

  return (
    <div>
      <Form form={form} component={false}>
        <Table
          bordered
          columns={mergedColumns}
          dataSource={data}
          scroll={{ x: "max-content", y: "calc(100vh - 270px)" }}
          pagination={false}
          rowKey="buyer_id"
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowClassName="editable-row"
        />
      </Form>
    </div>
  );
});

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = <Input />; // 使用 Input 组件

  return (
    <td {...restProps} width={150}>
      {editing ? (
        <Form.Item
          noStyle
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `请输入 ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default ShippingTable;

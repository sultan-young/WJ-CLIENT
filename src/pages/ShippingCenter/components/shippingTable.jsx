import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
} from "react";
import {
  Table,
  Input,
  Typography,
  Form,
  Popconfirm,
  Button,
  Space,
  message,
  Tag,
  List,
} from "antd";
import { CopyOutlined, SearchOutlined } from "@ant-design/icons";
import { copyToClipboard } from "../../../utils/clipboard";

const ShippingTable = forwardRef(({ dataSource = [] }, ref) => {
  const [editingKey, setEditingKey] = useState("");
  const [form] = Form.useForm();
  const [data, setData] = useState(dataSource);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const countryFilters = useMemo(() => {
    return [...new Set(data.map(item => item.country))];
  }, [data])

  useEffect(() => {
    setData(dataSource);
  }, [dataSource]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    exportData: data,
  }));

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

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

  const deleteOrder = (record) => {
    setData(data.filter((item) => record.__uid !== item.__uid));
  };
  const deleteSelected = () => {
    setData(data.filter((item) => !selectedRowKeys.includes(item.__uid)));
    setSelectedRowKeys([]);
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
      title: "姓名",
      dataIndex: "name",
      fixed: "left",
      width: 150,
      render: (text) => {
        return (
          <a
            style={{ color: "#4096ff" }}
            onClick={() => {
              copyToClipboard(text);
              message.success("复制成功");
            }}
            type="link"
          >
            {text}
          </a>
        );
      },
    },
    {
      title: "SKU编号*数量",
      dataIndex: "product_identifier",
      width: 150,
      fixed: "left",
      render: (text, record) =>
        record.products.map((product, idx) => (
          <div key={idx}>
            {product.product_identifier || "N/A"} * {product.quantity}
          </div>
        )),
    },
    {
      title: "定制信息",
      dataIndex: "personalisation",
      width: 300,
      fixed: "left",
      render: (text, record) => {
        const dataList = [];

        const personalisationList = (record.products || [])
          .map((product) => product.personalisation)
          .filter((item) => item);

        if (personalisationList.length) {
          personalisationList.forEach((item, index) => {
            dataList.push({
              source: `顾客定制${
                personalisationList.length > 1
                  ? `${index + 1} (${
                      record.products[index].product_identifier || "N/A"
                    })`
                  : ""
              }`,
              content: item,
            });
          });
        }

        if (record.note_from_buyer) {
          dataList.push({
            source: "顾客备注",
            content: record.note_from_buyer,
          });
        }

        if ((record.merchant_notes || []).length) {
          dataList.push({
            source: "客服备注",
            content:
              (record.merchant_notes || [])?.map?.((a) => a.note)?.join(",") ||
              "--",
          });
        }

        return (
          <ul>
            {dataList.map((item) => (
              <li>
                <span>【{item.source}】</span>
                <span>{item.content}</span>
              </li>
            ))}
            {!dataList.length && "N/A"}
          </ul>
        );
      },
    },
    { title: "店铺", dataIndex: "__shopAbbr" },
    {
      title: "礼物相关",
      dataIndex: "gift_message",
      render: (_, record) => {
        const { is_gift_wrapped, gift_message, gift_buyer_first_name } = record;
        const gift_message_total = `${gift_message}${
          gift_buyer_first_name ? `\n--$${gift_buyer_first_name}` : ""
        }`;
        return (
          <Space wrap>
            {is_gift_wrapped ? <Tag color="#f50">支付礼物包装</Tag> : null}
            {gift_message ? (
              <a>
                <Tag
                  onClick={() => {
                    copyToClipboard(gift_message_total);
                    message.success("礼物留言复制成功");
                  }}
                  color="lime"
                >
                  有礼物留言
                </Tag>
              </a>
            ) : null}
            {!is_gift_wrapped && !gift_message && "N/A"}
          </Space>
        );
      },
    },
    {
      title: "国家",
      dataIndex: "country",
      filters: countryFilters.map(item => ({
        text: item,
        value: item,
      })),
      onFilter: (value, record) => record.country.indexOf(value) === 0,
    },
    { title: "州", dataIndex: "state" },
    { title: "城市", dataIndex: "city" },
    { title: "邮编", dataIndex: "zip" },
    { title: "具体地址", dataIndex: "first_line" },
    { title: "门牌号", dataIndex: "second_line" },
    {
      title: "选项",
      dataIndex: "option",
      editable: true, // 标记为可编辑列
      width: 150,
    },
    {
      title: "订单Id",
      dataIndex: "buyer_id",
      fixed: "left",
    },

    {
      title: "操作",
      dataIndex: "action",
      fixed: "right",
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
            <a onClick={cancel}>取消</a>
          </span>
        ) : (
          <>
            <Typography.Link
              disabled={editingKey !== ""}
              onClick={() => edit(record)}
            >
              编辑
            </Typography.Link>
            <Button type="link" onClick={() => deleteOrder(record)} danger>
              删除
            </Button>
          </>
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
        <Button danger onClick={deleteSelected}>
          删除选中
        </Button>
        <Table
          columns={mergedColumns}
          rowSelection={rowSelection}
          dataSource={data}
          scroll={{ x: "2000px", y: "calc(100vh - 270px)" }}
          pagination={false}
          rowKey="__uid"
          components={{
            body: {
              cell: EditableCell,
            },
          }}
        />
      </Form>
    </div>
  );
});

const EditableCell = ({
  editing,
  dataIndex,
  title,
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

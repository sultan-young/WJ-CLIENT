import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  Button,
  Form,
  Space,
  DatePicker,
  Row,
  Col,
  Image,
  Badge,
  Spin,
  Empty,
} from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { searchProduct } from "../../../services/productService";

const Step2WithOrder = forwardRef(({ supplierId }, ref) => {
  const [quantities, setQuantities] = useState({});
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setQuantities([]);
    setProductList([]);
    setLoading(false);
  };
  useEffect(() => {
    setLoading(true);
    setProductList([]);
    const fetchData = async () => {
      if (!supplierId) {
        setProductList([]);
        return;
      }
      try {
        const result = await searchProduct({
          queryParams: {
            type: 9,
            content: supplierId,
          },
        });
        setProductList(result.result || []);
      } catch (error) {
      } finally {
        setLoading(false); // 确保在异步操作完成后设置加载状态为 false
      }
    };

    fetchData();
    return () => {
      resetState();
    };
  }, [supplierId]);

  useImperativeHandle(ref, () => ({
    verifySelectStatus: () => {
      const sum = Object.values(quantities).reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
      return sum > 0;
    },
    getValues: () => {
      const selectedCards = productList
        .map((item, index) => ({ ...item, count: quantities[index] }))
        .filter((item) => item.count > 0);
      return selectedCards;
    },
    formData: ref.current,
  }));

  const handleQuantityChange = (event, index, delta) => {
    event.stopPropagation();
    setQuantities((prev) => ({
      ...prev,
      [index]: Math.max((prev[index] || 0) + delta, 0),
    }));
  };

  return (
    <Spin
      spinning={loading}
      className="product-image-card"
      style={{ padding: "20px" }}
    >
      <Form ref={ref} layout="vertical">
        <Form.Item
          label="发货日期"
          name="shippingDate"
          rules={[{ required: true, message: "请选择发货日期" }]}
        >
          <DatePicker />
        </Form.Item>
      </Form>
      {productList.length ? (
        <Row gutter={16}>
          {productList.map((item, index) => (
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
                          <Button variant="text">
                            {quantities[index] || 0}
                          </Button>
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
      ) : (
        <Empty />
      )}
    </Spin>
  );
});

export default Step2WithOrder;

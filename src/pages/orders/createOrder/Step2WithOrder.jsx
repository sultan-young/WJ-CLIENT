import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
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
  message,
} from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { searchProduct } from "../../../services/productService";
import dayjs from "dayjs";

const Step2WithOrder = forwardRef(
  ({ supplierId, defaultSelectOrder = [], defaultSelectShipDate }, ref) => {
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

      // 将默认时间回填
      if (defaultSelectShipDate) {
        ref.current.formData.setFieldValue(
          "shippingDate",
          dayjs(defaultSelectShipDate)
        );
      }

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
          const defaultSelectOrderMap = defaultSelectOrder.reduce(
            (prev, current) => {
              // TODO: 这里有已知问题，当更改供应商时候，无法选中更新后供应商的商品，但是仍能通过校验，先不解决
              prev[current["id"]] = current.count;
              return prev;
            },
            {}
          );
          setQuantities(defaultSelectOrderMap);
          setProductList(result || []);
        } catch (error) {
          message.error(error);
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
          .map((item) => ({ ...item, count: quantities[item["id"]] }))
          .filter((item) => item.count > 0);

        return selectedCards;
      },
      formData: ref.current,
    }));

    const handleQuantityChange = (event, id, delta) => {
      event.stopPropagation();
      setQuantities((prev) => ({
        ...prev,
        [id]: Math.max((prev[id] || 0) + delta, 0),
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
          <Row gutter={[16, 16]}>
            {productList.map((item) => (
              <Col
                xs={12} // 手机宽度下每行显示 1 个
                sm={12} // 小屏幕宽度下每行显示 2 个
                md={6} // 中等屏幕宽度下每行显示 3 个
                lg={4} // 大屏幕宽度下每行显示 4 个
                xl={4} // 超大屏幕宽度下每行显示 6 个
                key={item.id}
                style={{ marginBottom: 16 }}
              >
                <Badge count={quantities[item.id]}>
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
                    <span className="product-card-title">{`${item.nameCn}(${item.sku})`}</span>
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
                              disabled={!quantities[item.id]}
                              onClick={(e) =>
                                handleQuantityChange(e, item.id, -1)
                              }
                              icon={<MinusOutlined />}
                            />
                            <Button variant="text">
                              {quantities[item.id] || 0}
                            </Button>
                            <Button
                              onClick={(e) =>
                                handleQuantityChange(e, item.id, 1)
                              }
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
  }
);

export default Step2WithOrder;

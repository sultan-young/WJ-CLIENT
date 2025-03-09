import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Image,
  Badge,
  Space,
  Input,
  Drawer,
} from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import './index.css'

const { Meta } = Card;

const ProductCardForSelectOrder = ({ data }) => {
  const [quantities, setQuantities] = useState({});
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleQuantityChange = (event, index, delta) => {
    event.stopPropagation();
    setQuantities((prev) => ({
      ...prev,
      [index]: Math.max((prev[index] || 0) + delta, 0),
    }));
  };

  const selectedCards = data.filter((_, index) => quantities[index] > 0);

  return (
    <div style={{ padding: "20px" }}>
      <Button
        type="primary"
        style={{ marginBottom: 20 }}
        onClick={() => setPreviewVisible(true)}
        disabled={selectedCards.length === 0}
      >
        预览选中卡片（{selectedCards.length}）
      </Button>

      <Row gutter={16}>
        {data.map((item, index) => (
          <Col span={6} key={index} style={{ marginBottom: 16 }}>
            <Badge count={quantities[index]}>
              <Card
                size="small"
                width={100}
                hoverable
                // onClick={(e) => handleQuantityChange(e, index, 1)}
                style={{
                  transition: "border 0.3s",
                }}
                cover={
                  <Image.PreviewGroup>
                    {item.images.map((item) => (
                      <Image
                        key={item.picturebedId}
                        style={{ objectFit: "cover", height: "200px" }}
                        src={item.url}
                      />
                    ))}
                  </Image.PreviewGroup>
                }
              >
                <div className="padding"></div>
                <Meta
                  title={`${item.nameCN}(${item.sku})`}
                  description={`仓库剩余库存 ${item.stock}`}
                />
                <div style={{ textAlign: "center", marginTop: 10 }}>
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
              </Card>
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
};

export default ProductCardForSelectOrder;

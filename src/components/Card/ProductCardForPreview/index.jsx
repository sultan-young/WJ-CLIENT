import {
  Card,
  Tag,
  Image,
  Button,
  Popconfirm,
  Tooltip,
  InputNumber,
  message,
  Space,
  Badge,
} from "antd";
import styled from "styled-components";
import { useAuth } from "../../../context/AuthContext"; // 假设有权限上下文
import "./styles.css";
import {
  ExclamationCircleOutlined,
  FormOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import { updateProduct } from "../../../services/productService";
import ImageGallery from "../../ImageGalleryContainer";

// 使用 props 动态设置样式
const DealCard = styled(Card)(({ single }) => ({
  ".ant-card-cover": {
    ...(single ? { maxHeight: "500px !important", height: "500px", overflow: 'hidden' } : {}),
  },
}));

const ProductCardForPreview = ({
  product,
  onDelete,
  onUpdate,
  onCopy,
  onSuccessCb,
  isSingleShow,
}) => {
  const { Meta } = Card;
  const { user } = useAuth(); // 获取当前用户信息
  const [stockCount, setStockCount] = useState(product.stock);
  const isAdmin = user?.name === "admin";
  // const isAdmin = true;
  const imageUrls = useMemo(() => {
    let urls = [];
    // 如果是商品组的话，优先展示商品组中子商品每张图。如果没有子商品或子商品都没有图，则展示商品组的图
    if (product.isGroup) {
      const childImgUrls = (product.children || [])
        .map((item) => item.images[0]?.url)
        .filter((url) => url);
      const groupImgUrls = (product?.images || []).map((item) => item.url);
      urls = childImgUrls.length ? childImgUrls : groupImgUrls;
    } else {
      urls = [(product?.images || []).map((item) => item.url)[0]];
    }
    return urls;
  }, [product]);

  const tagsDom = (
    <>
      {product.tags.map((tag) => (
        <Tag key={tag} color="blue">
          {tag}
        </Tag>
      ))}
    </>
  );

  return (
    <DealCard
      // title={product.nameCn}
      variant="borderless"
      single={isSingleShow || false}
      cover={
        <ImageGallery
          images={imageUrls}
        ></ImageGallery>
      }
      actions={
        isAdmin
          ? [
              <Button
                size="small"
                type="link"
                onClick={() => onUpdate(product)}
              >
                编辑
              </Button>,
              <Button size="small" type="link" onClick={() => onCopy(product)}>
                快速复制
              </Button>,
              <Popconfirm
                title={product.isGroup ? "您正在删除一个商品组，删除商品组之后，所有的子商品将被删除，请慎重！！！" : "确定要删除这个商品吗？"}
                icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                onConfirm={() => onDelete(product.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button size="small" type="link" danger>
                  删除
                </Button>
              </Popconfirm>,
            ]
          : []
      }
      className="product-card"
    >
      <Meta
        // avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
        title={`${
          product.nameCn.length > 6
            ? product.nameCn.slice(0, 6)
            : product.nameCn
        }(${product.sku})`}
      />
      {/* <Image.PreviewGroup width={200} items={imageUrls}>
        <Image width={200} src={imageUrls[0]} wrapperStyle={{width: "100%"}} />
      </Image.PreviewGroup> */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="stock">
          库存: {product.stock}
          {isAdmin && (
            <Popconfirm
              title="库存编辑"
              icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
              onConfirm={async () => {
                const res = { ...product, stock: stockCount };
                try {
                  await updateProduct(res);
                  message.success("更新库存成功");
                  onSuccessCb?.();
                  // 这里需要更新商品列表状态或重新获取数据
                } catch (error) {
                  console.error("更新库存失败:", error);
                }
              }}
              onCancel={() => {
                setStockCount(product.stock);
              }}
              okText="确定"
              cancelText="取消"
              description={
                <Space.Compact>
                  <Button
                    disabled={!product.stock}
                    onClick={() => setStockCount(stockCount - 1)}
                    icon={<MinusOutlined />}
                  />
                  <InputNumber
                    min={1}
                    value={stockCount}
                    style={{ width: "40px" }}
                    controls={false}
                    onChange={(v) => {
                      setStockCount(v);
                    }}
                    changeOnWheel
                  />
                  <Button
                    onClick={() => setStockCount(stockCount + 1)}
                    icon={<PlusOutlined />}
                  />
                </Space.Compact>
              }
            >
              <FormOutlined
                style={{
                  marginLeft: "8px",
                  cursor: "pointer",
                }}
              />
            </Popconfirm>
          )}
        </div>

        <div className="tags">
          {product.tags.length > 2 ? (
            <Tooltip title={product.tags?.join(" , ")}>{tagsDom}</Tooltip>
          ) : (
            tagsDom
          )}
        </div>
      </div>
    </DealCard>
  );
};

export default ProductCardForPreview;

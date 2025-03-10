import {
  Card,
  Tag,
  Image,
  Button,
  Popconfirm,
  Tooltip,
  InputNumber,
  message,
} from "antd";
import styled from "styled-components";
import { useAuth } from "../../../context/AuthContext"; // 假设有权限上下文
import "./styles.css";
import { ExclamationCircleOutlined, FormOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { updateProduct } from "../../../services/productService";

const ProductCardForPreview = ({
  product,
  onDelete,
  onUpdate,
  onSuccessCb,
  isSingleShow,
}) => {
  const { Meta } = Card;
  const { user } = useAuth(); // 获取当前用户信息
  const [stockCount, setStockCount] = useState(product.stock);
  const isAdmin = user?.name === "admin";
  // const isAdmin = true;
  const imageUrls = useMemo(() => {
    return (product?.images || []).map((item) => item.url);
  }, [product]);

  console.log(isSingleShow, 111);
  const tagsDom = (
    <>
      {product.tags.map((tag) => (
        <Tag key={tag} color="blue">
          {tag}
        </Tag>
      ))}
    </>
  );

  const DealCard = styled(Card)({
    ".ant-card-cover": {
      ...(isSingleShow ? { maxHeight: "500px !important",height:'500px' } : {}),
    },
  });
  return (
    <DealCard
      // title={product.nameCN}
      variant="borderless"
      cover={
        <Image.PreviewGroup
          width={200}
          items={imageUrls}
          style={{
            ...(isSingleShow ? { maxWidth: "400px", maxHeight: "420px" } : {}),
          }}
        >
          <Image
            width={200}
            src={imageUrls[0]}
            wrapperStyle={{
              width: "100%",
              maxWidth: "400px",
              maxHeight: "420px",
            }}
          />
        </Image.PreviewGroup>
      }
      actions={
        isAdmin
          ? [
              <Button type="link" onClick={() => onUpdate(product)}>
                编辑
              </Button>,
              <Popconfirm
                title="确定要删除这个商品吗？"
                icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                onConfirm={() => onDelete(product.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm>,
            ]
          : []
      }
      // extra={
      //   isAdmin && (
      //     <div className="card-actions">
      //       <Button
      //         type="link"
      //         onClick={() => onUpdate(product)}
      //       >
      //         编辑
      //       </Button>
      //       <Popconfirm
      //         title="确定要删除这个商品吗？"
      //         icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
      //         onConfirm={() => onDelete(product.id)}
      //         okText="确定"
      //         cancelText="取消"
      //       >
      //         <Button type="link" danger>
      //           删除
      //         </Button>
      //       </Popconfirm>
      //     </div>
      //   )
      // }
      className="product-card"
    >
      <Meta
        // avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
        title={`${product.nameCN}(${product.sku})`}
        // description={product.notes}
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
              okText="确定"
              cancelText="取消"
              description={
                <InputNumber
                  min={1}
                  defaultValue={stockCount}
                  onChange={(v) => {
                    setStockCount(v);
                  }}
                  changeOnWheel
                />
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

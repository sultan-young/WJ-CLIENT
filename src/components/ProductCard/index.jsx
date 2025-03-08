import { Card, Tag, Image, Button, Popconfirm, Tooltip } from "antd";
import { useAuth } from "../../context/AuthContext"; // 假设有权限上下文
import "./styles.css";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useMemo } from "react";

const ProductCard = ({ product, onDelete, onUpdate }) => {
  const { Meta } = Card;
  const { user } = useAuth(); // 获取当前用户信息
  // const isAdmin = user?.role === 'admin';
  const isAdmin = true;
  const imageUrls = useMemo(() => {
    return (product?.images || []).map((item) => item.url);
  }, [product]);

  console.log(user);
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
    <Card
      // title={product.nameCN}
      variant="borderless"
      cover={
        <img
          alt="example"
          // src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
          src={imageUrls[0]}
          // width={280}
          // style={{width:200,height:200}}
        />
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
        title={product.nameCN}
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
        <div className="stock">库存: {product.stock}</div>

        <div className="tags" text={"111"}>
          {product.tags.length > 2 ? (
            <Tooltip title={product.tags?.join(" , ")}>{tagsDom}</Tooltip>
          ) : (
            tagsDom
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;

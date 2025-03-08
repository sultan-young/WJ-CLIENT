import { Card, Tag, Image, Button, Popconfirm } from "antd";
import { useAuth } from '../../context/AuthContext'; // 假设有权限上下文
import "./styles.css";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useMemo } from "react";

const ProductCard = ({ product, onDelete, onUpdate }) => {
  const { user } = useAuth(); // 获取当前用户信息
  const isAdmin = user?.role === 'admin';
  const imageUrls = useMemo(() => {
    return (product?.images || []).map(item => item.url)
  }, [product])

  console.log(imageUrls)

  return (
    <Card
      title={product.nameCN}
      extra={
        isAdmin && (
          <div className="card-actions">
            <Button 
              type="link" 
              onClick={() => onUpdate(product)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这个商品吗？"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              onConfirm={() => onDelete(product.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </div>
        )
      }
      className="product-card"
    >
      <Image.PreviewGroup width={200} items={imageUrls}>
        <Image width={200} src={imageUrls[0]} wrapperStyle={{width: "100%"}} />
      </Image.PreviewGroup>
      
      <div className="stock">库存: {product.stock}</div>
      
      <div className="tags">
        {product.tags.map(tag => (
          <Tag key={tag} color="blue">{tag}</Tag>
        ))}
      </div>
    </Card>
  )
};

export default ProductCard;
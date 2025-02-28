import { useState, useEffect, useRef } from "react";
import { Input, Select, Button, List, Drawer, message } from "antd";
import ProductCard from "../../components/ProductCard";
import { createProduct, getProducts } from "../../services/productService";
import "./styles.css";
import ProductForm from "../ProductForm";
import { updateProduct, deleteProduct } from '../../services/productService';
import { getSuppliers } from "../../services/supplierService";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  // 处理删除操作
  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      messageApi.info('删除成功');
      // 这里需要更新商品列表状态或重新获取数据
    } catch (error) {
        messageApi.error('删除失败');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await getSuppliers(); // 替换为真实接口
      setSuppliers(res.data);
    } catch (error) {
        messageApi.error('获取供应商列表失败');
    }
  };

  // 处理更新提交
  const handleUpdateSubmit = async () => {
    try {
        console.log(formRef, 'formRef')
      const values = await formRef.current.validateFields();
      const updatedProduct = {
        ...selectedProduct,
        ...values,
        id: selectedProduct.id
      };
      
      await updateProduct(updatedProduct);
      message.success('更新成功');
      setSelectedProduct(null);
      // 这里需要更新商品列表状态或重新获取数据
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  const loadData = async () => {
    const res = await getProducts(filters);
    fetchSuppliers()
    setProducts(res.data);
  };

  useEffect(() => { loadData(); }, [filters]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const formRef = useRef();

  const handleDrawerSubmit = async () => {
    try {
      await formRef.current.submit();
      setDrawerVisible(false);
    } catch (error) {
      console.error('表单验证失败');
    }
  };

  const onClickUpdate = (productInfo) => {
    setSelectedProduct(productInfo)
  }

  const onSubmitSuccess = () => {
    message.success('商品创建成功');
    // 这里可以刷新商品列表数据
    loadData()
  }

  return (
    <div className="product-list-page">
      <div className="filters">
        <Input
          placeholder="按 SKU 搜索"
          onChange={(e) => setFilters({ ...filters, sku: e.target.value })}
        />
        
        <Select
          placeholder="按供应商筛选"
          onChange={(value) => setFilters({ ...filters, supplierId: value })}
          options={suppliers.map(s => ({
            label: s.name,
            value: s.id
          }))}
        />
        <Button type="primary" onClick={() => setDrawerVisible(true)}>
            录入商品
        </Button>
      </div>

      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={products}
        renderItem={(item) => (
          <List.Item>
            <ProductCard product={item} onUpdate={() => onClickUpdate(item)} onDelete={() => handleDelete(item.id)} key={item.id}/>
          </List.Item>
        )}
      />
      <Drawer
        title="快速录入商品"
        width={720}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button 
              style={{ marginRight: 8 }}
              onClick={() => setDrawerVisible(false)}
            >
              取消
            </Button>
            <Button 
              type="primary"
              onClick={handleDrawerSubmit}
            >
              提交商品
            </Button>
          </div>
        }
      >
        <ProductForm
          ref={formRef}
          hideSubmitButton
          onCreate={createProduct}
          onUpdate={updateProduct}
          onSubmitSuccess={onSubmitSuccess}
        />
      </Drawer>

      <Drawer
        title={`更新商品 - ${selectedProduct?.sku || ''}`}
        width={720}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button 
              style={{ marginRight: 8 }}
              onClick={() => setSelectedProduct(null)}
            >
              取消
            </Button>
            <Button 
              type="primary"
              onClick={handleUpdateSubmit}
            >
              提交更新
            </Button>
          </div>
        }
      >
        {selectedProduct && (
          <ProductForm
            ref={formRef}
            initialValues={{
              ...selectedProduct,
            }}
            tags={selectedProduct.tags}
            hideSubmitButton
          />
        )}
      </Drawer>
    </div>
  );
};

export default ProductList;
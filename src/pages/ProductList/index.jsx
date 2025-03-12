import { useState, useEffect, useRef } from "react";
import {
  Input,
  Select,
  Button,
  List,
  Drawer,
  message,
  ConfigProvider,
  Row,
  Col,
} from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { getProducts, searchProduct } from "../../services/productService";
import "./styles.css";
import ProductForm from "../ProductForm";
import { updateProduct, deleteProduct } from "../../services/productService";
import { getSuppliers } from "../../services/supplierService";
import SearchBox from "../../components/searchBox";
import OrderList from "../orders/orderList";
import ProductCardForPreview from "../../components/Card/ProductCardForPreview";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [submitBtnLoadings, setSubmitBtnLoadings] = useState(false);
  console.log(products, 1234);

  // 处理删除操作
  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId);
      message.info("删除成功");
      loadData();
      // 这里需要更新商品列表状态或重新获取数据
    } catch (error) {
      message.error("删除失败");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await getSuppliers(); // 替换为真实接口
      setSuppliers(res.data);
    } catch (error) {
      message.error("获取供应商列表失败");
    }
  };

  // 处理更新提交
  const handleUpdateSubmit = async () => {
    try {
      const values = await formRef.current.validateFields();
      const updatedProduct = {
        ...selectedProduct,
        ...values,
        id: selectedProduct.id,
      };
      await updateProduct(updatedProduct);
      message.success("更新成功");
      formRef.current.reset();
      setSelectedProduct(null);
      loadData();
      // 这里需要更新商品列表状态或重新获取数据
    } catch (error) {
      console.error("更新失败:", error);
    }
  };

  const loadData = async () => {
    const res = await getProducts(filters);
    fetchSuppliers();
    setProducts(res.data);
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const formRef = useRef();

  const handleDrawerSubmit = async () => {
    try {
      await formRef.current.submit();
      setDrawerVisible(false);
    } catch (error) {
      console.error("表单验证失败");
    }
  };

  const onClickUpdate = (productInfo) => {
    setSelectedProduct(productInfo);
  };

  const onSubmitSuccess = () => {
    // 这里可以刷新商品列表数据
    loadData();
  };

  const toggleSubmitBtnLoadings = (loading) => {
    setSubmitBtnLoadings(loading);
  };

  const onSearch = async (data) => {
    const res = await searchProduct({
      queryParams: data,
    });
    setProducts(res);
  };

  const isSingle = products?.length === 1;
  return (
    <div className="product-list-page">
      <Row
        gutter={6}
        style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}
      >
        <Col span={18}>
          <SearchBox
            onSearch={(data) => {
              onSearch(data);
            }}
            style={{ flex: "1 1 0" }}
          ></SearchBox>
        </Col>
        <Col span={6}>
          <Button
            type="primary"
            onClick={() => setDrawerVisible(true)}
            className="add-button"
          >
            录入商品
          </Button>
        </Col>
      </Row>

      <List
        grid={{
          gutter: isSingle ? 1 : 6,
          xs: isSingle ? 1 : 2,
          sm: isSingle ? 1 : 2,
          md: isSingle ? 1 : 4,
          lg: isSingle ? 1 : 4,
          xl: isSingle ? 1 : 6,
          xxl: isSingle ? 1 : 8,
        }}
        dataSource={products}
        renderItem={(item) => (
          <List.Item>
            <ProductCardForPreview
              product={item}
              isSingleShow={!(products?.length > 1)}
              onUpdate={() => onClickUpdate(item)}
              onSuccessCb={loadData}
              onDelete={() => handleDelete(item.id)}
              key={item.id}
            />
          </List.Item>
        )}
      />
      <Drawer
        title="快速录入商品"
        width={720}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setDrawerVisible(false)}
            >
              取消
            </Button>
            <Button
              type="primary"
              loading={submitBtnLoadings}
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
          onUpdate={updateProduct}
          toggleSubmitBtnLoadings={toggleSubmitBtnLoadings}
          onSubmitSuccess={onSubmitSuccess}
        />
      </Drawer>

      <Drawer
        title={`更新商品 - ${selectedProduct?.sku || ""}`}
        width={720}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setSelectedProduct(null)}
            >
              取消
            </Button>
            <Button type="primary" onClick={handleUpdateSubmit}>
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

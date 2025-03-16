import { useState, useEffect, useRef, useMemo } from "react";
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
import ProductForm from "./ProductForm";
import { updateProduct, deleteProduct } from "../../services/productService";
import SearchBox from "../../components/searchBox";
import OrderList from "../orders/orderList";
import ProductCardForPreview from "../../components/Card/ProductCardForPreview";
import { CHANGE_PRODUCT_MODE } from "./constant";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitBtnLoadings, setSubmitBtnLoadings] = useState(false);
  const [createMode, setCreateMode] = useState(
    CHANGE_PRODUCT_MODE.CREATE_PRODUCT
  );

  const createDrawerInfo = useMemo(() => {
    if (createMode === CHANGE_PRODUCT_MODE.CREATE_PRODUCT) {
      return {
        title: "录入商品",
        submitBtn: "创建",
      };
    }
    if (createMode === CHANGE_PRODUCT_MODE.UPDATE_PRODUCT) {
      return {
        title: `更新商品 - ${selectedProduct?.sku || ""}`,
        submitBtn: "更新",
      };
    }
    if (createMode === CHANGE_PRODUCT_MODE.QUICKCOPY_PRODUCT) {
      return {
        title: `以[${selectedProduct.nameCn}]为模板快速创建`,
        submitBtn: "创建",
      };
    }

    if (createMode === CHANGE_PRODUCT_MODE.CREATE_PRODUCT_GROUP) {
      return {
        title: "录入商品组",
        submitBtn: "创建商品组",
      };
    }
    if (createMode === CHANGE_PRODUCT_MODE.UPDATE_PRODUCT_GROUP) {
      return {
        title: `更新商品组 - ${selectedProduct?.sku || ""}`,
        submitBtn: "更新商品组",
      };
    }
    if (createMode === CHANGE_PRODUCT_MODE.QUICKCOPY_PRODUCT_GROUP) {
      return {
        title: `以[${selectedProduct.nameCn}]为模板快速创建商品组`,
        submitBtn: "快速创建商品组",
      };
    }
  }, [createMode, selectedProduct]);

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

  const loadData = async () => {
    const res = await getProducts(filters);
    setProducts(res.data);
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const formRef = useRef();

  const handleDrawerSubmit = async (mode) => {
    try {
      const result = await formRef.current.submit(mode);
      if (result) {
        loadData();
        setDrawerVisible(false);
      }
    } catch (error) {
      console.error("表单验证失败");
    }
  };

  const handleCreate = async (mode) => {
    setCreateMode(mode);
    setDrawerVisible(true);
    setSelectedProduct(null);
  };

  const onClickUpdate = (productInfo) => {
    setCreateMode(CHANGE_PRODUCT_MODE.UPDATE_PRODUCT);
    setSelectedProduct(productInfo);
    setDrawerVisible(true);
  };

  // 快速复制同类商品用于创建
  const onCopy = (productInfo) => {
    console.log(productInfo, 'productInfo')
    const newProductInfoTemp = {
      ...productInfo,
    };
    const { hasVariant } = newProductInfoTemp;
    if (hasVariant === 0) {
      delete newProductInfoTemp.sku;
    }
    // newProductInfoTemp.nameCn = "";
    // newProductInfoTemp.nameEn = "";
    newProductInfoTemp.images = [];
    newProductInfoTemp.variantSerial = "";
    setCreateMode(CHANGE_PRODUCT_MODE.QUICKCOPY_PRODUCT);
    setSelectedProduct(newProductInfoTemp);
    setDrawerVisible(true);
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
            onClick={() => handleCreate(CHANGE_PRODUCT_MODE.CREATE_PRODUCT)}
            className="add-button"
          >
            录入商品
          </Button>
          <Button
            type="primary"
            onClick={() =>
              handleCreate(CHANGE_PRODUCT_MODE.CREATE_PRODUCT_GROUP)
            }
            className="add-button"
          >
            录入商品组
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
              onCopy={() => onCopy(item)}
              key={item.id}
            />
          </List.Item>
        )}
      />
      <Drawer
        title={createDrawerInfo.title}
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
              onClick={() => handleDrawerSubmit(createMode)}
            >
              {createDrawerInfo.submitBtn}
            </Button>
          </div>
        }
      >
        <ProductForm
          ref={formRef}
          hideSubmitButton
          createMode={createMode}
          initialValues={selectedProduct && selectedProduct}
          onUpdate={updateProduct}
          toggleSubmitBtnLoadings={toggleSubmitBtnLoadings}
        />
      </Drawer>
    </div>
  );
};

export default ProductList;

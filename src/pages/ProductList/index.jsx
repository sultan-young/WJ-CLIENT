import { useState, useEffect, useRef, useMemo } from "react";
import {
  Button,
  List,
  Drawer,
  message,
  Row,
  Col,
  Badge,
  Skeleton,
  Divider,
} from "antd";
import { getProducts, searchProduct } from "../../services/productService";
import "./styles.css";
import ProductForm from "./ProductForm";
import { updateProduct, deleteProduct } from "../../services/productService";
import SearchBox from "../../components/searchBox";
import ProductCardForPreview from "../../components/Card/ProductCardForPreview";
import { CHANGE_PRODUCT_MODE } from "./constant";
import InfiniteScroll from "react-infinite-scroll-component";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitBtnLoadings, setSubmitBtnLoadings] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageSize: 30,
    pageNo: 1,
    total: 0,
  });
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

  useEffect(() => {
    loadData();
  }, []);

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
    setCreateMode(
      productInfo.isGroup
        ? CHANGE_PRODUCT_MODE.UPDATE_PRODUCT_GROUP
        : CHANGE_PRODUCT_MODE.UPDATE_PRODUCT
    );
    setSelectedProduct(productInfo);
    setDrawerVisible(true);
  };

  // 快速复制同类商品用于创建
  const onCopy = (productInfo) => {
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
    setCreateMode(
      productInfo.isGroup
        ? CHANGE_PRODUCT_MODE.QUICKCOPY_PRODUCT_GROUP
        : CHANGE_PRODUCT_MODE.QUICKCOPY_PRODUCT
    );
    setSelectedProduct(newProductInfoTemp);
    setDrawerVisible(true);
  };

  const toggleSubmitBtnLoadings = (loading) => {
    setSubmitBtnLoadings(loading);
  };

  /**
   *  搜索和获取商品列表的区别在于
   *  获取商品列表时候，只会获取到商品组和普通商品。
   *  搜索时候会获取到普通商品，商品组以及商品组下的子商品
   */
  const loadData = async (searchTerm) => {
    setPageLoading(true);
    if (searchTerm) {
      await onSearch(searchTerm);
    } else {
      await onFetchPageData();
    }

    setPageLoading(false);
  };

  const onFetchPageData = async () => {
    const { pagination: paginationResult, data } = await getProducts({
      queryParams: {
        pageNo: pagination.pageNo,
        pageSize: pagination.pageSize,
      }
    });
    setProducts([...products, ...data]);
    setPagination({
      ...paginationResult,
      pageNo: paginationResult.pageNo + 1,
    })
  };

  const onSearch = async (searchTerm) => {
    const res = await searchProduct({
      queryParams: searchTerm,
    });
    setProducts(res);
  };

  const isSingle = products?.length === 1;
  return (
    <div className="product-list-page" id="scrollableDiv">
      <Row
        gutter={6}
        style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}
      >
        <Col span={18}>
          <SearchBox
            onSearch={(searchTerm) => {
              loadData(searchTerm);
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

      <InfiniteScroll
        dataLength={products.length}
        next={loadData}
        hasMore={products.length < pagination.total}
        loader={<Skeleton.Node active={true} />}
        endMessage={<Divider plain>没有更多了 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          loading={pageLoading}
          grid={{
            gutter: isSingle ? 1 : 12,
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
              {item.isGroup ? (
                <Badge.Ribbon text="商品组">
                  <ProductCardForPreview
                    product={item}
                    isSingleShow={!(products?.length > 1)}
                    onUpdate={() => onClickUpdate(item)}
                    onSuccessCb={loadData}
                    onDelete={() => handleDelete(item.id)}
                    onCopy={() => onCopy(item)}
                    key={item.id}
                  />
                </Badge.Ribbon>
              ) : (
                <ProductCardForPreview
                  product={item}
                  isSingleShow={!(products?.length > 1)}
                  onUpdate={() => onClickUpdate(item)}
                  onSuccessCb={loadData}
                  onDelete={() => handleDelete(item.id)}
                  onCopy={() => onCopy(item)}
                  key={item.id}
                />
              )}
            </List.Item>
          )}
        />
      </InfiniteScroll>

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

import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
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
  Tag,
  Input,
} from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { searchProduct } from "../../../services/productService";
import Masonry from "react-masonry-css";
import "./index.less";
import {filterAndTransferProductData} from "../common/processProductData";
const { Search } = Input;

const breakpointColumnsObj = {
  2000: 4,
  1500: 4,
  1100: 3,
  700: 2,
  500: 1,
};



const Step2WithOrder = forwardRef(
  ({ supplierId, defaultSelectOrder = [] }, ref) => {
    const [quantities, setQuantities] = useState({});
    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const resetState = () => {
      setQuantities([]);
      setProductList([]);
      setLoading(false);
    };

    useEffect(() => {
      setLoading(true);
      setProductList([]);


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
          const productList = filterAndTransferProductData(result);
          setProductList(productList || []);
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
          .map((item) => {
            let __totalCount = 0;
            if (item.children?.length) {
              item.children = item.children.map((child) => {
                __totalCount += quantities[child["id"]] || 0;
                return {
                  ...child,
                  count: quantities[child["id"]] || 0,
                };
              });
            }
            return { ...item, count: quantities[item["id"]], __totalCount };
          })
          .filter((item) => item.count > 0 || item.__totalCount > 0);

        return selectedCards;
      },
    }));

    const handleQuantityChange = (event, id, delta) => {
      event.stopPropagation();
      setQuantities((prev) => ({
        ...prev,
        [id]: Math.max((prev[id] || 0) + delta, 0),
      }));
    };

    const ChangeQuantityButton = (product) => {
      return (
        <div key={product.id} className="product-card-btns">
          <Space size="small">
            <Tag color="processing" bordered={false}>
              {product.sku}
            </Tag>
            <Space.Compact>
              <Button
                disabled={!quantities[product.id]}
                onClick={(e) => handleQuantityChange(e, product.id, -1)}
                icon={<MinusOutlined />}
              />
              <Button
                className={quantities[product.id] > 0 ? "redBolder" : null}
                variant="text"
              >
                {quantities[product.id] || 0}
              </Button>
              <Button
                onClick={(e) => handleQuantityChange(e, product.id, 1)}
                icon={<PlusOutlined />}
              />
            </Space.Compact>
          </Space>
        </div>
      );
    };

    const onSearch = (e) => {
      setSearchValue(e.target.value);
    };

    const filterProductList = useMemo(() => {
      return productList.filter(
        (item) =>
          item.nameCn.includes(searchValue) || item.sku.includes(searchValue)
      );
    }, [searchValue, productList]);

    return (
      <Spin
        spinning={loading}
        className="product-image-card"
        style={{ padding: "20px" }}
      >
        <Search
          className="create-order-search"
          allowClear
          placeholder="通过sku或者商品名称筛选"
          onChange={onSearch}
        />
        {productList.length ? (
          <Masonry
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
            breakpointCols={breakpointColumnsObj}
          >
            {/* { / * JSX 项数组 * / }  */}
            {filterProductList.map((product) => (
              <div key={product.id} className="create-order-container">
                <Badge
                  styles={{ width: "100%", background: "red" }}
                  count={quantities[product.id]}
                >
                  <div className="product-card">
                    <Image.PreviewGroup items={product.images}>
                      <Image
                        style={{ objectFit: "cover" }}
                        src={product.images[0]}
                        preview={true}
                      />
                    </Image.PreviewGroup>
                    <span className="product-card-title">{`${product.nameCn}(${product.stock})`}</span>
                    {product.children?.length
                      ? product.children.map((item) =>
                          ChangeQuantityButton(item)
                        )
                      : ChangeQuantityButton(product)}
                  </div>
                </Badge>
              </div>
            ))}
          </Masonry>
        ) : (
          <Empty />
        )}
      </Spin>
    );
  }
);

export default Step2WithOrder;

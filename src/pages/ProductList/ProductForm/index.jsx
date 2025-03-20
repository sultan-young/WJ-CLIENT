import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Space,
  Button,
  Statistic,
  Row,
  Col,
  Collapse,
  Radio,
  Divider,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import styles from "./index.module.less";
import {
  createProduct,
  getProductCategoryList,
  updateProduct,
} from "../../../services/productService";
import {
  calculateGrossProfit,
  calculateNetProfit,
  calculateProductProfitRMB,
  rmb2usd,
} from "../../../utils/calculateProfit";
import { usePreloadData } from "../../../context/AppContext";
import { CHANGE_PRODUCT_MODE } from "../constant";
import UploadImage from "../../../components/UploadImages";

const renderDiscountPanelItems = (price = 0) => {
  let _price = (Number(price) || 0).toFixed(2);
  return [
    {
      key: "1",
      label: (
        <div className={styles["discount-item"]}>
          <span>9折预估利润</span> <span>${_price * 0.9}</span>
        </div>
      ),
      children: (
        <div className={styles["discount"]}>
          <div className={styles["discount-item"]}>
            <span>8折预估利润 </span>{" "}
            <span>
              {_price * 0.8}￥({rmb2usd(_price * 0.8)}$)
            </span>
          </div>
          <div className={styles["discount-item"]}>
            <span>7折预估利润</span>{" "}
            <span>
              {_price * 0.7}￥ ({rmb2usd(_price * 0.7)}$)
            </span>
          </div>
          <div className={styles["discount-item"]}>
            <span>6折预估利润</span>{" "}
            <span>
              {_price * 0.6}￥ ({rmb2usd(_price * 0.6)}$)
            </span>
          </div>
          <div className={styles["discount-item"]}>
            <span>5折预估利润</span>{" "}
            <span>
              {_price * 0.5}￥ ({rmb2usd(_price * 0.5)}$)
            </span>
          </div>
          <div className={styles["discount-item"]}>
            <span>4折预估利润</span>{" "}
            <span>
              {_price * 0.4}￥ ({rmb2usd(_price * 0.4)}$)
            </span>
          </div>
        </div>
      ),
    },
  ];
};

const ProductForm = forwardRef((props, ref) => {
  const { suppliersOption } = usePreloadData();

  // 基础配置
  const [baseForm] = Form.useForm();
  const [childrenForm] = Form.useForm();
  // 监听价格是否关联供应商
  const isPriceLinkSuppliers = Form.useWatch("priceLinkSuppliers", baseForm);

  const {
    initialValues,
    hideSubmitButton = false,
    onSubmitSuccess,
    toggleSubmitBtnLoadings,
    createMode,
  } = props;

  const isGroupMode = useMemo(() => {
    return [
      CHANGE_PRODUCT_MODE.CREATE_PRODUCT_GROUP,
      CHANGE_PRODUCT_MODE.QUICKCOPY_PRODUCT_GROUP,
      CHANGE_PRODUCT_MODE.UPDATE_PRODUCT_GROUP,
    ].includes(createMode);
  }, [createMode]);

  // 创建或复制
  const isCreateOrCopyMode = useMemo(() => {
    return [
      CHANGE_PRODUCT_MODE.CREATE_PRODUCT_GROUP,
      CHANGE_PRODUCT_MODE.QUICKCOPY_PRODUCT_GROUP,
      CHANGE_PRODUCT_MODE.CREATE_PRODUCT,
      CHANGE_PRODUCT_MODE.QUICKCOPY_PRODUCT,
    ].includes(createMode);
  }, [createMode]);

  // 编辑
  const isUpdateMode = useMemo(() => {
    return [
      CHANGE_PRODUCT_MODE.UPDATE_PRODUCT,
      CHANGE_PRODUCT_MODE.UPDATE_PRODUCT_GROUP,
    ].includes(createMode);
  }, [createMode]);

  // 组件状态
  // TODO: 这里可优化，tags还未加入到form中
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState("");
  // 货架列表
  const [productCategoryList, setProductCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitBtnLoadings, setSubmitBtnLoadings] = useState(false);
  const [profitData, setProfitData] = useState({
    grossProfitMargin: 0,
    netProfitMargin: 0,
    profit: 0,
  });

  const handleFormChange = () => {
    autoCalculateProfit();
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const autoCalculateProfit = () => {
    let { costPriceRMB, shippingFeeRMB, salePriceUSD, saleShipPriceUSD } =
      baseForm.getFieldValue();
    if (isPriceLinkSuppliers) {
      const values = baseForm.getFieldValue("costSuppliersLinkPricesRMB");
      costPriceRMB = Math.min(
        ...(values || []).map((item) => item.price).filter((price) => !!price)
      );
    }
    if (costPriceRMB && shippingFeeRMB && salePriceUSD) {
      setProfitData({
        grossProfitMargin: calculateGrossProfit({
          costPriceRMB,
          shippingFeeRMB,
          salePriceUSD,
          saleShipPriceUSD,
        }).toFixed(2),
        netProfitMargin: calculateNetProfit(),
        profit: calculateProductProfitRMB({
          costPriceRMB,
          shippingFeeRMB,
          salePriceUSD,
          saleShipPriceUSD,
        }).toFixed(2),
      });
    }
  };

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    // create 创建 update 更新
    submit: async () => {
      return await handleSubmit();
    },
    reset: () => resetAll(),
  }));

  // 初始化数据
  useEffect(() => {
    initializeForm();
    loadCategoryList();
  }, [props.initialValues]);

  // 初始化表单值
  const initializeForm = () => {
    if (initialValues) {
      const _values = {
        ...initialValues,
        images: initialValues.images || [],
      };
      baseForm.setFieldsValue(_values);
      setTags(initialValues.tags || []);
      if (isGroupMode) {
        childrenForm.setFieldsValue({
          subProducts: initialValues.children.map((child) => {
            const { id, stock, images, variantSerial } = child;
            return {
              id,
              stock,
              images,
              variantSerial,
            };
          }),
        });
      }
      autoCalculateProfit();
    } else {
      resetAll();
    }
  };

  // 加载货架数据
  const loadCategoryList = async () => {
    try {
      const res = await getProductCategoryList();
      setProductCategoryList(
        res.map((item) => ({
          label: `${item.value}  (${item.label})`,
          value: item.value,
        }))
      );
    } catch (error) {
      console.error("加载货架失败:", error);
    }
  };

  // 处理标签输入
  const handleTagAdd = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags((prev) => [...prev, inputTag]);
      setInputTag("");
    }
  };

  const resetAll = async () => {
    // TODO: 删除
    setTags([]);
    setInputTag("");
    setLoading(false);
    setSubmitBtnLoadings(false);
    baseForm.resetFields();
    childrenForm.resetFields();
  };

  // 提交处理
  const handleSubmit = async () => {
    const validateList = [baseForm.validateFields()];

    if (isGroupMode) {
      validateList.push(childrenForm.validateFields());
    }
    await Promise.all(validateList);
    try {
      setLoading(true);
      const ProductData = {
        ...baseForm.getFieldValue(),
        tags,
      };
      if (isGroupMode) {
        ProductData.isGroup = true;
        ProductData.children = childrenForm.getFieldValue()?.subProducts || [];
      }
      if (isCreateOrCopyMode) {
        await createProduct(ProductData);
      }
      if (isUpdateMode) {
        await updateProduct(ProductData);
      }
      resetAll();
      onSubmitSuccess?.();
      return true;
      // if (!initialValues) baseForm.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const changeSubmitBtnLoadings = (loading) => {
    setSubmitBtnLoadings(loading);
    toggleSubmitBtnLoadings?.(loading);
  };

  const onSelectSupplierChange = (value, option, v) => {
    // 获取当前 formList 的值
    const currentCostSuppliersLinkPricesRMB =
      baseForm.getFieldValue("costSuppliersLinkPricesRMB") || [];

    // 1. 过滤掉已移除的 id
    const remainingItems = currentCostSuppliersLinkPricesRMB.filter((item) =>
      value.includes(item.id)
    );

    // 2. 添加新增的 id（去重处理）
    const newIds = value.filter(
      (id) => !currentCostSuppliersLinkPricesRMB.some((item) => item.id === id)
    );
    const newItems = [
      ...remainingItems,
      ...newIds.map((id) => ({
        id,
        price: "",
        name: option.find((item) => item.value === id)?.label || "",
      })),
    ];

    // 更新 formList 字段
    baseForm.setFieldsValue({ costSuppliersLinkPricesRMB: newItems });
  };

  const updateImageValidator = () => ({
    validator(_, fileList) {
      // 组模式下，子商品和组商品可以只上传一个
      if (isGroupMode) {
        const isGroupImageExist = !!(baseForm.getFieldValue("images") || [])
          .length;
        const childrenFormImages = (
          childrenForm.getFieldValue("subProducts") || []
        ).filter((item) => item);
        const isAllChildImageExist =
          childrenFormImages.length &&
          childrenFormImages.every((item) => (item.images || []).length);

        // 所有子商品上传图片后，组商品可以不传
        // // 当组商品上传图片后，子商品图片选传
        if (isAllChildImageExist || isGroupImageExist) {
          return Promise.resolve();
        }
      }
      if ((fileList || []).length >= 1) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("至少上传一张图片"));
    },
  });

  return (
    <>
      <Form
        form={baseForm}
        layout="vertical"
        onFinish={handleSubmit}
        onChange={handleFormChange}
        initialValues={{
          stock: 0,
          price: 0,
          shippingFeeRMB: 35,
          priceLinkSuppliers: 0,
        }}
      >
        {/* 商品名称 */}
        <Form.Item
          label="中文名称"
          name="nameCn"
          tooltip="该名称会展示在订单图片和制单的excel中"
          rules={[{ required: true, message: "请输入中文名称" }]}
        >
          <Input placeholder="该名称会展示在订单图片和制单的excel中" />
        </Form.Item>

        {/* 商品名称 */}
        <Form.Item
          label="英文名称"
          name="nameEn"
          tooltip="该名称会展示在制单的excel中"
          rules={[{ required: true, message: "请输入英文名称" }]}
        >
          <Input placeholder="该名称会展示在制单的excel中" />
        </Form.Item>

        {/* 供应商选择（仅管理员可见） */}
        <Row gutter={40}>
          <Col>
            <Form.Item
              style={{ minWidth: "200px" }}
              label="供应商"
              name="suppliers"
              rules={[{ required: true, message: "请至少选择一个供应商" }]}
            >
              <Select
                mode="multiple"
                onChange={onSelectSupplierChange}
                showSearch={true}
                optionFilterProp="label"
                placeholder="选择供应商"
                options={suppliersOption}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              name="priceLinkSuppliers"
              label="价格是否关联供应商"
              tooltip="如果价格关联了供应商，则需要为每个供应商指定一个产品价格"
            >
              <Radio.Group>
                <Radio value={0}> 不关联 </Radio>
                <Radio value={1}> 关联 </Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            {/* 库存和价格 */}
            <Row gutter={4}>
              {!isPriceLinkSuppliers ? (
                <Form.Item
                  label="商品成本价(￥)"
                  name="costPriceRMB"
                  rules={[
                    {
                      required: true,
                      message:
                        "请输入商品进价（与供应商，手工艺人约定好的价格）",
                    },
                  ]}
                >
                  <InputNumber min={0} precision={2} />
                </Form.Item>
              ) : (
                <Form.List name="costSuppliersLinkPricesRMB">
                  {(fields) => (
                    <div className={styles["linkPriceContainer"]}>
                      <div className={styles["linkPriceContainer-title"]}>
                        各个供应商合作价(￥)
                      </div>
                      <div className={styles["linkPriceContainer-wrap"]}>
                        {fields.map(({ key, name, ...restField }) => {
                          // 获取当前项的 供应商名称
                          const supplierName = baseForm.getFieldValue([
                            "costSuppliersLinkPricesRMB",
                            name,
                            "name",
                          ]);

                          return (
                            <Form.Item
                              {...restField}
                              key={key}
                              name={[name, "price"]}
                              label={`${supplierName}`}
                              rules={[
                                {
                                  required: true,
                                  message: `请输入${supplierName}的合作价`,
                                },
                              ]}
                            >
                              <InputNumber />
                            </Form.Item>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Form.List>
              )}

              <Form.Item
                label="平台销售价格($)"
                name="salePriceUSD"
                tooltip="该数值用于自动计算商品的利润"
                rules={[
                  { required: true, message: "请输入商品在平台的销售价格" },
                ]}
              >
                <InputNumber min={0} precision={2} />
              </Form.Item>

              <Form.Item
                label="运费预估(￥)"
                name="shippingFeeRMB"
                tooltip="运到目的国所需的运费，该数值用于自动计算商品的利润"
                rules={[{ required: true, message: "请输入运费" }]}
              >
                <InputNumber min={0} precision={2} />
              </Form.Item>

              <Form.Item
                label="平台商品运费($)"
                name="saleShipPriceUSD"
                tooltip="该数值用于自动计算商品的利润"
                rules={[{ required: true, message: "请输入平台运费" }]}
              >
                <InputNumber min={0} precision={2} />
              </Form.Item>
            </Row>
          </Col>
          <Col span={12}>
            <div className={styles["profit-container"]}>
              <div className={styles["profit-container-title"]}>利润试算</div>
              <div className={styles["profit-container-item"]}>
                <span>毛利率</span>
                <span>{profitData.grossProfitMargin || "--"}%</span>
              </div>
              {/* <div className={styles["profit-container-item"]}>
              <span>净利率</span>
              <span>{profitData.netProfitMargin || "--"}%</span>
            </div> */}
              <div className={styles["profit-container-item"]}>
                <span>预估利润</span>
                <span>{profitData.profit || "--"}￥</span>
              </div>
              <Collapse
                size="small"
                items={renderDiscountPanelItems(profitData.profit)}
              />
            </div>
          </Col>
        </Row>
        {/* SKU 编号 */}

        <Form.Item
          label="商品销售链接"
          name="listingLink"
          tooltip="制单时候需要"
          rules={[
            { required: true, message: "请输入商品销售链接，用于制单申报" },
          ]}
        >
          <Input />
        </Form.Item>
        <Space wrap>
          <Form.Item
            label="库存数量"
            name="stock"
            tooltip="商品组没有库存，所有的子商品各自维护库存"
            rules={[{ required: !isGroupMode, message: "请输入库存数量" }]}
          >
            <InputNumber disabled={isGroupMode} min={0} />
          </Form.Item>
          <Form.Item
            label="所属分类"
            name="category"
            rules={[{ required: true, message: "请选择所属货架" }]}
          >
            <Select style={{ width: 200 }} options={productCategoryList} />
          </Form.Item>
        </Space>

        {/* 图片上传 */}
        <Form.Item
          label="商品图片"
          name="images"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[updateImageValidator]}
        >
          <UploadImage changeSubmitBtnLoadings={changeSubmitBtnLoadings} />
        </Form.Item>

        {/* 标签管理 */}
        <Form.Item name="tags" label="商品标签">
          <div className={styles["tag-manager"]}>
            <Select
              mode="tags"
              value={tags}
              onChange={setTags}
              dropdownRender={() => (
                <div className={styles["tag-input-wrapper"]}>
                  <Input
                    value={inputTag}
                    onChange={(e) => setInputTag(e.target.value)}
                    onPressEnter={handleTagAdd}
                    placeholder="输入新标签"
                  />
                  <Button
                    type="link"
                    onClick={handleTagAdd}
                    icon={<PlusOutlined />}
                  >
                    添加
                  </Button>
                </div>
              )}
            />
          </div>
        </Form.Item>

        {/* 备注 */}
        <Form.Item label="备注" name="notes">
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* 独立提交按钮 */}
        {!hideSubmitButton && (
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              submitBtnLoadings={submitBtnLoadings}
              loading={loading}
              block
              size="large"
            >
              {initialValues ? "更新商品" : "创建商品"}
            </Button>
          </Form.Item>
        )}
      </Form>
      {isGroupMode ? (
        <Form form={childrenForm} layout="vertical" onFinish={handleSubmit}>
          <Divider orientation="left">录入子商品</Divider>
          <Form.List name="subProducts">
            {(fields, { key, name, add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  // 获取当前行是否为已存在数据
                  const isExisting = childrenForm.getFieldValue([
                    "subProducts",
                    name,
                    "id",
                  ]);

                  const variantSerial = childrenForm.getFieldValue([
                    "subProducts",
                    name,
                    "variantSerial",
                  ]);
                  console.log(variantSerial, 'variantSerial')

                  return (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="end"
                    >
                      <Form.Item
                        label="子商品图片"
                        name={[name, "images"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[updateImageValidator]}
                      >
                        <UploadImage
                          changeSubmitBtnLoadings={changeSubmitBtnLoadings}
                        />
                      </Form.Item>
                      {/* 商品编号 */}
                      <Form.Item
                        {...restField}
                        label={initialValues?.sku ? initialValues.sku + '-' + variantSerial : ''}
                        name={[name, "variantSerial"]}
                        style={{ width: "100px" }}
                        rules={[
                          {
                            required: true,
                            message: "子商品编号",
                          },
                          {
                            pattern: /^[A-Za-z0-9]*$/,
                            message: "只能输入字母和数字",
                          },
                        ]}
                      >
                        <Input
                          maxLength={6}
                          disabled={isExisting}
                          placeholder="子商品编号"
                        />
                      </Form.Item>

                      {/* 库存数量 */}
                      <Form.Item
                        {...restField}
                        name={[name, "stock"]}
                        rules={[{ required: true, message: "请输入库存数量" }]}
                      >
                        <InputNumber placeholder="库存数量" min={0} />
                      </Form.Item>

                      {/* 删除按钮（当只有一行时禁用） */}
                      <Button
                        style={{ marginBottom: "24px" }}
                        type="text"
                        danger
                        onClick={() => remove(name)}
                      >
                        删除
                      </Button>
                    </Space>
                  );
                })}

                {/* 添加按钮 */}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  style={{ width: "100%" }}
                >
                  添加子商品
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      ) : (
        <></>
      )}
    </>
  );
});

export default ProductForm;

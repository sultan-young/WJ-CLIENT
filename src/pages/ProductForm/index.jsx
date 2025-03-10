import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Space,
  Button,
  message,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { getSuppliers } from "../../services/supplierService";
import "./styles.css";
import axios from "axios";
import {
  createProduct,
  deleteProductImage,
  getUploadProductImageSign,
} from "../../services/productService";
import { getShelfList } from "../../services/shelfList";

const { Option } = Select;

const ProductForm = forwardRef((props, ref) => {
  // 基础配置
  const [form] = Form.useForm();
  const {
    initialValues,
    hideSubmitButton = false,
    onSubmitSuccess,
    toggleSubmitBtnLoadings,
  } = props;

  // 组件状态
  const [fileList, setFileList] = useState([]);
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  // 货架列表
  const [shelfList, setShelfList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUrlList, setImageUrlList] = useState([]);
  const [submitBtnLoadings, setSubmitBtnLoadings] = useState(false);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    submit: async () => {
      await handleSubmit();
    },
    reset: () => form.resetFields(),
    validateFields: async () => {
      const values = await form.validateFields();
      const productData = formatSubmitData(values);
      return productData;
    },
  }));

  // 初始化数据
  useEffect(() => {
    initializeForm();
    loadSuppliers();
    loadShelfList();
  }, []);

  // 初始化表单值
  const initializeForm = () => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setTags(initialValues.tags || []);
      const images = (initialValues.images || []).map(
        ({ url, uid, name, picturebedId }) => ({
          url,
          name,
          status: "done",
          uid,
          picturebedId,
        })
      );
      setFileList(images);
      setImageUrlList(images);
    }
  };

  // 加载供应商数据
  const loadSuppliers = async () => {
    try {
      const res = await getSuppliers();
      setSuppliers(
        res.map((item) => ({
          label: item.name,
          value: item.id,
        }))
      );
    } catch (error) {
      console.error("加载供应商失败:", error);
    }
  };

  // 加载货架数据
  const loadShelfList = async () => {
    try {
      const res = await getShelfList();
      setShelfList(
        res.map((item) => ({
          label: `${item.value}  (${item.label})`,
          value: item.value,
        }))
      );
      setTimeout(() => {
        console.log(shelfList, 111);
      }, 30);
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

  // 格式化提交数据
  const formatSubmitData = (values) => ({
    ...values,
    tags,
    images: imageUrlList,
    suppliers: values.suppliers || [],
    shelf: values.shelf,
  });

  const resetAll = async () => {
    setFileList([]);
    setTags([]);
    setInputTag("");
    setSuppliers([]);
    // 货架列表
    setShelfList([]);
    setLoading(false);
    setImageUrlList([]);
    setSubmitBtnLoadings(false);
    form.resetFields();
  };

  // 提交处理
  const handleSubmit = async () => {
    await form.validateFields();
    try {
      setLoading(true);
      const productData = formatSubmitData(form.getFieldValue());
      await createProduct(productData);
      resetAll()
      onSubmitSuccess?.();
      // if (!initialValues) form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  // 图片上传验证
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) message.error("只能上传图片文件");
    return isImage ? true : Upload.LIST_IGNORE;
  };

  const changeSubmitBtnLoadings = (loading) => {
    setSubmitBtnLoadings(loading);
    toggleSubmitBtnLoadings?.(loading);
  };

  // 自定义上传逻辑
  const customUpload = async ({ file, onSuccess, onError }) => {
    // const sign =
    const sign = await getUploadProductImageSign();
    const formData = new FormData();
    formData.append("file", file); // 添加文件到表单数据
    formData.append("sign", sign.sign);
    formData.append("id", sign.id);
    formData.append("ts", sign.ts);
    formData.append("compress", true);

    changeSubmitBtnLoadings(true);
    // 发起文件上传请求
    axios
      .post(`https://api.superbed.cn/upload`, formData, {})
      .then((data) => {
        const { err, url, msg, id, name, size } = data.data;
        if (err !== 0) {
          message.error(msg);
          throw Error(msg);
        }
        // 假设聚合图床返回的图片地址为 `data.url`
        setImageUrlList([
          ...imageUrlList,
          {
            url,
            picturebedId: id,
            uid: file.uid,
            name,
            size,
          },
        ]);
        onSuccess("Success");
        message.success("图片上传成功！");
      })
      .catch((error) => {
        onError(error);
        message.error("图片上传失败！图床服务器未知错误");
      })
      .finally(() => {
        changeSubmitBtnLoadings(false);
      });
  };

  const onRemoveImage = async (file) => {
    const uid = file.uid;
    const removeImageIds = imageUrlList
      .filter((item) => item.uid === uid)
      .map((item) => item.picturebedId);

    changeSubmitBtnLoadings(true);
    deleteProductImage(removeImageIds)
      .then((res) => {
        const { err, msg: deleteMessage } = res;
        if (err === 0) {
          message.success(deleteMessage);
        } else {
          message.error(deleteMessage);
        }
      })
      .finally(() => {
        changeSubmitBtnLoadings(false);
      });
    const newImageUrlList = imageUrlList.filter((item) => item.uid !== uid);
    setImageUrlList(newImageUrlList);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        stock: 0,
        price: 0,
        shippingFee: 0,
        ...initialValues,
      }}
    >
      {/* 商品名称 */}
      <Form.Item
        label="中文名称"
        name="nameCN"
        rules={[{ required: true, message: "请输入中文名称" }]}
      >
        <Input />
      </Form.Item>

      {/* 供应商选择（仅管理员可见） */}
      {
        <Form.Item
          label="供应商"
          name="suppliers"
          rules={[{ required: true, message: "请至少选择一个供应商" }]}
        >
          <Select
            mode="multiple"
            placeholder="选择供应商"
            options={suppliers}
          />
        </Form.Item>
      }

      {/* 库存和价格 */}
      <Space wrap>
        <Form.Item
          label="库存数量"
          name="stock"
          rules={[{ required: true, message: "请输入库存数量" }]}
        >
          <InputNumber min={0} />
        </Form.Item>

        <Form.Item
          label="商品定价（元）"
          name="price"
          rules={[{ required: true, message: "请输入商品价格" }]}
        >
          <InputNumber min={0} precision={2} />
        </Form.Item>

        <Form.Item
          label="运费（元）"
          name="shippingFee"
          rules={[{ required: true, message: "请输入运费" }]}
        >
          <InputNumber min={0} precision={2} />
        </Form.Item>
      </Space>

      {/* SKU 编号 */}
      <Form.Item
        label="所在货架"
        name="shelf"
        rules={[{ required: true, message: "请选择所属货架" }]}
      >
        <Select style={{ width: 120 }} options={shelfList} />
      </Form.Item>

      {/* 图片上传 */}
      <Form.Item
        label="商品图片"
        names="images"
        rules={[{ required: true, message: "请至少上传一张图片" }]}
      >
        <Upload
          customRequest={customUpload}
          listType="picture-card"
          fileList={fileList}
          beforeUpload={beforeUpload}
          onRemove={onRemoveImage}
          onChange={({ fileList }) => {
            setFileList(fileList);
          }}
          accept="image/*"
          multiple
          maxCount={5}
        >
          {fileList.length >= 5 ? null : (
            <div>
              <UploadOutlined />
              <div>上传图片（最多5张）</div>
            </div>
          )}
        </Upload>
      </Form.Item>

      {/* 标签管理 */}
      <Form.Item label="商品标签">
        <div className="tag-manager">
          <Select
            mode="tags"
            value={tags}
            onChange={setTags}
            dropdownRender={() => (
              <div className="tag-input-wrapper">
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
  );
});

export default ProductForm;

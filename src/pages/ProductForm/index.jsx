import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Upload, 
  Space,
  Button
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { getSuppliers } from '../../services/supplierService';
import './styles.css';

const { Option } = Select;

const ProductForm = forwardRef((props, ref) => {
  // 基础配置
  const [form] = Form.useForm();
  const { 
    initialValues, 
    userType = 'admin', 
    hideSubmitButton = false,
    onSubmitSuccess 
  } = props;

  // 组件状态
  const [fileList, setFileList] = useState([]);
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    submit: async () => {
      try {
        const values = await form.validateFields();
        const productData = formatSubmitData(values);
        return productData;
      } catch (error) {
        throw new Error('表单验证失败');
      }
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
  }, []);

  // 初始化表单值
  const initializeForm = () => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setTags(initialValues.tags || []);
      setFileList((initialValues.images || []).map(url => ({ url })));
    }
  };

  // 加载供应商数据
  const loadSuppliers = async () => {
    if (userType !== 'admin') return;
    
    try {
      const res = await getSuppliers();
      console.log(res, 111)
      setSuppliers(res.data.map(item => ({
        label: item.name,
        value: item.id
      })));
    } catch (error) {
      console.error('加载供应商失败:', error);
    }
  };

  // 处理标签输入
  const handleTagAdd = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags(prev => [...prev, inputTag]);
      setInputTag('');
    }
  };

  // 格式化提交数据
  const formatSubmitData = (values) => ({
    ...values,
    tags,
    images: fileList.map(file => file.url || file.thumbUrl),
    suppliers: values.suppliers || []
  });

  // 提交处理
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const productData = formatSubmitData(values);
      await props.onCreate(productData);
      onSubmitSuccess?.();
      if (!initialValues) form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  // 图片上传验证
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) message.error('只能上传图片文件');
    return isImage ? true : Upload.LIST_IGNORE;
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
        ...initialValues 
      }}
    >
      {/* SKU 编号 */}
      <Form.Item
        label="SKU编号"
        name="sku"
        rules={[{ required: true, message: '请输入SKU编号' }]}
      >
        <Input placeholder="例：SKU-2023001" />
      </Form.Item>

      {/* 供应商选择（仅管理员可见） */}
      {userType === 'admin' && (
        <Form.Item
          label="供应商"
          name="suppliers"
          rules={[{ required: true, message: '请至少选择一个供应商' }]}
        >
          <Select
            mode="multiple"
            placeholder="选择供应商"
            options={suppliers}
          />
        </Form.Item>
      )}

      {/* 商品名称 */}
      <Form.Item
        label="中文名称"
        name="nameCN"
        rules={[{ required: true, message: '请输入中文名称' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="英文名称"
        name="nameEN"
      >
        <Input />
      </Form.Item>

      {/* 库存和价格 */}
      <Space wrap>
        <Form.Item
          label="库存数量"
          name="stock"
          rules={[{ required: true, message: '请输入库存数量' }]}
        >
          <InputNumber min={0} />
        </Form.Item>

        <Form.Item
          label="商品定价（元）"
          name="price"
          rules={[{ required: true, message: '请输入商品价格' }]}
        >
          <InputNumber min={0} precision={2} />
        </Form.Item>

        <Form.Item
          label="运费（元）"
          name="shippingFee"
          rules={[{ required: true, message: '请输入运费' }]}
        >
          <InputNumber min={0} precision={2} />
        </Form.Item>
      </Space>

      {/* 图片上传 */}
      <Form.Item
        label="商品图片"
        rules={[{ required: true, message: '请至少上传一张图片' }]}
      >
        <Upload
          listType="picture-card"
          fileList={fileList}
          beforeUpload={beforeUpload}
          onChange={({ fileList }) => setFileList(fileList)}
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
            loading={loading}
            block
            size="large"
          >
            {initialValues ? '更新商品' : '创建商品'}
          </Button>
        </Form.Item>
      )}
    </Form>
  );
});

export default ProductForm;
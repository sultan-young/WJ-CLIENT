import { useState } from 'react';
import { message } from 'antd';
import ProductForm from '../../components/ProductForm';
import { createProduct } from '../../services/productService';

const ProductFormPage = () => {
  const handleCreate = async (productData) => {
    try {
      await createProduct(productData);
      message.success('商品创建成功');
    } catch (error) {
      message.error('商品创建失败');
      throw error;
    }
  };

  return (
    <div className="form-page-container">
      <h1>录入新商品</h1>
      <ProductForm 
        onCreate={handleCreate}
        onSubmitSuccess={() => {/* 可以添加跳转逻辑 */}}
      />
    </div>
  );
};

export default ProductFormPage;
import { mockProducts } from "../api/mock/products";

// 模拟 API 调用延迟
const fakeDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取商品列表（Mock 实现）
export const getProducts = async (filters = {}) => {
  await fakeDelay(500);
  let data = [...mockProducts];
  
  // 模拟筛选逻辑
  if (filters.sku) {
    data = data.filter(p => p.sku.includes(filters.sku));
  }
  if (filters.supplierId) {
    data = data.filter(p => p.suppliers.includes(filters.supplierId));
  }
  return { data };
};

// 创建商品（Mock 实现）
export const createProduct = async (productData) => {
  await fakeDelay(500);
  const newProduct = { ...productData, id: Date.now().toString() };
  mockProducts.push(newProduct);
  return { data: newProduct };
}


export const deleteProduct = async (productId) => {
    // 模拟删除请求
    await fakeDelay(500);
    return { success: true };
  };
  
  export const updateProduct = async (productData) => {
    // 模拟更新请求
    await fakeDelay(500);
    return { data: productData };
  };
import http from "./http";

// 模拟 API 调用延迟
const fakeDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 获取商品列表（Mock 实现）
export const getProducts = async (filters = "") => {
  console.log(filters, "filter");
  const data = await http.post("products/list");
  return {
    data
  };
};

export const getUploadProductImageSign = async () => {
  const result = await http.post('/products/getUploadImageSign')
  return result;
}

export const deleteProductImage = async (ids) => {
  const result = await http.post('/products/deleteUploadImage', {
    ids,
  })
  return result;
}

// 创建商品（Mock 实现）
export const createProduct = async (productData) => {
  const result = await http.post('/products/create', {
    ...productData,
  })
  return true;
};

// 删除 
export const deleteProduct = async (id) => {
  const result = await http.post('/products/delete', {
    id
  })
  return {
    data: result
  };
};

export const updateProduct = async (productData) => {
  // 模拟更新请求
  const result = await http.post('/products/update', productData)
  return {
    data: result
  };
};


// 查询
export const searchProduct = async (productData) => {
  const result = await http.post('/products/search', productData)
  return {
    result
  };
};
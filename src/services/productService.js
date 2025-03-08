import http from "./http";

// 模拟 API 调用延迟
const fakeDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 获取商品列表（Mock 实现）
export const getProducts = async (filters = "") => {
  console.log(filters, "filter");
  // axios.post()
  // await fakeDelay(200);
  // let data = [...mockProducts];
  // console.log("filters", filters)
  const data = await http.post("products/list");
  return { data };
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

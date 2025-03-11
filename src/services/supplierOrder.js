import http from "./http";

// src/services/supplierService.js
export const createSupplierOrder = async (payload) => {
  try {
    const data = await http.post("/supplierOrder/create", payload);
    return data;
  } catch (error) {}
  // 模拟供应商数据
};

import http from "./http";

// src/services/supplierService.js
export const getShelfList = async () => {
  try {
    const data = await http.post("/shelf/list");
    return data;
  } catch (error) {}
  // 模拟供应商数据
};

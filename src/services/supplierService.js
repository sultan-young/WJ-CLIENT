import { message } from "antd";
import http from "./http";

// src/services/supplierService.js
export const getSuppliers = async () => {
  try {
    const data = await http.post("/supplier/getSupplierList");
    return data;
  } catch (error) {}
  // 模拟供应商数据
  return result.data;
};

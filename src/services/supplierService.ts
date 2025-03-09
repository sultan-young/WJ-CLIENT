import http from "./http";

export interface ISupplier {
  name: string,
  email: string,
  id: string,
  phone: number,
  Role: number
}

// src/services/supplierService.js
export const getSuppliers = async () => {
  try {
    const data: ISupplier[] = await http.post("/supplier/getSupplierList");
    return data;
  } catch (error) {
    return []
  }
  // 模拟供应商数据
};

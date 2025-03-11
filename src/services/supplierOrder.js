import http from "./http";

// src/services/supplierService.js
export const createSupplierOrder = async (payload) => {
  const data = await http.post("/supplierOrder/create", payload);
  return data;
};

export const updateSupplierOrder = async (payload) => {
  const data = await http.post("/supplierOrder/update", payload);
  return data;
};

export const fitchSupplierOrder = async (payload) => {
  const data = await http.post("/supplierOrder/list", payload);
  return data;
};

export const deleteSupplierOrder = async (payload) => {
  const data = await http.post("/supplierOrder/delete", payload);
  return data;
};

export const updateSupplierOrderStatus = async (payload) => {
  const data = await http.post("/supplierOrder/updateStatus", payload);
  return data;
};

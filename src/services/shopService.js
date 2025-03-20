import http from "./http";

export const createShop = async (payload) => {
  const data = await http.post("/shop/create", payload);
  return data;
};

export const getShopList = async () => {
  const data = await http.post("/shop/list");
  return data;
};

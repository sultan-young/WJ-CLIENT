import http from "./http";

export const makeYwOrder = async (payload) => {
  const data = await http.post("/makeOrder/yw", payload);
  return data
};

import axios from "axios";

// 创建基础实例（后续替换为真实接口）
export const http = axios.create({
  baseURL: "/api", // 根据实际部署调整
  timeout: 10000
});

// 请求拦截器（后续添加 JWT）
http.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
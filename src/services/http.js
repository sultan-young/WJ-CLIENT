import axios from "axios";
import { message } from "antd";

// 创建 Axios 实例
const http = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
});

// 请求拦截器（添加 JWT Token）
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器（统一错误处理）
http.interceptors.response.use(
  (response) => {
    const { data, success, message: errorMsg } = response.data;
    if (!success) {
        message.error(errorMsg || '未知错误');

        return Promise.reject(errorMsg)
    }
    return data || []
  },
  (error) => {
    const errorMessage =
      error.response?.message || "请求失败，请稍后重试";
    message.error(errorMessage);
    return Promise.reject(error);
  }
);

export default http;

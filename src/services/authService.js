import axios from 'axios';
import { message } from 'antd';

// 创建 Axios 实例
const http = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
});

// 请求拦截器（添加 JWT Token）
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器（统一错误处理）
http.interceptors.response.use(
  response => response.data,
  error => {
    const errorMessage = error.response?.data?.message || '请求失败，请稍后重试';
    message.error(errorMessage);
    return Promise.reject(error);
  }
);

// 供应商登录
export const supplierLogin = async (credentials) => {
  try {
    const response = await http.post('/auth/login/supplier', {
        supplierId: credentials
    });
    console.log(response, 'response')
    const { token, userInfo } = response.data;

    // 存储 Token 和用户信息
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    return userInfo;
  } catch (error) {
    throw new Error(error.response?.data?.message || '登录失败');
  }
};

// 管理员登录
export const adminLogin = async (credentials) => {
  try {
    const response = await http.post('/auth/admin-login', credentials);
    const { token, user } = response.data;

    // 存储 Token 和用户信息
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  } catch (error) {
    throw new Error(error.response?.data?.message || '登录失败');
  }
};

// 登出
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 获取当前用户信息
export const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user;
};

// 检查是否已登录
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
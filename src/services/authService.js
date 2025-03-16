import { message } from "antd";
import http from "./http";



// 供应商登录
export const supplierLogin = async (credentials) => {
  const response = await http.post('/auth/login/supplier', {
    supplierId: credentials
});
};

// 管理员登录
export const adminLogin = async (credentials) => {
  try {
    const response = await http.post('/auth/login/admin', credentials);
    const { token, userInfo } = response;
    console.log(token, userInfo)
    // 存储 Token 和用户信息
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userInfo || {}));
    message.success('管理员登录成功');

    return response;
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
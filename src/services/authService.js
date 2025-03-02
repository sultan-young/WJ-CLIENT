import http from "./http";



// 供应商登录
export const supplierLogin = async (credentials) => {
  try {
    const response = await http.post('/auth/login/supplier', {
        supplierId: credentials
    });
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
    const response = await http.post('/auth/login/admin', credentials);
    const { token, userInfo } = response.data;

    // 存储 Token 和用户信息
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userInfo || {}));

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
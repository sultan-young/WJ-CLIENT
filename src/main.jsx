import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import App from './App'
import { AuthProvider } from './context/AuthContext';

// 引入 Ant Design 中文语言包
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

// 引入 Ant Design 样式
import 'antd/dist/reset.css'

// 模拟登录状态
const mockAuth = {
  role: 'admin', // 切换为 'supplier' 测试供应商视图
  id: 'user-123'
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider value={{ user: mockAuth }}>
    <App />
  </AuthProvider>
)
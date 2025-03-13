// App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Layout, Menu, Slider, Spin, theme } from "antd";
import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import SupplierLogin from "./pages/SupplierLogin";
import AdminLogin from "./pages/AdminLogin";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { useAuth } from "./context/AuthContext";
import Unauthorized from "./pages/Unauthorized";
import OrderList from "./pages/orders/orderList";
import ShippingCenter from "./pages/ShippingCenter";
import { PreloadDataProvider } from "./context/AppContext";
import './reset.css'

const { Content } = Layout;

// 侧边栏组件
const AppSider = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectKey, setSelectKey] = useState("");

  useEffect(() => {
    if (location.pathname === "/") {
      onClick({ key: "productPool" });
    }
  }, []);

  const onClick = ({ key }) => {
    setSelectKey(key);
    navigate(key);
  };

  const items = [
    {
      key: "productManagement",
      icon: <HomeOutlined />,
      label: "产品管理",
      children: [
        {
          key: "productPool",
          label: "产品池",
        },
      ],
    },
    {
      key: "orderManagement",
      icon: <HomeOutlined />,
      label: "订单管理",
      children: [
        {
          key: "orderList",
          label: "订单管理",
        },
      ],
    },
    {
      key: "shippingCenter",
      icon: <HomeOutlined />,
      label: "面单中心",
      children: [
        {
          key: "shippingList",
          label: "面单中心",
        },
      ],
    },
    {
      key: "about",
      icon: <UserOutlined />,
      label: "About",
    },
  ];

  return (
    <Sider
      theme="light"
      breakpoint="lg"
      collapsedWidth="0"
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <Menu
        defaultOpenKeys={["productManagement"]}
        selectedKeys={[selectKey]}
        mode="inline"
        items={items}
        onClick={(key) => onClick(key)}
      />
    </Sider>
  );
};

const AppLayout = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout
      style={{ minHeight: "100vh", maxHeight: "100vh", overflow: "hidden" }}
    >
      <Header style={{ display: "flex", alignItems: "center" }}>
        <div className="demo-logo" />
        <div style={{ color: "white", fontSize: "16px" }}>
          造物无界库存管理系统
        </div>
      </Header>
      {/* 左侧菜单 */}
      <Layout>
        <AppSider />

        {/* 右侧内容区域 */}
        <Layout>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <PreloadDataProvider>
      <Router>
        <Routes>
          <Route path="" element={<Navigate to="/wj/productPool" replace />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/supplier" element={<SupplierLogin />} />
          <Route path="/unauthorized" element={<Unauthorized />}></Route>
          <Route path="/wj" element={<AppLayout />}>
            <Route path="productPool" element={<ProductList />} />
            <Route path="add-product" element={<ProductForm />} />
            <Route path="orderList" element={<OrderList />} />
            <Route path="shippingList" element={<ShippingCenter />} />
          </Route>
        </Routes>
      </Router>
    </PreloadDataProvider>
  );
}

export default App;

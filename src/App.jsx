// App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Layout, Menu, Slider, theme } from "antd";
import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";
import SupplierLogin from "./pages/SupplierLogin";
import AdminLogin from "./pages/AdminLogin";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import { Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";

const { Content } = Layout;

// 侧边栏组件
const AppSider = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectKey, setSelectKey] = useState("");

  useEffect(() => {
    if ((location.pathname === "/")) {
      onClick({key: 'productPool'})
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
      {/* 左侧菜单 */}
      <AppSider />

      {/* 右侧内容区域 */}
      <Layout>
        <Content>
          <Routes>
            <Route path="/productPool" element={<ProductList />} />
            <Route path="/add-product" element={<ProductForm />} />
            <Route path="/supplier-login" element={<SupplierLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AppLayout></AppLayout>
    </Router>
  );
}

export default App;

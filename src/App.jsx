// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import SupplierLogin from './pages/SupplierLogin';
import AdminLogin from './pages/AdminLogin';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <Layout>
        <Content>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/add-product" element={<ProductForm />} />
            <Route path="/supplier-login" element={<SupplierLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
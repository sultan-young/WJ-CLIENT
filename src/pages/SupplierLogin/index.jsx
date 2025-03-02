import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import './styles.css';
import { supplierLogin } from '../../services/authService';

const SupplierLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // const user = await supplierLogin(values);
      const result = await supplierLogin(values.supplierId)
      // login(user);

      // 登录后重定向到之前访问的页面
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo);
      message.success('登录成功');
    } catch (error) {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="supplier-login">
      <h2>供应商身份校验</h2>
      <Form onFinish={onFinish}>
        <Form.Item
          name="supplierId"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SupplierLogin;
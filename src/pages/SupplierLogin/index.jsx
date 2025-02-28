import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const SupplierLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 模拟登录接口
  const mockLogin = (values) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (values.email === 'supplier@test.com' && values.password === '123456') {
          resolve({ success: true });
        } else {
          resolve({ success: false });
        }
      }, 1000);
    });
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await mockLogin(values);
      
      if (res.success) {
        message.success('登录成功');
        navigate('/'); // 跳转到供应商管理页
      } else {
        message.error('邮箱或密码错误');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="supplier-login">
      <h2>供应商登录</h2>
      <Form
        name="supplier-login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' }
          ]}
        >
          <Input placeholder="请输入注册邮箱" />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6位' }
          ]}
        >
          <Input.Password placeholder="请输入密码" />
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
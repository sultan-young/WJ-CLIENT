import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { adminLogin } from "../../services/authService";

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await adminLogin(values);
      navigate("/wj/productPool"); // 跳转到管理后台
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <h2>管理员登录</h2>
      <Form
        name="admin-login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: "请输入用户名" }]}
        >
          <Input placeholder="请输入管理员账号" />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[
            { required: true, message: "请输入密码" },
            { min: 6, message: "密码至少6位" },
          ]}
        >
          <Input.Password placeholder="请输入管理员密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            管理员登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminLogin;

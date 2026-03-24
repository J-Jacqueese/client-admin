import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const AUTH_STORAGE_KEY = 'client_admin_auth';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1234567890';

export default function LoginPage() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setSubmitting(true);
    try {
      const { username, password } = values;
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        message.error('账号或密码错误');
        return;
      }

      localStorage.setItem(AUTH_STORAGE_KEY, '1');
      message.success('登录成功');
      navigate('/dashboard', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <Card style={{ width: 420 }}>
        <div className="text-center mb-6">
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            后台管理员登录
          </Typography.Title>
          <Typography.Text type="secondary">
            请输入管理员账号密码
          </Typography.Text>
        </div>

        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入账号" autoComplete="username" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" autoComplete="current-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={submitting}>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}

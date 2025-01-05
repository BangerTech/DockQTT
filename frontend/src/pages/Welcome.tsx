import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Switch, Typography, theme } from 'antd';
import { ConnectionConfig } from '../types';
import { WifiOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConnect = async (values: ConnectionConfig) => {
    setLoading(true);
    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();

      if (response.ok) {
        navigate('/dashboard');
      } else {
        throw new Error(data.message || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      // Verwende notification statt message für bessere UX
      notification.error({
        message: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to broker',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: token.colorBgLayout,
      padding: '24px',
    }}>
      <Card 
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadow,
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <WifiOutlined style={{ 
            fontSize: '48px', 
            color: token.colorPrimary,
            marginBottom: '16px' 
          }} />
          <Title level={2} style={{ margin: 0 }}>
            MQTT Explorer
          </Title>
          <Text type="secondary">
            Connect to your MQTT broker
          </Text>
        </div>

        <Form
          name="connection"
          onFinish={handleConnect}
          layout="vertical"
          initialValues={{
            url: 'localhost',
            port: 1883
          }}
          requiredMark={false}
        >
          <Form.Item
            label="Broker URL"
            name="url"
            rules={[{ required: true, message: 'Please enter broker URL' }]}
          >
            <Input 
              placeholder="localhost"
              size="large"
              style={{ borderRadius: token.borderRadius }}
            />
          </Form.Item>

          <Form.Item
            label="Port"
            name="port"
            rules={[{ required: true, message: 'Please enter port number' }]}
          >
            <Input 
              type="number" 
              placeholder="1883"
              size="large"
              style={{ borderRadius: token.borderRadius }}
            />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
          >
            <Input 
              placeholder="Optional"
              size="large"
              style={{ borderRadius: token.borderRadius }}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
          >
            <Input.Password 
              placeholder="Optional"
              size="large"
              style={{ borderRadius: token.borderRadius }}
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item
            name="save"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Save connection"
              unCheckedChildren="Don't save"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: token.borderRadius,
                fontWeight: 500,
              }}
            >
              Connect
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}; 
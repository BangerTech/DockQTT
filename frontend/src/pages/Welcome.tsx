import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Switch, message } from 'antd';
import { ConnectionConfig } from '../types';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConnect = async (values: ConnectionConfig) => {
    setLoading(true);
    try {
      // API call to connect to broker
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        message.success('Connected successfully!');
        navigate('/dashboard');
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      message.error('Failed to connect to broker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-container">
      <Card className="connection-card">
        <h1>MQTT Web Explorer</h1>
        <Form
          name="connection"
          onFinish={handleConnect}
          layout="vertical"
        >
          <Form.Item
            label="Broker URL"
            name="url"
            rules={[{ required: true }]}
          >
            <Input placeholder="mqtt://localhost" />
          </Form.Item>

          <Form.Item
            label="Port"
            name="port"
            rules={[{ required: true }]}
          >
            <Input type="number" placeholder="1883" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="save"
            valuePropName="checked"
          >
            <Switch checkedChildren="Save connection" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Connect
          </Button>
        </Form>
      </Card>
    </div>
  );
}; 
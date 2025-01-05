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
      console.log('Connecting with config:', values);  // Debug-Log
      
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      console.log('Connection response:', data);  // Debug-Log

      if (response.ok) {
        message.success('Connected successfully!');
        navigate('/dashboard');
      } else {
        throw new Error(data.message || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      message.error(error instanceof Error ? error.message : 'Failed to connect to broker');
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
          initialValues={{
            url: 'localhost',
            port: 1883
          }}
        >
          <Form.Item
            label="Broker URL"
            name="url"
            rules={[{ required: true }]}
          >
            <Input placeholder="localhost" />
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
            <Input.Password autoComplete="current-password" />
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
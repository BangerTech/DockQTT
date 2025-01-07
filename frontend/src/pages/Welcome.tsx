import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Switch, Typography, theme, Select, notification, Space } from 'antd';
import { ConnectionConfig } from '../types';
import { WifiOutlined, MoonOutlined, SunOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMqttStore } from '../store/mqttStore';
import '../styles/ThemeToggle.css';
import { ThemeSwitch } from '../components/ThemeSwitch';
import dockqttLogo from '../images/dockqtt.png';

const { Title, Text } = Typography;
const { Option } = Select;

interface ConnectionConfig {
  id?: string;
  url: string;
  port: number;
  username?: string;
  password?: string;
  save?: boolean;
}

export const Welcome: React.FC<{ darkMode: boolean, setDarkMode: (mode: boolean) => void }> = ({ darkMode, setDarkMode }) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savedConnections, setSavedConnections] = useState<ConnectionConfig[]>([]);
  const [form] = Form.useForm();
  const { setConnected, setCurrentConnection } = useMqttStore();

  useEffect(() => {
    const connections = localStorage.getItem('mqttConnections');
    if (connections) {
      setSavedConnections(JSON.parse(connections));
    }
  }, []);

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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Connection failed');
      }

      const data = await response.json();

      if (data.success) {
        if (values.save) {
          const newConnection = {
            ...values,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          const newConnections = [...savedConnections, newConnection];
          setSavedConnections(newConnections);
          localStorage.setItem('mqttConnections', JSON.stringify(newConnections));
        }
        setConnected(true);
        setCurrentConnection(values);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Connection error:', error);
      notification.error({
        message: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to broker',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = (idToDelete: string) => {
    const newConnections = savedConnections.filter(conn => conn.id !== idToDelete);
    setSavedConnections(newConnections);
    localStorage.setItem('mqttConnections', JSON.stringify(newConnections));
    
    // Reset form if the currently selected connection is deleted
    const currentId = form.getFieldValue('savedConnection');
    if (currentId === idToDelete) {
      form.resetFields();
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
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '24px',
        maxWidth: 'calc(440px + 48px)',
        width: '100%',
      }}>
        <Card 
          style={{
            width: '100%',
            maxWidth: '440px',
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadow,
            padding: '32px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img 
              src={dockqttLogo} 
              alt="DockQTT Logo" 
              style={{ 
                height: '53px',
                marginBottom: '16px',
                display: 'block',
                margin: '0 auto 16px auto',
                imageRendering: 'crisp-edges',
              }} 
            />
            <Text type="secondary" style={{ display: 'block' }}>
              Connect to your MQTT broker
            </Text>
          </div>

          <Form
            form={form}
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

            <Form.Item
              label="Saved Connections"
              name="savedConnection"
            >
              <Select
                placeholder="Select a saved connection"
                onChange={(value) => {
                  const connection = savedConnections.find(conn => conn.id === value);
                  if (connection) {
                    form.setFieldsValue({
                      url: connection.url,
                      port: connection.port,
                      username: connection.username,
                      password: connection.password,
                    });
                  }
                }}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <style>
                      {`
                        .connection-item {
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          padding: 8px 12px;
                        }
                        .delete-icon {
                          visibility: hidden;
                        }
                        .connection-item:hover .delete-icon {
                          visibility: visible;
                        }
                      `}
                    </style>
                  </div>
                )}
              >
                {savedConnections.map((conn) => (
                  <Option key={conn.id} value={conn.id}>
                    <div className="connection-item">
                      <span>{conn.url}:{conn.port}</span>
                      <DeleteOutlined
                        className="delete-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConnection(conn.id!);
                        }}
                        style={{
                          color: token.colorError,
                          fontSize: '16px',
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </Option>
                ))}
              </Select>
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

        <ThemeSwitch 
          darkMode={darkMode} 
          onChange={setDarkMode}
          style={{ marginLeft: 'auto' }}
        />
      </div>
    </div>
  );
}; 
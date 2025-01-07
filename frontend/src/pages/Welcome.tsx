import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  Switch, 
  Typography, 
  theme, 
  Select, 
  notification, 
  Space,
  Tabs
} from 'antd';
import { 
  WifiOutlined, 
  CloudServerOutlined,
  DeleteOutlined,
  SaveOutlined,
  StopOutlined
} from '@ant-design/icons';
import { ConnectionConfig } from '../types';
import { useMqttStore } from '../store/mqttStore';
import { ThemeSwitch } from '../components/ThemeSwitch';
import dockqttLogo from '../images/dockqtt.png';
import { useTheme } from '../hooks/useTheme';
import './Welcome.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const SaveCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => {
  return (
    <label className="save-checkbox-container">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="save-checkbox-custom">
        <SaveOutlined className="save-icon" />
      </div>
      <span className="save-checkbox-label">
        {checked ? 'Save Connection' : "Don't Save"}
      </span>
    </label>
  );
};

const ConnectTab: React.FC<{
  loading: boolean;
  savedConnections: ConnectionConfig[];
  onConnect: (values: ConnectionConfig) => void;
  onDeleteConnection: (id: string) => void;
}> = ({ loading, savedConnections, onConnect, onDeleteConnection }) => {
  const [form] = Form.useForm();
  const { token } = theme.useToken();

  return (
    <Form
      form={form}
      name="connection"
      onFinish={onConnect}
      layout="vertical"
      initialValues={{
        url: 'localhost',
        port: 1883,
        save: true
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
        initialValue={true}
      >
        <SaveCheckbox
          checked={form.getFieldValue('save') ?? true}
          onChange={(checked) => form.setFieldsValue({ save: checked })}
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
                    onDeleteConnection(conn.id!);
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
  );
};

const HostTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [brokerStatus, setBrokerStatus] = useState<'stopped' | 'running'>('stopped');
  const [config, setConfig] = useState({
    port: 1883,
    wsPort: 9001,
    allowAnonymous: true,
    username: '',
    password: '',
  });

  useEffect(() => {
    // Hole den aktuellen Status des Brokers
    fetch('/api/broker/status')
      .then(res => res.json())
      .then(data => {
        setBrokerStatus(data.running ? 'running' : 'stopped');
      });
  }, []);

  const handleStartBroker = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/broker/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to start broker');
      }

      setBrokerStatus('running');
      notification.success({
        message: 'Broker Started',
        description: 'MQTT Broker is now running',
      });
    } catch (error) {
      notification.error({
        message: 'Failed to Start Broker',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStopBroker = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/broker/stop', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to stop broker');
      }

      setBrokerStatus('stopped');
      notification.success({
        message: 'Broker Stopped',
        description: 'MQTT Broker has been stopped',
      });
    } catch (error) {
      notification.error({
        message: 'Failed to Stop Broker',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" requiredMark={false}>
      <Form.Item label="MQTT Port" name="port">
        <Input
          type="number"
          value={config.port}
          onChange={e => setConfig(prev => ({ ...prev, port: Number(e.target.value) }))}
        />
      </Form.Item>

      <Form.Item label="WebSocket Port" name="wsPort">
        <Input
          type="number"
          value={config.wsPort}
          onChange={e => setConfig(prev => ({ ...prev, wsPort: Number(e.target.value) }))}
        />
      </Form.Item>

      <Form.Item label="Allow Anonymous" name="allowAnonymous">
        <Switch
          checked={config.allowAnonymous}
          onChange={checked => setConfig(prev => ({ ...prev, allowAnonymous: checked }))}
        />
      </Form.Item>

      {!config.allowAnonymous && (
        <>
          <Form.Item label="Username" name="username">
            <Input
              value={config.username}
              onChange={e => setConfig(prev => ({ ...prev, username: e.target.value }))}
            />
          </Form.Item>

          <Form.Item label="Password" name="password">
            <Input.Password
              value={config.password}
              onChange={e => setConfig(prev => ({ ...prev, password: e.target.value }))}
            />
          </Form.Item>
        </>
      )}

      <Form.Item>
        <Button
          type="primary"
          onClick={brokerStatus === 'stopped' ? handleStartBroker : handleStopBroker}
          loading={loading}
          icon={<CloudServerOutlined />}
          danger={brokerStatus === 'running'}
          block
        >
          {brokerStatus === 'stopped' ? 'Start Broker' : 'Stop Broker'}
        </Button>
      </Form.Item>

      {brokerStatus === 'running' && (
        <Text type="success">
          Broker is running on port {config.port} (MQTT) and {config.wsPort} (WebSocket)
        </Text>
      )}
    </Form>
  );
};

export const Welcome: React.FC = () => {
  const { darkMode, setDarkMode } = useTheme();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savedConnections, setSavedConnections] = useState<ConnectionConfig[]>([]);
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

  return (
    <div className="welcome-container">
      <Card className="welcome-card">
        <div className="card-header">
          <img src={dockqttLogo} alt="DockQTT Logo" className="logo" />
          <ThemeSwitch darkMode={darkMode} onChange={setDarkMode} />
        </div>

        <Tabs defaultActiveKey="connect">
          <TabPane 
            tab={<span><WifiOutlined /> Connect to Broker</span>} 
            key="connect"
          >
            <ConnectTab
              loading={loading}
              savedConnections={savedConnections}
              onConnect={handleConnect}
              onDeleteConnection={(id) => {
                const newConnections = savedConnections.filter(conn => conn.id !== id);
                setSavedConnections(newConnections);
                localStorage.setItem('mqttConnections', JSON.stringify(newConnections));
              }}
            />
          </TabPane>
          <TabPane 
            tab={<span><CloudServerOutlined /> Host Broker</span>} 
            key="host"
          >
            <HostTab />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}; 
import React from 'react';
import { Layout, Typography, theme, Badge, Button, Space, Card } from 'antd';
import { TopicTree } from '../components/TopicTree';
import { MessageViewer } from '../components/MessageViewer';
import { useMqttStore } from '../store/mqttStore';
import { DisconnectOutlined } from '@ant-design/icons';
import { useWebSocket } from '../hooks/useWebSocket';
import { ThemeSwitch } from '../components/ThemeSwitch';
import '../styles/ThemeSwitch.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export const Dashboard: React.FC<{ darkMode: boolean, setDarkMode: (mode: boolean) => void }> = ({ darkMode, setDarkMode }) => {
  const { token } = theme.useToken();
  const { topicMessages, selectedTopic, connected, disconnect, currentConnection } = useMqttStore();
  useWebSocket();

  return (
    <Layout style={{ height: '100vh', background: token.colorBgContainer }}>
      <Header style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 24px',
        background: token.colorBgElevated,
        borderBottom: `1px solid ${token.colorBorder}`,
        height: '64px',
      }}>
        <Space>
          <Badge status={connected ? 'success' : 'error'} text={connected ? 'Connected' : 'Disconnected'} />
          {currentConnection && (
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {currentConnection.url}:{currentConnection.port}
              {currentConnection.username && ` (${currentConnection.username})`}
            </Text>
          )}
          <Button 
            type="link" 
            icon={<DisconnectOutlined />} 
            onClick={disconnect}
            disabled={!connected}
          >
            Disconnect
          </Button>
        </Space>

        <Title level={3} style={{ 
          margin: 0, 
          color: token.colorText,
          textAlign: 'center',
        }}>
          MQTT Explorer
        </Title>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end'
        }}>
          <ThemeSwitch darkMode={darkMode} onChange={setDarkMode} />
        </div>
      </Header>

      <Layout style={{ padding: '24px', height: 'calc(100vh - 64px)' }}>
        <div style={{ 
          display: 'flex', 
          gap: '24px',
          height: '100%',
          overflow: 'hidden',
        }}>
          <Card
            style={{
              width: '320px',
              borderRadius: token.borderRadiusLG,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
              background: token.colorBgContainer,
              height: '100%',
              overflow: 'auto',
            }}
            bodyStyle={{ 
              padding: '16px',
              height: '100%',
            }}
          >
            <TopicTree messages={topicMessages} />
          </Card>
          <Card
            style={{
              flex: 1,
              borderRadius: token.borderRadiusLG,
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
              background: token.colorBgContainer,
              height: '100%',
              overflow: 'auto',
            }}
            bodyStyle={{ 
              padding: '16px',
              height: '100%',
            }}
          >
            {selectedTopic ? (
              <MessageViewer />
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: token.colorTextSecondary,
                fontSize: '16px',
              }}>
                Select a topic to view messages
              </div>
            )}
          </Card>
        </div>
      </Layout>
    </Layout>
  );
}; 
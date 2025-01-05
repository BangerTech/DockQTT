import React from 'react';
import { Layout, Typography, theme, Badge, Button } from 'antd';
import { TopicTree } from '../components/TopicTree';
import { MessageViewer } from '../components/MessageViewer';
import { useMqttStore } from '../store/mqttStore';
import { DisconnectOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useWebSocket } from '../hooks/useWebSocket';
import { ThemeSwitch } from '../components/ThemeSwitch';
import '../styles/ThemeSwitch.css';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

export const Dashboard: React.FC<{ darkMode: boolean, setDarkMode: (mode: boolean) => void }> = ({ darkMode, setDarkMode }) => {
  const { token } = theme.useToken();
  const { topicMessages, selectedTopic, connected, disconnect, currentConnection } = useMqttStore();
  useWebSocket();

  return (
    <Layout style={{ height: '100vh', background: token.colorBgContainer }}>
      <Sider 
        width={320} 
        style={{
          background: token.colorBgElevated,
          borderRight: `1px solid ${token.colorBorder}`,
          height: '100vh',
          position: 'fixed',
          left: 0,
          overflow: 'auto',
        }}
      >
        <div style={{ 
          padding: '16px',
          borderBottom: `1px solid ${token.colorBorder}`,
          position: 'sticky',
          top: 0,
          background: token.colorBgElevated,
          zIndex: 1,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <Title level={4} style={{ margin: 0 }}>MQTT Explorer</Title>
            <ThemeSwitch 
              darkMode={darkMode} 
              onChange={setDarkMode}
            />
          </div>
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <Badge status={connected ? 'success' : 'error'} text={connected ? 'Connected' : 'Disconnected'} />
              <Button 
                type="link" 
                icon={<DisconnectOutlined />} 
                onClick={disconnect}
                disabled={!connected}
              >
                Disconnect
              </Button>
            </div>
            {currentConnection && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {currentConnection.url}:{currentConnection.port}
                {currentConnection.username && ` (${currentConnection.username})`}
              </Text>
            )}
          </div>
        </div>
        <TopicTree messages={topicMessages} />
      </Sider>
      
      <Layout style={{ marginLeft: 320 }}>
        <Content style={{ 
          padding: '24px',
          minHeight: '100vh',
          background: token.colorBgContainer,
        }}>
          {selectedTopic ? (
            <MessageViewer />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 48px)',
              color: token.colorTextSecondary,
              fontSize: '16px',
            }}>
              Select a topic to view messages
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}; 
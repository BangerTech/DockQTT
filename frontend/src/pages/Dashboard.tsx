import React from 'react';
import { Layout, Typography, theme } from 'antd';
import { TopicTree } from '../components/TopicTree';
import { MessageViewer } from '../components/MessageViewer';
import { useMqttStore } from '../store/mqttStore';

const { Content, Sider } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { token } = theme.useToken();
  const { topicMessages, selectedTopic } = useMqttStore();

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
          <Title level={4} style={{ margin: 0 }}>MQTT Explorer</Title>
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
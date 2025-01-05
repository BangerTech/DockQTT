import React from 'react';
import { Layout, Typography } from 'antd';
import { TopicTree } from '../components/TopicTree';
import { MessageViewer } from '../components/MessageViewer';
import { useMqttStore } from '../store/mqttStore';

const { Content, Sider, Header } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { messages, topicMessages } = useMqttStore();

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Title level={4} style={{ margin: 0 }}>MQTT Explorer</Title>
      </Header>
      <Layout>
        <Sider 
          width={400} 
          theme="light"
          style={{
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
          }}
        >
          <TopicTree messages={topicMessages} />
        </Sider>
        <Layout>
          <Content style={{ 
            padding: '24px',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
          }}>
            <MessageViewer />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}; 
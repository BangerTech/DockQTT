import React, { useEffect } from 'react';
import { Layout, Tree, Card, Select, Typography } from 'antd';
import { useMqttStore } from '../store/mqttStore';
import { MessageViewer } from '../components/MessageViewer';
import { TopicTree } from '../components/TopicTree';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { 
    connected, 
    selectedTopic, 
    viewMode, 
    setViewMode, 
    messages 
  } = useMqttStore();

  useEffect(() => {
    if (!connected) {
      // Redirect to welcome if not connected
      window.location.href = '/';
    }
  }, [connected]);

  return (
    <Layout className="dashboard-container">
      <Header className="dashboard-header">
        <Title level={4}>MQTT Web Explorer</Title>
        <Select
          value={viewMode}
          onChange={setViewMode}
          options={[
            { label: 'Raw', value: 'raw' },
            { label: 'JSON', value: 'json' },
            { label: 'Table', value: 'table' },
          ]}
        />
      </Header>
      
      <Layout>
        <Sider width={300} className="dashboard-sider">
          <TopicTree />
        </Sider>
        
        <Content className="dashboard-content">
          {selectedTopic ? (
            <MessageViewer 
              messages={messages[selectedTopic] || []}
              viewMode={viewMode}
            />
          ) : (
            <Card>Select a topic to view messages</Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}; 
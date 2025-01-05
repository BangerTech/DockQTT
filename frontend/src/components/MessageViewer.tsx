import React from 'react';
import { Table, Typography, theme } from 'antd';
import { useMqttStore } from '../store/mqttStore';

const { Title } = Typography;

export const MessageViewer: React.FC = () => {
  const { token } = theme.useToken();
  const { messages, selectedTopic } = useMqttStore();
  
  const filteredMessages = messages.filter(msg => msg.topic === selectedTopic);

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: '200px',
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
    },
    {
      title: 'Payload',
      dataIndex: 'payload',
      key: 'payload',
      render: (payload: string) => (
        <div style={{ 
          maxHeight: '100px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          padding: '8px 0',
        }}>
          {payload}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: '24px' }}>
        Messages for topic: {selectedTopic}
      </Title>
      <Table
        dataSource={filteredMessages.map((msg, index) => ({ ...msg, key: index }))}
        columns={columns}
        pagination={{ pageSize: 50 }}
        size="middle"
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
        }}
      />
    </div>
  );
}; 
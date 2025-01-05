import React from 'react';
import { Table, Typography, theme, Card, Empty } from 'antd';
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
          fontSize: '14px',
          lineHeight: '1.6',
          color: token.colorText,
        }}>
          {payload}
        </div>
      ),
    },
  ];

  return (
    <Card
      style={{
        height: '100%',
        borderRadius: token.borderRadiusLG,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        background: token.colorBgContainer,
      }}
      bodyStyle={{
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <Title 
          level={4} 
          style={{ 
            margin: 0,
            color: token.colorTextHeading,
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          {selectedTopic ? `Messages for topic: ${selectedTopic}` : 'Select a topic to view messages'}
        </Title>
      </div>

      {selectedTopic ? (
        <Table
          dataSource={filteredMessages.map((msg, index) => ({ ...msg, key: index }))}
          columns={columns}
          pagination={{ 
            pageSize: 50,
            hideOnSinglePage: true,
            style: { marginBottom: 0 }
          }}
          size="middle"
          style={{
            flex: 1,
            minHeight: 0,
          }}
          scroll={{ y: 'calc(100vh - 260px)' }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No messages yet"
              />
            ),
          }}
        />
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Empty
            description="Select a topic from the tree to view messages"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      )}
    </Card>
  );
}; 
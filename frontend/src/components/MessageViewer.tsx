import React, { useState } from 'react';
import { Table, Typography, theme, Card, Select, Space } from 'antd';
import { useMqttStore } from '../store/mqttStore';
import { MessageFormatter } from './MessageFormatter';

const { Title } = Typography;
const { Option } = Select;

type MessageFormat = 'raw' | 'json' | 'human';

export const MessageViewer: React.FC = () => {
  const { token } = theme.useToken();
  const { messages, selectedTopic } = useMqttStore();
  const [messageFormat, setMessageFormat] = useState<MessageFormat>('raw');
  
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
      render: (payload: any) => (
        <MessageFormatter message={payload} format={messageFormat} />
      ),
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px' 
      }}>
        <Title level={4} style={{ margin: 0 }}>
          Messages for topic: {selectedTopic}
        </Title>
        <Space>
          <span>Format:</span>
          <Select
            value={messageFormat}
            onChange={setMessageFormat}
            style={{ width: 120 }}
          >
            <Option value="raw">Raw</Option>
            <Option value="json">JSON</Option>
            <Option value="human">Human Readable</Option>
          </Select>
        </Space>
      </div>
      
      <Table
        dataSource={filteredMessages.map((msg, index) => ({ ...msg, key: index }))}
        columns={columns}
        pagination={{ 
          pageSize: 50,
          hideOnSinglePage: true,
          style: { marginBottom: 0 }
        }}
        scroll={{ y: 'calc(100vh - 260px)' }}
      />
    </div>
  );
}; 
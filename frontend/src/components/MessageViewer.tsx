import React from 'react';
import { Table } from 'antd';
import { useMqttStore } from '../store/mqttStore';

export const MessageViewer: React.FC = () => {
  const messages = useMqttStore((state) => state.messages);

  const columns = [
    {
      title: 'Topic',
      dataIndex: 'topic',
      key: 'topic',
      width: '30%',
      ellipsis: true,
    },
    {
      title: 'Payload',
      dataIndex: 'payload',
      key: 'payload',
      width: '50%',
      render: (payload: string) => (
        <div style={{ 
          maxHeight: '100px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {payload}
        </div>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: '20%',
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
    },
  ];

  return (
    <Table
      dataSource={messages.map((msg, index) => ({ ...msg, key: index }))}
      columns={columns}
      pagination={{ pageSize: 50 }}
      size="small"
      scroll={{ y: 'calc(100vh - 180px)' }}
    />
  );
}; 
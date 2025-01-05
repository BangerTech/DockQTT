import React from 'react';
import { Table, Typography } from 'antd';
import { MqttMessage } from '../types';

const { Text } = Typography;

interface Props {
  messages: MqttMessage[];
  viewMode: 'raw' | 'json' | 'table';
}

export const MessageViewer: React.FC<Props> = ({ messages, viewMode }) => {
  const formatMessage = (message: MqttMessage) => {
    try {
      switch (viewMode) {
        case 'json':
          return typeof message.payload === 'string' 
            ? JSON.stringify(JSON.parse(message.payload), null, 2)
            : JSON.stringify(message.payload, null, 2);
        case 'raw':
          return message.payload;
        case 'table':
          return typeof message.payload === 'string'
            ? JSON.parse(message.payload)
            : message.payload;
        default:
          return message.payload;
      }
    } catch {
      return message.payload;
    }
  };

  if (viewMode === 'table') {
    const columns = [
      {
        title: 'Timestamp',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (timestamp: number) => new Date(timestamp).toLocaleString(),
      },
      {
        title: 'Topic',
        dataIndex: 'topic',
        key: 'topic',
      },
      {
        title: 'Payload',
        dataIndex: 'payload',
        key: 'payload',
        render: (_: any, record: MqttMessage) => (
          <pre>{formatMessage(record)}</pre>
        ),
      },
    ];

    return (
      <Table
        dataSource={messages}
        columns={columns}
        rowKey="timestamp"
        pagination={{ pageSize: 50 }}
      />
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.timestamp} className="message-item">
          <Text type="secondary">
            {new Date(message.timestamp).toLocaleString()}
          </Text>
          <pre>{formatMessage(message)}</pre>
        </div>
      ))}
    </div>
  );
}; 
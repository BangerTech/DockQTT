import React from 'react';
import { Select, Typography } from 'antd';
import { MqttMessage } from '../types';

const { Text } = Typography;

interface MessageFormatterProps {
  message: any;
  format: 'raw' | 'json' | 'human';
}

const formatMessage = (message: any, format: 'raw' | 'json' | 'human'): string => {
  try {
    switch (format) {
      case 'json':
        return typeof message === 'object' 
          ? JSON.stringify(message, null, 2)
          : JSON.stringify(JSON.parse(message), null, 2);
      case 'human':
        const obj = typeof message === 'object' ? message : JSON.parse(message);
        return Object.entries(obj)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      case 'raw':
      default:
        return typeof message === 'string' ? message : JSON.stringify(message);
    }
  } catch (e) {
    return String(message);
  }
};

export const MessageFormatter: React.FC<MessageFormatterProps> = ({ message, format }) => {
  return (
    <pre style={{
      margin: 0,
      padding: '8px',
      background: 'rgba(0, 0, 0, 0.02)',
      borderRadius: '4px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      <Text style={{ fontFamily: 'monospace' }}>
        {formatMessage(message, format)}
      </Text>
    </pre>
  );
}; 
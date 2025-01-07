import React from 'react';
import { Card, Tabs, Typography, Space } from 'antd';
import './TopicDetails.css';

const { TabPane } = Tabs;
const { Text } = Typography;

interface TopicDetailsProps {
  topic: string;
  payload: any;
  timestamp: string;
  retained: boolean;
  qos: number;
}

export const TopicDetails: React.FC<TopicDetailsProps> = ({
  topic,
  payload,
  timestamp,
  retained,
  qos,
}) => {
  const isJson = typeof payload === 'object';

  const renderJson = (data: any) => {
    return (
      <pre className="json-view">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <Card className="topic-details">
      <div className="topic-header">
        <Text strong>Topic: </Text>
        <Text code>{topic}</Text>
      </div>
      
      <Tabs defaultActiveKey="payload">
        <TabPane tab="Payload" key="payload">
          {isJson ? (
            renderJson(payload)
          ) : (
            <pre className="raw-payload">{payload}</pre>
          )}
        </TabPane>
        <TabPane tab="Metadata" key="metadata">
          <Space direction="vertical" className="metadata">
            <div className="metadata-item">
              <Text strong>Timestamp: </Text>
              <Text>{new Date(timestamp).toLocaleString()}</Text>
            </div>
            <div className="metadata-item">
              <Text strong>Retained: </Text>
              <Text>{retained ? 'Yes' : 'No'}</Text>
            </div>
            <div className="metadata-item">
              <Text strong>QoS: </Text>
              <Text>{qos}</Text>
            </div>
          </Space>
        </TabPane>
      </Tabs>
    </Card>
  );
}; 
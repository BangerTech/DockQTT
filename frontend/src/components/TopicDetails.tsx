import React, { useState } from 'react';
import { Card, Tabs, Typography, Table, Tag, Space } from 'antd';
import { TopicNode } from '../types';
import { formatTimestamp } from '../utils/topicUtils';
import './TopicDetails.css';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

interface TopicDetailsProps {
  topic: TopicNode;
}

export const TopicDetails: React.FC<TopicDetailsProps> = ({ topic }) => {
  const [activeTab, setActiveTab] = useState('latest');

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => formatTimestamp(new Date(timestamp).getTime()),
    },
    {
      title: 'Payload',
      dataIndex: 'payload',
      key: 'payload',
      render: (payload: any) => {
        if (typeof payload === 'object') {
          return (
            <pre className="json-payload">
              {JSON.stringify(payload, null, 2)}
            </pre>
          );
        }
        return String(payload);
      },
    },
    {
      title: 'QoS',
      dataIndex: 'qos',
      key: 'qos',
      width: 80,
      render: (qos: number) => <Tag color="blue">{qos}</Tag>,
    },
    {
      title: 'Retained',
      dataIndex: 'retain',
      key: 'retain',
      width: 100,
      render: (retain: boolean) => (
        <Tag color={retain ? 'green' : 'default'}>
          {retain ? 'Yes' : 'No'}
        </Tag>
      ),
    },
  ];

  return (
    <Card className="topic-details">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={4}>{topic.path}</Title>
          <Text type="secondary">
            Last update: {formatTimestamp(topic.lastUpdate)}
          </Text>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Latest Message" key="latest">
            {topic.messages[0] && (
              <pre className="json-payload">
                {JSON.stringify(topic.messages[0].payload, null, 2)}
              </pre>
            )}
          </TabPane>
          <TabPane tab="History" key="history">
            <Table 
              dataSource={topic.messages}
              columns={columns}
              rowKey="timestamp"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          </TabPane>
        </Tabs>
      </Space>
    </Card>
  );
}; 
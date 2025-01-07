import React, { useState } from 'react';
import { Card, Tabs, Typography, Table, Tag, Space, Radio } from 'antd';
import { 
  ApiOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  WifiOutlined,
  PoweroffOutlined,
  BulbOutlined,
  BarChartOutlined,
  CloudOutlined
} from '@ant-design/icons';
import { TopicNode } from '../types';
import { formatTimestamp, formatTopicValue, detectValueType } from '../utils/topicUtils';
import './TopicDetails.css';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { Switch } from 'antd';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

interface TopicDetailsProps {
  topic: TopicNode;
}

const ValueDisplay: React.FC<{ value: any, unit?: string, type: string }> = ({ value, unit, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'temperature':
        return <DashboardOutlined />;
      case 'illuminance':
        return <BulbOutlined />;
      case 'humidity':
        return <CloudOutlined />;
      case 'power':
        return <PoweroffOutlined />;
      case 'pressure':
        return <BarChartOutlined />;
      case 'signal':
        return <WifiOutlined />;
      case 'distance':
        return <EnvironmentOutlined />;
      default:
        return <ApiOutlined />;
    }
  };

  const formatValue = (val: any) => {
    if (typeof val === 'number') {
      return val.toFixed(1);
    }
    return val;
  };

  return (
    <div className="sensor-value">
      <span className="sensor-icon">{getIcon()}</span>
      <span className="value">{formatValue(value)}</span>
      {unit && <span className="unit">{unit}</span>}
    </div>
  );
};

export const TopicDetails: React.FC<TopicDetailsProps> = ({ topic }) => {
  const [viewMode, setViewMode] = useState<'raw' | 'json' | 'human' | 'chart'>('human');

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

  const renderHumanContent = () => {
    const message = topic.messages[0];
    if (!message) return null;

    const { type, unit } = detectValueType(topic.path, message.payload);
    
    switch (topic.type) {
      case 'switch':
        return (
          <Switch 
            checked={message.payload === true || message.payload === 'ON'}
            onChange={(checked) => {
              // Hier MQTT Publish-Logik implementieren
              console.log('Switch changed:', checked);
            }}
          />
        );
      
      case 'sensor':
        return (
          <ValueDisplay 
            value={message.payload} 
            unit={unit} 
            type={type}
          />
        );
      
      default:
        if (typeof message.payload === 'number') {
          return (
            <ValueDisplay 
              value={message.payload} 
              unit={unit} 
              type={type}
            />
          );
        }
        return (
          <div className="human-readable">
            {formatTopicValue(message)}
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'raw':
        return (
          <pre className="raw-view">
            {JSON.stringify(topic.messages[0]?.payload)}
          </pre>
        );
      
      case 'json':
        return (
          <pre className="json-payload">
            {JSON.stringify(topic.messages[0]?.payload, null, 2)}
          </pre>
        );
      
      case 'chart':
        if (typeof topic.messages[0]?.payload === 'number') {
          const chartData = topic.messages.map(msg => ({
            time: new Date(msg.timestamp).getTime(),
            value: Number(msg.payload)
          })).reverse();

          return (
            <LineChart width={600} height={300} data={chartData}>
              <XAxis 
                dataKey="time" 
                type="number"
                domain={['auto', 'auto']}
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              />
              <YAxis />
              <RechartsTooltip 
                labelFormatter={(time) => new Date(time).toLocaleString()}
              />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          );
        }
        return <div>Chart view not available for this data type</div>;
      
      case 'human':
      default:
        return renderHumanContent();
    }
  };

  return (
    <Card className="topic-details">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div className="topic-header">
          <Title level={4}>{topic.path}</Title>
          <Text type="secondary">
            Last update: {formatTimestamp(topic.lastUpdate)}
          </Text>
        </div>

        <Radio.Group value={viewMode} onChange={e => setViewMode(e.target.value)}>
          <Radio.Button value="human">Human</Radio.Button>
          <Radio.Button value="json">JSON</Radio.Button>
          <Radio.Button value="raw">Raw</Radio.Button>
          {(topic.type === 'sensor' || topic.type === 'number') && (
            <Radio.Button value="chart">Chart</Radio.Button>
          )}
        </Radio.Group>

        <div className="topic-content">
          {renderContent()}
        </div>

        <Tabs activeKey="history">
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
import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Row, Col, Typography, Button } from 'antd';
import { TopicTree } from '../components/TopicTree';
import { TopicDetails } from '../components/TopicDetails';
import { ThemeSwitch } from '../components/ThemeSwitch';
import { useTheme } from '../hooks/useTheme';
import { useMqttStore } from '../store/mqttStore';
import { WifiOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dockqttLogo from '../images/dockqtt.png';
import { buildTopicTree } from '../utils/topicUtils';
import './Dashboard.css';

const { Header, Content } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();
  const { 
    connected, 
    currentConnection,
    topicMessages,
    selectedTopic,
    selectTopic,
    disconnect 
  } = useMqttStore();

  useEffect(() => {
    if (!connected) {
      navigate('/');
    }
  }, [connected, navigate]);

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  const handleTopicSelect = (topic: string) => {
    selectTopic(topic);
  };

  // Konvertiere die flachen Topics in eine Baumstruktur
  const topicTree = useMemo(() => {
    return buildTopicTree(topicMessages);
  }, [topicMessages]);

  // Finde das ausgewählte Topic-Node
  const selectedTopicNode = useMemo(() => {
    if (!selectedTopic) return null;
    
    function findNode(nodes: TopicNode[]): TopicNode | null {
      for (const node of nodes) {
        if (node.path === selectedTopic) {
          return node;
        }
        const found = findNode(Object.values(node.children));
        if (found) return found;
      }
      return null;
    }

    return findNode(topicTree);
  }, [selectedTopic, topicTree]);

  return (
    <Layout className="dashboard-layout">
      <Header className="dashboard-header">
        <div className="header-section">
          <div className="connection-info">
            {connected ? (
              <WifiOutlined className="connection-icon connected" />
            ) : (
              <DisconnectOutlined className="connection-icon disconnected" />
            )}
            <span className="connection-status">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
            {currentConnection && (
              <>
                <span className="connection-separator">|</span>
                <span className="broker-details">
                  {currentConnection.url}:{currentConnection.port}
                </span>
              </>
            )}
          </div>
          <Button
            type="text"
            danger
            icon={<DisconnectOutlined />}
            onClick={handleDisconnect}
            className="disconnect-button"
          />
        </div>

        <div className="header-logo-container">
          <img 
            src={dockqttLogo} 
            alt="DockQTT Logo" 
            className="header-logo"
          />
        </div>

        <div className="header-section">
          <ThemeSwitch 
            darkMode={darkMode} 
            onChange={setDarkMode}
          />
        </div>
      </Header>
      <Content className="dashboard-content">
        <Row gutter={16}>
          <Col span={8}>
            <TopicTree 
              topics={topicTree} 
              onSelect={handleTopicSelect}
              selectedTopic={selectedTopic}
            />
          </Col>
          <Col span={16}>
            {selectedTopicNode ? (
              <TopicDetails topic={selectedTopicNode} />
            ) : (
              <div className="no-topic-selected">
                Select a topic to view details
              </div>
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}; 
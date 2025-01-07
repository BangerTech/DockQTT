import React, { useMemo } from 'react';
import { Tree, Typography, Badge, Tooltip } from 'antd';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import { TopicNode } from '../types';
import { formatTopicValue, formatTimestamp } from '../utils/topicUtils';
import './TopicTree.css';

interface TopicTreeProps {
  topics: TopicNode[];
  onSelect: (topic: string) => void;
  selectedTopic?: string;
}

export const TopicTree: React.FC<TopicTreeProps> = ({ topics, onSelect, selectedTopic }) => {
  const treeData = useMemo(() => {
    function convertToAntdTree(nodes: TopicNode[]): any[] {
      return nodes.map(node => ({
        key: node.path,
        title: (
          <div className="topic-node">
            <div className="topic-info">
              <span className="topic-title">{node.name}</span>
              {node.messages.length > 0 && (
                <Tooltip title={formatTimestamp(node.lastUpdate)}>
                  <Typography.Text className="topic-value" type="secondary">
                    {formatTopicValue(node.messages[0])}
                  </Typography.Text>
                </Tooltip>
              )}
            </div>
            {node.unreadCount > 0 && (
              <Badge 
                count={node.unreadCount}
                style={{ backgroundColor: '#52c41a' }}
              />
            )}
          </div>
        ),
        isLeaf: node.children.length === 0,
        children: convertToAntdTree(node.children)
      }));
    }

    return convertToAntdTree(topics);
  }, [topics]);

  return (
    <div className="topic-tree">
      <Tree
        showIcon
        defaultExpandAll
        selectedKeys={selectedTopic ? [selectedTopic] : []}
        onSelect={(_, { node }) => onSelect(node.key as string)}
        treeData={treeData}
        icon={({ expanded }) => 
          expanded ? <FolderOutlined /> : <FileOutlined />
        }
      />
    </div>
  );
}; 
import React, { useMemo, useState } from 'react';
import { Tree, Typography, Badge, Tooltip, Input, Space } from 'antd';
import { FolderOutlined, FileOutlined, SearchOutlined } from '@ant-design/icons';
import { TopicNode } from '../types';
import { formatTopicValue, formatTimestamp } from '../utils/topicUtils';
import './TopicTree.css';

const { Search } = Input;

interface TopicTreeProps {
  topics: TopicNode[];
  onSelect: (topic: string) => void;
  selectedTopic?: string;
}

export const TopicTree: React.FC<TopicTreeProps> = ({ topics, onSelect, selectedTopic }) => {
  const [searchText, setSearchText] = useState('');

  const filteredTreeData = useMemo(() => {
    function filterNodes(nodes: TopicNode[]): TopicNode[] {
      return nodes
        .map(node => {
          const matchesSearch = node.path.toLowerCase().includes(searchText.toLowerCase());
          const filteredChildren = filterNodes(Object.values(node.children));
          
          if (matchesSearch || filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren.length > 0 ? Object.fromEntries(
                filteredChildren.map(child => [child.path, child])
              ) : {}
            };
          }
          return null;
        })
        .filter((node): node is TopicNode => node !== null);
    }

    return filterNodes(topics);
  }, [topics, searchText]);

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
        isLeaf: Object.keys(node.children).length === 0,
        children: convertToAntdTree(Object.values(node.children))
      }));
    }

    return convertToAntdTree(filteredTreeData);
  }, [filteredTreeData]);

  return (
    <div className="topic-tree">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Search
          placeholder="Search topics..."
          allowClear
          prefix={<SearchOutlined />}
          onChange={e => setSearchText(e.target.value)}
        />
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
      </Space>
    </div>
  );
}; 
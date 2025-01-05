import React, { useMemo, useState } from 'react';
import { Tree, Input, Badge, theme } from 'antd';
import { DataNode } from 'antd/es/tree';
import { MqttMessage } from '../types';
import { useMqttStore } from '../store/mqttStore';

const { Search } = Input;

interface TopicTreeProps {
  messages: Record<string, MqttMessage[]>;
}

export const TopicTree: React.FC<TopicTreeProps> = ({ messages }) => {
  const { token } = theme.useToken();
  const [searchText, setSearchText] = useState('');
  const { selectTopic, selectedTopic } = useMqttStore();

  const buildTree = useMemo(() => {
    const tree: DataNode[] = [];
    const pathMap = new Map<string, DataNode>();

    Object.entries(messages)
      .filter(([topic]) => 
        !searchText || topic.toLowerCase().includes(searchText.toLowerCase())
      )
      .forEach(([topic, msgs]) => {
        const parts = topic.split('/');
        let currentPath = '';
        
        parts.forEach((part, index) => {
          const isLast = index === parts.length - 1;
          const parentPath = currentPath;
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          if (!pathMap.has(currentPath)) {
            const node: DataNode = {
              title: part,
              key: currentPath,
              children: [],
            };

            if (isLast) {
              node.isLeaf = true;
              node.title = (
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  width: '100%',
                }}>
                  <span style={{ fontWeight: 500 }}>{part}</span>
                  {msgs.length > 0 && (
                    <Badge 
                      count={msgs.length} 
                      style={{ 
                        backgroundColor: token.colorSuccess,
                        marginLeft: '8px',
                      }} 
                    />
                  )}
                </div>
              );
            }

            if (parentPath) {
              const parentNode = pathMap.get(parentPath);
              parentNode?.children?.push(node);
            } else {
              tree.push(node);
            }

            pathMap.set(currentPath, node);
          }
        });
      });

    return tree;
  }, [messages, searchText, token]);

  return (
    <div>
      <Search
        placeholder="Search topics..."
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        style={{ 
          marginBottom: '16px',
          borderRadius: token.borderRadius,
        }}
      />
      <Tree
        treeData={buildTree}
        selectedKeys={selectedTopic ? [selectedTopic] : []}
        onSelect={(keys) => {
          if (keys.length > 0) {
            selectTopic(keys[0]?.toString() || null);
          }
        }}
      />
    </div>
  );
}; 
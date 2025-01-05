import React, { useMemo, useState } from 'react';
import { Tree, Input, theme } from 'antd';
import { DataNode } from 'antd/es/tree';
import { MqttMessage } from '../types';
import { useMqttStore } from '../store/mqttStore';

const { Search } = Input;

interface TopicTreeProps {
  messages: Record<string, MqttMessage>;
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
      .forEach(([topic, msg]) => {
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
                  padding: '4px 0',
                  fontSize: '14px',
                }}>
                  <div style={{ fontWeight: 500 }}>{part}</div>
                  <div style={{ 
                    color: token.colorTextSecondary,
                    fontSize: '12px',
                    marginTop: '2px',
                  }}>
                    {msg.payload}
                  </div>
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
      <div style={{ padding: '16px' }}>
        <Search
          placeholder="Search topics..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ 
            borderRadius: token.borderRadius,
          }}
        />
      </div>
      <Tree
        treeData={buildTree}
        selectedKeys={selectedTopic ? [selectedTopic] : []}
        onSelect={(keys) => selectTopic(keys[0]?.toString() || null)}
        style={{ 
          padding: '0 16px 16px',
        }}
      />
    </div>
  );
}; 
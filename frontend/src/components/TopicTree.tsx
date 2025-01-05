import React, { useMemo } from 'react';
import { Tree, Input } from 'antd';
import { DataNode } from 'antd/es/tree';
import { MqttMessage } from '../types';

const { Search } = Input;

interface TopicTreeProps {
  messages: Record<string, MqttMessage>;
}

export const TopicTree: React.FC<TopicTreeProps> = ({ messages }) => {
  const buildTree = useMemo(() => {
    const tree: DataNode[] = [];
    const pathMap = new Map<string, DataNode>();

    Object.entries(messages).forEach(([topic, msg]) => {
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
                flexDirection: 'column',
                fontSize: '12px'
              }}>
                <span style={{ fontWeight: 'bold' }}>{part}</span>
                <span style={{ 
                  color: '#666',
                  wordBreak: 'break-all'
                }}>{msg.payload}</span>
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
  }, [messages]);

  return (
    <div style={{ padding: '16px' }}>
      <Search
        placeholder="Search topics..."
        style={{ marginBottom: 16 }}
      />
      <Tree
        treeData={buildTree}
        defaultExpandAll
        className="topic-tree"
        style={{ 
          overflow: 'auto',
          maxHeight: 'calc(100vh - 180px)'
        }}
      />
    </div>
  );
}; 
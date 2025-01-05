import React, { useEffect, useState } from 'react';
import { Tree, Input } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useMqttStore } from '../store/mqttStore';

const { Search } = Input;

export const TopicTree: React.FC = () => {
  const { messages, setSelectedTopic } = useMqttStore();
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const topics = Object.keys(messages);
    const tree: DataNode[] = [];

    topics.forEach((topic) => {
      const parts = topic.split('/');
      let currentLevel = tree;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const existingNode = currentLevel.find((node) => node.key === part);

        if (existingNode) {
          if (!isLast) {
            currentLevel = existingNode.children as DataNode[];
          }
        } else {
          const newNode: DataNode = {
            title: part,
            key: isLast ? topic : part,
            children: isLast ? [] : [],
          };
          currentLevel.push(newNode);
          if (!isLast) {
            currentLevel = newNode.children as DataNode[];
          }
        }
      });
    });

    setTreeData(tree);
  }, [messages]);

  const onSelect = (selectedKeys: React.Key[]) => {
    setSelectedTopic(selectedKeys[0]?.toString() || null);
  };

  const filterTreeNode = (node: DataNode) => {
    return node.key?.toString().toLowerCase().includes(searchValue.toLowerCase());
  };

  return (
    <div className="topic-tree">
      <Search
        placeholder="Search topics..."
        onChange={(e) => setSearchValue(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <Tree
        treeData={treeData}
        onSelect={onSelect}
        filterTreeNode={searchValue ? filterTreeNode : undefined}
      />
    </div>
  );
}; 
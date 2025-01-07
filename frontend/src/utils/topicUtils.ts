import { MqttMessage, TopicNode } from '../types';

interface TopicMap {
  [key: string]: MqttMessage[];
}

export function buildTopicTree(topicMessages: TopicMap): TopicNode[] {
  const root: { [key: string]: TopicNode } = {};
  const sortedTopics = Object.keys(topicMessages).sort();

  for (const fullPath of sortedTopics) {
    const parts = fullPath.split('/');
    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!currentLevel[currentPath]) {
        const messages = index === parts.length - 1 ? topicMessages[fullPath] : [];
        currentLevel[currentPath] = {
          name: part,
          path: currentPath,
          children: {},
          messages,
          unreadCount: messages.length,
          lastUpdate: messages[0]?.timestamp ? new Date(messages[0].timestamp).getTime() : 0
        };
      }
      currentLevel = currentLevel[currentPath].children;
    });
  }

  return convertToArray(root);
}

export function formatTopicValue(message: MqttMessage): string {
  if (!message) return '';
  
  const payload = message.payload;
  if (typeof payload === 'object') {
    return JSON.stringify(payload);
  }
  
  if (typeof payload === 'boolean') {
    return payload ? 'true' : 'false';
  }
  
  return String(payload);
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Konvertiere das Objekt in ein Array und sortiere die Kinder
function convertToArray(node: { [key: string]: TopicNode }): TopicNode[] {
  return Object.values(node).map(n => ({
    ...n,
    children: convertToArray(n.children)
  }));
} 
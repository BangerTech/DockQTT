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
      const isLeafNode = index === parts.length - 1;
      const currentMessages = isLeafNode ? topicMessages[fullPath] : [];
      
      if (!currentLevel[currentPath]) {
        currentLevel[currentPath] = {
          name: part,
          path: currentPath,
          children: {},
          messages: currentMessages,
          unreadCount: currentMessages.length,
          lastUpdate: currentMessages[0]?.timestamp ? new Date(currentMessages[0].timestamp).getTime() : 0,
          type: detectTopicType(currentPath, currentMessages[0]?.payload)
        };
      }
      
      // Aktualisiere unreadCount für Eltern-Topics
      if (!isLeafNode && root[currentPath]) {
        root[currentPath].unreadCount += topicMessages[fullPath].length;
      }

      currentLevel = currentLevel[currentPath].children;
    });
  }

  return convertToArray(root);
}

// Erkennt den Typ des Topics basierend auf Pfad und Payload
export function detectTopicType(path: string, payload: any): TopicType {
  if (path.includes('/switch') || path.includes('/relay')) return 'switch';
  if (path.includes('/sensor') || path.includes('/temperature')) return 'sensor';
  if (path.includes('/status')) return 'status';
  if (path.includes('/config')) return 'config';
  if (path.includes('/availability')) return 'availability';
  
  if (typeof payload === 'boolean') return 'boolean';
  if (typeof payload === 'number') return 'number';
  if (typeof payload === 'object') return 'json';
  
  return 'text';
}

export type TopicType = 'switch' | 'sensor' | 'status' | 'config' | 'availability' | 'boolean' | 'number' | 'json' | 'text';

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
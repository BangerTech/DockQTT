export interface ConnectionConfig {
  url: string;
  port: number;
  username?: string;
  password?: string;
  save?: boolean;
}

export interface MqttMessage {
  topic: string;
  payload: any;
  timestamp: number;
  retain: boolean;
  qos: number;
}

export interface TopicNode {
  name: string;
  path: string;
  children: TopicNode[];
  messages: MqttMessage[];
} 
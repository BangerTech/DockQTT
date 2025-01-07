export interface ConnectionConfig {
  url: string;
  port: number;
  username?: string;
  password?: string;
  clientId?: string;
}

export interface MqttMessage {
  payload: any;
  timestamp: string;
  retain: boolean;
  qos: number;
}

export interface TopicMessage extends MqttMessage {
  topic: string;
}

export interface TopicNode {
  name: string;
  path: string;
  children: { [key: string]: TopicNode };
  messages: MqttMessage[];
  unreadCount: number;
  lastUpdate: number;
} 
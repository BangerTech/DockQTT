export interface ConnectionConfig {
  url: string;
  port: number;
  username?: string;
  password?: string;
}

export interface MqttMessage {
  topic: string;
  payload: any;
  timestamp: number;
  retain: boolean;
  qos: number;
} 
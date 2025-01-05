import * as mqtt from 'mqtt';
import { Server } from 'socket.io';
import { ConnectionConfig } from '../types';

export class MqttService {
  private client: mqtt.Client | null = null;
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  async connect(config: ConnectionConfig) {
    try {
      const url = `mqtt://${config.url}:${config.port}`;
      
      this.client = mqtt.connect(url, {
        username: config.username,
        password: config.password,
      });

      this.client.on('connect', () => {
        this.io.emit('mqtt:connected');
        this.client?.subscribe('#');
      });

      this.client.on('message', (topic, payload) => {
        this.io.emit('mqtt:message', {
          topic,
          payload: payload.toString(),
          timestamp: Date.now(),
          retain: false,
          qos: 0,
        });
      });

      this.client.on('error', (error) => {
        this.io.emit('mqtt:error', error.message);
      });

      return true;
    } catch (error) {
      console.error('MQTT connection error:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  publish(topic: string, message: string) {
    if (this.client) {
      this.client.publish(topic, message);
    }
  }
} 
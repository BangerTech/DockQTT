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
      if (this.client) {
        this.client.end();
      }

      const url = `mqtt://${config.url}:${config.port}`;
      console.log('Connecting to MQTT broker:', url);

      this.client = mqtt.connect(url, {
        username: config.username,
        password: config.password,
        reconnectPeriod: 1000,
        connectTimeout: 5000,
      });

      return new Promise((resolve, reject) => {
        this.client?.on('connect', () => {
          console.log('Connected to MQTT broker');
          this.io.emit('mqtt:connected', true);
          
          this.client?.subscribe('#', (err) => {
            if (err) {
              console.error('Subscription error:', err);
              reject(err);
            } else {
              console.log('Subscribed to all topics');
              resolve(true);
            }
          });
        });

        this.client?.on('message', (topic, payload) => {
          console.log(`Received message on ${topic}`);
          this.io.emit('mqtt:message', {
            topic,
            payload: payload.toString(),
            timestamp: Date.now(),
          });
        });

        this.client?.on('error', (err) => {
          console.error('MQTT error:', err);
          this.io.emit('mqtt:connected', false);
          reject(err);
        });

        this.client?.on('disconnect', () => {
          console.log('Disconnected from MQTT broker');
          this.io.emit('mqtt:connected', false);
        });
      });
    } catch (error) {
      console.error('Connection error:', error);
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
    if (this.client?.connected) {
      this.client.publish(topic, message);
    } else {
      throw new Error('Not connected to MQTT broker');
    }
  }
} 
import mqtt, { IClientOptions, QoS } from 'mqtt';
import { Server } from 'socket.io';

export class MqttHandler {
  private client: mqtt.Client | null = null;
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  async connect(options: {
    host: string;
    port: number;
    username?: string;
    password?: string;
  }) {
    const url = `mqtt://${options.host}:${options.port}`;
    
    const mqttOptions: IClientOptions = {
      username: options.username,
      password: options.password,
      reconnectPeriod: 1000,
      connectTimeout: 5000,
    };

    this.client = mqtt.connect(url, mqttOptions);

    return new Promise<void>((resolve, reject) => {
      this.client?.once('connect', () => {
        this.client?.subscribe('#');
        this.io.emit('mqtt:connected');
        resolve();
      });

      this.client?.once('error', (error) => {
        reject(error);
      });

      this.client?.on('message', (topic, message) => {
        this.io.emit('mqtt:message', {
          topic,
          message: message.toString(),
          timestamp: new Date().toISOString()
        });
      });

      this.client?.on('error', (error) => {
        this.io.emit('mqtt:error', error.message);
      });
    });
  }

  publish(topic: string, message: string, qos: QoS = 0) {
    if (!this.client) {
      throw new Error('Not connected to MQTT broker');
    }
    this.client.publish(topic, message, { qos });
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
} 
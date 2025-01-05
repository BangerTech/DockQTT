import mqtt from 'mqtt';
import { WebSocketServer, WebSocket } from 'ws';

// WebSocket.readyState ist ein enum mit den Werten 0, 1, 2, 3
type WebSocketReadyState = 0 | 1 | 2 | 3;

interface WebSocketClient extends WebSocket {
  readyState: WebSocketReadyState;
}

export class MqttHandler {
  private mqttClient: mqtt.MqttClient | null = null;
  private wss: WebSocketServer;

  constructor(wss: WebSocketServer) {
    this.wss = wss;
  }

  async connect(config: { host: string; port: string; username?: string; password?: string }) {
    if (this.mqttClient) {
      this.mqttClient.end();
    }

    const { host, port, username, password } = config;
    const brokerUrl = `mqtt://${host}:${port}`;

    const options: mqtt.IClientOptions = {
      username,
      password,
      reconnectPeriod: 1000,
    };

    return new Promise<void>((resolve, reject) => {
      try {
        this.mqttClient = mqtt.connect(brokerUrl, options);

        this.mqttClient.on('connect', () => {
          console.log('Connected to MQTT broker');
          this.setupMessageHandlers();
          resolve();
        });

        this.mqttClient.on('error', (error: Error) => {
          console.error('MQTT error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupMessageHandlers() {
    if (!this.mqttClient) return;

    this.mqttClient.subscribe('#', { qos: 0 });

    this.mqttClient.on('message', (topic: string, message: Buffer) => {
      const clients = this.wss.clients as Set<WebSocketClient>;
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'topics',
            data: {
              [topic]: {
                message: message.toString(),
                timestamp: Date.now()
              }
            }
          }));
        }
      });
    });
  }
} 
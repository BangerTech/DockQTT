import { io } from 'socket.io-client';
import { useMqttStore } from '../store/mqttStore';
import { MqttMessage, ConnectionConfig } from '../types';

const socket = io('/', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

let reconnectTimer: NodeJS.Timeout | null = null;

socket.on('connect', () => {
  console.log('Socket connected');
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  // Wenn die Socket-Verbindung wiederhergestellt wird, prüfen wir den Store-Status
  const store = useMqttStore.getState();
  if (store.currentConnection && !store.connected) {
    connectToBroker(store.currentConnection);
  }
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
  // Verzögere das Setzen des Disconnected-Status um eine kurze Zeit
  reconnectTimer = setTimeout(() => {
    const store = useMqttStore.getState();
    if (store.connected) {
      store.setConnected(false);
    }
  }, 2000); // 2 Sekunden Verzögerung
});

socket.on('mqtt:message', (data: { topic: string, payload: any, timestamp: number }) => {
  try {
    const message: MqttMessage = {
      payload: data.payload,
      timestamp: new Date(data.timestamp).toISOString(),
      retain: false,
      qos: 0
    };

    // Versuche JSON zu parsen, wenn es ein String ist
    if (typeof data.payload === 'string') {
      try {
        message.payload = JSON.parse(data.payload);
      } catch {
        // Wenn das Parsen fehlschlägt, behalte den Original-String
        message.payload = data.payload;
      }
    }

    useMqttStore.getState().addMessage(data.topic, message);
  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
});

export const connectToBroker = async (config: ConnectionConfig) => {
  try {
    const response = await fetch('/api/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Connection failed');
    }

    const data = await response.json();
    if (data.success) {
      useMqttStore.getState().setConnected(true);
      useMqttStore.getState().setCurrentConnection(config);
      console.log('Successfully connected to broker');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Connection error:', error);
    return false;
  }
};

export const disconnectFromBroker = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  socket.emit('mqtt:disconnect');
  useMqttStore.getState().disconnect();
}; 
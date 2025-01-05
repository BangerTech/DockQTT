import { useEffect } from 'react';
import { useMqttStore } from '../store/mqttStore';
import io from 'socket.io-client';

export const useWebSocket = () => {
  const { addMessage, setConnected } = useMqttStore();

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://backend:4000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socket.on('mqtt:connected', (status: boolean) => {
      console.log('MQTT connection status:', status);
      setConnected(status);
    });

    socket.on('mqtt:message', (message) => {
      console.log('Received message:', message);
      addMessage(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [addMessage, setConnected]);
}; 
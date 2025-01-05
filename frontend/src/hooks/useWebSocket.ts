import { useEffect } from 'react';
import { useMqttStore } from '../store/mqttStore';
import io from 'socket.io-client';

export const useWebSocket = () => {
  const { addMessage, setConnected } = useMqttStore();

  useEffect(() => {
    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
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
      console.log('WebSocket received message:', message);
      addMessage(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [addMessage, setConnected]);
}; 
import { useEffect } from 'react';
import { useMqttStore } from '../store/mqttStore';
import io from 'socket.io-client';

export const useWebSocket = () => {
  const { addMessage, setConnected } = useMqttStore();

  useEffect(() => {
    const socket = io();

    socket.on('mqtt:connected', (status: boolean) => {
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
import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMqttStore } from '../store/mqttStore';
import { MqttMessage } from '../types';

export const useWebSocket = () => {
  const { addMessage, setConnected } = useMqttStore();

  const handleMessage = useCallback((message: MqttMessage) => {
    addMessage(message);
  }, [addMessage]);

  useEffect(() => {
    const socket: Socket = io('http://192.168.2.86:4000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('mqtt:connected', () => {
      setConnected(true);
    });

    socket.on('mqtt:message', handleMessage);

    socket.on('mqtt:error', (error: string) => {
      console.error('MQTT error:', error);
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [handleMessage, setConnected]);
}; 
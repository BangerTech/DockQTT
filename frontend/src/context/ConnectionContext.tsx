import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface ConnectionContextType {
  isConnected: boolean;
  connect: (host: string, port: string, username?: string, password?: string) => Promise<void>;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  const connect = async (host: string, port: string, username?: string, password?: string) => {
    try {
      console.log('Connecting to:', { host, port, username });

      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ host, port, username, password }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Connection failed');
        } catch (e) {
          throw new Error('Connection failed');
        }
      }

      const data = await response.json();
      console.log('Response data:', data);

      connectToWebSocket();
      setIsConnected(true);
      navigate('/dashboard');
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    navigate('/');
  };

  const connectToWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);
    };
  };

  return (
    <ConnectionContext.Provider value={{ isConnected, connect, disconnect }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
} 
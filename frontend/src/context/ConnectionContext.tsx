import React, { createContext, useContext, useState, ReactNode, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ConnectionContextType {
  isConnected: boolean;
  connect: (host: string, port: string) => Promise<void>;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  const connect = useCallback(async (host: string, port: string) => {
    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port })
      });

      if (response.ok) {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          navigate('/dashboard');
          return;
        }

        const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          navigate('/dashboard');
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          
          if (!ws.wasClean) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connect(host, port);
            }, 5000);
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received WebSocket message:', data);
            // Hier können Sie die empfangenen Daten verarbeiten
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current = ws;
      } else {
        console.error('Connection failed:', await response.text());
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  }, [navigate]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ isConnected, connect, disconnect }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
} 
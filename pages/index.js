import { useState, useEffect } from 'react'
import ConnectionForm from '../components/ConnectionForm'
import App from '../components/App'

export default function Home() {
  const [wsClient, setWsClient] = useState(null)
  const [topics, setTopics] = useState({})
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)
  const [connecting, setConnecting] = useState(false)

  const handleConnect = (config) => {
    setConnecting(true);
    setError(null);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({
        type: 'connect',
        config: config
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);

      if (data.type === 'connected') {
        console.log('Connection established');
        setConnected(true);
        setWsClient(ws);
        setError(null);
        setConnecting(false);
      } else if (data.type === 'topics') {
        console.log('Received topic update:', data.data);
        setTopics(prev => ({
          ...prev,
          ...data.data
        }));
      } else if (data.type === 'error') {
        console.error('Error:', data.message);
        setError(data.message);
        setConnected(false);
        setConnecting(false);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setWsClient(null);
      setConnecting(false);
    };
  }

  return (
    <>
      {!connected ? (
        <ConnectionForm 
          onConnect={handleConnect} 
          error={error}
          connecting={connecting}
        />
      ) : (
        <App 
          topics={topics}
          connected={connected}
          onPublish={(topic, message, retain = false) => {
            if (wsClient) {
              wsClient.send(JSON.stringify({
                type: 'publish',
                topic,
                message,
                retain
              }))
            }
          }}
        />
      )}
    </>
  )
}

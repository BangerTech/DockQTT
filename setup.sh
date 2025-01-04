#!/bin/bash

# Verzeichnisstruktur erstellen
mkdir -p pages/api/mqtt
mkdir -p styles
mkdir -p public

# package.json erstellen
cat > package.json << 'EOF'
{
  "name": "mqtt-web-explorer",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "mqtt": "^4.3.7",
    "ws": "^8.13.0"
  }
}
EOF

# index.js erstellen
cat > pages/index.js << 'EOF'
import { useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [brokerConfig, setBrokerConfig] = useState({
    host: '',
    port: '1883',
    username: '',
    password: '',
  })
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState({})
  const [selectedTopic, setSelectedTopic] = useState(null)

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/mqtt/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brokerConfig),
      })
      const data = await response.json()
      if (data.success) {
        setIsConnected(true)
        startWebSocketConnection()
      } else {
        alert('Verbindungsfehler: ' + data.error)
      }
    } catch (error) {
      console.error('Verbindungsfehler:', error)
      alert('Verbindungsfehler: ' + error.message)
    }
  }

  const startWebSocketConnection = () => {
    const ws = new WebSocket('ws://localhost:8080')
    ws.onmessage = (event) => {
      const { topic, message } = JSON.parse(event.data)
      setMessages(prev => ({
        ...prev,
        [topic]: {
          message,
          timestamp: new Date().toISOString(),
          count: (prev[topic]?.count || 0) + 1
        }
      }))
    }
  }

  return (
    <div className={styles.container}>
      {!isConnected ? (
        <div className={styles.welcome}>
          <div className={styles.welcomeCard}>
            <h1>MQTT Web Explorer</h1>
            
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="IP Adresse (z.B. 192.168.1.100)"
                value={brokerConfig.host}
                onChange={(e) => setBrokerConfig(prev => ({
                  ...prev,
                  host: e.target.value
                }))}
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Port (Standard: 1883)"
                value={brokerConfig.port}
                onChange={(e) => setBrokerConfig(prev => ({
                  ...prev,
                  port: e.target.value
                }))}
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Username (optional)"
                value={brokerConfig.username}
                onChange={(e) => setBrokerConfig(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password (optional)"
                value={brokerConfig.password}
                onChange={(e) => setBrokerConfig(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
              />
            </div>

            <button className={styles.connectButton} onClick={handleConnect}>
              Verbinden
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.explorer}>
          <div className={styles.sidebar}>
            <div className={styles.brokerInfo}>
              <h3>Verbunden mit</h3>
              <p>{brokerConfig.host}:{brokerConfig.port}</p>
            </div>
            <div className={styles.topicList}>
              {Object.entries(messages).map(([topic, data]) => (
                <div
                  key={topic}
                  className={`${styles.topic} ${selectedTopic === topic ? styles.selected : ''}`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  <span className={styles.topicName}>{topic}</span>
                  <span className={styles.messageCount}>{data.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.content}>
            {selectedTopic ? (
              <div className={styles.messageView}>
                <h2>{selectedTopic}</h2>
                <div className={styles.messageContent}>
                  <pre>{messages[selectedTopic].message}</pre>
                </div>
                <div className={styles.messageInfo}>
                  <span>Letzte Aktualisierung: {new Date(messages[selectedTopic].timestamp).toLocaleString()}</span>
                  <span>Nachrichten: {messages[selectedTopic].count}</span>
                </div>
              </div>
            ) : (
              <div className={styles.noSelection}>
                <p>Wählen Sie ein Topic aus der Liste aus</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
EOF

# MQTT API Route erstellen
cat > pages/api/mqtt/connect.js << 'EOF'
import { connect } from 'mqtt'
import WebSocket from 'ws'

let mqttClient = null
let wsServer = null

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { host, port, username, password } = req.body
  const url = `mqtt://${host}:${port}`

  try {
    if (mqttClient) {
      mqttClient.end()
    }

    mqttClient = connect(url, {
      clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
      username: username || undefined,
      password: password || undefined,
      keepalive: 30,
      clean: true,
    })

    mqttClient.on('connect', () => {
      console.log('MQTT Connected')
      mqttClient.subscribe('#')
    })

    mqttClient.on('message', (topic, message) => {
      if (wsServer) {
        wsServer.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ topic, message: message.toString() }))
          }
        })
      }
    })

    mqttClient.on('error', (err) => {
      console.error('MQTT Error:', err)
      res.status(500).json({ success: false, error: err.message })
    })

    if (!wsServer) {
      wsServer = new WebSocket.Server({ port: 8080 })
      wsServer.on('connection', (ws) => {
        console.log('WebSocket client connected')
      })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Connection error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}
EOF

# CSS erstellen
cat > styles/Home.module.css << 'EOF'
.container {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.welcome {
  width: 100%;
  max-width: 400px;
  padding: 1rem;
}

.welcomeCard {
  background: white;
  border-radius: 4px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcomeCard h1 {
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
}

.inputGroup {
  margin-bottom: 1rem;
}

.inputGroup input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.connectButton {
  width: 100%;
  padding: 0.75rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.connectButton:hover {
  background: #1565c0;
}

.explorer {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.topic {
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic:hover {
  background: #f5f6fa;
}

.topic.selected {
  background: #e3f2fd;
}

.messageContent {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.messageInfo {
  color: #666;
  font-size: 0.875rem;
}
EOF

# Docker-Compose erstellen
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  mqtt-explorer:
    build: .
    ports:
      - "3000:3000"
      - "8080:8080"
    restart: unless-stopped
    container_name: mqtt-web-explorer
EOF

# Dockerfile erstellen
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 8080

CMD ["npm", "run", "dev"]
EOF

# Ausführbar machen
chmod +x setup.sh

# Installation starten
npm install

echo "Setup abgeschlossen. Starten Sie die Anwendung mit: docker-compose up -d" 
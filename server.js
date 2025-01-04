const express = require('express')
const next = require('next')
const mqtt = require('mqtt')
const WebSocket = require('ws')
const winston = require('winston')
const net = require('net')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Logger Setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
})

// Define the testConnection function
const testConnection = (host, port) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket()
    client.setTimeout(5000)
    
    client.on('error', (err) => {
      logger.error('TCP connection test failed:', err)
      reject(err)
    })

    client.on('timeout', () => {
      logger.error('TCP connection test timeout')
      client.destroy()
      reject(new Error('Connection timeout'))
    })

    client.connect(parseInt(port), host, () => {
      logger.info('TCP connection test successful')
      client.destroy()
      resolve()
    })
  })
}

// Prepare Next.js
app.prepare().then(() => {
  const server = express()
  const wss = new WebSocket.Server({ noServer: true })

  wss.on('connection', (ws) => {
    logger.info('WebSocket Client connected')
    let mqttClient = null;

    // Einfache Verbindungsfunktion
    const connectMqtt = ({ host, port }) => {
      // Beende vorherige Verbindung
      if (mqttClient) {
        mqttClient.end(true)
      }

      // Erstelle neue Verbindung
      mqttClient = mqtt.connect(`mqtt://${host}:${port}`)

      // Verbindung erfolgreich
      mqttClient.on('connect', () => {
        logger.info('MQTT Connected')
        
        // Subscribe zu allen Topics
        mqttClient.subscribe('#', (err) => {
          if (err) {
            logger.error('Subscribe error:', err)
            return
          }
          
          // Informiere Frontend
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'connected' }))
            logger.info('Sent connected status to frontend')
          }
        })
      })

      // Empfange Nachrichten
      mqttClient.on('message', (topic, message) => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({
              type: 'topics',
              data: {
                [topic]: {
                  message: message.toString(),
                  timestamp: Date.now()
                }
              }
            }))
            logger.info(`Sent message from topic ${topic} to frontend`)
          } catch (err) {
            logger.error('Failed to send message to frontend:', err)
          }
        }
      })

      // Fehlerbehandlung
      mqttClient.on('error', (err) => {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'MQTT connection failed' 
        }))
      })
    }

    // Empfange Verbindungsanfrage vom Frontend
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message)
        if (data.type === 'connect') {
          connectMqtt(data.config)
        }
      } catch (error) {
        logger.error('Error:', error)
      }
    })

    // Cleanup bei Verbindungsende
    ws.on('close', () => {
      if (mqttClient) {
        mqttClient.end()
      }
    })
  })

  // Handle all other routes with Next.js
  server.all('*', (req, res) => {
    return handle(req, res)
  })

  // Create HTTP server
  const httpServer = server.listen(port, hostname, (err) => {
    if (err) throw err
    logger.info(`> Ready on http://${hostname}:${port}`)
  })

  // Handle WebSocket upgrade
  httpServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  })
}).catch((err) => {
  logger.error('Error starting server:', err)
  process.exit(1)
}) 
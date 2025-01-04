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

// Prepare Next.js
app.prepare().then(() => {
  const server = express()
  const wss = new WebSocket.Server({ noServer: true })

  wss.on('connection', (ws) => {
    logger.info('WebSocket Client connected')
    let mqttClient = null;
    let isClosing = false;  // Flag für kontrolliertes Schließen

    // Definieren Sie die testConnection-Funktion hier
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

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message)
        logger.info('Received message:', data)
        
        if (data.type === 'connect' && !isClosing) {
          try {
            const { host, port, username, password } = data.config
            
            // Validiere die Eingaben
            if (!host || !port) {
              throw new Error('Host and port are required')
            }

            // Teste die Verbindung zuerst
            try {
              await testConnection(host, port)
            } catch (err) {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ 
                  type: 'error', 
                  message: `Cannot reach broker: ${err.message}` 
                }))
              }
              return
            }

            const brokerUrl = `mqtt://${host.trim()}:${port.trim()}`
            logger.info(`Attempting to connect to MQTT broker at ${brokerUrl}`)

            // Beende vorherige Verbindung
            if (mqttClient) {
              mqttClient.end(true)
              mqttClient = null
            }

            // MQTT-Verbindungsoptionen
            const options = {
              username: username || undefined,
              password: password || undefined,
              keepalive: 60,
              clean: true,
              reconnectPeriod: 1000,
              connectTimeout: 10000,
              rejectUnauthorized: false,
              clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
            }

            // Erstelle neue MQTT-Verbindung
            mqttClient = mqtt.connect(brokerUrl, options)

            // Setup MQTT event handlers first
            mqttClient.on('error', (err) => {
              logger.error('MQTT Error:', err)
              if (ws.readyState === WebSocket.OPEN && !isClosing) {
                ws.send(JSON.stringify({ 
                  type: 'error', 
                  message: `Connection error: ${err.message}` 
                }))
              }
            })

            mqttClient.on('offline', () => {
              logger.info('MQTT Client offline')
              if (ws.readyState === WebSocket.OPEN && !isClosing) {
                ws.send(JSON.stringify({ 
                  type: 'error', 
                  message: 'Connection lost' 
                }))
              }
            })

            mqttClient.on('message', (topic, message) => {
              if (ws.readyState === WebSocket.OPEN && !isClosing) {
                const messageStr = message.toString()
                logger.info(`Received MQTT message on ${topic}:`, messageStr)
                ws.send(JSON.stringify({
                  type: 'topics',
                  data: {
                    [topic]: {
                      message: messageStr,
                      timestamp: Date.now(),
                      count: 1
                    }
                  }
                }))
              }
            })

            // Warte auf erfolgreiche Verbindung
            await new Promise((resolve, reject) => {
              const connectionTimeout = setTimeout(() => {
                reject(new Error('Connection timeout'))
              }, 5000)

              mqttClient.once('connect', () => {
                clearTimeout(connectionTimeout)
                logger.info('Successfully connected to MQTT broker')
                
                mqttClient.subscribe('#', (err) => {
                  if (err) {
                    reject(new Error('Failed to subscribe to topics'))
                    return
                  }
                  logger.info('Successfully subscribed to all topics')
                  
                  if (ws.readyState === WebSocket.OPEN && !isClosing) {
                    ws.send(JSON.stringify({ type: 'connected' }))
                    resolve()
                  } else {
                    reject(new Error('WebSocket closed during connection'))
                  }
                })
              })
            })

          } catch (error) {
            logger.error('MQTT Connection error:', error)
            if (ws.readyState === WebSocket.OPEN && !isClosing) {
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: `Connection failed: ${error.message}` 
              }))
            }
          }
        }
      } catch (error) {
        logger.error('Error handling message:', error)
        if (ws.readyState === WebSocket.OPEN && !isClosing) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: error.message 
          }))
        }
      }
    })

    ws.on('close', () => {
      isClosing = true;
      logger.info('WebSocket Client disconnected')
      if (mqttClient) {
        mqttClient.end(true, () => {
          logger.info('MQTT Client disconnected')
        })
      }
    })

    ws.on('error', (error) => {
      isClosing = true;
      logger.error('WebSocket error:', error)
      if (mqttClient) {
        mqttClient.end(true)
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
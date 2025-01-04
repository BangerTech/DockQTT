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

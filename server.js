// MQTT Verbindung
mqttClient.on('connect', () => {
  logger.info('MQTT Connected')
  
  // Subscribe zu allen Topics
  mqttClient.subscribe('#', (err) => {
    if (err) {
      logger.error('Subscribe error:', err)
      return
    }
    logger.info('Subscribed to all topics')
    
    // Informiere Frontend
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'connected' }))
      logger.info('Sent connected status to frontend')
    }
  })
})

// Empfange MQTT Nachrichten
mqttClient.on('message', (topic, message) => {
  logger.info(`Received MQTT message - Topic: ${topic}, Message: ${message.toString()}`)
  
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
      logger.info(`Sent message to frontend - Topic: ${topic}`)
    } catch (err) {
      logger.error('Failed to send message to frontend:', err)
    }
  }
}) 
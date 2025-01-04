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
    try {
      setConnecting(true)
      setError(null)
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${protocol}//${window.location.host}`)
      
      const timeout = setTimeout(() => {
        setError('Connection timeout')
        setConnecting(false)
        ws.close()
      }, 10000)

      ws.onopen = () => {
        console.log('WebSocket connected')
        ws.send(JSON.stringify({
          type: 'connect',
          config: config
        }))
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('Received:', data)

        if (data.type === 'connected') {
          clearTimeout(timeout)
          setConnected(true)
          setWsClient(ws)
          setError(null)
          setConnecting(false)
        } else if (data.type === 'topics') {
          setTopics(prev => ({
            ...prev,
            ...data.data
          }))
        } else if (data.type === 'error') {
          clearTimeout(timeout)
          setError(data.message)
          setConnected(false)
          setConnecting(false)
          ws.close()
        }
      }

      ws.onclose = () => {
        clearTimeout(timeout)
        console.log('WebSocket disconnected')
        setConnected(false)
        setWsClient(null)
        setConnecting(false)
      }

      ws.onerror = (error) => {
        clearTimeout(timeout)
        console.error('WebSocket error:', error)
        setError('Connection failed')
        setConnecting(false)
      }
    } catch (error) {
      console.error('Connection error:', error)
      setError(error.message)
      setConnecting(false)
    }
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

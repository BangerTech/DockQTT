import { useState } from 'react'
import { FiCopy, FiCode } from 'react-icons/fi'
import styles from '../styles/MessageView.module.css'

export default function MessageView({ topics, selectedTopic }) {
  const [jsonView, setJsonView] = useState(false)

  const formatMessage = (message) => {
    if (jsonView) {
      try {
        const parsed = JSON.parse(message)
        return JSON.stringify(parsed, null, 2)
      } catch {
        return message
      }
    }
    return message
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (!selectedTopic || !topics[selectedTopic]) {
    return (
      <div className={styles.noSelection}>
        <p>Select a topic to view messages</p>
      </div>
    )
  }

  const { message, timestamp, count } = topics[selectedTopic]

  return (
    <div className={styles.messageView}>
      <div className={styles.header}>
        <div className={styles.topicInfo}>
          <h2>{selectedTopic}</h2>
          <span className={styles.messageCount}>
            {count} messages
          </span>
        </div>
        <div className={styles.actions}>
          <button 
            onClick={() => setJsonView(!jsonView)}
            className={jsonView ? styles.active : ''}
            title="Toggle JSON view"
          >
            <FiCode />
          </button>
          <button 
            onClick={() => copyToClipboard(message)}
            title="Copy message"
          >
            <FiCopy />
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <pre>{formatMessage(message)}</pre>
      </div>
      <div className={styles.footer}>
        <span>Last update: {new Date(timestamp).toLocaleString()}</span>
      </div>
    </div>
  )
} 
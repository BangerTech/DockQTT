import { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import styles from '../styles/PublishForm.module.css'

export default function PublishForm({ onPublish }) {
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [retained, setRetained] = useState(false)
  const [qos, setQos] = useState(0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (topic && message) {
      onPublish(topic, message, retained, parseInt(qos))
      setMessage('')  // Clear message after publish
    }
  }

  return (
    <form className={styles.publishForm} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="topic">Topic</label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic..."
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message..."
          required
        />
      </div>

      <div className={styles.options}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={retained}
            onChange={(e) => setRetained(e.target.checked)}
          />
          Retained
        </label>

        <div className={styles.qos}>
          <label htmlFor="qos">QoS</label>
          <select
            id="qos"
            value={qos}
            onChange={(e) => setQos(e.target.value)}
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>
      </div>

      <button type="submit" className={styles.publishButton}>
        <FiSend /> Publish
      </button>
    </form>
  )
} 
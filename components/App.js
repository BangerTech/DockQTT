import { useState } from 'react'
import styles from '../styles/App.module.css'

export default function App({ topics, connected, onPublish }) {
  const [activeTab, setActiveTab] = useState('subscribe')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [publishTopic, setPublishTopic] = useState('')
  const [publishMessage, setPublishMessage] = useState('')

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Topics</h2>
        <div className={styles.topicList}>
          {Object.entries(topics).map(([topic, data]) => (
            <div 
              key={topic} 
              className={`${styles.topicItem} ${selectedTopic === topic ? styles.selected : ''}`}
              onClick={() => setSelectedTopic(topic)}
            >
              <span>{topic}</span>
              <span className={styles.timestamp}>
                {new Date(data.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'subscribe' ? styles.active : ''}`}
            onClick={() => setActiveTab('subscribe')}
          >
            Subscribe
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'publish' ? styles.active : ''}`}
            onClick={() => setActiveTab('publish')}
          >
            Publish
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'subscribe' ? (
            <div className={styles.messages}>
              {selectedTopic && topics[selectedTopic] && (
                <div className={styles.messageContent}>
                  <h3>Topic: {selectedTopic}</h3>
                  <pre>{topics[selectedTopic].message}</pre>
                  <div className={styles.messageInfo}>
                    Received: {new Date(topics[selectedTopic].timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.publishForm}>
              <div className={styles.formGroup}>
                <label>Topic:</label>
                <input 
                  type="text" 
                  value={publishTopic}
                  onChange={(e) => setPublishTopic(e.target.value)}
                  placeholder="Enter topic"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Message:</label>
                <textarea
                  value={publishMessage}
                  onChange={(e) => setPublishMessage(e.target.value)}
                  placeholder="Enter message"
                />
              </div>
              <button 
                onClick={() => {
                  onPublish(publishTopic, publishMessage)
                  setPublishMessage('')
                }}
                disabled={!publishTopic}
              >
                Publish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
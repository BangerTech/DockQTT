import { useState } from 'react'
import MessageView from './MessageView'
import PublishForm from './PublishForm'
import styles from '../styles/Content.module.css'

export default function Content({ topics, selectedTopic, onPublish }) {
  const [activeTab, setActiveTab] = useState('subscribe')

  return (
    <div className={styles.content}>
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

      {activeTab === 'subscribe' ? (
        <MessageView 
          topics={topics}
          selectedTopic={selectedTopic}
        />
      ) : (
        <PublishForm onPublish={onPublish} />
      )}
    </div>
  )
} 
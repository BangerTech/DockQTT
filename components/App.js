import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Content from './Content'
import styles from '../styles/App.module.css'

export default function App({ topics, connected, onPublish }) {
  const [darkMode, setDarkMode] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)

  return (
    <div className={`${styles.app} ${darkMode ? styles.dark : ''}`}>
      <Header 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        connected={connected}
      />
      <main className={styles.main}>
        <Sidebar 
          topics={topics}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
        />
        <Content 
          topics={topics}
          selectedTopic={selectedTopic}
          onPublish={onPublish}
        />
      </main>
    </div>
  )
} 
import { useState } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import TopicTree from './TopicTree'
import styles from '../styles/Sidebar.module.css'

export default function Sidebar({ topics, selectedTopic, onSelectTopic }) {
  const [filter, setFilter] = useState('')

  return (
    <aside className={styles.sidebar}>
      <div className={styles.search}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search topics..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {filter && (
          <button 
            className={styles.clearButton}
            onClick={() => setFilter('')}
          >
            <FiX />
          </button>
        )}
      </div>
      <TopicTree 
        topics={topics}
        selectedTopic={selectedTopic}
        onSelectTopic={onSelectTopic}
        filter={filter}
      />
    </aside>
  )
} 
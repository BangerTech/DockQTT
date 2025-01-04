import { useState } from 'react';
import styles from '../styles/TopicGroup.module.css';

export default function TopicGroup({ group, onSelectTopic, selectedTopic }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className={styles.group}>
      <div 
        className={styles.groupHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.groupInfo}>
          <span className={styles.groupIcon}>
            {isExpanded ? '▼' : '▶'}
          </span>
          <h3>{group.name}</h3>
          <span className={styles.messageCount}>
            {group.totalMessages} messages
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className={styles.subGroups}>
          {Object.entries(group.subGroups).map(([name, subGroup]) => (
            <SubGroup 
              key={name}
              subGroup={subGroup}
              onSelectTopic={onSelectTopic}
              selectedTopic={selectedTopic}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubGroup({ subGroup, onSelectTopic, selectedTopic }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className={styles.subGroup}>
      <div 
        className={styles.subGroupHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={styles.groupIcon}>
          {isExpanded ? '▼' : '▶'}
        </span>
        <h4>{subGroup.name}</h4>
        <span className={styles.messageCount}>
          {subGroup.totalMessages}
        </span>
      </div>
      
      {isExpanded && (
        <div className={styles.topics}>
          {subGroup.topics.map((topic) => (
            <div
              key={topic.fullTopic}
              className={`${styles.topic} ${
                selectedTopic === topic.fullTopic ? styles.selected : ''
              }`}
              onClick={() => onSelectTopic(topic.fullTopic)}
            >
              <div className={styles.topicInfo}>
                <span className={styles.topicName}>{topic.name}</span>
                <span className={styles.topicCount}>{topic.count}</span>
              </div>
              <div className={styles.lastMessage}>
                {typeof topic.lastMessage === 'string' && 
                 topic.lastMessage.length > 50
                  ? `${topic.lastMessage.substring(0, 50)}...`
                  : topic.lastMessage}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
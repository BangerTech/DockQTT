import { useState, useEffect } from 'react'
import { FiChevronRight, FiCircle } from 'react-icons/fi'
import styles from '../styles/TopicTree.module.css'

export default function TopicTree({ topics, selectedTopic, onSelectTopic, filter }) {
  const [expandedNodes, setExpandedNodes] = useState({})
  
  // Baut eine Baumstruktur aus den Topics
  const buildTopicTree = () => {
    const tree = {}
    
    Object.entries(topics).forEach(([topic, data]) => {
      if (!filter || topic.toLowerCase().includes(filter.toLowerCase())) {
        const parts = topic.split('/')
        let current = tree
        
        parts.forEach((part, index) => {
          if (!current[part]) {
            current[part] = {
              children: {},
              isLeaf: index === parts.length - 1,
              fullTopic: parts.slice(0, index + 1).join('/'),
              data: index === parts.length - 1 ? data : null
            }
          }
          current = current[part].children
        })
      }
    })
    
    return tree
  }

  const toggleNode = (path) => {
    setExpandedNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const renderNode = (node, name, path = '') => {
    const hasChildren = Object.keys(node.children).length > 0
    const isExpanded = expandedNodes[path]
    const isSelected = path === selectedTopic
    
    return (
      <div key={path} className={styles.node}>
        <div 
          className={`${styles.nodeHeader} ${isSelected ? styles.selected : ''}`}
          onClick={() => {
            if (node.isLeaf) {
              onSelectTopic(path)
            } else {
              toggleNode(path)
            }
          }}
        >
          {hasChildren && (
            <FiChevronRight 
              className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
            />
          )}
          {node.isLeaf && <FiCircle className={styles.topicIcon} />}
          <span className={styles.nodeName}>{name}</span>
          {node.data && (
            <span className={styles.messageCount}>
              {node.data.count}
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className={styles.children}>
            {Object.entries(node.children).map(([childName, childNode]) => 
              renderNode(childNode, childName, path ? `${path}/${childName}` : childName)
            )}
          </div>
        )}
      </div>
    )
  }

  const tree = buildTopicTree()

  return (
    <div className={styles.topicTree}>
      {Object.entries(tree).map(([name, node]) => 
        renderNode(node, name, name)
      )}
    </div>
  )
} 
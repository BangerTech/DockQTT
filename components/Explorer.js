import { useState, useRef, useEffect } from 'react'
import { 
  FiSend, 
  FiCopy, 
  FiCode, 
  FiSun, 
  FiMoon, 
  FiSearch, 
  FiMessageSquare, 
  FiRefreshCw, 
  FiActivity,
  FiBox,
  FiSettings,
  FiChevronRight,
  FiBattery,
  FiPower,
  FiWifi,
  FiClock,
  FiArrowDown,
  FiChevronsDown,
  FiTrendingUp,
  FiAlertCircle,
  FiMessageCircle,
  FiHome,
  FiZap,
  FiRadio,
  FiPrinter,
  FiFolder,
  FiTerminal,
  FiCircle,
  FiChevronDown,
  FiChevronUp,
  FiTrash2,
  FiTrash,
  FiList
} from 'react-icons/fi'
import styles from '../styles/Explorer.module.css'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Explorer({ broker, topics, selectedTopic, onSelectTopic, onPublish, onDisconnect }) {
  const [darkMode, setDarkMode] = useState(false)
  const [jsonView, setJsonView] = useState(false)
  const [publishMessage, setPublishMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedGroups, setExpandedGroups] = useState({})
  const [expandedDevices, setExpandedDevices] = useState({})
  const [autoScroll, setAutoScroll] = useState(true)
  const [messageHistory, setMessageHistory] = useState({})
  const [notifications, setNotifications] = useState([])
  const [selectedView, setSelectedView] = useState('raw') // 'raw', 'json', 'chart'
  const [historyLimit, setHistoryLimit] = useState(50)
  const messageContentRef = useRef(null)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)
  const [activeTab, setActiveTab] = useState('subscribe')
  const [topicFilter, setTopicFilter] = useState('')
  const [messageView, setMessageView] = useState('raw')
  const [publishTopic, setPublishTopic] = useState('')
  const [retained, setRetained] = useState(false)
  const [qos, setQos] = useState('0')

  // Neue Hilfsfunktion für Zeitstempel
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString()
    }
    return date.toLocaleString()
  }

  // Scroll-Handler
  const handleMessageScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    setIsScrolledToBottom(scrollHeight - scrollTop === clientHeight)
  }

  // Effekt für Auto-Scroll
  useEffect(() => {
    if (autoScroll && isScrolledToBottom && messageContentRef.current) {
      messageContentRef.current.scrollTop = messageContentRef.current.scrollHeight
    }
  }, [topics, selectedTopic, autoScroll, isScrolledToBottom])

  // Effekt für Message History
  useEffect(() => {
    if (selectedTopic && topics[selectedTopic]) {
      updateMessageHistory(selectedTopic, topics[selectedTopic].message)
    }
  }, [selectedTopic, topics])

  // Effekt für Desktop Notifications
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
  }, [])

  // Hilfsfunktionen für das Handling der Expand/Collapse-Funktionalität
  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
  }

  const toggleDevice = (deviceKey) => {
    setExpandedDevices(prev => ({
      ...prev,
      [deviceKey]: !prev[deviceKey]
    }))
  }

  // Gruppiere Topics nach Typen
  const groupTopics = () => {
    const groups = {}

    Object.entries(topics).forEach(([topic, data]) => {
      const parts = topic.split('/')
      const mainGroup = parts[0]
      
      // Erstelle Gruppe falls noch nicht vorhanden
      if (!groups[mainGroup]) {
        groups[mainGroup] = {
          name: getGroupDisplayName(mainGroup),
          icon: getGroupIcon(mainGroup),
          devices: {},
          topics: {},
          messageCount: 0,
          topicCount: 0
        }
      }

      // Versuche das Topic-Pattern zu erkennen
      const pattern = detectTopicPattern(parts)
      
      switch (pattern) {
        case 'device':
          // Topics mit Geräte-Struktur (z.B. protocol/device/function)
          handleDeviceTopic(groups[mainGroup], parts, topic, data)
          break
        
        case 'bridge':
          // Bridge/System Topics (z.B. zigbee2mqtt/bridge)
          groups[mainGroup].topics[topic] = data
          break
        
        case 'status':
          // Status-Topics (z.B. protocol/status)
          groups[mainGroup].topics[topic] = data
          break
        
        default:
          // Alle anderen Topics
          groups[mainGroup].topics[topic] = data
      }

      // Aktualisiere Zähler
      groups[mainGroup].messageCount += data.count || 0
      groups[mainGroup].topicCount++
    })

    return groups
  }

  // Erkennt das Topic-Pattern
  const detectTopicPattern = (parts) => {
    if (parts.length < 2) return 'single'
    
    // Bekannte Bridge/System-Patterns
    if (parts[1] === 'bridge' || parts[1] === 'system' || parts[1] === '$SYS') {
      return 'bridge'
    }

    // Status-Pattern
    if (parts[1] === 'status' || parts[1] === 'state' || parts[1] === 'tele') {
      return 'status'
    }

    // Prüfe auf Geräte-Pattern
    const hasDeviceIndicators = [
      'sensor',
      'light',
      'switch',
      'plug',
      'climate',
      'device',
      'node'
    ].some(indicator => parts.some(part => part.toLowerCase().includes(indicator)))

    if (hasDeviceIndicators || parts.length >= 3) {
      return 'device'
    }

    return 'other'
  }

  // Generische Behandlung von Geräte-Topics
  const handleDeviceTopic = (group, parts, topic, data) => {
    // Versuche den Gerätenamen zu extrahieren
    const deviceName = extractDeviceName(parts)
    
    if (!group.devices[deviceName]) {
      group.devices[deviceName] = {
        name: formatDeviceName(deviceName),
        topics: {},
        status: {}
      }
    }

    group.devices[deviceName].topics[topic] = data

    // Versuche Status-Informationen zu extrahieren
    try {
      const message = JSON.parse(data.message)
      updateDeviceStatus(group.devices[deviceName].status, message)
    } catch {}
  }

  // Extrahiert den Gerätenamen aus den Topic-Teilen
  const extractDeviceName = (parts) => {
    // Entferne häufige Präfixe und Suffixe
    const filtered = parts.filter(part => 
      !['status', 'state', 'set', 'get', 'config', 'availability'].includes(part)
    )
    
    // Verwende den zweiten Teil als Gerätenamen (nach dem Protokoll)
    return filtered[1] || 'unknown'
  }

  // Formatiert den Gerätenamen für die Anzeige
  const formatDeviceName = (name) => {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
      .trim()
  }

  // Generische Status-Erkennung
  const updateDeviceStatus = (status, message) => {
    // Bekannte Status-Felder
    const statusFields = {
      battery: ['battery', 'batteryLevel', 'bat'],
      linkquality: ['linkquality', 'signal', 'rssi'],
      state: ['state', 'status', 'power'],
      temperature: ['temperature', 'temp'],
      humidity: ['humidity', 'hum'],
      pressure: ['pressure', 'press'],
      contact: ['contact', 'opened', 'closed'],
      occupancy: ['occupancy', 'presence', 'motion'],
      power: ['power', 'energy', 'current']
    }

    // Durchsuche die Nachricht nach bekannten Status-Feldern
    Object.entries(statusFields).forEach(([statusKey, possibleKeys]) => {
      possibleKeys.forEach(key => {
        if (message[key] !== undefined) {
          status[statusKey] = message[key]
        }
      })
    })

    // Speichere auch unbekannte numerische und boolesche Werte
    Object.entries(message).forEach(([key, value]) => {
      if (typeof value === 'number' || typeof value === 'boolean') {
        status[key] = value
      }
    })
  }

  // Hilfsfunktion für schönere Gruppennamen
  const getGroupDisplayName = (groupName) => {
    const nameMap = {
      'zigbee2mqtt': 'Zigbee Geräte',
      'homeassistant': 'Home Assistant',
      'tasmota': 'Tasmota Geräte',
      'shellies': 'Shelly Geräte',
      'tele': 'Telemetrie',
      'octoprint': 'OctoPrint',
      '$SYS': 'System',
      'cmd': 'Kommandos',
      'switchbot': 'SwitchBot',
      'wled': 'WLED'
    }
    return nameMap[groupName] || groupName
  }

  // Hilfsfunktion für Gruppen-Icons
  const getGroupIcon = (groupName) => {
    const iconMap = {
      'zigbee2mqtt': <FiBox className={styles.groupIcon} />,
      'homeassistant': <FiHome className={styles.groupIcon} />,
      'tasmota': <FiZap className={styles.groupIcon} />,
      'shellies': <FiPower className={styles.groupIcon} />,
      'tele': <FiRadio className={styles.groupIcon} />,
      'octoprint': <FiPrinter className={styles.groupIcon} />,
      '$SYS': <FiSettings className={styles.groupIcon} />,
      'cmd': <FiTerminal className={styles.groupIcon} />,
      'switchbot': <FiActivity className={styles.groupIcon} />,
      'wled': <FiSun className={styles.groupIcon} />,
      // Standardicon für unbekannte Gruppen
      'default': <FiFolder className={styles.groupIcon} />
    }
    return iconMap[groupName] || iconMap.default
  }

  // Filtern der Topics basierend auf der Suche
  const filterGroups = (groups) => {
    const filtered = {}
    
    Object.entries(groups).forEach(([groupKey, group]) => {
      if (group.devices) {
        // Filtere Geräte-basierte Gruppen
        const filteredDevices = {}
        Object.entries(group.devices).forEach(([deviceKey, device]) => {
          const filteredTopics = Object.entries(device.topics)
            .filter(([topic]) => topic.toLowerCase().includes(searchTerm.toLowerCase()))
            .reduce((acc, [topic, data]) => {
              acc[topic] = data
              return acc
            }, {})
            
          if (Object.keys(filteredTopics).length > 0) {
            filteredDevices[deviceKey] = {
              ...device,
              topics: filteredTopics
            }
          }
        })
        
        if (Object.keys(filteredDevices).length > 0) {
          filtered[groupKey] = {
            ...group,
            devices: filteredDevices
          }
        }
      } else {
        // Filtere System-Topics
        const filteredTopics = Object.entries(group.topics)
          .filter(([topic]) => topic.toLowerCase().includes(searchTerm.toLowerCase()))
          .reduce((acc, [topic, data]) => {
            acc[topic] = data
            return acc
          }, {})
          
        if (Object.keys(filteredTopics).length > 0) {
          filtered[groupKey] = {
            ...group,
            topics: filteredTopics
          }
        }
      }
    })
    
    return filtered
  }

  // Verwende die neue Filterfunktion
  const filteredGroups = filterGroups(groupTopics())

  // Formatiere die Nachricht für die Anzeige
  const formatMessage = (message) => {
    try {
      if (jsonView) {
        const parsed = JSON.parse(message)
        return JSON.stringify(parsed, null, 2)
      }
      return message
    } catch {
      return message
    }
  }

  // Hilfsfunktion zum Parsen verschiedener Payload-Formate
  const parsePayload = (message) => {
    // Versuche JSON
    try {
      return { type: 'json', data: JSON.parse(message) }
    } catch {}

    // Versuche XML
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(message, "text/xml")
      if (xmlDoc.getElementsByTagName("parsererror").length === 0) {
        return { type: 'xml', data: xmlDoc }
      }
    } catch {}

    // Prüfe auf numerischen Wert
    if (!isNaN(message)) {
      return { type: 'number', data: parseFloat(message) }
    }

    // Fallback: Plain Text
    return { type: 'text', data: message }
  }

  // Funktion zum Aktualisieren der History
  const updateMessageHistory = (topic, message) => {
    const timestamp = Date.now()
    const parsed = parsePayload(message)
    
    setMessageHistory(prev => {
      const topicHistory = prev[topic] || []
      const newHistory = [
        ...topicHistory,
        { timestamp, message, parsed }
      ].slice(-historyLimit)

      // Prüfe auf wichtige Änderungen für Benachrichtigungen
      checkForNotifications(topic, parsed, topicHistory)

      return {
        ...prev,
        [topic]: newHistory
      }
    })
  }

  // Benachrichtigungsfunktion
  const checkForNotifications = (topic, parsed, history) => {
    if (!history.length) return

    const lastParsed = history[history.length - 1].parsed
    
    // Prüfe auf signifikante Änderungen
    if (parsed.type === 'number') {
      const change = Math.abs(parsed.data - lastParsed.data)
      const threshold = 10 // Konfigurierbar
      
      if (change > threshold) {
        addNotification({
          type: 'warning',
          title: 'Signifikante Änderung',
          message: `${topic}: Änderung um ${change.toFixed(2)}`,
          timestamp: Date.now()
        })
      }
    }
    
    // Prüfe auf Statusänderungen
    if (parsed.type === 'json' && parsed.data.state !== lastParsed.data.state) {
      addNotification({
        type: 'info',
        title: 'Statusänderung',
        message: `${topic}: ${lastParsed.data.state} → ${parsed.data.state}`,
        timestamp: Date.now()
      })
    }
  }

  // Benachrichtigungsverwaltung
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 50))
    
    // Optional: Desktop Notification
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      })
    }
  }

  // Render-Funktion für verschiedene Datenvisualisierungen
  const renderMessageContent = (topic) => {
    const history = messageHistory[topic] || []
    const currentMessage = topics[topic]?.message

    switch (selectedView) {
      case 'chart':
        if (history.length === 0) return <p>Keine Daten verfügbar</p>

        const chartData = history.map(entry => ({
          timestamp: entry.timestamp,
          value: entry.parsed.type === 'number' ? 
            entry.parsed.data : 
            entry.parsed.type === 'json' && !isNaN(entry.parsed.data.value) ?
              entry.parsed.data.value :
              null
        })).filter(d => d.value !== null)

        return (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(ts) => new Date(ts).toLocaleString()}
                  formatter={(value) => [value.toFixed(2), 'Wert']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--accent-color)" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )

      case 'json':
        try {
          const parsed = JSON.parse(currentMessage)
          return (
            <pre className={styles.jsonView}>
              {JSON.stringify(parsed, null, 2)}
            </pre>
          )
        } catch {
          return <pre>{currentMessage}</pre>
        }

      default:
        return <pre>{currentMessage}</pre>
    }
  }

  const handleConnect = () => {
    // Implementiere die Connect-Funktion
  }

  const handlePublish = () => {
    // Implementiere die Publish-Funktion
  }

  return (
    <div className={styles.explorer}>
      {/* Hauptnavigation oben */}
      <nav className={styles.mainNav}>
        <div className={styles.connectionInfo}>
          <span className={styles.status}>
            <FiCircle className={broker.connected ? styles.connected : styles.disconnected} />
            {broker.host}:{broker.port}
          </span>
        </div>
        <div className={styles.mainActions}>
          <button onClick={handleConnect} title="Connect/Disconnect">
            <FiPower />
          </button>
          <button onClick={() => setDarkMode(!darkMode)} title="Theme">
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </nav>

      {/* Hauptbereich mit Tabs */}
      <div className={styles.mainContent}>
        <div className={styles.tabBar}>
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
          <button 
            className={`${styles.tab} ${activeTab === 'scripts' ? styles.active : ''}`}
            onClick={() => setActiveTab('scripts')}
          >
            Scripts
          </button>
        </div>

        {/* Subscribe Tab */}
        {activeTab === 'subscribe' && (
          <div className={styles.subscribeView}>
            <div className={styles.topicTree}>
              <div className={styles.treeHeader}>
                <input 
                  type="text" 
                  placeholder="Filter Topics..."
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                />
                <div className={styles.treeActions}>
                  <button title="Expand All"><FiChevronDown /></button>
                  <button title="Collapse All"><FiChevronUp /></button>
                  <button title="Clear"><FiTrash2 /></button>
                </div>
              </div>
              <div className={styles.tree}>
                {/* Topic Tree Component */}
              </div>
            </div>
            <div className={styles.messageView}>
              <div className={styles.messageToolbar}>
                <div className={styles.viewControls}>
                  <button 
                    className={messageView === 'table' ? styles.active : ''}
                    onClick={() => setMessageView('table')}
                  >
                    <FiList /> Table
                  </button>
                  <button 
                    className={messageView === 'raw' ? styles.active : ''}
                    onClick={() => setMessageView('raw')}
                  >
                    <FiCode /> Raw
                  </button>
                </div>
                <div className={styles.messageActions}>
                  <button title="Clear Messages"><FiTrash /></button>
                  <button title="Copy"><FiCopy /></button>
                </div>
              </div>
              {messageView === 'table' ? (
                <div className={styles.messageTable}>
                  {/* Message Table Component */}
                </div>
              ) : (
                <div className={styles.messageRaw}>
                  {/* Raw Message View */}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Publish Tab */}
        {activeTab === 'publish' && (
          <div className={styles.publishView}>
            <div className={styles.publishForm}>
              <div className={styles.topicInput}>
                <label>Topic:</label>
                <input type="text" value={publishTopic} onChange={(e) => setPublishTopic(e.target.value)} />
              </div>
              <div className={styles.messageInput}>
                <label>Message:</label>
                <textarea value={publishMessage} onChange={(e) => setPublishMessage(e.target.value)} />
              </div>
              <div className={styles.publishOptions}>
                <label>
                  <input type="checkbox" checked={retained} onChange={(e) => setRetained(e.target.checked)} />
                  Retained
                </label>
                <select value={qos} onChange={(e) => setQos(e.target.value)}>
                  <option value="0">QoS 0</option>
                  <option value="1">QoS 1</option>
                  <option value="2">QoS 2</option>
                </select>
              </div>
              <button className={styles.publishButton} onClick={handlePublish}>
                <FiSend /> Publish
              </button>
            </div>
            <div className={styles.publishHistory}>
              <h3>History</h3>
              {/* Publish History List */}
            </div>
          </div>
        )}

        {/* Scripts Tab */}
        {activeTab === 'scripts' && (
          <div className={styles.scriptsView}>
            {/* Scripts Implementation */}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <span>{broker.connected ? 'Connected' : 'Disconnected'}</span>
        <span>{selectedTopic}</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  )
} 
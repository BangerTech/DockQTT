import { FiSun, FiMoon, FiCircle } from 'react-icons/fi'
import styles from '../styles/Header.module.css'

export default function Header({ darkMode, setDarkMode, connected }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>MQTT Explorer</h1>
        <div className={styles.status}>
          <FiCircle className={connected ? styles.connected : styles.disconnected} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      <button 
        className={styles.themeToggle}
        onClick={() => setDarkMode(!darkMode)}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? <FiSun /> : <FiMoon />}
      </button>
    </header>
  )
} 
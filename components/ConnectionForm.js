import { useState } from 'react'
import { FiServer, FiWifi, FiLock, FiUser, FiChevronRight } from 'react-icons/fi'
import styles from '../styles/ConnectionForm.module.css'

export default function ConnectionForm({ onConnect, error, connecting }) {
  const [brokerConfig, setBrokerConfig] = useState({
    host: '',
    port: '1883',
    username: '',
    password: '',
  })

  const handleConnect = (e) => {
    e.preventDefault()
    onConnect(brokerConfig)
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.logoSection}>
          <FiServer className={styles.logo} />
          <h1>MQTT Explorer</h1>
          <p>Connect to your MQTT broker</p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleConnect} className={styles.form}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <FiWifi className={styles.inputIcon} />
              <div className={styles.inputFields}>
                <input
                  type="text"
                  placeholder="Broker Address"
                  value={brokerConfig.host}
                  onChange={(e) => setBrokerConfig(prev => ({
                    ...prev,
                    host: e.target.value
                  }))}
                  required
                  aria-label="Broker Address"
                  minLength={3}
                />
                <input
                  type="text"
                  placeholder="Port (default: 1883)"
                  value={brokerConfig.port}
                  onChange={(e) => setBrokerConfig(prev => ({
                    ...prev,
                    port: e.target.value
                  }))}
                  required
                  aria-label="Port"
                  pattern="[0-9]*"
                />
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <FiUser className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Username (optional)"
                value={brokerConfig.username}
                onChange={(e) => setBrokerConfig(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
                aria-label="Username"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Password (optional)"
                value={brokerConfig.password}
                onChange={(e) => setBrokerConfig(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                aria-label="Password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.connectButton}
            disabled={!brokerConfig.host || !brokerConfig.port || connecting}
          >
            {connecting ? (
              <>
                <span>Connecting...</span>
                <div className={styles.spinner} />
              </>
            ) : (
              <>
                <span>Connect</span>
                <FiChevronRight />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 
const winston = require('winston')
const { format } = winston

// Erstellen Sie ein ansprechendes Konsolenformat
const consoleFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`
  
  if (Object.keys(metadata).length > 0) {
    msg += '\n' + JSON.stringify(metadata, null, 2)
  }
  
  return msg
})

const logger = winston.createLogger({
  level: 'debug', // Setzen Sie das Level auf debug für mehr Details
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.colorize(),
    format.errors({ stack: true }),
    consoleFormat
  ),
  transports: [
    // Console Transport für Live-Logs
    new winston.transports.Console({
      stderrLevels: ['error']
    }),
    // File Transports für die Persistenz
    new winston.transports.File({ 
      filename: '/app/logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: '/app/logs/combined.log' 
    })
  ]
})

module.exports = logger 
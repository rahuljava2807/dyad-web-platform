import winston from 'winston'
import path from 'path'

// Create logs directory if it doesn't exist
const fs = require('fs')
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Custom format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString ? '\n' + metaString : ''}`
  })
)

// Custom format for production
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  defaultMeta: {
    service: 'dyad-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? winston.format.simple()
        : winston.format.combine(
            winston.format.colorize(),
            developmentFormat
          )
    }),

    // File transport for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],

  // Don't exit on handled exceptions
  exitOnError: false,

  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
})

// Create a stream object with a 'write' function that will be used by Morgan
export const loggerStream = {
  write: (message: string) => {
    // Remove trailing newline
    logger.info(message.trim())
  }
}

// Helper functions for different log levels
export const logError = (message: string, meta?: any) => {
  logger.error(message, meta)
}

export const logWarning = (message: string, meta?: any) => {
  logger.warn(message, meta)
}

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta)
}

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta)
}

// Development helper - pretty print objects
export const logObject = (obj: any, label?: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(label ? `${label}:` : 'Object:', JSON.stringify(obj, null, 2))
  } else {
    logger.debug(label || 'Object', obj)
  }
}

// Performance timing helper
export const createTimer = (label: string) => {
  const start = Date.now()
  return {
    end: (meta?: any) => {
      const duration = Date.now() - start
      logger.debug(`${label} completed`, { duration, ...meta })
      return duration
    }
  }
}
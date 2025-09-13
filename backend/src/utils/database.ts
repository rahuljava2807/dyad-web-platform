import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

declare global {
  var __db__: PrismaClient | undefined
}

let db: PrismaClient

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
  })
} else {
  // In development, we want to avoid creating new instances of PrismaClient
  // on every hot reload, so we store it in a global variable
  if (!global.__db__) {
    global.__db__ = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    })
  }
  db = global.__db__
}

// Set up logging for Prisma events
db.$on('query', (e) => {
  logger.debug('Database Query', {
    query: e.query,
    params: e.params,
    duration: `${e.duration}ms`,
    target: e.target
  })
})

db.$on('info', (e) => {
  logger.info('Database Info', { message: e.message, target: e.target })
})

db.$on('warn', (e) => {
  logger.warn('Database Warning', { message: e.message, target: e.target })
})

db.$on('error', (e) => {
  logger.error('Database Error', { message: e.message, target: e.target })
})

export async function connectDatabase(): Promise<void> {
  try {
    await db.$connect()
    logger.info('Database connected successfully')

    // Test the connection
    await db.$queryRaw`SELECT 1`
    logger.info('Database connection test successful')
  } catch (error) {
    logger.error('Failed to connect to database:', error)
    throw error
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await db.$disconnect()
    logger.info('Database disconnected successfully')
  } catch (error) {
    logger.error('Error disconnecting from database:', error)
    throw error
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    logger.error('Database health check failed:', error)
    return false
  }
}

// Transaction wrapper with retry logic
export async function withTransaction<T>(
  operation: (tx: PrismaClient) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.$transaction(operation, {
        timeout: 10000, // 10 seconds
        isolationLevel: 'ReadCommitted'
      })
    } catch (error) {
      lastError = error as Error
      logger.warn(`Transaction attempt ${attempt} failed`, {
        error: lastError.message,
        attempt,
        maxRetries
      })

      if (attempt === maxRetries) {
        break
      }

      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  logger.error('Transaction failed after all retries', {
    error: lastError?.message,
    maxRetries
  })
  throw lastError
}

// Utility function to safely handle database operations
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T | (() => T),
  operationName: string = 'Database operation'
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    logger.error(`${operationName} failed`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return typeof fallback === 'function' ? (fallback as () => T)() : fallback
  }
}

export { db }
export default db
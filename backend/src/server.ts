import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import dotenv from 'dotenv'

import { logger } from './utils/logger'
import { connectDatabase } from './utils/database'
import { setupRoutes } from './routes'
import { errorHandler } from './middleware/error-handler'
import { authMiddleware } from './middleware/auth'
import { setupWebSocket } from './services/websocket'
import { queueService } from './services/queue'
import { cronService } from './services/cron'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
})

const PORT = process.env.PORT || 8000

async function startServer() {
  try {
    // Database connection
    await connectDatabase()
    logger.info('Database connected successfully')

    // Security middleware
    app.use(helmet())
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    }))

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    })
    app.use('/api/', limiter)

    // AI generation rate limiting (stricter)
    const aiLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // limit each IP to 10 AI requests per minute
      message: 'Too many AI requests, please try again later.',
    })
    app.use('/api/ai/', aiLimiter)

    // General middleware
    app.use(compression())
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // Logging
    app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }))

    // Health check
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      })
    })

    // API routes
    setupRoutes(app)

    // WebSocket setup
    setupWebSocket(io)

    // Error handling middleware (must be last)
    app.use(errorHandler)

    // Start queue workers
    await queueService.start()
    logger.info('Queue workers started')

    // Start cron jobs
    cronService.start()
    logger.info('Cron jobs started')

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
    })

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully')

      server.close(() => {
        logger.info('HTTP server closed')
      })

      await queueService.close()
      logger.info('Queue workers closed')

      cronService.stop()
      logger.info('Cron jobs stopped')

      process.exit(0)
    })

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully')

      server.close(() => {
        logger.info('HTTP server closed')
      })

      await queueService.close()
      logger.info('Queue workers closed')

      cronService.stop()
      logger.info('Cron jobs stopped')

      process.exit(0)
    })

  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

if (require.main === module) {
  startServer()
}

export { app, server, io }
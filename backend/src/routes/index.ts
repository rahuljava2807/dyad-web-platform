import { Express, Router } from 'express'
import authRoutes from './auth'
import projectRoutes from './projects'
import aiRoutes from './ai'
// import userRoutes from './users'
// import yaviRoutes from './yavi'
// import adminRoutes from './admin'

export function setupRoutes(app: Express) {
  const apiRouter = Router()

  // Health check
  apiRouter.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'dyad-api',
      version: process.env.npm_package_version || '1.0.0',
    })
  })

  // Route modules
  apiRouter.use('/auth', authRoutes)
  // apiRouter.use('/users', userRoutes)
  apiRouter.use('/projects', projectRoutes)
  // apiRouter.use('/ai', aiRoutes)
  // apiRouter.use('/yavi', yaviRoutes)
  // apiRouter.use('/admin', adminRoutes)

  // Mount API routes
  app.use('/api', apiRouter)

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `API endpoint ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    })
  })

  // Global 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    })
  })
}
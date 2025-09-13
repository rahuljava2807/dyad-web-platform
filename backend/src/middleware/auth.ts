import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../utils/database'
import { logger } from '../utils/logger'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    avatarUrl?: string
    createdAt: Date
  }
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided'
      })
      return
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_jwt_secret_here'
      ) as { userId: string }

      const user = await db.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        })
        return
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl || undefined,
        createdAt: user.createdAt
      }

      next()
    } catch (jwtError) {
      logger.warn('Invalid JWT token', {
        error: jwtError instanceof Error ? jwtError.message : 'Unknown error',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      })

      res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
      return
    }
  } catch (error) {
    logger.error('Auth middleware error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
    return
  }
}

// Optional auth middleware - doesn't fail if no token
export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next()
      return
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_jwt_secret_here'
      ) as { userId: string }

      const user = await db.user.findUnique({
        where: { id: decoded.userId }
      })

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl || undefined,
          createdAt: user.createdAt
        }
      }
    } catch (jwtError) {
      // Silently ignore invalid tokens in optional auth
      logger.debug('Invalid token in optional auth', {
        error: jwtError instanceof Error ? jwtError.message : 'Unknown error'
      })
    }

    next()
  } catch (error) {
    logger.error('Optional auth middleware error:', error)
    next() // Continue anyway
  }
}
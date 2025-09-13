import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface ApiError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let error = { ...err }
  error.message = err.message

  // Log error
  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found'
    error = { ...err, message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    const message = 'Duplicate field value entered'
    error = { ...err, message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message)
    error = { ...err, message: message.join(', '), statusCode: 400 }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token'
    error = { ...err, message, statusCode: 401 }
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired'
    error = { ...err, message, statusCode: 401 }
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any
    switch (prismaErr.code) {
      case 'P2002':
        error = { ...err, message: 'Duplicate field value entered', statusCode: 400 }
        break
      case 'P2025':
        error = { ...err, message: 'Record not found', statusCode: 404 }
        break
      case 'P2003':
        error = { ...err, message: 'Foreign key constraint failed', statusCode: 400 }
        break
      default:
        error = { ...err, message: 'Database error', statusCode: 500 }
    }
  }

  const statusCode = error.statusCode || 500
  const message = error.message || 'Server Error'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  })
}

// Async error handler wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 404 handler
export function notFound(req: Request, res: Response, next: NextFunction): void {
  const error = new Error(`Not found - ${req.originalUrl}`) as ApiError
  error.statusCode = 404
  next(error)
}

// Custom error classes
export class BadRequestError extends Error {
  statusCode = 400
  isOperational = true

  constructor(message: string) {
    super(message)
    this.name = 'BadRequestError'
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401
  isOperational = true

  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  statusCode = 403
  isOperational = true

  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends Error {
  statusCode = 404
  isOperational = true

  constructor(message: string = 'Not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  statusCode = 409
  isOperational = true

  constructor(message: string = 'Conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class InternalServerError extends Error {
  statusCode = 500
  isOperational = true

  constructor(message: string = 'Internal server error') {
    super(message)
    this.name = 'InternalServerError'
  }
}
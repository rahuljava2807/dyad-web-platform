import { Request, Response, NextFunction } from 'express'
import { z, ZodSchema } from 'zod'
import { logger } from '../utils/logger'

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))

        logger.warn('Request validation failed', {
          url: req.originalUrl,
          method: req.method,
          errors: errorMessages,
          body: req.body
        })

        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: errorMessages
        })
      }

      logger.error('Unexpected validation error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))

        logger.warn('Query validation failed', {
          url: req.originalUrl,
          method: req.method,
          errors: errorMessages,
          query: req.query
        })

        return res.status(400).json({
          success: false,
          error: 'Query validation error',
          details: errorMessages
        })
      }

      logger.error('Unexpected query validation error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))

        logger.warn('Params validation failed', {
          url: req.originalUrl,
          method: req.method,
          errors: errorMessages,
          params: req.params
        })

        return res.status(400).json({
          success: false,
          error: 'Parameter validation error',
          details: errorMessages
        })
      }

      logger.error('Unexpected params validation error:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}
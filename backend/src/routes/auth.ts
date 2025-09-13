import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '../utils/database'
import { logger } from '../utils/logger'

const router = Router()

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6)
})

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

// Generate JWT token
function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your_jwt_secret_here',
    { expiresIn: '7d' }
  )
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * @route   POST /api/auth/signup
 * @desc    Create a new user account
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, name, password } = signupSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        provider: 'local'
      }
    })

    // For local development, we'll store the password hash in a separate table
    // In production, you might use a different approach
    await db.$executeRaw`
      CREATE TABLE IF NOT EXISTS user_passwords (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `

    await db.$executeRaw`
      INSERT INTO user_passwords (user_id, password_hash)
      VALUES (${user.id}, ${hashedPassword})
      ON CONFLICT (user_id) DO UPDATE SET
        password_hash = EXCLUDED.password_hash
    `

    // Generate token
    const token = generateToken(user.id)

    logger.info('User signed up successfully', {
      userId: user.id,
      email: user.email
    })

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt
        },
        token
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    logger.error('Signup error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * @route   POST /api/auth/signin
 * @desc    Sign in user
 * @access  Public
 */
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = signinSchema.parse(req.body)

    // Find user
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Get password hash
    const passwordRecord = await db.$queryRaw<Array<{password_hash: string}>>`
      SELECT password_hash FROM user_passwords WHERE user_id = ${user.id}
    `

    if (passwordRecord.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, passwordRecord[0].password_hash)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Generate token
    const token = generateToken(user.id)

    logger.info('User signed in successfully', {
      userId: user.id,
      email: user.email
    })

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt
        },
        token
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    logger.error('Signin error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here') as { userId: string }

      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        include: {
          ownedOrganizations: {
            include: {
              organization: true
            }
          },
          projects: {
            take: 5,
            orderBy: { updatedAt: 'desc' }
          }
        }
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        })
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            organizations: user.ownedOrganizations.map(om => om.organization),
            recentProjects: user.projects
          }
        }
      })
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
    }
  } catch (error) {
    logger.error('Get user error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * @route   POST /api/auth/signout
 * @desc    Sign out user (client-side token removal)
 * @access  Private
 */
router.post('/signout', (req, res) => {
  // In a JWT setup, signout is typically handled client-side
  // You could implement token blacklisting here if needed
  res.json({
    success: true,
    message: 'Signed out successfully'
  })
})

export default router
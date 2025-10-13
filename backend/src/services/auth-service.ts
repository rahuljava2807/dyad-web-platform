import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

interface AuthResult {
  user: User
  token: string
  refreshToken: string
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
  name: string
}

interface TokenPayload {
  userId: string
  email: string
}

class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
  private refreshSecret = process.env.REFRESH_SECRET || 'your-refresh-secret'
  private tokenExpiry = '15m'
  private refreshExpiry = '7d'

  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: request.email }
      })

      if (existingUser) {
        throw new Error('User already exists with this email')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(request.password, 12)

      // Create user
      const user = await prisma.user.create({
        data: {
          email: request.email,
          password: hashedPassword,
          name: request.name,
        }
      })

      // Generate tokens
      const token = this.generateToken({ userId: user.id, email: user.email })
      const refreshToken = this.generateRefreshToken({ userId: user.id, email: user.email })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        refreshToken,
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw new Error(`Registration failed: ${error.message}`)
    }
  }

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<AuthResult> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: request.email }
      })

      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(request.password, user.password)
      if (!isValidPassword) {
        throw new Error('Invalid email or password')
      }

      // Generate tokens
      const token = this.generateToken({ userId: user.id, email: user.email })
      const refreshToken = this.generateRefreshToken({ userId: user.id, email: user.email })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        refreshToken,
      }
    } catch (error) {
      console.error('Login error:', error)
      throw new Error(`Login failed: ${error.message}`)
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, this.refreshSecret) as TokenPayload

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Generate new tokens
      const newToken = this.generateToken({ userId: user.id, email: user.email })
      const newRefreshToken = this.generateRefreshToken({ userId: user.id, email: user.email })

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      throw new Error('Invalid refresh token')
    }
  }

  /**
   * Verify access token
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as TokenPayload

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return payload
    } catch (error) {
      console.error('Token verification error:', error)
      throw new Error('Invalid token')
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<{ name: string; email: string }>): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      return user
    } catch (error) {
      console.error('Update user error:', error)
      throw new Error(`Failed to update user: ${error.message}`)
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12)

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      })
    } catch (error) {
      console.error('Change password error:', error)
      throw new Error(`Failed to change password: ${error.message}`)
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id: userId }
      })
    } catch (error) {
      console.error('Delete user error:', error)
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  /**
   * Generate access token
   */
  private generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.tokenExpiry })
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiry })
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

export const authService = new AuthService()


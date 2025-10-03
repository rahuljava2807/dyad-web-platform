import { Router } from 'express'
import { authService } from '../services/auth-service'
import { Request, Response, NextFunction } from 'express'

const router = Router()

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      })
    }

    // Validate email
    if (!authService.validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    // Validate password
    const passwordValidation = authService.validatePassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      })
    }

    const result = await authService.register({ email, password, name })

    res.status(201).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Registration error:', error)
    next(error)
  }
})

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    const result = await authService.login({ email, password })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Login error:', error)
    next(error)
  }
})

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      })
    }

    const result = await authService.refreshToken(refreshToken)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    next(error)
  }
})

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    const user = await authService.getUserById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get user error:', error)
    next(error)
  }
})

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const { name, email } = req.body

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    if (email && !authService.validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    const user = await authService.updateUser(userId, { name, email })

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Update profile error:', error)
    next(error)
  }
})

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const { currentPassword, newPassword } = req.body

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      })
    }

    // Validate new password
    const passwordValidation = authService.validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'New password does not meet requirements',
        details: passwordValidation.errors
      })
    }

    await authService.changePassword(userId, currentPassword, newPassword)

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    next(error)
  }
})

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
    }

    await authService.deleteUser(userId)

    res.json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Delete account error:', error)
    next(error)
  }
})

export default router
export default router
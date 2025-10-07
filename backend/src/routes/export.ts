import { Router } from 'express'
import { exportService } from '../services/export-service'
import { authMiddleware } from '../middleware/auth'
import { Request, Response, NextFunction } from 'express'

const router = Router()

// Apply authentication to all routes
// router.use(authMiddleware) // Temporarily disabled for testing

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * @route   POST /api/export/github
 * @desc    Export project to GitHub repository
 * @access  Private
 */
router.post('/github', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, files, repositoryName, description, isPrivate } = req.body
    const userId = req.user?.id || 'anonymous'

    if (!projectId || !files || !repositoryName) {
      return res.status(400).json({
        success: false,
        error: 'Project ID, files, and repository name are required'
      })
    }

    const result = await exportService.exportToGitHub({
      projectId,
      files,
      repositoryName,
      description,
      isPrivate
    })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('GitHub export error:', error)
    next(error)
  }
})

/**
 * @route   POST /api/export/vercel
 * @desc    Deploy project to Vercel
 * @access  Private
 */
router.post('/vercel', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, files, framework } = req.body
    const userId = req.user?.id || 'anonymous'

    if (!projectId || !files) {
      return res.status(400).json({
        success: false,
        error: 'Project ID and files are required'
      })
    }

    const result = await exportService.deployToVercel({
      projectId,
      files,
      framework
    })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Vercel deployment error:', error)
    next(error)
  }
})

/**
 * @route   POST /api/export/zip
 * @desc    Export project as ZIP file
 * @access  Private
 */
router.post('/zip', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, files, repositoryName, description } = req.body
    const userId = req.user?.id || 'anonymous'

    if (!projectId || !files || !repositoryName) {
      return res.status(400).json({
        success: false,
        error: 'Project ID, files, and repository name are required'
      })
    }

    const zipBuffer = await exportService.exportAsZip({
      projectId,
      files,
      repositoryName,
      description
    })

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${repositoryName}.zip"`)
    res.send(zipBuffer)
  } catch (error) {
    console.error('ZIP export error:', error)
    next(error)
  }
})

/**
 * @route   GET /api/export/deployment/:deploymentId/status
 * @desc    Get deployment status
 * @access  Private
 */
router.get('/deployment/:deploymentId/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { deploymentId } = req.params
    const userId = req.user?.id || 'anonymous'

    const status = await exportService.getDeploymentStatus(deploymentId)

    res.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Deployment status error:', error)
    next(error)
  }
})

/**
 * @route   GET /api/export/github/repositories
 * @desc    Get user's GitHub repositories
 * @access  Private
 */
router.get('/github/repositories', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'anonymous'

    const repositories = await exportService.getGitHubRepositories()

    res.json({
      success: true,
      data: repositories
    })
  } catch (error) {
    console.error('GitHub repositories error:', error)
    next(error)
  }
})

export default router

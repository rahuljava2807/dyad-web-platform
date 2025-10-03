import { Router } from 'express'
import { aiRulesService } from '../services/ai-rules'
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
 * @route   GET /api/ai-rules/:projectId
 * @desc    Get AI rules for a project
 * @access  Private
 */
router.get('/:projectId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params
    const userId = req.user?.id || 'anonymous'

    // TODO: Verify user has access to project
    // const project = await projectService.getProject(projectId, userId)
    // if (!project) {
    //   return res.status(404).json({
    //     success: false,
    //     error: 'Project not found'
    //   })
    // }

    const rules = await aiRulesService.getAIRules(projectId)

    res.json({
      success: true,
      data: rules
    })
  } catch (error) {
    console.error('Error getting AI rules:', error)
    next(error)
  }
})

/**
 * @route   PUT /api/ai-rules/:projectId
 * @desc    Update AI rules for a project
 * @access  Private
 */
router.put('/:projectId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params
    const { content } = req.body
    const userId = req.user?.id || 'anonymous'

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      })
    }

    // Validate rules content
    const validation = aiRulesService.validateRules(content)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid AI rules content',
        details: validation.errors
      })
    }

    // TODO: Verify user has access to project
    // const project = await projectService.getProject(projectId, userId)
    // if (!project) {
    //   return res.status(404).json({
    //     success: false,
    //     error: 'Project not found'
    //   })
    // }

    const rules = await aiRulesService.updateAIRules(projectId, content)

    res.json({
      success: true,
      data: rules
    })
  } catch (error) {
    console.error('Error updating AI rules:', error)
    next(error)
  }
})

/**
 * @route   POST /api/ai-rules/:projectId/template
 * @desc    Apply template rules to a project
 * @access  Private
 */
router.post('/:projectId/template', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params
    const { templateType } = req.body
    const userId = req.user?.id || 'anonymous'

    if (!templateType) {
      return res.status(400).json({
        success: false,
        error: 'Template type is required'
      })
    }

    // TODO: Verify user has access to project
    // const project = await projectService.getProject(projectId, userId)
    // if (!project) {
    //   return res.status(404).json({
    //     success: false,
    //     error: 'Project not found'
    //   })
    // }

    const templateContent = aiRulesService.getTemplateRules(templateType)
    const rules = await aiRulesService.updateAIRules(projectId, templateContent)

    res.json({
      success: true,
      data: rules
    })
  } catch (error) {
    console.error('Error applying template rules:', error)
    next(error)
  }
})

/**
 * @route   DELETE /api/ai-rules/:projectId
 * @desc    Clear AI rules for a project (reset to defaults)
 * @access  Private
 */
router.delete('/:projectId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params
    const userId = req.user?.id || 'anonymous'

    // TODO: Verify user has access to project
    // const project = await projectService.getProject(projectId, userId)
    // if (!project) {
    //   return res.status(404).json({
    //     success: false,
    //     error: 'Project not found'
    //   })
    // }

    // Clear cache and reset to defaults
    aiRulesService.clearCache(projectId)
    const defaultRules = await aiRulesService.getAIRules(projectId)

    res.json({
      success: true,
      data: defaultRules
    })
  } catch (error) {
    console.error('Error clearing AI rules:', error)
    next(error)
  }
})

export default router

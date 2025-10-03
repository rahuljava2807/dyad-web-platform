import { Request, Response, NextFunction } from 'express'
import { aiService } from '../services/ai'
// import { projectService } from '../services/projects'
import { logger } from '../utils/logger'
import { AuthRequest } from '../types/auth'

/**
 * Get available AI providers and their status
 */
export async function getAIProviders(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const providers = await aiService.getAvailableProviders()
    res.json({
      success: true,
      data: providers,
    })
  } catch (error) {
    logger.error('Error getting AI providers:', error)
    next(error)
  }
}

/**
 * Generate code using AI
 */
export async function generateCode(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { prompt, context, provider, projectId } = req.body
    const userId = req.user?.id || 'anonymous'

    // Get project context if projectId is provided
    let projectContext = null
    if (projectId) {
      // TODO: Implement project service
      // const project = await projectService.getProject(projectId, userId)
      // if (!project) {
      //   return res.status(404).json({
      //     success: false,
      //     error: 'Project not found',
      //   })
      // }
      // projectContext = await projectService.getProjectContext(projectId)
    }

    const result = await aiService.generateCode({
      prompt,
      context: {
        ...context,
        project: projectContext,
      },
      provider,
      userId,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error('Error generating code:', error)
    next(error)
  }
}

/**
 * Chat with AI assistant
 */
export async function chatWithAI(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { messages, projectId, provider, mode } = req.body
    const userId = req.user?.id || 'anonymous'

    // Get project context if projectId is provided
    let projectContext = null
    if (projectId) {
      // TODO: Implement project service
      // const project = await projectService.getProject(projectId, userId)
      // if (!project) {
      //   return res.status(404).json({
      //     success: false,
      //     error: 'Project not found',
      //   })
      // }
      // projectContext = await projectService.getProjectContext(projectId)
    }

    const result = await aiService.chat({
      messages,
      context: {
        project: projectContext,
        mode,
      },
      provider,
      userId,
      mode,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error('Error in AI chat:', error)
    next(error)
  }
}

/**
 * Analyze code for improvements and suggestions
 */
export async function analyzeCode(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { code, language, projectId } = req.body
    const userId = req.user!.id

    // Get project context if projectId is provided
    let projectContext = null
    if (projectId) {
      const project = await projectService.getProject(projectId, userId)
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found',
        })
      }
      projectContext = await projectService.getProjectContext(projectId)
    }

    const result = await aiService.analyzeCode({
      code,
      language,
      context: {
        project: projectContext,
      },
      userId,
    })

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    logger.error('Error analyzing code:', error)
    next(error)
  }
}
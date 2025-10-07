import { Router, Request, Response, NextFunction } from 'express'
import { errorHealingService } from '../services/error-healing-service'
import { Request as AuthRequest } from '../middleware/auth'

const router = Router()

interface ErrorHealingRequest extends AuthRequest {
  body: {
    originalPrompt: string
    generatedFiles: Array<{
      path: string
      content: string
      language: string
    }>
    error: {
      type: 'component_export' | 'import_error' | 'syntax_error' | 'runtime_error'
      message: string
      stack?: string
      file?: string
      line?: number
      column?: number
    }
    previousAttempts?: number
  }
}

/**
 * @route   POST /api/error-healing/heal
 * @desc    Heal a preview error by fixing the generated code
 * @access  Private (temporarily public for testing)
 */
router.post('/heal', async (req: ErrorHealingRequest, res: Response, next: NextFunction) => {
  try {
    const { originalPrompt, generatedFiles, error, previousAttempts } = req.body

    if (!originalPrompt || !generatedFiles || !error) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: originalPrompt, generatedFiles, error'
      })
    }

    console.log(`🔧 Starting error healing for: ${error.type}`)
    console.log(`Error message: ${error.message}`)

    const healingResult = await errorHealingService.healError({
      originalPrompt,
      generatedFiles,
      error,
      previousAttempts
    })

    if (healingResult.success && healingResult.fixedFiles) {
      // Validate the healed code
      const validation = errorHealingService.validateHealedCode(healingResult.fixedFiles)
      
      if (!validation.valid) {
        console.warn('⚠️ Healed code has validation issues:', validation.issues)
      }

      res.json({
        success: true,
        data: {
          fixedFiles: healingResult.fixedFiles,
          explanation: healingResult.explanation,
          validation: validation
        }
      })
    } else {
      res.status(500).json({
        success: false,
        error: healingResult.error || 'Error healing failed'
      })
    }
  } catch (error) {
    console.error('Error healing API error:', error)
    next(error)
  }
})

/**
 * @route   POST /api/error-healing/analyze
 * @desc    Analyze an error and return healing strategy
 * @access  Private (temporarily public for testing)
 */
router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = req.body

    if (!error || !error.message) {
      return res.status(400).json({
        success: false,
        error: 'Error object with message is required'
      })
    }

    const analysis = errorHealingService.analyzeError(error)

    res.json({
      success: true,
      data: analysis
    })
  } catch (error) {
    console.error('Error analysis API error:', error)
    next(error)
  }
})

/**
 * @route   POST /api/error-healing/validate
 * @desc    Validate that healed code is likely to work
 * @access  Private (temporarily public for testing)
 */
router.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { files } = req.body

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({
        success: false,
        error: 'Files array is required'
      })
    }

    const validation = errorHealingService.validateHealedCode(files)

    res.json({
      success: true,
      data: validation
    })
  } catch (error) {
    console.error('Error validation API error:', error)
    next(error)
  }
})

export default router


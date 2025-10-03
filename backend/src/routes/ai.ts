import { Router } from 'express'
import { generateCode, chatWithAI, getAIProviders, analyzeCode } from '../controllers/ai'
import { authMiddleware } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import { aiGenerationSchema, aiChatSchema } from '../schemas/ai'

const router = Router()

// Apply authentication to all AI routes
// router.use(authMiddleware) // Temporarily disabled for testing

/**
 * @route   GET /api/ai/providers
 * @desc    Get available AI providers and their status
 * @access  Private
 */
router.get('/providers', getAIProviders)

/**
 * @route   POST /api/ai/generate
 * @desc    Generate code using AI
 * @access  Private
 */
router.post('/generate', validateRequest(aiGenerationSchema), generateCode)

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI assistant
 * @access  Private
 */
router.post('/chat', validateRequest(aiChatSchema), chatWithAI)

/**
 * @route   POST /api/ai/analyze
 * @desc    Analyze code for improvements and suggestions
 * @access  Private
 */
router.post('/analyze', analyzeCode)

export default router
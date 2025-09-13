import { z } from 'zod'

export const aiGenerationSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(5000, 'Prompt too long'),
  context: z.object({
    projectId: z.string().optional(),
    framework: z.string().optional(),
    language: z.string().optional(),
    files: z.array(z.object({
      path: z.string(),
      content: z.string()
    })).optional(),
    dependencies: z.array(z.string()).optional()
  }).optional(),
  provider: z.enum(['openai', 'anthropic', 'google', 'azure']).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional()
})

export const aiChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, 'Message content is required')
  })).min(1, 'At least one message is required'),
  projectId: z.string().optional(),
  provider: z.enum(['openai', 'anthropic', 'google', 'azure']).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional()
})

export const aiAnalysisSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.string().min(1, 'Language is required'),
  projectId: z.string().optional(),
  analysisType: z.enum(['quality', 'security', 'performance', 'bugs', 'all']).default('all')
})

export type AIGenerationRequest = z.infer<typeof aiGenerationSchema>
export type AIChatRequest = z.infer<typeof aiChatSchema>
export type AIAnalysisRequest = z.infer<typeof aiAnalysisSchema>
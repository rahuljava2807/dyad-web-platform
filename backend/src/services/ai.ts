import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { azure } from '@ai-sdk/azure'
import { generateObject, generateText, streamText } from 'ai'
import { z } from 'zod'
import { logger } from '../utils/logger'
import { yaviService } from './yavi'
import { usageService } from './usage'

interface AIProvider {
  id: string
  name: string
  models: string[]
  available: boolean
  priority: number
}

interface GenerationContext {
  project?: any
  files?: any[]
  framework?: string
  language?: string
  dependencies?: string[]
}

interface GenerateCodeRequest {
  prompt: string
  context?: GenerationContext
  provider?: string
  userId: string
}

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  context?: GenerationContext
  provider?: string
  userId: string
}

interface AnalyzeCodeRequest {
  code: string
  language: string
  context?: GenerationContext
  userId: string
}

class AIService {
  private providers: Map<string, AIProvider> = new Map()
  private defaultProvider = 'gpt-4'

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', {
        id: 'openai',
        name: 'OpenAI',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        available: true,
        priority: 1,
      })
    }

    // Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', {
        id: 'anthropic',
        name: 'Anthropic',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        available: true,
        priority: 2,
      })
    }

    // Google
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      this.providers.set('google', {
        id: 'google',
        name: 'Google',
        models: ['gemini-pro', 'gemini-1.5-pro'],
        available: true,
        priority: 3,
      })
    }

    // Azure OpenAI
    if (process.env.AZURE_OPENAI_API_KEY) {
      this.providers.set('azure', {
        id: 'azure',
        name: 'Azure OpenAI',
        models: ['gpt-4', 'gpt-35-turbo'],
        available: true,
        priority: 4,
      })
    }
  }

  async getAvailableProviders(): Promise<AIProvider[]> {
    return Array.from(this.providers.values()).sort((a, b) => a.priority - b.priority)
  }

  private getModelInstance(provider: string, model?: string) {
    switch (provider) {
      case 'openai':
        return openai(model || 'gpt-4')
      case 'anthropic':
        return anthropic(model || 'claude-3-sonnet-20240229')
      case 'google':
        return google(model || 'gemini-pro')
      case 'azure':
        return azure(model || 'gpt-4')
      default:
        return openai('gpt-4') // fallback
    }
  }

  private buildSystemPrompt(context?: GenerationContext): string {
    let systemPrompt = `You are an expert software developer and AI assistant specializing in building modern web applications. You provide high-quality, production-ready code with proper error handling, type safety, and best practices.

Key principles:
- Write clean, maintainable, and well-documented code
- Follow modern development best practices
- Include proper error handling and validation
- Use TypeScript when appropriate
- Focus on performance and accessibility
- Provide helpful comments and explanations`

    if (context?.framework) {
      systemPrompt += `\n\nYou are working with ${context.framework}. Follow ${context.framework}-specific best practices and conventions.`
    }

    if (context?.language) {
      systemPrompt += `\n\nPrimary language: ${context.language}`
    }

    if (context?.dependencies && context.dependencies.length > 0) {
      systemPrompt += `\n\nAvailable dependencies: ${context.dependencies.join(', ')}`
    }

    if (context?.project) {
      systemPrompt += `\n\nProject context:
- Name: ${context.project.name}
- Description: ${context.project.description}
- Framework: ${context.project.framework || 'Not specified'}`
    }

    return systemPrompt
  }

  async generateCode(request: GenerateCodeRequest) {
    try {
      const provider = request.provider || this.defaultProvider
      const model = this.getModelInstance(provider)

      // Track usage
      await usageService.trackUsage({
        userId: request.userId,
        type: 'code_generation',
        provider,
        promptTokens: request.prompt.length,
      })

      // Enhanced prompt with Yavi.ai integration if available
      let enhancedPrompt = request.prompt
      if (request.context?.project) {
        const yaviContext = await yaviService.getRelevantContext(request.prompt, request.context.project.id)
        if (yaviContext) {
          enhancedPrompt += `\n\nRelevant context from Yavi.ai:\n${yaviContext}`
        }
      }

      const result = await generateObject({
        model,
        system: this.buildSystemPrompt(request.context),
        prompt: enhancedPrompt,
        schema: z.object({
          code: z.string().describe('The generated code'),
          explanation: z.string().describe('Explanation of what the code does'),
          files: z.array(z.object({
            path: z.string(),
            content: z.string(),
            type: z.enum(['create', 'modify', 'delete']),
          })).describe('Files to create or modify'),
          dependencies: z.array(z.string()).optional().describe('New dependencies to install'),
          instructions: z.string().optional().describe('Additional setup instructions'),
        }),
      })

      logger.info(`Generated code for user ${request.userId}`, {
        provider,
        promptLength: request.prompt.length,
        filesCount: result.object.files.length,
      })

      return result.object
    } catch (error) {
      logger.error('Error generating code:', error)
      throw new Error('Failed to generate code. Please try again.')
    }
  }

  async chat(request: ChatRequest) {
    try {
      const provider = request.provider || this.defaultProvider
      const model = this.getModelInstance(provider)

      // Track usage
      await usageService.trackUsage({
        userId: request.userId,
        type: 'chat',
        provider,
        promptTokens: request.messages.reduce((acc, msg) => acc + msg.content.length, 0),
      })

      // Add system message if not present
      const messages = request.messages
      if (messages[0]?.role !== 'system') {
        messages.unshift({
          role: 'system',
          content: this.buildSystemPrompt(request.context),
        })
      }

      const result = await generateText({
        model,
        messages,
      })

      logger.info(`AI chat for user ${request.userId}`, {
        provider,
        messagesCount: request.messages.length,
      })

      return {
        message: result.text,
        usage: result.usage,
      }
    } catch (error) {
      logger.error('Error in AI chat:', error)
      throw new Error('Failed to process chat message. Please try again.')
    }
  }

  async analyzeCode(request: AnalyzeCodeRequest) {
    try {
      const provider = this.defaultProvider
      const model = this.getModelInstance(provider)

      // Track usage
      await usageService.trackUsage({
        userId: request.userId,
        type: 'code_analysis',
        provider,
        promptTokens: request.code.length,
      })

      const result = await generateObject({
        model,
        system: `You are a senior code reviewer and software architect. Analyze the provided code for:
- Code quality and best practices
- Performance optimizations
- Security vulnerabilities
- Accessibility improvements
- Bug detection
- Refactoring suggestions`,
        prompt: `Analyze this ${request.language} code:\n\n${request.code}`,
        schema: z.object({
          score: z.number().min(0).max(100).describe('Overall code quality score'),
          issues: z.array(z.object({
            type: z.enum(['error', 'warning', 'suggestion', 'security']),
            severity: z.enum(['high', 'medium', 'low']),
            line: z.number().optional(),
            message: z.string(),
            suggestion: z.string().optional(),
          })).describe('Identified issues and suggestions'),
          strengths: z.array(z.string()).describe('Code strengths and good practices found'),
          improvements: z.array(z.object({
            category: z.string(),
            description: z.string(),
            example: z.string().optional(),
          })).describe('Improvement suggestions'),
          complexity: z.object({
            score: z.number().min(1).max(10),
            description: z.string(),
          }).describe('Code complexity analysis'),
        }),
      })

      logger.info(`Analyzed code for user ${request.userId}`, {
        language: request.language,
        codeLength: request.code.length,
        score: result.object.score,
      })

      return result.object
    } catch (error) {
      logger.error('Error analyzing code:', error)
      throw new Error('Failed to analyze code. Please try again.')
    }
  }

  async streamGeneration(request: GenerateCodeRequest) {
    try {
      const provider = request.provider || this.defaultProvider
      const model = this.getModelInstance(provider)

      const result = streamText({
        model,
        system: this.buildSystemPrompt(request.context),
        prompt: request.prompt,
      })

      return result
    } catch (error) {
      logger.error('Error streaming generation:', error)
      throw new Error('Failed to stream generation. Please try again.')
    }
  }
}

export const aiService = new AIService()
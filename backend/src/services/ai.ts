import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { azure } from '@ai-sdk/azure'
import { generateObject, generateText, streamText } from 'ai'
import { z } from 'zod'
import { getComponentInstructions } from '../lib/componentSelector'
import { comprehensiveValidation, generateValidationReport } from '../lib/fileValidator'
import { getTemplate, getTemplatePromptEnhancement, type IndustryTemplate } from '../lib/industryTemplates'
import { bundleScaffoldComponents, detectUsedComponents } from '../lib/scaffoldBundler'
import { aiRulesLoader } from './aiRulesLoader'
import { smartContext } from './smartContext'
import { outputValidator } from './outputValidator'
import { stylingValidator } from './stylingValidator'
import { dependencyValidator } from './dependencyValidator'
import { previewValidator } from './previewValidator'
// import { logger } from '../utils/logger' // Not available
// import { yaviService } from './yavi' // Not needed for basic generation
// import { usageService } from './usage' // Not available

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
  industry?: 'healthcare' | 'fintech' | 'legal' | 'ecommerce' | 'saas'
  templateId?: string
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
  private defaultProvider = 'gpt-4-turbo' // gpt-4-turbo supports structured JSON output required by generateObject

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
        return openai(model || 'gpt-4-turbo')
      case 'anthropic':
        return anthropic(model || 'claude-3-sonnet-20240229')
      case 'google':
        return google(model || 'gemini-pro')
      case 'azure':
        return azure(model || 'gpt-4-turbo')
      default:
        return openai('gpt-4-turbo') // fallback - gpt-4-turbo supports structured JSON output
    }
  }

  /**
   * Converts @/ path aliases to relative paths for Sandpack compatibility
   * Sandpack doesn't support TypeScript tsconfig path aliases
   */
  private convertPathAliases(files: any[]): void {
    console.log('🔧 [Path Conversion] Converting @/ aliases to relative paths for Sandpack...')

    for (const file of files) {
      // Only convert code files
      if (!file.path.match(/\.(tsx?|jsx?)$/)) continue

      let convertedContent = file.content

      // Convert @/components/ui/* imports to relative paths
      convertedContent = convertedContent.replace(
        /from\s+["']@\/components\/ui\/([^"']+)["']/g,
        (match, componentPath) => {
          if (file.path.startsWith('src/components/ui/')) {
            return `from "./${componentPath}"`
          } else if (file.path.startsWith('src/components/')) {
            return `from "./ui/${componentPath}"`
          } else if (file.path.startsWith('components/ui/')) {
            return `from "./${componentPath}"`
          } else if (file.path.startsWith('components/')) {
            return `from "./ui/${componentPath}"`
          } else {
            return `from "./components/ui/${componentPath}"`
          }
        }
      )

      // Convert @/lib/* imports
      convertedContent = convertedContent.replace(
        /from\s+["']@\/lib\/([^"']+)["']/g,
        (match, libPath) => {
          if (file.path.startsWith('src/lib/')) {
            return `from "./${libPath}"`
          } else if (file.path.startsWith('src/components/ui/') || file.path.startsWith('components/ui/')) {
            return `from "../../lib/${libPath}"` // Two levels up from components/ui/
          } else if (file.path.startsWith('src/components/') || file.path.startsWith('components/')) {
            return `from "../lib/${libPath}"` // One level up from components/
          } else {
            return `from "./lib/${libPath}"`
          }
        }
      )

      // Convert @/hooks/* imports
      convertedContent = convertedContent.replace(
        /from\s+["']@\/hooks\/([^"']+)["']/g,
        (match, hookPath) => {
          if (file.path.startsWith('src/hooks/')) {
            return `from "./${hookPath}"`
          } else if (file.path.startsWith('src/components/ui/') || file.path.startsWith('components/ui/')) {
            return `from "../../hooks/${hookPath}"` // Two levels up from components/ui/
          } else if (file.path.startsWith('src/components/') || file.path.startsWith('components/')) {
            return `from "../hooks/${hookPath}"` // One level up from components/
          } else {
            return `from "./hooks/${hookPath}"`
          }
        }
      )

      // Convert @/types/* imports
      convertedContent = convertedContent.replace(
        /from\s+["']@\/types\/([^"']+)["']/g,
        (match, typePath) => {
          if (file.path.startsWith('src/types/')) {
            return `from "./${typePath}"`
          } else if (file.path.startsWith('src/components/ui/') || file.path.startsWith('components/ui/')) {
            return `from "../../types/${typePath}"` // Two levels up from components/ui/
          } else if (file.path.startsWith('src/components/') || file.path.startsWith('components/')) {
            return `from "../types/${typePath}"` // One level up from components/
          } else {
            return `from "./types/${typePath}"`
          }
        }
      )

      // Convert @/utils/* imports
      convertedContent = convertedContent.replace(
        /from\s+["']@\/utils\/([^"']+)["']/g,
        (match, utilPath) => {
          if (file.path.startsWith('src/utils/')) {
            return `from "./${utilPath}"`
          } else if (file.path.startsWith('src/components/ui/') || file.path.startsWith('components/ui/')) {
            return `from "../../utils/${utilPath}"` // Two levels up from components/ui/
          } else if (file.path.startsWith('src/components/') || file.path.startsWith('components/')) {
            return `from "../utils/${utilPath}"` // One level up from components/
          } else {
            return `from "./utils/${utilPath}"`
          }
        }
      )

      // Convert @/components/* (non-ui) imports
      convertedContent = convertedContent.replace(
        /from\s+["']@\/components\/([^"']+)["']/g,
        (match, componentPath) => {
          if (componentPath.startsWith('ui/')) return match // Skip ui imports (already converted)

          if (file.path.startsWith('src/components/')) {
            return `from "./${componentPath}"`
          } else if (file.path.startsWith('components/')) {
            return `from "./${componentPath}"`
          } else {
            return `from "./components/${componentPath}"`
          }
        }
      )

      if (convertedContent !== file.content) {
        file.content = convertedContent
        console.log(`🔧 [Path Conversion] Converted imports in ${file.path}`)
      }
    }

    console.log('✅ [Path Conversion] All @/ aliases converted to relative paths')
  }

  /**
   * Build system prompt by loading AI rules from AI_RULES.md
   * Phase 7: Externalized prompt for easier maintenance + Smart Context injection
   */
  private async buildSystemPrompt(prompt: string, context?: GenerationContext): Promise<string> {
    // Load base rules from AI_RULES.md
    let systemPrompt = await aiRulesLoader.loadRules()

    // Phase 7.2: Inject Smart Context (relevant existing files)
    try {
      const relevantContext = await smartContext.getRelevantContext(prompt)
      if (relevantContext) {
        systemPrompt += `\n\n${relevantContext}`
      }
    } catch (error) {
      console.warn('[buildSystemPrompt] Smart context failed:', error)
      // Continue without context - not critical
    }

    // Append context-specific information (preserve existing behavior)
    if (context?.framework) {
      systemPrompt += `\n\nFramework: ${context.framework}
Use ${context.framework}-specific best practices and modern patterns.
Leverage ${context.framework} features for optimal performance.`
    }

    if (context?.language) {
      systemPrompt += `\n\nPrimary language: ${context.language}
Use strict TypeScript with proper type definitions and interfaces.`
    }

    if (context?.dependencies && context.dependencies.length > 0) {
      systemPrompt += `\n\nAvailable dependencies: ${context.dependencies.join(', ')}`
    }

    if (context?.project) {
      systemPrompt += `\n\nProject context:
- Name: ${context.project.name}
- Description: ${context.project.description}
- Framework: ${context.project.framework || 'React + TypeScript'}
- Make this project stand out with exceptional design and functionality.`
    }

    // 🎨 CRITICAL STYLING EMPHASIS - Production Quality Requirements
    systemPrompt += `

═══════════════════════════════════════════════════════════════════
🚨 CRITICAL STYLING REQUIREMENT - PRODUCTION-READY VISUAL QUALITY 🚨
═══════════════════════════════════════════════════════════════════

The user expects a PRODUCTION-READY, VISUALLY STUNNING application.
Generated code MUST look like modern SaaS products (Linear, Vercel, Stripe).
Wireframe-quality or basic styling is COMPLETELY UNACCEPTABLE.

MANDATORY VISUAL STANDARDS (Refer to "🎨 VISUAL DESIGN STANDARDS" section in your rules):

1. 🎨 GRADIENT BACKGROUNDS - MANDATORY for all full-page layouts:
   ✅ ALWAYS USE: bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50
   ✅ DARK MODE: dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
   ❌ FORBIDDEN: Plain bg-white or bg-gray-50 backgrounds

2. 💎 DEEP SHADOWS - MANDATORY for depth and elevation:
   ✅ Cards: shadow-2xl shadow-purple-500/10
   ✅ Elevated: shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50
   ❌ FORBIDDEN: No shadows or shallow shadow-sm

3. 📐 GENEROUS SPACING - Professional polish requires proper breathing room:
   ✅ Cards: p-8 (32px minimum)
   ✅ Sections: space-y-8 or gap-8
   ❌ FORBIDDEN: Cramped p-4 (16px) spacing

4. 🎭 SMOOTH ANIMATIONS - Every interactive element needs polish:
   ✅ MANDATORY: transition-all duration-200
   ✅ Hover: hover:scale-[1.02] hover:shadow-xl
   ❌ FORBIDDEN: Static, non-interactive elements

5. 🔤 TYPOGRAPHY HIERARCHY - Clear visual hierarchy:
   ✅ H1: text-3xl font-bold text-gray-900 dark:text-white
   ✅ H2: text-2xl font-semibold text-gray-800 dark:text-gray-100
   ✅ Body: text-base text-gray-600 dark:text-gray-300
   ❌ FORBIDDEN: Flat text-xl without hierarchy

6. 🎨 BORDER RADIUS - Modern, polished corners:
   ✅ Cards: rounded-2xl (16px)
   ✅ Components: rounded-xl (12px)
   ❌ FORBIDDEN: Sharp rounded or rounded-sm

7. 🌓 DARK MODE - MANDATORY dark: variants on ALL color classes:
   ✅ bg-white dark:bg-gray-800
   ✅ text-gray-900 dark:text-white
   ❌ FORBIDDEN: Missing dark mode variants

8. ✨ VISUAL POLISH CHECKLIST - Verify EVERY component has:
   • Gradient backgrounds on full-page layouts
   • Deep shadows (shadow-xl or shadow-2xl)
   • Proper spacing (p-8 on cards)
   • Smooth transitions on interactive elements
   • Professional typography hierarchy
   • lucide-react icons where appropriate
   • Loading states with spinners
   • Hover effects on buttons/links
   • Dark mode support
   • Color contrast (WCAG AA)

═══════════════════════════════════════════════════════════════════
🎯 QUALITY STANDARD: 9/10 Production-Ready, NOT 2/10 Wireframe
═══════════════════════════════════════════════════════════════════

BEFORE generating ANY code, ask yourself:
• Does this look like a modern SaaS product?
• Would a user pay for an app that looks like this?
• Is every element professionally styled with gradients, shadows, animations?

If the answer is NO, DO NOT GENERATE. Go back and add proper styling.

═══════════════════════════════════════════════════════════════════`

    return systemPrompt
  }

  async generateCode(request: GenerateCodeRequest) {
    // Declare enhancedPrompt before try block so it's accessible in catch block
    let enhancedPrompt = request.prompt

    try {
      // Mock response when no API key is configured
      if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.AZURE_OPENAI_API_KEY) {
        console.log('🚧 No API key configured, returning mock response for testing')
        return {
          code: 'mock_app',
          explanation: 'Mock application generated for testing purposes',
          files: [
            {
              path: 'src/App.tsx',
              content: `import React from 'react';\n\nconst App: React.FC = () => {\n  return (\n    <div className="min-h-screen bg-gray-100 flex items-center justify-center">\n      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">\n        <h1 className="text-2xl font-bold text-gray-900 mb-4">Mock Application</h1>\n        <p className="text-gray-600 mb-4">This is a mock response generated for testing purposes.</p>\n        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">\n          Test Button\n        </button>\n      </div>\n    </div>\n  );\n};\n\nexport default App;`,
              type: 'create' as const
            },
            {
              path: 'package.json',
              content: `{\n  "name": "mock-app",\n  "version": "0.1.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`,
              type: 'create' as const
            }
          ],
          dependencies: ['react', 'react-dom'],
          instructions: 'This is a mock response for testing. Configure an API key to use real AI generation.'
        }
      }

      const provider = request.provider || this.defaultProvider
      const model = this.getModelInstance(provider)

      // Track usage
      // await usageService.trackUsage({
      //   userId: request.userId,
      //   type: 'code_generation',
      //   provider,
      //   promptTokens: request.prompt.length,
      // })

      // Enhanced prompt with Yavi.ai integration if available
      enhancedPrompt = request.prompt
      // if (request.context?.project) {
      //   const yaviContext = await yaviService.getRelevantContext(request.prompt, request.context.project.id)
      //   if (yaviContext) {
      //     enhancedPrompt += `\n\nRelevant context from Yavi.ai:\n${yaviContext}`
      //   }
      // }

      // 🚀 PHASE 1: Add component-specific shadcn-ui instructions
      const componentConfig = getComponentInstructions(request.prompt)
      enhancedPrompt += `\n\n${componentConfig.instructions}\n`

      // 🚀 PHASE 2: Industry Template Integration
      let templateEnhancement = ''
      if (request.context?.industry && request.context?.templateId) {
        const template = getTemplate(request.context.industry, request.context.templateId)
        if (template) {
          templateEnhancement = getTemplatePromptEnhancement(template)
          enhancedPrompt += `\n\n${templateEnhancement}\n`
          console.log(`🏥 Using industry template: ${template.name} (${template.industry.toUpperCase()})`)
          console.log(`📋 Compliance requirements: ${template.compliance.join(', ')}`)
        } else {
          console.warn(`⚠️  Template not found: ${request.context.templateId} in ${request.context.industry}`)
        }
      }

      // Add production-quality requirements to the prompt
      enhancedPrompt += `

🚨🚨🚨 ABSOLUTELY CRITICAL: DO NOT JUST ECHO THE USER'S PROMPT AS TEXT! 🚨🚨🚨
❌ FORBIDDEN: Creating a component that just displays the user's request like <div>Login Application</div>
✅ REQUIRED: Build a COMPLETE, WORKING, FUNCTIONAL application based on the request

🚨🚨🚨 CRITICAL GENERATION REQUIREMENTS 🚨🚨🚨
1. Generate a COMPLETE, BEAUTIFUL application with at least 6-10 files minimum
2. For LOGIN/AUTH apps: Include LoginForm, SignupForm, AuthPage/Layout, validation schemas, types, mock auth logic
3. For DASHBOARDS: Include Dashboard, Sidebar, Metrics, Charts, DataTable components with mock data
4. Include rich UI components with Framer Motion animations when appropriate
5. 🚨 MANDATORY: Use ONLY Tailwind CSS utility classes for ALL styling 🚨
6. Include realistic mock data (20-50 items for lists/tables)
7. Add proper TypeScript types and interfaces
8. Implement smooth hover effects and transitions with Tailwind (hover:bg-blue-700, etc.)
9. Make it production-ready and portfolio-worthy with complete, working functionality
10. 🚨 DO NOT create placeholder components with just text - BUILD THE ACTUAL APPLICATION! 🚨

🚨 DEPENDENCIES ARRAY RULES:
❌ NEVER include "@/components/ui" in dependencies - it is NOT an npm package!
❌ NEVER include path aliases (@/ or ~/) in dependencies array
✅ ONLY include real npm packages: react, react-dom, framer-motion, lucide-react, recharts, etc.

Example CORRECT dependencies array:
["react", "react-dom", "react-router-dom", "framer-motion", "lucide-react"]

Example WRONG dependencies array (DO NOT DO THIS):
["react", "@/components/ui", "@/lib/utils"] ❌

🚨 TAILWIND CSS REQUIREMENTS (NON-NEGOTIABLE):
- EVERY className must use Tailwind utilities (bg-white, text-xl, flex, grid, etc.)
- NO generic class names (metric-card, dashboard, navigation, sidebar, etc.)
- Use proper Tailwind patterns: bg-white p-6 rounded-lg shadow-lg
- Include responsive classes: md:grid-cols-2, lg:text-3xl
- Add hover effects: hover:shadow-xl, hover:bg-blue-700
- Use proper spacing: p-6, m-4, gap-4, space-y-6

Generate files that include (MINIMUM 6 FILES REQUIRED):
- Main App component (App.tsx) with routing/layout
- At least 3-5 feature components based on the request:
  * For LOGIN: LoginForm, SignupForm, Auth Layout, validation schema, types
  * For DASHBOARD: Dashboard, Sidebar, MetricCards, Chart components, DataTable
  * For E-COMMERCE: ProductList, ProductCard, Cart, Checkout components
- Complete package.json with ALL dependencies (react, react-dom, framer-motion, lucide-react, etc.)
- Types/interfaces file (types.ts) with proper TypeScript definitions
- Mock data utilities (mockData.ts) with 20+ realistic items
- Comprehensive README.md with setup instructions

🚨 REMEMBER: Generic class names = ZERO styling in preview!
🚨 ONLY Tailwind CSS utility classes will work!
🚨 Make every component beautiful, interactive, and polished with proper Tailwind classes!`

      console.log('🎯 Making initial generateObject call...')
      const systemPrompt = await this.buildSystemPrompt(request.prompt, request.context)
      console.log(`System prompt size: ${systemPrompt.length} chars`)
      console.log(`Enhanced prompt size: ${enhancedPrompt.length} chars`)

      const result = await generateObject({
        model,
        system: systemPrompt,
        prompt: enhancedPrompt,
        schema: z.object({
          code: z.string().optional().describe('DEPRECATED: Leave empty, use files array instead'),
          explanation: z.string().describe('Brief explanation of the application architecture and key features (2-3 sentences)'),
            files: z.array(z.object({
              path: z.string().describe('File path relative to project root (e.g., src/App.tsx, src/components/Dashboard.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code with MANDATORY TAILWIND CSS CLASSES. NO generic class names like "metric-card", "dashboard", or "navigation". Use ONLY Tailwind utilities like "bg-white p-6 rounded-lg shadow-lg", "flex items-center justify-between", "text-2xl font-bold text-gray-900". EVERY className must be a valid Tailwind CSS utility class. Generate COMPLETE, WORKING code with imports, exports, hooks, and proper JSX/TSX syntax.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(2).describe('MUST generate minimum 2-5 complete files with REAL code using ONLY Tailwind CSS classes'),
          dependencies: z.array(z.string()).optional().describe('Required NPM packages: react, react-dom, framer-motion, lucide-react, recharts, etc.'),
          instructions: z.string().optional().describe('Setup instructions'),
        }),
        // Note: Using default structured output mode (works with all OpenAI models including base gpt-4)
        // mode: 'json' requires gpt-4-turbo or later
      })

      console.log(`✅ Generated code for user ${request.userId}`, {
        provider,
        promptLength: request.prompt.length,
        filesCount: result.object.files.length,
      })

      // VALIDATE TAILWIND CSS CLASSES - Reject if generic classes found
      const genericClassPatterns = [
        /className=["'](metric-card|dashboard|navigation|sidebar|data-table|chart|container|wrapper|header|footer|content|main|card|button|input|form|section|article|aside|nav|div|span)["']/gi,
        /className=["'][^"']*[^-](card|button|input|form|section|article|aside|nav|div|span)(?!\w)["']/gi
      ]
      
      const hasGenericClasses = result.object.files.some(file => {
        if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
          return genericClassPatterns.some(pattern => pattern.test(file.content))
        }
        return false
      })

      if (hasGenericClasses) {
        console.warn(`AI generated code with generic class names, regenerating with stronger Tailwind enforcement...`)
        
        const tailwindEnforcementPrompt = `${enhancedPrompt}

🚨🚨🚨 CRITICAL: YOU GENERATED GENERIC CLASS NAMES! 🚨🚨🚨
🚨 THIS WILL CAUSE ZERO STYLING IN THE PREVIEW! 🚨
🚨 YOU MUST USE ONLY TAILWIND CSS UTILITY CLASSES! 🚨

FORBIDDEN PATTERNS YOU USED (DO NOT USE THESE AGAIN):
❌ className="metric-card" ❌ className="dashboard" ❌ className="navigation"
❌ className="sidebar" ❌ className="data-table" ❌ className="chart"
❌ className="container" ❌ className="wrapper" ❌ className="header"
❌ className="footer" ❌ className="content" ❌ className="main"

MANDATORY TAILWIND PATTERNS (USE ONLY THESE):
✅ className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
✅ className="flex items-center justify-between gap-4"
✅ className="text-2xl font-bold text-gray-900"
✅ className="grid grid-cols-1 md:grid-cols-4 gap-6"
✅ className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
✅ className="w-full h-full min-h-screen bg-gray-50"
✅ className="max-w-7xl mx-auto px-4 py-8"

🚨 BEFORE GENERATING ANY className, VERIFY IT'S A TAILWIND UTILITY:
- Background: bg-white, bg-blue-500, bg-gradient-to-r
- Text: text-white, text-gray-900, text-xl, font-bold
- Layout: flex, grid, block, inline
- Spacing: p-6, m-4, px-8, py-4, gap-4, space-y-6
- Sizing: w-full, h-screen, max-w-7xl, min-h-screen
- Borders: rounded-lg, border, shadow-lg
- Effects: hover:shadow-xl, transition-all, backdrop-blur

🚨 REGENERATE WITH PROPER TAILWIND CLASSES OR THE APP WILL BE UNSTYLED!`

        const retryResult = await generateObject({
          model,
          system: await this.buildSystemPrompt(request.prompt, request.context),
          prompt: tailwindEnforcementPrompt,
          schema: z.object({
            code: z.string().optional().describe('DEPRECATED: Leave empty'),
            explanation: z.string().describe('Brief explanation (2-3 sentences)'),
            files: z.array(z.object({
              path: z.string().describe('File path (e.g., src/App.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code with PROPER TAILWIND CSS CLASSES. NO generic class names like "metric-card" or "dashboard". Use ONLY Tailwind utilities like "bg-white p-6 rounded-lg shadow-lg". EVERY className must be a valid Tailwind CSS utility class.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(2, 'MUST generate at least 2 complete files'),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
        })

        console.log(`Regenerated with proper Tailwind classes: ${retryResult.object.files.length} files`)

        // 🚀 DEPENDENCY VALIDATION WITH AUTO-FIX (Tailwind retry path)
        console.log('📦 [Dependency Validator] Checking import/dependency consistency...')
        const tailwindRetryDependencyValidation = dependencyValidator.validate(
          retryResult.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                     f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' :
                     f.path.endsWith('.json') ? 'json' : 'plaintext'
          }))
        )

        console.log(dependencyValidator.formatResults(tailwindRetryDependencyValidation))

        if (!tailwindRetryDependencyValidation.isValid) {
          console.warn(`⚠️  [Dependency Validator] Found ${tailwindRetryDependencyValidation.summary.missingPackages} missing dependencies`)
          console.log(`🔧 [Dependency Validator] Attempting auto-fix...`)

          const fixedPackageJson = dependencyValidator.autoFix(
            retryResult.object.files.map(f => ({
              path: f.path,
              content: f.content,
              language: f.path.endsWith('.json') ? 'json' : 'plaintext'
            })),
            tailwindRetryDependencyValidation
          )

          if (fixedPackageJson) {
            const packageJsonIndex = retryResult.object.files.findIndex(f => f.path.endsWith('package.json'))
            if (packageJsonIndex !== -1) {
              retryResult.object.files[packageJsonIndex].content = fixedPackageJson.content
              console.log(`✅ [Dependency Validator] Auto-fixed package.json with ${tailwindRetryDependencyValidation.summary.missingPackages} missing packages`)
            }
          }
        } else {
          console.log(`✅ [Dependency Validator] All ${tailwindRetryDependencyValidation.summary.uniquePackages} packages properly declared`)
        }

        return retryResult.object
      }

      // CHECK IF AI IS JUST ECHOING THE PROMPT - Detect placeholder/text-only responses
      const allFiles = result.object.files
      let isEchoingPrompt = false

      // Check ALL files for echo patterns
      for (const file of allFiles) {
        const codeContent = file.content.toLowerCase()
        const promptLower = request.prompt.toLowerCase()

        // Multiple echo detection strategies
        const directEcho = codeContent.includes(promptLower)
        const hasPromptInHeading = codeContent.includes(`<h1>${promptLower}`) ||
                                    codeContent.includes(`<h2>${promptLower}`) ||
                                    codeContent.includes(`<h1 `) && codeContent.includes(`>${promptLower}<`)
        const hasPromptInDiv = codeContent.includes(`<div>${promptLower}`) ||
                               codeContent.includes(`<div `) && codeContent.includes(`>${promptLower}<`)
        const hasPromptInPara = codeContent.includes(`<p>${promptLower}`) ||
                                codeContent.includes(`<p `) && codeContent.includes(`>${promptLower}<`)

        // Check if multiple prompt words appear in JSX content (not as attributes)
        const promptWords = promptLower.split(' ').filter(w => w.length > 4)
        let wordsFoundInJSX = 0
        for (const word of promptWords) {
          if (codeContent.includes(`>${word}<`) || codeContent.includes(`> ${word} <`)) {
            wordsFoundInJSX++
          }
        }

        if (directEcho || hasPromptInHeading || hasPromptInDiv || hasPromptInPara || wordsFoundInJSX >= 3) {
          console.warn(`🚨 ECHO DETECTED in ${file.path}:`, {
            directEcho,
            hasPromptInHeading,
            hasPromptInDiv,
            hasPromptInPara,
            wordsFoundInJSX
          })
          isEchoingPrompt = true
          break
        }
      }

      if (isEchoingPrompt) {
        console.warn(`AI is echoing the prompt instead of building an application! Regenerating...`)

          const antiEchoPrompt = `${enhancedPrompt}

🚨🚨🚨 CRITICAL ERROR DETECTED: YOU ARE ECHOING THE USER'S PROMPT! 🚨🚨🚨
❌ You created: <div>${request.prompt}</div> or <h1>${request.prompt}</h1>
❌ This is COMPLETELY WRONG! You are NOT building an application!

✅ CORRECT APPROACH FOR "${request.prompt}":
You MUST BUILD a complete, FUNCTIONAL application with REAL features:

${request.prompt.toLowerCase().includes('financial statement') ? `
FOR FINANCIAL STATEMENT ANALYZER:
1. FinancialDashboard.tsx - Main dashboard with P&L, Balance Sheet, Cash Flow tabs
2. StatementUploader.tsx - File upload component with drag-drop (PDF/Excel)
3. BalanceSheetAnalyzer.tsx - Displays Assets, Liabilities, Equity with interactive charts
4. IncomeStatementView.tsx - Revenue, Expenses, Net Income with trend analysis
5. CashFlowAnalysis.tsx - Operating, Investing, Financing activities visualization
6. RatioCalculator.tsx - Financial ratios (ROE, ROA, Current Ratio, Quick Ratio, Debt-to-Equity)
7. TrendChart.tsx - Multi-year comparison charts using recharts
8. AlertSystem.tsx - Anomaly detection and financial warnings
9. ReportGenerator.tsx - Export to PDF/Excel functionality UI
10. MockFinancialData.ts - Complete mock data for 3 years of statements
` : request.prompt.toLowerCase().includes('login') || request.prompt.toLowerCase().includes('auth') ? `
FOR LOGIN/AUTH APPLICATION:
1. LoginPage.tsx - Full login form with email/password validation
2. SignupPage.tsx - Registration form with password strength
3. ForgotPassword.tsx - Password reset flow
4. AuthLayout.tsx - Authentication pages wrapper
5. useAuth.ts - Custom authentication hook
6. authService.ts - Mock authentication service
7. ProtectedRoute.tsx - Route guard component
` : `
FOR DASHBOARD APPLICATION:
1. Dashboard.tsx - Main metrics overview with KPIs
2. Sidebar.tsx - Collapsible navigation
3. MetricsCards.tsx - Key metrics with animations
4. DataTable.tsx - Sortable/filterable data grid
5. Charts.tsx - Multiple chart types (bar, line, pie)
6. mockData.ts - Rich mock data (50+ items)
`}

🚨 RULES:
- Each file MUST be 80-200 lines of REAL, EXECUTABLE code
- Use ONLY Tailwind CSS classes for styling (NO CSS-in-JS)
- Include useState, useEffect, real event handlers
- Add mock data that looks production-ready
- Include animations and transitions
- Make it interactive (buttons work, forms validate, data filters)

DO NOT just display "${request.prompt}" as text!
BUILD THE ACTUAL WORKING APPLICATION NOW!
Generate 8-12 complete files!`

          const antiEchoResult = await generateObject({
            model,
            system: await this.buildSystemPrompt(request.prompt, request.context),
            prompt: antiEchoPrompt,
            schema: z.object({
              code: z.string().optional(),
              explanation: z.string(),
              files: z.array(z.object({
                path: z.string(),
                content: z.string(),
                type: z.enum(['create', 'modify', 'delete']),
              })).min(2, 'MUST generate at least 2 complete files'),
              dependencies: z.array(z.string()).optional(),
              instructions: z.string().optional(),
            }),
          })

          console.log(`Regenerated after detecting echo: ${antiEchoResult.object.files.length} files`)
          return antiEchoResult.object
      }

      // VALIDATE CONTENT QUALITY - Check file sizes and substance
      const componentFiles = result.object.files.filter(f =>
        f.path.endsWith('.tsx') || f.path.endsWith('.ts') || f.path.endsWith('.jsx') || f.path.endsWith('.js')
      )

      // 🚨 DISABLED: Quality retry causes AI exhaustion, generating fewer files each time
      const ENABLE_QUALITY_RETRY = false

      let hasQualityIssues = false
      const qualityIssues: string[] = []

      // Check each component file for minimum line count
      for (const file of componentFiles) {
        const lineCount = file.content.split('\n').length
        const charCount = file.content.length

        // Skip small config files like package.json
        if (file.path.includes('package.json') || file.path.includes('tsconfig') || file.path.includes('README')) {
          continue
        }

        // Component files should be substantial (at least 30 lines, 500 characters)
        if (lineCount < 30 || charCount < 500) {
          hasQualityIssues = true
          qualityIssues.push(`${file.path} is too short (${lineCount} lines, ${charCount} chars)`)
        }

        // Check for placeholder content
        const lowerContent = file.content.toLowerCase()
        const hasPlaceholders = lowerContent.includes('todo:') ||
                               lowerContent.includes('implementation goes here') ||
                               lowerContent.includes('add your') ||
                               lowerContent.includes('implement this') ||
                               lowerContent.includes('placeholder')

        if (hasPlaceholders) {
          hasQualityIssues = true
          qualityIssues.push(`${file.path} contains placeholder text`)
        }
      }

      if (hasQualityIssues && ENABLE_QUALITY_RETRY) {
        console.warn(`Quality issues detected:`, qualityIssues)
        console.warn(`Regenerating with quality requirements...`)

        const qualityPrompt = `${enhancedPrompt}

🚨 CRITICAL QUALITY ISSUES DETECTED - FILES TOO SHORT OR CONTAIN PLACEHOLDERS! 🚨

Previous attempt had these problems:
${qualityIssues.map(issue => `- ${issue}`).join('\n')}

MANDATORY REQUIREMENTS FOR EACH FILE:
1. Component files (.tsx/.ts) MUST be AT LEAST 80-150 lines
2. ZERO placeholders like "TODO", "Implementation goes here", "Add your..."
3. COMPLETE, WORKING code with ALL logic implemented
4. Rich mock data (20-50 items for lists/tables)
5. Multiple hooks (useState, useEffect, custom hooks)
6. Event handlers (onClick, onChange, onSubmit)
7. Conditional rendering and mapping over data
8. Beautiful Tailwind CSS styling on EVERY element

EXAMPLES OF GOOD FILES:
- Dashboard.tsx: 150+ lines with metrics, charts, tables, state management
- DataTable.tsx: 120+ lines with sorting, filtering, pagination logic
- mockData.ts: 200+ lines with complete realistic data arrays

DO NOT submit short files! DO NOT use placeholders! WRITE COMPLETE CODE!
Generate 8-12 production-ready files NOW!`

        const qualityResult = await generateObject({
          model,
          system: await this.buildSystemPrompt(request.prompt, request.context),
          prompt: qualityPrompt,
          schema: z.object({
            code: z.string().optional(),
            explanation: z.string(),
            files: z.array(z.object({
              path: z.string(),
              content: z.string(),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(6, 'MUST generate at least 6 complete, substantial files'),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
        })

        console.log(`Regenerated with quality fixes: ${qualityResult.object.files.length} files`)

        // Convert path aliases before returning
        this.convertPathAliases(qualityResult.object.files)

        return qualityResult.object
      }

      // ENFORCE MINIMUM FILE COUNT - Regenerate if AI ignored requirements
      if (result.object.files.length < 6) {
        console.warn(`AI generated only ${result.object.files.length} files, regenerating with stronger prompt...`)

        // Add EXTREMELY forceful requirements
        const forcefulPrompt = `${enhancedPrompt}

⚠️ CRITICAL REQUIREMENTS - DO NOT IGNORE:
You MUST generate AT LEAST 10 FILES. This is NON-NEGOTIABLE.

Required files (generate ALL of these with REAL, EXECUTABLE CODE):
1. App.tsx - Main application component (MUST export default, 100+ lines)
2. components/Dashboard.tsx - Dashboard with metrics and charts (150+ lines)
3. components/Navigation.tsx - Animated navigation bar (80+ lines)
4. components/Sidebar.tsx - Collapsible sidebar (60+ lines)
5. components/MetricCard.tsx - Reusable metric card with animations (50+ lines)
6. components/DataTable.tsx - Sortable data table (100+ lines)
7. components/Chart.tsx - Chart components with Recharts (80+ lines)
8. components/Card.tsx - Reusable card component (40+ lines)
9. utils/mockData.ts - Mock data with 30-50 items (200+ lines)
10. utils/animations.ts - Framer Motion animation variants (40+ lines)
11. package.json - Complete dependencies
12. README.md - Setup and usage instructions

CRITICAL: Generate PRODUCTION-QUALITY, EXECUTABLE CODE with:
- Framer Motion animations (import { motion } from 'framer-motion')
- Recharts charts (import { BarChart, LineChart } from 'recharts')
- Beautiful Tailwind styling (className="...")
- NO placeholders, NO "Implementation here", NO explanatory text
- ONLY raw, working TypeScript/React code that can be executed immediately`

        const retryResult = await generateObject({
          model,
          system: await this.buildSystemPrompt(request.prompt, request.context),
          prompt: forcefulPrompt,
          schema: z.object({
            code: z.string().optional().describe('DEPRECATED: Leave empty'),
            explanation: z.string().describe('Brief explanation (2-3 sentences)'),
            files: z.array(z.object({
              path: z.string().describe('File path (e.g., src/App.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code. NO explanations, NO placeholders like "This is" or "Implementation goes here". Write COMPLETE working code with all imports, exports, logic, and styling. For React: full components with JSX, hooks, handlers. For data: full arrays with 20-50 items. EXECUTABLE CODE ONLY.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(2, 'MUST generate at least 2 complete files'),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
        })

        console.log(`Regenerated with ${retryResult.object.files.length} files`)

        // 🚀 PHASE 3A: SCAFFOLD INTEGRATION for retry - Detect and bundle BEFORE path conversion
        console.log('🎨 [Scaffold Integration] Analyzing retry result for component usage...')

        const retryFilesForDetection = retryResult.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' : 'plaintext'
        }))

        const retryUsedComponents = detectUsedComponents(retryFilesForDetection)

        if (retryUsedComponents.length > 0) {
          console.log(`🎨 [Scaffold Integration] Detected ${retryUsedComponents.length} components in retry:`, retryUsedComponents)

          const retryScaffoldFiles = bundleScaffoldComponents(retryUsedComponents)
          console.log(`🎨 [Scaffold Integration] Bundled ${retryScaffoldFiles.length} scaffold files`)

          for (const scaffoldFile of retryScaffoldFiles) {
            retryResult.object.files.push({
              path: scaffoldFile.path,
              content: scaffoldFile.content,
              type: 'create'
            })
          }

          console.log(`✅ [Scaffold Integration] Total files with scaffold: ${retryResult.object.files.length}`)
        }

        // 🚀 PHASE 3B: Convert path aliases for ALL files (AI + scaffold)
        this.convertPathAliases(retryResult.object.files)

        // 🚀 PHASE 3C: DEPENDENCY VALIDATION WITH AUTO-FIX (retry path)
        console.log('📦 [Dependency Validator] Checking import/dependency consistency...')
        const retryDependencyValidation = dependencyValidator.validate(
          retryResult.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                     f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' :
                     f.path.endsWith('.json') ? 'json' : 'plaintext'
          }))
        )

        console.log(dependencyValidator.formatResults(retryDependencyValidation))

        if (!retryDependencyValidation.isValid) {
          console.warn(`⚠️  [Dependency Validator] Found ${retryDependencyValidation.summary.missingPackages} missing dependencies`)
          console.log(`🔧 [Dependency Validator] Attempting auto-fix...`)

          const fixedPackageJson = dependencyValidator.autoFix(
            retryResult.object.files.map(f => ({
              path: f.path,
              content: f.content,
              language: f.path.endsWith('.json') ? 'json' : 'plaintext'
            })),
            retryDependencyValidation
          )

          if (fixedPackageJson) {
            const packageJsonIndex = retryResult.object.files.findIndex(f => f.path.endsWith('package.json'))
            if (packageJsonIndex !== -1) {
              retryResult.object.files[packageJsonIndex].content = fixedPackageJson.content
              console.log(`✅ [Dependency Validator] Auto-fixed package.json with ${retryDependencyValidation.summary.missingPackages} missing packages`)
            }
          }
        } else {
          console.log(`✅ [Dependency Validator] All ${retryDependencyValidation.summary.uniquePackages} packages properly declared`)
        }

        return retryResult.object
      }

      // 🚀 PHASE 1: Validate files with comprehensive validation
      const validationResult = comprehensiveValidation(
        result.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                   f.path.endsWith('.json') ? 'json' : 'text'
        })),
        'default' // Could be enhanced to detect type from prompt
      )

      const report = generateValidationReport(validationResult)
      console.log(report)

      // Log inline Tailwind component usage
      if (validationResult.shadcnCheck.usesShadcn) {
        console.log(`✅ Inline Tailwind components found: ${validationResult.shadcnCheck.componentsFound.join(', ')}`)
      } else {
        console.log(`⚠️  No inline components detected`)
      }

      // 🚀 PHASE 3A: SCAFFOLD INTEGRATION - Bundle shadcn/ui components BEFORE path conversion
      console.log('🎨 [Scaffold Integration] Analyzing generated code for component usage...')

      // Detect components BEFORE path conversion (while @/ imports still exist)
      const generatedFilesForDetection = result.object.files.map(f => ({
        path: f.path,
        content: f.content,
        language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                 f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
      }))

      const usedComponents = detectUsedComponents(generatedFilesForDetection)

      if (usedComponents.length > 0) {
        console.log(`🎨 [Scaffold Integration] Detected ${usedComponents.length} components:`, usedComponents)

        // Bundle the scaffold components
        const scaffoldFiles = bundleScaffoldComponents(usedComponents)
        console.log(`🎨 [Scaffold Integration] Bundled ${scaffoldFiles.length} scaffold files`)

        // Add scaffold files to the result
        for (const scaffoldFile of scaffoldFiles) {
          result.object.files.push({
            path: scaffoldFile.path,
            content: scaffoldFile.content,
            type: 'create'
          })
        }

        console.log(`✅ [Scaffold Integration] Total files with scaffold: ${result.object.files.length}`)
      } else {
        console.log(`⚠️  [Scaffold Integration] No scaffold components detected in generated code`)
        console.log(`   This might mean AI didn't use @/components/ui/* imports`)

        // Fallback: Bundle components based on the prompt pattern
        console.log(`   Falling back to component config: ${componentConfig.config.components.join(', ')}`)
        const fallbackScaffold = bundleScaffoldComponents(componentConfig.config.components)

        if (fallbackScaffold.length > 0) {
          console.log(`🎨 [Scaffold Integration] Bundled ${fallbackScaffold.length} files as fallback`)
          for (const scaffoldFile of fallbackScaffold) {
            result.object.files.push({
              path: scaffoldFile.path,
              content: scaffoldFile.content,
              type: 'create'
            })
          }
          console.log(`✅ [Scaffold Integration] Total files with fallback scaffold: ${result.object.files.length}`)
        }
      }

      // 🚀 PHASE 3B: CONVERT PATH ALIASES - Now convert ALL files (AI + scaffold)
      this.convertPathAliases(result.object.files)

      // 🚀 PHASE 7.3: STRUCTURED OUTPUT VALIDATION
      console.log('🔍 [Output Validator] Running quality checks...')
      const outputValidation = outputValidator.validate(
        result.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                   f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
        }))
      )

      // Log validation results
      console.log(outputValidator.formatResults(outputValidation))

      // Check for CRITICAL errors that cause immediate runtime failures
      const criticalErrors = outputValidation.errors.filter(e =>
        e.type === 'missing_import' ||  // Missing cn() import causes ReferenceError
        e.type === 'quality' && e.message.includes('JSX syntax but uses .ts extension')  // JSX in .ts causes SyntaxError
      )

      if (criticalErrors.length > 0) {
        console.error('❌ [Output Validator] CRITICAL errors detected that will cause runtime failures:')
        criticalErrors.forEach(e => console.error(`  - ${e.message}`))
        throw new Error(`Output validation failed with ${criticalErrors.length} critical error(s). Cannot proceed.`)
      }

      // Non-critical errors: log as warnings but don't block
      const nonCriticalErrors = outputValidation.errors.filter(e =>
        !(e.type === 'missing_import' || (e.type === 'quality' && e.message.includes('JSX syntax but uses .ts extension')))
      )
      if (nonCriticalErrors.length > 0) {
        console.warn('⚠️  [Output Validator] Output has quality issues (non-blocking):')
        nonCriticalErrors.forEach(e => console.warn(`  - ${e.message}`))
      }

      // 🚀 PHASE 7.3.5: STYLING QUALITY VALIDATION
      console.log('🎨 [Styling Validator] Running production quality checks...')
      const stylingValidation = stylingValidator.validate(
        result.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                   f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
        }))
      )

      // Log validation results
      console.log(stylingValidator.formatResults(stylingValidation))

      // If styling quality is too low (wireframe-like), log warnings but don't block
      if (!stylingValidation.isValid) {
        console.warn(`⚠️  [Styling Validator] Production quality below threshold:`)
        console.warn(`   Score: ${stylingValidation.score}/100 (need 70+)`)
        console.warn(`   Wireframe quality: ${stylingValidation.details.wireframeQuality}/100 (lower is better)`)
        console.warn(`   Consider regenerating with enhanced styling prompts`)
        stylingValidation.errors.forEach(e => console.warn(`  - [${e.severity}] ${e.message}`))
        // Don't throw error - log for monitoring, but allow generation to proceed
        // Future: Could trigger automatic regeneration with styling-focused prompts
      } else {
        console.log(`✨ [Styling Validator] Production-ready! Score: ${stylingValidation.score}/100`)
      }

      // 🚀 PHASE 7.3.6: DEPENDENCY VALIDATION WITH AUTO-FIX
      console.log('📦 [Dependency Validator] Checking import/dependency consistency...')
      const dependencyValidation = dependencyValidator.validate(
        result.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                   f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' :
                   f.path.endsWith('.json') ? 'json' : 'plaintext'
        }))
      )

      // Log validation results
      console.log(dependencyValidator.formatResults(dependencyValidation))

      // If dependencies are missing, AUTO-FIX package.json
      if (!dependencyValidation.isValid) {
        console.warn(`⚠️  [Dependency Validator] Found ${dependencyValidation.summary.missingPackages} missing dependencies`)
        console.log(`🔧 [Dependency Validator] Attempting auto-fix...`)

        const fixedPackageJson = dependencyValidator.autoFix(
          result.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.json') ? 'json' : 'plaintext'
          })),
          dependencyValidation
        )

        if (fixedPackageJson) {
          // Replace package.json with fixed version
          const packageJsonIndex = result.object.files.findIndex(f => f.path.endsWith('package.json'))
          if (packageJsonIndex !== -1) {
            result.object.files[packageJsonIndex].content = fixedPackageJson.content
            console.log(`✅ [Dependency Validator] Auto-fixed package.json with ${dependencyValidation.summary.missingPackages} missing packages`)

            // Re-validate to confirm fix
            const revalidation = dependencyValidator.validate(
              result.object.files.map(f => ({
                path: f.path,
                content: f.content,
                language: f.path.endsWith('.json') ? 'json' : 'plaintext'
              }))
            )
            if (revalidation.isValid) {
              console.log(`✨ [Dependency Validator] All dependencies now satisfied!`)
            }
          }
        } else {
          console.error(`❌ [Dependency Validator] Auto-fix failed`)
        }
      } else {
        console.log(`✅ [Dependency Validator] All ${dependencyValidation.summary.uniquePackages} packages properly declared`)
      }

      // 🚀 PHASE 7.4: PREVIEW RENDERING VALIDATION (Optional - enabled via env var)
      const enablePreviewValidation = process.env.ENABLE_PREVIEW_VALIDATION === 'true'

      if (enablePreviewValidation) {
        console.log('🌐 [Preview Validator] Running headless browser validation...')

        try {
          const previewValidation = await previewValidator.validate(
            result.object.files.map(f => ({
              path: f.path,
              content: f.content,
              language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                       f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
            }))
          )

          // Log validation results
          console.log(previewValidator.formatResults(previewValidation))

          // If preview fails, reject the output
          if (!previewValidation.isValid) {
            console.error('❌ [Preview Validator] Preview rendering failed, triggering retry...')
            throw new Error(`Preview validation failed: ${previewValidation.errors.map(e => e.message).join('; ')}`)
          }
        } catch (error: any) {
          // If preview validation fails completely, log but don't block (it's experimental)
          console.warn('⚠️ [Preview Validator] Validation error (non-blocking):', error.message)
        }
      } else {
        console.log('ℹ️  [Preview Validator] Skipped (set ENABLE_PREVIEW_VALIDATION=true to enable)')
      }

      return result.object
    } catch (error: any) {
      console.error('❌ Error generating code:', error)
      console.error('Error name:', error?.name)
      console.error('Error message:', error?.message)
      console.error('Error cause:', error?.cause)
      console.error('Error stack:', error?.stack?.substring(0, 500))

      // Log response details if available
      if (error?.text) {
        console.error('🔍 AI Response Text Length:', error.text.length)
        console.error('🔍 AI Response Preview (first 500 chars):', error.text.substring(0, 500))
        console.error('🔍 AI Response Preview (last 500 chars):', error.text.substring(Math.max(0, error.text.length - 500)))
      }

      if (error?.response) {
        console.error('🔍 HTTP Response Status:', error.response.status)
        console.error('🔍 HTTP Response Data:', JSON.stringify(error.response.data).substring(0, 500))
      }

      // Check if this is a JSON parsing error (apostrophe/escape issue)
      const isJSONParseError = error?.message?.includes('JSON') ||
                              error?.message?.includes('parse') ||
                              error?.message?.includes('escaped character') ||
                              error?.message?.includes('schema') ||
                              error?.cause?.message?.includes('JSON') ||
                              error?.cause?.message?.includes('parse')

      if (isJSONParseError) {
        console.error('🚨 JSON Parse Error detected - likely apostrophe/escape issue or schema validation failure')
        console.error('Error details:', {
          message: error.message,
          cause: error.cause?.message,
          textLength: error.text?.length || 0,
          hasText: !!error.text
        })

        // ONE RETRY with explicit JSON safety instructions
        try {
          console.log('🔄 Retrying with JSON-safe prompt...')

          const jsonSafePrompt = `${enhancedPrompt}

🚨🚨🚨 CRITICAL JSON SAFETY ERROR IN PREVIOUS ATTEMPT! 🚨🚨🚨

Your previous response had a JSON parsing error due to improper string escaping.

MANDATORY RULES FOR THIS ATTEMPT:

1. **DO NOT use apostrophes in single-quoted strings**
   ❌ NEVER: 'Don\\'t have an account?'
   ✅ ALWAYS: "Don't have an account?" (use double quotes for strings with apostrophes)
   ✅ OR: 'Do not have an account?' (rephrase without apostrophes)

2. **Avoid ALL contractions with apostrophes:**
   ❌ don't, can't, won't, shouldn't, wouldn't, it's, that's, user's
   ✅ do not, cannot, will not, should not, would not, it is, that is, user

3. **For possessives and contractions, use alternatives:**
   ❌ "User's profile" → ✅ "User profile" or "Profile of user"
   ❌ "It's loading" → ✅ "Loading" or "It is loading"
   ❌ "Don't have an account?" → ✅ "Do not have an account?" or "No account yet?"

4. **Use template literals for complex strings:**
   ✅ \`Welcome to the application\`
   ✅ \`Click here to continue\`

Generate your JSON response following these rules STRICTLY.
Generate 8-12 complete, production-ready files NOW!`

          const safeResult = await generateObject({
            model,
            system: await this.buildSystemPrompt(request.prompt, request.context),
            prompt: jsonSafePrompt,
            schema: z.object({
              code: z.string().optional(),
              explanation: z.string(),
              files: z.array(z.object({
                path: z.string(),
                content: z.string(),
                type: z.enum(['create', 'modify', 'delete']),
              })).min(6, 'MUST generate at least 6 complete, substantial files'),
              dependencies: z.array(z.string()).optional(),
              instructions: z.string().optional(),
            }),
          })

          console.log('✅ JSON-safe retry successful!')

          // 🚀 PHASE 3A: SCAFFOLD INTEGRATION for JSON retry - Detect and bundle BEFORE path conversion
          const jsonRetryFilesForDetection = safeResult.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                     f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
          }))

          const jsonRetryUsedComponents = detectUsedComponents(jsonRetryFilesForDetection)
          if (jsonRetryUsedComponents.length > 0) {
            console.log(`🎨 [Scaffold Integration] Detected ${jsonRetryUsedComponents.length} components in JSON retry:`, jsonRetryUsedComponents)

            const jsonRetryScaffoldFiles = bundleScaffoldComponents(jsonRetryUsedComponents)
            console.log(`🎨 [Scaffold Integration] Bundled ${jsonRetryScaffoldFiles.length} scaffold files`)

            for (const scaffoldFile of jsonRetryScaffoldFiles) {
              safeResult.object.files.push({
                path: scaffoldFile.path,
                content: scaffoldFile.content,
                type: 'create'
              })
            }

            console.log(`✅ [Scaffold Integration] Total files with scaffold: ${safeResult.object.files.length}`)
          }

          // 🚀 PHASE 3B: Convert path aliases for ALL files (AI + scaffold)
          this.convertPathAliases(safeResult.object.files)

          return safeResult.object
        } catch (retryError) {
          console.error('❌ JSON-safe retry also failed:', retryError)
          throw new Error('Failed to generate code after JSON safety retry. Please try again.')
        }
      }

      throw new Error('Failed to generate code. Please try again.')
    }
  }

  async chat(request: ChatRequest) {
    try {
      const provider = request.provider || this.defaultProvider
      const model = this.getModelInstance(provider)

      // Track usage
      // await usageService.trackUsage({
      //   userId: request.userId,
      //   type: 'chat',
      //   provider,
      //   promptTokens: request.messages.reduce((acc, msg) => acc + msg.content.length, 0),
      // })

      // Extract the last user message as the prompt for context
      const lastUserMessage = request.messages.filter(m => m.role === 'user').pop()
      const userPrompt = lastUserMessage?.content || ''

      // Add system message if not present
      const messages = request.messages
      if (messages[0]?.role !== 'system') {
        messages.unshift({
          role: 'system',
          content: await this.buildSystemPrompt(userPrompt, request.context),
        })
      }

      const result = await generateText({
        model,
        messages,
      })

      console.log(`AI chat for user ${request.userId}`, {
        provider,
        messagesCount: request.messages.length,
      })

      return {
        message: result.text,
        usage: result.usage,
      }
    } catch (error) {
      console.error('Error in AI chat:', error)
      throw new Error('Failed to process chat message. Please try again.')
    }
  }

  async analyzeCode(request: AnalyzeCodeRequest) {
    try {
      const provider = this.defaultProvider
      const model = this.getModelInstance(provider)

      // Track usage
      // await usageService.trackUsage({
      //   userId: request.userId,
      //   type: 'code_analysis',
      //   provider,
      //   promptTokens: request.code.length,
      // })

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

      console.log(`Analyzed code for user ${request.userId}`, {
        language: request.language,
        codeLength: request.code.length,
        score: result.object.score,
      })

      return result.object
    } catch (error) {
      console.error('Error analyzing code:', error)
      throw new Error('Failed to analyze code. Please try again.')
    }
  }

  async streamGeneration(request: GenerateCodeRequest) {
    try {
      const provider = request.provider || this.defaultProvider
      const model = this.getModelInstance(provider)

      const result = streamText({
        model,
        system: await this.buildSystemPrompt(request.prompt, request.context),
        prompt: request.prompt,
      })

      return result
    } catch (error) {
      console.error('Error streaming generation:', error)
      throw new Error('Failed to stream generation. Please try again.')
    }
  }
}

export const aiService = new AIService()
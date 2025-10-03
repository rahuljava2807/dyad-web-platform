import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { azure } from '@ai-sdk/azure'
import { generateObject, generateText, streamText } from 'ai'
import { z } from 'zod'
import { aiRulesService } from './ai-rules'
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
  chatHistory?: ChatMessage[]
  aiRules?: string
  mode?: 'build' | 'ask'
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

interface GenerateCodeRequest {
  prompt: string
  context?: GenerationContext
  provider?: string
  userId: string
}

interface ChatRequest {
  messages: ChatMessage[]
  context?: GenerationContext
  provider?: string
  userId: string
  mode?: 'build' | 'ask'
}

interface ChatResponse {
  response: string
  isCode?: boolean
  files?: GeneratedFile[]
  previewUrl?: string
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
    let systemPrompt = `You are a world-class software architect and design expert specializing in creating BEAUTIFUL, production-ready web applications that would make Steve Jobs proud.

🚨🚨🚨 CRITICAL TAILWIND CSS REQUIREMENT - THIS IS MANDATORY 🚨🚨🚨
🚨 YOUR APPLICATION WILL HAVE ZERO STYLING IF YOU IGNORE THIS 🚨
🚨 EVERY className MUST USE REAL TAILWIND CSS UTILITY CLASSES 🚨

❌❌❌ ABSOLUTELY FORBIDDEN - These will cause COMPLETE FAILURE:
❌ className="metric-card" ❌ className="dashboard" ❌ className="navigation"
❌ className="sidebar" ❌ className="data-table" ❌ className="chart"
❌ className="container" ❌ className="wrapper" ❌ className="header"
❌ className="footer" ❌ className="content" ❌ className="main"
❌ ANY generic class names that are not Tailwind utilities

✅✅✅ MANDATORY - Use ONLY these Tailwind utility patterns:
✅ className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
✅ className="flex items-center justify-between gap-4"
✅ className="text-2xl font-bold text-gray-900"
✅ className="grid grid-cols-1 md:grid-cols-4 gap-6"
✅ className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
✅ className="w-full h-full min-h-screen bg-gray-50"
✅ className="max-w-7xl mx-auto px-4 py-8"

🚨 VALIDATION RULE: Before generating ANY className, ask yourself:
1. Is this a real Tailwind CSS utility class? (bg-, text-, flex-, grid-, etc.)
2. If not, replace it with proper Tailwind utilities
3. EVERY element must have Tailwind classes for styling

🚨 EXAMPLES OF CORRECT TAILWIND USAGE:
- Cards: className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
- Buttons: className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
- Layouts: className="flex flex-col md:flex-row gap-6 items-center justify-between"
- Text: className="text-3xl font-bold text-gray-900 mb-4"
- Spacing: className="p-8 m-4 space-y-6 gap-4"

🚨 IF YOU USE GENERIC CLASS NAMES, THE PREVIEW WILL BE COMPLETELY UNSTYLED!
🚨 THIS IS A CRITICAL PRODUCTION ISSUE - TAILWIND CLASSES ARE MANDATORY!

CORE DESIGN PHILOSOPHY:
- "Simplicity is the ultimate sophistication" - Every UI element must be clean, purposeful, and beautiful
- "Design is how it works" - Beauty AND functionality are equally important
- "Details matter" - Perfect spacing, smooth animations, polished interactions
- "Delight the user" - Add magical moments, smooth transitions, surprising polish

MANDATORY REQUIREMENTS FOR EVERY APPLICATION:

1. VISUAL EXCELLENCE:
   - Use modern design with gradients, shadows, and glassmorphism effects
   - Implement smooth animations with Framer Motion
   - Include hover effects (scale: 1.05, translateY: -5px, enhanced shadows)
   - Add decorative background elements (floating gradient orbs, subtle patterns)
   - Use professional color palettes (blues, purples, clean whites, subtle grays)
   - Ensure pixel-perfect spacing using 8px grid system
   - Add depth with layered shadows and subtle borders

2. COMPONENT STRUCTURE (Generate 8-12 files):
   CRITICAL: Main component MUST be named App.tsx
   Required files:
   - App.tsx - Main application component (the entry point, MUST export default)
   - components/Dashboard.tsx - Main dashboard with metrics and visualizations
   - components/Navigation.tsx - Animated navbar with glassmorphism
   - components/Sidebar.tsx - Collapsible sidebar with smooth transitions
   - components/MetricCard.tsx - Animated metric cards with icons
   - components/DataTable.tsx - Sortable table with hover effects
   - components/Chart.tsx - Beautiful data visualizations with Recharts
   - components/Card.tsx - Reusable card component with animations
   - utils/mockData.ts - Realistic industry-specific sample data (20-50 items)
   - utils/animations.ts - Reusable Framer Motion animation variants
   - package.json - Complete dependencies list
   - README.md - Setup and usage instructions

   NOTE: File paths can be with or without "src/" prefix (e.g., "App.tsx" or "src/App.tsx")

3. STYLING REQUIREMENTS (Tailwind CSS):
   - Gradients: bg-gradient-to-r from-blue-500 to-purple-600
   - Shadows: shadow-lg hover:shadow-2xl transition-shadow duration-300
   - Glassmorphism: bg-white/30 backdrop-blur-lg border border-white/20
   - Rounded corners: rounded-xl (12px) or rounded-2xl (16px)
   - Spacing: Use p-6, p-8, gap-6, space-y-4 consistently
   - Responsive: Mobile-first with sm:, md:, lg:, xl: breakpoints
   - Colors: Use blue-500, purple-600, gray-900, gray-50 from Tailwind palette

4. ANIMATIONS (Framer Motion):
   - Page load: Stagger children with 0.1s delay
   - Cards: initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
   - Hover: whileHover={{ scale: 1.05, y: -5 }}
   - Tap: whileTap={{ scale: 0.95 }}
   - Lists: Container with staggerChildren, items with variants
   - Modals: Fade backdrop + scale content
   - Loading: Smooth rotating spinner with gradient border

5. INTERACTIVE ELEMENTS:
   Must include:
   - Search bars with Lucide icons and focus effects
   - Sortable tables with animated sort indicators
   - Filterable data with dropdown menus
   - Clickable cards with navigation and hover lift
   - Dropdown menus with smooth animations
   - Notification badges with pulse animation
   - Toast notifications for user actions
   - Modal dialogs with backdrop blur

6. DATA VISUALIZATION (Recharts):
   Include at least 2 charts:
   - Bar charts with gradient fills
   - Line charts with smooth curves
   - Pie/Donut charts with custom colors
   - Add animated tooltips and legends
   - Responsive container sizing
   - Professional color schemes

7. CODE QUALITY STANDARDS:
   - TypeScript with proper type definitions
   - Comprehensive error handling with try/catch
   - Loading states with skeleton screens or spinners
   - Empty states with helpful messages and actions
   - Success/error feedback with toast notifications
   - ARIA labels for accessibility
   - JSDoc comments for complex functions
   - Meaningful variable names

8. REQUIRED DEPENDENCIES (package.json):
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.344.0",
    "recharts": "^2.5.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "tailwindcss": "^3.4.1"
  }
}

9. MOCK DATA REQUIREMENTS:
   - Generate 20-50 realistic items for lists/tables
   - Include variety: different statuses, categories, dates
   - Use realistic names, values, and descriptions
   - Add timestamps in ISO format
   - Include proper data types (numbers, strings, booleans, dates)
   - Make data industry-specific and contextual

10. UI PATTERNS TO IMPLEMENT:

    NAVIGATION BAR:
    - Sticky top with bg-white/80 backdrop-blur-xl
    - Logo with scale animation on hover
    - Nav items with animated underline on hover
    - User avatar with dropdown menu
    - Notification bell with badge count
    - Search bar with icon and focus ring

    HERO/HEADER SECTION:
    - Large heading with gradient text
    - Subtitle with gray-600 color
    - Animated on page load (fade + slide up)
    - Optional background gradient or pattern

    METRICS DASHBOARD (4 cards):
    - Icon with gradient background
    - Large number with animated counter
    - Label text below
    - Change percentage with color (green/red)
    - Shadow and hover lift effect

    DATA CARDS:
    - White background with border
    - Padding p-6
    - Hover: -translateY-2 and shadow-xl
    - Status badges (colored pills)
    - Action buttons revealed on hover

    TABLES:
    - Alternating row colors (bg-gray-50)
    - Sortable headers with click handlers
    - Pagination controls at bottom
    - Row hover effects
    - Action icons in last column

    CHARTS:
    - Gradient fills (blue to purple)
    - Smooth entry animations
    - Interactive tooltips
    - Legend with colored squares
    - Responsive container (ResponsiveContainer)

EXAMPLE COLOR SCHEMES BY INDUSTRY:
- Legal: Deep blues (#1E40AF), Professional grays (#6B7280), Gold accents (#F59E0B)
- Construction: Orange (#EA580C), Steel gray (#78716C), Safety yellow (#EAB308)
- Healthcare: Medical blue (#0EA5E9), Health green (#10B981), Purple (#8B5CF6)
- Financial: Success green (#059669), Navy (#1E3A8A), Gold (#F59E0B)
- General: Blue (#3B82F6), Purple (#8B5CF6), Gray (#6B7280)

TYPOGRAPHY STANDARDS:
- Hero headings: text-4xl font-bold (36px)
- Section headings: text-2xl font-semibold (24px)
- Card titles: text-lg font-medium (18px)
- Body text: text-base (16px)
- Small text: text-sm (14px)
- Tiny text: text-xs (12px)
- Font family: Inter (built into Tailwind)

SPACING SYSTEM (8px grid):
- Extra small: p-2, m-2 (8px)
- Small: p-4, m-4 (16px)
- Medium: p-6, m-6 (24px)
- Large: p-8, m-8 (32px)
- Extra large: p-12, m-12 (48px)
- Use gap-4, gap-6, space-y-4 consistently

CRITICAL RULES:
- Every component must have at least one animation
- Every interactive element must have a hover effect
- All spacing must follow the 8px grid
- Code must be production-ready, not prototype quality
- Applications should be portfolio-worthy
- Think Apple, Stripe, Linear, Vercel quality

GENERATION TARGETS:
- Minimum 8 files (components + utils + config)
- Minimum 600 lines of total code
- At least 5 different components
- At least 2 data visualizations
- Full responsive design
- Complete type definitions

If user asks for a "simple" app, still make it BEAUTIFUL and complete.
If they mention a dashboard, include: metrics, charts, tables, filters.
If they specify an industry, use appropriate colors and terminology.

Generate code that makes developers say "This AI understands design!"
Make every application a work of art that users want to show off.`

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

    return systemPrompt
  }

  async generateCode(request: GenerateCodeRequest) {
    try {
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
      let enhancedPrompt = request.prompt
      // if (request.context?.project) {
      //   const yaviContext = await yaviService.getRelevantContext(request.prompt, request.context.project.id)
      //   if (yaviContext) {
      //     enhancedPrompt += `\n\nRelevant context from Yavi.ai:\n${yaviContext}`
      //   }
      // }

      // Add production-quality requirements to the prompt
      enhancedPrompt += `

🚨🚨🚨 CRITICAL GENERATION REQUIREMENTS 🚨🚨🚨
1. Generate a COMPLETE, BEAUTIFUL application with at least 8-10 files
2. Include rich UI components with Framer Motion animations
3. Add data visualizations using Recharts
4. 🚨 MANDATORY: Use ONLY Tailwind CSS utility classes for ALL styling 🚨
5. Include realistic mock data (20-50 items)
6. Add proper TypeScript types and interfaces
7. Implement smooth hover effects and transitions
8. Make it production-ready and portfolio-worthy

🚨 TAILWIND CSS REQUIREMENTS (NON-NEGOTIABLE):
- EVERY className must use Tailwind utilities (bg-white, text-xl, flex, grid, etc.)
- NO generic class names (metric-card, dashboard, navigation, sidebar, etc.)
- Use proper Tailwind patterns: bg-white p-6 rounded-lg shadow-lg
- Include responsive classes: md:grid-cols-2, lg:text-3xl
- Add hover effects: hover:shadow-xl, hover:bg-blue-700
- Use proper spacing: p-6, m-4, gap-4, space-y-6

Generate files that include:
- Complete React components with animations
- Reusable UI components (Card, MetricCard, DataTable, etc.) - ALL with Tailwind classes
- Data visualization charts
- Mock data utilities
- Animation configuration
- Complete package.json with all dependencies
- Comprehensive README.md

🚨 REMEMBER: Generic class names = ZERO styling in preview!
🚨 ONLY Tailwind CSS utility classes will work!
🚨 Make every component beautiful, interactive, and polished with proper Tailwind classes!`

      const result = await generateObject({
        model,
        system: this.buildSystemPrompt(request.context),
        prompt: enhancedPrompt,
        schema: z.object({
          code: z.string().describe('DEPRECATED: Leave empty, use files array instead'),
          explanation: z.string().describe('Brief explanation of the application architecture and key features (2-3 sentences)'),
            files: z.array(z.object({
              path: z.string().describe('File path relative to project root (e.g., src/App.tsx, src/components/Dashboard.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code with MANDATORY TAILWIND CSS CLASSES. NO generic class names like "metric-card", "dashboard", or "navigation". Use ONLY Tailwind utilities like "bg-white p-6 rounded-lg shadow-lg", "flex items-center justify-between", "text-2xl font-bold text-gray-900". EVERY className must be a valid Tailwind CSS utility class. Generate COMPLETE, WORKING code with imports, exports, hooks, and proper JSX/TSX syntax.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(8).describe('MUST generate minimum 8-10 complete files with REAL code using ONLY Tailwind CSS classes'),
          dependencies: z.array(z.string()).optional().describe('Required NPM packages: react, react-dom, framer-motion, lucide-react, recharts, etc.'),
          instructions: z.string().optional().describe('Setup instructions'),
        }),
      })

      console.log(`Generated code for user ${request.userId}`, {
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
          system: this.buildSystemPrompt(request.context),
          prompt: tailwindEnforcementPrompt,
          schema: z.object({
            code: z.string().describe('DEPRECATED: Leave empty'),
            explanation: z.string().describe('Brief explanation (2-3 sentences)'),
            files: z.array(z.object({
              path: z.string().describe('File path (e.g., src/App.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code with PROPER TAILWIND CSS CLASSES. NO generic class names like "metric-card" or "dashboard". Use ONLY Tailwind utilities like "bg-white p-6 rounded-lg shadow-lg". EVERY className must be a valid Tailwind CSS utility class.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(8, 'MUST generate at least 8 complete files'),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
        })

        console.log(`Regenerated with proper Tailwind classes: ${retryResult.object.files.length} files`)
        return retryResult.object
      }

      // ENFORCE MINIMUM FILE COUNT - Regenerate if AI ignored requirements
      if (result.object.files.length < 8) {
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
          system: this.buildSystemPrompt(request.context),
          prompt: forcefulPrompt,
          schema: z.object({
            code: z.string().describe('DEPRECATED: Leave empty'),
            explanation: z.string().describe('Brief explanation (2-3 sentences)'),
            files: z.array(z.object({
              path: z.string().describe('File path (e.g., src/App.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code. NO explanations, NO placeholders like "This is" or "Implementation goes here". Write COMPLETE working code with all imports, exports, logic, and styling. For React: full components with JSX, hooks, handlers. For data: full arrays with 20-50 items. EXECUTABLE CODE ONLY.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(8, 'MUST generate at least 8 complete files'),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
        })

        console.log(`Regenerated with ${retryResult.object.files.length} files`)
        return retryResult.object
      }

      return result.object
    } catch (error) {
      console.error('Error generating code:', error)
      throw new Error('Failed to generate code. Please try again.')
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const provider = request.provider || this.defaultProvider
      const model = this.getModelInstance(provider)
      const mode = request.mode || 'ask'

      // Build context-aware system prompt
      const systemPrompt = await this.buildChatSystemPrompt(request.context, mode)

      // Add system message if not present
      const messages = request.messages
      if (messages[0]?.role !== 'system') {
        messages.unshift({
          role: 'system',
          content: systemPrompt,
        })
      }

      // Determine if this is a build request or ask request
      const lastMessage = messages[messages.length - 1]
      const isBuildRequest = mode === 'build' || this.isBuildRequest(lastMessage.content)

      if (isBuildRequest) {
        // Handle build mode - generate code
        return await this.handleBuildMode(request, messages, model)
      } else {
        // Handle ask mode - provide conversational response
        return await this.handleAskMode(request, messages, model)
      }

    } catch (error) {
      console.error('Error in AI chat:', error)
      throw new Error('Failed to process chat message. Please try again.')
    }
  }

  private async buildChatSystemPrompt(context?: GenerationContext, mode: 'build' | 'ask' = 'ask'): Promise<string> {
    const basePrompt = mode === 'build' 
      ? this.buildSystemPrompt(context)
      : `You are a helpful AI assistant for Yavi Studio, an AI-powered web application builder.

You help users:
- Answer questions about web development, React, Next.js, and modern frameworks
- Explain code concepts and best practices
- Provide guidance on UI/UX design
- Help debug issues and provide solutions
- Suggest improvements for applications

When users ask you to build something, you should:
- Ask clarifying questions about requirements
- Suggest the best approach and technologies
- Provide step-by-step guidance
- Offer to generate code when appropriate

Be helpful, clear, and encouraging. Always consider the user's skill level and provide appropriate explanations.`

    // Load AI rules from project if available
    let aiRules = context?.aiRules
    if (!aiRules && context?.project?.id) {
      try {
        const rules = await aiRulesService.getAIRules(context.project.id)
        aiRules = rules?.content
      } catch (error) {
        console.error('Error loading AI rules:', error)
      }
    }

    // Add AI rules if available
    if (aiRules) {
      return `${basePrompt}

PROJECT-SPECIFIC RULES:
${aiRules}`
    }

    return basePrompt
  }

  private isBuildRequest(message: string): boolean {
    const buildKeywords = [
      'build', 'create', 'generate', 'make', 'develop', 'construct',
      'app', 'application', 'website', 'dashboard', 'component',
      'todo', 'blog', 'ecommerce', 'portfolio', 'landing page'
    ]
    
    const lowerMessage = message.toLowerCase()
    return buildKeywords.some(keyword => lowerMessage.includes(keyword))
  }

  private async handleBuildMode(request: ChatRequest, messages: any[], model: any): Promise<ChatResponse> {
    const lastMessage = messages[messages.length - 1]
    
    // Convert chat request to code generation request
    const generateRequest: GenerateCodeRequest = {
      prompt: lastMessage.content,
      context: request.context,
      provider: request.provider,
      userId: request.userId
    }

    // Generate code
    const result = await this.generateCode(generateRequest)
    
    // Generate preview
    let previewUrl = ''
    try {
      const previewResponse = await fetch('http://localhost:5001/api/preview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: result.files })
      })
      
      if (previewResponse.ok) {
        const previewData = await previewResponse.json()
        previewUrl = `/api/preview/${previewData.sessionId}`
      }
    } catch (error) {
      console.error('Error generating preview:', error)
    }

    return {
      response: `I've generated a ${result.explanation.toLowerCase()}. Here are the files I created:

${result.files.map(file => `- ${file.path}`).join('\n')}

The application includes:
- Modern React components with TypeScript
- Beautiful Tailwind CSS styling
- Interactive animations with Framer Motion
- Data visualizations with Recharts
- Responsive design for all devices

You can review each file and approve or reject changes. The preview is available in the preview panel.`,
      isCode: true,
      files: result.files,
      previewUrl
    }
  }

  private async handleAskMode(request: ChatRequest, messages: any[], model: any): Promise<ChatResponse> {
    const result = await generateText({
      model,
      messages,
    })

    console.log(`AI chat response for user ${request.userId}`, {
      provider: request.provider,
      mode: 'ask',
      messagesCount: request.messages.length,
    })

    return {
      response: result.text,
      isCode: false
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
        system: this.buildSystemPrompt(request.context),
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
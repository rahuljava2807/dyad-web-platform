import * as path from 'path'
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
import { syntaxValidator } from './syntaxValidator'
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
  private defaultProvider = 'anthropic' // Claude 3.5 Sonnet - 200K context window, excellent for code generation

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
        return anthropic(model || 'claude-3-5-sonnet-20240620') // Claude 3.5 Sonnet - 200K context, best for code
      case 'google':
        return google(model || 'gemini-pro')
      case 'azure':
        return azure(model || 'gpt-4-turbo')
      default:
        return anthropic('claude-3-5-sonnet-20240620') // fallback to Claude 3.5 Sonnet
    }
  }

  /**
   * Converts @/ path aliases to relative paths for Sandpack compatibility
   * Sandpack doesn't support TypeScript tsconfig path aliases
   */
  private convertPathAliases(files: any[]): void {
    console.log('🔧 [Path Conversion] Converting @/ aliases to relative paths for Sandpack...');

    const pathMapping = {
      '@/': 'src/'
    };

    for (const file of files) {
      if (!file.path.match(/\.(tsx?|jsx?)$/)) continue;

      let convertedContent = file.content;

      // 🚨 FIX: Preserve original quote style to avoid mismatched quotes
      const importRegex = /from\s+(['"])(@\/[^'"]+)['"]/g;
      convertedContent = convertedContent.replace(importRegex, (match, openQuote, importPath) => {
        const alias = importPath.substring(0, 2);
        const importFile = importPath.substring(2);
        const fromPath = path.dirname(file.path);
        const toPath = path.join(pathMapping[alias], importFile);
        let relativePath = path.relative(fromPath, toPath);
        if (!relativePath.startsWith('.')) {
          relativePath = './' + relativePath;
        }
        // Use the same quote style as the original import
        return `from ${openQuote}${relativePath}${openQuote}`;
      });

      if (convertedContent !== file.content) {
        file.content = convertedContent;
        console.log(`🔧 [Path Conversion] Converted imports in ${file.path}`);
      }
    }

    console.log('✅ [Path Conversion] All @/ aliases converted to relative paths');
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
    console.log('🔍 [AI Service] ===== GENERATE CODE START =====');
    console.log('🔍 [AI Service] Provider requested:', request.provider);
    console.log('🔍 [AI Service] Default provider:', this.defaultProvider);
    console.log('🔍 [AI Service] Prompt:', request.prompt.substring(0, 100) + '...');
    console.log('🔍 [AI Service] Prompt length:', request.prompt.length);
    
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
      console.log('🔍 [AI Service] Using provider:', provider);
      console.log('🔍 [AI Service] ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
      console.log('🔍 [AI Service] Getting model instance...');
      
      const model = this.getModelInstance(provider)
      console.log('🔍 [AI Service] Model instance obtained');

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

🚨🚨🚨 CRITICAL EXPORT/IMPORT RULES (PREVENTS REACT ERRORS) 🚨🚨🚨
MANDATORY PATTERN - USE NAMED EXPORTS FOR ALL COMPONENTS:

✅ CORRECT PATTERN (use this for ALL React components):
// Component file: src/components/LoginForm.tsx
export const LoginForm = () => {
  return <div>...</div>
}

// Import in App.tsx:
import { LoginForm } from './components/LoginForm'

❌ FORBIDDEN - DO NOT MIX EXPORT STYLES:
// ❌ WRONG: export default function LoginForm()  (causes "Element type is invalid")
// ❌ WRONG: export default LoginForm  (causes import mismatches)

🔒 RULES TO FOLLOW:
1. ALL React components MUST use: export const ComponentName = () => { ... }
2. ALL imports MUST use destructuring: import { ComponentName } from './path'
3. NEVER use "export default" for React components (causes runtime errors)
4. ONLY App.tsx can use "export default App" if needed
5. Function components: Use arrow functions with export const
6. NO mixing of default and named exports in the same file

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

🚨 CRITICAL: DARK MODE USING CONDITIONAL RENDERING (Sandpack-compatible):
- Create useDarkMode hook that returns { isDark, toggleDark }
- Pass isDark prop to ALL components
- Use conditional rendering: className={\`base-classes \${isDark ? 'dark-classes' : 'light-classes'}\`}
- DO NOT use Tailwind dark: variants (dark:bg-gray-900) - Sandpack ignores these!
- Apply conditional classes to backgrounds, text, borders, shadows on EVERY element

🚨 REMEMBER: Generic class names = ZERO styling in preview!
🚨 ONLY Tailwind CSS utility classes will work!
🚨 Make every component beautiful, interactive, and polished with proper Tailwind classes!`

      console.log('🎯 Making initial generateObject call...')
      console.log('🔍 [AI Service] Building system prompt...');
      const systemPrompt = await this.buildSystemPrompt(request.prompt, request.context)
      console.log(`🔍 [AI Service] System prompt size: ${systemPrompt.length} chars`)
      console.log(`🔍 [AI Service] Enhanced prompt size: ${enhancedPrompt.length} chars`)
      console.log('🔍 [AI Service] Calling generateObject with provider:', provider);

      const startTime = Date.now();

      // 🚨 CRITICAL FIX: Set maxTokens and minFiles based on provider limits
      // GPT-4 Turbo: 4096 max completion tokens (can generate 2-4 files)
      // Claude 3.5 Sonnet: 8192 max completion tokens (can generate 6-10 files)
      const maxTokens = provider === 'openai' ? 4096 : 8000
      const minFiles = provider === 'openai' ? 2 : 6

      const result = await generateObject({
        model,
        system: systemPrompt,
        prompt: enhancedPrompt,
        schema: z.object({
          files: z.array(z.object({
            path: z.string().describe('File path relative to project root (e.g., src/App.tsx, src/components/Dashboard.tsx)'),
            content: z.string().describe('CRITICAL: ONLY raw executable code with MANDATORY TAILWIND CSS CLASSES. NO generic class names like "metric-card", "dashboard", or "navigation". Use ONLY Tailwind utilities like "bg-white p-6 rounded-lg shadow-lg", "flex items-center justify-between", "text-2xl font-bold text-gray-900". EVERY className must be a valid Tailwind CSS utility class. Generate COMPLETE, WORKING code with imports, exports, hooks, and proper JSX/TSX syntax.'),
            type: z.enum(['create', 'modify', 'delete']).optional(),
          })).min(minFiles).describe(`🚨 CRITICAL - REQUIRED FIELD: Generate minimum ${minFiles} complete files with REAL, EXECUTABLE code. This field is MANDATORY. Use ONLY Tailwind CSS classes for styling.`),
          explanation: z.string().describe('Brief explanation of the application architecture and key features (2-3 sentences)'),
          dependencies: z.array(z.string()).optional().describe('Required NPM packages: react, react-dom, framer-motion, lucide-react, recharts, etc.'),
          instructions: z.string().optional().describe('Setup instructions'),
        }),
        // 🚨 CRITICAL FIX: Use 'tool' mode for Claude - forces schema adherence via tool calling
        mode: provider === 'anthropic' ? 'tool' : 'auto',
        maxTokens: maxTokens,
      })

      // 🚨 FIX: Ensure all files have type='create' (some AI responses omit this field)
      result.object.files = result.object.files.map(f => ({
        ...f,
        type: f.type || 'create'
      }))

      const elapsed = Date.now() - startTime;
      console.log(`🔍 [AI Service] generateObject completed in ${elapsed}ms`);
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
            files: z.array(z.object({
              path: z.string().describe('File path (e.g., src/App.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code with PROPER TAILWIND CSS CLASSES. NO generic class names like "metric-card" or "dashboard". Use ONLY Tailwind utilities like "bg-white p-6 rounded-lg shadow-lg". EVERY className must be a valid Tailwind CSS utility class.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(2, 'MUST generate at least 2 complete files'),
            explanation: z.string().describe('Brief explanation (2-3 sentences)'),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
        })

        console.log(`Regenerated with proper Tailwind classes: ${retryResult.object.files.length} files`)

        // 🚀 DEPENDENCY VALIDATION WITH AUTO-FIX (Tailwind retry path)
        this.convertPathAliases(retryResult.object.files);
        console.log('📦 [Dependency Validator] Checking import/dependency consistency...')
        const tailwindRetryDependencyValidation = await dependencyValidator.validate(
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

        // 🚀 SYNTAX VALIDATION (Tailwind retry path)
        console.log('🔧 [Syntax Validator] Checking Tailwind retry for syntax errors...')
        const tailwindRetrySyntaxValidation = await syntaxValidator.validate(
          retryResult.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                     f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
          }))
        )

        console.log(syntaxValidator.formatResults(tailwindRetrySyntaxValidation))

        if (tailwindRetrySyntaxValidation.fixedFiles.length > 0) {
          retryResult.object.files = syntaxValidator.applyFixes(
            retryResult.object.files.map(f => ({
              path: f.path,
              content: f.content,
              language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                       f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
            })),
            tailwindRetrySyntaxValidation
          )
          console.log(`✅ [Syntax Validator] Applied ${tailwindRetrySyntaxValidation.fixedFiles.length} fixes to Tailwind retry`)
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
              files: z.array(z.object({
                path: z.string(),
                content: z.string(),
                type: z.enum(['create', 'modify', 'delete']),
              })).min(2, 'MUST generate at least 2 complete files'),
              explanation: z.string(),
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
            files: z.array(z.object({
              path: z.string(),
              content: z.string(),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(6, '🚨 CRITICAL - REQUIRED FIELD: MUST generate at least 6 complete, substantial files. This field is MANDATORY and must come first.'),
            explanation: z.string(),
            code: z.string().optional(),
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
            files: z.array(z.object({
              path: z.string().describe('File path (e.g., src/App.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code. NO explanations, NO placeholders like "This is" or "Implementation goes here". Write COMPLETE working code with all imports, exports, logic, and styling. For React: full components with JSX, hooks, handlers. For data: full arrays with 20-50 items. EXECUTABLE CODE ONLY.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(2, '🚨 CRITICAL - REQUIRED FIELD: MUST generate at least 2 complete files. This field is MANDATORY and must come first.'),
            explanation: z.string().describe('Brief explanation (2-3 sentences)'),
            code: z.string().optional().describe('DEPRECATED: Leave empty'),
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
        const retryDependencyValidation = await dependencyValidator.validate(
          retryResult.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                     f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' :
                     f.path.endsWith('.json') ? 'json' : 'plaintext'
          }))
        )

        console.log(dependencyValidator.formatResults(retryDependencyValidation))

        // 🚨 CRITICAL: Check if package.json is missing in retry path
        const retryHasNoPackageJson = retryDependencyValidation.errors.some(e => e.type === 'no_package_json')

        if (retryHasNoPackageJson) {
          console.error('🚨 [Dependency Validator] CRITICAL: No package.json in retry!')
          console.error('🔄 [Dependency Validator] Regenerating retry with package.json...')

          const retryPackageJsonPrompt = `${enhancedPrompt}

🚨🚨🚨 CRITICAL ERROR: YOU FORGOT package.json AGAIN! 🚨🚨🚨

This is the SECOND TIME you forgot it! package.json is ABSOLUTELY MANDATORY!

INCLUDE package.json with ALL imports as dependencies:
- react, react-dom (ALWAYS required)
- react-router-dom (if you use BrowserRouter, Routes, Route)
- framer-motion (if you use motion components)
- lucide-react (if you use icons from lucide)
- recharts (if you use charts)
- Any other packages you import

Example with react-router-dom:
{
  "name": "crm-app",
  "version": "0.1.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.294.0"
  }
}

REGENERATE WITH package.json NOW!`

          const retryPackageJsonResult = await generateObject({
            model,
            system: await this.buildSystemPrompt(request.prompt, request.context),
            prompt: retryPackageJsonPrompt,
            schema: z.object({
              files: z.array(z.object({
                path: z.string(),
                content: z.string(),
                type: z.enum(['create', 'modify', 'delete']),
              })).min(2, '🚨 CRITICAL - REQUIRED FIELD: Must include package.json. This field is MANDATORY and must come first.'),
              explanation: z.string(),
              code: z.string().optional(),
              dependencies: z.array(z.string()).optional(),
              instructions: z.string().optional(),
            }),
          })

          console.log(`✅ Retry regenerated with package.json: ${retryPackageJsonResult.object.files.length} files`)

          // 🚨 CRITICAL FIX: Only EXTRACT package.json, keep all other files!
          const packageJsonFile = retryPackageJsonResult.object.files.find(f =>
            f.path.endsWith('package.json') || f.path === 'package.json'
          )

          if (packageJsonFile) {
            // Add ONLY the package.json to existing files
            retryResult.object.files.push(packageJsonFile)
            console.log(`✅ Added package.json to existing ${retryResult.object.files.length - 1} files`)
          } else {
            console.warn(`⚠️ Package.json regeneration didn't include package.json, using all ${retryPackageJsonResult.object.files.length} files`)
            // Fallback: if no package.json found, add all files (shouldn't happen)
            for (const file of retryPackageJsonResult.object.files) {
              if (!retryResult.object.files.some(f => f.path === file.path)) {
                retryResult.object.files.push(file)
              }
            }
          }

          // No need to re-run scaffold detection - package.json won't have component imports
          // Just convert path aliases for the package.json if needed (it won't have any)
          this.convertPathAliases(retryResult.object.files)

          // Final dependency validation and auto-fix
          const finalValidation = await dependencyValidator.validate(
            retryResult.object.files.map(f => ({
              path: f.path,
              content: f.content,
              language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                       f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' :
                       f.path.endsWith('.json') ? 'json' : 'plaintext'
            }))
          )

          console.log(dependencyValidator.formatResults(finalValidation))

          // 🚨 FINAL SAFETY NET: If STILL no package.json after ALL retries, create default one
          const stillNoPackageJson = finalValidation.errors.some(e => e.type === 'no_package_json')

          if (stillNoPackageJson) {
            console.error('🚨 [Emergency Fallback] AI REFUSED to generate package.json even after 2 attempts!')
            console.error('🛟 [Emergency Fallback] Creating default package.json as last resort...')

            // Create a minimal default package.json
            const defaultPackageJson = {
              name: "generated-app",
              version: "0.1.0",
              private: true,
              scripts: {
                dev: "vite",
                build: "vite build",
                preview: "vite preview"
              },
              dependencies: {
                "react": "^18.2.0",
                "react-dom": "^18.2.0"
              },
              devDependencies: {
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0",
                "typescript": "^5.3.0",
                "vite": "^5.0.0"
              }
            }

            retryResult.object.files.push({
              path: 'package.json',
              content: JSON.stringify(defaultPackageJson, null, 2),
              type: 'create'
            })

            console.log('✅ [Emergency Fallback] Created default package.json')

            // Now run auto-fix to add any missing imports
            const emergencyValidation = await dependencyValidator.validate(
              retryResult.object.files.map(f => ({
                path: f.path,
                content: f.content,
                language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                         f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' :
                         f.path.endsWith('.json') ? 'json' : 'plaintext'
              }))
            )

            if (!emergencyValidation.isValid) {
              const emergencyFix = dependencyValidator.autoFix(
                retryResult.object.files.map(f => ({
                  path: f.path,
                  content: f.content,
                  language: f.path.endsWith('.json') ? 'json' : 'plaintext'
                })),
                emergencyValidation
              )

              if (emergencyFix) {
                const pkgIndex = retryResult.object.files.findIndex(f => f.path.endsWith('package.json'))
                if (pkgIndex !== -1) {
                  retryResult.object.files[pkgIndex].content = emergencyFix.content
                  console.log(`✅ [Emergency Fallback] Auto-fixed package.json with detected imports`)
                }
              }
            }
          } else if (!finalValidation.isValid) {
            // Normal auto-fix path (package.json exists but missing deps)
            const finalFix = dependencyValidator.autoFix(
              retryResult.object.files.map(f => ({
                path: f.path,
                content: f.content,
                language: f.path.endsWith('.json') ? 'json' : 'plaintext'
              })),
              finalValidation
            )
            if (finalFix) {
              const pkgIndex = retryResult.object.files.findIndex(f => f.path.endsWith('package.json'))
              if (pkgIndex !== -1) {
                retryResult.object.files[pkgIndex].content = finalFix.content
                console.log(`✅ [Dependency Validator] Final auto-fix applied`)
              }
            }
          }

          return retryResult.object
        } else if (!retryDependencyValidation.isValid) {
          // Normal auto-fix path (package.json exists but missing deps)
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

        // 🚀 SYNTAX VALIDATION (retry path)
        console.log('🔧 [Syntax Validator] Checking retry result for syntax errors...')
        const retrySyntaxValidation = await syntaxValidator.validate(
          retryResult.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                     f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
          }))
        )

        console.log(syntaxValidator.formatResults(retrySyntaxValidation))

        if (retrySyntaxValidation.fixedFiles.length > 0) {
          retryResult.object.files = syntaxValidator.applyFixes(
            retryResult.object.files.map(f => ({
              path: f.path,
              content: f.content,
              language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                       f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
            })),
            retrySyntaxValidation
          )
          console.log(`✅ [Syntax Validator] Applied ${retrySyntaxValidation.fixedFiles.length} fixes to retry result`)
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

      // 🔧 AUTO-FIX file extensions BEFORE validation
      const extensionFix = outputValidator.autoFixExtensions(
        result.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                   f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
        }))
      )

      if (extensionFix.fixed > 0) {
        // Apply the fixes to the actual files
        result.object.files = extensionFix.files.map(f => ({
          path: f.path,
          content: f.content,
          type: result.object.files.find(orig => orig.path === f.path || orig.path.replace('.ts', '.tsx') === f.path)?.type || 'create'
        }))
      }

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

      // 🚀 AUTO-REGENERATE if styling quality is too low (like v0.dev)
      // 🚨 TEMPORARILY DISABLED to debug blank screen issue
      const ENABLE_STYLING_RETRY = false
      if (ENABLE_STYLING_RETRY && !stylingValidation.isValid && stylingValidation.score < 50) {
        console.warn(`⚠️  [Styling Validator] Production quality TOO LOW:`)
        console.warn(`   Score: ${stylingValidation.score}/100 (need 70+)`)
        console.warn(`   Wireframe quality: ${stylingValidation.details.wireframeQuality}/100`)
        console.warn(`🔄 [Styling Validator] AUTO-REGENERATING with v0.dev-quality styling...`)

        const stylingEnforcementPrompt = `${enhancedPrompt}

🚨🚨🚨 CRITICAL STYLING FAILURE - YOUR PREVIOUS ATTEMPT WAS REJECTED! 🚨🚨🚨

Your previous generation scored ${stylingValidation.score}/100 for production quality.
This is COMPLETELY UNACCEPTABLE and looks like a wireframe, NOT a polished app like v0.dev!

YOU MUST FOLLOW THESE v0.dev-QUALITY STYLING RULES:

1. 🎨 GRADIENT BACKGROUNDS (MANDATORY on main containers):
   ✅ <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900">

2. 💎 DEEP SHADOWS (MANDATORY on all cards):
   ✅ <Card className="shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/5">
   ✅ <div className="bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 rounded-2xl">

3. 📐 GENEROUS SPACING (MANDATORY - p-8 minimum on cards):
   ✅ <Card className="p-8 space-y-6">
   ❌ FORBIDDEN: <Card className="p-4">  (too cramped!)

4. 🎭 SMOOTH TRANSITIONS (MANDATORY on ALL interactive elements):
   ✅ <Button className="transition-all duration-200 hover:scale-[1.02] hover:shadow-xl">
   ✅ <div className="transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">

5. 🌓 DARK MODE (MANDATORY dark: variant on EVERY color class):
   ✅ className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800"
   ❌ FORBIDDEN: className="bg-white text-gray-900"  (missing dark mode!)

6. 🎨 MODERN BORDER RADIUS (MANDATORY - rounded-xl minimum):
   ✅ className="rounded-2xl"  (for cards)
   ✅ className="rounded-xl"   (for components)
   ❌ FORBIDDEN: className="rounded" or "rounded-md"

7. ✨ ICONS (MANDATORY from lucide-react):
   ✅ import { Check, X, Moon, Sun, Plus, Edit, Trash2 } from 'lucide-react'
   ✅ <Check className="h-5 w-5 text-green-500" />

8. 🎯 EXAMPLE: PERFECT TASK CARD (COPY THIS EXACT STYLING):

<Card className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/5 border border-gray-100 dark:border-gray-800 transition-all duration-200 hover:shadow-3xl hover:scale-[1.01]">
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
        <Check className="h-6 w-6 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Title</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Task description here</p>
      </div>
    </div>
    <Button variant="ghost" size="icon" className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110 rounded-xl">
      <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
    </Button>
  </div>
</Card>

9. 🌓 DARK MODE TOGGLE (MANDATORY - SANDPACK-PROVEN WORKING IMPLEMENTATION):

🚨 CRITICAL: Use manual dark mode classes, NOT Tailwind dark: variants (Sandpack limitation)

Step 1: Create useDarkMode hook (src/hooks/useDarkMode.ts):

import { useState, useEffect } from 'react'

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('darkMode')
    const initialDark = stored === 'true'
    setIsDark(initialDark)
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', isDark.toString())
  }, [isDark])

  const toggleDark = () => setIsDark(!isDark)

  return { isDark, toggleDark }
}

Step 2: Use CONDITIONAL RENDERING for dark mode (NOT Tailwind dark: variants):

import { useDarkMode } from './hooks/useDarkMode'
import { DarkModeToggle } from './components/DarkModeToggle'

export default function App() {
  const { isDark, toggleDark } = useDarkMode()

  return (
    <div className={\`min-h-screen transition-colors duration-300 \${
      isDark
        ? 'bg-gradient-to-br from-gray-950 via-purple-950 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }\`}>
      <header className="p-6 flex justify-between items-center">
        <h1 className={\`text-2xl font-bold \${isDark ? 'text-white' : 'text-gray-900'}\`}>
          Your App
        </h1>
        <DarkModeToggle isDark={isDark} toggleDark={toggleDark} />
      </header>
      {/* Rest of your app with conditional isDark classes */}
    </div>
  )
}

Step 3: DarkModeToggle with conditional rendering:

import { Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'

interface DarkModeToggleProps {
  isDark: boolean
  toggleDark: () => void
}

export const DarkModeToggle = ({ isDark, toggleDark }: DarkModeToggleProps) => {
  return (
    <button
      onClick={toggleDark}
      className={\`p-2 rounded-xl transition-all duration-200 hover:scale-110 \${
        isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
      }\`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  )
}

Step 4: Apply conditional rendering to ALL components:

// Example TaskCard
<div className={\`p-8 rounded-2xl shadow-2xl transition-all \${
  isDark
    ? 'bg-gray-900 border-gray-800 shadow-purple-500/5'
    : 'bg-white border-gray-100 shadow-purple-500/10'
}\`}>
  <h3 className={\`text-lg font-semibold \${isDark ? 'text-white' : 'text-gray-900'}\`}>
    Task Title
  </h3>
  <p className={\`text-sm \${isDark ? 'text-gray-400' : 'text-gray-500'}\`}>
    Description
  </p>
</div>

🚨 CRITICAL RULES FOR SANDPACK DARK MODE:
1. NO Tailwind dark: variants (dark:bg-gray-900, dark:text-white) - Sandpack ignores these!
2. USE conditional rendering: className={\`...\${isDark ? 'dark-class' : 'light-class'}\`}
3. Pass isDark prop to ALL components that need dark mode
4. Apply conditional classes to EVERY element (backgrounds, text, borders, shadows)
5. NO tailwind.config.js needed - pure conditional rendering works!

🚨 REGENERATE WITH THESE PATTERNS NOW!
Every element must look like v0.dev quality with WORKING conditional dark mode!

MANDATORY CHECKLIST:
✅ useDarkMode hook with localStorage
✅ Pass isDark prop to ALL components
✅ Use conditional rendering: \${isDark ? 'dark-classes' : 'light-classes'}
✅ NO dark: Tailwind variants (Sandpack doesn't support them)
✅ Apply conditional classes to backgrounds, text, borders, shadows
✅ Beautiful gradients, deep shadows, smooth transitions
✅ Working dark mode toggle that visually changes the UI`

        const stylingRetry = await generateObject({
          model,
          system: await this.buildSystemPrompt(request.prompt, request.context),
          prompt: stylingEnforcementPrompt,
          schema: z.object({
            files: z.array(z.object({
              path: z.string(),
              content: z.string(),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(minFiles),
            explanation: z.string(),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
          mode: provider === 'anthropic' ? 'tool' : 'auto',
          maxTokens: maxTokens,
        })

        console.log(`✨ [Styling Validator] Regenerated with v0.dev-quality styling: ${stylingRetry.object.files.length} files`)

        // Replace result with styling retry
        result.object = stylingRetry.object

        // Re-run scaffold bundling for styling retry
        const stylingRetryFilesForDetection = result.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' : 'plaintext'
        }))
        const stylingRetryUsedComponents = detectUsedComponents(stylingRetryFilesForDetection)
        if (stylingRetryUsedComponents.length > 0) {
          const stylingRetryScaffoldFiles = bundleScaffoldComponents(stylingRetryUsedComponents)
          for (const scaffoldFile of stylingRetryScaffoldFiles) {
            result.object.files.push({
              path: scaffoldFile.path,
              content: scaffoldFile.content,
              type: 'create'
            })
          }
        }
        this.convertPathAliases(result.object.files)

        // Re-validate styling
        const stylingRevalidation = stylingValidator.validate(
          result.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                     f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
          }))
        )

        console.log(stylingValidator.formatResults(stylingRevalidation))

        if (stylingRevalidation.isValid) {
          console.log(`✨ [Styling Validator] Styling retry SUCCESS! Score: ${stylingRevalidation.score}/100`)
        } else {
          console.warn(`⚠️  [Styling Validator] Styling retry still below threshold: ${stylingRevalidation.score}/100`)
          console.warn(`   Proceeding anyway (one retry attempt made)`)
        }
      } else if (!stylingValidation.isValid) {
        console.warn(`⚠️  [Styling Validator] Production quality below threshold:`)
        console.warn(`   Score: ${stylingValidation.score}/100 (need 70+)`)
        console.warn(`   Skipping auto-regeneration (score >= 50)`)
      } else {
        console.log(`✨ [Styling Validator] Production-ready! Score: ${stylingValidation.score}/100`)
      }

      // 🚀 PHASE 7.3.6: DEPENDENCY VALIDATION WITH AUTO-FIX
      console.log('📦 [Dependency Validator] Checking import/dependency consistency...')
      const dependencyValidation = await dependencyValidator.validate(
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

      // 🚨 CRITICAL: Check if package.json is missing - REGENERATE if so
      const hasNoPackageJson = dependencyValidation.errors.some(e => e.type === 'no_package_json')

      if (hasNoPackageJson) {
        console.error('🚨 [Dependency Validator] CRITICAL: No package.json found!')
        console.error('🔄 [Dependency Validator] Regenerating with package.json requirement...')

        const packageJsonPrompt = `${enhancedPrompt}

🚨🚨🚨 CRITICAL ERROR: YOU FORGOT TO GENERATE package.json! 🚨🚨🚨

This is COMPLETELY UNACCEPTABLE! package.json is MANDATORY for ANY React application!

YOU MUST INCLUDE package.json WITH:
1. name, version, scripts (dev, build, start)
2. dependencies: ALL packages you import (react, react-dom, etc.)
3. devDependencies: typescript, @types packages, tailwindcss, etc.

Example package.json structure:
{
  "name": "app-name",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.3.0"
  }
}

REGENERATE NOW with package.json included! DO NOT SKIP IT AGAIN!`

        const packageJsonRetry = await generateObject({
          model,
          system: await this.buildSystemPrompt(request.prompt, request.context),
          prompt: packageJsonPrompt,
          schema: z.object({
            files: z.array(z.object({
              path: z.string(),
              content: z.string(),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(2, '🚨 CRITICAL - REQUIRED FIELD: MUST generate at least 2 complete files including package.json. This field is MANDATORY and must come first.'),
            explanation: z.string(),
            code: z.string().optional(),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
        })

        console.log(`✅ Regenerated with package.json: ${packageJsonRetry.object.files.length} files`)

        // Replace result with package.json retry
        result.object.files = packageJsonRetry.object.files

        // Re-run scaffold bundling and path conversion for new files
        const retryFilesForDetection = result.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' : 'plaintext'
        }))
        const retryUsedComponents = detectUsedComponents(retryFilesForDetection)
        if (retryUsedComponents.length > 0) {
          const retryScaffoldFiles = bundleScaffoldComponents(retryUsedComponents)
          for (const scaffoldFile of retryScaffoldFiles) {
            result.object.files.push({
              path: scaffoldFile.path,
              content: scaffoldFile.content,
              type: 'create'
            })
          }
        }
        this.convertPathAliases(result.object.files)

        // Re-validate dependencies
        const packageJsonRevalidation = await dependencyValidator.validate(
          result.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                     f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' :
                     f.path.endsWith('.json') ? 'json' : 'plaintext'
          }))
        )

        console.log(dependencyValidator.formatResults(packageJsonRevalidation))

        // If still invalid, try to auto-fix
        if (!packageJsonRevalidation.isValid && !packageJsonRevalidation.errors.some(e => e.type === 'no_package_json')) {
          const fixedPackageJson = dependencyValidator.autoFix(
            result.object.files.map(f => ({
              path: f.path,
              content: f.content,
              language: f.path.endsWith('.json') ? 'json' : 'plaintext'
            })),
            packageJsonRevalidation
          )

          if (fixedPackageJson) {
            const packageJsonIndex = result.object.files.findIndex(f => f.path.endsWith('package.json'))
            if (packageJsonIndex !== -1) {
              result.object.files[packageJsonIndex].content = fixedPackageJson.content
              console.log(`✅ [Dependency Validator] Auto-fixed package.json`)
            }
          }
        }
      } else if (!dependencyValidation.isValid) {
        // If dependencies are missing, AUTO-FIX package.json (normal path)
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
            const revalidation = await dependencyValidator.validate(
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

      // 🚀 PHASE 7.3.7: SYNTAX VALIDATION WITH AUTO-FIX
      console.log('🔧 [Syntax Validator] Checking for syntax errors...')
      const syntaxValidation = await syntaxValidator.validate(
        result.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                   f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
        }))
      )

      // Log validation results
      console.log(syntaxValidator.formatResults(syntaxValidation))

      // Apply syntax fixes if any errors were auto-fixed
      if (syntaxValidation.fixedFiles.length > 0) {
        console.log(`🔧 [Syntax Validator] Applying ${syntaxValidation.fixedFiles.length} auto-fixes...`)

        result.object.files = syntaxValidator.applyFixes(
          result.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                     f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
          })),
          syntaxValidation
        )

        console.log(`✅ [Syntax Validator] Applied fixes to ${syntaxValidation.fixedFiles.length} files`)
      } else if (syntaxValidation.isValid) {
        console.log(`✅ [Syntax Validator] No syntax errors found`)
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

          // Get model instance for retry (it's out of scope from the try block)
          const retryModel = this.getModelInstance(provider)

          const safeResult = await generateObject({
            model: retryModel,
            system: await this.buildSystemPrompt(request.prompt, request.context),
            prompt: jsonSafePrompt,
            schema: z.object({
              files: z.array(z.object({
                path: z.string(),
                content: z.string(),
                type: z.enum(['create', 'modify', 'delete']).optional(),
              })).min(minFiles, `🚨 CRITICAL - REQUIRED FIELD: MUST generate at least ${minFiles} complete, substantial files. This field is MANDATORY and must come first.`),
              explanation: z.string(),
              code: z.string().optional(),
              dependencies: z.array(z.string()).optional(),
              instructions: z.string().optional(),
            }),
            mode: provider === 'anthropic' ? 'tool' : 'auto',
            maxTokens: maxTokens,
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
import fs from 'fs/promises'
import path from 'path'

/**
 * AI Rules Loader Service
 *
 * Loads and caches the AI_RULES.md system prompt from disk.
 * This externalizes the system prompt from code to a maintainable markdown file.
 */
export class AIRulesLoader {
  private static instance: AIRulesLoader
  private cachedRules: string | null = null
  private lastLoadTime: number = 0
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  static getInstance(): AIRulesLoader {
    if (!AIRulesLoader.instance) {
      AIRulesLoader.instance = new AIRulesLoader()
    }
    return AIRulesLoader.instance
  }

  /**
   * Load AI rules from AI_RULES.md file
   * Uses in-memory cache to avoid disk reads on every request
   */
  async loadRules(): Promise<string> {
    const now = Date.now()

    // Return cached rules if still valid
    if (this.cachedRules && (now - this.lastLoadTime) < this.CACHE_TTL) {
      return this.cachedRules
    }

    try {
      // Load from project root
      const rulesPath = path.join(process.cwd(), 'AI_RULES.md')
      const rulesContent = await fs.readFile(rulesPath, 'utf-8')

      // Update cache
      this.cachedRules = rulesContent
      this.lastLoadTime = now

      console.log(`[AIRulesLoader] Loaded AI_RULES.md (${rulesContent.length} chars)`)
      return rulesContent
    } catch (error) {
      console.error('[AIRulesLoader] Failed to load AI_RULES.md:', error)

      // Fall back to default rules
      return this.getDefaultRules()
    }
  }

  /**
   * Force reload rules from disk (bypass cache)
   */
  async reloadRules(): Promise<string> {
    this.cachedRules = null
    this.lastLoadTime = 0
    return this.loadRules()
  }

  /**
   * Default fallback rules if AI_RULES.md is missing
   */
  private getDefaultRules(): string {
    return `# AI Code Generation Rules (Fallback)

## MANDATORY TECH STACK
- React 18+ with TypeScript (TSX files only)
- Tailwind CSS 3+ for ALL styling (NO custom CSS files)
- shadcn/ui components for ALL UI elements
- lucide-react for ALL icons

## CODE QUALITY STANDARDS
- ❌ NO placeholders, TODOs, or incomplete code
- ✅ MANDATORY: All forms MUST have Zod schema validation
- ✅ MANDATORY: All async operations MUST have try/catch error handling
- ✅ MANDATORY: All error states MUST display user-friendly messages
- ✅ MANDATORY: All loading states MUST be handled

## OUTPUT FORMAT
Generate a valid JSON object with:
- explanation: Brief 2-3 sentence description
- files: Array of {path, content, language}
- dependencies: Object with package versions
- instructions: Setup instructions
`
  }
}

// Export singleton instance
export const aiRulesLoader = AIRulesLoader.getInstance()

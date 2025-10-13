import fs from 'fs/promises'
import path from 'path'

/**
 * Smart Context Service
 *
 * Analyzes user prompts and injects relevant existing code files
 * to help AI maintain consistency with existing patterns.
 *
 * Similar to Dyad's Smart Context feature.
 */

interface ContextFile {
  path: string
  content: string
  relevanceScore: number
  tokenCount: number
}

interface SmartContextOptions {
  maxTokens?: number
  projectPath?: string
  fileExtensions?: string[]
}

export class SmartContextService {
  private static instance: SmartContextService
  private readonly MAX_TOKENS = 500 // 🚨 CRITICAL FIX: Reduce to 500 to prevent Claude truncation
  private readonly CHARS_PER_TOKEN = 4 // Rough approximation

  private constructor() {}

  static getInstance(): SmartContextService {
    if (!SmartContextService.instance) {
      SmartContextService.instance = new SmartContextService()
    }
    return SmartContextService.instance
  }

  /**
   * Get relevant context files based on user prompt
   */
  async getRelevantContext(
    prompt: string,
    options: SmartContextOptions = {}
  ): Promise<string> {
    // 🚨 TEMPORARILY DISABLED: Smart Context causes response truncation
    // The formatted context exceeds token budget, causing Claude to truncate response
    console.log(`[SmartContext] DISABLED - Skipping context injection to prevent truncation`)
    return ''
  }

  // DISABLED METHOD - Uncomment to re-enable Smart Context
  private async getRelevantContextDISABLED(
    prompt: string,
    options: SmartContextOptions = {}
  ): Promise<string> {
    const maxTokens = options.maxTokens || this.MAX_TOKENS
    const projectPath = options.projectPath || process.cwd()
    const fileExtensions = options.fileExtensions || ['.ts', '.tsx', '.js', '.jsx']

    console.log(`[SmartContext] Analyzing prompt for relevant context...`)

    // Extract keywords from prompt
    const keywords = this.extractKeywords(prompt)
    console.log(`[SmartContext] Keywords extracted: ${keywords.slice(0, 5).join(', ')}...`)

    // Find relevant files in project
    const relevantFiles = await this.findRelevantFiles(
      projectPath,
      keywords,
      fileExtensions
    )

    if (relevantFiles.length === 0) {
      console.log(`[SmartContext] No relevant context files found`)
      return ''
    }

    // Sort by relevance and fit within token budget
    const contextFiles = this.selectFilesWithinBudget(relevantFiles, maxTokens)

    if (contextFiles.length === 0) {
      console.log(`[SmartContext] No files fit within token budget`)
      return ''
    }

    // Format context for injection
    const contextString = this.formatContext(contextFiles)
    const tokenCount = Math.ceil(contextString.length / this.CHARS_PER_TOKEN)

    console.log(`[SmartContext] Injecting ${contextFiles.length} files (~${tokenCount} tokens)`)

    return contextString
  }

  /**
   * Extract relevant keywords from user prompt
   */
  private extractKeywords(prompt: string): string[] {
    // Convert to lowercase and split into words
    const words = prompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3) // Filter short words

    // Common stop words to exclude
    const stopWords = new Set([
      'that', 'this', 'with', 'from', 'have', 'been', 'will',
      'would', 'could', 'should', 'make', 'create', 'build',
      'want', 'need', 'like', 'using', 'please', 'help'
    ])

    // Filter and deduplicate
    const keywords = [...new Set(words)]
      .filter(w => !stopWords.has(w))
      .slice(0, 20) // Limit to top 20 keywords

    return keywords
  }

  /**
   * Find files matching keywords
   */
  private async findRelevantFiles(
    projectPath: string,
    keywords: string[],
    extensions: string[]
  ): Promise<ContextFile[]> {
    const files: ContextFile[] = []

    try {
      // Search in common source directories
      const searchDirs = [
        path.join(projectPath, 'src'),
        path.join(projectPath, 'backend/src'),
        path.join(projectPath, 'frontend/src'),
      ]

      for (const dir of searchDirs) {
        try {
          await this.scanDirectory(dir, keywords, extensions, files)
        } catch (err) {
          // Directory might not exist, continue
        }
      }

      return files
    } catch (error) {
      console.error('[SmartContext] Error finding files:', error)
      return []
    }
  }

  /**
   * Recursively scan directory for relevant files
   */
  private async scanDirectory(
    dir: string,
    keywords: string[],
    extensions: string[],
    results: ContextFile[],
    depth: number = 0
  ): Promise<void> {
    // Limit recursion depth
    if (depth > 4) return

    // Skip node_modules and common build dirs
    const skipDirs = ['node_modules', 'dist', 'build', '.next', '.git']
    const dirName = path.basename(dir)
    if (skipDirs.includes(dirName)) return

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, keywords, extensions, results, depth + 1)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name)
          if (extensions.includes(ext)) {
            const file = await this.analyzeFile(fullPath, keywords)
            if (file && file.relevanceScore > 0) {
              results.push(file)
            }
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  /**
   * Analyze file and calculate relevance score
   */
  private async analyzeFile(
    filePath: string,
    keywords: string[]
  ): Promise<ContextFile | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')

      // Skip very large files (> 10KB)
      if (content.length > 10000) {
        return null
      }

      // Calculate relevance score
      const lowerContent = content.toLowerCase()
      const fileName = path.basename(filePath).toLowerCase()
      let score = 0

      // Score based on keyword matches
      for (const keyword of keywords) {
        // Filename matches are worth more
        if (fileName.includes(keyword)) {
          score += 3
        }
        // Content matches
        const matches = (lowerContent.match(new RegExp(keyword, 'g')) || []).length
        score += matches
      }

      if (score === 0) return null

      const tokenCount = Math.ceil(content.length / this.CHARS_PER_TOKEN)

      return {
        path: filePath,
        content,
        relevanceScore: score,
        tokenCount,
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Select files that fit within token budget
   */
  private selectFilesWithinBudget(
    files: ContextFile[],
    maxTokens: number
  ): ContextFile[] {
    // Sort by relevance score (highest first)
    const sorted = [...files].sort((a, b) => b.relevanceScore - a.relevanceScore)

    const selected: ContextFile[] = []
    let totalTokens = 0

    for (const file of sorted) {
      if (totalTokens + file.tokenCount <= maxTokens) {
        selected.push(file)
        totalTokens += file.tokenCount
      }

      // Stop if we've selected enough files
      if (selected.length >= 5) break
    }

    return selected
  }

  /**
   * Format context files for injection into prompt
   */
  private formatContext(files: ContextFile[]): string {
    if (files.length === 0) return ''

    const sections = files.map(file => {
      const relativePath = file.path.split('/src/').pop() || file.path
      return `### Existing File: ${relativePath}

\`\`\`typescript
${file.content.trim()}
\`\`\`
`
    })

    return `
## SMART CONTEXT: Existing Code Patterns

The following files from your project are relevant to this request.
Study these patterns and maintain consistency with existing code style.

${sections.join('\n')}

---

Now generate code that follows these existing patterns and integrates well with the codebase.
`
  }

  /**
   * Clear any cached context (for testing)
   */
  clearCache(): void {
    // Currently no caching, but keeping method for future implementation
  }
}

// Export singleton instance
export const smartContext = SmartContextService.getInstance()

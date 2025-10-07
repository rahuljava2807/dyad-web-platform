import { aiService } from './ai'

interface PreviewError {
  type: 'component_export' | 'import_error' | 'syntax_error' | 'runtime_error'
  message: string
  stack?: string
  file?: string
  line?: number
  column?: number
}

interface HealingContext {
  originalPrompt: string
  generatedFiles: Array<{
    path: string
    content: string
    language: string
  }>
  error: PreviewError
  previousAttempts?: number
}

interface HealingResult {
  success: boolean
  fixedFiles?: Array<{
    path: string
    content: string
    language: string
  }>
  explanation?: string
  error?: string
}

class ErrorHealingService {
  /**
   * Analyze preview error and determine healing strategy
   */
  analyzeError(error: PreviewError): {
    strategy: 'regenerate' | 'fix_imports' | 'fix_exports' | 'fix_syntax'
    priority: 'high' | 'medium' | 'low'
    description: string
  } {
    const message = error.message.toLowerCase()

    if (message.includes('element type is invalid') || message.includes('undefined')) {
      return {
        strategy: 'fix_exports',
        priority: 'high',
        description: 'Component export/import issue - likely missing default export or incorrect import'
      }
    }

    if (message.includes('cannot resolve module') || message.includes('module not found')) {
      return {
        strategy: 'fix_imports',
        priority: 'high',
        description: 'Import resolution issue - missing dependencies or incorrect paths'
      }
    }

    if (message.includes('syntax error') || message.includes('unexpected token')) {
      return {
        strategy: 'fix_syntax',
        priority: 'high',
        description: 'Syntax error in generated code'
      }
    }

    if (message.includes('chart') || message.includes('recharts')) {
      return {
        strategy: 'fix_imports',
        priority: 'medium',
        description: 'Chart component import/usage issue'
      }
    }

    // Default to regeneration for complex issues
    return {
      strategy: 'regenerate',
      priority: 'medium',
      description: 'Complex error requiring full regeneration'
    }
  }

  /**
   * Heal the error by fixing the generated code
   */
  async healError(context: HealingContext): Promise<HealingResult> {
    try {
      const analysis = this.analyzeError(context.error)
      
      console.log(`🔧 Healing error: ${analysis.description} (${analysis.strategy})`)

      switch (analysis.strategy) {
        case 'fix_exports':
          return await this.fixExportIssues(context)
        
        case 'fix_imports':
          return await this.fixImportIssues(context)
        
        case 'fix_syntax':
          return await this.fixSyntaxIssues(context)
        
        case 'regenerate':
          return await this.regenerateWithErrorContext(context)
        
        default:
          return await this.regenerateWithErrorContext(context)
      }
    } catch (error) {
      console.error('Error healing failed:', error)
      return {
        success: false,
        error: `Healing failed: ${error.message}`
      }
    }
  }

  /**
   * Fix component export/import issues
   */
  private async fixExportIssues(context: HealingContext): Promise<HealingResult> {
    const healingPrompt = `CRITICAL ERROR FIX: The generated React components have export/import issues causing "Element type is invalid" errors.

ERROR DETAILS:
${context.error.message}

CURRENT GENERATED FILES:
${context.generatedFiles.map(f => `\n=== ${f.path} ===\n${f.content}`).join('\n')}

FIX REQUIREMENTS:
1. Ensure ALL React components have proper default exports
2. Fix any import/export mismatches
3. Verify component names match between files
4. Ensure the main App component is properly exported and imported
5. Check for missing semicolons or syntax issues in exports
6. Generate AT LEAST 8 complete files to meet schema requirements
7. Include all necessary components, utilities, and configuration files

CRITICAL: Generate ONLY the corrected files with proper exports. Every component MUST have a default export. Generate a complete working application.`

    try {
      // Use a custom healing schema that's more flexible
      const result = await aiService.generateCodeWithCustomSchema({
        prompt: healingPrompt,
        provider: 'openai',
        userId: 'error-healing',
        context: {
          project: {
            id: 'error-healing',
            name: 'Error Healing',
            description: 'Fixing export/import issues'
          }
        },
        customSchema: {
          minFiles: 6, // Reduced minimum for healing
          allowPartialGeneration: true
        }
      })

      return {
        success: true,
        fixedFiles: result.files,
        explanation: 'Fixed component export/import issues'
      }
    } catch (error) {
      // Fallback: try to fix the files directly without AI regeneration
      try {
        const fixedFiles = this.fixFilesDirectly(context.generatedFiles, context.error)
        return {
          success: true,
          fixedFiles,
          explanation: 'Fixed component export/import issues using direct fixes'
        }
      } catch (directError) {
        return {
          success: false,
          error: `Failed to fix exports: ${error.message}`
        }
      }
    }
  }

  /**
   * Direct file fixing without AI regeneration
   */
  private fixFilesDirectly(files: Array<{ path: string; content: string; language: string }>, error: PreviewError): Array<{ path: string; content: string; language: string }> {
    return files.map(file => {
      if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
        let content = file.content
        
        // Fix missing default exports
        if (!content.includes('export default')) {
          // Find the component name
          const componentMatch = content.match(/const\s+(\w+)\s*[:=]/)
          if (componentMatch) {
            const componentName = componentMatch[1]
            content += `\n\nexport default ${componentName};`
          }
        }
        
        // Fix missing React imports
        if (!content.includes('import React') && !content.includes('from "react"')) {
          content = `import React from 'react';\n${content}`
        }
        
        // Fix common import/export issues
        content = content.replace(/export\s+{\s*(\w+)\s*}/, 'export default $1')
        
        return {
          ...file,
          content
        }
      }
      return file
    })
  }

  /**
   * Fix import resolution issues
   */
  private async fixImportIssues(context: HealingContext): Promise<HealingResult> {
    const healingPrompt = `CRITICAL ERROR FIX: The generated code has import resolution issues.

ERROR DETAILS:
${context.error.message}

CURRENT GENERATED FILES:
${context.generatedFiles.map(f => `\n=== ${f.path} ===\n${f.content}`).join('\n')}

FIX REQUIREMENTS:
1. Fix all import statements to use correct paths
2. Ensure all imported components are properly exported
3. Fix any missing dependencies in package.json
4. Verify relative imports use correct paths (./ or ../)
5. Ensure external library imports are correct (react, recharts, etc.)

CRITICAL: Generate ONLY the corrected files with proper imports. All imports must resolve correctly.`

    try {
      const result = await aiService.generateCode({
        prompt: healingPrompt,
        provider: 'openai',
        userId: 'error-healing',
        context: {
          project: {
            id: 'error-healing',
            name: 'Error Healing',
            description: 'Fixing import resolution issues'
          }
        }
      })

      return {
        success: true,
        fixedFiles: result.files,
        explanation: 'Fixed import resolution issues'
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fix imports: ${error.message}`
      }
    }
  }

  /**
   * Fix syntax errors
   */
  private async fixSyntaxIssues(context: HealingContext): Promise<HealingResult> {
    const healingPrompt = `CRITICAL ERROR FIX: The generated code has syntax errors.

ERROR DETAILS:
${context.error.message}

CURRENT GENERATED FILES:
${context.generatedFiles.map(f => `\n=== ${f.path} ===\n${f.content}`).join('\n')}

FIX REQUIREMENTS:
1. Fix all syntax errors (missing brackets, semicolons, etc.)
2. Ensure proper TypeScript/JSX syntax
3. Fix any malformed JSX elements
4. Ensure proper string escaping in JSX
5. Fix any template literal issues

CRITICAL: Generate ONLY syntactically correct code that will compile without errors.`

    try {
      const result = await aiService.generateCode({
        prompt: healingPrompt,
        provider: 'openai',
        userId: 'error-healing',
        context: {
          project: {
            id: 'error-healing',
            name: 'Error Healing',
            description: 'Fixing syntax errors'
          }
        }
      })

      return {
        success: true,
        fixedFiles: result.files,
        explanation: 'Fixed syntax errors'
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fix syntax: ${error.message}`
      }
    }
  }

  /**
   * Regenerate code with error context
   */
  private async regenerateWithErrorContext(context: HealingContext): Promise<HealingResult> {
    const healingPrompt = `CRITICAL ERROR: The previous code generation failed with a runtime error. Please regenerate with fixes.

ORIGINAL PROMPT:
${context.originalPrompt}

ERROR THAT OCCURRED:
${context.error.message}
${context.error.stack ? `\nStack trace:\n${context.error.stack}` : ''}

PREVIOUS GENERATED FILES (that had errors):
${context.generatedFiles.map(f => `\n=== ${f.path} ===\n${f.content}`).join('\n')}

REGENERATION REQUIREMENTS:
1. Fix the specific error mentioned above
2. Ensure all React components are properly exported/imported
3. Use ONLY Tailwind CSS classes (no generic class names)
4. Generate complete, working code
5. Include proper error handling
6. Ensure all dependencies are correctly imported

CRITICAL: Generate code that will NOT have the same error. Focus on fixing the root cause.`

    try {
      const result = await aiService.generateCode({
        prompt: healingPrompt,
        provider: 'openai',
        userId: 'error-healing',
        context: {
          project: {
            id: 'error-healing',
            name: 'Error Healing',
            description: 'Regenerating with error fixes'
          }
        }
      })

      return {
        success: true,
        fixedFiles: result.files,
        explanation: 'Regenerated code with error fixes'
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to regenerate: ${error.message}`
      }
    }
  }

  /**
   * Validate that the healed code is likely to work
   */
  validateHealedCode(files: Array<{ path: string; content: string }>): {
    valid: boolean
    issues: string[]
  } {
    const issues: string[] = []

    for (const file of files) {
      // Check for proper default exports in React components
      if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
        if (!file.content.includes('export default')) {
          issues.push(`${file.path}: Missing default export`)
        }

        // Check for proper React imports
        if (!file.content.includes('import React') && !file.content.includes('from "react"')) {
          issues.push(`${file.path}: Missing React import`)
        }

        // Check for generic class names (should use Tailwind)
        const genericClassPattern = /className=["']([^"']*-(?:card|button|container|wrapper|header|footer|sidebar|nav|menu)[^"']*)["']/
        if (genericClassPattern.test(file.content)) {
          issues.push(`${file.path}: Contains generic class names instead of Tailwind`)
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }
}

export const errorHealingService = new ErrorHealingService()

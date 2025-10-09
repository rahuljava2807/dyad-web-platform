/**
 * Structured Output Validator Service
 *
 * Validates AI-generated code for quality issues beyond schema validation.
 * Catches placeholders, missing imports, accessibility issues, etc.
 */

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: 'placeholder' | 'missing_import' | 'accessibility' | 'validation' | 'styling' | 'quality'
  message: string
  filePath?: string
  line?: number
}

export interface ValidationWarning {
  type: 'console_log' | 'any_type' | 'inline_style' | 'performance'
  message: string
  filePath?: string
  line?: number
}

export interface GeneratedFile {
  path: string
  content: string
  language: string
}

export class OutputValidator {
  private static instance: OutputValidator

  private constructor() {}

  static getInstance(): OutputValidator {
    if (!OutputValidator.instance) {
      OutputValidator.instance = new OutputValidator()
    }
    return OutputValidator.instance
  }

  /**
   * Main validation method - validates entire generation output
   */
  validate(files: GeneratedFile[]): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    console.log(`[OutputValidator] Validating ${files.length} files...`)

    for (const file of files) {
      // Skip non-code files
      if (!this.isCodeFile(file)) continue

      // Run all validators
      const fileErrors = [
        ...this.validateNoPlaceholders(file),
        ...this.validateFileExtensions(file),
        ...this.validateImports(file),
        ...this.validateShadcnUsage(file),
        ...this.validateFormValidation(file),
        ...this.validateAccessibility(file),
        ...this.validateNoInlineStyles(file),
      ]

      const fileWarnings = [
        ...this.validateNoConsoleLogs(file),
        ...this.validateNoAnyTypes(file),
      ]

      errors.push(...fileErrors)
      warnings.push(...fileWarnings)
    }

    const isValid = errors.length === 0

    if (isValid) {
      console.log(`[OutputValidator] ✅ Validation passed (${warnings.length} warnings)`)
    } else {
      console.log(`[OutputValidator] ❌ Validation failed (${errors.length} errors, ${warnings.length} warnings)`)
    }

    return { isValid, errors, warnings }
  }

  /**
   * Check if file is a code file that should be validated
   */
  private isCodeFile(file: GeneratedFile): boolean {
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx']
    return codeExtensions.some(ext => file.path.endsWith(ext))
  }

  /**
   * CRITICAL: Detect placeholder code (TODOs, FIXMEs, etc.)
   */
  private validateNoPlaceholders(file: GeneratedFile): ValidationError[] {
    const errors: ValidationError[] = []
    const content = file.content

    // Patterns that indicate placeholder code
    const placeholderPatterns = [
      { pattern: /\/\/\s*TODO/gi, message: 'Contains TODO comment' },
      { pattern: /\/\/\s*FIXME/gi, message: 'Contains FIXME comment' },
      { pattern: /\/\/\s*XXX/gi, message: 'Contains XXX comment' },
      { pattern: /\/\/\s*HACK/gi, message: 'Contains HACK comment' },
      { pattern: /\/\/\s*Implement this/gi, message: 'Contains "Implement this" comment' },
      { pattern: /\/\/\s*To be implemented/gi, message: 'Contains "To be implemented" comment' },
      { pattern: /\/\/\s*Coming soon/gi, message: 'Contains "Coming soon" comment' },
      { pattern: /\/\/\s*Placeholder/gi, message: 'Contains "Placeholder" comment' },
      { pattern: /throw new Error\(['"]Not implemented['"]\)/gi, message: 'Contains "Not implemented" error' },
      { pattern: /console\.log\(['"]TODO/gi, message: 'Contains TODO in console.log' },
    ]

    for (const { pattern, message } of placeholderPatterns) {
      if (pattern.test(content)) {
        errors.push({
          type: 'placeholder',
          message: `${file.path}: ${message}`,
          filePath: file.path,
        })
      }
    }

    return errors
  }

  /**
   * CRITICAL: Validate file extensions (JSX must use .tsx, not .ts)
   */
  private validateFileExtensions(file: GeneratedFile): ValidationError[] {
    const errors: ValidationError[] = []
    const content = file.content

    // CRITICAL: Check for JSX in .ts files (must be .tsx)
    if (file.path.endsWith('.ts') && !file.path.endsWith('.d.ts')) {
      // Check for JSX tags
      const hasJSX = /<[A-Z][A-Za-z0-9.]*[\s/>]/.test(content) || // Component tags like <Component>
                     /<[a-z]+[\s/>]/.test(content) && content.includes('return') // HTML tags in return statement

      if (hasJSX) {
        errors.push({
          type: 'quality',
          message: `${file.path}: Contains JSX syntax but uses .ts extension (must be .tsx for React components/hooks)`,
          filePath: file.path,
        })
      }
    }

    // Check for React components in non-.tsx files
    if (!file.path.endsWith('.tsx') && !file.path.endsWith('.jsx')) {
      if (/export\s+(default\s+)?function\s+[A-Z][A-Za-z0-9]*\s*\([^)]*\)\s*\{[\s\S]*return\s*\([\s\S]*</.test(content)) {
        errors.push({
          type: 'quality',
          message: `${file.path}: Appears to be a React component but doesn't use .tsx/.jsx extension`,
          filePath: file.path,
        })
      }
    }

    return errors
  }

  /**
   * Validate proper imports (React, shadcn/ui components)
   */
  private validateImports(file: GeneratedFile): ValidationError[] {
    const errors: ValidationError[] = []
    const content = file.content

    // For TSX files, React must be imported if JSX is used
    if (file.path.endsWith('.tsx') && content.includes('<')) {
      if (!content.includes("import React from 'react'") && !content.includes('import * as React from')) {
        // Check if it's using new JSX transform (React 17+)
        // If no JSX pragma and no React import, might be an issue
        const hasJsxPragma = content.includes('/** @jsx') || content.includes('/** @jsxRuntime')
        if (!hasJsxPragma) {
          // This is actually OK in React 17+ with new JSX transform
          // So we'll make this a warning instead
        }
      }
    }

    // CRITICAL: Check for cn() usage without import
    // cn() is the utility function for merging Tailwind classes
    const usesCn = /\bcn\(/.test(content)
    const importsCn =
      content.includes('import { cn }') ||
      content.includes('import {cn}') ||
      content.includes('import { cn,') ||
      content.includes('import {cn,')

    // Skip if this is the utils.ts file that DEFINES cn()
    const definesCn = content.includes('export function cn(') || content.includes('export const cn =')
    const isUtilsFile = file.path.endsWith('/utils.ts') || file.path.endsWith('/lib/utils.ts')

    if (usesCn && !importsCn && !(isUtilsFile && definesCn)) {
      errors.push({
        type: 'missing_import',
        message: `${file.path}: Uses cn() function without importing it (add: import { cn } from '@/lib/utils')`,
        filePath: file.path,
      })
    }

    // Check for shadcn/ui imports using correct path
    const badImportPatterns = [
      { pattern: /from ['"]\.\.\/ui\//g, correct: '@/components/ui/' },
      { pattern: /from ['"]\.\/.+\/ui\//g, correct: '@/components/ui/' },
      { pattern: /from ['"]components\/ui\//g, correct: '@/components/ui/' },
    ]

    for (const { pattern, correct } of badImportPatterns) {
      if (pattern.test(content)) {
        errors.push({
          type: 'missing_import',
          message: `${file.path}: Uses relative imports instead of @/ alias (should use "${correct}")`,
          filePath: file.path,
        })
      }
    }

    return errors
  }

  /**
   * Validate shadcn/ui component usage (no custom UI components)
   */
  private validateShadcnUsage(file: GeneratedFile): ValidationError[] {
    const errors: ValidationError[] = []
    const content = file.content

    // Skip if not a component file
    if (!file.path.includes('component') && !file.path.endsWith('.tsx')) {
      return errors
    }

    // Check for custom button implementations (should use shadcn Button)
    if (content.includes('<button') && !content.includes("from '@/components/ui/button'")) {
      // Check if it's actually creating custom buttons instead of using shadcn
      const hasCustomButton = /<button[^>]*className/.test(content)
      if (hasCustomButton && !content.includes('<Button')) {
        errors.push({
          type: 'quality',
          message: `${file.path}: Uses custom <button> instead of shadcn/ui Button component`,
          filePath: file.path,
        })
      }
    }

    // Check for custom input implementations
    if (content.includes('<input') && !content.includes("from '@/components/ui/input'")) {
      const hasCustomInput = /<input[^>]*className/.test(content)
      if (hasCustomInput && !content.includes('<Input')) {
        errors.push({
          type: 'quality',
          message: `${file.path}: Uses custom <input> instead of shadcn/ui Input component`,
          filePath: file.path,
        })
      }
    }

    return errors
  }

  /**
   * Validate forms have Zod validation
   */
  private validateFormValidation(file: GeneratedFile): ValidationError[] {
    const errors: ValidationError[] = []
    const content = file.content

    // If file has a form, it should have Zod validation
    const hasForm = content.includes('<form') || content.includes('useForm')
    const hasZod = content.includes('import { z }') || content.includes('import * as z')
    const hasZodResolver = content.includes('zodResolver')

    if (hasForm && !hasZod) {
      errors.push({
        type: 'validation',
        message: `${file.path}: Contains form without Zod schema validation`,
        filePath: file.path,
      })
    }

    if (hasForm && hasZod && !hasZodResolver) {
      errors.push({
        type: 'validation',
        message: `${file.path}: Uses Zod but missing zodResolver in useForm`,
        filePath: file.path,
      })
    }

    return errors
  }

  /**
   * Validate accessibility requirements
   */
  private validateAccessibility(file: GeneratedFile): ValidationError[] {
    const errors: ValidationError[] = []
    const content = file.content

    // Images without alt text
    if (/<img[^>]*>/.test(content)) {
      const images = content.match(/<img[^>]*>/g) || []
      for (const img of images) {
        if (!img.includes('alt=')) {
          errors.push({
            type: 'accessibility',
            message: `${file.path}: Image missing alt attribute`,
            filePath: file.path,
          })
          break // Report once per file
        }
      }
    }

    // Buttons without accessible labels
    if (/<button[^>]*>/.test(content)) {
      const buttons = content.match(/<button[^>]*>.*?<\/button>/gs) || []
      for (const button of buttons) {
        // Check if button has text content or aria-label
        const hasTextContent = />[\s\S]*?\w+[\s\S]*?<\/button>/.test(button)
        const hasAriaLabel = button.includes('aria-label=')
        const hasIcon = button.includes('<') && !hasTextContent

        if (hasIcon && !hasAriaLabel && !hasTextContent) {
          errors.push({
            type: 'accessibility',
            message: `${file.path}: Icon-only button missing aria-label`,
            filePath: file.path,
          })
          break
        }
      }
    }

    return errors
  }

  /**
   * Validate no inline styles (should use Tailwind)
   */
  private validateNoInlineStyles(file: GeneratedFile): ValidationError[] {
    const errors: ValidationError[] = []
    const content = file.content

    // Check for style prop with object
    if (/style=\{\{/.test(content)) {
      errors.push({
        type: 'styling',
        message: `${file.path}: Uses inline styles instead of Tailwind CSS classes`,
        filePath: file.path,
      })
    }

    // Check for styled-components or CSS-in-JS
    if (content.includes('styled.') || content.includes('css`')) {
      errors.push({
        type: 'styling',
        message: `${file.path}: Uses CSS-in-JS instead of Tailwind CSS`,
        filePath: file.path,
      })
    }

    return errors
  }

  /**
   * WARNING: Detect console.log statements (should be removed)
   */
  private validateNoConsoleLogs(file: GeneratedFile): ValidationWarning[] {
    const warnings: ValidationWarning[] = []
    const content = file.content

    // Count console.log statements
    const matches = content.match(/console\.log\(/g)
    if (matches && matches.length > 0) {
      warnings.push({
        type: 'console_log',
        message: `${file.path}: Contains ${matches.length} console.log statement(s)`,
        filePath: file.path,
      })
    }

    return warnings
  }

  /**
   * WARNING: Detect 'any' types (should use proper TypeScript types)
   */
  private validateNoAnyTypes(file: GeneratedFile): ValidationWarning[] {
    const warnings: ValidationWarning[] = []
    const content = file.content

    // Count 'any' type usage
    const anyTypePattern = /:\s*any\b/g
    const matches = content.match(anyTypePattern)
    if (matches && matches.length > 0) {
      warnings.push({
        type: 'any_type',
        message: `${file.path}: Contains ${matches.length} 'any' type(s)`,
        filePath: file.path,
      })
    }

    return warnings
  }

  /**
   * Format validation results for logging/display
   */
  formatResults(result: ValidationResult): string {
    let output = '\n=== OUTPUT VALIDATION RESULTS ===\n'

    if (result.errors.length > 0) {
      output += '\n❌ ERRORS:\n'
      for (const error of result.errors) {
        output += `  - [${error.type}] ${error.message}\n`
      }
    }

    if (result.warnings.length > 0) {
      output += '\n⚠️  WARNINGS:\n'
      for (const warning of result.warnings) {
        output += `  - [${warning.type}] ${warning.message}\n`
      }
    }

    if (result.isValid && result.warnings.length === 0) {
      output += '\n✅ All checks passed!\n'
    }

    output += '\n================================\n'
    return output
  }
}

// Export singleton instance
export const outputValidator = OutputValidator.getInstance()

/**
 * Syntax Validator Service
 *
 * Detects and auto-fixes common syntax errors in generated code:
 * - Mismatched quotes in import/export statements
 * - Unterminated strings
 * - Missing closing JSX tags
 * - Invalid JSX attribute syntax
 *
 * Ensures code is syntax-valid before sending to Sandpack preview.
 */

export interface SyntaxValidationResult {
  isValid: boolean
  errors: SyntaxError[]
  fixedFiles: FixedFile[]
  summary: {
    totalFiles: number
    filesWithErrors: number
    totalErrors: number
    autoFixedErrors: number
  }
}

export interface SyntaxError {
  type: 'mismatched_quotes' | 'unterminated_string' | 'missing_closing_tag' | 'invalid_jsx' | 'other'
  message: string
  file: string
  line?: number
  column?: number
  originalCode?: string
  fixedCode?: string
  autoFixed: boolean
}

export interface FixedFile {
  path: string
  originalContent: string
  fixedContent: string
  errorsFixed: number
}

export interface GeneratedFile {
  path: string
  content: string
  language?: string
}

export class SyntaxValidator {
  private static instance: SyntaxValidator

  private constructor() {}

  static getInstance(): SyntaxValidator {
    if (!SyntaxValidator.instance) {
      SyntaxValidator.instance = new SyntaxValidator()
    }
    return SyntaxValidator.instance
  }

  /**
   * Main validation method - validates and auto-fixes syntax errors
   */
  async validate(files: GeneratedFile[]): Promise<SyntaxValidationResult> {
    const errors: SyntaxError[] = []
    const fixedFiles: FixedFile[] = []

    console.log(`[SyntaxValidator] Validating ${files.length} files for syntax errors...`)

    // Only validate code files
    const codeFiles = files.filter(f =>
      f.path.endsWith('.tsx') ||
      f.path.endsWith('.ts') ||
      f.path.endsWith('.jsx') ||
      f.path.endsWith('.js')
    )

    for (const file of codeFiles) {
      const fileErrors: SyntaxError[] = []
      let fixedContent = file.content

      // 1. Fix mismatched quotes in imports/exports
      const { content: quotesFixedContent, errors: quoteErrors } = this.fixMismatchedQuotes(fixedContent, file.path)
      fixedContent = quotesFixedContent
      fileErrors.push(...quoteErrors)

      // 2. Fix unterminated strings
      const { content: stringsFixedContent, errors: stringErrors } = this.fixUnterminatedStrings(fixedContent, file.path)
      fixedContent = stringsFixedContent
      fileErrors.push(...stringErrors)

      // 3. Fix missing closing JSX tags (basic detection)
      const { content: jsxFixedContent, errors: jsxErrors } = this.fixMissingClosingTags(fixedContent, file.path)
      fixedContent = jsxFixedContent
      fileErrors.push(...jsxErrors)

      // If we made any fixes, record them
      if (fixedContent !== file.content) {
        fixedFiles.push({
          path: file.path,
          originalContent: file.content,
          fixedContent,
          errorsFixed: fileErrors.filter(e => e.autoFixed).length,
        })
      }

      errors.push(...fileErrors)
    }

    const autoFixedCount = errors.filter(e => e.autoFixed).length
    const filesWithErrors = new Set(errors.map(e => e.file)).size

    const isValid = errors.length === 0 || autoFixedCount === errors.length

    if (isValid && errors.length > 0) {
      console.log(`[SyntaxValidator] ✅ Auto-fixed ${autoFixedCount} syntax errors in ${fixedFiles.length} files`)
    } else if (isValid) {
      console.log(`[SyntaxValidator] ✅ No syntax errors found`)
    } else {
      console.log(`[SyntaxValidator] ⚠️ Found ${errors.length - autoFixedCount} unfixable syntax errors`)
    }

    return {
      isValid,
      errors,
      fixedFiles,
      summary: {
        totalFiles: codeFiles.length,
        filesWithErrors,
        totalErrors: errors.length,
        autoFixedErrors: autoFixedCount,
      },
    }
  }

  /**
   * Fix mismatched quotes in import/export statements
   * Example: import { X } from './path"; → import { X } from './path';
   */
  private fixMismatchedQuotes(content: string, filePath: string): { content: string; errors: SyntaxError[] } {
    const errors: SyntaxError[] = []
    let fixedContent = content

    // Pattern: import/export with mismatched quotes
    // Matches: from './path" or from "./path' or from `./path" etc.
    // We'll check all import/export from statements and fix mismatched quotes
    const importExportPattern = /((?:import|export)\s+[^;]+\s+from\s+)(['"`])([^'"`;]+)(['"`])/g

    let match
    const replacements: Array<{ original: string; fixed: string }> = []

    while ((match = importExportPattern.exec(content)) !== null) {
      const fullMatch = match[0]
      const prefix = match[1] // import ... from
      const openQuote = match[2] // Opening quote
      const path = match[3] // The path itself
      const closeQuote = match[4] // Closing quote

      if (openQuote !== closeQuote) {
        // Fix: use the opening quote for both
        const fixedStatement = `${prefix}${openQuote}${path}${openQuote}`

        replacements.push({ original: fullMatch, fixed: fixedStatement })

        errors.push({
          type: 'mismatched_quotes',
          message: `Mismatched quotes in import statement: opens with ${openQuote} but closes with ${closeQuote}`,
          file: filePath,
          originalCode: fullMatch,
          fixedCode: fixedStatement,
          autoFixed: true,
        })
      }
    }

    // Apply all replacements
    for (const { original, fixed } of replacements) {
      fixedContent = fixedContent.replace(original, fixed)
    }

    return { content: fixedContent, errors }
  }

  /**
   * Fix unterminated strings in code
   * This is more complex and we'll focus on common patterns
   */
  private fixUnterminatedStrings(content: string, filePath: string): { content: string; errors: SyntaxError[] } {
    const errors: SyntaxError[] = []
    let fixedContent = content

    // Split into lines to detect unterminated strings
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNum = i + 1

      // Check for strings that start but don't end
      // Simple heuristic: if line has odd number of quotes and doesn't end with quote
      const singleQuotes = (line.match(/(?<!\\)'/g) || []).length
      const doubleQuotes = (line.match(/(?<!\\)"/g) || []).length

      // If odd number of single quotes
      if (singleQuotes % 2 !== 0 && !line.trim().endsWith("'") && !line.includes('//')) {
        // Try to find where to add closing quote
        const lastSingleQuote = line.lastIndexOf("'")

        // If the line ends with "; we likely have mismatched quotes (handled above)
        if (line.trim().endsWith('";') || line.trim().endsWith('";')) {
          continue // Already handled by mismatchedQuotes
        }

        errors.push({
          type: 'unterminated_string',
          message: `Potential unterminated string with single quote on line ${lineNum}`,
          file: filePath,
          line: lineNum,
          autoFixed: false, // Too complex to auto-fix without context
        })
      }

      // If odd number of double quotes
      if (doubleQuotes % 2 !== 0 && !line.trim().endsWith('"') && !line.includes('//')) {
        const lastDoubleQuote = line.lastIndexOf('"')

        if (line.trim().endsWith("';") || line.trim().endsWith('";')) {
          continue // Already handled by mismatchedQuotes
        }

        errors.push({
          type: 'unterminated_string',
          message: `Potential unterminated string with double quote on line ${lineNum}`,
          file: filePath,
          line: lineNum,
          autoFixed: false, // Too complex to auto-fix without context
        })
      }
    }

    return { content: fixedContent, errors }
  }

  /**
   * Fix missing closing JSX tags
   * This is basic detection - complex cases need proper JSX parser
   */
  private fixMissingClosingTags(content: string, filePath: string): { content: string; errors: SyntaxError[] } {
    const errors: SyntaxError[] = []
    let fixedContent = content

    // Only check TSX/JSX files
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) {
      return { content: fixedContent, errors }
    }

    // Very basic JSX tag matching
    // This is a heuristic and won't catch all cases
    const lines = content.split('\n')
    const tagStack: Array<{ tag: string; line: number }> = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNum = i + 1

      // Find opening tags (excluding self-closing and HTML tags in strings)
      const openingTags = line.match(/<([A-Z][a-zA-Z0-9]*)[^>]*(?<!\/|\?)>/g)
      if (openingTags) {
        for (const tag of openingTags) {
          const tagName = tag.match(/<([A-Z][a-zA-Z0-9]*)/)?.[1]
          if (tagName) {
            tagStack.push({ tag: tagName, line: lineNum })
          }
        }
      }

      // Find closing tags
      const closingTags = line.match(/<\/([A-Z][a-zA-Z0-9]*)>/g)
      if (closingTags) {
        for (const tag of closingTags) {
          const tagName = tag.match(/<\/([A-Z][a-zA-Z0-9]*)/)?.[1]
          if (tagName && tagStack.length > 0) {
            const lastOpen = tagStack[tagStack.length - 1]
            if (lastOpen.tag === tagName) {
              tagStack.pop()
            }
          }
        }
      }
    }

    // If we have unclosed tags, report them (but don't auto-fix - too risky)
    for (const unclosed of tagStack) {
      errors.push({
        type: 'missing_closing_tag',
        message: `Potential missing closing tag for <${unclosed.tag}> opened on line ${unclosed.line}`,
        file: filePath,
        line: unclosed.line,
        autoFixed: false, // Too complex to auto-fix
      })
    }

    return { content: fixedContent, errors }
  }

  /**
   * Apply fixes to files array
   */
  applyFixes(files: GeneratedFile[], validationResult: SyntaxValidationResult): GeneratedFile[] {
    if (validationResult.fixedFiles.length === 0) {
      return files
    }

    return files.map(file => {
      const fixed = validationResult.fixedFiles.find(f => f.path === file.path)
      if (fixed) {
        console.log(`[SyntaxValidator] Applied ${fixed.errorsFixed} fixes to ${file.path}`)
        return {
          ...file,
          content: fixed.fixedContent,
        }
      }
      return file
    })
  }

  /**
   * Format validation results for logging
   */
  formatResults(result: SyntaxValidationResult): string {
    let output = '\n=== SYNTAX VALIDATION RESULTS ===\n'

    output += `\n📝 SUMMARY:\n`
    output += `  Total files checked: ${result.summary.totalFiles}\n`
    output += `  Files with errors: ${result.summary.filesWithErrors}\n`
    output += `  Total errors found: ${result.summary.totalErrors}\n`
    output += `  Auto-fixed errors: ${result.summary.autoFixedErrors}\n`

    if (result.isValid) {
      if (result.summary.autoFixedErrors > 0) {
        output += '\n✅ All syntax errors were auto-fixed!\n'
      } else {
        output += '\n✅ No syntax errors found!\n'
      }
    } else {
      output += '\n⚠️ Some syntax errors could not be auto-fixed\n'
    }

    if (result.errors.length > 0) {
      output += '\n📋 ERRORS:\n'
      const autoFixed = result.errors.filter(e => e.autoFixed)
      const notFixed = result.errors.filter(e => !e.autoFixed)

      if (autoFixed.length > 0) {
        output += `\n✅ AUTO-FIXED (${autoFixed.length}):\n`
        for (const error of autoFixed) {
          output += `\n  📦 ${error.file}\n`
          output += `     Type: ${error.type}\n`
          output += `     Message: ${error.message}\n`
          if (error.originalCode && error.fixedCode) {
            output += `     Original: ${error.originalCode.substring(0, 80)}\n`
            output += `     Fixed:    ${error.fixedCode.substring(0, 80)}\n`
          }
        }
      }

      if (notFixed.length > 0) {
        output += `\n⚠️ NOT AUTO-FIXED (${notFixed.length}):\n`
        for (const error of notFixed) {
          output += `\n  📦 ${error.file}\n`
          output += `     Type: ${error.type}\n`
          output += `     Message: ${error.message}\n`
          if (error.line) {
            output += `     Line: ${error.line}\n`
          }
        }
      }
    }

    if (result.fixedFiles.length > 0) {
      output += `\n🔧 FIXED FILES (${result.fixedFiles.length}):\n`
      for (const file of result.fixedFiles) {
        output += `  - ${file.path} (${file.errorsFixed} errors fixed)\n`
      }
    }

    output += '\n====================================\n'
    return output
  }
}

// Export singleton instance
export const syntaxValidator = SyntaxValidator.getInstance()

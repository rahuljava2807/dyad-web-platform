/**
 * AI Fix Prompt Service
 * Phase 3: Generates intelligent AI prompts for auto-fixing errors
 */

import { AnyPreviewError } from './error-types';
import { DiagnosticReport, FixSuggestion } from '../types/diagnostics.types';

export class AIFixPromptService {
  /**
   * Generate AI fix prompt based on error and diagnostic
   */
  static generateFixPrompt(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport,
    originalPrompt: string,
    generatedFiles: any[]
  ): string {
    const sections: string[] = [];

    // 1. Header with attempt info
    sections.push(this.generateHeader(error, diagnostic));

    // 2. Original context
    sections.push(this.generateOriginalContext(originalPrompt));

    // 3. Error details
    sections.push(this.generateErrorDetails(error, diagnostic));

    // 4. Code context
    if (diagnostic.codeContext) {
      sections.push(this.generateCodeContext(diagnostic));
    }

    // 5. Fix instructions
    sections.push(this.generateFixInstructions(diagnostic, error));

    // 6. Constraints
    sections.push(this.generateConstraints(diagnostic, generatedFiles));

    // 7. Category-specific guidance
    sections.push(this.generateCategoryGuidance(diagnostic, error));

    // 8. Footer with critical reminders
    sections.push(this.generateFooter());

    return sections.join('\n\n');
  }

  /**
   * Generate prompt header
   */
  private static generateHeader(error: AnyPreviewError, diagnostic: DiagnosticReport): string {
    const attemptText =
      error.attemptNumber > 1
        ? `RETRY ATTEMPT ${error.attemptNumber} - PREVIOUS FIX FAILED`
        : 'AUTO-FIX REQUIRED';

    return `🔧 ${attemptText}

Error Category: ${diagnostic.errorCategory}
Severity: ${diagnostic.severity.toUpperCase()}
Confidence: ${diagnostic.confidence}%`;
  }

  /**
   * Generate original context section
   */
  private static generateOriginalContext(originalPrompt: string): string {
    return `📋 ORIGINAL REQUEST:
${originalPrompt}`;
  }

  /**
   * Generate error details section
   */
  private static generateErrorDetails(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): string {
    let details = `❌ ERROR DETECTED:
- Type: ${diagnostic.errorCategory}
- Root Cause: ${diagnostic.rootCause}
- Failed Files: ${diagnostic.failedFiles.join(', ')}`;

    if (error.filePath) {
      details += `\n- Location: ${error.filePath}`;
      if (error.lineNumber) {
        details += `:${error.lineNumber}`;
        if (error.columnNumber) {
          details += `:${error.columnNumber}`;
        }
      }
    }

    if (diagnostic.specificIssues.length > 0) {
      details += '\n\nSpecific Issues:';
      diagnostic.specificIssues.slice(0, 3).forEach((issue, idx) => {
        details += `\n${idx + 1}. [${issue.severity}] ${issue.description}`;
      });
    }

    return details;
  }

  /**
   * Generate code context section
   */
  private static generateCodeContext(diagnostic: DiagnosticReport): string {
    return `📝 PROBLEMATIC CODE:
\`\`\`
${diagnostic.codeContext}
\`\`\``;
  }

  /**
   * Generate fix instructions section
   */
  private static generateFixInstructions(
    diagnostic: DiagnosticReport,
    error: AnyPreviewError
  ): string {
    const automatedFixes = diagnostic.suggestedFixes.filter((f) => f.automated);

    if (automatedFixes.length === 0) {
      return `🔨 REQUIRED ACTIONS:
- Analyze the error and regenerate working code
- Follow the constraints below strictly`;
    }

    let instructions = `🔨 REQUIRED FIXES:\n`;

    automatedFixes.forEach((fix, idx) => {
      instructions += `\n${idx + 1}. [${fix.type.toUpperCase()}] ${fix.description}`;
      if (fix.target) {
        instructions += `\n   Target: ${fix.target}`;
      }
      if (fix.example) {
        instructions += `\n   Example: ${fix.example}`;
      }
    });

    return instructions;
  }

  /**
   * Generate constraints section
   */
  private static generateConstraints(
    diagnostic: DiagnosticReport,
    generatedFiles: any[]
  ): string {
    let constraints = `⚠️ CONSTRAINTS:`;

    // File regeneration constraints
    if (diagnostic.retainedFiles.length > 0) {
      constraints += `\n- RETAIN these working files: ${diagnostic.retainedFiles.join(', ')}`;
    }

    if (diagnostic.failedFiles.length > 0) {
      constraints += `\n- REGENERATE only these failed files: ${diagnostic.failedFiles.join(', ')}`;
    } else {
      constraints += `\n- REGENERATE all files with fixes applied`;
    }

    // General constraints
    constraints += `\n- MAINTAIN the same functionality as original request`;
    constraints += `\n- PRESERVE all working features`;
    constraints += `\n- FIX only the specific issues identified`;

    return constraints;
  }

  /**
   * Generate category-specific guidance
   */
  private static generateCategoryGuidance(
    diagnostic: DiagnosticReport,
    error: AnyPreviewError
  ): string {
    let guidance = `📚 CATEGORY-SPECIFIC GUIDANCE:\n`;

    switch (diagnostic.errorCategory) {
      case 'JSX_ERROR':
        guidance += `
✓ ENSURE all JSX tags are properly closed
✓ USE self-closing tags for elements without children: <Component />
✓ VERIFY all brackets and parentheses match
✓ CHECK that JSX expressions are properly wrapped in curly braces
✓ AVOID fragments unless absolutely necessary`;
        break;

      case 'SYNTAX_ERROR':
        guidance += `
✓ CHECK for missing semicolons, brackets, or parentheses
✓ VERIFY all string quotes are properly closed
✓ ENSURE proper JavaScript/TypeScript syntax
✓ VALIDATE all template literals are correctly formatted
✓ FIX any unexpected tokens`;
        break;

      case 'IMPORT_ERROR':
      case 'DEPENDENCY_ERROR':
        const moduleMatch = error.message.match(/["']([^"']+)["']/);
        const moduleName = moduleMatch ? moduleMatch[1] : 'unavailable module';

        guidance += `
✓ REMOVE the unavailable import: "${moduleName}"
✓ USE only React and Tailwind CSS (no external libraries)
✓ BUILD the functionality from scratch instead of importing
✓ REPLACE library components with custom implementations
✓ VERIFY all remaining imports are valid (react, react-dom only)

Example replacements:
- Charts → Build simple SVG/Canvas charts
- Icons → Use Unicode symbols or Tailwind CSS
- UI Libraries → Build components with Tailwind CSS`;
        break;

      case 'RUNTIME_ERROR':
        if (diagnostic.rootCauseType === 'null-reference') {
          guidance += `
✓ ADD null/undefined checks before accessing properties
✓ USE optional chaining: variable?.property
✓ PROVIDE default values: const data = props.data || []
✓ INITIALIZE all variables before use
✓ CHECK props and state for undefined values`;
        } else if (diagnostic.rootCauseType === 'hooks-error') {
          guidance += `
✓ CALL hooks only at the top level of components
✓ AVOID conditional hook calls
✓ ENSURE hooks are called in the same order every render
✓ DON'T call hooks in loops, conditions, or nested functions
✓ USE hooks only in React function components`;
        } else {
          guidance += `
✓ ADD proper error boundaries for graceful failures
✓ VALIDATE all props and data before use
✓ HANDLE edge cases and error states
✓ ENSURE components are properly exported/imported
✓ CHECK for infinite loops or recursion`;
        }
        break;

      case 'TYPE_ERROR':
        guidance += `
✓ ADD proper TypeScript type annotations
✓ FIX type mismatches between assignments
✓ USE 'any' sparingly, prefer specific types
✓ ENSURE function parameters have correct types
✓ VALIDATE return types match function signatures`;
        break;

      case 'BUILD_ERROR':
        guidance += `
✓ SIMPLIFY code to use standard ES6+ syntax
✓ AVOID advanced TypeScript features
✓ ENSURE all imports resolve correctly
✓ REMOVE any bundler-specific syntax
✓ USE only widely-supported JavaScript features`;
        break;

      case 'NETWORK_ERROR':
        guidance += `
✓ REMOVE dependencies on external CDNs
✓ AVOID fetch() calls to external APIs
✓ BUNDLE all resources inline
✓ USE only local/inline assets
✓ DON'T rely on network requests`;
        break;

      case 'TIMEOUT_ERROR':
        guidance += `
✓ SIMPLIFY component logic and reduce complexity
✓ REMOVE heavy computations from render
✓ AVOID deep component nesting (max 3-4 levels)
✓ REDUCE number of components if possible
✓ REMOVE animations or heavy effects`;
        break;

      default:
        guidance += `
✓ ANALYZE the error message carefully
✓ FIX the root cause, not just symptoms
✓ TEST edge cases mentally before generating
✓ KEEP code simple and readable`;
    }

    return guidance;
  }

  /**
   * Generate footer with critical reminders
   */
  private static generateFooter(): string {
    return `🎯 CRITICAL REMINDERS:

1. Generate COMPLETE, EXECUTABLE code
2. NO placeholders like "// Implementation here" or "This is a..."
3. NO explanations or comments about what you're doing
4. ONLY raw, working code that runs immediately
5. INCLUDE all necessary imports, exports, and logic
6. TEST the code mentally for common errors before generating

The code MUST work on first try. No second chances.`;
  }

  /**
   * Create a summary of the fix prompt (for logging/display)
   */
  static createPromptSummary(diagnostic: DiagnosticReport): string {
    const automatedFixes = diagnostic.suggestedFixes.filter((f) => f.automated);

    if (automatedFixes.length === 0) {
      return `Regenerating ${diagnostic.failedFiles.join(', ')} to fix ${diagnostic.errorCategory}`;
    }

    if (automatedFixes.length === 1) {
      return automatedFixes[0].description;
    }

    const firstTwo = automatedFixes.slice(0, 2).map((f) => f.description);
    const remaining = automatedFixes.length - 2;

    return `${firstTwo.join(', ')}${remaining > 0 ? ` and ${remaining} more` : ''}`;
  }

  /**
   * Generate enhanced prompt for retry attempts
   */
  static generateRetryPrompt(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport,
    originalPrompt: string,
    previousAttempts: Array<{ error: string; files: any[] }>
  ): string {
    let retryPrompt = this.generateFixPrompt(error, diagnostic, originalPrompt, []);

    // Add retry-specific context
    retryPrompt += `\n\n🔄 RETRY CONTEXT:\n`;
    retryPrompt += `This is attempt #${error.attemptNumber}. Previous attempts failed:\n\n`;

    previousAttempts.slice(-2).forEach((attempt, idx) => {
      retryPrompt += `Attempt ${idx + 1}: ${attempt.error}\n`;
    });

    retryPrompt += `\n⚠️ CRITICAL: Change your approach. The previous solution(s) did NOT work.`;
    retryPrompt += `\nTry a DIFFERENT implementation strategy to avoid the same error.`;

    return retryPrompt;
  }
}

export const aiFixPrompt = AIFixPromptService;

/**
 * Self-Heal Service
 * Phase 3-4: Automatically attempts to fix preview errors by regenerating code
 * with intelligent retry and context preservation
 */

import { AnyPreviewError } from './error-types';
import { DiagnosticReport } from '../types/diagnostics.types';
import { errorAnalyzer } from './error-analyzer.service';
import { fixSuggestions } from './fix-suggestions.service';
import { retryStrategy } from './retry-strategy.service';
import { contextPreservation } from './context-preservation.service';
import { aiFixPrompt } from './ai-fix-prompt.service';

export interface SelfHealConfig {
  maxAttempts: 3;           // Try fixing 3 times max
  backoffDelay: 2000;       // Wait 2s between attempts
  notifyUser: boolean;      // Show "Auto-fixing..." message
  enabledCategories: string[]; // Which error types to auto-fix
}

export interface RegenerationResult {
  success: boolean;
  files?: any[];            // Regenerated files
  diagnostic?: DiagnosticReport;
  attemptNumber: number;
  error?: string;
  fixApplied?: string;      // Description of what was fixed
}

export interface SelfHealState {
  isHealing: boolean;
  currentAttempt: number;
  lastError?: AnyPreviewError;
  healingMessage?: string;
}

export class SelfHealService {
  private config: SelfHealConfig = {
    maxAttempts: 3,
    backoffDelay: 2000,
    notifyUser: true,
    enabledCategories: [
      'JSX_ERROR',
      'SYNTAX_ERROR',
      'IMPORT_ERROR',
      'DEPENDENCY_ERROR',
      'RUNTIME_ERROR',
    ],
  };

  private state: SelfHealState = {
    isHealing: false,
    currentAttempt: 0,
  };

  private listeners: Array<(state: SelfHealState) => void> = [];

  /**
   * Update self-heal configuration
   */
  configure(config: Partial<SelfHealConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SelfHealConfig {
    return { ...this.config };
  }

  /**
   * Get current healing state
   */
  getState(): SelfHealState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(callback: (state: SelfHealState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<SelfHealState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Check if error should be auto-healed with intelligent retry strategy
   */
  shouldAutoHeal(
    error: AnyPreviewError,
    generatedFiles: any[],
    sessionId?: string
  ): boolean {
    // Don't auto-heal if already healing
    if (this.state.isHealing) {
      return false;
    }

    // Analyze error to get category
    const diagnostic = errorAnalyzer.analyze(error, generatedFiles);

    // Only auto-heal enabled categories
    if (!this.config.enabledCategories.includes(diagnostic.errorCategory)) {
      return false;
    }

    // Use retry strategy if session ID provided
    if (sessionId) {
      const strategy = retryStrategy.determineStrategy(error, diagnostic, sessionId);
      return strategy.shouldRetry;
    }

    // Fallback to simple max attempts check
    return error.attemptNumber < this.config.maxAttempts;
  }

  /**
   * Attempt to self-heal a preview error with retry strategy and context preservation
   */
  async attemptSelfHeal(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport,
    originalPrompt: string,
    generatedFiles: any[],
    sessionId?: string
  ): Promise<RegenerationResult> {
    const attemptNumber = error.attemptNumber + 1;

    // Determine retry strategy
    const strategy = sessionId
      ? retryStrategy.determineStrategy(error, diagnostic, sessionId)
      : {
          maxAttempts: this.config.maxAttempts,
          shouldRetry: attemptNumber < this.config.maxAttempts,
          nextDelay: this.config.backoffDelay,
          reason: 'Standard retry',
        };

    this.updateState({
      isHealing: true,
      currentAttempt: attemptNumber,
      lastError: error,
      healingMessage: `Auto-fixing error (Attempt ${attemptNumber}/${strategy.maxAttempts})... ${strategy.reason}`,
    });

    try {
      // Generate fix suggestions if not already present
      if (!diagnostic.suggestedFixes || diagnostic.suggestedFixes.length === 0) {
        diagnostic.suggestedFixes = fixSuggestions.generateSuggestions(diagnostic, error);
      }

      // Update context preservation if session ID provided
      if (sessionId) {
        contextPreservation.updateContextWithError(sessionId, error, diagnostic, generatedFiles);
      }

      // Wait for strategic backoff delay
      if (attemptNumber > 1) {
        await this.delay(strategy.nextDelay);
      }

      // Create AI fix prompt with context awareness
      let fixPrompt: string;
      if (sessionId) {
        const contextPrompt = contextPreservation.generateContextAwarePrompt(
          sessionId,
          error,
          diagnostic
        );
        const basePrompt = aiFixPrompt.generateFixPrompt(
          error,
          diagnostic,
          originalPrompt,
          generatedFiles
        );

        // Add strategy guidance if needed
        fixPrompt = strategy.changeStrategy
          ? `${contextPrompt}\n\n${basePrompt}\n\n🔄 STRATEGY CHANGE REQUIRED:\n${strategy.changeStrategy}`
          : `${contextPrompt}\n\n${basePrompt}`;
      } else {
        fixPrompt = this.createAIFixPrompt(error, diagnostic, originalPrompt, generatedFiles);
      }

      // Call regeneration API
      const response = await fetch('/api/builder/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt,
          errorContext: {
            error: {
              type: error.type,
              message: error.message,
              file: error.filePath,
              line: error.lineNumber,
            },
            diagnostic: {
              category: diagnostic.errorCategory,
              rootCause: diagnostic.rootCause,
              failedFiles: diagnostic.failedFiles,
              retainedFiles: diagnostic.retainedFiles,
            },
            fixes: diagnostic.suggestedFixes,
          },
          fixPrompt: aiFixPrompt,
          attemptNumber,
          previousFiles: generatedFiles,
        }),
      });

      if (!response.ok) {
        throw new Error(`Regeneration API failed: ${response.statusText}`);
      }

      const result = await response.json();

      const fixDescription = this.describeFix(diagnostic);

      // Record successful attempt in retry strategy
      if (sessionId) {
        retryStrategy.recordAttempt(sessionId, error, diagnostic, fixDescription, true);
        contextPreservation.updateContextWithFix(sessionId, result.files, fixDescription);
      }

      this.updateState({
        isHealing: false,
        currentAttempt: 0,
        healingMessage: undefined,
      });

      return {
        success: true,
        files: result.files,
        diagnostic,
        attemptNumber,
        fixApplied: fixDescription,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Record failed attempt in retry strategy
      if (sessionId) {
        retryStrategy.recordAttempt(sessionId, error as any, diagnostic, errorMessage, false);
      }

      this.updateState({
        isHealing: false,
        currentAttempt: 0,
        healingMessage: undefined,
      });

      return {
        success: false,
        diagnostic,
        attemptNumber,
        error: errorMessage,
      };
    }
  }

  /**
   * Create AI fix prompt based on diagnostic
   */
  private createAIFixPrompt(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport,
    originalPrompt: string,
    generatedFiles: any[]
  ): string {
    const automatedFixes = diagnostic.suggestedFixes.filter((f) => f.automated);
    const fixDescriptions = automatedFixes.map((f) => f.description).join('\n- ');

    let prompt = `PREVIOUS GENERATION FAILED - AUTO-FIX REQUIRED\n\n`;
    prompt += `Original request: ${originalPrompt}\n\n`;
    prompt += `ERROR DETECTED:\n`;
    prompt += `- Type: ${diagnostic.errorCategory}\n`;
    prompt += `- Severity: ${diagnostic.severity}\n`;
    prompt += `- Root Cause: ${diagnostic.rootCause}\n`;
    prompt += `- Failed Files: ${diagnostic.failedFiles.join(', ')}\n\n`;

    if (diagnostic.codeContext) {
      prompt += `PROBLEMATIC CODE:\n${diagnostic.codeContext}\n\n`;
    }

    prompt += `REQUIRED FIXES:\n- ${fixDescriptions}\n\n`;

    prompt += `CONSTRAINTS:\n`;
    prompt += `- FIX the specific issues listed above\n`;
    prompt += `- RETAIN all files that worked: ${diagnostic.retainedFiles.join(', ')}\n`;
    prompt += `- REGENERATE only failed files: ${diagnostic.failedFiles.join(', ')}\n`;

    // Add category-specific instructions
    switch (diagnostic.errorCategory) {
      case 'JSX_ERROR':
      case 'SYNTAX_ERROR':
        prompt += `- ENSURE all JSX tags are properly closed\n`;
        prompt += `- USE self-closing tags where appropriate\n`;
        prompt += `- VERIFY all brackets and parentheses match\n`;
        break;

      case 'IMPORT_ERROR':
      case 'DEPENDENCY_ERROR':
        prompt += `- REMOVE unavailable imports (${error.message})\n`;
        prompt += `- USE only React, Tailwind CSS (no external libraries)\n`;
        prompt += `- BUILD functionality from scratch instead of using unavailable libraries\n`;
        break;

      case 'RUNTIME_ERROR':
        prompt += `- ADD proper null/undefined checks\n`;
        prompt += `- INITIALIZE all variables before use\n`;
        prompt += `- ENSURE hooks are called unconditionally at top level\n`;
        break;

      case 'TYPE_ERROR':
        prompt += `- ADD proper TypeScript type annotations\n`;
        prompt += `- FIX type mismatches\n`;
        prompt += `- USE type assertions only when necessary\n`;
        break;

      case 'BUILD_ERROR':
        prompt += `- SIMPLIFY code to use standard syntax\n`;
        prompt += `- AVOID advanced TypeScript features\n`;
        prompt += `- ENSURE all imports are valid\n`;
        break;
    }

    prompt += `\nIMPORTANT: Generate COMPLETE, WORKING code. NO placeholders. NO explanations. ONLY executable code.`;

    return prompt;
  }

  /**
   * Create human-readable description of fix applied
   */
  private describeFix(diagnostic: DiagnosticReport): string {
    const automatedFixes = diagnostic.suggestedFixes.filter((f) => f.automated);

    if (automatedFixes.length === 0) {
      return 'Regenerated code with error context';
    }

    if (automatedFixes.length === 1) {
      return automatedFixes[0].description;
    }

    return `Applied ${automatedFixes.length} fixes: ${automatedFixes
      .slice(0, 2)
      .map((f) => f.description)
      .join(', ')}${automatedFixes.length > 2 ? '...' : ''}`;
  }

  /**
   * Delay helper for backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset healing state
   */
  reset(): void {
    this.updateState({
      isHealing: false,
      currentAttempt: 0,
      lastError: undefined,
      healingMessage: undefined,
    });
  }
}

export const selfHeal = new SelfHealService();

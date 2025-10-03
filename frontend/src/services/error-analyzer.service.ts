/**
 * Error Analyzer Service
 * Phase 2: Analyzes errors and identifies root causes
 */

import {
  AnyPreviewError,
  ErrorType,
  SyntaxError as SyntaxErrorType,
  BuildError,
  RuntimeError,
  NetworkError,
  TimeoutError,
} from './error-types';
import {
  DiagnosticReport,
  ErrorCategory,
  SeverityLevel,
  Issue,
  RootCauseAnalysis,
  CodeContext,
} from '../types/diagnostics.types';

export class ErrorAnalyzerService {
  /**
   * Analyze a preview error and create diagnostic report
   */
  static analyze(error: AnyPreviewError, generatedFiles: any[]): DiagnosticReport {
    const errorCategory = this.categorizeError(error);
    const severity = this.determineSeverity(error);
    const rootCause = this.identifyRootCause(error);
    const issues = this.extractIssues(error);
    const codeContext = this.getCodeContext(error, generatedFiles);
    const affectedFiles = this.findAffectedFiles(error, generatedFiles);

    return {
      summary: this.generateSummary(error),
      errorCategory,
      severity,
      rootCause: rootCause.primaryCause,
      rootCauseType: rootCause.pattern,
      failedFiles: affectedFiles.failed,
      affectedCode: this.describeAffectedCode(error),
      codeContext: codeContext.content,
      specificIssues: issues,
      suggestedFixes: [], // Will be filled by fix-suggestions service
      codeToRegenerate: affectedFiles.failed,
      retainedFiles: affectedFiles.retained,
      confidence: this.calculateConfidence(error, rootCause),
      timestamp: Date.now(),
      errorId: error.id,
    };
  }

  /**
   * Categorize error into specific category
   */
  private static categorizeError(error: AnyPreviewError): ErrorCategory {
    switch (error.type) {
      case 'syntax':
        const syntaxError = error as SyntaxErrorType;
        if (syntaxError.syntaxErrorType === 'jsx') return 'JSX_ERROR';
        if (syntaxError.syntaxErrorType === 'import') return 'IMPORT_ERROR';
        if (syntaxError.syntaxErrorType === 'typescript') return 'TYPE_ERROR';
        return 'SYNTAX_ERROR';

      case 'build':
        const buildError = error as BuildError;
        if (buildError.unresolvedImports?.length) return 'DEPENDENCY_ERROR';
        return 'BUILD_ERROR';

      case 'runtime':
        return 'RUNTIME_ERROR';

      case 'network':
        return 'NETWORK_ERROR';

      case 'timeout':
        return 'TIMEOUT_ERROR';

      default:
        return 'RUNTIME_ERROR';
    }
  }

  /**
   * Determine severity level
   */
  private static determineSeverity(error: AnyPreviewError): SeverityLevel {
    // Critical: Prevents any rendering
    if (error.type === 'syntax' || error.type === 'build') {
      return 'critical';
    }

    // Major: App renders but crashes
    if (error.type === 'runtime') {
      return 'major';
    }

    // Minor: App works but with issues
    if (error.type === 'network' || error.type === 'timeout') {
      return 'minor';
    }

    return 'major';
  }

  /**
   * Identify root cause of the error
   */
  private static identifyRootCause(error: AnyPreviewError): RootCauseAnalysis {
    const message = error.message.toLowerCase();

    // Syntax error patterns
    if (error.type === 'syntax') {
      if (message.includes('expected') && message.includes('closing')) {
        return {
          primaryCause: 'Missing closing tag in JSX',
          secondaryCauses: ['Unclosed HTML element', 'Mismatched tags'],
          pattern: 'unclosed-tag',
          commonSolutions: ['Add closing tag', 'Use self-closing syntax'],
        };
      }

      if (message.includes('unexpected token')) {
        return {
          primaryCause: 'Unexpected syntax token',
          secondaryCauses: ['Invalid JSX syntax', 'Missing brackets or parentheses'],
          pattern: 'unexpected-token',
          commonSolutions: ['Check JSX syntax', 'Ensure proper nesting'],
        };
      }

      if (message.includes('import')) {
        return {
          primaryCause: 'Invalid import statement',
          secondaryCauses: ['Wrong import syntax', 'Missing quotes'],
          pattern: 'import-error',
          commonSolutions: ['Fix import syntax', 'Check module path'],
        };
      }
    }

    // Build error patterns
    if (error.type === 'build') {
      const buildError = error as BuildError;

      if (buildError.unresolvedImports?.length) {
        return {
          primaryCause: `Cannot resolve module: ${buildError.unresolvedImports[0]}`,
          secondaryCauses: ['Missing dependency', 'Wrong module path', 'Typo in import'],
          pattern: 'unresolved-import',
          commonSolutions: [
            'Check if module is available',
            'Fix module path',
            'Remove invalid import',
          ],
        };
      }

      if (message.includes('transform')) {
        return {
          primaryCause: 'Code transformation failed',
          secondaryCauses: ['Invalid TypeScript', 'Unsupported syntax'],
          pattern: 'transform-error',
          commonSolutions: ['Simplify code', 'Use standard syntax'],
        };
      }
    }

    // Runtime error patterns
    if (error.type === 'runtime') {
      if (message.includes('undefined') || message.includes('null')) {
        return {
          primaryCause: 'Accessing property of undefined/null',
          secondaryCauses: ['Missing null check', 'Uninitialized variable'],
          pattern: 'null-reference',
          commonSolutions: ['Add null check', 'Initialize variable', 'Use optional chaining'],
        };
      }

      if (message.includes('hook')) {
        return {
          primaryCause: 'React hooks error',
          secondaryCauses: ['Hooks called conditionally', 'Hooks order changed'],
          pattern: 'hooks-error',
          commonSolutions: ['Fix hooks usage', 'Ensure hooks are called unconditionally'],
        };
      }

      if (message.includes('element type') || message.includes('invalid')) {
        return {
          primaryCause: 'Invalid component or element',
          secondaryCauses: ['Wrong import', 'Component not exported', 'Undefined component'],
          pattern: 'invalid-element',
          commonSolutions: ['Check component export', 'Fix import statement'],
        };
      }
    }

    // Network error patterns
    if (error.type === 'network') {
      const networkError = error as NetworkError;
      return {
        primaryCause: `Failed to load resource: ${networkError.failedUrl}`,
        secondaryCauses: ['CDN unavailable', 'Wrong URL', '404 error'],
        pattern: 'network-failure',
        commonSolutions: ['Check URL', 'Use alternative CDN', 'Bundle resource locally'],
      };
    }

    // Timeout error patterns
    if (error.type === 'timeout') {
      const timeoutError = error as TimeoutError;
      return {
        primaryCause: `Operation timed out during ${timeoutError.timeoutPhase}`,
        secondaryCauses: ['Too complex code', 'Infinite loop', 'Heavy computation'],
        pattern: 'timeout',
        commonSolutions: ['Simplify code', 'Remove heavy operations', 'Check for infinite loops'],
      };
    }

    // Default
    return {
      primaryCause: error.message,
      secondaryCauses: [],
      pattern: 'unknown',
      commonSolutions: ['Review error message', 'Check console logs'],
    };
  }

  /**
   * Extract specific issues from error
   */
  private static extractIssues(error: AnyPreviewError): Issue[] {
    const issues: Issue[] = [];

    // Main issue
    issues.push({
      type: error.type,
      severity: this.determineSeverity(error),
      description: error.message,
      location: error.filePath
        ? {
            file: error.filePath,
            line: error.lineNumber,
            column: error.columnNumber,
          }
        : undefined,
    });

    // Additional issues from console logs
    error.consoleLogs
      .filter((log) => log.includes('[error]') || log.includes('[warn]'))
      .slice(0, 3) // Limit to 3 most recent
      .forEach((log) => {
        issues.push({
          type: 'console-error',
          severity: 'minor',
          description: log.replace(/^\[error\]\s*/, '').replace(/^\[warn\]\s*/, ''),
        });
      });

    // Syntax error specifics
    if (error.type === 'syntax') {
      const syntaxError = error as SyntaxErrorType;
      if (syntaxError.expectedToken) {
        issues.push({
          type: 'syntax-mismatch',
          severity: 'critical',
          description: `Expected "${syntaxError.expectedToken}" but got "${syntaxError.actualToken}"`,
          location: error.filePath
            ? {
                file: error.filePath,
                line: error.lineNumber,
                column: error.columnNumber,
              }
            : undefined,
        });
      }
    }

    // Build error specifics
    if (error.type === 'build') {
      const buildError = error as BuildError;
      buildError.unresolvedImports?.forEach((module) => {
        issues.push({
          type: 'unresolved-import',
          severity: 'critical',
          description: `Cannot resolve module: "${module}"`,
        });
      });
    }

    return issues;
  }

  /**
   * Get code context around error
   */
  private static getCodeContext(error: AnyPreviewError, generatedFiles: any[]): CodeContext {
    const file = generatedFiles.find(
      (f) => f.path === error.filePath || f.path.endsWith(error.filePath || '')
    );

    if (!file || !error.lineNumber) {
      return {
        file: error.filePath || 'unknown',
        startLine: 1,
        endLine: 1,
        content: error.code || 'Code not available',
      };
    }

    const lines = file.content.split('\n');
    const errorLine = error.lineNumber - 1; // 0-indexed
    const startLine = Math.max(0, errorLine - 5);
    const endLine = Math.min(lines.length - 1, errorLine + 5);

    const contextLines = lines.slice(startLine, endLine + 1);
    const numberedLines = contextLines
      .map((line, idx) => {
        const lineNum = startLine + idx + 1;
        const marker = lineNum === error.lineNumber ? '→' : ' ';
        return `${marker} ${lineNum.toString().padStart(4, ' ')}: ${line}`;
      })
      .join('\n');

    return {
      file: error.filePath,
      startLine: startLine + 1,
      endLine: endLine + 1,
      content: numberedLines,
      highlightLine: error.lineNumber,
      errorMarker: error.columnNumber
        ? {
            line: error.lineNumber,
            column: error.columnNumber,
            length: 1,
          }
        : undefined,
    };
  }

  /**
   * Find affected and retained files
   */
  private static findAffectedFiles(
    error: AnyPreviewError,
    generatedFiles: any[]
  ): { failed: string[]; retained: string[] } {
    const failed: string[] = [];
    const retained: string[] = [];

    if (error.filePath) {
      failed.push(error.filePath);
    }

    // Check if error mentions other files
    generatedFiles.forEach((file) => {
      const fileName = file.path.split('/').pop();
      if (error.message.includes(fileName) || error.stack?.includes(fileName)) {
        if (!failed.includes(file.path)) {
          failed.push(file.path);
        }
      } else if (!failed.includes(file.path)) {
        retained.push(file.path);
      }
    });

    // If no specific file found, mark all as needing regeneration
    if (failed.length === 0) {
      return {
        failed: generatedFiles.map((f) => f.path),
        retained: [],
      };
    }

    return { failed, retained };
  }

  /**
   * Generate human-readable summary
   */
  private static generateSummary(error: AnyPreviewError): string {
    const fileName = error.filePath?.split('/').pop() || 'generated code';

    switch (error.type) {
      case 'syntax':
        return `Syntax error in ${fileName}${error.lineNumber ? ` at line ${error.lineNumber}` : ''}`;
      case 'build':
        return `Build failed in ${fileName}`;
      case 'runtime':
        return `Runtime error in ${error.componentName || fileName}`;
      case 'network':
        return `Failed to load external resource`;
      case 'timeout':
        return `Preview timed out during loading`;
      default:
        return `Error in ${fileName}`;
    }
  }

  /**
   * Describe affected code location
   */
  private static describeAffectedCode(error: AnyPreviewError): string {
    if (!error.filePath) {
      return 'Unknown location';
    }

    if (error.lineNumber && error.columnNumber) {
      return `line ${error.lineNumber}:${error.columnNumber} in ${error.filePath}`;
    }

    if (error.lineNumber) {
      return `line ${error.lineNumber} in ${error.filePath}`;
    }

    return error.filePath;
  }

  /**
   * Calculate confidence in diagnosis
   */
  private static calculateConfidence(error: AnyPreviewError, rootCause: RootCauseAnalysis): number {
    let confidence = 50; // Base confidence

    // Increase confidence if we have specific location
    if (error.lineNumber) confidence += 20;
    if (error.filePath) confidence += 10;

    // Increase confidence if we recognize the pattern
    if (rootCause.pattern !== 'unknown') confidence += 15;

    // Increase confidence if we have stack trace
    if (error.stack) confidence += 5;

    return Math.min(100, confidence);
  }
}

export const errorAnalyzer = ErrorAnalyzerService;

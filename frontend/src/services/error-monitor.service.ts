/**
 * Error Monitor Service
 * Phase 1: Captures all 5 types of preview errors
 */

import { v4 as uuidv4 } from 'uuid';
import {
  PreviewError,
  AnyPreviewError,
  ErrorType,
  ConsoleLog,
  ErrorContext,
  NetworkError,
  SyntaxError as SyntaxErrorType,
  BuildError,
  RuntimeError,
  TimeoutError,
} from './error-types';

export class ErrorMonitorService {
  private static instance: ErrorMonitorService;
  private errors: AnyPreviewError[] = [];
  private consoleLogs: ConsoleLog[] = [];
  private errorListeners: Array<(error: AnyPreviewError) => void> = [];

  private constructor() {}

  static getInstance(): ErrorMonitorService {
    if (!ErrorMonitorService.instance) {
      ErrorMonitorService.instance = new ErrorMonitorService();
    }
    return ErrorMonitorService.instance;
  }

  /**
   * Capture a syntax error (TypeScript/JSX parsing)
   */
  captureSyntaxError(
    message: string,
    code: string,
    context: ErrorContext,
    options?: {
      lineNumber?: number;
      columnNumber?: number;
      filePath?: string;
      syntaxErrorType?: 'jsx' | 'typescript' | 'import' | 'other';
      expectedToken?: string;
      actualToken?: string;
    }
  ): SyntaxErrorType {
    const error: SyntaxErrorType = {
      id: uuidv4(),
      type: 'syntax',
      timestamp: Date.now(),
      message,
      code,
      consoleLogs: this.getRecentLogs(),
      attemptNumber: this.getAttemptNumber(),
      lineNumber: options?.lineNumber,
      columnNumber: options?.columnNumber,
      filePath: options?.filePath,
      syntaxErrorType: options?.syntaxErrorType,
      expectedToken: options?.expectedToken,
      actualToken: options?.actualToken,
    };

    this.addError(error);
    return error;
  }

  /**
   * Capture a build error (bundling failures)
   */
  captureBuildError(
    message: string,
    code: string,
    context: ErrorContext,
    options?: {
      stack?: string;
      buildPhase?: 'bundling' | 'transformation' | 'resolution';
      unresolvedImports?: string[];
      filePath?: string;
    }
  ): BuildError {
    const error: BuildError = {
      id: uuidv4(),
      type: 'build',
      timestamp: Date.now(),
      message,
      code,
      stack: options?.stack,
      consoleLogs: this.getRecentLogs(),
      attemptNumber: this.getAttemptNumber(),
      buildPhase: options?.buildPhase,
      unresolvedImports: options?.unresolvedImports,
      filePath: options?.filePath,
    };

    this.addError(error);
    return error;
  }

  /**
   * Capture a runtime error (React crashes, hooks errors)
   */
  captureRuntimeError(
    message: string,
    code: string,
    context: ErrorContext,
    options?: {
      stack?: string;
      lineNumber?: number;
      columnNumber?: number;
      componentName?: string;
      errorBoundary?: boolean;
      reactComponent?: string;
      hookName?: string;
      filePath?: string;
    }
  ): RuntimeError {
    const error: RuntimeError = {
      id: uuidv4(),
      type: 'runtime',
      timestamp: Date.now(),
      message,
      code,
      stack: options?.stack,
      consoleLogs: this.getRecentLogs(),
      attemptNumber: this.getAttemptNumber(),
      lineNumber: options?.lineNumber,
      columnNumber: options?.columnNumber,
      componentName: options?.componentName,
      errorBoundary: options?.errorBoundary,
      reactComponent: options?.reactComponent,
      hookName: options?.hookName,
      filePath: options?.filePath,
    };

    this.addError(error);
    return error;
  }

  /**
   * Capture a network error (CDN failures, 404s)
   */
  captureNetworkError(
    message: string,
    code: string,
    context: ErrorContext,
    options: {
      failedUrl: string;
      statusCode?: number;
      resourceType?: 'script' | 'style' | 'image' | 'fetch';
    }
  ): NetworkError {
    const error: NetworkError = {
      id: uuidv4(),
      type: 'network',
      timestamp: Date.now(),
      message,
      code,
      consoleLogs: this.getRecentLogs(),
      attemptNumber: this.getAttemptNumber(),
      failedUrl: options.failedUrl,
      statusCode: options.statusCode,
      resourceType: options.resourceType,
    };

    this.addError(error);
    return error;
  }

  /**
   * Capture a timeout error (preview takes >10 seconds)
   */
  captureTimeoutError(
    message: string,
    code: string,
    context: ErrorContext,
    options: {
      timeoutDuration: number;
      timeoutPhase: 'bundle' | 'render' | 'load';
    }
  ): TimeoutError {
    const error: TimeoutError = {
      id: uuidv4(),
      type: 'timeout',
      timestamp: Date.now(),
      message,
      code,
      consoleLogs: this.getRecentLogs(),
      attemptNumber: this.getAttemptNumber(),
      timeoutDuration: options.timeoutDuration,
      timeoutPhase: options.timeoutPhase,
    };

    this.addError(error);
    return error;
  }

  /**
   * Log console output from iframe
   */
  logConsoleOutput(
    type: 'log' | 'warn' | 'error' | 'info',
    message: string,
    args?: any[]
  ): void {
    const log: ConsoleLog = {
      type,
      message,
      timestamp: Date.now(),
      args,
    };

    this.consoleLogs.push(log);

    // Keep only last 100 logs
    if (this.consoleLogs.length > 100) {
      this.consoleLogs = this.consoleLogs.slice(-100);
    }
  }

  /**
   * Subscribe to error events
   */
  onError(callback: (error: AnyPreviewError) => void): () => void {
    this.errorListeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.errorListeners = this.errorListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Get all captured errors
   */
  getErrors(): AnyPreviewError[] {
    return [...this.errors];
  }

  /**
   * Get latest error
   */
  getLatestError(): AnyPreviewError | null {
    return this.errors[this.errors.length - 1] || null;
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): AnyPreviewError[] {
    return this.errors.filter((e) => e.type === type);
  }

  /**
   * Get console logs
   */
  getConsoleLogs(): ConsoleLog[] {
    return [...this.consoleLogs];
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
    this.consoleLogs = [];
  }

  /**
   * Clear errors by type
   */
  clearErrorsByType(type: ErrorType): void {
    this.errors = this.errors.filter((e) => e.type !== type);
  }

  /**
   * Parse error message to extract details
   */
  parseErrorMessage(message: string): {
    lineNumber?: number;
    columnNumber?: number;
    filePath?: string;
  } {
    const result: any = {};

    // Extract line number (e.g., "at line 23" or ":23:15")
    const lineMatch = message.match(/(?:line\s+|:)(\d+)(?::(\d+))?/i);
    if (lineMatch) {
      result.lineNumber = parseInt(lineMatch[1], 10);
      if (lineMatch[2]) {
        result.columnNumber = parseInt(lineMatch[2], 10);
      }
    }

    // Extract file path
    const fileMatch = message.match(/(?:in|at)\s+([^\s]+\.(?:tsx|ts|jsx|js))/i);
    if (fileMatch) {
      result.filePath = fileMatch[1];
    }

    return result;
  }

  /**
   * Detect error type from message
   */
  detectErrorType(message: string, stack?: string): ErrorType {
    const lowerMessage = message.toLowerCase();

    // Syntax errors
    if (
      lowerMessage.includes('unexpected token') ||
      lowerMessage.includes('expected') ||
      lowerMessage.includes('syntax error') ||
      lowerMessage.includes('parsing error')
    ) {
      return 'syntax';
    }

    // Build errors
    if (
      lowerMessage.includes('cannot find module') ||
      lowerMessage.includes('failed to resolve') ||
      lowerMessage.includes('build failed') ||
      lowerMessage.includes('bundling')
    ) {
      return 'build';
    }

    // Network errors
    if (
      lowerMessage.includes('404') ||
      lowerMessage.includes('failed to load') ||
      lowerMessage.includes('network error') ||
      lowerMessage.includes('fetch failed')
    ) {
      return 'network';
    }

    // Timeout errors
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return 'timeout';
    }

    // Default to runtime
    return 'runtime';
  }

  // Private methods

  private addError(error: AnyPreviewError): void {
    this.errors.push(error);

    // Notify listeners
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
  }

  private getRecentLogs(): string[] {
    return this.consoleLogs.slice(-20).map((log) => `[${log.type}] ${log.message}`);
  }

  private getAttemptNumber(): number {
    // Count similar errors to determine attempt number
    const latestError = this.errors[this.errors.length - 1];
    if (!latestError) return 1;

    const similarErrors = this.errors.filter(
      (e) => e.type === latestError.type && e.message === latestError.message
    );

    return similarErrors.length + 1;
  }
}

// Export singleton instance
export const errorMonitor = ErrorMonitorService.getInstance();

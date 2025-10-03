/**
 * Error Types for Preview Error Detection & Self-Healing System
 * Phase 1: Error Detection & Capture
 */

export type ErrorType = 'syntax' | 'build' | 'runtime' | 'network' | 'timeout';

export interface PreviewError {
  id: string;
  type: ErrorType;
  timestamp: number;
  message: string;
  stack?: string;
  code: string;              // The generated code that failed
  lineNumber?: number;
  columnNumber?: number;
  componentName?: string;
  consoleLogs: string[];     // Capture all console output
  attemptNumber: number;     // Track retry attempts
  filePath?: string;         // Which file caused the error
  sourceCode?: string;       // Source code snippet around error
}

export interface ConsoleLog {
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: number;
  args?: any[];
}

export interface ErrorContext {
  generatedFiles: any[];     // All generated files
  bundledCode: string;       // Bundled code that was attempted
  previewUrl: string;        // Blob URL of preview
  userPrompt: string;        // Original user prompt
  settings: any;             // Generation settings
}

export interface NetworkError extends PreviewError {
  type: 'network';
  failedUrl: string;
  statusCode?: number;
  resourceType?: 'script' | 'style' | 'image' | 'fetch';
}

export interface SyntaxError extends PreviewError {
  type: 'syntax';
  syntaxErrorType?: 'jsx' | 'typescript' | 'import' | 'other';
  expectedToken?: string;
  actualToken?: string;
}

export interface BuildError extends PreviewError {
  type: 'build';
  buildPhase?: 'bundling' | 'transformation' | 'resolution';
  unresolvedImports?: string[];
}

export interface RuntimeError extends PreviewError {
  type: 'runtime';
  errorBoundary?: boolean;
  reactComponent?: string;
  hookName?: string;
}

export interface TimeoutError extends PreviewError {
  type: 'timeout';
  timeoutDuration: number;
  timeoutPhase: 'bundle' | 'render' | 'load';
}

export type AnyPreviewError =
  | PreviewError
  | NetworkError
  | SyntaxError
  | BuildError
  | RuntimeError
  | TimeoutError;

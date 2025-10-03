/**
 * usePreviewErrorCapture Hook
 * Phase 1: Captures errors from preview iframe and bundling process
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { errorMonitor } from '../services/error-monitor.service';
import { AnyPreviewError, ErrorContext } from '../services/error-types';
import { ProjectFile } from '../store/projectStore';

interface UsePreviewErrorCaptureOptions {
  files: ProjectFile[];
  bundledCode: string;
  previewUrl: string;
  userPrompt: string;
  settings: any;
  timeoutDuration?: number; // Default 10 seconds
}

interface UsePreviewErrorCaptureReturn {
  errors: AnyPreviewError[];
  latestError: AnyPreviewError | null;
  clearErrors: () => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function usePreviewErrorCapture({
  files,
  bundledCode,
  previewUrl,
  userPrompt,
  settings,
  timeoutDuration = 10000,
}: UsePreviewErrorCaptureOptions): UsePreviewErrorCaptureReturn {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [errors, setErrors] = useState<AnyPreviewError[]>([]);
  const [latestError, setLatestError] = useState<AnyPreviewError | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const loadStartTime = useRef<number>(0);

  const context: ErrorContext = {
    generatedFiles: files,
    bundledCode,
    previewUrl,
    userPrompt,
    settings,
  };

  // Subscribe to error monitor
  useEffect(() => {
    const unsubscribe = errorMonitor.onError((error) => {
      setErrors(errorMonitor.getErrors());
      setLatestError(error);
    });

    return unsubscribe;
  }, []);

  // Monitor iframe console
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const setupConsoleCapture = () => {
      try {
        const iframeWindow = iframe.contentWindow;
        if (!iframeWindow) return;

        // Capture console methods
        const originalConsole = {
          log: iframeWindow.console.log,
          warn: iframeWindow.console.warn,
          error: iframeWindow.console.error,
          info: iframeWindow.console.info,
        };

        iframeWindow.console.log = (...args) => {
          errorMonitor.logConsoleOutput('log', args.join(' '), args);
          originalConsole.log.apply(iframeWindow.console, args);
        };

        iframeWindow.console.warn = (...args) => {
          errorMonitor.logConsoleOutput('warn', args.join(' '), args);
          originalConsole.warn.apply(iframeWindow.console, args);
        };

        iframeWindow.console.error = (...args) => {
          errorMonitor.logConsoleOutput('error', args.join(' '), args);
          originalConsole.error.apply(iframeWindow.console, args);
        };

        iframeWindow.console.info = (...args) => {
          errorMonitor.logConsoleOutput('info', args.join(' '), args);
          originalConsole.info.apply(iframeWindow.console, args);
        };

        // Capture unhandled errors
        iframeWindow.addEventListener('error', (event) => {
          const errorDetails = errorMonitor.parseErrorMessage(
            event.message || event.error?.message || 'Unknown error'
          );

          errorMonitor.captureRuntimeError(
            event.message || 'Runtime error in preview',
            bundledCode,
            context,
            {
              stack: event.error?.stack,
              lineNumber: event.lineno || errorDetails.lineNumber,
              columnNumber: event.colno || errorDetails.columnNumber,
              filePath: event.filename || errorDetails.filePath,
              componentName: extractComponentName(event.error?.stack),
            }
          );
        });

        // Capture unhandled promise rejections
        iframeWindow.addEventListener('unhandledrejection', (event) => {
          const errorMessage =
            event.reason?.message || event.reason?.toString() || 'Unhandled promise rejection';

          const errorDetails = errorMonitor.parseErrorMessage(errorMessage);

          errorMonitor.captureRuntimeError(
            errorMessage,
            bundledCode,
            context,
            {
              stack: event.reason?.stack,
              lineNumber: errorDetails.lineNumber,
              filePath: errorDetails.filePath,
            }
          );
        });

        // Monitor resource loading errors
        iframeWindow.addEventListener(
          'error',
          (event: ErrorEvent) => {
            const target = event.target as HTMLElement;
            if (target && target.tagName) {
              const tagName = target.tagName.toLowerCase();
              const url =
                (target as any).src ||
                (target as any).href ||
                'unknown';

              if (tagName === 'script' || tagName === 'link' || tagName === 'img') {
                errorMonitor.captureNetworkError(
                  `Failed to load ${tagName}: ${url}`,
                  bundledCode,
                  context,
                  {
                    failedUrl: url,
                    resourceType: tagName === 'script' ? 'script' : tagName === 'link' ? 'style' : 'image',
                  }
                );
              }
            }
          },
          true
        );
      } catch (err) {
        console.error('[Preview Error Capture] Failed to setup console capture:', err);
      }
    };

    iframe.addEventListener('load', setupConsoleCapture);

    return () => {
      iframe.removeEventListener('load', setupConsoleCapture);
    };
  }, [bundledCode, context]);

  // Monitor preview load timeout
  useEffect(() => {
    if (!previewUrl) return;

    loadStartTime.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      const loadDuration = Date.now() - loadStartTime.current;

      errorMonitor.captureTimeoutError(
        `Preview failed to load within ${timeoutDuration}ms`,
        bundledCode,
        context,
        {
          timeoutDuration: loadDuration,
          timeoutPhase: 'load',
        }
      );
    }, timeoutDuration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [previewUrl, bundledCode, context, timeoutDuration]);

  // Clear timeout when iframe loads successfully
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, []);

  const clearErrors = useCallback(() => {
    errorMonitor.clearErrors();
    setErrors([]);
    setLatestError(null);
  }, []);

  return {
    errors,
    latestError,
    clearErrors,
    iframeRef,
  };
}

// Helper functions

function extractComponentName(stack?: string): string | undefined {
  if (!stack) return undefined;

  // Try to extract React component name from stack trace
  const componentMatch = stack.match(/at\s+(\w+)\s+\(/);
  if (componentMatch) {
    return componentMatch[1];
  }

  return undefined;
}

/**
 * Capture build errors from bundler
 */
export function captureBuildError(
  error: Error,
  bundledCode: string,
  context: ErrorContext
): void {
  const errorDetails = errorMonitor.parseErrorMessage(error.message);

  // Detect unresolved imports
  const unresolvedImports: string[] = [];
  const importMatch = error.message.match(/Could not resolve ["']([^"']+)["']/g);
  if (importMatch) {
    importMatch.forEach((match) => {
      const moduleMatch = match.match(/["']([^"']+)["']/);
      if (moduleMatch) {
        unresolvedImports.push(moduleMatch[1]);
      }
    });
  }

  errorMonitor.captureBuildError(error.message, bundledCode, context, {
    stack: error.stack,
    buildPhase: error.message.includes('resolve')
      ? 'resolution'
      : error.message.includes('transform')
      ? 'transformation'
      : 'bundling',
    unresolvedImports: unresolvedImports.length > 0 ? unresolvedImports : undefined,
    filePath: errorDetails.filePath,
  });
}

/**
 * Capture syntax errors from bundler
 */
export function captureSyntaxError(
  error: Error,
  bundledCode: string,
  context: ErrorContext
): void {
  const errorDetails = errorMonitor.parseErrorMessage(error.message);

  // Determine syntax error type
  let syntaxErrorType: 'jsx' | 'typescript' | 'import' | 'other' = 'other';
  if (error.message.includes('JSX') || error.message.includes('tag')) {
    syntaxErrorType = 'jsx';
  } else if (error.message.includes('type') || error.message.includes('TypeScript')) {
    syntaxErrorType = 'typescript';
  } else if (error.message.includes('import') || error.message.includes('export')) {
    syntaxErrorType = 'import';
  }

  // Extract expected/actual tokens
  const expectedMatch = error.message.match(/expected\s+["']?([^"'\s]+)["']?/i);
  const actualMatch = error.message.match(/but\s+(?:got|found)\s+["']?([^"'\s]+)["']?/i);

  errorMonitor.captureSyntaxError(error.message, bundledCode, context, {
    lineNumber: errorDetails.lineNumber,
    columnNumber: errorDetails.columnNumber,
    filePath: errorDetails.filePath,
    syntaxErrorType,
    expectedToken: expectedMatch?.[1],
    actualToken: actualMatch?.[1],
  });
}

/**
 * Capture timeout during bundling
 */
export function captureBundleTimeout(
  duration: number,
  bundledCode: string,
  context: ErrorContext
): void {
  errorMonitor.captureTimeoutError(
    `Bundling timed out after ${duration}ms`,
    bundledCode,
    context,
    {
      timeoutDuration: duration,
      timeoutPhase: 'bundle',
    }
  );
}

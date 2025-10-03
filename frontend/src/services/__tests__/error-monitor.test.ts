/**
 * Error Monitor Test
 * Demonstrates all 5 error types being captured correctly
 */

import { errorMonitor } from '../error-monitor.service';
import { ErrorContext } from '../error-types';

// Mock context
const mockContext: ErrorContext = {
  generatedFiles: [
    { path: 'App.tsx', content: 'invalid code', language: 'typescript', isNew: true },
  ],
  bundledCode: 'const App = () => {}',
  previewUrl: 'blob:http://localhost:3000/preview-123',
  userPrompt: 'Create a todo app',
  settings: { industry: 'productivity' },
};

describe('Error Monitor Service - Phase 1', () => {
  beforeEach(() => {
    errorMonitor.clearErrors();
  });

  test('1. SYNTAX ERROR - Captures JSX parsing error', () => {
    const error = errorMonitor.captureSyntaxError(
      'Expected closing tag for <div> at line 23:15',
      'const App = () => <div>test',
      mockContext,
      {
        lineNumber: 23,
        columnNumber: 15,
        filePath: 'App.tsx',
        syntaxErrorType: 'jsx',
        expectedToken: '</div>',
        actualToken: 'EOF',
      }
    );

    expect(error.type).toBe('syntax');
    expect(error.message).toContain('closing tag');
    expect(error.lineNumber).toBe(23);
    expect(error.columnNumber).toBe(15);
    expect(error.syntaxErrorType).toBe('jsx');
    expect(error.expectedToken).toBe('</div>');
    console.log('✅ SYNTAX ERROR captured:', error);
  });

  test('2. BUILD ERROR - Captures bundling failure', () => {
    const error = errorMonitor.captureBuildError(
      'Build failed: Could not resolve "react-icons" from App.tsx',
      'const App = () => {}',
      mockContext,
      {
        buildPhase: 'resolution',
        unresolvedImports: ['react-icons'],
        filePath: 'App.tsx',
      }
    );

    expect(error.type).toBe('build');
    expect(error.message).toContain('Could not resolve');
    expect(error.buildPhase).toBe('resolution');
    expect(error.unresolvedImports).toContain('react-icons');
    console.log('✅ BUILD ERROR captured:', error);
  });

  test('3. RUNTIME ERROR - Captures React component crash', () => {
    const error = errorMonitor.captureRuntimeError(
      'TypeError: Cannot read property "map" of undefined',
      'const App = () => {}',
      mockContext,
      {
        stack: 'Error: Cannot read property...\n  at TodoList (App.tsx:45:12)',
        lineNumber: 45,
        columnNumber: 12,
        componentName: 'TodoList',
        reactComponent: 'TodoList',
      }
    );

    expect(error.type).toBe('runtime');
    expect(error.message).toContain('Cannot read property');
    expect(error.componentName).toBe('TodoList');
    expect(error.lineNumber).toBe(45);
    console.log('✅ RUNTIME ERROR captured:', error);
  });

  test('4. NETWORK ERROR - Captures CDN failure', () => {
    const error = errorMonitor.captureNetworkError(
      'Failed to load script: https://cdn.example.com/library.js',
      'const App = () => {}',
      mockContext,
      {
        failedUrl: 'https://cdn.example.com/library.js',
        statusCode: 404,
        resourceType: 'script',
      }
    );

    expect(error.type).toBe('network');
    expect(error.message).toContain('Failed to load');
    expect(error.failedUrl).toBe('https://cdn.example.com/library.js');
    expect(error.statusCode).toBe(404);
    expect(error.resourceType).toBe('script');
    console.log('✅ NETWORK ERROR captured:', error);
  });

  test('5. TIMEOUT ERROR - Captures preview load timeout', () => {
    const error = errorMonitor.captureTimeoutError(
      'Preview failed to load within 10000ms',
      'const App = () => {}',
      mockContext,
      {
        timeoutDuration: 10000,
        timeoutPhase: 'load',
      }
    );

    expect(error.type).toBe('timeout');
    expect(error.message).toContain('failed to load');
    expect(error.timeoutDuration).toBe(10000);
    expect(error.timeoutPhase).toBe('load');
    console.log('✅ TIMEOUT ERROR captured:', error);
  });

  test('Console logs are captured', () => {
    errorMonitor.logConsoleOutput('error', 'Something went wrong!');
    errorMonitor.logConsoleOutput('warn', 'Warning: deprecated API');
    errorMonitor.logConsoleOutput('log', 'Debug info');

    const logs = errorMonitor.getConsoleLogs();
    expect(logs).toHaveLength(3);
    expect(logs[0].type).toBe('error');
    expect(logs[1].type).toBe('warn');
    expect(logs[2].type).toBe('log');
    console.log('✅ CONSOLE LOGS captured:', logs);
  });

  test('Error listeners work correctly', () => {
    const listener = jest.fn();
    const unsubscribe = errorMonitor.onError(listener);

    errorMonitor.captureSyntaxError(
      'Test error',
      'code',
      mockContext,
      { lineNumber: 1 }
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'syntax',
        message: 'Test error',
      })
    );

    unsubscribe();
    errorMonitor.captureSyntaxError(
      'Another error',
      'code',
      mockContext,
      { lineNumber: 2 }
    );

    expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called after unsubscribe
    console.log('✅ ERROR LISTENERS working');
  });

  test('Attempt number tracking works', () => {
    const error1 = errorMonitor.captureSyntaxError(
      'Same error',
      'code',
      mockContext,
      { lineNumber: 1 }
    );

    const error2 = errorMonitor.captureSyntaxError(
      'Same error',
      'code',
      mockContext,
      { lineNumber: 1 }
    );

    const error3 = errorMonitor.captureSyntaxError(
      'Same error',
      'code',
      mockContext,
      { lineNumber: 1 }
    );

    expect(error1.attemptNumber).toBe(1);
    expect(error2.attemptNumber).toBe(2);
    expect(error3.attemptNumber).toBe(3);
    console.log('✅ ATTEMPT TRACKING working');
  });

  test('Error type detection works', () => {
    expect(errorMonitor.detectErrorType('Unexpected token at line 5')).toBe('syntax');
    expect(errorMonitor.detectErrorType('Cannot find module "react"')).toBe('build');
    expect(errorMonitor.detectErrorType('404 Not Found')).toBe('network');
    expect(errorMonitor.detectErrorType('Request timed out')).toBe('timeout');
    expect(errorMonitor.detectErrorType('Cannot read property of null')).toBe('runtime');
    console.log('✅ ERROR TYPE DETECTION working');
  });

  test('Error message parsing works', () => {
    const result1 = errorMonitor.parseErrorMessage(
      'Error at line 23:15 in App.tsx'
    );
    expect(result1.lineNumber).toBe(23);
    expect(result1.columnNumber).toBe(15);
    expect(result1.filePath).toBe('App.tsx');

    const result2 = errorMonitor.parseErrorMessage(
      'Syntax error in components/Dashboard.tsx:42'
    );
    expect(result2.lineNumber).toBe(42);
    expect(result2.filePath).toBe('components/Dashboard.tsx');

    console.log('✅ ERROR PARSING working');
  });
});

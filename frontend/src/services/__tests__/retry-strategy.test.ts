/**
 * Retry Strategy Test
 * Phase 4: Test intelligent retry logic and error pattern detection
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { retryStrategy } from '../retry-strategy.service';
import { errorMonitor } from '../error-monitor.service';
import { errorAnalyzer } from '../error-analyzer.service';
import { ErrorContext } from '../error-types';

const mockContext: ErrorContext = {
  generatedFiles: [
    { path: 'App.tsx', content: 'code', language: 'typescript', isNew: true },
  ],
  bundledCode: 'bundled',
  previewUrl: 'blob:123',
  userPrompt: 'Create app',
  settings: { industry: 'general' },
};

describe('Retry Strategy Service - Phase 4', () => {
  const sessionId = 'test-session-123';

  beforeEach(() => {
    retryStrategy.clearHistory(sessionId);
    errorMonitor.clearErrors();
  });

  test('TEST 1: Standard retry strategy', () => {
    console.log('\n=== TEST 1: STANDARD RETRY ===\n');

    const error = errorMonitor.captureSyntaxError(
      'Syntax error line 5',
      'code',
      mockContext,
      { lineNumber: 5 }
    );

    const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);
    const strategy = retryStrategy.determineStrategy(error, diagnostic, sessionId);

    console.log('Strategy:', strategy);

    expect(strategy.shouldRetry).toBe(true);
    expect(strategy.maxAttempts).toBe(3);
    expect(strategy.nextDelay).toBe(2000); // First retry: 2s
    expect(strategy.reason).toBe('Standard retry strategy');
    console.log('✅ Standard retry strategy applied');
  });

  test('TEST 2: Max attempts reached', () => {
    console.log('\n=== TEST 2: MAX ATTEMPTS ===\n');

    const error = errorMonitor.captureSyntaxError(
      'Syntax error',
      'code',
      mockContext,
      { lineNumber: 5 }
    );
    error.attemptNumber = 3; // Already at max

    const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);
    const strategy = retryStrategy.determineStrategy(error, diagnostic, sessionId);

    console.log('Strategy:', strategy);

    expect(strategy.shouldRetry).toBe(false);
    expect(strategy.reason).toBe('Maximum retry attempts reached');
    console.log('✅ Max attempts check working');
  });

  test('TEST 3: Exponential backoff', () => {
    console.log('\n=== TEST 3: EXPONENTIAL BACKOFF ===\n');

    const errors = [
      { attemptNumber: 1, expectedDelay: 2000 },
      { attemptNumber: 2, expectedDelay: 4000 },
      { attemptNumber: 2, expectedDelay: 4000 }, // Attempt 3 hits max, so delay is 0
    ];

    errors.forEach(({ attemptNumber, expectedDelay }, idx) => {
      const error = errorMonitor.captureSyntaxError(
        'Error',
        'code',
        mockContext,
        { lineNumber: 5 }
      );
      error.attemptNumber = attemptNumber;

      // For last iteration, simulate max attempts
      if (idx === 2) {
        error.attemptNumber = 3;
      }

      const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);
      const strategy = retryStrategy.determineStrategy(error, diagnostic, sessionId);

      console.log(`Attempt ${idx + 1}: Delay = ${strategy.nextDelay}ms (should retry: ${strategy.shouldRetry})`);

      // At max attempts, delay is 0 and shouldn't retry
      if (idx === 2) {
        expect(strategy.nextDelay).toBe(0);
        expect(strategy.shouldRetry).toBe(false);
      } else {
        expect(strategy.nextDelay).toBe(expectedDelay);
      }
    });

    console.log('✅ Exponential backoff working');
  });

  test('TEST 4: Repeating error detection', () => {
    console.log('\n=== TEST 4: REPEATING ERROR ===\n');

    // First error
    const error1 = errorMonitor.captureSyntaxError(
      'Cannot find module "react"',
      'code',
      mockContext,
      { lineNumber: 1 }
    );
    const diagnostic1 = errorAnalyzer.analyze(error1, mockContext.generatedFiles);
    retryStrategy.recordAttempt(sessionId, error1, diagnostic1, 'Fix 1', false);

    // Same error again
    const error2 = errorMonitor.captureSyntaxError(
      'Cannot find module "react"',
      'code',
      mockContext,
      { lineNumber: 1 }
    );
    error2.attemptNumber = 2;

    const diagnostic2 = errorAnalyzer.analyze(error2, mockContext.generatedFiles);
    const strategy = retryStrategy.determineStrategy(error2, diagnostic2, sessionId);

    console.log('Strategy:', strategy);

    expect(strategy.shouldRetry).toBe(true);
    expect(strategy.reason).toContain('Repeating error');
    expect(strategy.changeStrategy).toBeTruthy();
    console.log('✅ Repeating error detected');
  });

  test('TEST 5: Oscillating error detection', () => {
    console.log('\n=== TEST 5: OSCILLATING ERROR ===\n');

    // Error A
    const errorA1 = errorMonitor.captureSyntaxError(
      'Syntax error',
      'code',
      mockContext,
      { lineNumber: 1 }
    );
    const diagA1 = errorAnalyzer.analyze(errorA1, mockContext.generatedFiles);
    retryStrategy.recordAttempt(sessionId, errorA1, diagA1, 'Fix A', false);

    // Error B (different)
    const errorB = errorMonitor.captureRuntimeError(
      'Runtime error',
      'code',
      mockContext,
      { lineNumber: 2, stack: 'stack' }
    );
    errorB.attemptNumber = 2;
    const diagB = errorAnalyzer.analyze(errorB, mockContext.generatedFiles);
    retryStrategy.recordAttempt(sessionId, errorB, diagB, 'Fix B', false);

    // Error A again (oscillating)
    const errorA2 = errorMonitor.captureSyntaxError(
      'Syntax error',
      'code',
      mockContext,
      { lineNumber: 1 }
    );
    errorA2.attemptNumber = 2; // Use attempt 2, not 3 (to avoid max attempts check)
    const diagA2 = errorAnalyzer.analyze(errorA2, mockContext.generatedFiles);

    const strategy = retryStrategy.determineStrategy(errorA2, diagA2, sessionId);

    console.log('Strategy:', strategy);

    expect(strategy.shouldRetry).toBe(false);
    expect(strategy.reason).toContain('Oscillating');
    console.log('✅ Oscillating error detected');
  });

  test('TEST 6: Record and retrieve history', () => {
    console.log('\n=== TEST 6: HISTORY TRACKING ===\n');

    // Record multiple attempts
    for (let i = 1; i <= 3; i++) {
      const error = errorMonitor.captureSyntaxError(
        `Error ${i}`,
        'code',
        mockContext,
        { lineNumber: i }
      );
      error.attemptNumber = i;
      const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);
      retryStrategy.recordAttempt(sessionId, error, diagnostic, `Fix ${i}`, i === 3);
    }

    const history = retryStrategy.getHistory(sessionId);
    console.log('History entries:', history.length);

    expect(history).toHaveLength(3);
    expect(history[0].attemptNumber).toBe(1);
    expect(history[2].success).toBe(true);
    console.log('✅ History tracking working');
  });

  test('TEST 7: Statistics calculation', () => {
    console.log('\n=== TEST 7: STATISTICS ===\n');

    // Record 5 attempts: 3 successes, 2 failures
    const results = [false, true, false, true, true];

    results.forEach((success, idx) => {
      const error = errorMonitor.captureSyntaxError(
        `Error ${idx}`,
        'code',
        mockContext,
        { lineNumber: idx }
      );
      error.attemptNumber = idx + 1;
      const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);
      retryStrategy.recordAttempt(sessionId, error, diagnostic, `Fix ${idx}`, success);
    });

    const stats = retryStrategy.getStatistics(sessionId);

    console.log('Statistics:', stats);

    expect(stats.totalAttempts).toBe(5);
    expect(stats.successfulFixes).toBe(3);
    expect(stats.failedFixes).toBe(2);
    expect(stats.successRate).toBe(60);
    console.log('✅ Statistics calculation working');
  });

  test('TEST 8: Pattern analysis', () => {
    console.log('\n=== TEST 8: PATTERN ANALYSIS ===\n');

    // Create repeating pattern
    const errors = [
      errorMonitor.captureSyntaxError('Error A', 'code', mockContext, { lineNumber: 1 }),
      errorMonitor.captureSyntaxError('Error A', 'code', mockContext, { lineNumber: 1 }),
      errorMonitor.captureSyntaxError('Error A', 'code', mockContext, { lineNumber: 1 }),
    ];

    errors.forEach((error, idx) => {
      error.attemptNumber = idx + 1;
      const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);
      retryStrategy.recordAttempt(sessionId, error, diagnostic, `Fix ${idx}`, false);
    });

    const analysis = retryStrategy.analyzePatterns(sessionId);

    console.log('Pattern Analysis:', analysis);

    expect(analysis.mostCommonError).toBe('syntax');
    expect(analysis.mostCommonCategory).toBe('SYNTAX_ERROR'); // Actually SYNTAX_ERROR not JSX_ERROR
    expect(analysis.patterns.length).toBeGreaterThan(0);
    console.log('Detected patterns:', analysis.patterns);
    console.log('✅ Pattern analysis working');
  });

  test('TEST 9: Low confidence strategy', () => {
    console.log('\n=== TEST 9: LOW CONFIDENCE ===\n');

    const error = errorMonitor.captureSyntaxError(
      'Unknown error',
      'code',
      mockContext,
      { lineNumber: 1 }
    );
    const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);

    // Manually set low confidence
    diagnostic.confidence = 45;

    const strategy = retryStrategy.determineStrategy(error, diagnostic, sessionId);

    console.log('Strategy:', strategy);

    // Low confidence should limit retries
    expect(strategy.shouldRetry).toBe(true); // First attempt
    expect(strategy.changeStrategy).toBeTruthy();
    console.log('✅ Low confidence handling working');
  });

  test('TEST 10: Minor error strategy', () => {
    console.log('\n=== TEST 10: MINOR ERROR ===\n');

    const error = errorMonitor.captureNetworkError(
      'Failed to load resource',
      'code',
      mockContext,
      { failedUrl: 'http://example.com' }
    );
    const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);

    expect(diagnostic.severity).toBe('minor');

    const strategy = retryStrategy.determineStrategy(error, diagnostic, sessionId);

    console.log('Strategy:', strategy);

    expect(strategy.maxAttempts).toBe(2); // Fewer attempts for minor errors
    expect(strategy.reason).toContain('Minor error');
    console.log('✅ Minor error strategy working');
  });
});

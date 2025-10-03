/**
 * Retry Strategy Service
 * Phase 4: Intelligent retry logic with exponential backoff and error pattern detection
 */

import { AnyPreviewError } from './error-types';
import { DiagnosticReport } from '../types/diagnostics.types';

export interface RetryStrategy {
  maxAttempts: number;
  shouldRetry: boolean;
  nextDelay: number;
  reason: string;
  changeStrategy?: string; // Suggest a different approach
}

export interface RetryHistory {
  attemptNumber: number;
  timestamp: number;
  error: AnyPreviewError;
  diagnostic: DiagnosticReport;
  fixApplied: string;
  success: boolean;
}

export class RetryStrategyService {
  private retryHistory: Map<string, RetryHistory[]> = new Map();

  /**
   * Determine retry strategy based on error history
   */
  determineStrategy(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport,
    sessionId: string
  ): RetryStrategy {
    const history = this.getHistory(sessionId);
    const attemptNumber = error.attemptNumber;
    const maxAttempts = 3;

    // Check if max attempts reached
    if (attemptNumber >= maxAttempts) {
      return {
        maxAttempts,
        shouldRetry: false,
        nextDelay: 0,
        reason: 'Maximum retry attempts reached',
      };
    }

    // Check for repeating errors (same error twice in a row)
    if (this.isRepeatingError(history, error)) {
      return {
        maxAttempts,
        shouldRetry: true,
        nextDelay: this.calculateBackoff(attemptNumber),
        reason: 'Repeating error detected - trying different approach',
        changeStrategy: 'Use simpler implementation, avoid complex patterns',
      };
    }

    // Check for oscillating errors (A -> B -> A pattern)
    if (this.isOscillatingError(history, error)) {
      return {
        maxAttempts,
        shouldRetry: false,
        nextDelay: 0,
        reason: 'Oscillating errors detected - manual intervention required',
      };
    }

    // Check error severity
    if (diagnostic.severity === 'minor') {
      return {
        maxAttempts: 2, // Fewer retries for minor errors
        shouldRetry: attemptNumber < 2,
        nextDelay: this.calculateBackoff(attemptNumber),
        reason: 'Minor error - limited retry attempts',
      };
    }

    // Check confidence score
    if (diagnostic.confidence < 60) {
      return {
        maxAttempts,
        shouldRetry: attemptNumber < 2, // Only 2 attempts for low confidence
        nextDelay: this.calculateBackoff(attemptNumber),
        reason: 'Low confidence diagnosis - limiting retries',
        changeStrategy: 'Consider full regeneration instead of targeted fix',
      };
    }

    // Default retry strategy
    return {
      maxAttempts,
      shouldRetry: attemptNumber < maxAttempts,
      nextDelay: this.calculateBackoff(attemptNumber),
      reason: 'Standard retry strategy',
    };
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attemptNumber: number): number {
    // Exponential backoff: 2s, 4s, 8s
    return Math.min(2000 * Math.pow(2, attemptNumber - 1), 8000);
  }

  /**
   * Check if error is repeating (same error type and message)
   */
  private isRepeatingError(history: RetryHistory[], error: AnyPreviewError): boolean {
    if (history.length === 0) return false;

    const lastAttempt = history[history.length - 1];
    return (
      lastAttempt.error.type === error.type &&
      this.isSimilarMessage(lastAttempt.error.message, error.message)
    );
  }

  /**
   * Check if errors are oscillating (A -> B -> A pattern)
   */
  private isOscillatingError(history: RetryHistory[], error: AnyPreviewError): boolean {
    if (history.length < 2) return false;

    const lastTwo = history.slice(-2);
    const firstError = lastTwo[0].error;
    const secondError = lastTwo[1].error;

    // Check if current error matches first error but not second
    return (
      firstError.type === error.type &&
      this.isSimilarMessage(firstError.message, error.message) &&
      secondError.type !== error.type
    );
  }

  /**
   * Check if two error messages are similar
   */
  private isSimilarMessage(msg1: string, msg2: string): boolean {
    // Normalize messages (lowercase, remove line numbers)
    const normalize = (msg: string) =>
      msg
        .toLowerCase()
        .replace(/line \d+/g, 'line X')
        .replace(/:\d+/g, ':X')
        .replace(/\d+/g, 'N');

    return normalize(msg1) === normalize(msg2);
  }

  /**
   * Record retry attempt
   */
  recordAttempt(
    sessionId: string,
    error: AnyPreviewError,
    diagnostic: DiagnosticReport,
    fixApplied: string,
    success: boolean
  ): void {
    if (!this.retryHistory.has(sessionId)) {
      this.retryHistory.set(sessionId, []);
    }

    const history = this.retryHistory.get(sessionId)!;
    history.push({
      attemptNumber: error.attemptNumber,
      timestamp: Date.now(),
      error,
      diagnostic,
      fixApplied,
      success,
    });

    // Keep only last 10 attempts
    if (history.length > 10) {
      history.shift();
    }
  }

  /**
   * Get retry history for a session
   */
  getHistory(sessionId: string): RetryHistory[] {
    return this.retryHistory.get(sessionId) || [];
  }

  /**
   * Clear history for a session
   */
  clearHistory(sessionId: string): void {
    this.retryHistory.delete(sessionId);
  }

  /**
   * Get retry statistics
   */
  getStatistics(sessionId: string): {
    totalAttempts: number;
    successfulFixes: number;
    failedFixes: number;
    successRate: number;
    averageAttemptsToFix: number;
  } {
    const history = this.getHistory(sessionId);

    if (history.length === 0) {
      return {
        totalAttempts: 0,
        successfulFixes: 0,
        failedFixes: 0,
        successRate: 0,
        averageAttemptsToFix: 0,
      };
    }

    const successful = history.filter((h) => h.success).length;
    const failed = history.length - successful;

    return {
      totalAttempts: history.length,
      successfulFixes: successful,
      failedFixes: failed,
      successRate: (successful / history.length) * 100,
      averageAttemptsToFix: successful > 0 ? history.length / successful : 0,
    };
  }

  /**
   * Analyze error patterns across history
   */
  analyzePatterns(sessionId: string): {
    mostCommonError: string;
    mostCommonCategory: string;
    averageConfidence: number;
    patterns: string[];
  } {
    const history = this.getHistory(sessionId);

    if (history.length === 0) {
      return {
        mostCommonError: 'None',
        mostCommonCategory: 'None',
        averageConfidence: 0,
        patterns: [],
      };
    }

    // Count error types
    const errorCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    let totalConfidence = 0;

    history.forEach((h) => {
      const errorType = h.error.type;
      const category = h.diagnostic.errorCategory;

      errorCounts.set(errorType, (errorCounts.get(errorType) || 0) + 1);
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      totalConfidence += h.diagnostic.confidence;
    });

    // Find most common
    const mostCommonError = Array.from(errorCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
    const mostCommonCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Detect patterns
    const patterns: string[] = [];

    if (this.hasRepeatingPattern(history)) {
      patterns.push('Repeating errors detected');
    }

    if (this.hasOscillatingPattern(history)) {
      patterns.push('Oscillating errors detected');
    }

    if (this.hasProgressiveImprovement(history)) {
      patterns.push('Progressive improvement - errors becoming less severe');
    }

    if (this.hasStuckPattern(history)) {
      patterns.push('Stuck on same error - need different approach');
    }

    return {
      mostCommonError,
      mostCommonCategory,
      averageConfidence: totalConfidence / history.length,
      patterns,
    };
  }

  /**
   * Check for repeating error pattern in history
   */
  private hasRepeatingPattern(history: RetryHistory[]): boolean {
    if (history.length < 3) return false;

    const last3 = history.slice(-3);
    const messages = last3.map((h) => h.error.message);

    return this.isSimilarMessage(messages[0], messages[1]) || this.isSimilarMessage(messages[1], messages[2]);
  }

  /**
   * Check for oscillating pattern in history
   */
  private hasOscillatingPattern(history: RetryHistory[]): boolean {
    if (history.length < 3) return false;

    const last3 = history.slice(-3);
    return (
      last3[0].error.type === last3[2].error.type &&
      last3[0].error.type !== last3[1].error.type
    );
  }

  /**
   * Check if errors are progressively improving
   */
  private hasProgressiveImprovement(history: RetryHistory[]): boolean {
    if (history.length < 3) return false;

    const severityScore = (severity: string) => {
      switch (severity) {
        case 'critical': return 3;
        case 'major': return 2;
        case 'minor': return 1;
        default: return 0;
      }
    };

    const last3 = history.slice(-3);
    const scores = last3.map((h) => severityScore(h.diagnostic.severity));

    // Check if severity is decreasing
    return scores[0] > scores[1] && scores[1] >= scores[2];
  }

  /**
   * Check if stuck on same error
   */
  private hasStuckPattern(history: RetryHistory[]): boolean {
    if (history.length < 2) return false;

    const last2 = history.slice(-2);
    return (
      last2[0].error.type === last2[1].error.type &&
      this.isSimilarMessage(last2[0].error.message, last2[1].error.message) &&
      !last2[0].success &&
      !last2[1].success
    );
  }
}

export const retryStrategy = new RetryStrategyService();

/**
 * Context Preservation Service
 * Phase 4: Preserves user intent and working code across retry attempts
 */

import { AnyPreviewError } from './error-types';
import { DiagnosticReport } from '../types/diagnostics.types';

export interface PreservationContext {
  sessionId: string;
  originalPrompt: string;
  userIntent: string; // Extracted key intent
  workingFiles: Array<{
    path: string;
    content: string;
    reason: string; // Why this file is working
  }>;
  failedFiles: Array<{
    path: string;
    content: string;
    errors: string[]; // What errors occurred
  }>;
  requirements: string[]; // Key requirements from prompt
  designDecisions: string[]; // Design decisions to preserve
  timestamp: number;
}

export class ContextPreservationService {
  private contexts: Map<string, PreservationContext> = new Map();

  /**
   * Create preservation context from initial generation
   */
  createContext(
    sessionId: string,
    originalPrompt: string,
    generatedFiles: any[]
  ): PreservationContext {
    const context: PreservationContext = {
      sessionId,
      originalPrompt,
      userIntent: this.extractIntent(originalPrompt),
      workingFiles: generatedFiles.map((file) => ({
        path: file.path,
        content: file.content,
        reason: 'Initial generation',
      })),
      failedFiles: [],
      requirements: this.extractRequirements(originalPrompt),
      designDecisions: this.extractDesignDecisions(generatedFiles),
      timestamp: Date.now(),
    };

    this.contexts.set(sessionId, context);
    return context;
  }

  /**
   * Update context after error occurs
   */
  updateContextWithError(
    sessionId: string,
    error: AnyPreviewError,
    diagnostic: DiagnosticReport,
    generatedFiles: any[]
  ): PreservationContext {
    const context = this.contexts.get(sessionId);
    if (!context) {
      throw new Error(`Context not found for session: ${sessionId}`);
    }

    // Move failed files from working to failed
    const failedPaths = diagnostic.failedFiles;
    const workingPaths = diagnostic.retainedFiles;

    context.failedFiles = generatedFiles
      .filter((f) => failedPaths.includes(f.path))
      .map((f) => ({
        path: f.path,
        content: f.content,
        errors: [error.message],
      }));

    context.workingFiles = generatedFiles
      .filter((f) => workingPaths.includes(f.path))
      .map((f) => ({
        path: f.path,
        content: f.content,
        reason: 'No errors detected',
      }));

    context.timestamp = Date.now();
    this.contexts.set(sessionId, context);

    return context;
  }

  /**
   * Update context after successful fix
   */
  updateContextWithFix(
    sessionId: string,
    fixedFiles: any[],
    fixDescription: string
  ): PreservationContext {
    const context = this.contexts.get(sessionId);
    if (!context) {
      throw new Error(`Context not found for session: ${sessionId}`);
    }

    // Merge fixed files back into working files
    fixedFiles.forEach((fixedFile) => {
      // Remove from failed files
      context.failedFiles = context.failedFiles.filter((f) => f.path !== fixedFile.path);

      // Add to working files
      const existingIndex = context.workingFiles.findIndex((f) => f.path === fixedFile.path);
      if (existingIndex >= 0) {
        context.workingFiles[existingIndex] = {
          path: fixedFile.path,
          content: fixedFile.content,
          reason: `Fixed: ${fixDescription}`,
        };
      } else {
        context.workingFiles.push({
          path: fixedFile.path,
          content: fixedFile.content,
          reason: `Fixed: ${fixDescription}`,
        });
      }
    });

    context.timestamp = Date.now();
    this.contexts.set(sessionId, context);

    return context;
  }

  /**
   * Get preservation context
   */
  getContext(sessionId: string): PreservationContext | undefined {
    return this.contexts.get(sessionId);
  }

  /**
   * Generate context-aware prompt for retry
   */
  generateContextAwarePrompt(
    sessionId: string,
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): string {
    const context = this.contexts.get(sessionId);
    if (!context) {
      return ''; // Return empty if no context
    }

    let prompt = `CONTEXT PRESERVATION - Retry Attempt\n\n`;

    // User intent
    prompt += `USER INTENT:\n${context.userIntent}\n\n`;

    // Requirements
    if (context.requirements.length > 0) {
      prompt += `KEY REQUIREMENTS:\n`;
      context.requirements.forEach((req, idx) => {
        prompt += `${idx + 1}. ${req}\n`;
      });
      prompt += `\n`;
    }

    // Design decisions to preserve
    if (context.designDecisions.length > 0) {
      prompt += `DESIGN DECISIONS TO PRESERVE:\n`;
      context.designDecisions.forEach((decision, idx) => {
        prompt += `${idx + 1}. ${decision}\n`;
      });
      prompt += `\n`;
    }

    // Working files
    if (context.workingFiles.length > 0) {
      prompt += `WORKING FILES (DO NOT MODIFY):\n`;
      context.workingFiles.forEach((file) => {
        prompt += `- ${file.path} (${file.reason})\n`;
      });
      prompt += `\n`;
    }

    // Failed files
    if (context.failedFiles.length > 0) {
      prompt += `FAILED FILES (REGENERATE THESE):\n`;
      context.failedFiles.forEach((file) => {
        prompt += `- ${file.path}\n`;
        file.errors.forEach((err) => {
          prompt += `  Error: ${err}\n`;
        });
      });
      prompt += `\n`;
    }

    prompt += `IMPORTANT: Maintain the same functionality and design. Only fix the specific errors.`;

    return prompt;
  }

  /**
   * Extract user intent from prompt
   */
  private extractIntent(prompt: string): string {
    // Remove implementation details, focus on high-level intent
    const sentences = prompt.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);

    // Take first 2 sentences or first 100 chars
    const intent = sentences.slice(0, 2).join('. ');
    return intent.length > 100 ? intent.substring(0, 100) + '...' : intent;
  }

  /**
   * Extract requirements from prompt
   */
  private extractRequirements(prompt: string): string[] {
    const requirements: string[] = [];

    // Look for common requirement patterns
    const patterns = [
      /\b(?:must|should|need to|has to|required to)\s+([^.,!?]+)/gi,
      /\b(?:with|include|feature|functionality|capability)\s+([^.,!?]+)/gi,
      /\b(?:allow|enable|support)\s+([^.,!?]+)/gi,
    ];

    patterns.forEach((pattern) => {
      const matches = prompt.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          requirements.push(match[1].trim());
        }
      }
    });

    // Deduplicate and limit to 5
    return [...new Set(requirements)].slice(0, 5);
  }

  /**
   * Extract design decisions from generated files
   */
  private extractDesignDecisions(files: any[]): string[] {
    const decisions: string[] = [];

    // Analyze file structure
    const hasComponents = files.some((f) => f.path.includes('components/'));
    const hasUtils = files.some((f) => f.path.includes('utils/') || f.path.includes('lib/'));
    const hasTypes = files.some((f) => f.path.includes('types/'));
    const hasStyles = files.some((f) => f.path.endsWith('.css'));

    if (hasComponents) {
      decisions.push('Component-based architecture');
    }

    if (hasUtils) {
      decisions.push('Utility functions separated into dedicated files');
    }

    if (hasTypes) {
      decisions.push('TypeScript type definitions');
    }

    if (hasStyles) {
      decisions.push('Separate CSS files for styling');
    }

    // Analyze imports across files
    const allContent = files.map((f) => f.content).join('\n');

    if (allContent.includes('useState') || allContent.includes('useEffect')) {
      decisions.push('React hooks for state management');
    }

    if (allContent.includes('Tailwind')) {
      decisions.push('Tailwind CSS for styling');
    }

    if (allContent.includes('interface ') || allContent.includes('type ')) {
      decisions.push('TypeScript type safety');
    }

    return decisions;
  }

  /**
   * Clear context for a session
   */
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  /**
   * Get all session IDs
   */
  getAllSessions(): string[] {
    return Array.from(this.contexts.keys());
  }

  /**
   * Get context summary
   */
  getContextSummary(sessionId: string): {
    hasContext: boolean;
    workingFilesCount: number;
    failedFilesCount: number;
    requirementsCount: number;
    designDecisionsCount: number;
    age: number; // milliseconds since creation
  } {
    const context = this.contexts.get(sessionId);

    if (!context) {
      return {
        hasContext: false,
        workingFilesCount: 0,
        failedFilesCount: 0,
        requirementsCount: 0,
        designDecisionsCount: 0,
        age: 0,
      };
    }

    return {
      hasContext: true,
      workingFilesCount: context.workingFiles.length,
      failedFilesCount: context.failedFiles.length,
      requirementsCount: context.requirements.length,
      designDecisionsCount: context.designDecisions.length,
      age: Date.now() - context.timestamp,
    };
  }
}

export const contextPreservation = new ContextPreservationService();

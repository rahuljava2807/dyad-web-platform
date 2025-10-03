/**
 * Diagnostic Types for Error Analysis
 * Phase 2: Error Analysis & Diagnosis Engine
 */

export type ErrorCategory =
  | 'SYNTAX_ERROR'
  | 'BUILD_ERROR'
  | 'RUNTIME_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'IMPORT_ERROR'
  | 'TYPE_ERROR'
  | 'JSX_ERROR'
  | 'DEPENDENCY_ERROR';

export type SeverityLevel = 'critical' | 'major' | 'minor';

export interface Issue {
  type: string;
  severity: SeverityLevel;
  description: string;
  location?: {
    file: string;
    line?: number;
    column?: number;
  };
  codeSnippet?: string;
  affectedCode?: string;
}

export interface FixSuggestion {
  type: 'add' | 'remove' | 'modify' | 'replace';
  description: string;
  target: string;              // What to fix (e.g., "import statement", "JSX tag")
  example?: string;            // Example of correct code
  automated: boolean;          // Can this be auto-fixed?
}

export interface DiagnosticReport {
  // Summary
  summary: string;              // "SignUpForm.tsx has syntax error"
  errorCategory: ErrorCategory; // "SYNTAX_ERROR"
  severity: SeverityLevel;      // "critical"

  // Root cause
  rootCause: string;            // Detailed explanation of what went wrong
  rootCauseType: string;        // "Missing closing tag"

  // Affected code
  failedFiles: string[];        // ["SignUpForm.tsx"]
  affectedCode: string;         // "line 23-25 in SignUpForm.tsx"
  codeContext: string;          // Code snippet with surrounding lines

  // Issues
  specificIssues: Issue[];      // Detailed list of problems

  // Fixes
  suggestedFixes: FixSuggestion[];  // What to do to fix it
  codeToRegenerate: string[];       // Which files need regeneration
  retainedFiles: string[];          // Which files were okay

  // Metadata
  confidence: number;           // 0-100, how confident we are in the diagnosis
  timestamp: number;
  errorId: string;              // Reference to original PreviewError
}

export interface RootCauseAnalysis {
  primaryCause: string;
  secondaryCauses: string[];
  pattern: string;              // Common error pattern (e.g., "missing-import")
  commonSolutions: string[];    // Known solutions for this pattern
}

export interface CodeContext {
  file: string;
  startLine: number;
  endLine: number;
  content: string;
  highlightLine?: number;
  errorMarker?: {
    line: number;
    column: number;
    length: number;
  };
}

/**
 * Fix Suggestions Service
 * Phase 2: Generates actionable fix suggestions based on error analysis
 */

import { DiagnosticReport, FixSuggestion, ErrorCategory } from '../types/diagnostics.types';
import { AnyPreviewError } from './error-types';

export class FixSuggestionsService {
  /**
   * Generate fix suggestions for a diagnostic report
   */
  static generateSuggestions(
    diagnostic: DiagnosticReport,
    error: AnyPreviewError
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    // Generate suggestions based on error category
    switch (diagnostic.errorCategory) {
      case 'JSX_ERROR':
        suggestions.push(...this.getJSXFixSuggestions(error, diagnostic));
        break;

      case 'SYNTAX_ERROR':
        suggestions.push(...this.getSyntaxFixSuggestions(error, diagnostic));
        break;

      case 'IMPORT_ERROR':
      case 'DEPENDENCY_ERROR':
        suggestions.push(...this.getImportFixSuggestions(error, diagnostic));
        break;

      case 'BUILD_ERROR':
        suggestions.push(...this.getBuildFixSuggestions(error, diagnostic));
        break;

      case 'RUNTIME_ERROR':
        suggestions.push(...this.getRuntimeFixSuggestions(error, diagnostic));
        break;

      case 'NETWORK_ERROR':
        suggestions.push(...this.getNetworkFixSuggestions(error, diagnostic));
        break;

      case 'TIMEOUT_ERROR':
        suggestions.push(...this.getTimeoutFixSuggestions(error, diagnostic));
        break;

      case 'TYPE_ERROR':
        suggestions.push(...this.getTypeFixSuggestions(error, diagnostic));
        break;
    }

    // Add general suggestions if none specific
    if (suggestions.length === 0) {
      suggestions.push(...this.getGeneralFixSuggestions(error, diagnostic));
    }

    return suggestions;
  }

  /**
   * JSX-specific fix suggestions
   */
  private static getJSXFixSuggestions(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    if (diagnostic.rootCauseType === 'unclosed-tag') {
      const tagMatch = error.message.match(/<(\w+)/);
      const tagName = tagMatch ? tagMatch[1] : 'element';

      suggestions.push({
        type: 'add',
        description: `Add closing tag for <${tagName}>`,
        target: `JSX closing tag at line ${error.lineNumber}`,
        example: `<${tagName}>content</${tagName}>  // or  <${tagName} />`,
        automated: true,
      });
    }

    if (error.message.toLowerCase().includes('fragment')) {
      suggestions.push({
        type: 'add',
        description: 'Wrap multiple elements in a React Fragment',
        target: 'JSX elements',
        example: `<>\n  <div>Element 1</div>\n  <div>Element 2</div>\n</>`,
        automated: true,
      });
    }

    if (error.message.toLowerCase().includes('className')) {
      suggestions.push({
        type: 'modify',
        description: 'Ensure className values are strings',
        target: 'className attribute',
        example: `className="my-class"  // not className={variable}`,
        automated: true,
      });
    }

    return suggestions;
  }

  /**
   * General syntax fix suggestions
   */
  private static getSyntaxFixSuggestions(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    if (error.message.toLowerCase().includes('unexpected token')) {
      suggestions.push({
        type: 'modify',
        description: 'Fix unexpected syntax token',
        target: `Code at line ${error.lineNumber}`,
        example: 'Check for missing brackets, parentheses, or quotes',
        automated: false,
      });
    }

    if (error.message.toLowerCase().includes('semicolon')) {
      suggestions.push({
        type: 'add',
        description: 'Add missing semicolon',
        target: `Line ${error.lineNumber}`,
        automated: true,
      });
    }

    return suggestions;
  }

  /**
   * Import/dependency fix suggestions
   */
  private static getImportFixSuggestions(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    // Extract module name from error
    const moduleMatch = error.message.match(/["']([^"']+)["']/);
    const moduleName = moduleMatch ? moduleMatch[1] : 'module';

    if (diagnostic.rootCauseType === 'unresolved-import') {
      suggestions.push({
        type: 'remove',
        description: `Remove unavailable import "${moduleName}"`,
        target: 'Import statement',
        example: `// Remove: import { Component } from '${moduleName}'`,
        automated: true,
      });

      // Suggest alternative if it's a common library
      const alternatives = this.getImportAlternatives(moduleName);
      if (alternatives.length > 0) {
        suggestions.push({
          type: 'replace',
          description: `Replace "${moduleName}" with available alternative`,
          target: 'Import statement',
          example: `import { Component } from '${alternatives[0]}'`,
          automated: true,
        });
      }
    }

    if (error.message.toLowerCase().includes('default export')) {
      suggestions.push({
        type: 'modify',
        description: 'Change to named import or add default export',
        target: 'Import statement',
        example: `import Component from 'module'  // or  import { Component } from 'module'`,
        automated: true,
      });
    }

    return suggestions;
  }

  /**
   * Build error fix suggestions
   */
  private static getBuildFixSuggestions(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    if (error.message.toLowerCase().includes('transform')) {
      suggestions.push({
        type: 'modify',
        description: 'Simplify code to use standard syntax',
        target: 'Complex TypeScript features',
        example: 'Avoid advanced TypeScript features that may not transform correctly',
        automated: false,
      });
    }

    suggestions.push({
      type: 'replace',
      description: 'Regenerate the problematic file with simpler implementation',
      target: diagnostic.failedFiles.join(', '),
      automated: true,
    });

    return suggestions;
  }

  /**
   * Runtime error fix suggestions
   */
  private static getRuntimeFixSuggestions(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    if (diagnostic.rootCauseType === 'null-reference') {
      suggestions.push({
        type: 'add',
        description: 'Add null/undefined check before accessing property',
        target: `Code at line ${error.lineNumber}`,
        example: `if (variable) { variable.property }  // or  variable?.property`,
        automated: true,
      });
    }

    if (diagnostic.rootCauseType === 'hooks-error') {
      suggestions.push({
        type: 'modify',
        description: 'Fix React hooks usage',
        target: 'Hook calls',
        example: 'Ensure hooks are called at top level and not conditionally',
        automated: false,
      });
    }

    if (diagnostic.rootCauseType === 'invalid-element') {
      suggestions.push({
        type: 'modify',
        description: 'Fix component import/export',
        target: error.componentName || 'Component',
        example: `export default function ${error.componentName || 'Component'}() { ... }`,
        automated: true,
      });
    }

    if (error.message.toLowerCase().includes('map')) {
      suggestions.push({
        type: 'add',
        description: 'Initialize array before using .map()',
        target: 'Array variable',
        example: `const items = data || [];  // Then: items.map(...)`,
        automated: true,
      });
    }

    return suggestions;
  }

  /**
   * Network error fix suggestions
   */
  private static getNetworkFixSuggestions(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    suggestions.push({
      type: 'remove',
      description: 'Remove dependency on external resource',
      target: 'CDN link or fetch call',
      example: 'Use bundled libraries instead of CDN',
      automated: true,
    });

    suggestions.push({
      type: 'replace',
      description: 'Use alternative CDN or bundle resource',
      target: 'Resource URL',
      automated: false,
    });

    return suggestions;
  }

  /**
   * Timeout error fix suggestions
   */
  private static getTimeoutFixSuggestions(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    suggestions.push({
      type: 'modify',
      description: 'Simplify component logic to reduce complexity',
      target: diagnostic.failedFiles.join(', '),
      example: 'Remove heavy computations, reduce component nesting',
      automated: true,
    });

    suggestions.push({
      type: 'remove',
      description: 'Remove animations or complex effects',
      target: 'Framer Motion or heavy libraries',
      automated: true,
    });

    return suggestions;
  }

  /**
   * TypeScript error fix suggestions
   */
  private static getTypeFixSuggestions(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    suggestions.push({
      type: 'add',
      description: 'Add proper TypeScript type definitions',
      target: `Code at line ${error.lineNumber}`,
      example: `const value: string = "hello"  // or use type inference`,
      automated: true,
    });

    suggestions.push({
      type: 'modify',
      description: 'Use type assertion if needed',
      target: 'Type mismatch',
      example: `value as SomeType  // or  <SomeType>value`,
      automated: false,
    });

    return suggestions;
  }

  /**
   * General fix suggestions
   */
  private static getGeneralFixSuggestions(
    error: AnyPreviewError,
    diagnostic: DiagnosticReport
  ): FixSuggestion[] {
    return [
      {
        type: 'replace',
        description: 'Regenerate the entire application with corrected prompt',
        target: 'All files',
        automated: true,
      },
      {
        type: 'modify',
        description: 'Review and manually fix the error',
        target: diagnostic.failedFiles.join(', '),
        automated: false,
      },
    ];
  }

  /**
   * Get import alternatives for common libraries
   */
  private static getImportAlternatives(moduleName: string): string[] {
    const alternatives: Record<string, string[]> = {
      'react-icons': ['lucide-react'],
      '@heroicons/react': ['lucide-react'],
      'styled-components': [],
      '@emotion/react': [],
      'lodash': [],
      'moment': ['date-fns'],
      'axios': ['fetch'],
    };

    for (const [key, alts] of Object.entries(alternatives)) {
      if (moduleName.includes(key)) {
        return alts;
      }
    }

    return [];
  }

  /**
   * Create human-readable fix description
   */
  static createFixDescription(suggestions: FixSuggestion[]): string {
    if (suggestions.length === 0) {
      return 'No specific fixes available. Please review the error and regenerate.';
    }

    const automated = suggestions.filter((s) => s.automated);
    const manual = suggestions.filter((s) => !s.automated);

    let description = '';

    if (automated.length > 0) {
      description += `Automated fixes available:\n`;
      automated.forEach((s, idx) => {
        description += `${idx + 1}. ${s.description}\n`;
      });
    }

    if (manual.length > 0) {
      description += `\nManual fixes required:\n`;
      manual.forEach((s, idx) => {
        description += `${idx + 1}. ${s.description}\n`;
      });
    }

    return description.trim();
  }
}

export const fixSuggestions = FixSuggestionsService;

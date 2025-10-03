/**
 * Error Diagnosis Test
 * Phase 2: Test diagnostic reports for 3 different error scenarios
 */

import { errorMonitor } from '../error-monitor.service';
import { errorAnalyzer } from '../error-analyzer.service';
import { fixSuggestions } from '../fix-suggestions.service';
import { ErrorContext } from '../error-types';

const mockFiles = [
  {
    path: 'App.tsx',
    content: `import React from 'react';\nimport { SignUpForm } from './components/SignUpForm';\n\nexport default function App() {\n  return (\n    <div className="app">\n      <h1>Welcome</h1>\n      <SignUpForm />\n    </div>\n  );\n}`,
    language: 'typescript',
  },
  {
    path: 'components/SignUpForm.tsx',
    content: `import React from 'react';\n\nexport const SignUpForm = () => {\n  return (\n    <div className="form">\n      <input type="email" />\n      <button>Submit\n    </div>\n  );\n};`,
    language: 'typescript',
  },
];

const mockContext: ErrorContext = {
  generatedFiles: mockFiles,
  bundledCode: 'bundled code here',
  previewUrl: 'blob:preview-123',
  userPrompt: 'Create a signup form',
  settings: { industry: 'saas' },
};

describe('Error Diagnosis - Phase 2', () => {
  beforeEach(() => {
    errorMonitor.clearErrors();
  });

  test('SCENARIO 1: JSX Syntax Error (Missing Closing Tag)', () => {
    console.log('\n=== SCENARIO 1: JSX SYNTAX ERROR ===\n');

    // 1. Capture the error
    const error = errorMonitor.captureSyntaxError(
      'Expected closing tag for <button> at line 7:15',
      mockFiles[1].content,
      mockContext,
      {
        lineNumber: 7,
        columnNumber: 15,
        filePath: 'components/SignUpForm.tsx',
        syntaxErrorType: 'jsx',
        expectedToken: '</button>',
        actualToken: '</div>',
      }
    );

    // 2. Analyze the error
    const diagnostic = errorAnalyzer.analyze(error, mockFiles);

    // 3. Generate fix suggestions
    const fixes = fixSuggestions.generateSuggestions(diagnostic, error);
    diagnostic.suggestedFixes = fixes;

    // Assertions
    expect(diagnostic.errorCategory).toBe('JSX_ERROR');
    expect(diagnostic.severity).toBe('critical');
    expect(diagnostic.rootCause).toBe('Missing closing tag in JSX');
    expect(diagnostic.failedFiles).toContain('components/SignUpForm.tsx');
    expect(diagnostic.codeToRegenerate).toContain('components/SignUpForm.tsx');
    expect(diagnostic.retainedFiles).toContain('App.tsx');

    // Print diagnostic report
    console.log('📊 DIAGNOSTIC REPORT:');
    console.log('Summary:', diagnostic.summary);
    console.log('Category:', diagnostic.errorCategory);
    console.log('Severity:', diagnostic.severity);
    console.log('Root Cause:', diagnostic.rootCause);
    console.log('Root Cause Type:', diagnostic.rootCauseType);
    console.log('');
    console.log('Failed Files:', diagnostic.failedFiles);
    console.log('Retained Files:', diagnostic.retainedFiles);
    console.log('');
    console.log('Code Context:');
    console.log(diagnostic.codeContext);
    console.log('');
    console.log('Specific Issues:');
    diagnostic.specificIssues.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.severity}] ${issue.description}`);
    });
    console.log('');
    console.log('Suggested Fixes:');
    diagnostic.suggestedFixes.forEach((fix, idx) => {
      console.log(`${idx + 1}. [${fix.type}] ${fix.description}`);
      if (fix.example) console.log(`   Example: ${fix.example}`);
      console.log(`   Automated: ${fix.automated}`);
    });
    console.log('');
    console.log('Confidence:', diagnostic.confidence + '%');
    console.log('\n✅ SCENARIO 1 COMPLETE\n');
  });

  test('SCENARIO 2: Build Error (Unresolved Import)', () => {
    console.log('\n=== SCENARIO 2: BUILD ERROR (UNRESOLVED IMPORT) ===\n');

    const filesWithImportError = [
      {
        path: 'App.tsx',
        content: `import React from 'react';\nimport { Chart } from 'react-charts-pro';\n\nexport default function App() {\n  return <Chart data={[]} />;\n}`,
        language: 'typescript',
      },
    ];

    // 1. Capture the error
    const error = errorMonitor.captureBuildError(
      'Build failed: Could not resolve "react-charts-pro" from App.tsx',
      filesWithImportError[0].content,
      { ...mockContext, generatedFiles: filesWithImportError },
      {
        buildPhase: 'resolution',
        unresolvedImports: ['react-charts-pro'],
        filePath: 'App.tsx',
        stack: 'Error: Could not resolve module...',
      }
    );

    // 2. Analyze the error
    const diagnostic = errorAnalyzer.analyze(error, filesWithImportError);

    // 3. Generate fix suggestions
    const fixes = fixSuggestions.generateSuggestions(diagnostic, error);
    diagnostic.suggestedFixes = fixes;

    // Assertions
    expect(diagnostic.errorCategory).toBe('DEPENDENCY_ERROR');
    expect(diagnostic.severity).toBe('critical');
    expect(diagnostic.rootCause).toContain('Cannot resolve module');
    expect(diagnostic.failedFiles).toContain('App.tsx');

    // Print diagnostic report
    console.log('📊 DIAGNOSTIC REPORT:');
    console.log('Summary:', diagnostic.summary);
    console.log('Category:', diagnostic.errorCategory);
    console.log('Severity:', diagnostic.severity);
    console.log('Root Cause:', diagnostic.rootCause);
    console.log('Root Cause Type:', diagnostic.rootCauseType);
    console.log('');
    console.log('Failed Files:', diagnostic.failedFiles);
    console.log('');
    console.log('Specific Issues:');
    diagnostic.specificIssues.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.severity}] ${issue.description}`);
    });
    console.log('');
    console.log('Suggested Fixes:');
    diagnostic.suggestedFixes.forEach((fix, idx) => {
      console.log(`${idx + 1}. [${fix.type}] ${fix.description}`);
      if (fix.example) console.log(`   Example: ${fix.example}`);
      console.log(`   Automated: ${fix.automated}`);
    });
    console.log('');
    console.log('Confidence:', diagnostic.confidence + '%');
    console.log('\n✅ SCENARIO 2 COMPLETE\n');
  });

  test('SCENARIO 3: Runtime Error (Null Reference)', () => {
    console.log('\n=== SCENARIO 3: RUNTIME ERROR (NULL REFERENCE) ===\n');

    const filesWithRuntimeError = [
      {
        path: 'components/UserList.tsx',
        content: `import React from 'react';\n\nexport const UserList = ({ users }) => {\n  return (\n    <ul>\n      {users.map(user => (\n        <li key={user.id}>{user.name}</li>\n      ))}\n    </ul>\n  );\n};`,
        language: 'typescript',
      },
    ];

    // 1. Capture the error
    const error = errorMonitor.captureRuntimeError(
      'TypeError: Cannot read property "map" of undefined',
      filesWithRuntimeError[0].content,
      { ...mockContext, generatedFiles: filesWithRuntimeError },
      {
        stack: `TypeError: Cannot read property 'map' of undefined\n    at UserList (UserList.tsx:6:12)\n    at App (App.tsx:10:5)`,
        lineNumber: 6,
        columnNumber: 12,
        componentName: 'UserList',
        filePath: 'components/UserList.tsx',
      }
    );

    // 2. Analyze the error
    const diagnostic = errorAnalyzer.analyze(error, filesWithRuntimeError);

    // 3. Generate fix suggestions
    const fixes = fixSuggestions.generateSuggestions(diagnostic, error);
    diagnostic.suggestedFixes = fixes;

    // Assertions
    expect(diagnostic.errorCategory).toBe('RUNTIME_ERROR');
    expect(diagnostic.severity).toBe('major');
    expect(diagnostic.rootCause).toContain('Accessing property of undefined');
    expect(diagnostic.failedFiles).toContain('components/UserList.tsx');

    // Print diagnostic report
    console.log('📊 DIAGNOSTIC REPORT:');
    console.log('Summary:', diagnostic.summary);
    console.log('Category:', diagnostic.errorCategory);
    console.log('Severity:', diagnostic.severity);
    console.log('Root Cause:', diagnostic.rootCause);
    console.log('Root Cause Type:', diagnostic.rootCauseType);
    console.log('');
    console.log('Failed Files:', diagnostic.failedFiles);
    console.log('');
    console.log('Code Context:');
    console.log(diagnostic.codeContext);
    console.log('');
    console.log('Specific Issues:');
    diagnostic.specificIssues.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.severity}] ${issue.description}`);
    });
    console.log('');
    console.log('Suggested Fixes:');
    diagnostic.suggestedFixes.forEach((fix, idx) => {
      console.log(`${idx + 1}. [${fix.type}] ${fix.description}`);
      if (fix.example) console.log(`   Example: ${fix.example}`);
      console.log(`   Automated: ${fix.automated}`);
    });
    console.log('');
    console.log('Confidence:', diagnostic.confidence + '%');
    console.log('\n✅ SCENARIO 3 COMPLETE\n');
  });

  test('Fix Description Generator', () => {
    const sampleFixes = [
      {
        type: 'add' as const,
        description: 'Add closing tag for <button>',
        target: 'JSX closing tag',
        automated: true,
      },
      {
        type: 'modify' as const,
        description: 'Fix React hooks usage',
        target: 'Hook calls',
        automated: false,
      },
    ];

    const description = fixSuggestions.createFixDescription(sampleFixes);

    console.log('\n📝 Fix Description:');
    console.log(description);

    expect(description).toContain('Automated fixes available');
    expect(description).toContain('Manual fixes required');
  });
});

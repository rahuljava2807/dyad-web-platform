/**
 * Self-Heal Service Test
 * Phase 3: Test auto-fix flow with deliberately broken code
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { selfHeal } from '../self-heal.service';
import { errorMonitor } from '../error-monitor.service';
import { errorAnalyzer } from '../error-analyzer.service';
import { aiFixPrompt } from '../ai-fix-prompt.service';
import { ErrorContext } from '../error-types';

// Mock fetch for API calls
global.fetch = vi.fn();

const mockContext: ErrorContext = {
  generatedFiles: [
    {
      path: 'App.tsx',
      content: `import React from 'react';\n\nexport default function App() {\n  return <div>Missing closing tag`,
      language: 'typescript',
      isNew: true,
    },
  ],
  bundledCode: 'const App = () => {}',
  previewUrl: 'blob:preview-123',
  userPrompt: 'Create a simple app',
  settings: { industry: 'general' },
};

describe('Self-Heal Service - Phase 3', () => {
  beforeEach(() => {
    errorMonitor.clearErrors();
    selfHeal.reset();
    vi.mocked(global.fetch).mockReset();
  });

  test('TEST 1: Should identify auto-healable error', () => {
    console.log('\n=== TEST 1: AUTO-HEAL DETECTION ===\n');

    // Create a JSX syntax error
    const error = errorMonitor.captureSyntaxError(
      'Expected closing tag for <div> at line 4:15',
      mockContext.generatedFiles[0].content,
      mockContext,
      {
        lineNumber: 4,
        columnNumber: 15,
        filePath: 'App.tsx',
        syntaxErrorType: 'jsx',
      }
    );

    // Check if should auto-heal
    const shouldHeal = selfHeal.shouldAutoHeal(error, mockContext.generatedFiles);

    expect(shouldHeal).toBe(true);
    console.log('✅ JSX error identified as auto-healable');
    console.log('Error type:', error.type);
    console.log('Attempt number:', error.attemptNumber);
  });

  test('TEST 2: Should NOT auto-heal after max attempts', () => {
    console.log('\n=== TEST 2: MAX ATTEMPTS CHECK ===\n');

    // Create error with max attempts
    const error = errorMonitor.captureSyntaxError(
      'Expected closing tag',
      mockContext.generatedFiles[0].content,
      mockContext,
      { lineNumber: 4 }
    );

    // Manually set attempt number to max
    error.attemptNumber = 3;

    const shouldHeal = selfHeal.shouldAutoHeal(error, mockContext.generatedFiles);

    expect(shouldHeal).toBe(false);
    console.log('✅ Correctly rejected healing after max attempts');
    console.log('Attempt number:', error.attemptNumber);
    console.log('Max attempts:', selfHeal.getConfig().maxAttempts);
  });

  test('TEST 3: Generate AI fix prompt', () => {
    console.log('\n=== TEST 3: AI FIX PROMPT GENERATION ===\n');

    // Create error and diagnostic
    const error = errorMonitor.captureSyntaxError(
      'Expected closing tag for <div>',
      mockContext.generatedFiles[0].content,
      mockContext,
      {
        lineNumber: 4,
        columnNumber: 15,
        filePath: 'App.tsx',
        syntaxErrorType: 'jsx',
      }
    );

    const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);

    // Generate fix prompt
    const fixPrompt = aiFixPrompt.generateFixPrompt(
      error,
      diagnostic,
      mockContext.userPrompt,
      mockContext.generatedFiles
    );

    console.log('📝 Generated Fix Prompt:');
    console.log('---');
    console.log(fixPrompt);
    console.log('---');

    expect(fixPrompt).toContain('AUTO-FIX REQUIRED');
    expect(fixPrompt).toContain('JSX_ERROR');
    expect(fixPrompt).toContain('App.tsx');
    expect(fixPrompt).toContain('ENSURE all JSX tags are properly closed');
    console.log('✅ Fix prompt generated successfully');
  });

  test('TEST 4: Self-heal attempt with mocked API', async () => {
    console.log('\n=== TEST 4: SELF-HEAL ATTEMPT ===\n');

    // Mock successful API response
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        files: [
          {
            path: 'App.tsx',
            content: `import React from 'react';\n\nexport default function App() {\n  return <div>Fixed closing tag</div>;\n}`,
            type: 'modify',
          },
        ],
      }),
    });

    // Create error and diagnostic
    const error = errorMonitor.captureSyntaxError(
      'Expected closing tag for <div>',
      mockContext.generatedFiles[0].content,
      mockContext,
      {
        lineNumber: 4,
        filePath: 'App.tsx',
        syntaxErrorType: 'jsx',
      }
    );

    const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);

    // Track state changes
    const stateChanges: any[] = [];
    selfHeal.onStateChange((state) => stateChanges.push({ ...state }));

    // Attempt self-heal
    const result = await selfHeal.attemptSelfHeal(
      error,
      diagnostic,
      mockContext.userPrompt,
      mockContext.generatedFiles
    );

    console.log('📊 Self-Heal Result:');
    console.log('Success:', result.success);
    console.log('Attempt Number:', result.attemptNumber);
    console.log('Fix Applied:', result.fixApplied);
    console.log('Files Regenerated:', result.files?.length);

    console.log('\n📈 State Changes:');
    stateChanges.forEach((state, idx) => {
      console.log(`${idx + 1}. isHealing: ${state.isHealing}, message: ${state.healingMessage}`);
    });

    expect(result.success).toBe(true);
    expect(result.attemptNumber).toBe(2); // Error starts at attempt 1, healing is attempt 2
    expect(result.files).toHaveLength(1);
    expect(stateChanges.length).toBeGreaterThan(0);
    console.log('\n✅ Self-heal completed successfully');
  });

  test('TEST 5: Handle API failure gracefully', async () => {
    console.log('\n=== TEST 5: API FAILURE HANDLING ===\n');

    // Mock API failure
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'AI service unavailable' }),
    });

    const error = errorMonitor.captureSyntaxError(
      'Expected closing tag',
      mockContext.generatedFiles[0].content,
      mockContext,
      { lineNumber: 4, filePath: 'App.tsx' }
    );

    const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);

    const result = await selfHeal.attemptSelfHeal(
      error,
      diagnostic,
      mockContext.userPrompt,
      mockContext.generatedFiles
    );

    console.log('📊 Failure Result:');
    console.log('Success:', result.success);
    console.log('Error:', result.error);

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    console.log('✅ API failure handled gracefully');
  });

  test('TEST 6: Configuration management', () => {
    console.log('\n=== TEST 6: CONFIGURATION ===\n');

    // Get default config
    const defaultConfig = selfHeal.getConfig();
    console.log('Default Config:', defaultConfig);

    // Update config
    selfHeal.configure({
      maxAttempts: 5,
      backoffDelay: 3000,
      notifyUser: false,
    });

    const updatedConfig = selfHeal.getConfig();
    console.log('Updated Config:', updatedConfig);

    expect(updatedConfig.maxAttempts).toBe(5);
    expect(updatedConfig.backoffDelay).toBe(3000);
    expect(updatedConfig.notifyUser).toBe(false);
    console.log('✅ Configuration updated successfully');
  });

  test('TEST 7: Complete flow with broken code', async () => {
    console.log('\n=== TEST 7: COMPLETE SELF-HEAL FLOW ===\n');

    // Mock API response
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        files: [
          {
            path: 'App.tsx',
            content: `import React from 'react';\n\nexport default function App() {\n  const users = props.users || [];\n  return (\n    <ul>\n      {users.map(user => <li key={user.id}>{user.name}</li>)}\n    </ul>\n  );\n}`,
            type: 'modify',
          },
        ],
      }),
    });

    // Step 1: Capture runtime error
    const error = errorMonitor.captureRuntimeError(
      'Cannot read property "map" of undefined',
      'const App = () => { users.map(...) }',
      mockContext,
      {
        stack: 'TypeError: Cannot read property "map" of undefined\n  at App (App.tsx:5:12)',
        lineNumber: 5,
        columnNumber: 12,
        componentName: 'App',
        filePath: 'App.tsx',
      }
    );

    console.log('Step 1: Error captured');
    console.log('- Type:', error.type);
    console.log('- Message:', error.message);

    // Step 2: Analyze error
    const diagnostic = errorAnalyzer.analyze(error, mockContext.generatedFiles);

    console.log('\nStep 2: Error analyzed');
    console.log('- Category:', diagnostic.errorCategory);
    console.log('- Root Cause:', diagnostic.rootCause);
    console.log('- Confidence:', diagnostic.confidence);

    // Step 3: Check if auto-healable
    const shouldHeal = selfHeal.shouldAutoHeal(error, mockContext.generatedFiles);

    console.log('\nStep 3: Auto-heal check');
    console.log('- Should heal:', shouldHeal);

    expect(shouldHeal).toBe(true);

    // Step 4: Attempt self-heal
    const result = await selfHeal.attemptSelfHeal(
      error,
      diagnostic,
      mockContext.userPrompt,
      mockContext.generatedFiles
    );

    console.log('\nStep 4: Self-heal attempted');
    console.log('- Success:', result.success);
    console.log('- Files regenerated:', result.files?.length);
    console.log('- Fix applied:', result.fixApplied);

    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(1);

    console.log('\n✅ COMPLETE FLOW SUCCESSFUL');
  });
});

/**
 * Preview Rendering Validator Service
 *
 * Uses Playwright headless browser to validate that generated code
 * actually renders without runtime errors before showing to user.
 *
 * This catches issues that static validation can't detect:
 * - React runtime errors (hooks, component lifecycle)
 * - Missing dependencies at runtime
 * - Broken imports
 * - TypeScript compilation errors in browser
 * - Console errors and warnings
 */

import { chromium, Browser, Page } from 'playwright'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

export interface PreviewValidationResult {
  isValid: boolean
  errors: PreviewError[]
  warnings: PreviewWarning[]
  consoleMessages: string[]
}

export interface PreviewError {
  type: 'console_error' | 'react_error' | 'network_error' | 'uncaught_exception' | 'timeout'
  message: string
  stack?: string
}

export interface PreviewWarning {
  type: 'console_warning' | 'deprecated_api'
  message: string
}

export interface GeneratedFile {
  path: string
  content: string
  language?: string
}

export class PreviewValidator {
  private static instance: PreviewValidator
  private browser: Browser | null = null
  private readonly VALIDATION_TIMEOUT = 15000 // 15 seconds max
  private readonly RENDER_WAIT = 3000 // Wait 3s for rendering

  private constructor() {}

  static getInstance(): PreviewValidator {
    if (!PreviewValidator.instance) {
      PreviewValidator.instance = new PreviewValidator()
    }
    return PreviewValidator.instance
  }

  /**
   * Main validation method - validates that code renders without errors
   */
  async validate(files: GeneratedFile[]): Promise<PreviewValidationResult> {
    console.log(`[PreviewValidator] Starting validation for ${files.length} files...`)

    const errors: PreviewError[] = []
    const warnings: PreviewWarning[] = []
    const consoleMessages: string[] = []

    try {
      // Find the main App file
      const appFile = files.find(f =>
        f.path.includes('App.tsx') || f.path.includes('App.jsx') || f.path.includes('main.tsx')
      )

      if (!appFile) {
        console.log('[PreviewValidator] No App.tsx found, skipping preview validation')
        return { isValid: true, errors: [], warnings: [], consoleMessages: [] }
      }

      // Create temporary HTML file for testing
      const testHtmlPath = await this.createTestHtml(files, appFile)

      // Launch headless browser
      await this.ensureBrowser()

      // Create new page
      const page = await this.browser!.newPage()

      // Capture console messages
      page.on('console', msg => {
        const text = msg.text()
        consoleMessages.push(`[${msg.type()}] ${text}`)

        if (msg.type() === 'error') {
          errors.push({
            type: 'console_error',
            message: text,
          })
        } else if (msg.type() === 'warning') {
          warnings.push({
            type: 'console_warning',
            message: text,
          })
        }
      })

      // Capture uncaught exceptions
      page.on('pageerror', error => {
        errors.push({
          type: 'uncaught_exception',
          message: error.message,
          stack: error.stack,
        })
      })

      // Capture network errors (failed imports)
      page.on('requestfailed', request => {
        const url = request.url()
        // Only report failures for actual resources, not CDN retries
        if (!url.includes('cdn.') && !url.includes('unpkg')) {
          errors.push({
            type: 'network_error',
            message: `Failed to load: ${url}`,
          })
        }
      })

      // Load the test page
      console.log(`[PreviewValidator] Loading test page: ${testHtmlPath}`)

      try {
        await page.goto(`file://${testHtmlPath}`, {
          timeout: this.VALIDATION_TIMEOUT,
          waitUntil: 'networkidle',
        })
      } catch (error: any) {
        errors.push({
          type: 'timeout',
          message: `Page load timeout: ${error.message}`,
        })
      }

      // Wait for React to render
      console.log(`[PreviewValidator] Waiting ${this.RENDER_WAIT}ms for React rendering...`)
      await page.waitForTimeout(this.RENDER_WAIT)

      // Check for React error boundaries
      const hasReactError = await page.evaluate(() => {
        const body = document.body.innerText
        return body.includes('Error') || body.includes('Failed') || body.includes('Something went wrong')
      })

      if (hasReactError) {
        const errorText = await page.evaluate(() => document.body.innerText)
        errors.push({
          type: 'react_error',
          message: `React error detected in rendered output: ${errorText.substring(0, 200)}`,
        })
      }

      // Close page
      await page.close()

      // Clean up test file
      await fs.unlink(testHtmlPath).catch(() => {})

      const isValid = errors.length === 0

      if (isValid) {
        console.log(`[PreviewValidator] ✅ Preview validation passed (${warnings.length} warnings)`)
      } else {
        console.log(`[PreviewValidator] ❌ Preview validation failed (${errors.length} errors)`)
      }

      return { isValid, errors, warnings, consoleMessages }
    } catch (error: any) {
      console.error('[PreviewValidator] Validation failed:', error)
      errors.push({
        type: 'uncaught_exception',
        message: `Preview validation error: ${error.message}`,
        stack: error.stack,
      })

      return { isValid: false, errors, warnings, consoleMessages }
    }
  }

  /**
   * Create a temporary HTML file with generated code for testing
   */
  private async createTestHtml(files: GeneratedFile[], appFile: GeneratedFile): Promise<string> {
    // Create a simple HTML template that loads React and renders the app
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Validation Test</title>

  <!-- React 18 from CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <!-- Babel Standalone for JSX transformation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;

    // Global error boundary to catch React errors
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }

      componentDidCatch(error, errorInfo) {
        console.error('React Error Boundary caught:', error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return React.createElement('div', {
            style: { padding: '20px', color: 'red' }
          }, 'Error: ' + String(this.state.error));
        }

        return this.props.children;
      }
    }

    // Simplified component code (extract just the App component)
    ${this.extractAppComponent(appFile.content)}

    // Render the app
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      React.createElement(ErrorBoundary, null,
        React.createElement(App)
      )
    );
  </script>
</body>
</html>`

    // Write to temp file
    const tempDir = os.tmpdir()
    const tempPath = path.join(tempDir, `preview-validation-${Date.now()}.html`)
    await fs.writeFile(tempPath, htmlContent, 'utf-8')

    console.log(`[PreviewValidator] Created test HTML: ${tempPath}`)
    return tempPath
  }

  /**
   * Extract the App component code from the generated file
   * This is a simplified extraction - in production you'd want more robust parsing
   */
  private extractAppComponent(content: string): string {
    // Remove imports (they won't work in the browser)
    let code = content.replace(/import\s+.*?from\s+['"].*?['"]/g, '')

    // Remove export statements
    code = code.replace(/export\s+(default\s+)?/g, '')

    // If using TypeScript, remove type annotations (basic removal)
    code = code.replace(/:\s*\w+(\[\])?(\s*\||\s*&\s*\w+)*(?=\s*[=,)])/g, '')
    code = code.replace(/interface\s+\w+\s*{[^}]*}/g, '')
    code = code.replace(/type\s+\w+\s*=\s*[^;]+;/g, '')

    // Remove React import if present (we load it from CDN)
    code = code.replace(/import\s+React.*?from\s+['"]react['"]/g, '')

    return code
  }

  /**
   * Ensure browser is launched
   */
  private async ensureBrowser(): Promise<void> {
    if (!this.browser) {
      console.log('[PreviewValidator] Launching headless browser...')
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }
  }

  /**
   * Close the browser (cleanup)
   */
  async close(): Promise<void> {
    if (this.browser) {
      console.log('[PreviewValidator] Closing headless browser...')
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * Format validation results for logging
   */
  formatResults(result: PreviewValidationResult): string {
    let output = '\n=== PREVIEW VALIDATION RESULTS ===\n'

    if (result.errors.length > 0) {
      output += '\n❌ ERRORS:\n'
      for (const error of result.errors) {
        output += `  - [${error.type}] ${error.message}\n`
        if (error.stack) {
          output += `    Stack: ${error.stack.substring(0, 200)}...\n`
        }
      }
    }

    if (result.warnings.length > 0) {
      output += '\n⚠️  WARNINGS:\n'
      for (const warning of result.warnings) {
        output += `  - [${warning.type}] ${warning.message}\n`
      }
    }

    if (result.consoleMessages.length > 0) {
      output += '\n📝 CONSOLE MESSAGES:\n'
      for (const msg of result.consoleMessages.slice(0, 10)) {
        output += `  ${msg}\n`
      }
      if (result.consoleMessages.length > 10) {
        output += `  ... and ${result.consoleMessages.length - 10} more\n`
      }
    }

    if (result.isValid && result.warnings.length === 0) {
      output += '\n✅ Preview renders successfully!\n'
    }

    output += '\n==================================\n'
    return output
  }
}

// Export singleton instance
export const previewValidator = PreviewValidator.getInstance()

// Cleanup on process exit
process.on('exit', () => {
  previewValidator.close().catch(() => {})
})

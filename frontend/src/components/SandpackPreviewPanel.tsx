'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Sandpack, SandpackFiles, SandpackPredefinedTemplate } from '@codesandbox/sandpack-react'
import { RefreshCw, Eye, EyeOff, Terminal, AlertTriangle, CheckCircle, ExternalLink, Code } from 'lucide-react'

interface PreviewFile {
  path: string
  content: string
  language: string
}

interface SandpackPreviewPanelProps {
  files: PreviewFile[]
  onPreviewUpdate?: (ready: boolean) => void
  className?: string
  originalPrompt?: string
}

export const SandpackPreviewPanel: React.FC<SandpackPreviewPanelProps> = ({
  files,
  onPreviewUpdate,
  className = '',
  originalPrompt = 'Generated application'
}) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [showCode, setShowCode] = useState(false)
  const [key, setKey] = useState(0)
  const [previewError, setPreviewError] = useState<string | null>(null)

  // Convert files to Sandpack format and extract dependencies
  const { sandpackFiles, dependencies } = useMemo(() => {
    if (!files || files.length === 0) {
      return {
        sandpackFiles: {
          '/App.js': {
            code: `export default function App() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ color: '#333' }}>No Files to Preview</h1>
      <p style={{ color: '#666', marginTop: '10px' }}>Generate some code to see the preview</p>
    </div>
  )
}`
          }
        },
        dependencies: {}
      }
    }

    const sandpackFiles: SandpackFiles = {}
    let dependencies: Record<string, string> = {
      'react': '^18.2.0',
      'react-dom': '^18.2.0'
    }

    // Unsupported dependencies that Sandpack doesn't support
    const unsupportedDeps = [
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'yup',
      'formik',
      'axios',
      'swr',
      'react-query',
      '@tanstack/react-query'
    ]

    // PASS 1: Identify files to skip
    const skippedFiles = new Set<string>()

    files.forEach(file => {
      // Skip package.json
      if (file.path.includes('package.json')) {
        try {
          const packageJson = JSON.parse(file.content)
          if (packageJson.dependencies) {
            dependencies = { ...dependencies, ...packageJson.dependencies }
          }
          if (packageJson.devDependencies) {
            dependencies = { ...dependencies, ...packageJson.devDependencies }
          }
        } catch (e) {
          console.error('Failed to parse package.json:', e)
        }
        return
      }

      // Check for unsupported dependencies
      const hasUnsupportedDep = unsupportedDeps.some(dep =>
        file.content.includes(`from '${dep}'`) ||
        file.content.includes(`from "${dep}"`) ||
        file.content.includes(`require('${dep}')`) ||
        file.content.includes(`require("${dep}")`)
      )

      // Skip non-source files and files that won't work in browser
      const shouldSkip =
        file.path.includes('README') ||
        file.path.includes('.md') ||
        file.path.includes('package.json') ||
        file.path.includes('tsconfig') ||
        file.path.includes('.config') ||
        file.path.toLowerCase().includes('validation') ||
        file.path.toLowerCase().includes('schema.') ||
        /schema\.(ts|js|tsx|jsx)$/i.test(file.path) ||
        file.path.includes('/api/') ||
        file.path.includes('/server/') ||
        file.path.includes('.test.') ||
        file.path.includes('.spec.') ||
        hasUnsupportedDep

      if (shouldSkip) {
        // Get filename without extension for import matching
        const fileName = file.path.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') || ''
        skippedFiles.add(fileName)
        console.log(`[Sandpack] Skipping file: ${file.path}${hasUnsupportedDep ? ' (unsupported dependencies)' : ''}`)
      }
    })

    // PASS 2: Process files, also skipping those that import skipped files
    files.forEach(file => {
      if (file.path.includes('package.json')) return

      const fileName = file.path.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') || ''

      // Already marked as skipped
      if (skippedFiles.has(fileName)) return

      // Check if this file imports any skipped files
      const importsSkippedFile = Array.from(skippedFiles).some(skippedFile => {
        return file.content.includes(`from './${skippedFile}'`) ||
               file.content.includes(`from "./${skippedFile}"`) ||
               file.content.includes(`from '../${skippedFile}'`) ||
               file.content.includes(`from "../${skippedFile}"`) ||
               file.content.includes(`import ${skippedFile} from`) ||
               file.content.includes(`import { `) && file.content.includes(`} from './${skippedFile}'`)
      })

      if (importsSkippedFile) {
        console.log(`[Sandpack] Skipping file: ${file.path} (imports skipped files)`)
        return
      }

      // Skip basic non-source files
      const shouldSkip =
        file.path.includes('README') ||
        file.path.includes('.md') ||
        file.path.includes('tsconfig') ||
        file.path.includes('.config') ||
        file.path.includes('/api/') ||
        file.path.includes('/server/') ||
        file.path.includes('.test.') ||
        file.path.includes('.spec.')

      if (shouldSkip) return

      // Normalize file paths for Sandpack (must start with /)
      let normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`

      // Map src/ paths
      if (normalizedPath.startsWith('/src/')) {
        normalizedPath = normalizedPath.replace('/src/', '/')
      }

      // Clean up imports to skipped files
      let cleanedContent = file.content
      Array.from(skippedFiles).forEach(skippedFile => {
        // Remove import statements for skipped files
        const importPatterns = [
          new RegExp(`import\\s+${skippedFile}\\s+from\\s+['"]\\.\\/.*?['"];?\\s*`, 'g'),
          new RegExp(`import\\s+\\{[^}]*\\}\\s+from\\s+['"]\\.\\/.*?${skippedFile}['"];?\\s*`, 'g'),
          new RegExp(`import\\s+.*?\\s+from\\s+['"]\\.\\/.*?${skippedFile}['"];?\\s*`, 'g'),
        ]

        importPatterns.forEach(pattern => {
          cleanedContent = cleanedContent.replace(pattern, '')
        })

        // Remove usage of skipped components in JSX
        cleanedContent = cleanedContent.replace(
          new RegExp(`<${skippedFile}[^>]*>.*?<\\/${skippedFile}>`, 'gs'),
          `{/* ${skippedFile} component removed (unsupported dependencies) */}`
        )
        cleanedContent = cleanedContent.replace(
          new RegExp(`<${skippedFile}[^/]*/>`, 'g'),
          `{/* ${skippedFile} component removed (unsupported dependencies) */}`
        )
      })

      // Keep TypeScript files as-is since we're using react-ts template
      sandpackFiles[normalizedPath] = {
        code: cleanedContent
      }
    })

    // Ensure we have an App.tsx entry point
    if (!sandpackFiles['/App.tsx'] && !sandpackFiles['/App.ts']) {
      // Find the first React component
      const componentFile = files.find(f =>
        (f.path.includes('App.tsx') || f.path.includes('App.jsx') ||
         f.path.includes('Dashboard') || f.content.includes('export default')) &&
        (f.content.includes('function') || f.content.includes('const') || f.content.includes('class'))
      )

      if (componentFile) {
        sandpackFiles['/App.tsx'] = {
          code: componentFile.content
        }
      } else {
        // Create a default App component
        sandpackFiles['/App.tsx'] = {
          code: `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome!</h1>
        <p className="text-gray-600">Your application is ready to preview.</p>
      </div>
    </div>
  );
}`
        }
      }
    }

    // Ensure we have an index.tsx
    if (!sandpackFiles['/index.tsx'] && !sandpackFiles['/index.ts']) {
      sandpackFiles['/index.tsx'] = {
        code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      }
    }

    // Add Tailwind CSS via styles.css
    if (!sandpackFiles['/styles.css']) {
      sandpackFiles['/styles.css'] = {
        code: `@import url('https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}`
      }
    }

    // Add public/index.html with Tailwind CDN
    if (!sandpackFiles['/public/index.html']) {
      sandpackFiles['/public/index.html'] = {
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
      }
    }

    return { sandpackFiles, dependencies }
  }, [files])

  // Determine the template - always use react-ts since we generate TypeScript
  const template = useMemo<SandpackPredefinedTemplate>(() => {
    return 'react-ts'
  }, [files])

  // Notify parent when preview is ready
  useEffect(() => {
    if (files && files.length > 0) {
      onPreviewUpdate?.(true)
    }
  }, [files, onPreviewUpdate])

  const refreshPreview = () => {
    setPreviewError(null)
    setKey(prev => prev + 1)
  }

  const hasFiles = files && files.length > 0

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          {hasFiles && <CheckCircle className="h-4 w-4 text-green-500" />}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 rounded-md transition-colors ${
              showCode ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Toggle Code Editor"
          >
            <Code className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            className={`p-2 rounded-md transition-colors ${
              isPreviewVisible ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Toggle Preview Visibility"
          >
            {isPreviewVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          <button
            onClick={refreshPreview}
            disabled={!hasFiles}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative overflow-hidden">
        {!hasFiles ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <div>No files to preview</div>
              <div className="text-sm mt-2">Generate some code to see the preview</div>
            </div>
          </div>
        ) : !isPreviewVisible ? (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center text-gray-500">
              <EyeOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <div>Preview hidden</div>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            <Sandpack
              key={key}
              template={template}
              files={sandpackFiles}
              theme="light"
              customSetup={{
                dependencies: {
                  ...dependencies,
                  'react': '^18.2.0',
                  'react-dom': '^18.2.0'
                }
              }}
              options={{
                showNavigator: false,
                showTabs: showCode,
                showLineNumbers: true,
                showInlineErrors: true,
                wrapContent: true,
                editorHeight: '100%',
                editorWidthPercentage: showCode ? 50 : 0,
                externalResources: [
                  'https://cdn.tailwindcss.com'
                ],
                classes: {
                  'sp-wrapper': 'h-full',
                  'sp-layout': 'h-full',
                  'sp-stack': 'h-full'
                }
              }}
            />

            {/* Interactive Tips */}
            {!showCode && (
              <div className="absolute bottom-4 right-4 max-w-sm">
                <div className="bg-blue-600 text-white rounded-lg p-3 shadow-xl text-xs">
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    💡 Toggle Code Editor
                  </div>
                  <div className="space-y-1 text-blue-100">
                    <div>Click the <strong>code icon</strong> above to view and edit source files</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

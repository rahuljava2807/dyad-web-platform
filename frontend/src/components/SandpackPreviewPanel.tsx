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

  // Convert files to Sandpack format
  const sandpackFiles = useMemo<SandpackFiles>(() => {
    if (!files || files.length === 0) {
      return {
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
      }
    }

    const sandpackFiles: SandpackFiles = {}

    files.forEach(file => {
      // Normalize file paths for Sandpack (must start with /)
      let normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`

      // Map common file names to Sandpack conventions
      if (normalizedPath === '/App.tsx' || normalizedPath === '/App.jsx') {
        normalizedPath = '/App.js'
      } else if (normalizedPath === '/index.tsx' || normalizedPath === '/index.jsx') {
        normalizedPath = '/index.js'
      }

      sandpackFiles[normalizedPath] = {
        code: file.content
      }
    })

    // Ensure we have an App.js or index.js
    if (!sandpackFiles['/App.js'] && !sandpackFiles['/index.js']) {
      // Find the first React component
      const componentFile = files.find(f =>
        f.content.includes('export default') &&
        (f.content.includes('function') || f.content.includes('const') || f.content.includes('class'))
      )

      if (componentFile) {
        sandpackFiles['/App.js'] = {
          code: componentFile.content
        }
      }
    }

    return sandpackFiles
  }, [files])

  // Determine the template based on file content
  const template = useMemo<SandpackPredefinedTemplate>(() => {
    const hasTypeScript = files.some(f => f.path.endsWith('.ts') || f.path.endsWith('.tsx'))
    const hasReact = files.some(f => f.content.includes('React') || f.content.includes('jsx'))

    if (hasTypeScript && hasReact) {
      return 'react-ts'
    } else if (hasReact) {
      return 'react'
    } else if (hasTypeScript) {
      return 'vanilla-ts'
    }

    return 'vanilla'
  }, [files])

  // Notify parent when preview is ready
  useEffect(() => {
    if (files && files.length > 0) {
      onPreviewUpdate?.(true)
    }
  }, [files, onPreviewUpdate])

  const refreshPreview = () => {
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
          <Sandpack
            key={key}
            template={template}
            files={sandpackFiles}
            theme="light"
            options={{
              showNavigator: false,
              showTabs: showCode,
              showLineNumbers: true,
              showInlineErrors: true,
              wrapContent: true,
              editorHeight: '100%',
              editorWidthPercentage: showCode ? 50 : 0,
              classes: {
                'sp-wrapper': 'h-full',
                'sp-layout': 'h-full',
                'sp-stack': 'h-full'
              }
            }}
            customSetup={{
              dependencies: {
                'react': '^18.0.0',
                'react-dom': '^18.0.0',
                'lucide-react': 'latest',
                '@radix-ui/react-slot': 'latest',
                '@radix-ui/react-label': 'latest',
                '@radix-ui/react-select': 'latest',
                '@radix-ui/react-tabs': 'latest',
                'class-variance-authority': 'latest',
                'clsx': 'latest',
                'tailwind-merge': 'latest'
              }
            }}
          />
        )}
      </div>
    </div>
  )
}

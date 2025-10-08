'use client'

import React, { useState, useMemo } from 'react'
import { Sandpack, SandpackFiles } from '@codesandbox/sandpack-react'
import { RefreshCw, Eye, EyeOff, ChevronRight, ChevronDown, FileCode, Folder } from 'lucide-react'

interface PreviewFile {
  path: string
  content: string
  language: string
}

interface ImprovedSandpackPreviewProps {
  files: PreviewFile[]
  onPreviewUpdate?: (ready: boolean) => void
  className?: string
}

export const ImprovedSandpackPreview: React.FC<ImprovedSandpackPreviewProps> = ({
  files,
  onPreviewUpdate,
  className = ''
}) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [key, setKey] = useState(0)
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components']))

  // Build file tree structure
  const fileTree = useMemo(() => {
    const tree: Record<string, any> = {}

    files.forEach(file => {
      const parts = file.path.replace(/^\//, '').split('/')
      let current = tree

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          current[part] = { type: 'file', file }
        } else {
          // It's a folder
          if (!current[part]) {
            current[part] = { type: 'folder', children: {} }
          }
          current = current[part].children
        }
      })
    })

    return tree
  }, [files])

  // Convert files to Sandpack format
  const { sandpackFiles, dependencies } = useMemo(() => {
    if (!files || files.length === 0) {
      return { sandpackFiles: {}, dependencies: {} }
    }

    const sandpackFiles: SandpackFiles = {}
    let dependencies: Record<string, string> = {
      'react': '^18.2.0',
      'react-dom': '^18.2.0'
    }

    files.forEach(file => {
      if (file.path.includes('package.json')) {
        try {
          const packageJson = JSON.parse(file.content)
          if (packageJson.dependencies) {
            dependencies = { ...dependencies, ...packageJson.dependencies }
          }
        } catch (e) {
          console.error('Failed to parse package.json:', e)
        }
        return
      }

      let normalizedPath = file.path
      if (!normalizedPath.startsWith('/')) {
        normalizedPath = `/${normalizedPath}`
      }

      sandpackFiles[normalizedPath] = { code: file.content }
    })

    // Ensure we have required files - check for both root and src/ paths
    console.log('[SandpackPreview] Available files:', Object.keys(sandpackFiles))

    // Check for Next.js app/page.tsx and convert it to App.tsx for Sandpack
    const nextAppFile = sandpackFiles['/src/app/page.tsx'] || sandpackFiles['/app/page.tsx']
    if (nextAppFile) {
      console.log('[SandpackPreview] Found Next.js app/page.tsx, converting to App.tsx')

      // Fix import paths when moving from /src/app/page.tsx to /src/App.tsx
      // Change: import ... from '../components/X' -> './components/X'
      // Change: import ... from '../lib/X' -> './lib/X'
      let fixedCode = nextAppFile.code
        .replace(/from\s+['"]\.\.\/components\//g, "from './components/")
        .replace(/from\s+['"]\.\.\/lib\//g, "from './lib/")
        .replace(/from\s+['"]\.\.\/hooks\//g, "from './hooks/")
        .replace(/from\s+['"]\.\.\/utils\//g, "from './utils/")
        .replace(/from\s+['"]\.\.\/types\//g, "from './types/")

      sandpackFiles['/src/App.tsx'] = { code: fixedCode }
      console.log('[SandpackPreview] Fixed import paths for App.tsx')
    }

    const hasAppFile = sandpackFiles['/App.tsx'] || sandpackFiles['/App.ts'] ||
                      sandpackFiles['/src/App.tsx'] || sandpackFiles['/src/App.ts']
    console.log('[SandpackPreview] hasAppFile:', hasAppFile, {
      '/App.tsx': !!sandpackFiles['/App.tsx'],
      '/App.ts': !!sandpackFiles['/App.ts'],
      '/src/App.tsx': !!sandpackFiles['/src/App.tsx'],
      '/src/App.ts': !!sandpackFiles['/src/App.ts']
    })

    if (!hasAppFile) {
      console.log('[SandpackPreview] No App file found, using fallback')
      sandpackFiles['/App.tsx'] = {
        code: `export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome!</h1>
        <p className="text-gray-600">Your application is ready.</p>
      </div>
    </div>
  );
}`
      }
    }

    // Create entry point that works with both /App.tsx and /src/App.tsx
    if (!sandpackFiles['/index.tsx']) {
      const appImportPath = sandpackFiles['/src/App.tsx'] || sandpackFiles['/src/App.ts'] ? './src/App' : './App'
      sandpackFiles['/index.tsx'] = {
        code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '${appImportPath}';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);`
      }
    }

    if (!sandpackFiles['/public/index.html']) {
      sandpackFiles['/public/index.html'] = {
        code: `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Generated App</title>
<script src="https://cdn.tailwindcss.com"></script>
</head><body><div id="root"></div></body></html>`
      }
    }

    return { sandpackFiles, dependencies }
  }, [files])

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const renderFileTree = (tree: any, path: string = '') => {
    return Object.keys(tree).sort().map(key => {
      const item = tree[key]
      const currentPath = path ? `${path}/${key}` : key

      if (item.type === 'folder') {
        const isExpanded = expandedFolders.has(currentPath)
        return (
          <div key={currentPath}>
            <div
              onClick={() => toggleFolder(currentPath)}
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
              <Folder className="h-3 w-3 text-blue-500" />
              <span className="text-gray-700">{key}</span>
            </div>
            {isExpanded && (
              <div className="ml-4">
                {renderFileTree(item.children, currentPath)}
              </div>
            )}
          </div>
        )
      } else {
        return (
          <div
            key={currentPath}
            onClick={() => setSelectedFile(item.file.path)}
            className={`flex items-center gap-1 px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm ${
              selectedFile === item.file.path ? 'bg-blue-50' : ''
            }`}
          >
            <span className="w-3" />
            <FileCode className="h-3 w-3 text-gray-400" />
            <span className="text-gray-600">{key}</span>
          </div>
        )
      }
    })
  }

  const hasFiles = files && files.length > 0

  return (
    <div className={`flex h-full ${className}`}>
      {/* File Sidebar */}
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        <div className="p-3 border-b bg-white">
          <h3 className="font-semibold text-sm text-gray-900">Files ({files.length})</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {hasFiles ? renderFileTree(fileTree) : (
            <div className="text-sm text-gray-500 p-2">No files</div>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-white">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-gray-900">Live Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              className={`p-2 rounded-md text-xs transition-colors ${
                isPreviewVisible ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Toggle Preview"
            >
              {isPreviewVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setKey(prev => prev + 1)}
              disabled={!hasFiles}
              className="p-2 rounded-md text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              title="Refresh Preview"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 relative">
          {!hasFiles ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center text-gray-500">
                <p>No files to preview</p>
                <p className="text-sm mt-2">Generate code to see the preview</p>
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
            <div className="h-full">
              <Sandpack
                key={key}
                template="react-ts"
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
                  showTabs: false,
                  showLineNumbers: false,
                  showInlineErrors: true,
                  wrapContent: true,
                  editorHeight: '100%',
                  editorWidthPercentage: 0,
                  externalResources: ['https://cdn.tailwindcss.com'],
                  classes: {
                    'sp-wrapper': 'h-full',
                    'sp-layout': 'h-full'
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

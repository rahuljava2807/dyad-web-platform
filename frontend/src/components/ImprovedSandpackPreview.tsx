'use client'

import React, { useState, useMemo } from 'react'
import { Sandpack, SandpackFiles } from '@codesandbox/sandpack-react'
import { RefreshCw, Eye, EyeOff, ChevronRight, ChevronDown, FileCode, Folder, PanelLeftClose, PanelLeftOpen, Monitor, Smartphone, Tablet } from 'lucide-react'

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

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export const ImprovedSandpackPreview: React.FC<ImprovedSandpackPreviewProps> = ({
  files,
  onPreviewUpdate,
  className = ''
}) => {
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(false)
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [key, setKey] = useState(0)
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components']))
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')

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

  // Device dimensions
  const deviceDimensions = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] h-[1024px] mx-auto',
    mobile: 'w-[375px] h-[667px] mx-auto'
  }

  return (
    <div className={`relative w-full h-full ${className} bg-white overflow-hidden`}>
      {/* Collapsible File Sidebar - Slides in from left */}
      <div className={`absolute top-0 left-0 bottom-0 w-80 bg-gray-50 border-r border-gray-200 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
        isFileTreeOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
        <div className="p-3 border-b bg-white">
          <h3 className="font-semibold text-sm text-gray-900">Files ({files.length})</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {hasFiles ? renderFileTree(fileTree) : (
            <div className="text-sm text-gray-500 p-2">No files</div>
          )}
        </div>
        </div>
      </div>

      {/* Floating File Tree Toggle Button */}
      <button
        onClick={() => setIsFileTreeOpen(!isFileTreeOpen)}
        className={`fixed top-4 left-4 z-50 p-3 rounded-xl backdrop-blur-xl shadow-2xl transition-all duration-300 ${
          isFileTreeOpen
            ? 'bg-gray-800 text-white hover:bg-gray-700'
            : 'bg-white/90 text-gray-900 hover:bg-white border border-gray-200'
        }`}
        title={isFileTreeOpen ? 'Close Files' : 'Show Files'}
      >
        {isFileTreeOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
      </button>

      {/* Floating Device Mode Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-2 backdrop-blur-xl bg-white/90 border border-gray-200 rounded-xl p-2 shadow-2xl">
        <button
          onClick={() => setDeviceMode('desktop')}
          className={`p-2 rounded-lg transition-all ${
            deviceMode === 'desktop'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Desktop"
        >
          <Monitor className="h-4 w-4" />
        </button>
        <button
          onClick={() => setDeviceMode('tablet')}
          className={`p-2 rounded-lg transition-all ${
            deviceMode === 'tablet'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Tablet"
        >
          <Tablet className="h-4 w-4" />
        </button>
        <button
          onClick={() => setDeviceMode('mobile')}
          className={`p-2 rounded-lg transition-all ${
            deviceMode === 'mobile'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Mobile"
        >
          <Smartphone className="h-4 w-4" />
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          onClick={() => setKey(prev => prev + 1)}
          disabled={!hasFiles}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-all"
          title="Refresh Preview"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Preview Area - Full Width */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100">
        {!hasFiles ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <FileCode className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No files to preview</p>
              <p className="text-sm mt-2 text-gray-400">Generate code to see live preview</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
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
                editorHeight: '100vh',
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
  )
}

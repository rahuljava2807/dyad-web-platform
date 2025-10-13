'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Sandpack, SandpackFiles } from '@codesandbox/sandpack-react'
import { RefreshCw, Eye, EyeOff, ChevronRight, ChevronDown, FileCode, Folder, PanelLeftClose, PanelLeftOpen, Monitor, Smartphone, Tablet, Code2, Copy, Check } from 'lucide-react'

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
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(true)
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false)
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [key, setKey] = useState(0)
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components', 'app']))
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [copied, setCopied] = useState(false)

  // Resizable panels state
  const [fileTreeWidth, setFileTreeWidth] = useState(280)
  const [codeViewerWidth, setCodeViewerWidth] = useState(600)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

      // Get code content (handle both string and SandpackFile object)
      const codeContent = typeof nextAppFile === 'string' ? nextAppFile : nextAppFile.code

      // Fix import paths when moving from /src/app/page.tsx to /src/App.tsx
      // Change: import ... from '../components/X' -> './components/X'
      // Change: import ... from '../lib/X' -> './lib/X'
      let fixedCode = codeContent
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

  // Auto-select first file when files change
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0].path)
    }
  }, [files, selectedFile])

  // Handle drag for resizing panels
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      if (isDraggingLeft) {
        const newWidth = e.clientX
        if (newWidth >= 200 && newWidth <= 500) {
          setFileTreeWidth(newWidth)
        }
      }

      if (isDraggingRight) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const newWidth = e.clientX - fileTreeWidth
        if (newWidth >= 400 && newWidth <= 1200) {
          setCodeViewerWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsDraggingLeft(false)
      setIsDraggingRight(false)
    }

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDraggingLeft, isDraggingRight, fileTreeWidth])

  const handleCopyCode = () => {
    const file = files.find(f => f.path === selectedFile)
    if (file) {
      navigator.clipboard.writeText(file.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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

  // Get selected file content
  const selectedFileContent = useMemo(() => {
    const file = files.find(f => f.path === selectedFile)
    return file ? file.content : ''
  }, [files, selectedFile])

  // Get selected file name
  const selectedFileName = useMemo(() => {
    return selectedFile.split('/').pop() || 'No file selected'
  }, [selectedFile])

  // Simple syntax highlighting based on language
  const getLanguageClass = (path: string) => {
    if (path.endsWith('.tsx') || path.endsWith('.jsx')) return 'language-jsx'
    if (path.endsWith('.ts')) return 'language-typescript'
    if (path.endsWith('.js')) return 'language-javascript'
    if (path.endsWith('.css')) return 'language-css'
    if (path.endsWith('.json')) return 'language-json'
    if (path.endsWith('.html')) return 'language-html'
    return 'language-text'
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className} bg-white overflow-hidden flex`}>
      {!hasFiles ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center text-gray-500">
            <FileCode className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No files to preview</p>
            <p className="text-sm mt-2 text-gray-400">Generate code to see live preview</p>
          </div>
        </div>
      ) : (
        <>
          {/* LEFT PANEL: File Tree */}
          {isFileTreeOpen && (
            <>
              <div
                className="flex flex-col bg-gray-50 border-r border-gray-200 overflow-hidden"
                style={{ width: fileTreeWidth }}
              >
                <div className="p-3 border-b bg-white flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <Folder className="h-4 w-4 text-blue-500" />
                    Files ({files.length})
                  </h3>
                  <button
                    onClick={() => setIsFileTreeOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Hide file tree"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {renderFileTree(fileTree)}
                </div>
              </div>

              {/* LEFT DIVIDER */}
              <div
                onMouseDown={() => setIsDraggingLeft(true)}
                className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors group relative"
              >
                <div className="absolute inset-y-0 -left-1 -right-1" />
              </div>
            </>
          )}

          {/* MIDDLE PANEL: Code Viewer */}
          {isCodeViewerOpen && (
            <>
              <div
                className="flex flex-col bg-gray-900 overflow-hidden"
                style={{ width: isFileTreeOpen ? codeViewerWidth : codeViewerWidth + fileTreeWidth }}
              >
                {/* Code Viewer Header */}
                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-mono text-gray-300">{selectedFileName}</span>
                    <span className="text-xs text-gray-500 font-mono">
                      {selectedFileContent.split('\n').length} lines
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded flex items-center gap-1 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsCodeViewerOpen(false)}
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                      title="Hide code viewer"
                    >
                      <Code2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Code Content with line numbers */}
                <div className="flex-1 overflow-auto bg-gray-900 text-gray-100 font-mono text-sm">
                  {selectedFile ? (
                    <div className="flex">
                      {/* Line numbers */}
                      <div className="flex-shrink-0 px-4 py-4 bg-gray-800 text-gray-500 select-none text-right border-r border-gray-700">
                        {selectedFileContent.split('\n').map((_, i) => (
                          <div key={i} className="leading-6">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                      {/* Code content */}
                      <div className="flex-1 px-4 py-4 overflow-x-auto">
                        <pre className="leading-6">
                          <code className={getLanguageClass(selectedFile)}>
                            {selectedFileContent}
                          </code>
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <FileCode className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Select a file to view code</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT DIVIDER */}
              <div
                onMouseDown={() => setIsDraggingRight(true)}
                className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize flex-shrink-0 transition-colors group relative"
              >
                <div className="absolute inset-y-0 -left-1 -right-1" />
              </div>
            </>
          )}

          {/* RIGHT PANEL: Preview */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
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

          {/* FLOATING CONTROLS */}
          {/* Show file tree button */}
          {!isFileTreeOpen && (
            <button
              onClick={() => setIsFileTreeOpen(true)}
              className="fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/90 border border-gray-200 text-gray-900 hover:bg-white backdrop-blur-xl shadow-2xl transition-all"
              title="Show file tree"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          )}

          {/* Show code viewer button */}
          {!isCodeViewerOpen && (
            <button
              onClick={() => setIsCodeViewerOpen(true)}
              className="fixed top-4 left-20 z-50 p-3 rounded-xl bg-white/90 border border-gray-200 text-gray-900 hover:bg-white backdrop-blur-xl shadow-2xl transition-all"
              title="Show code viewer"
            >
              <Code2 className="h-5 w-5" />
            </button>
          )}

          {/* Device Mode Controls */}
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
        </>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { RefreshCw, Eye, EyeOff, Code, AlertTriangle, CheckCircle, Maximize2 } from 'lucide-react'

interface PreviewFile {
  path: string
  content: string
  language: string
}

interface SimplePreviewPanelProps {
  files: PreviewFile[]
  onPreviewUpdate?: (ready: boolean) => void
  className?: string
}

export const SimplePreviewPanel: React.FC<SimplePreviewPanelProps> = ({
  files,
  onPreviewUpdate,
  className = ''
}) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [iframeKey, setIframeKey] = useState(0)

  // Helper function to get file icon
  const getFileIcon = (path: string): string => {
    if (path.endsWith('.tsx') || path.endsWith('.jsx')) return '⚛️';
    if (path.endsWith('.ts') || path.endsWith('.js')) return '📜';
    if (path.endsWith('.css')) return '🎨';
    if (path.endsWith('.json')) return '📋';
    if (path.endsWith('.md')) return '📝';
    return '📄';
  }

  // Generate a simple HTML preview from the files
  const previewHTML = useMemo(() => {
    if (!files || files.length === 0) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 40px;
              }
              h1 {
                font-size: 2rem;
                margin-bottom: 1rem;
              }
              p {
                font-size: 1.1rem;
                opacity: 0.9;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>No Files Generated Yet</h1>
              <p>Generate some code to see the preview</p>
            </div>
          </body>
        </html>
      `
    }

    // Pre-compute file list HTML to avoid function scope issues
    const fileListHTML = files.map(file => {
      const icon = getFileIcon(file.path)
      const lineCount = file.content.split('\n').length
      return `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">${icon}</span>
            <code style="font-family: 'Courier New', monospace; font-size: 0.9rem; color: #4b5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${file.path}</code>
          </div>
          <div style="margin-top: 8px; font-size: 0.75rem; color: #9ca3af;">
            ${lineCount} lines · ${file.language}
          </div>
        </div>
      `
    }).join('')

    // Create a simple HTML preview
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            const root = document.getElementById('root');
            root.innerHTML = \`
              <div style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px;">
                <div style="max-width: 1200px; margin: 0 auto;">
                  <div style="background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: white;">
                      <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">✨ Application Generated!</h1>
                      <p style="font-size: 1.2rem; opacity: 0.9;">${files.length} production-ready files created</p>
                    </div>

                    <div style="padding: 40px;">
                      <div style="margin-bottom: 30px;">
                        <h2 style="font-size: 1.5rem; font-weight: 600; color: #1f2937; margin-bottom: 20px;">📁 Generated Files</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                          ${fileListHTML}
                        </div>
                      </div>

                      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); border-radius: 12px; padding: 30px; margin-top: 30px;">
                        <h3 style="font-size: 1.3rem; font-weight: 600; color: #1e40af; margin-bottom: 12px;">🚀 Ready to Deploy</h3>
                        <p style="color: #1e40af; margin-bottom: 20px; line-height: 1.6;">
                          Your application has been generated with modern best practices, TypeScript support, and production-ready code.
                        </p>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                          <button style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            Download Code
                          </button>
                          <button style="background: white; color: #2563eb; padding: 12px 24px; border-radius: 8px; border: 2px solid #2563eb; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            View on GitHub
                          </button>
                        </div>
                      </div>

                      <div style="margin-top: 30px; padding: 20px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px;">
                        <h4 style="font-size: 1.1rem; font-weight: 600; color: #92400e; margin-bottom: 8px;">💡 Next Steps</h4>
                        <ul style="color: #92400e; line-height: 1.8; padding-left: 20px;">
                          <li>Review the generated code in the project files</li>
                          <li>Install dependencies with <code style="background: white; padding: 2px 6px; border-radius: 4px; font-family: monospace;">npm install</code></li>
                          <li>Run the development server with <code style="background: white; padding: 2px 6px; border-radius: 4px; font-family: monospace;">npm run dev</code></li>
                          <li>Customize and extend the application to fit your needs</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            \`;
          </script>
        </body>
      </html>
    `
  }, [files])

  useEffect(() => {
    if (files && files.length > 0) {
      onPreviewUpdate?.(true)
      setIframeKey(prev => prev + 1)
    }
  }, [files, onPreviewUpdate])

  const refreshPreview = () => {
    setIframeKey(prev => prev + 1)
  }

  const hasFiles = files && files.length > 0

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-purple-400" />
          <h3 className="font-semibold text-white">Live Preview</h3>
          {hasFiles && <CheckCircle className="h-4 w-4 text-green-400" />}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            className={`p-2 rounded-md transition-colors ${
              isPreviewVisible ? 'bg-purple-500/20 text-purple-300' : 'text-white/60 hover:bg-white/10'
            }`}
            title="Toggle Preview"
          >
            {isPreviewVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          <button
            onClick={refreshPreview}
            disabled={!hasFiles}
            className="p-2 rounded-md text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative overflow-hidden bg-white">
        {!hasFiles ? (
          <div className="flex items-center justify-center h-full bg-slate-50">
            <div className="text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <div className="text-lg font-medium">No files to preview</div>
              <div className="text-sm mt-2">Files will appear here as they're generated</div>
            </div>
          </div>
        ) : !isPreviewVisible ? (
          <div className="flex items-center justify-center h-full bg-slate-100">
            <div className="text-center text-gray-500">
              <EyeOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <div className="text-lg font-medium">Preview hidden</div>
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            srcDoc={previewHTML}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Application Preview"
          />
        )}
      </div>
    </div>
  )
}

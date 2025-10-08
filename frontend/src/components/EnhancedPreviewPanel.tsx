'use client'

import React, { useState, useEffect, useRef } from 'react'
import { RefreshCw, Eye, EyeOff, Terminal, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { PreviewService } from '@/services/PreviewService'

interface PreviewFile {
  path: string
  content: string
  language: string
}

interface PreviewError {
  type: 'generation_error' | 'runtime_error' | 'network_error'
  message: string
  stack?: string
}

interface EnhancedPreviewPanelProps {
  files: PreviewFile[]
  onPreviewUpdate: (url: string) => void
  className?: string
  originalPrompt?: string
}

export const EnhancedPreviewPanel: React.FC<EnhancedPreviewPanelProps> = ({
  files,
  onPreviewUpdate,
  className = '',
  originalPrompt = 'Generated application'
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<PreviewError | null>(null)
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)
  const [showConsole, setShowConsole] = useState(false)
  const [consoleMessages, setConsoleMessages] = useState<string[]>([])
  const [lastGeneratedFiles, setLastGeneratedFiles] = useState<PreviewFile[]>([])
  
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const consoleRef = useRef<HTMLDivElement>(null)

  // Filter out development warnings and errors
  const isRelevantMessage = (message: string) => {
    const irrelevantPatterns = [
      'Download the React DevTools',
      'cdn.tailwindcss.com should not be used in production',
      'Manifest fetch from',
      'preloaded using link preload but not used',
      'Failed to load resource: the server responded with a status of 404',
      'next-auth',
      'CLIENT_FETCH_ERROR',
      'An iframe which has both allow-scripts and allow-same-origin',
      'ReactDOM.render is no longer supported in React 18',
      'Warning: React.createElement: type is invalid'
    ]

    return !irrelevantPatterns.some(pattern => message.includes(pattern))
  }

  // Capture console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow messages from localhost:5001 (backend) and localhost:3000 (frontend)
      const allowedOrigins = ['http://localhost:5001', 'http://localhost:3000', window.location.origin]
      if (!allowedOrigins.includes(event.origin)) return

      if (event.data.type === 'console') {
        const message = event.data.message
        if (isRelevantMessage(message)) {
          setConsoleMessages(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
        }
      } else if (event.data.type === 'preview-error') {
        setError({
          type: 'runtime_error',
          message: event.data.message,
          stack: event.data.stack
        })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Auto-scroll console to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [consoleMessages])

  const generatePreview = async () => {
    if (!files || files.length === 0) {
      setError({
        type: 'generation_error',
        message: 'No files to preview'
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setConsoleMessages([])

    try {
      const previewUrl = await PreviewService.generatePreview(files)
      setPreviewUrl(previewUrl)
      onPreviewUpdate(previewUrl)
      setLastGeneratedFiles(files)
      setError(null)
    } catch (err) {
      setError({
        type: 'network_error',
        message: err instanceof Error ? err.message : 'Network error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-generate preview when files change
  useEffect(() => {
    if (files && files.length > 0 && JSON.stringify(files) !== JSON.stringify(lastGeneratedFiles)) {
      generatePreview()
    }
  }, [files])

  const refreshPreview = () => {
    generatePreview()
  }

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  const getErrorIcon = () => {
    switch (error?.type) {
      case 'generation_error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'runtime_error':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'network_error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getErrorColor = () => {
    switch (error?.type) {
      case 'generation_error':
        return 'border-red-200 bg-red-50'
      case 'runtime_error':
        return 'border-yellow-200 bg-yellow-50'
      case 'network_error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-red-200 bg-red-50'
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
          {error && getErrorIcon()}
          {!error && !isLoading && previewUrl && <CheckCircle className="h-4 w-4 text-green-500" />}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`p-2 rounded-md transition-colors ${
              showConsole ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Toggle Console"
          >
            <Terminal className="h-4 w-4" />
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
            disabled={isLoading || !files || files.length === 0}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          {previewUrl && (
            <button
              onClick={openInNewTab}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`p-4 border-l-4 ${getErrorColor()}`}>
          <div className="flex items-start gap-2">
            {getErrorIcon()}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {error.type === 'generation_error' && 'Generation Error'}
                {error.type === 'runtime_error' && 'Runtime Error'}
                {error.type === 'network_error' && 'Network Error'}
              </h4>
              <p className="text-sm text-gray-700 mt-1">{error.message}</p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">Show stack trace</summary>
                  <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{error.stack}</pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Console Messages */}
      {showConsole && (
        <div className="border-b bg-gray-900 text-green-400 p-2 max-h-32 overflow-y-auto" ref={consoleRef}>
          <div className="text-xs font-mono">
            {consoleMessages.length === 0 ? (
              <div className="text-gray-500">No console messages</div>
            ) : (
              consoleMessages.map((message, index) => (
                <div key={index} className="mb-1">{message}</div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <div className="text-gray-600">Generating preview...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <div>Preview failed to load</div>
              <button
                onClick={refreshPreview}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Try again
              </button>
            </div>
          </div>
        ) : previewUrl && isPreviewVisible ? (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="Preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center text-gray-500">
              <EyeOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <div>Preview hidden</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
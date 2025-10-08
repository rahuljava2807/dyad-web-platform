'use client'

import React from 'react'
import { FileText, FileCode, FileJson, CheckCircle, Loader2, Clock } from 'lucide-react'

interface FileItem {
  path: string
  content: string
  language: string
  summary?: string
  status?: 'pending' | 'generating' | 'complete'
  timestamp?: number
}

interface FileTreePanelProps {
  files: FileItem[]
  totalExpected?: number
  className?: string
}

export const FileTreePanel: React.FC<FileTreePanelProps> = ({
  files,
  totalExpected,
  className = ''
}) => {
  const getFileIcon = (language: string, status?: string) => {
    if (status === 'generating') {
      return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
    }
    if (status === 'complete') {
      return <CheckCircle className="h-4 w-4 text-green-400" />
    }
    if (status === 'pending') {
      return <Clock className="h-4 w-4 text-gray-400" />
    }

    // File type icons
    switch (language) {
      case 'json':
        return <FileJson className="h-4 w-4 text-yellow-400" />
      case 'typescript':
      case 'javascript':
        return <FileCode className="h-4 w-4 text-blue-400" />
      case 'markdown':
        return <FileText className="h-4 w-4 text-gray-400" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getFileName = (path: string) => {
    const parts = path.split('/')
    return parts[parts.length - 1]
  }

  const getFilePath = (path: string) => {
    const parts = path.split('/')
    if (parts.length <= 1) return ''
    return parts.slice(0, -1).join('/') + '/'
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'complete':
        return 'border-green-500/30 bg-green-500/5'
      case 'generating':
        return 'border-blue-500/30 bg-blue-500/5'
      case 'pending':
        return 'border-gray-700/30 bg-gray-800/20'
      default:
        return 'border-gray-700/30 bg-gray-800/20'
    }
  }

  if (files.length === 0) {
    return null
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Generated Files</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white bg-blue-500/20 px-2 py-1 rounded">
            {files.length}{totalExpected ? ` / ${totalExpected}` : ''} files
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {files.map((file, index) => (
          <div
            key={`${file.path}-${index}`}
            className={`rounded-lg border transition-all duration-300 ${getStatusColor(file.status)} animate-slide-up`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="p-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getFileIcon(file.language, file.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">
                      {getFilePath(file.path)}
                    </span>
                    <span className="text-sm font-medium text-white truncate">
                      {getFileName(file.path)}
                    </span>
                  </div>

                  {file.summary && (
                    <p className="text-xs text-gray-400 mt-1">{file.summary}</p>
                  )}

                  {file.status === 'complete' && file.timestamp && (
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      Generated {new Date(file.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {file.status === 'generating' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300">
                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                    Writing...
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

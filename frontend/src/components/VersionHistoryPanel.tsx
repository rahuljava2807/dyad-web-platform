'use client'

import React from 'react'
import { History, RotateCcw, Check } from 'lucide-react'

interface Generation {
  id: string
  prompt: string
  filesCount: number
  timestamp: number
  files: any[]
}

interface VersionHistoryPanelProps {
  generations: Generation[]
  currentGenerationId: string
  onSelectVersion: (id: string) => void
  onRetry: () => void
  className?: string
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  generations,
  currentGenerationId,
  onSelectVersion,
  onRetry,
  className = ''
}) => {
  if (generations.length === 0) {
    return null
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-white">Version History</h3>
          <span className="text-xs text-gray-500">({generations.length} saved)</span>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded hover:bg-blue-500/20 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Retry
        </button>
      </div>

      <div className="space-y-2">
        {generations.map((gen, index) => {
          const isActive = gen.id === currentGenerationId

          return (
            <button
              key={gen.id}
              onClick={() => onSelectVersion(gen.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                isActive
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-white">
                      Version {generations.length - index}
                    </span>
                    {isActive && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 rounded text-[10px] text-blue-300">
                        <Check className="h-2.5 w-2.5" />
                        Active
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mb-1">
                    {gen.prompt}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span>{gen.filesCount} files</span>
                    <span>•</span>
                    <span>{formatTime(gen.timestamp)}</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {generations.length >= 3 && (
        <p className="text-[10px] text-gray-500 mt-2 text-center">
          Keeping last 3 generations
        </p>
      )}
    </div>
  )
}

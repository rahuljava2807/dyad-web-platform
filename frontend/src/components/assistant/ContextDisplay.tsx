/**
 * Context Display Component
 *
 * Shows current file/component context and detected patterns.
 */

import React from 'react'
import { FileText, Code, Layers, AlertTriangle } from 'lucide-react'
import { useAssistantContext } from '@/contexts/AssistantContext'
import type { Domain } from '@/types/assistant'

export function ContextDisplay() {
  const context = useAssistantContext()

  if (!context.currentFile) {
    return (
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <FileText className="w-4 h-4" />
          <span>No file selected</span>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 space-y-2">
      {/* Current File */}
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{context.currentFile}</p>
          {context.language && (
            <p className="text-xs text-slate-400">{context.language}</p>
          )}
        </div>
      </div>

      {/* Domain Badge */}
      <DomainBadge domain={context.projectId ? 'general' : 'general'} />

      {/* Quick Stats */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        {context.functions.length > 0 && (
          <div className="flex items-center gap-1">
            <Code className="w-3.5 h-3.5" />
            <span>{context.functions.length} functions</span>
          </div>
        )}
        {context.components.length > 0 && (
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{context.components.length} components</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Domain Badge Component
 */
interface DomainBadgeProps {
  domain: Domain
}

function DomainBadge({ domain }: DomainBadgeProps) {
  const domainConfig: Record<
    Domain,
    { label: string; color: string; bgColor: string; icon: React.ReactNode }
  > = {
    medical: {
      label: 'Medical',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    legal: {
      label: 'Legal',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    engineering: {
      label: 'Engineering',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      icon: <Code className="w-3 h-3" />,
    },
    architecture: {
      label: 'Architecture',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      icon: <Layers className="w-3 h-3" />,
    },
    finance: {
      label: 'Finance',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    education: {
      label: 'Education',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      icon: <Code className="w-3 h-3" />,
    },
    general: {
      label: 'General',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20',
      icon: <Code className="w-3 h-3" />,
    },
  }

  const config = domainConfig[domain]

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${config.bgColor}`}>
      <span className={config.color}>{config.icon}</span>
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </div>
  )
}

/**
 * Assistant Header Component
 *
 * Displays connection status, namespace selector, and widget controls.
 */

import React from 'react'
import { X, Minus, Link2, Link2Off, Loader2, AlertCircle } from 'lucide-react'
import { useAssistant, useAssistantConnection, useAssistantNamespace } from '@/contexts/AssistantContext'
import type { ConnectionStatus } from '@/types/assistant'

interface AssistantHeaderProps {
  onMinimize: () => void
  onClose: () => void
}

export function AssistantHeader({ onMinimize, onClose }: AssistantHeaderProps) {
  const { state } = useAssistant()
  const connection = useAssistantConnection()
  const namespace = useAssistantNamespace()

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
      {/* Left: Logo and Status */}
      <div className="flex items-center gap-3">
        {/* Yavi Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Y</span>
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-white">Yavi Assistant</h3>
            {namespace && (
              <span className="text-xs text-slate-400">{namespace.name}</span>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <ConnectionStatusIndicator status={connection.status} />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onMinimize}
          className="p-1.5 rounded hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
          aria-label="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * Connection Status Indicator
 */
interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus
}

function ConnectionStatusIndicator({ status }: ConnectionStatusIndicatorProps) {
  const statusConfig: Record<
    ConnectionStatus,
    {
      icon: React.ReactNode
      label: string
      color: string
      bgColor: string
    }
  > = {
    connected: {
      icon: <Link2 className="w-3.5 h-3.5" />,
      label: 'Connected',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    connecting: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      label: 'Connecting...',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    reconnecting: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      label: 'Reconnecting...',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
    disconnected: {
      icon: <Link2Off className="w-3.5 h-3.5" />,
      label: 'Disconnected',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20',
    },
    error: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      label: 'Error',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
  }

  const config = statusConfig[status]

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgColor}`}
      role="status"
      aria-label={config.label}
    >
      <span className={config.color}>{config.icon}</span>
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </div>
  )
}

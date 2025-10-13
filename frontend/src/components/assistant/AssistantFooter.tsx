/**
 * Assistant Footer Component
 *
 * Displays analytics, feedback controls, and settings menu.
 */

import React from 'react'
import { ThumbsUp, ThumbsDown, Settings, BarChart3 } from 'lucide-react'
import { useAssistantAnalytics } from '@/contexts/AssistantContext'

export function AssistantFooter() {
  const analytics = useAssistantAnalytics()

  return (
    <div className="px-4 py-2 bg-slate-900 border-t border-slate-700">
      <div className="flex items-center justify-between">
        {/* Analytics Summary */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{analytics.totalSuggestionsShown} suggestions</span>
          </div>
          {analytics.totalSuggestionsShown > 0 && (
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5 text-green-400" />
              <span>{Math.round(analytics.suggestionAcceptanceRate)}% accepted</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <button
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

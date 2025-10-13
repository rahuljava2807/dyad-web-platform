/**
 * Insight Panel Component
 *
 * Displays namespace insights, knowledge graph, and related documents.
 */

import React from 'react'
import { Brain, FileText, TrendingUp, ExternalLink } from 'lucide-react'
import { useAssistantInsights } from '@/contexts/AssistantContext'
import type { Insight } from '@/types/assistant'

export function InsightPanel() {
  const insights = useAssistantInsights()

  if (insights.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-slate-400">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No insights available</p>
          <p className="text-xs mt-1">Insights will appear as you code</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 space-y-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  )
}

/**
 * Insight Card Component
 */
interface InsightCardProps {
  insight: Insight
}

function InsightCard({ insight }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2.5 text-left hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-start gap-2">
          <div className="mt-0.5 text-purple-400">
            {getInsightIcon(insight.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white mb-1">{insight.title}</h4>
            <p className="text-xs text-slate-300 line-clamp-2">{insight.description}</p>
          </div>
          <div className="flex-shrink-0">
            <span className="text-xs text-slate-400">
              {Math.round(insight.relevance * 100)}% relevant
            </span>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 py-2 bg-slate-900/30 border-t border-slate-700">
          {/* Related Documents */}
          {insight.documents.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400">Related Knowledge:</p>
              {insight.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded bg-slate-950 p-2 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-medium text-white">{doc.title}</h5>
                    <span className="text-xs text-slate-500">
                      {Math.round(doc.relevanceScore * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{doc.excerpt}</p>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View document</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Get insight icon based on type
 */
function getInsightIcon(type: Insight['type']) {
  const icons = {
    'related-knowledge': <Brain className="w-4 h-4" />,
    'similar-implementation': <FileText className="w-4 h-4" />,
    'common-pitfall': <TrendingUp className="w-4 h-4" />,
    'optimization-opportunity': <TrendingUp className="w-4 h-4" />,
    'dependency-update': <FileText className="w-4 h-4" />,
  }

  return icons[type] || <Brain className="w-4 h-4" />
}

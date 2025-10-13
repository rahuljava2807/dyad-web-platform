/**
 * Suggestion List Component
 *
 * Displays active suggestions with actions.
 */

import React from 'react'
import {
  AlertTriangle,
  Lightbulb,
  Zap,
  Shield,
  CheckCircle,
  Info,
  TrendingUp,
  X,
  Check,
  ExternalLink,
} from 'lucide-react'
import { useAssistant, useAssistantSuggestions } from '@/contexts/AssistantContext'
import type { Suggestion, Priority, SuggestionCategory } from '@/types/assistant'

export function SuggestionList() {
  const suggestions = useAssistantSuggestions()

  if (suggestions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-slate-400">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No suggestions at the moment</p>
          <p className="text-xs mt-1">Keep coding, I'll help when I can!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 space-y-2">
        {suggestions.map((suggestion) => (
          <ProactiveSuggestion key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </div>
  )
}

/**
 * Proactive Suggestion Card
 */
interface ProactiveSuggestionProps {
  suggestion: Suggestion
}

export function ProactiveSuggestion({ suggestion }: ProactiveSuggestionProps) {
  const { applySuggestion, dismissSuggestion } = useAssistant()
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleApply = () => {
    applySuggestion(suggestion.id)
    // In a real implementation, this would apply the code changes
  }

  const handleDismiss = () => {
    dismissSuggestion(suggestion.id)
  }

  const handleLearnMore = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className={`rounded-lg border ${getPriorityBorderColor(suggestion.priority)} bg-slate-800/50 overflow-hidden transition-all`}
    >
      {/* Header */}
      <div className="px-3 py-2.5">
        <div className="flex items-start gap-2">
          {/* Icon */}
          <div className={`mt-0.5 ${getCategoryColor(suggestion.category)}`}>
            {getCategoryIcon(suggestion.category)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-white mb-1">{suggestion.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {suggestion.content.split('\n').slice(0, 3).join('\n')}
                  {suggestion.content.split('\n').length > 3 && '...'}
                </p>
              </div>

              {/* Priority Badge */}
              <PriorityBadge priority={suggestion.priority} />
            </div>

            {/* Metadata */}
            {suggestion.metadata.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {suggestion.metadata.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 bg-slate-900/50 border-t border-slate-700 flex items-center gap-2">
        <button
          onClick={handleApply}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply</span>
        </button>
        <button
          onClick={handleLearnMore}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>More</span>
        </button>
        <button
          onClick={handleDismiss}
          className="flex items-center justify-center p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 py-2 bg-slate-900/30 border-t border-slate-700 space-y-2">
          {/* Full Content */}
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {suggestion.content}
          </div>

          {/* Code Examples */}
          {suggestion.metadata.codeExamples && suggestion.metadata.codeExamples.length > 0 && (
            <div className="space-y-2">
              {suggestion.metadata.codeExamples.map((example, index) => (
                <div key={index} className="rounded bg-slate-950 p-2">
                  <p className="text-xs text-slate-400 mb-1">{example.description}</p>
                  <pre className="text-xs text-slate-200 font-mono overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* References */}
          {suggestion.metadata.references && suggestion.metadata.references.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400">References:</p>
              {suggestion.metadata.references.map((ref, index) => (
                <a
                  key={index}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{ref.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Priority Badge
 */
function PriorityBadge({ priority }: { priority: Priority }) {
  const config = {
    critical: { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    high: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    medium: { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    low: { label: 'Low', color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
  }[priority]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} text-xs font-medium flex-shrink-0`}>
      {config.label}
    </span>
  )
}

/**
 * Get category icon
 */
function getCategoryIcon(category: SuggestionCategory) {
  const icons = {
    compliance: <AlertTriangle className="w-4 h-4" />,
    'best-practice': <Lightbulb className="w-4 h-4" />,
    performance: <Zap className="w-4 h-4" />,
    security: <Shield className="w-4 h-4" />,
    quality: <CheckCircle className="w-4 h-4" />,
    insight: <Info className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    tip: <TrendingUp className="w-4 h-4" />,
  }

  return icons[category]
}

/**
 * Get category color
 */
function getCategoryColor(category: SuggestionCategory): string {
  const colors = {
    compliance: 'text-red-400',
    'best-practice': 'text-blue-400',
    performance: 'text-yellow-400',
    security: 'text-red-400',
    quality: 'text-green-400',
    insight: 'text-purple-400',
    warning: 'text-orange-400',
    tip: 'text-cyan-400',
  }

  return colors[category]
}

/**
 * Get priority border color
 */
function getPriorityBorderColor(priority: Priority): string {
  const colors = {
    critical: 'border-red-500/50',
    high: 'border-orange-500/50',
    medium: 'border-yellow-500/50',
    low: 'border-slate-600',
  }

  return colors[priority]
}

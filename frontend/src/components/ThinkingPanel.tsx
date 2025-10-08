'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Brain, CheckCircle, Loader2 } from 'lucide-react'

interface ThinkingStep {
  step: string
  title: string
  description: string
  details?: string[]
  timestamp: number
  completed?: boolean
}

interface ThinkingPanelProps {
  steps: ThinkingStep[]
  currentStep?: string
  className?: string
}

export const ThinkingPanel: React.FC<ThinkingPanelProps> = ({
  steps,
  currentStep,
  className = ''
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(stepId)) {
        next.delete(stepId)
      } else {
        next.add(stepId)
      }
      return next
    })
  }

  const getStepIcon = (step: ThinkingStep) => {
    if (step.completed) {
      return <CheckCircle className="h-4 w-4 text-green-400" />
    }
    if (step.step === currentStep) {
      return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
    }
    return <Brain className="h-4 w-4 text-gray-400" />
  }

  const getStepColor = (step: ThinkingStep) => {
    if (step.completed) {
      return 'border-green-500/30 bg-green-500/5'
    }
    if (step.step === currentStep) {
      return 'border-blue-500/30 bg-blue-500/5'
    }
    return 'border-gray-700/30 bg-gray-800/20'
  }

  if (steps.length === 0) {
    return null
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-5 w-5 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">AI Reasoning</h3>
        <span className="text-xs text-gray-400">({steps.length} steps)</span>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.step)
          const isActive = step.step === currentStep
          const hasDetails = step.details && step.details.length > 0

          return (
            <div
              key={`${step.step}-${index}`}
              className={`rounded-lg border transition-all duration-300 ${getStepColor(step)} ${
                isActive ? 'ring-1 ring-blue-500/50 shadow-lg shadow-blue-500/10' : ''
              }`}
            >
              <div
                className={`p-3 ${hasDetails ? 'cursor-pointer hover:bg-white/5' : ''}`}
                onClick={() => hasDetails && toggleStep(step.step)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStepIcon(step)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white">{step.title}</h4>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300">
                          <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{step.description}</p>

                    {/* Expanded details */}
                    {isExpanded && hasDetails && (
                      <div className="mt-3 space-y-1.5 animate-slide-down">
                        {step.details!.map((detail, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs text-gray-300 animate-fade-in"
                            style={{ animationDelay: `${i * 50}ms` }}
                          >
                            <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {hasDetails && (
                    <button
                      className="text-gray-500 hover:text-gray-300 transition-transform duration-200"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              {step.completed && (
                <div className="px-3 pb-2">
                  <span className="text-[10px] text-gray-500">
                    Completed {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

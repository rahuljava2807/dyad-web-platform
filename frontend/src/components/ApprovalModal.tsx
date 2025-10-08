'use client'

import React from 'react'
import { X, Sparkles, Code, Zap, CheckCircle } from 'lucide-react'

interface ApprovalModalProps {
  prompt: string
  estimatedFiles?: number
  techStack?: string[]
  onApprove: () => void
  onReject: () => void
  className?: string
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  prompt,
  estimatedFiles = 10,
  techStack = ['React', 'TypeScript', 'Tailwind CSS'],
  onApprove,
  onReject,
  className = ''
}) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${className}`}>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ready to Generate</h2>
              <p className="text-sm text-gray-400">Review your request before we create your app</p>
            </div>
          </div>
          <button
            onClick={onReject}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Prompt Display */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-300 mb-2 block">Your Request</label>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white text-base leading-relaxed">{prompt}</p>
          </div>
        </div>

        {/* Generation Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Estimated Files */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Estimated Files</span>
            </div>
            <p className="text-2xl font-bold text-white">{estimatedFiles}+ files</p>
            <p className="text-xs text-gray-400 mt-1">Production-ready code</p>
          </div>

          {/* Tech Stack */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Technology</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {techStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/10 text-white text-xs rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-300 mb-3">What happens next</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-300">AI analyzes your request and plans the architecture</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-300">Generates {estimatedFiles}+ production-ready files with best practices</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-300">Shows live preview with instant deployment capability</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onApprove}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
          >
            Generate Application
          </button>
          <button
            onClick={onReject}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Generation typically takes 10-30 seconds • Powered by AI
        </p>
      </div>
    </div>
  )
}

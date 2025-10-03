/**
 * Diagnostic Panel Component
 * Phase 5: Displays detailed error diagnostic information
 */

import React, { useState } from 'react';
import { DiagnosticReport } from '@/types/diagnostics.types';
import { AnyPreviewError } from '@/services/error-types';

interface DiagnosticPanelProps {
  diagnostic: DiagnosticReport;
  error: AnyPreviewError;
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  onAcceptFix?: (fixIndex: number) => void;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  diagnostic,
  error,
  isOpen,
  onClose,
  onRetry,
  onAcceptFix,
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'code' | 'fixes'>('overview');

  if (!isOpen) return null;

  const severityColor = {
    critical: 'text-red-600',
    major: 'text-orange-600',
    minor: 'text-yellow-600',
  }[diagnostic.severity];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Error Diagnostic</h2>
                <p className="text-sm text-gray-600 mt-1">{diagnostic.summary}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`pb-2 border-b-2 transition-colors ${
                  selectedTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('code')}
                className={`pb-2 border-b-2 transition-colors ${
                  selectedTab === 'code'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Code Context
              </button>
              <button
                onClick={() => setSelectedTab('fixes')}
                className={`pb-2 border-b-2 transition-colors ${
                  selectedTab === 'fixes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Suggested Fixes ({diagnostic.suggestedFixes.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {selectedTab === 'overview' && (
              <div className="space-y-4">
                {/* Severity and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Severity</p>
                    <p className={`text-lg font-semibold ${severityColor}`}>
                      {diagnostic.severity.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {diagnostic.errorCategory.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                {/* Root Cause */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Root Cause</h3>
                  <p className="text-sm text-gray-700 bg-red-50 p-3 rounded border-l-4 border-red-500">
                    {diagnostic.rootCause}
                  </p>
                </div>

                {/* Affected Files */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Affected Files</h3>
                  <div className="space-y-2">
                    {diagnostic.failedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-red-700 font-mono">{file}</span>
                      </div>
                    ))}
                  </div>
                  {diagnostic.retainedFiles.length > 0 && (
                    <>
                      <h3 className="text-sm font-semibold text-gray-900 mt-4 mb-2">Working Files</h3>
                      <div className="space-y-2">
                        {diagnostic.retainedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-700 font-mono">{file}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Specific Issues */}
                {diagnostic.specificIssues.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Specific Issues</h3>
                    <div className="space-y-2">
                      {diagnostic.specificIssues.map((issue, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 p-3 rounded">
                          <p className={`font-semibold ${severityColor}`}>
                            [{issue.severity}] {issue.type}
                          </p>
                          <p className="text-gray-700 mt-1">{issue.description}</p>
                          {issue.location && (
                            <p className="text-gray-500 text-xs mt-1 font-mono">
                              {issue.location.file}
                              {issue.location.line && `:${issue.location.line}`}
                              {issue.location.column && `:${issue.location.column}`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence */}
                <div className="bg-blue-50 p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-900">Diagnosis Confidence</span>
                    <span className="text-sm font-semibold text-blue-900">{diagnostic.confidence}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${diagnostic.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'code' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Code Context</h3>
                  <p className="text-xs text-gray-600 mb-2">{diagnostic.affectedCode}</p>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs font-mono">
                    {diagnostic.codeContext}
                  </pre>
                </div>
              </div>
            )}

            {selectedTab === 'fixes' && (
              <div className="space-y-3">
                {diagnostic.suggestedFixes.map((fix, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 p-4 rounded border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-blue-600 uppercase px-2 py-1 bg-blue-100 rounded">
                            {fix.type}
                          </span>
                          {fix.automated && (
                            <span className="text-xs text-green-600 px-2 py-1 bg-green-100 rounded">
                              Automated
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2">{fix.description}</p>
                        <p className="text-xs text-gray-600 mb-2">Target: {fix.target}</p>
                        {fix.example && (
                          <pre className="text-xs bg-white p-2 rounded border border-gray-300 font-mono overflow-x-auto">
                            {fix.example}
                          </pre>
                        )}
                      </div>
                      {onAcceptFix && fix.automated && (
                        <button
                          onClick={() => onAcceptFix(idx)}
                          className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Apply Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Attempt {error.attemptNumber} of 3
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  Close
                </button>
                {onRetry && error.attemptNumber < 3 && (
                  <button
                    onClick={onRetry}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Retry Auto-Fix
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

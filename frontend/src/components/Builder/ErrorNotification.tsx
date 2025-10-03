/**
 * Error Notification Component
 * Phase 5: Displays error notifications with auto-heal status
 */

import React from 'react';
import { AnyPreviewError } from '@/services/error-types';
import { DiagnosticReport } from '@/types/diagnostics.types';
import { SelfHealState } from '@/services/self-heal.service';

interface ErrorNotificationProps {
  error: AnyPreviewError | null;
  diagnostic: DiagnosticReport | null;
  healingState: SelfHealState;
  onDismiss?: () => void;
  onViewDetails?: () => void;
  onManualFix?: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  diagnostic,
  healingState,
  onDismiss,
  onViewDetails,
  onManualFix,
}) => {
  if (!error && !healingState.isHealing) return null;

  // Auto-healing state
  if (healingState.isHealing) {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-md">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-blue-800">Auto-Fixing Error</p>
              <p className="mt-1 text-sm text-blue-700">{healingState.healingMessage}</p>
              {healingState.currentAttempt > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
                    <span>Progress</span>
                    <span>Attempt {healingState.currentAttempt}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(healingState.currentAttempt / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!error || !diagnostic) return null;

  const severityColors = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      icon: 'text-red-500',
      text: 'text-red-800',
      textLight: 'text-red-700',
    },
    major: {
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      icon: 'text-orange-500',
      text: 'text-orange-800',
      textLight: 'text-orange-700',
    },
    minor: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      icon: 'text-yellow-500',
      text: 'text-yellow-800',
      textLight: 'text-yellow-700',
    },
  };

  const colors = severityColors[diagnostic.severity];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`${colors.bg} border-l-4 ${colors.border} p-4 rounded shadow-lg`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className={`h-5 w-5 ${colors.icon}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${colors.text}`}>{diagnostic.summary}</p>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`ml-2 ${colors.textLight} hover:${colors.text}`}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
            <p className={`mt-1 text-xs ${colors.textLight}`}>
              {diagnostic.errorCategory.replace(/_/g, ' ')}
            </p>
            <p className={`mt-2 text-sm ${colors.textLight}`}>{diagnostic.rootCause}</p>

            {/* Quick Actions */}
            <div className="mt-3 flex gap-2">
              {onViewDetails && (
                <button
                  onClick={onViewDetails}
                  className={`text-xs px-3 py-1 rounded ${colors.border} border bg-white ${colors.text} hover:bg-opacity-10`}
                >
                  View Details
                </button>
              )}
              {onManualFix && error.attemptNumber >= 3 && (
                <button
                  onClick={onManualFix}
                  className={`text-xs px-3 py-1 rounded ${colors.bg} ${colors.text} hover:opacity-80`}
                >
                  Manual Fix Required
                </button>
              )}
            </div>

            {/* Attempt indicator */}
            {error.attemptNumber > 1 && (
              <div className={`mt-2 text-xs ${colors.textLight}`}>
                Attempt {error.attemptNumber} of 3
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

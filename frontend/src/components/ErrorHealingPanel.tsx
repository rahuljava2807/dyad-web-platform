import React, { useState } from 'react'
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface PreviewError {
  type: 'component_export' | 'import_error' | 'syntax_error' | 'runtime_error'
  message: string
  stack?: string
  file?: string
  line?: number
  column?: number
}

interface ErrorHealingPanelProps {
  error: PreviewError
  originalPrompt: string
  generatedFiles: Array<{
    path: string
    content: string
    language: string
  }>
  onHealingComplete: (fixedFiles: Array<{
    path: string
    content: string
    language: string
  }>) => void
  onHealingError: (error: string) => void
}

interface HealingResult {
  success: boolean
  fixedFiles?: Array<{
    path: string
    content: string
    language: string
  }>
  explanation?: string
  validation?: {
    valid: boolean
    issues: string[]
  }
  error?: string
}

export const ErrorHealingPanel: React.FC<ErrorHealingPanelProps> = ({
  error,
  originalPrompt,
  generatedFiles,
  onHealingComplete,
  onHealingError
}) => {
  const [isHealing, setIsHealing] = useState(false)
  const [healingResult, setHealingResult] = useState<HealingResult | null>(null)
  const [healingAttempts, setHealingAttempts] = useState(0)

  const analyzeError = (error: PreviewError) => {
    const message = error.message.toLowerCase()

    if (message.includes('element type is invalid') || message.includes('undefined')) {
      return {
        strategy: 'fix_exports',
        priority: 'high',
        description: 'Component export/import issue - likely missing default export or incorrect import'
      }
    }

    if (message.includes('cannot resolve module') || message.includes('module not found')) {
      return {
        strategy: 'fix_imports',
        priority: 'high',
        description: 'Import resolution issue - missing dependencies or incorrect paths'
      }
    }

    if (message.includes('syntax error') || message.includes('unexpected token')) {
      return {
        strategy: 'fix_syntax',
        priority: 'high',
        description: 'Syntax error in generated code'
      }
    }

    return {
      strategy: 'regenerate',
      priority: 'medium',
      description: 'Complex error requiring full regeneration'
    }
  }

  const handleHealError = async () => {
    if (healingAttempts >= 3) {
      onHealingError('Maximum healing attempts reached. Please try a different approach.')
      return
    }

    setIsHealing(true)
    setHealingResult(null)

    try {
      const response = await fetch('http://localhost:5000/api/error-healing/heal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalPrompt,
          generatedFiles,
          error,
          previousAttempts: healingAttempts
        })
      })

      const result: HealingResult = await response.json()

      if (result.success && result.fixedFiles) {
        setHealingResult(result)
        setHealingAttempts(prev => prev + 1)
        
        // Auto-apply the healing if validation passes
        if (result.validation?.valid) {
          setTimeout(() => {
            onHealingComplete(result.fixedFiles!)
          }, 1500)
        }
      } else {
        setHealingResult(result)
        onHealingError(result.error || 'Error healing failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to heal error'
      setHealingResult({ success: false, error: errorMessage })
      onHealingError(errorMessage)
    } finally {
      setIsHealing(false)
    }
  }

  const analysis = analyzeError(error)

  return (
    <Card className="w-full p-4 border-red-200 bg-red-50">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 space-y-3">
          {/* Error Header */}
          <div>
            <h3 className="text-sm font-semibold text-red-900">Preview Error Detected</h3>
            <p className="text-xs text-red-700 mt-1">{analysis.description}</p>
          </div>

          {/* Error Details */}
          <div className="bg-red-100 rounded-md p-3">
            <div className="text-xs text-red-800">
              <div className="font-medium mb-1">Error Details:</div>
              <div className="font-mono text-xs break-all">{error.message}</div>
            </div>
          </div>

          {/* Healing Status */}
          {isHealing && (
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing error and generating fixes...</span>
            </div>
          )}

          {healingResult && (
            <div className="space-y-2">
              {healingResult.success ? (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>{healingResult.explanation}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <XCircle className="h-4 w-4" />
                  <span>{healingResult.error}</span>
                </div>
              )}

              {healingResult.validation && (
                <div className="text-xs">
                  <div className={`font-medium ${healingResult.validation.valid ? 'text-green-700' : 'text-yellow-700'}`}>
                    Validation: {healingResult.validation.valid ? 'Passed' : 'Issues found'}
                  </div>
                  {healingResult.validation.issues.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {healingResult.validation.issues.map((issue, index) => (
                        <li key={index} className="text-yellow-700">• {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {healingResult.success && healingResult.fixedFiles && (
                <div className="text-xs text-blue-700">
                  Generated {healingResult.fixedFiles.length} fixed files
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleHealError}
              disabled={isHealing || healingAttempts >= 3}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {isHealing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Healing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Auto-Heal ({healingAttempts}/3)
                </>
              )}
            </Button>

            {healingResult?.success && healingResult.fixedFiles && (
              <Button
                onClick={() => onHealingComplete(healingResult.fixedFiles!)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-3 w-3 mr-2" />
                Apply Fix
              </Button>
            )}
          </div>

          {healingAttempts >= 3 && (
            <div className="text-xs text-red-600">
              Maximum healing attempts reached. Consider regenerating with a different prompt.
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

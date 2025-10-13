'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Code, FileText, Zap, CheckCircle, ArrowRight, Eye } from 'lucide-react'
import { ImprovedSandpackPreview } from '@/components/ImprovedSandpackPreview'
import { ThinkingPanel } from '@/components/ThinkingPanel'
import { FileTreePanel } from '@/components/FileTreePanel'
import { ApprovalModal } from '@/components/ApprovalModal'
import { VersionHistoryPanel } from '@/components/VersionHistoryPanel'

interface GeneratedFile {
  path: string
  content: string
  language: string
  summary?: string
  status?: 'pending' | 'generating' | 'complete'
  timestamp?: number
}

interface ThinkingStep {
  step: string
  title: string
  description: string
  details?: string[]
  timestamp: number
  completed?: boolean
}

type GenerationStep = 'thinking' | 'generating' | 'writing' | 'preview' | 'complete'

export default function GeneratePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt') || ''
  const provider = (searchParams.get('provider') || 'anthropic') as 'anthropic' | 'openai'

  const [showApprovalModal, setShowApprovalModal] = useState(true)
  const [currentStep, setCurrentStep] = useState<GenerationStep>('thinking')
  const [files, setFiles] = useState<GeneratedFile[]>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [thinking, setThinking] = useState('')
  const [capabilities, setCapabilities] = useState<string[]>([])
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([])
  const [totalExpectedFiles, setTotalExpectedFiles] = useState<number>(0)
  const [generationStartTime, setGenerationStartTime] = useState<number>(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number>(0)
  const [generations, setGenerations] = useState<Array<{id: string, prompt: string, filesCount: number, timestamp: number, files: GeneratedFile[]}>>([])
  const [currentGenerationId, setCurrentGenerationId] = useState<string>('')

  const steps = [
    { key: 'thinking', icon: Sparkles, label: 'Analyzing Requirements', color: 'text-blue-500' },
    { key: 'generating', icon: Zap, label: 'Generating Components', color: 'text-purple-500' },
    { key: 'writing', icon: Code, label: 'Writing Code', color: 'text-green-500' },
    { key: 'preview', icon: Eye, label: 'Building Preview', color: 'text-orange-500' },
    { key: 'complete', icon: CheckCircle, label: 'Complete', color: 'text-green-600' }
  ]

  const handleApprove = () => {
    setShowApprovalModal(false)
    generateApplication()
  }

  const handleReject = () => {
    router.push('/dashboard/projects/new')
  }

  const handleSelectVersion = (id: string) => {
    const generation = generations.find(g => g.id === id)
    if (generation) {
      setCurrentGenerationId(id)
      setFiles(generation.files)
    }
  }

  const handleRetry = () => {
    setShowApprovalModal(true)
    setFiles([])
    setThinkingSteps([])
    setCapabilities([])
    setProgress(0)
    setCurrentStep('thinking')
  }

  useEffect(() => {
    if (!prompt) {
      setError('No prompt provided')
      setShowApprovalModal(false)
      return
    }
  }, [prompt])

  const generateApplication = async () => {
    try {
      setCurrentStep('thinking')
      setProgress(5)

      // Use fetch with SSE streaming
      const response = await fetch('/api/generation/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          settings: {
            provider: provider, // Use selected provider from UI
            selectedIndustry: 'general'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start generation stream')
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      // Track file accumulation
      const accumulatedFiles: GeneratedFile[] = []

      // Read SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          console.log('Stream complete')

          // FALLBACK: If we received files but stream ended without complete event,
          // automatically transition to preview (fixes stuck loading state)
          if (accumulatedFiles.length > 0 && currentStep !== 'preview') {
            console.log('Stream ended with files, auto-transitioning to preview')
            const genId = `gen-${Date.now()}`
            setCurrentGenerationId(genId)
            setGenerations(prev => {
              const newGen = {
                id: genId,
                prompt,
                filesCount: accumulatedFiles.length,
                timestamp: Date.now(),
                files: accumulatedFiles
              }
              return [...prev, newGen].slice(-3)
            })
            setCurrentStep('preview')
            setProgress(90)
            setThinking('Building live preview...')
            setTimeout(() => {
              setCurrentStep('complete')
              setProgress(100)
              setThinking('Application ready!')
            }, 1000)
          }
          break
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7).trim()
            continue // Skip event line, we'll use the data
          }

          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()

            try {
              const data = JSON.parse(dataStr)

              // Handle different event types
              if (data.sessionId) {
                // Session event
                console.log('Session started:', data.sessionId)
              } else if (data.step) {
                // Thinking event
                console.log('Thinking:', data.title)
                setThinking(data.description)

                // Mark previous thinking steps as completed
                setThinkingSteps(prev => {
                  const updated = prev.map(s => ({ ...s, completed: true }))
                  return [...updated, {
                    step: data.step,
                    title: data.title,
                    description: data.description,
                    details: data.details || [],
                    timestamp: data.timestamp,
                    completed: false
                  }]
                })

                if (data.step === 'analyze') {
                  setCurrentStep('thinking')
                  setProgress(10)
                } else if (data.step === 'plan') {
                  setCurrentStep('generating')
                  setProgress(20)
                } else if (data.step === 'generate') {
                  setCurrentStep('writing')
                  setProgress(30)
                }
              } else if (data.path) {
                // File event
                console.log(`File: ${data.path} (${data.index + 1}/${data.total})`)

                // Set total expected files and start time on first file
                if (data.total && totalExpectedFiles === 0) {
                  setTotalExpectedFiles(data.total)
                  setGenerationStartTime(Date.now())
                }

                const newFile: GeneratedFile = {
                  path: data.path,
                  content: data.content,
                  language: data.language,
                  summary: data.summary,
                  status: 'complete',
                  timestamp: data.timestamp
                }

                accumulatedFiles.push(newFile)
                setFiles([...accumulatedFiles])

                // Calculate ETA
                const filesCompleted = data.index + 1
                const filesRemaining = data.total - filesCompleted
                if (filesCompleted > 0 && filesRemaining > 0) {
                  const elapsedTime = Date.now() - (generationStartTime || Date.now())
                  const avgTimePerFile = elapsedTime / filesCompleted
                  const eta = Math.round((avgTimePerFile * filesRemaining) / 1000) // in seconds
                  setEstimatedTimeRemaining(eta)
                }

                const fileProgress = 30 + ((data.index + 1) / data.total) * 50
                setProgress(Math.round(fileProgress))
                setThinking(`Generated file ${data.index + 1} of ${data.total}: ${data.path}`)

                if (data.summary) {
                  setCapabilities(prev => [...prev, `✅ ${data.summary}`])
                }
              } else if (data.filesCount) {
                // Complete event
                console.log('Complete:', data.filesCount, 'files')

                // Store this generation (keep last 3)
                const genId = `gen-${Date.now()}`
                setCurrentGenerationId(genId)
                setGenerations(prev => {
                  const newGen = {
                    id: genId,
                    prompt,
                    filesCount: data.filesCount,
                    timestamp: Date.now(),
                    files: accumulatedFiles
                  }
                  const updated = [...prev, newGen]
                  // Keep only last 3 generations
                  return updated.slice(-3)
                })

                setCurrentStep('preview')
                setProgress(90)
                setThinking('Building live preview...')

                setTimeout(() => {
                  setCurrentStep('complete')
                  setProgress(100)
                  setThinking('Application ready!')
                }, 1000)
              } else if (data.error) {
                // Error event
                console.error('Error:', data.error)
                setError(data.error)
                setCurrentStep('thinking')
                break
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', dataStr)
            }
          }
        }
      }

    } catch (err: any) {
      console.error('Generation error:', err)
      setError(err.message || 'Failed to generate application')
      setCurrentStep('thinking')
    }
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.key === currentStep)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Approval Modal */}
      {showApprovalModal && prompt && (
        <ApprovalModal
          prompt={prompt}
          estimatedFiles={10}
          techStack={['React', 'TypeScript', 'Tailwind CSS', 'shadcn/ui']}
          provider={provider}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Compact Status Banner - Only show during generation */}
      {currentStep !== 'complete' && currentStep !== 'preview' && (
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl flex-shrink-0">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = index === getCurrentStepIndex()
                  const isComplete = index < getCurrentStepIndex()
                  if (!isActive && !isComplete) return null

                  return (
                    <div key={step.key} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                        isActive ? `${step.color} border-current bg-current/10` :
                        'border-green-500 bg-green-500/10 text-green-500'
                      }`}>
                        {isComplete ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <StepIcon className="h-4 w-4 animate-pulse" />
                        )}
                      </div>
                      {isActive && <span className="text-sm font-medium text-white">{thinking}</span>}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4">
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60 font-mono">{progress}%</span>
                  {estimatedTimeRemaining > 0 && (
                    <span className="text-xs text-white/40 font-mono">
                      • ~{estimatedTimeRemaining}s remaining
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-md">
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={() => router.push('/dashboard/projects/new')}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Live Preview - Full Screen */}
            {currentStep === 'preview' || currentStep === 'complete' ? (
              <div className="w-full h-full">
                <ImprovedSandpackPreview files={files} />
              </div>
            ) : (
              /* Loading State - Centered with animations */
              <div className="flex items-center justify-center h-full">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center max-w-2xl backdrop-blur-sm animate-slide-up">
                  <div className="mb-6">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon
                      const isActive = index === getCurrentStepIndex()
                      if (!isActive) return null

                      return (
                        <div key={step.key} className="flex flex-col items-center gap-4">
                          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 ${step.color} border-current bg-current/10 shadow-lg`}>
                            <StepIcon className="h-10 w-10 animate-pulse-slow" />
                            <div className={`absolute inset-0 rounded-full ${step.color.replace('text', 'bg')}/20 animate-ping`} />
                          </div>
                          <h2 className="text-2xl font-bold text-white animate-pulse-slow">{step.label}</h2>
                        </div>
                      )
                    })}
                  </div>

                  {capabilities.length > 0 && (
                    <div className="mt-8 space-y-2 text-left">
                      {[...new Set(capabilities)].slice(-3).map((capability, index) => (
                        <div
                          key={`${capability}-${index}`}
                          className="text-white/80 text-sm flex items-center gap-2 animate-slide-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Reasoning Panel */}
                  {thinkingSteps.length > 0 && (
                    <div className="mt-8">
                      <ThinkingPanel
                        steps={thinkingSteps}
                        currentStep={thinkingSteps[thinkingSteps.length - 1]?.step}
                      />
                    </div>
                  )}

                  {/* File Tree Panel */}
                  {files.length > 0 && (
                    <div className="mt-8">
                      <FileTreePanel
                        files={files}
                        totalExpected={totalExpectedFiles}
                      />
                    </div>
                  )}

                  {/* Version History Panel */}
                  {generations.length > 0 && currentStep === 'complete' && (
                    <div className="mt-8">
                      <VersionHistoryPanel
                        generations={generations}
                        currentGenerationId={currentGenerationId}
                        onSelectVersion={handleSelectVersion}
                        onRetry={handleRetry}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Floating Success Badge - Only when complete */}
            {currentStep === 'complete' && (
              <div className="fixed top-20 right-6 z-50 animate-success-pop">
                <div className="bg-green-500/10 border border-green-500/30 backdrop-blur-xl rounded-xl px-4 py-3 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-400">Generated!</p>
                      <p className="text-xs text-green-300/60">{files.length} files</p>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/projects/${params.id}`)}
                      className="ml-2 px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      View Project
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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

      {/* Top Header with Logo */}
      <div className="border-b border-white/10 bg-black/30 backdrop-blur-xl flex-shrink-0">
        <div className="px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
              <Image
                src="/images/logos/Yavi-logo.webp"
                alt="Yavi Studio"
                fill
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
            <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
              Studio
            </span>
          </Link>
          <div className="text-xs text-white/40">
            AI Code Generation in Progress
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen Layout */}
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
          <div className="flex h-full">
            {/* Conditional Layout: During generation vs Complete */}
            {currentStep === 'preview' || currentStep === 'complete' ? (
              <>
                {/* PREVIEW MODE: Preview on LEFT (70%), Info on RIGHT (30%) */}
                <div className="w-[70%] flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                  <div className="w-full h-full animate-fade-in">
                    <ImprovedSandpackPreview files={files} />
                  </div>

                  {/* Floating Success Badge */}
                  {currentStep === 'complete' && (
                    <div className="absolute top-6 left-6 z-50 animate-success-pop">
                      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 border-2 border-blue-400/50 backdrop-blur-xl rounded-xl px-5 py-4 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <CheckCircle className="h-6 w-6 text-blue-400" />
                            <div className="absolute inset-0 bg-blue-400/30 rounded-full animate-ping" />
                          </div>
                          <div>
                            <p className="text-base font-bold text-blue-300">✨ Generated!</p>
                            <p className="text-xs text-blue-200/80">{files.length} production files</p>
                          </div>
                          <button
                            onClick={() => router.push('/dashboard')}
                            className="ml-2 px-4 py-2 bg-blue-500 text-white font-semibold text-sm rounded-lg hover:bg-blue-400 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Back to Dashboard
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Sidebar - Compact (30%) */}
                <div className="w-[30%] border-l border-white/10 bg-black/20 backdrop-blur-sm flex flex-col overflow-hidden">
                  {/* Compact Stats Header */}
                  <div className="flex-shrink-0 p-6 border-b border-white/10">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 border-2 border-green-500/50 mb-3">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">Generation Complete</h3>
                      <p className="text-sm text-white/60">{files.length} files • {files.reduce((sum, f) => sum + f.content.split('\n').length, 0)} lines</p>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* File Tree */}
                    {files.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-400" />
                          Files Generated
                        </h4>
                        <FileTreePanel
                          files={files}
                          totalExpected={totalExpectedFiles}
                        />
                      </div>
                    )}

                    {/* Features */}
                    {capabilities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          Features
                        </h4>
                        <div className="space-y-1">
                          {[...new Set(capabilities)].slice(0, 5).map((capability, index) => (
                            <div
                              key={`${capability}-${index}`}
                              className="text-white/70 text-xs flex items-start gap-2 p-2 rounded-lg bg-white/5"
                            >
                              <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{capability}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Version History */}
                    {generations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                          <Code className="h-4 w-4 text-orange-400" />
                          History
                        </h4>
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
              </>
            ) : (
              <>
                {/* GENERATION MODE: Info on LEFT (40%), Simulation on RIGHT (60%) */}
                <div className="w-[40%] border-r border-white/10 bg-black/20 backdrop-blur-sm flex flex-col overflow-hidden">
              {/* Progress Ring & Current Step */}
              <div className="flex-shrink-0 p-8 border-b border-white/10">
                <div className="flex items-center gap-6">
                  {/* Circular Progress Ring */}
                  <div className="relative">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{progress}%</span>
                    </div>
                  </div>

                  {/* Current Step Info */}
                  <div className="flex-1">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon
                      const isActive = index === getCurrentStepIndex()
                      if (!isActive) return null

                      return (
                        <div key={step.key} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.color} bg-current/20 border-2 border-current`}>
                              <StepIcon className="h-5 w-5 animate-pulse" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{step.label}</h3>
                              {estimatedTimeRemaining > 0 && (
                                <p className="text-xs text-white/50">~{estimatedTimeRemaining}s remaining</p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-white/70 mt-2">{thinking}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Step Progress Indicators */}
                <div className="flex items-center gap-2 mt-6">
                  {steps.map((step, index) => {
                    const isComplete = index < getCurrentStepIndex()
                    const isActive = index === getCurrentStepIndex()
                    return (
                      <div key={step.key} className="flex-1">
                        <div className={`h-1.5 rounded-full transition-all duration-500 ${
                          isComplete ? 'bg-green-500' :
                          isActive ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-green-500' :
                          'bg-white/10'
                        }`} />
                        <p className={`text-xs mt-1 text-center transition-colors ${
                          isActive ? 'text-white font-medium' : 'text-white/40'
                        }`}>
                          {step.key}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* AI Reasoning Steps */}
                {thinkingSteps.length > 0 && (
                  <div className="animate-slide-up">
                    <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-400" />
                      AI Reasoning
                    </h4>
                    <ThinkingPanel
                      steps={thinkingSteps}
                      currentStep={thinkingSteps[thinkingSteps.length - 1]?.step}
                    />
                  </div>
                )}

                {/* Capabilities List */}
                {capabilities.length > 0 && (
                  <div className="space-y-2 animate-slide-up">
                    <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Features Added
                    </h4>
                    <div className="space-y-2">
                      {[...new Set(capabilities)].map((capability, index) => (
                        <div
                          key={`${capability}-${index}`}
                          className="text-white/70 text-sm flex items-start gap-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm animate-slide-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Tree */}
                {files.length > 0 && (
                  <div className="animate-slide-up">
                    <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-400" />
                      Generated Files ({files.length}/{totalExpectedFiles || files.length})
                    </h4>
                    <FileTreePanel
                      files={files}
                      totalExpected={totalExpectedFiles}
                    />
                  </div>
                )}

                {/* Version History */}
                {generations.length > 0 && (
                  <div className="animate-slide-up">
                    <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                      <Code className="h-4 w-4 text-orange-400" />
                      Version History
                    </h4>
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

            {/* RIGHT PANEL - Simulation During Generation (60%) */}
            <div className="w-[60%] flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              {/* Simulation & Real-time Updates During Generation */}
                <div className="flex-1 flex flex-col items-center justify-center p-12 relative overflow-hidden">
                  {/* Animated Background Grid */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
                      backgroundSize: '50px 50px',
                      animation: 'grid-flow 20s linear infinite'
                    }} />
                  </div>

                  {/* Code Rain Effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute text-blue-500/30 font-mono text-xs animate-code-fall"
                        style={{
                          left: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 5}s`,
                          animationDuration: `${5 + Math.random() * 10}s`
                        }}
                      >
                        {['<div>', 'const', 'function', 'import', 'export', 'return', '{}', '[]', '=>'][Math.floor(Math.random() * 9)]}
                      </div>
                    ))}
                  </div>

                  {/* Central Animation */}
                  <div className="relative z-10 text-center space-y-8">
                    {/* Large Icon Animation */}
                    {steps.map((step, index) => {
                      const StepIcon = step.icon
                      const isActive = index === getCurrentStepIndex()
                      if (!isActive) return null

                      return (
                        <div key={step.key} className="animate-scale-in">
                          <div className="relative inline-flex">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${step.color} border-4 border-current bg-current/10 shadow-2xl backdrop-blur-xl`}>
                              <StepIcon className="h-16 w-16 animate-pulse-slow" />
                            </div>
                            {/* Pulse Rings */}
                            <div className={`absolute inset-0 rounded-full ${step.color.replace('text', 'bg')}/20 animate-ping`} />
                            <div className={`absolute -inset-4 rounded-full ${step.color.replace('text', 'bg')}/10 animate-pulse`} />
                          </div>
                          <h2 className="text-3xl font-bold text-white mt-6 animate-pulse-slow">
                            {step.label}
                          </h2>
                        </div>
                      )
                    })}

                    {/* Live Code Snippet Preview */}
                    {files.length > 0 && (
                      <div className="mt-12 animate-slide-up">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 max-w-2xl">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-blue-400" />
                            <span className="text-white font-mono text-sm">{files[files.length - 1]?.path}</span>
                          </div>
                          <div className="text-left">
                            <pre className="text-xs text-white/70 font-mono overflow-x-auto max-h-48">
                              {files[files.length - 1]?.content.split('\n').slice(0, 10).join('\n')}
                              {files[files.length - 1]?.content.split('\n').length > 10 && '\n...'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stats Cards */}
                    {files.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 animate-slide-up">
                          <p className="text-white/60 text-xs mb-1">Files Generated</p>
                          <p className="text-2xl font-bold text-white">{files.length}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 animate-slide-up" style={{animationDelay: '100ms'}}>
                          <p className="text-white/60 text-xs mb-1">Lines of Code</p>
                          <p className="text-2xl font-bold text-white">
                            {files.reduce((sum, f) => sum + f.content.split('\n').length, 0)}
                          </p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 animate-slide-up" style={{animationDelay: '200ms'}}>
                          <p className="text-white/60 text-xs mb-1">Progress</p>
                          <p className="text-2xl font-bold text-white">{progress}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

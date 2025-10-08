'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Code, FileText, Zap, CheckCircle, ArrowRight, Eye } from 'lucide-react'
import { ImprovedSandpackPreview } from '@/components/ImprovedSandpackPreview'

interface GeneratedFile {
  path: string
  content: string
  language: string
}

type GenerationStep = 'thinking' | 'generating' | 'writing' | 'preview' | 'complete'

export default function GeneratePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt') || ''

  const [currentStep, setCurrentStep] = useState<GenerationStep>('thinking')
  const [files, setFiles] = useState<GeneratedFile[]>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [thinking, setThinking] = useState('')
  const [capabilities, setCapabilities] = useState<string[]>([])

  const steps = [
    { key: 'thinking', icon: Sparkles, label: 'Analyzing Requirements', color: 'text-blue-500' },
    { key: 'generating', icon: Zap, label: 'Generating Components', color: 'text-purple-500' },
    { key: 'writing', icon: Code, label: 'Writing Code', color: 'text-green-500' },
    { key: 'preview', icon: Eye, label: 'Building Preview', color: 'text-orange-500' },
    { key: 'complete', icon: CheckCircle, label: 'Complete', color: 'text-green-600' }
  ]

  useEffect(() => {
    if (!prompt) {
      setError('No prompt provided')
      return
    }

    generateApplication()
  }, [prompt])

  const generateApplication = async () => {
    try {
      // Step 1: Thinking
      setCurrentStep('thinking')
      setThinking('Analyzing your requirements and planning the architecture...')
      setProgress(10)
      await sleep(800)

      setThinking('Selecting optimal components and tech stack...')
      setProgress(15)
      await sleep(600)

      // Step 2: Generating - Show capabilities being added
      setCurrentStep('generating')
      setThinking('Creating component structure...')
      setProgress(20)

      const capabilitiesList = [
        '✨ Building responsive UI components',
        '🎨 Adding beautiful Tailwind styling',
        '⚡ Implementing state management',
        '🔒 Setting up authentication flow',
        '📊 Creating data visualization',
        '🚀 Optimizing performance',
        '♿ Ensuring accessibility',
        '📱 Making it mobile-friendly'
      ]

      // Add capabilities one by one
      for (let i = 0; i < 3; i++) {
        await sleep(400)
        setCapabilities(prev => [...prev, capabilitiesList[i]])
      }

      setProgress(30)

      // Step 3: Call AI API
      setCurrentStep('writing')
      setThinking('Generating production-ready code...')

      // Add more capabilities
      for (let i = 3; i < 6; i++) {
        await sleep(300)
        setCapabilities(prev => [...prev, capabilitiesList[i]])
      }

      setProgress(40)

      const response = await fetch('/api/generation/start', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
          prompt,
          settings: {
            provider: 'openai',
            selectedIndustry: 'general'
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate code')
      }

      const data = await response.json()
      const generatedFiles = data.files || []

      // Add final capabilities
      for (let i = 6; i < capabilitiesList.length; i++) {
        await sleep(200)
        setCapabilities(prev => [...prev, capabilitiesList[i]])
      }

      setProgress(60)
      setThinking(`Generated ${generatedFiles.length} files...`)
      await sleep(500)

      // Step 4: Process files
      setProgress(70)
      setThinking('Processing components...')

      const processedFiles: GeneratedFile[] = generatedFiles.map((file: any) => ({
        path: file.path,
        content: file.content,
        language: file.path.endsWith('.tsx') || file.path.endsWith('.ts') ? 'typescript' :
                 file.path.endsWith('.jsx') || file.path.endsWith('.js') ? 'javascript' :
                 file.path.endsWith('.css') ? 'css' : 'plaintext'
      }))

      setFiles(processedFiles)
      setProgress(85)
      await sleep(500)

      // Step 5: Building preview
      setCurrentStep('preview')
      setThinking('Building live preview...')
      setProgress(95)
      await sleep(1500)

      // Step 6: Complete
      setCurrentStep('complete')
      setProgress(100)
      setThinking('Application ready!')

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
                <span className="text-xs text-white/60 font-mono">{progress}%</span>
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

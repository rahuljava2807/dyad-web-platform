'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Code, FileText, Zap, CheckCircle, ArrowRight, Eye } from 'lucide-react'
import { SandpackPreviewPanel } from '@/components/SandpackPreviewPanel'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Generating Your Application</h1>
            {currentStep === 'complete' && (
              <button
                onClick={() => router.push(`/dashboard/projects/${params.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Project
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard/projects/new')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Progress Steps */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = index === getCurrentStepIndex()
                  const isComplete = index < getCurrentStepIndex()

                  return (
                    <div key={step.key} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isActive ? `${step.color} border-current bg-current/10 scale-110` :
                          isComplete ? 'border-green-500 bg-green-500/10 text-green-500' :
                          'border-white/20 text-white/40'
                        }`}>
                          {isComplete ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <StepIcon className={`h-6 w-6 ${isActive ? 'animate-pulse' : ''}`} />
                          )}
                        </div>
                        <span className={`text-sm font-semibold ${
                          isActive ? 'text-white' : isComplete ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-2 transition-all ${
                          isComplete ? 'bg-green-500' : 'bg-white/10'
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Current Thinking */}
              <div className="mt-6 text-center">
                <p className="text-white text-lg font-medium">{thinking}</p>
                {currentStep !== 'complete' && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>

              {/* Capabilities Being Added */}
              {capabilities.length > 0 && (
                <div className="mt-6 space-y-2">
                  {[...new Set(capabilities)].map((capability, index) => (
                    <div
                      key={`${capability}-${index}`}
                      className="text-white/90 text-sm flex items-center justify-start gap-2 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Generated Files ({files.length})</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm font-mono truncate hover:bg-white/10 transition-colors"
                      title={file.path}
                    >
                      <CheckCircle className="h-3 w-3 text-green-400 inline mr-2" />
                      {file.path}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Preview */}
            {currentStep === 'preview' || currentStep === 'complete' ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-black/20">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-400" />
                    <h2 className="text-xl font-semibold text-white">Live Preview</h2>
                  </div>
                </div>
                <div className="h-[600px]">
                  <SandpackPreviewPanel files={files} />
                </div>
              </div>
            ) : null}

            {/* Success Actions */}
            {currentStep === 'complete' && (
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Application Generated!</h2>
                <p className="text-white/60 mb-6">
                  Your application has been created with {files.length} production-ready files
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => router.push(`/dashboard/projects/${params.id}`)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    View Project
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-semibold"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

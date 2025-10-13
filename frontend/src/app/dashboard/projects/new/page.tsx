'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sparkles, Rocket, Zap } from 'lucide-react'

const templates = [
  {
    id: 'login-app',
    name: 'Authentication System',
    description: 'Complete login, signup, and user management',
    gradient: 'from-blue-500 to-blue-600',
    icon: '🔐'
  },
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    description: 'Beautiful charts, metrics, and data visualization',
    gradient: 'from-purple-500 to-purple-600',
    icon: '📊'
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Products, cart, checkout, and payments',
    gradient: 'from-green-500 to-green-600',
    icon: '🛍️'
  },
  {
    id: 'social',
    name: 'Social Platform',
    description: 'Posts, comments, likes, and user profiles',
    gradient: 'from-pink-500 to-pink-600',
    icon: '💬'
  },
  {
    id: 'crm',
    name: 'CRM System',
    description: 'Contacts, leads, deals, and pipeline management',
    gradient: 'from-orange-500 to-orange-600',
    icon: '🤝'
  },
  {
    id: 'blog',
    name: 'Blog & CMS',
    description: 'Rich editor, posts, categories, and SEO',
    gradient: 'from-teal-500 to-teal-600',
    icon: '✍️'
  }
]

export default function NewProjectPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [projectName, setProjectName] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [provider, setProvider] = useState<'anthropic' | 'openai'>('anthropic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTemplate && !customPrompt) {
      setError('Please select a template or describe your app')
      return
    }

    if (!projectName.trim()) {
      setError('Project name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const selectedTemplateData = templates.find(t => t.id === selectedTemplate)

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          description: customPrompt || selectedTemplateData?.description,
          template: selectedTemplate || 'custom',
          framework: 'React + TypeScript',
          yaviIntegration: true,
          prompt: customPrompt || selectedTemplateData?.description,
          provider: provider // Add provider selection
        })
      })

      if (response.ok) {
        const data = await response.json()
        const projectId = data.data.project.id
        const promptText = customPrompt || selectedTemplateData?.description || ''

        // Redirect to generation page with Yavi Studio flow
        router.push(`/dashboard/projects/${projectId}/generate?prompt=${encodeURIComponent(promptText)}&provider=${provider}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create project')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>

            {/* Yavi Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
                <Image
                  src="/images/logos/yavi-logo.svg"
                  alt="Yavi Studio"
                  fill
                  className="object-contain brightness-0 invert"
                  priority
                />
              </div>
              <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                Yavi Studio
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
              <Sparkles className="h-4 w-4" />
              AI-Powered Code Generation
            </div>
            <h1 className="text-5xl font-bold text-white">
              Create Your App
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Choose a template or describe your idea. We'll generate production-ready code in seconds.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-3">
            <label className="block text-white text-lg font-semibold">
              Project Name
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="My Awesome Project"
            />
          </div>

          {/* AI Provider Selection */}
          <div className="space-y-3">
            <label className="block text-white text-lg font-semibold">
              AI Provider
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setProvider('anthropic')}
                className={`relative p-6 rounded-2xl border-2 transition-all group ${
                  provider === 'anthropic'
                    ? 'border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">🤖</div>
                    {provider === 'anthropic' && (
                      <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-lg">
                    Claude (Anthropic)
                  </h3>
                  <p className="text-white/60 text-sm">
                    Best for complex logic and architecture
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`relative p-6 rounded-2xl border-2 transition-all group ${
                  provider === 'openai'
                    ? 'border-green-500/60 bg-green-500/10 shadow-lg shadow-green-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">⚡</div>
                    {provider === 'openai' && (
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-lg">
                    GPT-4 (OpenAI)
                  </h3>
                  <p className="text-white/60 text-sm">
                    Fast and creative UI generation
                  </p>
                </div>
              </button>
            </div>
            <p className="text-white/40 text-sm">
              {provider === 'anthropic'
                ? '💡 Using Claude 3.5 Sonnet - Excels at structured code generation'
                : '💡 Using GPT-4 Turbo - Great for rapid prototyping and UI design'
              }
            </p>
          </div>

          {/* Template Selection */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Choose a Template
              </h2>
              <span className="text-white/40 text-sm">
                or describe your app below
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setCustomPrompt('')
                  }}
                  className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${
                    selectedTemplate === template.id
                      ? 'border-white/40 bg-white/10 scale-105'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl bg-gradient-to-br ${template.gradient} p-3 rounded-xl`}>
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {template.name}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  {selectedTemplate === template.id && (
                    <div className="absolute top-4 right-4">
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-400" />
              <label className="text-white text-lg font-semibold">
                Or Describe Your App
              </label>
            </div>
            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value)
                if (e.target.value.trim()) {
                  setSelectedTemplate('')
                }
              }}
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="I want to build a task management app with drag-and-drop, real-time updates, and team collaboration..."
            />
            <p className="text-white/40 text-sm">
              Be specific about features, design, and functionality you want
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading || (!selectedTemplate && !customPrompt.trim()) || !projectName.trim()}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-blue-500/50 transition-all disabled:hover:shadow-none"
            >
              <span className="flex items-center gap-3">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Your App...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    Generate Application
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Info Footer */}
          <div className="text-center space-y-4 pt-8">
            <div className="flex items-center justify-center gap-3">
              <p className="text-white/40 text-sm">
                Powered by Claude & GPT-4
              </p>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-2">
                <span className="text-white/40 text-sm">Built with</span>
                <div className="relative w-20 h-6">
                  <Image
                    src="/images/logos/yavi-logo.svg"
                    alt="Yavi Studio"
                    fill
                    className="object-contain brightness-0 invert opacity-60"
                  />
                </div>
              </div>
            </div>
            <p className="text-white/30 text-xs">
              Production-ready code with TypeScript, Tailwind CSS, and best practices
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}

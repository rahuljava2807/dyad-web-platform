'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Code2,
  Globe,
  Smartphone,
  Database,
  Zap,
  FileText,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Lightbulb
} from 'lucide-react'

const horizontalTemplates = [
  {
    id: 'document-intelligence',
    name: 'Document Intelligence Hub',
    description: 'Universal document processing platform for any industry',
    icon: FileText,
    framework: 'Next.js + Yavi.ai',
    category: 'Horizontal Solution',
    roi: '$2.4M annual savings',
    features: ['Contract Analysis', 'Invoice Processing', 'Compliance Review', 'Multi-language Support'],
    industries: ['Finance', 'Legal', 'Healthcare', 'Manufacturing'],
    deploymentTime: '2-4 weeks'
  },
  {
    id: 'data-integration-hub',
    name: 'Enterprise Data Integration',
    description: 'Unified data layer connecting any system to any other system',
    icon: Database,
    framework: 'Node.js + Yavi.ai',
    category: 'Horizontal Solution',
    roi: '$1.8M annual value',
    features: ['Real-time Sync', '60+ Connectors', 'Data Quality', 'Analytics Dashboard'],
    industries: ['Technology', 'Finance', 'Retail', 'Healthcare'],
    deploymentTime: '3-6 weeks'
  },
  {
    id: 'workflow-orchestrator',
    name: 'AI Workflow Orchestrator',
    description: 'Intelligent automation that adapts to any business process',
    icon: Zap,
    framework: 'React + Node.js',
    category: 'Horizontal Solution',
    roi: '$3.2M annual savings',
    features: ['Dynamic Workflows', 'Human-in-Loop', 'Exception Handling', 'Process Analytics'],
    industries: ['Operations', 'HR', 'Finance', 'Customer Service'],
    deploymentTime: '1-3 weeks'
  },
  {
    id: 'knowledge-platform',
    name: 'Knowledge Management Platform',
    description: 'Transform organizational knowledge into actionable intelligence',
    icon: Globe,
    framework: 'Next.js + AI',
    category: 'Horizontal Solution',
    roi: '$1.5M productivity gains',
    features: ['Semantic Search', 'Knowledge Graph', 'Expert ID', 'Content Discovery'],
    industries: ['Consulting', 'Research', 'Education', 'Technology'],
    deploymentTime: '2-5 weeks'
  }
]

const traditionalTemplates = [
  {
    id: 'nextjs-fullstack',
    name: 'Next.js Full-Stack',
    description: 'Complete web application with frontend and backend',
    icon: Globe,
    framework: 'Next.js + API',
    category: 'Web Application',
    features: ['React 18', 'TypeScript', 'API Routes', 'Database', 'Authentication'],
    useCases: ['E-commerce', 'SaaS Apps', 'Portfolio Sites']
  },
  {
    id: 'react-spa',
    name: 'React SPA',
    description: 'Single Page Application with modern React',
    icon: Code2,
    framework: 'React + Vite',
    category: 'Frontend',
    features: ['React 18', 'TypeScript', 'State Management', 'Router'],
    useCases: ['Dashboards', 'Admin Panels', 'Interactive Apps']
  },
  {
    id: 'express-api',
    name: 'REST API',
    description: 'Backend API with Express.js and database',
    icon: Database,
    framework: 'Express.js',
    category: 'Backend',
    features: ['TypeScript', 'Express.js', 'Database ORM', 'JWT Auth'],
    useCases: ['Mobile Backends', 'Microservices', 'Data APIs']
  },
  {
    id: 'task-manager',
    name: 'Task Manager',
    description: 'Complete task management application',
    icon: Zap,
    framework: 'Next.js',
    category: 'Application Template',
    features: ['User Auth', 'CRUD Operations', 'Task Board', 'Notifications'],
    useCases: ['Project Management', 'Team Collaboration', 'Personal Tasks']
  },
  {
    id: 'blog-cms',
    name: 'Blog & CMS',
    description: 'Content management system with blog functionality',
    icon: FileText,
    framework: 'Next.js + CMS',
    category: 'Content',
    features: ['Content Editor', 'SEO Optimized', 'Comments', 'Media Upload'],
    useCases: ['Company Blogs', 'News Sites', 'Personal Websites']
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start completely from scratch with minimal boilerplate',
    icon: Smartphone,
    framework: 'Custom',
    category: 'Custom',
    features: ['Minimal Setup', 'Full Control', 'Custom Architecture'],
    useCases: ['Unique Requirements', 'Learning Projects', 'Prototypes']
  }
]

export default function NewProjectPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    prompt: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [yaviIntegration, setYaviIntegration] = useState(true)
  const [showPromptMode, setShowPromptMode] = useState(false)
  const [suggestedTemplates, setSuggestedTemplates] = useState<string[]>([])

  // Smart template suggestion based on prompt
  const handlePromptSuggestion = (prompt: string) => {
    if (!prompt.trim()) {
      setSuggestedTemplates([])
      return
    }

    const keywords = prompt.toLowerCase()
    const suggestions: string[] = []

    if (yaviIntegration) {
      // AI-powered suggestions
      if (keywords.includes('document') || keywords.includes('contract') || keywords.includes('invoice') || keywords.includes('pdf')) {
        suggestions.push('document-intelligence')
      }
      if (keywords.includes('data') || keywords.includes('integration') || keywords.includes('sync') || keywords.includes('database')) {
        suggestions.push('data-integration-hub')
      }
      if (keywords.includes('workflow') || keywords.includes('automation') || keywords.includes('process')) {
        suggestions.push('workflow-orchestrator')
      }
      if (keywords.includes('knowledge') || keywords.includes('search') || keywords.includes('content') || keywords.includes('wiki')) {
        suggestions.push('knowledge-platform')
      }
    } else {
      // Vanilla development suggestions
      if (keywords.includes('web') || keywords.includes('website') || keywords.includes('full-stack')) {
        suggestions.push('nextjs')
      }
      if (keywords.includes('react') || keywords.includes('frontend') || keywords.includes('ui')) {
        suggestions.push('react')
      }
      if (keywords.includes('api') || keywords.includes('backend') || keywords.includes('server')) {
        suggestions.push('express-api')
      }
      if (keywords.includes('custom') || keywords.includes('scratch') || keywords.includes('minimal')) {
        suggestions.push('blank')
      }
    }

    setSuggestedTemplates(suggestions.slice(0, 3)) // Limit to top 3 suggestions
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTemplate) {
      setError('Please select a template')
      return
    }

    if (!projectData.name.trim()) {
      setError('Project name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const allTemplates = [...horizontalTemplates, ...traditionalTemplates]
      const selectedTemplateData = allTemplates.find(t => t.id === selectedTemplate)

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description || projectData.prompt,
          template: selectedTemplate,
          framework: selectedTemplateData?.framework,
          yaviIntegration: yaviIntegration,
          prompt: projectData.prompt
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/dashboard/projects/${data.data.project.id}`)
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Create New Project</h1>
              <p className="text-slate-600">Choose a template to get started quickly</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Provide basic information about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={projectData.name}
                  onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="My Awesome Project"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what your project will do..."
                />
              </div>

              {/* Yavi.ai Integration Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Yavi.ai Integration
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Enable AI-powered features and horizontal solutions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setYaviIntegration(!yaviIntegration)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      yaviIntegration ? 'bg-green-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        yaviIntegration ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {yaviIntegration ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-medium">AI-Powered Features Enabled</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Access to document processing, data integration, and workflow automation
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Code2 className="h-4 w-4" />
                      <span className="font-medium">Vanilla Development Mode</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Standard frameworks without AI integration
                    </p>
                  </div>
                )}
              </div>

              {/* Smart Prompt Generator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Smart Project Generator
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPromptMode(!showPromptMode)}
                    className="text-xs"
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {showPromptMode ? 'Hide' : 'Generate from Idea'}
                  </Button>
                </div>

                {showPromptMode && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Describe your application idea
                      </label>
                      <textarea
                        rows={4}
                        value={projectData.prompt}
                        onChange={(e) => {
                          setProjectData(prev => ({ ...prev, prompt: e.target.value }))
                          handlePromptSuggestion(e.target.value)
                        }}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder={yaviIntegration
                          ? "I want to build an application that processes legal contracts and extracts key terms..."
                          : "I want to build a task management app with user authentication..."
                        }
                      />
                    </div>

                    {suggestedTemplates.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-900">Suggested Templates:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedTemplates.map((templateId) => {
                            const template = [...horizontalTemplates, ...traditionalTemplates].find(t => t.id === templateId)
                            return template ? (
                              <button
                                key={templateId}
                                type="button"
                                onClick={() => {
                                  setSelectedTemplate(templateId)
                                  setShowPromptMode(false)
                                }}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                              >
                                {template.name}
                              </button>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conditional Template Sections */}
          {yaviIntegration && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    AI-Powered
                  </Badge>
                  <CardTitle>Horizontal Business Solutions</CardTitle>
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <CardDescription>
                  Pre-built enterprise solutions with Yavi.ai integration. Proven ROI and fast deployment.
                </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {horizontalTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-5 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-slate-200 hover:border-green-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${selectedTemplate === template.id ? 'bg-green-600' : 'bg-slate-100'}`}>
                          <template.icon className={`h-5 w-5 ${selectedTemplate === template.id ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{template.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {template.framework}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          {template.roi}
                        </Badge>
                        <div className="text-xs text-slate-500 mt-1">{template.deploymentTime}</div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">{template.description}</p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-medium text-slate-700 mb-2">Key Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium text-slate-700 mb-2">Target Industries:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.industries.map((industry, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            </Card>
          )}

          {/* Traditional Development Templates */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>
                  {yaviIntegration ? 'Traditional Development Templates' : 'Available Templates'}
                </CardTitle>
                {!yaviIntegration && <Code2 className="h-5 w-5 text-blue-600" />}
              </div>
              <CardDescription>
                {yaviIntegration
                  ? 'Standard frameworks for custom development projects'
                  : 'Choose from popular development frameworks and setups'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 ${
                yaviIntegration
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {traditionalTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded ${selectedTemplate === template.id ? 'bg-blue-600' : 'bg-slate-100'}`}>
                        <template.icon className={`h-5 w-5 ${selectedTemplate === template.id ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 text-sm">{template.name}</h3>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {template.framework}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">{template.description}</p>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      {template.useCases && (
                        <div>
                          <p className="text-xs font-medium text-slate-600 mb-1">Use Cases:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.useCases.map((useCase, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-green-50 text-green-700">
                                {useCase}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedTemplate || !projectData.name.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating Project...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
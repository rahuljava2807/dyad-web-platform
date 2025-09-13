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
  FileText
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
    id: 'nextjs',
    name: 'Next.js',
    description: 'Full-stack React framework with server-side rendering',
    icon: Code2,
    framework: 'Next.js',
    category: 'Traditional Framework',
    features: ['React 18', 'TypeScript', 'Tailwind CSS', 'API Routes']
  },
  {
    id: 'react',
    name: 'React App',
    description: 'Client-side React application with modern tooling',
    icon: Code2,
    framework: 'React',
    category: 'Traditional Framework',
    features: ['React 18', 'TypeScript', 'Vite', 'Component Library']
  },
  {
    id: 'express-api',
    name: 'Express API',
    description: 'RESTful API with Express.js and TypeScript',
    icon: Database,
    framework: 'Express',
    category: 'Traditional Framework',
    features: ['TypeScript', 'Express.js', 'Prisma ORM', 'Authentication']
  },
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with a minimal setup',
    icon: FileText,
    framework: 'Custom',
    category: 'Traditional Framework',
    features: ['Minimal Setup', 'Custom Configuration', 'Full Control']
  }
]

export default function NewProjectPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [projectData, setProjectData] = useState({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
          description: projectData.description,
          template: selectedTemplate,
          framework: selectedTemplateData?.framework
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
            </CardContent>
          </Card>

          {/* Horizontal Business Solutions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Recommended
                </Badge>
                <CardTitle>Horizontal Business Solutions</CardTitle>
              </div>
              <CardDescription>
                Pre-built enterprise solutions that work across any industry. Proven ROI and fast deployment.
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

          {/* Traditional Development Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Traditional Development Templates</CardTitle>
              <CardDescription>
                Standard frameworks for custom development projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{template.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {template.framework}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">{template.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
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
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  FolderOpen,
  Settings,
  FileText,
  Code2,
  Zap,
  Calendar,
  MoreVertical,
  Sparkles
} from 'lucide-react'
import { AssistantProvider } from '@/contexts/AssistantContext'
import { YaviAssistant } from '@/components/assistant'

interface Project {
  id: string
  name: string
  description: string | null
  framework: string | null
  template: string | null
  status: string
  createdAt: string
  updatedAt: string
  fileCount: number
  aiGenerationCount: number
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')

      if (response.ok) {
        const data = await response.json()
        setProjects(data.data?.projects || [])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AssistantProvider projectId="dashboard">
      <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-6">
              {/* Yavi Logo */}
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative w-16 h-16 transition-transform group-hover:scale-105">
                  <Image
                    src="/images/logos/Yavi-logo.webp"
                    alt="Yavi Studio"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    Studio
                  </span>
                  <span className="text-xs text-slate-500">AI Development Platform</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/yavi-studio">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Yavi Studio
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{projects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {projects.reduce((sum, p) => sum + p.fileCount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">AI Generations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {projects.reduce((sum, p) => sum + p.aiGenerationCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Your Projects</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                    <CardDescription>
                      {project.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {project.fileCount} files
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          {project.aiGenerationCount} AI
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {project.framework && (
                          <Badge variant="secondary" className="text-xs">
                            <Code2 className="mr-1 h-3 w-3" />
                            {project.framework}
                          </Badge>
                        )}
                        <Badge
                          variant={project.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {project.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </div>

                      <div className="pt-2">
                        <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                          <Link href={`/dashboard/projects/${project.id}`}>
                            Open Project
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <FolderOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">No projects yet</h3>
                <p className="text-slate-600 mb-6">
                  Create your first project to start building with Yavi.ai integration.
                </p>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/dashboard/projects/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Yavi Assistant Widget - Only render on client to avoid hydration errors */}
      {mounted && <YaviAssistant />}
    </div>
    </AssistantProvider>
  )
}
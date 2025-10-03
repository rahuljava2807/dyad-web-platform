'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ChatInterface from '@/components/chat/ChatInterface'
import {
  ArrowLeft,
  Code2,
  Eye,
  Play,
  Square,
  Download,
  Github,
  ExternalLink,
  Settings,
  FileText,
  FolderOpen,
  Sparkles
} from 'lucide-react'

interface GeneratedFile {
  path: string
  content: string
  language: string
  status: 'pending' | 'approved' | 'rejected'
}

interface Project {
  id: string
  name: string
  description: string
  files: GeneratedFile[]
  previewUrl?: string
  status: 'draft' | 'generating' | 'ready' | 'error'
}

export default function BuilderV4Page() {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'preview'>('chat')

  // Load or create project
  useEffect(() => {
    const loadProject = async () => {
      try {
        // For now, create a new project
        const newProject: Project = {
          id: 'demo-project',
          name: 'New Project',
          description: 'AI-generated web application',
          files: [],
          status: 'draft'
        }
        setProject(newProject)
      } catch (error) {
        console.error('Error loading project:', error)
      }
    }

    loadProject()
  }, [])

  const handleFilesGenerated = async (files: GeneratedFile[]) => {
    if (!project) return

    setProject(prev => ({
      ...prev!,
      files: [...prev!.files, ...files],
      status: 'generating'
    }))

    // Generate preview
    try {
      setIsPreviewLoading(true)
      const response = await fetch('/api/preview/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files })
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewUrl(`/api/preview/${data.sessionId}`)
        setProject(prev => ({
          ...prev!,
          previewUrl: `/api/preview/${data.sessionId}`,
          status: 'ready'
        }))
      }
    } catch (error) {
      console.error('Error generating preview:', error)
      setProject(prev => ({
        ...prev!,
        status: 'error'
      }))
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handlePreviewUpdate = (url: string) => {
    setPreviewUrl(url)
  }

  const exportToGitHub = async () => {
    if (!project || project.files.length === 0) return

    try {
      const response = await fetch('/api/projects/export/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          repositoryName: project.name.toLowerCase().replace(/\s+/g, '-')
        })
      })

      if (response.ok) {
        const data = await response.json()
        window.open(data.repositoryUrl, '_blank')
      }
    } catch (error) {
      console.error('Error exporting to GitHub:', error)
    }
  }

  const deployToVercel = async () => {
    if (!project || project.files.length === 0) return

    try {
      const response = await fetch('/api/projects/deploy/vercel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        window.open(data.deploymentUrl, '_blank')
      }
    } catch (error) {
      console.error('Error deploying to Vercel:', error)
    }
  }

  const getFileIcon = (path: string) => {
    const extension = path.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'tsx':
      case 'jsx':
      case 'ts':
      case 'js':
        return <Code2 className="h-4 w-4 text-blue-500" />
      case 'css':
      case 'scss':
        return <div className="h-4 w-4 bg-pink-500 rounded-sm" />
      case 'json':
        return <div className="h-4 w-4 bg-yellow-500 rounded-sm" />
      case 'md':
        return <FileText className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'generating':
        return <Badge variant="default">Generating...</Badge>
      case 'ready':
        return <Badge variant="default" className="bg-green-500">Ready</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/yavi-studio">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Studio
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {project?.name || 'New Project'}
                </h1>
                <p className="text-sm text-gray-500">
                  AI-powered web application builder
                </p>
              </div>
              {project && getStatusBadge(project.status)}
            </div>
            
            <div className="flex items-center gap-2">
              {project && project.files.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={exportToGitHub}>
                    <Github className="h-4 w-4 mr-2" />
                    Export to GitHub
                  </Button>
                  <Button variant="outline" size="sm" onClick={deployToVercel}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Deploy to Vercel
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Chat Interface */}
          <div className={`${activeTab === 'chat' ? 'block' : 'hidden'} lg:block`}>
            <Card className="h-full">
              <ChatInterface
                projectId={project?.id}
                onFilesGenerated={handleFilesGenerated}
                onPreviewUpdate={handlePreviewUpdate}
              />
            </Card>
          </div>

          {/* File Explorer */}
          <div className={`${activeTab === 'files' ? 'block' : 'hidden'} lg:block`}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Project Files
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto">
                {project && project.files.length > 0 ? (
                  <div className="space-y-2">
                    {project.files.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                          selectedFile?.path === file.path ? 'bg-blue-50 border border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        {getFileIcon(file.path)}
                        <span className="text-sm font-mono flex-1">{file.path}</span>
                        <Badge variant={
                          file.status === 'approved' ? 'default' :
                          file.status === 'rejected' ? 'destructive' : 'secondary'
                        } size="sm">
                          {file.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Code2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No files generated yet</p>
                    <p className="text-sm">Start a conversation to generate code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} lg:block`}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isPreviewLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
                      <p className="text-gray-500">Generating preview...</p>
                    </div>
                  </div>
                ) : previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0 rounded-b-lg"
                    title="Live Preview"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No preview available</p>
                      <p className="text-sm">Generate some code to see the preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mt-4">
          <div className="flex bg-white rounded-lg border p-1">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </Button>
            <Button
              variant={activeTab === 'files' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab('files')}
            >
              Files
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

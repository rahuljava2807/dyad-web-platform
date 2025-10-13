'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  FolderOpen,
  FileText,
  Plus,
  Save,
  Play,
  Settings,
  Zap,
  Download,
  MoreVertical,
  Sparkles
} from 'lucide-react'

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div>
  }
)

interface Project {
  id: string
  name: string
  description: string | null
  framework: string | null
  template: string | null
  status: string
  settings: any
  createdAt: string
  updatedAt: string
  files: ProjectFile[]
  aiGenerationCount: number
}

interface ProjectFile {
  id: string
  path: string
  content: string
  mimeType: string | null
  size: number
  createdAt: string
  updatedAt: string
}

export default function ProjectPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)

      if (response.ok) {
        const data = await response.json()
        setProject(data.data.project)

        // Select first file if available
        if (data.data.project.files.length > 0) {
          const firstFile = data.data.project.files[0]
          setSelectedFile(firstFile)
          setFileContent(firstFile.content)
        }
      } else if (response.status === 404) {
        setError('Project not found')
      } else {
        setError('Failed to load project')
      }
    } catch (err) {
      setError('An error occurred while loading the project')
    } finally {
      setLoading(false)
    }
  }

  const saveFile = async () => {
    if (!selectedFile || !project) return

    setSaving(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/files/${selectedFile.path}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: fileContent,
          mimeType: selectedFile.mimeType
        })
      })

      if (response.ok) {
        // Update the file in the project state
        setProject(prev => {
          if (!prev) return prev
          return {
            ...prev,
            files: prev.files.map(file =>
              file.id === selectedFile.id
                ? { ...file, content: fileContent }
                : file
            )
          }
        })
        setSelectedFile(prev => prev ? { ...prev, content: fileContent } : null)
      } else {
        setError('Failed to save file')
      }
    } catch (err) {
      setError('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const getLanguageFromFile = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    }
    return languageMap[extension || ''] || 'plaintext'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading project...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">
          {error || 'Project not found'}
        </h1>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  // If no files exist, show project overview page instead of editor
  if (project.files.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Project Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
              <FolderOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-3">{project.name}</h1>
            {project.description && (
              <p className="text-xl text-slate-600 mb-4">{project.description}</p>
            )}
            <div className="flex items-center justify-center gap-2">
              {project.framework && (
                <Badge variant="secondary" className="text-sm">
                  {project.framework}
                </Badge>
              )}
              <Badge variant="outline" className="text-sm">
                {project.status}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8 border-2 border-blue-200 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Zap className="h-6 w-6 text-blue-600" />
                Ready to Build?
              </CardTitle>
              <CardDescription className="text-base">
                This project doesn't have any files yet. Let's get started!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
              >
                <Link href={`/dashboard/projects/${project.id}/generate?prompt=${encodeURIComponent(project.description || project.name)}`}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Code with AI
                </Link>
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" size="lg" disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Files Manually
                </Button>
                <Button variant="outline" size="lg" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Import Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Created</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-slate-800">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">Files</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-slate-800">{project.files.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">AI Generations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-slate-800">{project.aiGenerationCount}</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>

              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <h1 className="text-lg font-semibold text-slate-800">{project.name}</h1>
                  {project.description && (
                    <p className="text-sm text-slate-600">{project.description}</p>
                  )}
                </div>
                {project.framework && (
                  <Badge variant="secondary">{project.framework}</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={saveFile}
                disabled={saving || !selectedFile}
                size="sm"
                variant="outline"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>

              <Button size="sm" variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Run
              </Button>

              <Button size="sm" variant="outline" asChild>
                <Link href={`/dashboard/projects/${project.id}/generate?prompt=${encodeURIComponent(project.description || project.name)}`}>
                  <Zap className="mr-2 h-4 w-4" />
                  AI Generate
                </Link>
              </Button>

              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Files</h2>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {project.files.length > 0 ? (
              <div className="space-y-1">
                {project.files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      setSelectedFile(file)
                      setFileContent(file.content)
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedFile?.id === file.id
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <FileText className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">No files yet</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add File
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              <div className="bg-white border-b border-slate-200 px-4 py-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-800">{selectedFile.path}</span>
                  <Badge variant="outline" className="text-xs">
                    {getLanguageFromFile(selectedFile.path)}
                  </Badge>
                </div>
              </div>

              <div className="flex-1">
                <Editor
                  height="100%"
                  language={getLanguageFromFile(selectedFile.path)}
                  value={fileContent}
                  onChange={(value) => setFileContent(value || '')}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center text-slate-500">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">No file selected</h3>
                <p>Select a file from the sidebar to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send, 
  Bot, 
  User, 
  Code2, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Sparkles,
  MessageSquare,
  Play,
  Square,
  Download,
  Eye
} from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isCode?: boolean
  files?: GeneratedFile[]
  status?: 'generating' | 'completed' | 'error'
}

interface GeneratedFile {
  path: string
  content: string
  language: string
  status: 'pending' | 'approved' | 'rejected'
}

interface ChatInterfaceProps {
  projectId?: string
  onFilesGenerated?: (files: GeneratedFile[]) => void
  onPreviewUpdate?: (previewUrl: string) => void
}

export default function ChatInterface({ 
  projectId, 
  onFilesGenerated, 
  onPreviewUpdate 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to Yavi Studio! I can help you build full-stack web applications. What would you like to create today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMode, setGenerationMode] = useState<'build' | 'ask'>('build')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsGenerating(true)

    // Add assistant message placeholder
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'generating'
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: 'user', content: userMessage.content }
          ],
          projectId,
          provider: 'openai',
          mode: generationMode
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate response')
      }

      const data = await response.json()
      
      // Update the assistant message with the response
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? {
              ...msg,
              content: data.data.response,
              status: 'completed',
              isCode: data.data.isCode,
              files: data.data.files || []
            }
          : msg
      ))

      // Handle generated files
      if (data.data.files && data.data.files.length > 0) {
        onFilesGenerated?.(data.data.files)
      }

      // Handle preview update
      if (data.data.previewUrl) {
        onPreviewUpdate?.(data.data.previewUrl)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? {
              ...msg,
              content: 'Sorry, I encountered an error. Please try again.',
              status: 'error'
            }
          : msg
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleApproveFile = (messageId: string, filePath: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? {
            ...msg,
            files: msg.files?.map(file => 
              file.path === filePath 
                ? { ...file, status: 'approved' }
                : file
            )
          }
        : msg
    ))
  }

  const handleRejectFile = (messageId: string, filePath: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? {
            ...msg,
            files: msg.files?.map(file => 
              file.path === filePath 
                ? { ...file, status: 'rejected' }
                : file
            )
          }
        : msg
    ))
  }

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting for code blocks
    return content.split('\n').map((line, index) => {
      if (line.startsWith('```')) {
        return <div key={index} className="text-sm text-gray-500 font-mono">{line}</div>
      }
      if (line.trim() === '') {
        return <br key={index} />
      }
      return <div key={index}>{line}</div>
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <CardTitle>AI Assistant</CardTitle>
            <Badge variant={generationMode === 'build' ? 'default' : 'secondary'}>
              {generationMode === 'build' ? 'Build Mode' : 'Ask Mode'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant={generationMode === 'build' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGenerationMode('build')}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Build
            </Button>
            <Button
              variant={generationMode === 'ask' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGenerationMode('ask')}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Ask
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type !== 'user' && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'assistant' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {message.type === 'assistant' ? <Bot className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
              </div>
            )}
            
            <div className={`max-w-[80%] ${
              message.type === 'user' ? 'order-first' : ''
            }`}>
              <div className={`rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.status === 'generating' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Generating...</span>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap">
                  {formatMessageContent(message.content)}
                </div>

                {/* Generated Files */}
                {message.files && message.files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium">Generated Files:</div>
                    {message.files.map((file) => (
                      <div
                        key={file.path}
                        className="flex items-center justify-between p-3 bg-white rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-gray-500" />
                          <span className="font-mono text-sm">{file.path}</span>
                          <Badge variant={
                            file.status === 'approved' ? 'default' :
                            file.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {file.status}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveFile(message.id, file.path)}
                            disabled={file.status === 'approved'}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectFile(message.id, file.path)}
                            disabled={file.status === 'rejected'}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              generationMode === 'build' 
                ? "Describe what you want to build (e.g., 'Create a todo app with user authentication')"
                : "Ask me anything about your project or coding"
            }
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={isGenerating}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isGenerating}
            className="self-end"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

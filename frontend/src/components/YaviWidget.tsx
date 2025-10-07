'use client'

/**
 * Yavi Widget - Intelligent Context-Aware Assistant
 *
 * A floating assistant that provides real-time help, explanations, and suggestions.
 * Inspired by the "Shopify for Enterprise Applications" vision.
 *
 * Features:
 * - Context detection (analyzes current page/component)
 * - Three modes: Help Me, Explain This, Suggest Improvements
 * - AI-powered responses
 * - Beautiful, minimal design
 */

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, HelpCircle, Lightbulb, Info, X, Send, Sparkles, Code, Zap } from 'lucide-react'

type WidgetMode = 'help' | 'explain' | 'suggest' | null

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface YaviWidgetProps {
  /** Current page context for intelligent suggestions */
  context?: {
    page: string
    component?: string
    code?: string
  }
  /** API endpoint for AI responses */
  apiEndpoint?: string
}

export const YaviWidget: React.FC<YaviWidgetProps> = ({
  context,
  apiEndpoint = '/api/yavi/chat'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<WidgetMode>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [detectedContext, setDetectedContext] = useState<string>('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, mode])

  // Detect page context
  useEffect(() => {
    const detectContext = () => {
      const path = window.location.pathname
      const page = path.split('/').filter(Boolean).pop() || 'dashboard'

      let contextDescription = ''
      if (path.includes('projects/new')) {
        contextDescription = 'creating a new project'
      } else if (path.includes('generate')) {
        contextDescription = 'generating code with AI'
      } else if (path.includes('dashboard')) {
        contextDescription = 'viewing the dashboard'
      } else if (path.includes('projects')) {
        contextDescription = 'managing projects'
      } else {
        contextDescription = `on the ${page} page`
      }

      setDetectedContext(contextDescription)
    }

    detectContext()
  }, [])

  const handleOpen = (selectedMode: WidgetMode) => {
    setMode(selectedMode)
    setIsOpen(true)

    // Add welcome message based on mode
    const welcomeMessages: Record<string, string> = {
      help: `Hi! I'm Yavi, your AI assistant. I noticed you're ${detectedContext}. How can I help you?`,
      explain: `I can explain any code, concept, or feature. What would you like me to explain?`,
      suggest: `I can suggest improvements based on best practices and your current context. What would you like to improve?`
    }

    if (selectedMode && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: welcomeMessages[selectedMode],
          timestamp: new Date()
        }
      ])
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Keep messages and mode so user can reopen where they left off
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // TODO: Replace with actual API call
      // For now, use mock responses
      const mockResponse = await generateMockResponse(input, mode, detectedContext)

      const assistantMessage: Message = {
        role: 'assistant',
        content: mockResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getModeIcon = (mode: WidgetMode) => {
    switch (mode) {
      case 'help':
        return <HelpCircle className="h-5 w-5" />
      case 'explain':
        return <Info className="h-5 w-5" />
      case 'suggest':
        return <Lightbulb className="h-5 w-5" />
      default:
        return <MessageCircle className="h-5 w-5" />
    }
  }

  const getModeColor = (mode: WidgetMode) => {
    switch (mode) {
      case 'help':
        return 'from-blue-500 to-blue-600'
      case 'explain':
        return 'from-purple-500 to-purple-600'
      case 'suggest':
        return 'from-green-500 to-green-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className={`flex items-center justify-between p-4 bg-gradient-to-r ${getModeColor(mode)} text-white rounded-t-2xl`}>
            <div className="flex items-center gap-3">
              {getModeIcon(mode)}
              <div>
                <h3 className="font-semibold">Yavi Assistant</h3>
                <p className="text-xs text-white/80 capitalize">{mode} Mode</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse flex gap-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animation-delay-200"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animation-delay-400"></div>
                    </div>
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          {/* Mode Options (shown when hovering) */}
          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={() => handleOpen('help')}
              className="group flex items-center gap-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all px-4 py-3 border border-gray-200"
              title="Help Me"
            >
              <span className="text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Help Me
              </span>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white">
                <HelpCircle className="h-5 w-5" />
              </div>
            </button>

            <button
              onClick={() => handleOpen('explain')}
              className="group flex items-center gap-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all px-4 py-3 border border-gray-200"
              title="Explain This"
            >
              <span className="text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Explain This
              </span>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white">
                <Info className="h-5 w-5" />
              </div>
            </button>

            <button
              onClick={() => handleOpen('suggest')}
              className="group flex items-center gap-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all px-4 py-3 border border-gray-200"
              title="Suggest Improvements"
            >
              <span className="text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Suggest Improvements
              </span>
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full text-white">
                <Lightbulb className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Mock response generator (to be replaced with actual API call)
 */
async function generateMockResponse(
  input: string,
  mode: WidgetMode,
  context: string
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const inputLower = input.toLowerCase()

  // Context-aware responses
  if (mode === 'help') {
    if (inputLower.includes('template') || inputLower.includes('industry')) {
      return `You're ${context}. I can help you choose the right industry template:

• Healthcare: Patient intake, consent forms (HIPAA-compliant)
• Fintech: KYC verification, investment profiles (SEC, FINRA)
• Legal: Client intake, retainer agreements
• E-commerce: Checkout forms, product reviews (PCI-DSS)
• SaaS: User onboarding, support tickets

Which industry are you building for?`
    }

    if (inputLower.includes('validation') || inputLower.includes('validate')) {
      return `I can help you add validation! Here's what I recommend:

1. **Email validation**: Use RFC 5322 regex pattern
2. **Phone validation**: Support international formats
3. **Password strength**: Min 8 chars, uppercase, lowercase, number, special char
4. **Custom rules**: Business logic (age > 18, quantity > 0)

Would you like me to generate validation code for a specific field?`
    }

    return `I'm here to help! Since you're ${context}, I can assist with:

• Choosing the right templates
• Adding form validation
• Implementing authentication
• Styling with Tailwind CSS
• Optimizing performance

What would you like help with?`
  }

  if (mode === 'explain') {
    if (inputLower.includes('sandpack') || inputLower.includes('preview')) {
      return `Sandpack is a live code editor that runs React/TypeScript in your browser. It:

• Compiles TypeScript to JavaScript in real-time
• Loads dependencies automatically
• Shows live preview without server refresh
• Supports Tailwind CSS via CDN

Your generated code is displayed instantly with full interactivity!`
    }

    return `I can explain any concept, code pattern, or feature. What would you like to understand better?`
  }

  if (mode === 'suggest') {
    return `Based on your current context (${context}), here are my suggestions:

✨ **Add Industry Templates**
Pre-built forms for healthcare, fintech, legal, e-commerce, and SaaS

🔒 **Implement Validation**
Client-side validation with proper error handling

♿ **Improve Accessibility**
WCAG 2.1 AA compliance with ARIA labels

📊 **Add Analytics**
Track form completion rates and user behavior

Would you like me to implement any of these?`
  }

  return `I'm not sure I understand. Could you rephrase that?`
}

/**
 * Yavi Chat API Route
 *
 * Handles intelligent conversations with the Yavi assistant.
 * Provides context-aware help, explanations, and suggestions.
 */

import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  mode: 'help' | 'explain' | 'suggest'
  context?: {
    page: string
    component?: string
    code?: string
  }
}

/**
 * POST /api/yavi/chat
 * Send a message to Yavi and get an AI-powered response
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, mode, context } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    // Build system prompt based on mode
    const systemPrompts = {
      help: `You are Yavi, an intelligent AI assistant for the Yavi Studio platform. You help developers build enterprise applications with:
- Industry-specific templates (healthcare, fintech, legal, e-commerce, SaaS)
- Form validation and business logic
- Compliance requirements (HIPAA, PCI-DSS, GDPR, SOC2)
- Code generation with React + TypeScript + Tailwind CSS

Be concise, helpful, and proactive. Provide code examples when relevant.`,

      explain: `You are Yavi, a technical explainer. Break down complex concepts into simple, understandable explanations:
- Explain code patterns and architecture
- Clarify framework concepts (React, TypeScript, Next.js)
- Describe best practices and why they matter
- Use analogies and examples

Be clear, educational, and thorough.`,

      suggest: `You are Yavi, a code improvement consultant. Analyze the user's context and suggest:
- Performance optimizations
- Accessibility improvements (WCAG 2.1 AA)
- Security enhancements
- UX improvements
- Code quality refactoring

Prioritize high-impact, actionable suggestions with code examples.`
    }

    const systemMessage: ChatMessage = {
      role: 'system',
      content: systemPrompts[mode]
    }

    // Add context information if available
    if (context) {
      systemMessage.content += `\n\nCurrent context: User is ${context.page}`
      if (context.component) {
        systemMessage.content += `, working on ${context.component}`
      }
    }

    // Build full conversation
    const fullMessages = [systemMessage, ...messages]

    // TODO: Replace with actual AI service call
    // For now, use mock responses
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      )
    }

    const response = await generateAIResponse(lastUserMessage.content, mode, context)

    return NextResponse.json({
      message: response,
      mode,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in Yavi chat:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

/**
 * Generate AI response (mock implementation)
 * TODO: Replace with actual AI service integration
 */
async function generateAIResponse(
  input: string,
  mode: 'help' | 'explain' | 'suggest',
  context?: { page: string; component?: string; code?: string }
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  const inputLower = input.toLowerCase()

  // Mode-specific responses
  if (mode === 'help') {
    if (inputLower.includes('template')) {
      return `Great question! Here are the industry templates available:

**Healthcare** 🏥
- Patient Intake Form (HIPAA-compliant)
- Medical Consent Form (e-signature)

**Fintech** 💰
- KYC Verification (AML, PATRIOT Act)
- Investment Profile & Risk Assessment

**Legal** ⚖️
- Client Intake Form (conflict checking)
- Retainer Agreement (fee structure)

**E-commerce** 🛒
- Optimized Checkout Form (PCI-DSS)
- Product Review Form

**SaaS** 💻
- User Onboarding Wizard
- Support Ticket Form

Which industry are you building for? I can help you get started with the right template.`
    }

    if (inputLower.includes('validation') || inputLower.includes('validate')) {
      return `I'll help you add validation! Here's the recommended approach:

\`\`\`typescript
// Email validation (RFC 5322 compliant)
const validateEmail = (email: string): boolean => {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  return regex.test(email)
}

// Phone validation (international format)
const validatePhone = (phone: string): boolean => {
  const regex = /^[+]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[(]?[0-9]{1,4}[)]?[-\\s\\.]?[0-9]{1,9}$/
  return regex.test(phone)
}

// Password strength
const validatePassword = (password: string): boolean => {
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*]/.test(password)

  return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
}
\`\`\`

Would you like me to generate a complete validation schema for your form?`
    }

    if (inputLower.includes('authentication') || inputLower.includes('auth') || inputLower.includes('login')) {
      return `I can help you set up authentication! Here's what I recommend:

**Option 1: NextAuth.js** (Recommended for Next.js)
- OAuth providers (Google, GitHub, etc.)
- Email/password authentication
- JWT tokens
- Session management

**Option 2: Supabase Auth**
- Email/password + magic links
- Social providers
- Row-level security
- Built-in user management

**Option 3: Custom Implementation**
- JWT tokens
- bcrypt password hashing
- Refresh token rotation
- CSRF protection

Which approach fits your project best? I can generate the implementation code.`
    }

    return `I'm here to help! Based on your current context (${context?.page}), I can assist with:

• Choosing and customizing templates
• Adding form validation
• Implementing authentication
• Styling with Tailwind CSS
• Setting up industry compliance (HIPAA, PCI-DSS, etc.)
• Performance optimization

What specific problem are you trying to solve?`
  }

  if (mode === 'explain') {
    if (inputLower.includes('sandpack') || inputLower.includes('preview')) {
      return `Sandpack is an in-browser code execution environment. Here's how it works:

**Architecture:**
1. **Bundler**: Uses a WebAssembly-based bundler to compile code
2. **iframe**: Runs code in an isolated sandbox for security
3. **Hot Module Replacement**: Updates preview instantly as you type

**In our platform:**
- Generated TypeScript/React code is sent to Sandpack
- Tailwind CSS is loaded via CDN
- Dependencies from package.json are auto-installed
- Live preview shows your application running

**Benefits:**
✅ No server setup required
✅ Instant feedback
✅ Safe execution (can't access your files)
✅ Full React ecosystem support

Think of it as CodeSandbox embedded directly in your app!`
    }

    if (inputLower.includes('tailwind')) {
      return `Tailwind CSS is a utility-first CSS framework. Here's why we use it:

**Traditional CSS:**
\`\`\`css
.card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
\`\`\`

**Tailwind CSS:**
\`\`\`jsx
<div className="bg-white p-6 rounded-lg shadow-lg">
  <!-- Content -->
</div>
\`\`\`

**Benefits:**
✅ No naming conflicts
✅ Faster development
✅ Consistent design system
✅ Responsive out of the box
✅ Smaller production CSS

**Common patterns:**
- Layout: \`flex items-center justify-between\`
- Spacing: \`p-6 m-4 gap-4\`
- Typography: \`text-xl font-bold text-gray-900\`
- Colors: \`bg-blue-500 text-white\`

It's designed for rapid prototyping and production apps!`
    }

    return `I can explain any concept! Try asking about:

• Technical concepts (React hooks, TypeScript, Next.js)
• Architecture patterns (component composition, state management)
• Best practices (accessibility, performance, security)
• Platform features (templates, validation, preview)

What would you like to understand better?`
  }

  if (mode === 'suggest') {
    const suggestions = []

    // Context-aware suggestions
    if (context?.page.includes('projects/new') || context?.page.includes('generate')) {
      suggestions.push(`✨ **Use Industry Templates**
Instead of starting from scratch, leverage our pre-built templates:
- Healthcare: HIPAA-compliant forms
- Fintech: KYC verification with AML compliance
- Legal: Attorney-client privilege protection
- E-commerce: PCI-DSS payment flows

This saves 40-60% development time and ensures compliance.`)
    }

    suggestions.push(`🔒 **Add Comprehensive Validation**
Implement client-side validation for better UX:
- Real-time error feedback
- Format validation (email, phone, SSN)
- Business rule validation (age > 18, date ranges)
- Custom validators for your domain

This reduces server load and improves conversion rates.`)

    suggestions.push(`♿ **Improve Accessibility (WCAG 2.1 AA)**
Make your app usable by everyone:
- Proper label association (\`htmlFor\` + \`id\`)
- ARIA attributes (\`aria-required\`, \`aria-invalid\`)
- Keyboard navigation (Tab order, Enter to submit)
- Focus indicators (visible focus rings)
- Screen reader support

This is required for government/healthcare apps and improves SEO.`)

    suggestions.push(`📊 **Add Analytics & Monitoring**
Track key metrics:
- Form completion rate
- Drop-off points
- Error frequency
- Time to complete
- A/B test variations

This helps you optimize conversion and user experience.`)

    return suggestions.join('\n\n---\n\n')
  }

  return `I'm not sure I understand. Could you rephrase that or ask something more specific?`
}

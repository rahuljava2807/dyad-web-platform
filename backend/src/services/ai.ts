import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { azure } from '@ai-sdk/azure'
import { generateObject, generateText, streamText } from 'ai'
import { z } from 'zod'
import { getComponentInstructions } from '../lib/componentSelector'
import { comprehensiveValidation, generateValidationReport } from '../lib/fileValidator'
import { getTemplate, getTemplatePromptEnhancement, type IndustryTemplate } from '../lib/industryTemplates'
import { bundleScaffoldComponents, detectUsedComponents } from '../lib/scaffoldBundler'
// import { logger } from '../utils/logger' // Not available
// import { yaviService } from './yavi' // Not needed for basic generation
// import { usageService } from './usage' // Not available

interface AIProvider {
  id: string
  name: string
  models: string[]
  available: boolean
  priority: number
}

interface GenerationContext {
  project?: any
  files?: any[]
  framework?: string
  language?: string
  dependencies?: string[]
  industry?: 'healthcare' | 'fintech' | 'legal' | 'ecommerce' | 'saas'
  templateId?: string
}

interface GenerateCodeRequest {
  prompt: string
  context?: GenerationContext
  provider?: string
  userId: string
}

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  context?: GenerationContext
  provider?: string
  userId: string
}

interface AnalyzeCodeRequest {
  code: string
  language: string
  context?: GenerationContext
  userId: string
}

class AIService {
  private providers: Map<string, AIProvider> = new Map()
  private defaultProvider = 'gpt-4'

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', {
        id: 'openai',
        name: 'OpenAI',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        available: true,
        priority: 1,
      })
    }

    // Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', {
        id: 'anthropic',
        name: 'Anthropic',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        available: true,
        priority: 2,
      })
    }

    // Google
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      this.providers.set('google', {
        id: 'google',
        name: 'Google',
        models: ['gemini-pro', 'gemini-1.5-pro'],
        available: true,
        priority: 3,
      })
    }

    // Azure OpenAI
    if (process.env.AZURE_OPENAI_API_KEY) {
      this.providers.set('azure', {
        id: 'azure',
        name: 'Azure OpenAI',
        models: ['gpt-4', 'gpt-35-turbo'],
        available: true,
        priority: 4,
      })
    }
  }

  async getAvailableProviders(): Promise<AIProvider[]> {
    return Array.from(this.providers.values()).sort((a, b) => a.priority - b.priority)
  }

  private getModelInstance(provider: string, model?: string) {
    switch (provider) {
      case 'openai':
        return openai(model || 'gpt-4')
      case 'anthropic':
        return anthropic(model || 'claude-3-sonnet-20240229')
      case 'google':
        return google(model || 'gemini-pro')
      case 'azure':
        return azure(model || 'gpt-4')
      default:
        return openai('gpt-4') // fallback
    }
  }

  /**
   * Converts @/ path aliases to relative paths for Sandpack compatibility
   * Sandpack doesn't support TypeScript tsconfig path aliases
   */
  private convertPathAliases(files: any[]): void {
    console.log('🔧 [Path Conversion] Converting @/ aliases to relative paths for Sandpack...')

    for (const file of files) {
      // Only convert code files
      if (!file.path.match(/\.(tsx?|jsx?)$/)) continue

      let convertedContent = file.content

      // Convert @/components/ui/* imports to relative paths
      convertedContent = convertedContent.replace(
        /from\s+["']@\/components\/ui\/([^"']+)["']/g,
        (match, componentPath) => {
          if (file.path.startsWith('src/components/ui/')) {
            return `from "./${componentPath}"`
          } else if (file.path.startsWith('src/components/')) {
            return `from "./ui/${componentPath}"`
          } else if (file.path.startsWith('components/ui/')) {
            return `from "./${componentPath}"`
          } else if (file.path.startsWith('components/')) {
            return `from "./ui/${componentPath}"`
          } else {
            return `from "./components/ui/${componentPath}"`
          }
        }
      )

      // Convert @/lib/* imports
      convertedContent = convertedContent.replace(
        /from\s+["']@\/lib\/([^"']+)["']/g,
        (match, libPath) => {
          if (file.path.startsWith('src/lib/')) {
            return `from "./${libPath}"`
          } else if (file.path.startsWith('src/components/ui/') || file.path.startsWith('components/ui/')) {
            return `from "../../lib/${libPath}"` // Two levels up from components/ui/
          } else if (file.path.startsWith('src/components/') || file.path.startsWith('components/')) {
            return `from "../lib/${libPath}"` // One level up from components/
          } else {
            return `from "./lib/${libPath}"`
          }
        }
      )

      // Convert @/hooks/* imports
      convertedContent = convertedContent.replace(
        /from\s+["']@\/hooks\/([^"']+)["']/g,
        (match, hookPath) => {
          if (file.path.startsWith('src/hooks/')) {
            return `from "./${hookPath}"`
          } else if (file.path.startsWith('src/components/ui/') || file.path.startsWith('components/ui/')) {
            return `from "../../hooks/${hookPath}"` // Two levels up from components/ui/
          } else if (file.path.startsWith('src/components/') || file.path.startsWith('components/')) {
            return `from "../hooks/${hookPath}"` // One level up from components/
          } else {
            return `from "./hooks/${hookPath}"`
          }
        }
      )

      // Convert @/types/* imports
      convertedContent = convertedContent.replace(
        /from\s+["']@\/types\/([^"']+)["']/g,
        (match, typePath) => {
          if (file.path.startsWith('src/types/')) {
            return `from "./${typePath}"`
          } else if (file.path.startsWith('src/components/ui/') || file.path.startsWith('components/ui/')) {
            return `from "../../types/${typePath}"` // Two levels up from components/ui/
          } else if (file.path.startsWith('src/components/') || file.path.startsWith('components/')) {
            return `from "../types/${typePath}"` // One level up from components/
          } else {
            return `from "./types/${typePath}"`
          }
        }
      )

      // Convert @/utils/* imports
      convertedContent = convertedContent.replace(
        /from\s+["']@\/utils\/([^"']+)["']/g,
        (match, utilPath) => {
          if (file.path.startsWith('src/utils/')) {
            return `from "./${utilPath}"`
          } else if (file.path.startsWith('src/components/ui/') || file.path.startsWith('components/ui/')) {
            return `from "../../utils/${utilPath}"` // Two levels up from components/ui/
          } else if (file.path.startsWith('src/components/') || file.path.startsWith('components/')) {
            return `from "../utils/${utilPath}"` // One level up from components/
          } else {
            return `from "./utils/${utilPath}"`
          }
        }
      )

      // Convert @/components/* (non-ui) imports
      convertedContent = convertedContent.replace(
        /from\s+["']@\/components\/([^"']+)["']/g,
        (match, componentPath) => {
          if (componentPath.startsWith('ui/')) return match // Skip ui imports (already converted)

          if (file.path.startsWith('src/components/')) {
            return `from "./${componentPath}"`
          } else if (file.path.startsWith('components/')) {
            return `from "./${componentPath}"`
          } else {
            return `from "./components/${componentPath}"`
          }
        }
      )

      if (convertedContent !== file.content) {
        file.content = convertedContent
        console.log(`🔧 [Path Conversion] Converted imports in ${file.path}`)
      }
    }

    console.log('✅ [Path Conversion] All @/ aliases converted to relative paths')
  }

  private buildSystemPrompt(context?: GenerationContext): string {
    let systemPrompt = `You are an expert React + TypeScript developer who creates COMPLETE, PRODUCTION-READY web applications.

🚨🚨🚨 CRITICAL: NO PARTIAL IMPLEMENTATIONS! 🚨🚨🚨

All code you generate will be directly built and rendered, therefore you MUST NEVER make partial changes or incomplete implementations.

If a user asks for features, implement ALL features as FULLY FUNCTIONAL with COMPLETE code - no placeholders, no partial implementations, no TODO comments, no "implementation goes here" comments.

## IMMEDIATE COMPONENT CREATION RULE

You MUST create a new file for every new component or hook, no matter how small.
Never add new components to existing files, even if they seem related.
Aim for components that are 100 lines of code or less.

## CRITICAL CODE RULES

- Only make changes that were directly requested by the user
- Always specify the correct file path when writing files
- Ensure code is complete, syntactically correct, and follows existing conventions
- DO NOT be lazy and ALWAYS write the entire file - it needs to be a COMPLETE file
- Make sure to include ALL imports, ALL logic, ALL styling

## DO NOT OVERENGINEER

You take great pride in keeping things simple and elegant. Focus on the user's request and make the minimum amount of changes needed. DON'T DO MORE THAN WHAT THE USER ASKS FOR.

🚨🚨🚨 TAILWIND CSS IS MANDATORY 🚨🚨🚨

ALWAYS use Tailwind CSS for styling. NEVER use custom CSS classes.

❌ FORBIDDEN: className="metric-card", className="dashboard", className="custom-button"
✅ REQUIRED: className="bg-white p-6 rounded-lg shadow-lg"

Every className MUST be real Tailwind utility classes:
- bg-white, bg-blue-500, bg-gradient-to-r from-blue-500 to-purple-600
- text-gray-900, text-xl, font-bold, font-semibold
- p-4, p-6, m-4, mx-auto, px-6, py-3
- flex, grid, items-center, justify-between, gap-4
- rounded-lg, rounded-xl, shadow-lg, hover:shadow-xl
- transition-all, duration-300

## TECH STACK

- You are building a React application with TypeScript
- Always use Tailwind CSS for styling
- Use lucide-react for icons
- Put source code in src/ folder
- Put components in src/components/
- Main component MUST be App.tsx

## AVAILABLE PACKAGES & LIBRARIES

🎨 **shadcn/ui Components** (ALREADY INSTALLED - Just import and use!):
- You ALREADY have ALL 49 shadcn/ui components installed and ready to use
- You have ALL necessary Radix UI dependencies pre-installed
- DO NOT install or add shadcn/ui components to dependencies - they're ready!

Available shadcn/ui components:
Button, Input, Card, Label, Form, Select, Checkbox, Textarea, Dialog, Sheet,
Popover, Tabs, Table, Accordion, Alert, Avatar, Badge, Breadcrumb, Calendar,
Carousel, Chart, Collapsible, Command, ContextMenu, DropdownMenu, HoverCard,
Menubar, NavigationMenu, Pagination, Progress, RadioGroup, ScrollArea, Separator,
Skeleton, Slider, Switch, Toast, Toaster, Toggle, ToggleGroup, Tooltip

**Icons**: lucide-react is installed (just import what you need)

**Styling**: Tailwind CSS is fully configured (use utility classes)

⚠️ **DO NOT ADD** these to dependencies (they're already included or not needed):
- Any @/components/ui/* paths
- Any @radix-ui/* packages
- react-hook-form, zod, @hookform/resolvers (use manual validation)
- class-variance-authority, tailwind-merge, clsx (already set up)

📦 **ROUTING & NAVIGATION**:
- ⚠️ AVOID react-router-dom UNLESS user specifically requests routing/navigation
- Default: Build single-page apps with conditional rendering (useState to toggle views)
- IF routing is absolutely needed: Add "react-router-dom": "^6.20.0" to package.json dependencies
- Example single-page pattern:
  const [view, setView] = useState('home')
  return view === 'home' ? <HomePage /> : <ProfilePage />

🔐 **AUTHENTICATION FLOWS** (Login/Signup):
When user requests login/signup, you MUST implement complete flow with post-auth navigation:

// In App.tsx - handle auth state and navigation
const [isAuthenticated, setIsAuthenticated] = useState(false)
const [user, setUser] = useState<{ email: string; name: string } | null>(null)

const handleLogin = (email: string, password: string) => {
  // Simulate auth (in real app, this would be API call)
  setUser({ email, name: email.split('@')[0] })
  setIsAuthenticated(true)
}

const handleLogout = () => {
  setUser(null)
  setIsAuthenticated(false)
}

return isAuthenticated ? (
  <Dashboard user={user} onLogout={handleLogout} />
) : (
  <LoginPage onLogin={handleLogin} />
)

⚠️ **VALIDATION - DO NOT create separate helper functions**:
Keep validation INLINE in the component - DO NOT extract to separate functions like validateEmail(), validatePassword(), etc.

✅ CORRECT approach:
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  const newErrors: FormErrors = {}

  // Validate inline - NO separate functions
  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Valid email required'
  }
  if (!formData.password || formData.password.length < 8) {
    newErrors.password = 'Password must be 8+ characters'
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return
  }

  onLogin(formData.email, formData.password)
}

❌ WRONG - DO NOT do this:
const validateEmail = (email: string) => { ... }  // DON'T create separate functions
const handleSubmit = () => {
  const emailError = validateEmail(formData.email)  // This causes "validateEmail is not defined" errors
}

📋 **COMPLETE LOGIN APP EXAMPLE**:
When user requests "login application" or "auth system", generate these EXACT files:

**1. App.tsx** (Main orchestrator):
import { useState } from 'react'
import { LoginForm } from './components/LoginForm'
import { Dashboard } from './components/Dashboard'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)

  const handleLogin = (email: string, password: string) => {
    setUser({ email })
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {isAuthenticated ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  )
}

**2. components/LoginForm.tsx** (The login UI):
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface LoginFormProps {
  onLogin: (email: string, password: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: { email?: string; password?: string } = {}

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Valid email required'
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be 6+ characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onLogin(email, password)
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

**3. components/Dashboard.tsx** (Post-login view):
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface DashboardProps {
  user: { email: string } | null
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Button onClick={onLogout} variant="outline">Logout</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You are successfully logged in!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

🚨 CRITICAL: For auth apps, you MUST generate ALL these files. The App.tsx MUST have the authentication state and conditional rendering logic.

## WHAT TO GENERATE

🚨 **MANDATORY ROOT FILE** - ALWAYS GENERATE THIS FIRST:
- **App.tsx** - The main application component that orchestrates everything
  - For auth flows: MUST contain isAuthenticated state and conditional rendering
  - For dashboards: MUST contain the main layout and component composition
  - For forms: MUST render the form component and handle success states
  - This is THE ENTRY POINT - if you don't generate App.tsx, the preview will show a placeholder!

📋 **FILE REQUIREMENTS**:
- Generate 8-12 production-ready files minimum
- Create separate files for each component (keep components under 100 lines each)
- Include realistic mock data (20-50 items for lists/tables)
- Add proper TypeScript types and interfaces
- ALWAYS generate responsive designs
- Include complete package.json with ALL dependencies

Example files for a dashboard:
- App.tsx (main component - MANDATORY!)
- components/Dashboard.tsx
- components/Sidebar.tsx
- components/MetricCard.tsx
- components/DataTable.tsx
- utils/mockData.ts
- package.json
- README.md

## CODING GUIDELINES

🎯 **SIMPLICITY FIRST** (Dyad Philosophy):
- DON'T DO MORE THAN WHAT THE USER ASKS FOR
- DO NOT OVERENGINEER - keep code simple and elegant
- Each component should be under 100 lines (create new files for larger features)
- NO placeholder content - everything must be fully functional
- NO TODO comments - complete all features requested
- Create a new file for every new component or hook, no matter how small

⚠️ **ERROR HANDLING**:
- Don't catch errors with try/catch blocks unless specifically requested
- Let errors bubble up naturally - this helps with debugging

✨ **CODE QUALITY**:
- ALWAYS generate responsive designs
- Use modern React patterns (hooks, functional components)
- Include proper TypeScript types
- Generate beautiful UIs with Tailwind gradients, shadows, and hover effects

## INTERACTIVE FORM GENERATION (PHASE 2)

When generating forms, you MUST include:

### FUNCTIONAL REQUIREMENTS:
- All fields must be fully interactive with real onChange handlers
- Include comprehensive validation (required, format, range, custom rules)
- Implement proper TypeScript interfaces for form data
- Add loading states for async operations (submit, API calls)
- Include error handling with user-friendly messages
- Implement success/error feedback (not just console.log)

### VALIDATION RULES:
- Email: Use RFC 5322 compliant regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Phone: Support international format with country code
- Password: Min 8 chars, uppercase, lowercase, number, special char
- Date: Validate against min/max dates, no weekends for business forms
- File Upload: Check size limits (5MB default), allowed types, show file preview
- Credit Card: Luhn algorithm validation (if applicable)
- Custom Rules: Implement business logic (age > 18, quantity > 0, etc.)

🚨 CRITICAL: DO NOT USE THESE LIBRARIES (Sandpack doesn't support them):
❌ react-hook-form
❌ @hookform/resolvers
❌ zod (for validation schemas)
❌ yup
❌ formik
❌ axios
❌ @tanstack/react-query

✅ INSTEAD: Use native React useState for forms and manual validation functions

### STATE MANAGEMENT:
typescript
const [formData, setFormData] = useState<FormType>({...})
const [errors, setErrors] = useState<Partial<FormType>>({})
const [isSubmitting, setIsSubmitting] = useState(false)
const [submitSuccess, setSubmitSuccess] = useState(false)


### EVENT HANDLERS:
- onChange: Update form data, clear field error
- onBlur: Validate individual field, show error if invalid
- onSubmit: Prevent default, validate all, submit if valid, show loading
- onFocus: Clear error for that field (better UX)

### ERROR DISPLAY:
- Show errors below the input field
- Red border on invalid inputs
- Clear, actionable error messages ("Email is required" not "Invalid input")
- Error summary at top of form if multiple errors

### ACCESSIBILITY (WCAG 2.1 AA):
- Proper label association: <label htmlFor="email">Email</label> <input id="email" />
- ARIA attributes: aria-required="true", aria-invalid="true", aria-describedby="email-error"
- Keyboard navigation: Tab order logical, Enter to submit, Esc to cancel
- Focus indicators: Visible focus ring on all interactive elements
- Error announcements: aria-live="polite" for screen readers
- Color contrast: 4.5:1 minimum for text, 3:1 for UI components

### UX ENHANCEMENTS:
- Auto-focus first field on component mount
- Show password toggle button (eye icon)
- Character counter for textareas (e.g., "250/500 characters")
- Password strength indicator (Weak/Medium/Strong)
- Helpful placeholder text with examples
- Disable submit button during submission
- Loading spinner in submit button
- Success message after submission (not just alert)

### TAILWIND STYLING FOR FORMS:
Input Default State:
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"

Input Error State:
className="w-full px-4 py-3 border border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"

Input Success State (optional):
className="w-full px-4 py-3 border border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

Label:
className="block text-sm font-medium text-gray-700 mb-2"

Error Message:
className="mt-1 text-sm text-red-600"

Submit Button:
className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"

### CODE QUALITY FOR FORMS:
- NO placeholder code or TODO comments
- Extract validation to separate utils file (src/utils/validation.ts)
- Reusable components for common patterns (FormInput, FormSelect, etc.)
- Clear function names: handleEmailChange, validateEmail, submitForm
- TypeScript strict mode compliant
- Error boundaries around form components

## REACT COMPONENT EXPORTS

🚨 CRITICAL: All React components MUST be properly exported to avoid "Element type is invalid" errors.

### DEFAULT EXPORT (Recommended for page components):

✅ CORRECT:
\`\`\`typescript
// App.tsx
export default function App() {
  return <div>...</div>
}

// Import in another file:
import App from './App'
\`\`\`

### NAMED EXPORT (For utility components):

✅ CORRECT:
\`\`\`typescript
// LoginForm.tsx
export function LoginForm() {
  return <form>...</form>
}

// Import in another file:
import { LoginForm } from './LoginForm'
\`\`\`

### MULTIPLE EXPORTS:

✅ CORRECT:
\`\`\`typescript
// components/Cards.tsx
export function MetricCard() { return <div>...</div> }
export function UserCard() { return <div>...</div> }
export function ProductCard() { return <div>...</div> }

// Import in another file:
import { MetricCard, UserCard } from './components/Cards'
\`\`\`

### COMMON MISTAKES TO AVOID:

❌ WRONG: Missing export statement
\`\`\`typescript
function LoginForm() { return <form>...</form> }  // ❌ Not exported!
\`\`\`

❌ WRONG: Importing named export as default
\`\`\`typescript
// LoginForm.tsx
export function LoginForm() {...}

// Another file
import LoginForm from './LoginForm'  // ❌ Wrong! Should be: import { LoginForm }
\`\`\`

❌ WRONG: Importing default export as named
\`\`\`typescript
// App.tsx
export default function App() {...}

// Another file
import { App } from './App'  // ❌ Wrong! Should be: import App from './App'
\`\`\`

### RULES:
1. **ALWAYS export every React component** you create
2. **Use default export for main components** (App, pages)
3. **Use named exports for reusable components** (LoginForm, Button, Card)
4. **Match import style to export style** (default ↔ default, named ↔ named)
5. **One component per file** for clarity (except for closely related components)

## FUNCTION DEFINITIONS AND SCOPE

🚨 CRITICAL: All functions must be defined before they are called to avoid "X is not defined" runtime errors.

### CORRECT PATTERN - Define functions INSIDE component:

✅ CORRECT:
\`\`\`typescript
export function LoginForm() {
  const [formData, setFormData] = useState({email: '', password: ''})
  const [errors, setErrors] = useState<any>({})

  // ✅ Define validation function INSIDE component
  const validateForm = (data: typeof formData): boolean => {
    const newErrors: any = {}

    if (!data.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!data.password) {
      newErrors.password = 'Password is required'
    } else if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ Now validateForm is in scope when handleSubmit calls it
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(formData)) return  // ✅ Works!

    // Submit logic...
  }

  return <form onSubmit={handleSubmit}>...</form>
}
\`\`\`

### ALTERNATIVE - Import from utility file:

✅ ALSO CORRECT:
\`\`\`typescript
// lib/validation.ts
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format'
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  return null
}

// components/LoginForm.tsx
import { validateEmail, validatePassword } from '../lib/validation'

export function LoginForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailError = validateEmail(formData.email)  // ✅ Works!
    const passwordError = validatePassword(formData.password)  // ✅ Works!

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError })
      return
    }

    // Submit logic...
  }

  return <form onSubmit={handleSubmit}>...</form>
}
\`\`\`

### COMMON MISTAKES TO AVOID:

❌ WRONG: Calling function before it is defined
\`\`\`typescript
export function LoginForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(formData)) return  // ❌ ReferenceError: validateForm is not defined!
  }

  // ❌ Function defined AFTER it is used
  const validateForm = (data: any) => { ... }
}
\`\`\`

❌ WRONG: Calling imported function without import statement
\`\`\`typescript
// components/LoginForm.tsx
export function LoginForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    if (!validateEmail(formData.email)) return  // ❌ validateEmail is not defined!
  }
}

// ❌ Missing: import { validateEmail } from '../lib/validation'
\`\`\`

❌ WRONG: Defining function outside component scope
\`\`\`typescript
// ❌ Function defined outside component - not accessible
const validateForm = (data: any) => { ... }

export function LoginForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    if (!validateForm(formData)) return  // ❌ May not have access to component state
  }
}
\`\`\`

### RULES:
1. **Define helper functions INSIDE the component** if they need access to state/props
2. **Define validation functions in separate files** (lib/validation.ts) for reusability
3. **ALWAYS import** functions from other files before using them
4. **Define functions BEFORE calling them** in the same file (or hoist with function declarations)
5. **Use descriptive names**: validateForm, handleSubmit, calculateTotal (not validate, submit, calc)

### FUNCTION PLACEMENT ORDER (inside component):
1. State declarations (useState, useRef, etc.)
2. Helper/validation functions
3. Event handlers (handleSubmit, handleChange, etc.)
4. useEffect hooks
5. Return JSX

## JSON OUTPUT SAFETY

🚨 CRITICAL: Your response will be parsed as JSON. Follow these rules strictly:

1. **AVOID APOSTROPHES IN STRINGS:**
   ❌ WRONG: 'Don\'t have an account?'
   ✅ RIGHT: "Don't have an account?" (use double quotes)
   ✅ RIGHT: 'Do not have an account?' (rephrase to avoid apostrophes)

2. **USE TEMPLATE LITERALS FOR COMPLEX TEXT:**
   ❌ WRONG: 'User\'s profile'
   ✅ RIGHT: \`User's profile\` (template literal)

3. **ESCAPE SEQUENCES IN REGEX:**
   When writing regex patterns in strings, use proper JSON escaping:
   ✅ CORRECT: "!/\\\\S+@\\\\S+\\\\.\\\\S+/.test(email)"
   (Double backslashes for JSON string escaping)

4. **CONTRACTIONS:**
   Prefer full words over contractions to avoid apostrophe issues:
   ✅ Use "cannot" instead of "can't"
   ✅ Use "do not" instead of "don't"
   ✅ Use "does not" instead of "doesn't"
   ✅ Use "will not" instead of "won't"

## REMEMBER

Make every application beautiful, complete, and production-ready. Code should be something developers want to show off.`

    if (context?.framework) {
      systemPrompt += `\n\nFramework: ${context.framework}
Use ${context.framework}-specific best practices and modern patterns.
Leverage ${context.framework} features for optimal performance.`
    }

    if (context?.language) {
      systemPrompt += `\n\nPrimary language: ${context.language}
Use strict TypeScript with proper type definitions and interfaces.`
    }

    if (context?.dependencies && context.dependencies.length > 0) {
      systemPrompt += `\n\nAvailable dependencies: ${context.dependencies.join(', ')}`
    }

    if (context?.project) {
      systemPrompt += `\n\nProject context:
- Name: ${context.project.name}
- Description: ${context.project.description}
- Framework: ${context.project.framework || 'React + TypeScript'}
- Make this project stand out with exceptional design and functionality.`
    }

    return systemPrompt
  }

  async generateCode(request: GenerateCodeRequest) {
    try {
      // Mock response when no API key is configured
      if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.AZURE_OPENAI_API_KEY) {
        console.log('🚧 No API key configured, returning mock response for testing')
        return {
          code: 'mock_app',
          explanation: 'Mock application generated for testing purposes',
          files: [
            {
              path: 'src/App.tsx',
              content: `import React from 'react';\n\nconst App: React.FC = () => {\n  return (\n    <div className="min-h-screen bg-gray-100 flex items-center justify-center">\n      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">\n        <h1 className="text-2xl font-bold text-gray-900 mb-4">Mock Application</h1>\n        <p className="text-gray-600 mb-4">This is a mock response generated for testing purposes.</p>\n        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">\n          Test Button\n        </button>\n      </div>\n    </div>\n  );\n};\n\nexport default App;`,
              type: 'create' as const
            },
            {
              path: 'package.json',
              content: `{\n  "name": "mock-app",\n  "version": "0.1.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`,
              type: 'create' as const
            }
          ],
          dependencies: ['react', 'react-dom'],
          instructions: 'This is a mock response for testing. Configure an API key to use real AI generation.'
        }
      }

      const provider = request.provider || this.defaultProvider
      const model = this.getModelInstance(provider)

      // Track usage
      // await usageService.trackUsage({
      //   userId: request.userId,
      //   type: 'code_generation',
      //   provider,
      //   promptTokens: request.prompt.length,
      // })

      // Enhanced prompt with Yavi.ai integration if available
      let enhancedPrompt = request.prompt
      // if (request.context?.project) {
      //   const yaviContext = await yaviService.getRelevantContext(request.prompt, request.context.project.id)
      //   if (yaviContext) {
      //     enhancedPrompt += `\n\nRelevant context from Yavi.ai:\n${yaviContext}`
      //   }
      // }

      // 🚀 PHASE 1: Add component-specific shadcn-ui instructions
      const componentConfig = getComponentInstructions(request.prompt)
      enhancedPrompt += `\n\n${componentConfig.instructions}\n`

      // 🚀 PHASE 2: Industry Template Integration
      let templateEnhancement = ''
      if (request.context?.industry && request.context?.templateId) {
        const template = getTemplate(request.context.industry, request.context.templateId)
        if (template) {
          templateEnhancement = getTemplatePromptEnhancement(template)
          enhancedPrompt += `\n\n${templateEnhancement}\n`
          console.log(`🏥 Using industry template: ${template.name} (${template.industry.toUpperCase()})`)
          console.log(`📋 Compliance requirements: ${template.compliance.join(', ')}`)
        } else {
          console.warn(`⚠️  Template not found: ${request.context.templateId} in ${request.context.industry}`)
        }
      }

      // Add production-quality requirements to the prompt
      enhancedPrompt += `

🚨🚨🚨 ABSOLUTELY CRITICAL: DO NOT JUST ECHO THE USER'S PROMPT AS TEXT! 🚨🚨🚨
❌ FORBIDDEN: Creating a component that just displays the user's request like <div>Login Application</div>
✅ REQUIRED: Build a COMPLETE, WORKING, FUNCTIONAL application based on the request

🚨🚨🚨 CRITICAL GENERATION REQUIREMENTS 🚨🚨🚨
1. Generate a COMPLETE, BEAUTIFUL application with at least 6-10 files minimum
2. For LOGIN/AUTH apps: Include LoginForm, SignupForm, AuthPage/Layout, validation schemas, types, mock auth logic
3. For DASHBOARDS: Include Dashboard, Sidebar, Metrics, Charts, DataTable components with mock data
4. Include rich UI components with Framer Motion animations when appropriate
5. 🚨 MANDATORY: Use ONLY Tailwind CSS utility classes for ALL styling 🚨
6. Include realistic mock data (20-50 items for lists/tables)
7. Add proper TypeScript types and interfaces
8. Implement smooth hover effects and transitions with Tailwind (hover:bg-blue-700, etc.)
9. Make it production-ready and portfolio-worthy with complete, working functionality
10. 🚨 DO NOT create placeholder components with just text - BUILD THE ACTUAL APPLICATION! 🚨

🚨 DEPENDENCIES ARRAY RULES:
❌ NEVER include "@/components/ui" in dependencies - it is NOT an npm package!
❌ NEVER include path aliases (@/ or ~/) in dependencies array
✅ ONLY include real npm packages: react, react-dom, framer-motion, lucide-react, recharts, etc.

Example CORRECT dependencies array:
["react", "react-dom", "react-router-dom", "framer-motion", "lucide-react"]

Example WRONG dependencies array (DO NOT DO THIS):
["react", "@/components/ui", "@/lib/utils"] ❌

🚨 TAILWIND CSS REQUIREMENTS (NON-NEGOTIABLE):
- EVERY className must use Tailwind utilities (bg-white, text-xl, flex, grid, etc.)
- NO generic class names (metric-card, dashboard, navigation, sidebar, etc.)
- Use proper Tailwind patterns: bg-white p-6 rounded-lg shadow-lg
- Include responsive classes: md:grid-cols-2, lg:text-3xl
- Add hover effects: hover:shadow-xl, hover:bg-blue-700
- Use proper spacing: p-6, m-4, gap-4, space-y-6

Generate files that include (MINIMUM 6 FILES REQUIRED):
- Main App component (App.tsx) with routing/layout
- At least 3-5 feature components based on the request:
  * For LOGIN: LoginForm, SignupForm, Auth Layout, validation schema, types
  * For DASHBOARD: Dashboard, Sidebar, MetricCards, Chart components, DataTable
  * For E-COMMERCE: ProductList, ProductCard, Cart, Checkout components
- Complete package.json with ALL dependencies (react, react-dom, framer-motion, lucide-react, etc.)
- Types/interfaces file (types.ts) with proper TypeScript definitions
- Mock data utilities (mockData.ts) with 20+ realistic items
- Comprehensive README.md with setup instructions

🚨 REMEMBER: Generic class names = ZERO styling in preview!
🚨 ONLY Tailwind CSS utility classes will work!
🚨 Make every component beautiful, interactive, and polished with proper Tailwind classes!`

      const result = await generateObject({
        model,
        system: this.buildSystemPrompt(request.context),
        prompt: enhancedPrompt,
        schema: z.object({
          code: z.string().optional().describe('DEPRECATED: Leave empty, use files array instead'),
          explanation: z.string().describe('Brief explanation of the application architecture and key features (2-3 sentences)'),
            files: z.array(z.object({
              path: z.string().describe('File path relative to project root (e.g., src/App.tsx, src/components/Dashboard.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code with MANDATORY TAILWIND CSS CLASSES. NO generic class names like "metric-card", "dashboard", or "navigation". Use ONLY Tailwind utilities like "bg-white p-6 rounded-lg shadow-lg", "flex items-center justify-between", "text-2xl font-bold text-gray-900". EVERY className must be a valid Tailwind CSS utility class. Generate COMPLETE, WORKING code with imports, exports, hooks, and proper JSX/TSX syntax.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(2).describe('MUST generate minimum 2-5 complete files with REAL code using ONLY Tailwind CSS classes'),
          dependencies: z.array(z.string()).optional().describe('Required NPM packages: react, react-dom, framer-motion, lucide-react, recharts, etc.'),
          instructions: z.string().optional().describe('Setup instructions'),
        }),
      })

      console.log(`Generated code for user ${request.userId}`, {
        provider,
        promptLength: request.prompt.length,
        filesCount: result.object.files.length,
      })

      // VALIDATE TAILWIND CSS CLASSES - Reject if generic classes found
      const genericClassPatterns = [
        /className=["'](metric-card|dashboard|navigation|sidebar|data-table|chart|container|wrapper|header|footer|content|main|card|button|input|form|section|article|aside|nav|div|span)["']/gi,
        /className=["'][^"']*[^-](card|button|input|form|section|article|aside|nav|div|span)(?!\w)["']/gi
      ]
      
      const hasGenericClasses = result.object.files.some(file => {
        if (file.path.endsWith('.tsx') || file.path.endsWith('.jsx')) {
          return genericClassPatterns.some(pattern => pattern.test(file.content))
        }
        return false
      })

      if (hasGenericClasses) {
        console.warn(`AI generated code with generic class names, regenerating with stronger Tailwind enforcement...`)
        
        const tailwindEnforcementPrompt = `${enhancedPrompt}

🚨🚨🚨 CRITICAL: YOU GENERATED GENERIC CLASS NAMES! 🚨🚨🚨
🚨 THIS WILL CAUSE ZERO STYLING IN THE PREVIEW! 🚨
🚨 YOU MUST USE ONLY TAILWIND CSS UTILITY CLASSES! 🚨

FORBIDDEN PATTERNS YOU USED (DO NOT USE THESE AGAIN):
❌ className="metric-card" ❌ className="dashboard" ❌ className="navigation"
❌ className="sidebar" ❌ className="data-table" ❌ className="chart"
❌ className="container" ❌ className="wrapper" ❌ className="header"
❌ className="footer" ❌ className="content" ❌ className="main"

MANDATORY TAILWIND PATTERNS (USE ONLY THESE):
✅ className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
✅ className="flex items-center justify-between gap-4"
✅ className="text-2xl font-bold text-gray-900"
✅ className="grid grid-cols-1 md:grid-cols-4 gap-6"
✅ className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
✅ className="w-full h-full min-h-screen bg-gray-50"
✅ className="max-w-7xl mx-auto px-4 py-8"

🚨 BEFORE GENERATING ANY className, VERIFY IT'S A TAILWIND UTILITY:
- Background: bg-white, bg-blue-500, bg-gradient-to-r
- Text: text-white, text-gray-900, text-xl, font-bold
- Layout: flex, grid, block, inline
- Spacing: p-6, m-4, px-8, py-4, gap-4, space-y-6
- Sizing: w-full, h-screen, max-w-7xl, min-h-screen
- Borders: rounded-lg, border, shadow-lg
- Effects: hover:shadow-xl, transition-all, backdrop-blur

🚨 REGENERATE WITH PROPER TAILWIND CLASSES OR THE APP WILL BE UNSTYLED!`

        const retryResult = await generateObject({
          model,
          system: this.buildSystemPrompt(request.context),
          prompt: tailwindEnforcementPrompt,
          schema: z.object({
            code: z.string().describe('DEPRECATED: Leave empty'),
            explanation: z.string().describe('Brief explanation (2-3 sentences)'),
            files: z.array(z.object({
              path: z.string().describe('File path (e.g., src/App.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code with PROPER TAILWIND CSS CLASSES. NO generic class names like "metric-card" or "dashboard". Use ONLY Tailwind utilities like "bg-white p-6 rounded-lg shadow-lg". EVERY className must be a valid Tailwind CSS utility class.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(2, 'MUST generate at least 2 complete files'),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
        })

        console.log(`Regenerated with proper Tailwind classes: ${retryResult.object.files.length} files`)
        return retryResult.object
      }

      // CHECK IF AI IS JUST ECHOING THE PROMPT - Detect placeholder/text-only responses
      const allFiles = result.object.files
      let isEchoingPrompt = false

      // Check ALL files for echo patterns
      for (const file of allFiles) {
        const codeContent = file.content.toLowerCase()
        const promptLower = request.prompt.toLowerCase()

        // Multiple echo detection strategies
        const directEcho = codeContent.includes(promptLower)
        const hasPromptInHeading = codeContent.includes(`<h1>${promptLower}`) ||
                                    codeContent.includes(`<h2>${promptLower}`) ||
                                    codeContent.includes(`<h1 `) && codeContent.includes(`>${promptLower}<`)
        const hasPromptInDiv = codeContent.includes(`<div>${promptLower}`) ||
                               codeContent.includes(`<div `) && codeContent.includes(`>${promptLower}<`)
        const hasPromptInPara = codeContent.includes(`<p>${promptLower}`) ||
                                codeContent.includes(`<p `) && codeContent.includes(`>${promptLower}<`)

        // Check if multiple prompt words appear in JSX content (not as attributes)
        const promptWords = promptLower.split(' ').filter(w => w.length > 4)
        let wordsFoundInJSX = 0
        for (const word of promptWords) {
          if (codeContent.includes(`>${word}<`) || codeContent.includes(`> ${word} <`)) {
            wordsFoundInJSX++
          }
        }

        if (directEcho || hasPromptInHeading || hasPromptInDiv || hasPromptInPara || wordsFoundInJSX >= 3) {
          console.warn(`🚨 ECHO DETECTED in ${file.path}:`, {
            directEcho,
            hasPromptInHeading,
            hasPromptInDiv,
            hasPromptInPara,
            wordsFoundInJSX
          })
          isEchoingPrompt = true
          break
        }
      }

      if (isEchoingPrompt) {
        console.warn(`AI is echoing the prompt instead of building an application! Regenerating...`)

          const antiEchoPrompt = `${enhancedPrompt}

🚨🚨🚨 CRITICAL ERROR DETECTED: YOU ARE ECHOING THE USER'S PROMPT! 🚨🚨🚨
❌ You created: <div>${request.prompt}</div> or <h1>${request.prompt}</h1>
❌ This is COMPLETELY WRONG! You are NOT building an application!

✅ CORRECT APPROACH FOR "${request.prompt}":
You MUST BUILD a complete, FUNCTIONAL application with REAL features:

${request.prompt.toLowerCase().includes('financial statement') ? `
FOR FINANCIAL STATEMENT ANALYZER:
1. FinancialDashboard.tsx - Main dashboard with P&L, Balance Sheet, Cash Flow tabs
2. StatementUploader.tsx - File upload component with drag-drop (PDF/Excel)
3. BalanceSheetAnalyzer.tsx - Displays Assets, Liabilities, Equity with interactive charts
4. IncomeStatementView.tsx - Revenue, Expenses, Net Income with trend analysis
5. CashFlowAnalysis.tsx - Operating, Investing, Financing activities visualization
6. RatioCalculator.tsx - Financial ratios (ROE, ROA, Current Ratio, Quick Ratio, Debt-to-Equity)
7. TrendChart.tsx - Multi-year comparison charts using recharts
8. AlertSystem.tsx - Anomaly detection and financial warnings
9. ReportGenerator.tsx - Export to PDF/Excel functionality UI
10. MockFinancialData.ts - Complete mock data for 3 years of statements
` : request.prompt.toLowerCase().includes('login') || request.prompt.toLowerCase().includes('auth') ? `
FOR LOGIN/AUTH APPLICATION:
1. LoginPage.tsx - Full login form with email/password validation
2. SignupPage.tsx - Registration form with password strength
3. ForgotPassword.tsx - Password reset flow
4. AuthLayout.tsx - Authentication pages wrapper
5. useAuth.ts - Custom authentication hook
6. authService.ts - Mock authentication service
7. ProtectedRoute.tsx - Route guard component
` : `
FOR DASHBOARD APPLICATION:
1. Dashboard.tsx - Main metrics overview with KPIs
2. Sidebar.tsx - Collapsible navigation
3. MetricsCards.tsx - Key metrics with animations
4. DataTable.tsx - Sortable/filterable data grid
5. Charts.tsx - Multiple chart types (bar, line, pie)
6. mockData.ts - Rich mock data (50+ items)
`}

🚨 RULES:
- Each file MUST be 80-200 lines of REAL, EXECUTABLE code
- Use ONLY Tailwind CSS classes for styling (NO CSS-in-JS)
- Include useState, useEffect, real event handlers
- Add mock data that looks production-ready
- Include animations and transitions
- Make it interactive (buttons work, forms validate, data filters)

DO NOT just display "${request.prompt}" as text!
BUILD THE ACTUAL WORKING APPLICATION NOW!
Generate 8-12 complete files!`

          const antiEchoResult = await generateObject({
            model,
            system: this.buildSystemPrompt(request.context),
            prompt: antiEchoPrompt,
            schema: z.object({
              code: z.string().optional(),
              explanation: z.string(),
              files: z.array(z.object({
                path: z.string(),
                content: z.string(),
                type: z.enum(['create', 'modify', 'delete']),
              })).min(2, 'MUST generate at least 2 complete files'),
              dependencies: z.array(z.string()).optional(),
              instructions: z.string().optional(),
            }),
          })

          console.log(`Regenerated after detecting echo: ${antiEchoResult.object.files.length} files`)
          return antiEchoResult.object
      }

      // VALIDATE CONTENT QUALITY - Check file sizes and substance
      const componentFiles = result.object.files.filter(f =>
        f.path.endsWith('.tsx') || f.path.endsWith('.ts') || f.path.endsWith('.jsx') || f.path.endsWith('.js')
      )

      // 🚨 DISABLED: Quality retry causes AI exhaustion, generating fewer files each time
      const ENABLE_QUALITY_RETRY = false

      let hasQualityIssues = false
      const qualityIssues: string[] = []

      // Check each component file for minimum line count
      for (const file of componentFiles) {
        const lineCount = file.content.split('\n').length
        const charCount = file.content.length

        // Skip small config files like package.json
        if (file.path.includes('package.json') || file.path.includes('tsconfig') || file.path.includes('README')) {
          continue
        }

        // Component files should be substantial (at least 30 lines, 500 characters)
        if (lineCount < 30 || charCount < 500) {
          hasQualityIssues = true
          qualityIssues.push(`${file.path} is too short (${lineCount} lines, ${charCount} chars)`)
        }

        // Check for placeholder content
        const lowerContent = file.content.toLowerCase()
        const hasPlaceholders = lowerContent.includes('todo:') ||
                               lowerContent.includes('implementation goes here') ||
                               lowerContent.includes('add your') ||
                               lowerContent.includes('implement this') ||
                               lowerContent.includes('placeholder')

        if (hasPlaceholders) {
          hasQualityIssues = true
          qualityIssues.push(`${file.path} contains placeholder text`)
        }
      }

      if (hasQualityIssues && ENABLE_QUALITY_RETRY) {
        console.warn(`Quality issues detected:`, qualityIssues)
        console.warn(`Regenerating with quality requirements...`)

        const qualityPrompt = `${enhancedPrompt}

🚨 CRITICAL QUALITY ISSUES DETECTED - FILES TOO SHORT OR CONTAIN PLACEHOLDERS! 🚨

Previous attempt had these problems:
${qualityIssues.map(issue => `- ${issue}`).join('\n')}

MANDATORY REQUIREMENTS FOR EACH FILE:
1. Component files (.tsx/.ts) MUST be AT LEAST 80-150 lines
2. ZERO placeholders like "TODO", "Implementation goes here", "Add your..."
3. COMPLETE, WORKING code with ALL logic implemented
4. Rich mock data (20-50 items for lists/tables)
5. Multiple hooks (useState, useEffect, custom hooks)
6. Event handlers (onClick, onChange, onSubmit)
7. Conditional rendering and mapping over data
8. Beautiful Tailwind CSS styling on EVERY element

EXAMPLES OF GOOD FILES:
- Dashboard.tsx: 150+ lines with metrics, charts, tables, state management
- DataTable.tsx: 120+ lines with sorting, filtering, pagination logic
- mockData.ts: 200+ lines with complete realistic data arrays

DO NOT submit short files! DO NOT use placeholders! WRITE COMPLETE CODE!
Generate 8-12 production-ready files NOW!`

        const qualityResult = await generateObject({
          model,
          system: this.buildSystemPrompt(request.context),
          prompt: qualityPrompt,
          schema: z.object({
            code: z.string().optional(),
            explanation: z.string(),
            files: z.array(z.object({
              path: z.string(),
              content: z.string(),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(6, 'MUST generate at least 6 complete, substantial files'),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
        })

        console.log(`Regenerated with quality fixes: ${qualityResult.object.files.length} files`)

        // Convert path aliases before returning
        this.convertPathAliases(qualityResult.object.files)

        return qualityResult.object
      }

      // ENFORCE MINIMUM FILE COUNT - Regenerate if AI ignored requirements
      if (result.object.files.length < 6) {
        console.warn(`AI generated only ${result.object.files.length} files, regenerating with stronger prompt...`)

        // Add EXTREMELY forceful requirements
        const forcefulPrompt = `${enhancedPrompt}

⚠️ CRITICAL REQUIREMENTS - DO NOT IGNORE:
You MUST generate AT LEAST 10 FILES. This is NON-NEGOTIABLE.

Required files (generate ALL of these with REAL, EXECUTABLE CODE):
1. App.tsx - Main application component (MUST export default, 100+ lines)
2. components/Dashboard.tsx - Dashboard with metrics and charts (150+ lines)
3. components/Navigation.tsx - Animated navigation bar (80+ lines)
4. components/Sidebar.tsx - Collapsible sidebar (60+ lines)
5. components/MetricCard.tsx - Reusable metric card with animations (50+ lines)
6. components/DataTable.tsx - Sortable data table (100+ lines)
7. components/Chart.tsx - Chart components with Recharts (80+ lines)
8. components/Card.tsx - Reusable card component (40+ lines)
9. utils/mockData.ts - Mock data with 30-50 items (200+ lines)
10. utils/animations.ts - Framer Motion animation variants (40+ lines)
11. package.json - Complete dependencies
12. README.md - Setup and usage instructions

CRITICAL: Generate PRODUCTION-QUALITY, EXECUTABLE CODE with:
- Framer Motion animations (import { motion } from 'framer-motion')
- Recharts charts (import { BarChart, LineChart } from 'recharts')
- Beautiful Tailwind styling (className="...")
- NO placeholders, NO "Implementation here", NO explanatory text
- ONLY raw, working TypeScript/React code that can be executed immediately`

        const retryResult = await generateObject({
          model,
          system: this.buildSystemPrompt(request.context),
          prompt: forcefulPrompt,
          schema: z.object({
            code: z.string().describe('DEPRECATED: Leave empty'),
            explanation: z.string().describe('Brief explanation (2-3 sentences)'),
            files: z.array(z.object({
              path: z.string().describe('File path (e.g., src/App.tsx)'),
              content: z.string().describe('CRITICAL: ONLY raw executable code. NO explanations, NO placeholders like "This is" or "Implementation goes here". Write COMPLETE working code with all imports, exports, logic, and styling. For React: full components with JSX, hooks, handlers. For data: full arrays with 20-50 items. EXECUTABLE CODE ONLY.'),
              type: z.enum(['create', 'modify', 'delete']),
            })).min(2, 'MUST generate at least 2 complete files'),
            dependencies: z.array(z.string()).optional(),
            instructions: z.string().optional(),
          }),
        })

        console.log(`Regenerated with ${retryResult.object.files.length} files`)

        // 🚀 PHASE 3A: SCAFFOLD INTEGRATION for retry - Detect and bundle BEFORE path conversion
        console.log('🎨 [Scaffold Integration] Analyzing retry result for component usage...')

        const retryFilesForDetection = retryResult.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' : 'plaintext'
        }))

        const retryUsedComponents = detectUsedComponents(retryFilesForDetection)

        if (retryUsedComponents.length > 0) {
          console.log(`🎨 [Scaffold Integration] Detected ${retryUsedComponents.length} components in retry:`, retryUsedComponents)

          const retryScaffoldFiles = bundleScaffoldComponents(retryUsedComponents)
          console.log(`🎨 [Scaffold Integration] Bundled ${retryScaffoldFiles.length} scaffold files`)

          for (const scaffoldFile of retryScaffoldFiles) {
            retryResult.object.files.push({
              path: scaffoldFile.path,
              content: scaffoldFile.content,
              type: 'create'
            })
          }

          console.log(`✅ [Scaffold Integration] Total files with scaffold: ${retryResult.object.files.length}`)
        }

        // 🚀 PHASE 3B: Convert path aliases for ALL files (AI + scaffold)
        this.convertPathAliases(retryResult.object.files)

        return retryResult.object
      }

      // 🚀 PHASE 1: Validate files with comprehensive validation
      const validationResult = comprehensiveValidation(
        result.object.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                   f.path.endsWith('.json') ? 'json' : 'text'
        })),
        'default' // Could be enhanced to detect type from prompt
      )

      const report = generateValidationReport(validationResult)
      console.log(report)

      // Log inline Tailwind component usage
      if (validationResult.shadcnCheck.usesShadcn) {
        console.log(`✅ Inline Tailwind components found: ${validationResult.shadcnCheck.componentsFound.join(', ')}`)
      } else {
        console.log(`⚠️  No inline components detected`)
      }

      // 🚀 PHASE 3A: SCAFFOLD INTEGRATION - Bundle shadcn/ui components BEFORE path conversion
      console.log('🎨 [Scaffold Integration] Analyzing generated code for component usage...')

      // Detect components BEFORE path conversion (while @/ imports still exist)
      const generatedFilesForDetection = result.object.files.map(f => ({
        path: f.path,
        content: f.content,
        language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                 f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
      }))

      const usedComponents = detectUsedComponents(generatedFilesForDetection)

      if (usedComponents.length > 0) {
        console.log(`🎨 [Scaffold Integration] Detected ${usedComponents.length} components:`, usedComponents)

        // Bundle the scaffold components
        const scaffoldFiles = bundleScaffoldComponents(usedComponents)
        console.log(`🎨 [Scaffold Integration] Bundled ${scaffoldFiles.length} scaffold files`)

        // Add scaffold files to the result
        for (const scaffoldFile of scaffoldFiles) {
          result.object.files.push({
            path: scaffoldFile.path,
            content: scaffoldFile.content,
            type: 'create'
          })
        }

        console.log(`✅ [Scaffold Integration] Total files with scaffold: ${result.object.files.length}`)
      } else {
        console.log(`⚠️  [Scaffold Integration] No scaffold components detected in generated code`)
        console.log(`   This might mean AI didn't use @/components/ui/* imports`)

        // Fallback: Bundle components based on the prompt pattern
        console.log(`   Falling back to component config: ${componentConfig.config.components.join(', ')}`)
        const fallbackScaffold = bundleScaffoldComponents(componentConfig.config.components)

        if (fallbackScaffold.length > 0) {
          console.log(`🎨 [Scaffold Integration] Bundled ${fallbackScaffold.length} files as fallback`)
          for (const scaffoldFile of fallbackScaffold) {
            result.object.files.push({
              path: scaffoldFile.path,
              content: scaffoldFile.content,
              type: 'create'
            })
          }
          console.log(`✅ [Scaffold Integration] Total files with fallback scaffold: ${result.object.files.length}`)
        }
      }

      // 🚀 PHASE 3B: CONVERT PATH ALIASES - Now convert ALL files (AI + scaffold)
      this.convertPathAliases(result.object.files)

      return result.object
    } catch (error: any) {
      console.error('Error generating code:', error)

      // Check if this is a JSON parsing error (apostrophe/escape issue)
      const isJSONParseError = error?.message?.includes('JSON') ||
                              error?.message?.includes('parse') ||
                              error?.message?.includes('escaped character') ||
                              error?.cause?.message?.includes('JSON')

      if (isJSONParseError && error?.text) {
        console.error('🚨 JSON Parse Error detected - likely apostrophe/escape issue')
        console.error('Error details:', {
          message: error.message,
          cause: error.cause?.message,
          textLength: error.text?.length || 0
        })

        // ONE RETRY with explicit JSON safety instructions
        try {
          console.log('🔄 Retrying with JSON-safe prompt...')

          const jsonSafePrompt = `${enhancedPrompt}

🚨🚨🚨 CRITICAL JSON SAFETY ERROR IN PREVIOUS ATTEMPT! 🚨🚨🚨

Your previous response had a JSON parsing error due to improper string escaping.

MANDATORY RULES FOR THIS ATTEMPT:

1. **DO NOT use apostrophes in single-quoted strings**
   ❌ NEVER: 'Don\\'t have an account?'
   ✅ ALWAYS: "Don't have an account?" (use double quotes for strings with apostrophes)
   ✅ OR: 'Do not have an account?' (rephrase without apostrophes)

2. **Avoid ALL contractions with apostrophes:**
   ❌ don't, can't, won't, shouldn't, wouldn't, it's, that's, user's
   ✅ do not, cannot, will not, should not, would not, it is, that is, user

3. **For possessives and contractions, use alternatives:**
   ❌ "User's profile" → ✅ "User profile" or "Profile of user"
   ❌ "It's loading" → ✅ "Loading" or "It is loading"
   ❌ "Don't have an account?" → ✅ "Do not have an account?" or "No account yet?"

4. **Use template literals for complex strings:**
   ✅ \`Welcome to the application\`
   ✅ \`Click here to continue\`

Generate your JSON response following these rules STRICTLY.
Generate 8-12 complete, production-ready files NOW!`

          const safeResult = await generateObject({
            model,
            system: this.buildSystemPrompt(request.context),
            prompt: jsonSafePrompt,
            schema: z.object({
              code: z.string().optional(),
              explanation: z.string(),
              files: z.array(z.object({
                path: z.string(),
                content: z.string(),
                type: z.enum(['create', 'modify', 'delete']),
              })).min(6, 'MUST generate at least 6 complete, substantial files'),
              dependencies: z.array(z.string()).optional(),
              instructions: z.string().optional(),
            }),
          })

          console.log('✅ JSON-safe retry successful!')

          // 🚀 PHASE 3A: SCAFFOLD INTEGRATION for JSON retry - Detect and bundle BEFORE path conversion
          const jsonRetryFilesForDetection = safeResult.object.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.path.endsWith('.tsx') || f.path.endsWith('.ts') ? 'typescript' :
                     f.path.endsWith('.jsx') || f.path.endsWith('.js') ? 'javascript' : 'plaintext'
          }))

          const jsonRetryUsedComponents = detectUsedComponents(jsonRetryFilesForDetection)
          if (jsonRetryUsedComponents.length > 0) {
            console.log(`🎨 [Scaffold Integration] Detected ${jsonRetryUsedComponents.length} components in JSON retry:`, jsonRetryUsedComponents)

            const jsonRetryScaffoldFiles = bundleScaffoldComponents(jsonRetryUsedComponents)
            console.log(`🎨 [Scaffold Integration] Bundled ${jsonRetryScaffoldFiles.length} scaffold files`)

            for (const scaffoldFile of jsonRetryScaffoldFiles) {
              safeResult.object.files.push({
                path: scaffoldFile.path,
                content: scaffoldFile.content,
                type: 'create'
              })
            }

            console.log(`✅ [Scaffold Integration] Total files with scaffold: ${safeResult.object.files.length}`)
          }

          // 🚀 PHASE 3B: Convert path aliases for ALL files (AI + scaffold)
          this.convertPathAliases(safeResult.object.files)

          return safeResult.object
        } catch (retryError) {
          console.error('❌ JSON-safe retry also failed:', retryError)
          throw new Error('Failed to generate code after JSON safety retry. Please try again.')
        }
      }

      throw new Error('Failed to generate code. Please try again.')
    }
  }

  async chat(request: ChatRequest) {
    try {
      const provider = request.provider || this.defaultProvider
      const model = this.getModelInstance(provider)

      // Track usage
      // await usageService.trackUsage({
      //   userId: request.userId,
      //   type: 'chat',
      //   provider,
      //   promptTokens: request.messages.reduce((acc, msg) => acc + msg.content.length, 0),
      // })

      // Add system message if not present
      const messages = request.messages
      if (messages[0]?.role !== 'system') {
        messages.unshift({
          role: 'system',
          content: this.buildSystemPrompt(request.context),
        })
      }

      const result = await generateText({
        model,
        messages,
      })

      console.log(`AI chat for user ${request.userId}`, {
        provider,
        messagesCount: request.messages.length,
      })

      return {
        message: result.text,
        usage: result.usage,
      }
    } catch (error) {
      console.error('Error in AI chat:', error)
      throw new Error('Failed to process chat message. Please try again.')
    }
  }

  async analyzeCode(request: AnalyzeCodeRequest) {
    try {
      const provider = this.defaultProvider
      const model = this.getModelInstance(provider)

      // Track usage
      // await usageService.trackUsage({
      //   userId: request.userId,
      //   type: 'code_analysis',
      //   provider,
      //   promptTokens: request.code.length,
      // })

      const result = await generateObject({
        model,
        system: `You are a senior code reviewer and software architect. Analyze the provided code for:
- Code quality and best practices
- Performance optimizations
- Security vulnerabilities
- Accessibility improvements
- Bug detection
- Refactoring suggestions`,
        prompt: `Analyze this ${request.language} code:\n\n${request.code}`,
        schema: z.object({
          score: z.number().min(0).max(100).describe('Overall code quality score'),
          issues: z.array(z.object({
            type: z.enum(['error', 'warning', 'suggestion', 'security']),
            severity: z.enum(['high', 'medium', 'low']),
            line: z.number().optional(),
            message: z.string(),
            suggestion: z.string().optional(),
          })).describe('Identified issues and suggestions'),
          strengths: z.array(z.string()).describe('Code strengths and good practices found'),
          improvements: z.array(z.object({
            category: z.string(),
            description: z.string(),
            example: z.string().optional(),
          })).describe('Improvement suggestions'),
          complexity: z.object({
            score: z.number().min(1).max(10),
            description: z.string(),
          }).describe('Code complexity analysis'),
        }),
      })

      console.log(`Analyzed code for user ${request.userId}`, {
        language: request.language,
        codeLength: request.code.length,
        score: result.object.score,
      })

      return result.object
    } catch (error) {
      console.error('Error analyzing code:', error)
      throw new Error('Failed to analyze code. Please try again.')
    }
  }

  async streamGeneration(request: GenerateCodeRequest) {
    try {
      const provider = request.provider || this.defaultProvider
      const model = this.getModelInstance(provider)

      const result = streamText({
        model,
        system: this.buildSystemPrompt(request.context),
        prompt: request.prompt,
      })

      return result
    } catch (error) {
      console.error('Error streaming generation:', error)
      throw new Error('Failed to stream generation. Please try again.')
    }
  }
}

export const aiService = new AIService()
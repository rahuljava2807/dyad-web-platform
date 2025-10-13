/**
 * Suggestion Engine Service
 *
 * Generates, prioritizes, and manages intelligent suggestions based on code context,
 * detected patterns, and namespace knowledge.
 */

import type {
  Suggestion,
  SuggestionType,
  Priority,
  SuggestionCategory,
  CodeContext,
  Pattern,
  Namespace,
  SuggestionAction,
  ActionType,
  Domain,
} from '@/types/assistant'

// ============================================================================
// SUGGESTION GENERATION
// ============================================================================

/**
 * Generate a suggestion based on context, pattern, and namespace
 */
export async function generateSuggestion(
  context: CodeContext,
  pattern: Pattern,
  namespace: Namespace | null
): Promise<Suggestion> {
  const suggestionContent = await generateSuggestionContent(pattern, context, namespace)

  const suggestion: Suggestion = {
    id: `sug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'proactive',
    priority: determinePriority(pattern, context),
    category: determineCategory(pattern),
    title: suggestionContent.title,
    content: suggestionContent.content,
    source: {
      namespace: !!namespace,
      confidence: pattern.confidence,
      documentIds: namespace ? [] : undefined,
    },
    actions: generateActions(pattern, context),
    metadata: {
      tags: generateTags(pattern, context),
      relatedPatterns: [pattern.id],
      domainSpecific: !!namespace,
      codeExamples: suggestionContent.examples,
      references: suggestionContent.references,
    },
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
  }

  return suggestion
}

/**
 * Generate suggestion content based on pattern
 */
async function generateSuggestionContent(
  pattern: Pattern,
  context: CodeContext,
  namespace: Namespace | null
) {
  const contentGenerators: Record<
    string,
    (p: Pattern, c: CodeContext, n: Namespace | null) => SuggestionContent
  > = {
    'form-creation': generateFormSuggestion,
    'api-call': generateApiSuggestion,
    'state-management': generateStateSuggestion,
    'auth-implementation': generateAuthSuggestion,
    'data-handling': generateDataHandlingSuggestion,
    routing: generateRoutingSuggestion,
    performance: generatePerformanceSuggestion,
    security: generateSecuritySuggestion,
  }

  const generator = contentGenerators[pattern.type] || generateDefaultSuggestion

  return generator(pattern, context, namespace)
}

interface SuggestionContent {
  title: string
  content: string
  examples: Array<{ language: string; code: string; description: string }>
  references: Array<{ title: string; url: string; type: 'documentation' | 'article' | 'video' | 'example' }>
}

// ============================================================================
// CONTENT GENERATORS FOR EACH PATTERN TYPE
// ============================================================================

function generateFormSuggestion(pattern: Pattern, context: CodeContext, namespace: Namespace | null): SuggestionContent {
  return {
    title: 'Enhance Form Implementation',
    content: `Your form could benefit from additional validation and accessibility features. Consider adding:

    • Input validation with error messages
    • Accessibility attributes (aria-labels, aria-describedby)
    • Loading states during submission
    • Success/error feedback
    ${namespace ? `\n• ${namespace.domain}-specific validation rules` : ''}`,
    examples: [
      {
        language: 'typescript',
        code: `const [errors, setErrors] = useState<Record<string, string>>({})

const validateForm = (data: FormData) => {
  const newErrors: Record<string, string> = {}

  if (!data.email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)) {
    newErrors.email = 'Please enter a valid email'
  }

  return newErrors
}`,
        description: 'Add form validation with error handling',
      },
    ],
    references: [
      {
        title: 'React Hook Form Documentation',
        url: 'https://react-hook-form.com/',
        type: 'documentation',
      },
    ],
  }
}

function generateApiSuggestion(pattern: Pattern, context: CodeContext, namespace: Namespace | null): SuggestionContent {
  return {
    title: 'Improve API Call Handling',
    content: `Your API call could be more robust with proper error handling and loading states:

    • Add try-catch blocks for error handling
    • Implement loading states
    • Add request cancellation (AbortController)
    • Consider retry logic for failed requests
    • Add request/response logging`,
    examples: [
      {
        language: 'typescript',
        code: `const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const fetchData = async () => {
  const controller = new AbortController()

  try {
    setLoading(true)
    setError(null)

    const response = await fetch('/api/data', {
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }

    const data = await response.json()
    return data
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error')
  } finally {
    setLoading(false)
  }
}`,
        description: 'Add comprehensive error handling and loading states',
      },
    ],
    references: [
      {
        title: 'Fetch API Documentation',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API',
        type: 'documentation',
      },
    ],
  }
}

function generateStateSuggestion(pattern: Pattern, context: CodeContext, namespace: Namespace | null): SuggestionContent {
  return {
    title: 'Optimize State Management',
    content: `Consider optimizing your state management approach:

    • Use useReducer for complex state logic
    • Memoize expensive computations with useMemo
    • Prevent unnecessary re-renders with useCallback
    • Consider Context API for shared state
    • Evaluate state structure for efficiency`,
    examples: [
      {
        language: 'typescript',
        code: `const [state, dispatch] = useReducer(reducer, initialState)

const memoizedValue = useMemo(() => {
  return expensiveComputation(data)
}, [data])

const handleClick = useCallback(() => {
  dispatch({ type: 'INCREMENT' })
}, [])`,
        description: 'Use React hooks for optimized state management',
      },
    ],
    references: [
      {
        title: 'React useReducer Hook',
        url: 'https://react.dev/reference/react/useReducer',
        type: 'documentation',
      },
    ],
  }
}

function generateAuthSuggestion(pattern: Pattern, context: CodeContext, namespace: Namespace | null): SuggestionContent {
  return {
    title: 'Enhance Authentication Security',
    content: `Improve the security of your authentication implementation:

    • Store tokens securely (httpOnly cookies preferred over localStorage)
    • Implement token refresh logic
    • Add request interceptors for auth headers
    • Handle token expiration gracefully
    • Implement logout cleanup`,
    examples: [
      {
        language: 'typescript',
        code: `// Token refresh logic
const refreshToken = async () => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include' // Send httpOnly cookies
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    return await response.json()
  } catch (error) {
    // Redirect to login
    window.location.href = '/login'
  }
}`,
        description: 'Implement secure token refresh mechanism',
      },
    ],
    references: [
      {
        title: 'OAuth 2.0 Best Practices',
        url: 'https://oauth.net/2/',
        type: 'documentation',
      },
    ],
  }
}

function generateDataHandlingSuggestion(pattern: Pattern, context: CodeContext, namespace: Namespace | null): SuggestionContent {
  return {
    title: 'Improve Data Handling',
    content: `Enhance your data handling with these practices:

    • Add type safety with TypeScript interfaces
    • Validate incoming data
    • Handle null/undefined cases
    • Consider immutability patterns
    • Add data transformation utilities`,
    examples: [
      {
        language: 'typescript',
        code: `interface User {
  id: string
  name: string
  email: string
}

// Type-safe data handling
const transformUsers = (rawData: unknown[]): User[] => {
  return rawData
    .filter((item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null
    )
    .filter(item =>
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.email === 'string'
    )
    .map(item => ({
      id: item.id,
      name: item.name,
      email: item.email
    }))
}`,
        description: 'Add type-safe data transformation',
      },
    ],
    references: [],
  }
}

function generateRoutingSuggestion(pattern: Pattern, context: CodeContext, namespace: Namespace | null): SuggestionContent {
  return {
    title: 'Enhance Routing Configuration',
    content: `Improve your routing setup with:

    • Add route guards for protected pages
    • Implement loading states for route transitions
    • Add 404 error handling
    • Consider route-based code splitting
    • Add navigation guards`,
    examples: [
      {
        language: 'typescript',
        code: `// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}`,
        description: 'Add protected route logic',
      },
    ],
    references: [],
  }
}

function generatePerformanceSuggestion(pattern: Pattern, context: CodeContext, namespace: Namespace | null): SuggestionContent {
  return {
    title: 'Performance Optimization Opportunity',
    content: `Potential performance improvements detected:

    • Use React.memo for expensive components
    • Implement virtual scrolling for long lists
    • Add lazy loading for images and components
    • Optimize bundle size with code splitting
    • Consider memoization for expensive calculations`,
    examples: [
      {
        language: 'typescript',
        code: `// Memoize expensive component
const ExpensiveComponent = React.memo(({ data }: Props) => {
  const result = useMemo(() =>
    expensiveCalculation(data),
    [data]
  )

  return <div>{result}</div>
})`,
        description: 'Optimize component rendering',
      },
    ],
    references: [
      {
        title: 'React Performance Optimization',
        url: 'https://react.dev/learn/render-and-commit',
        type: 'documentation',
      },
    ],
  }
}

function generateSecuritySuggestion(pattern: Pattern, context: CodeContext, namespace: Namespace | null): SuggestionContent {
  return {
    title: 'Security Issue Detected',
    content: `Security concerns found in your code:

    • Avoid using eval() - it's a major security risk
    • Sanitize user input before rendering
    • Use Content Security Policy headers
    • Avoid storing sensitive data in localStorage
    • Implement input validation`,
    examples: [
      {
        language: 'typescript',
        code: `// Safe HTML rendering with DOMPurify
import DOMPurify from 'dompurify'

const SafeHTML = ({ html }: { html: string }) => {
  const sanitized = DOMPurify.sanitize(html)

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}`,
        description: 'Sanitize HTML to prevent XSS attacks',
      },
    ],
    references: [
      {
        title: 'OWASP Top 10',
        url: 'https://owasp.org/www-project-top-ten/',
        type: 'documentation',
      },
    ],
  }
}

function generateDefaultSuggestion(pattern: Pattern, context: CodeContext, namespace: Namespace | null): SuggestionContent {
  return {
    title: `${pattern.name} Suggestion`,
    content: pattern.description,
    examples: [],
    references: [],
  }
}

// ============================================================================
// PRIORITY & CATEGORY DETERMINATION
// ============================================================================

/**
 * Determine priority based on pattern and context
 */
function determinePriority(pattern: Pattern, context: CodeContext): Priority {
  // Security and compliance issues are always critical/high priority
  if (pattern.type === 'security') return 'critical'
  if (pattern.type === 'performance' && pattern.confidence > 0.8) return 'high'
  if (pattern.type === 'auth-implementation') return 'high'

  // Base on confidence
  if (pattern.confidence >= 0.9) return 'high'
  if (pattern.confidence >= 0.7) return 'medium'
  return 'low'
}

/**
 * Determine category based on pattern
 */
function determineCategory(pattern: Pattern): SuggestionCategory {
  const categoryMap: Record<string, SuggestionCategory> = {
    security: 'security',
    performance: 'performance',
    'auth-implementation': 'security',
    'form-creation': 'best-practice',
    'api-call': 'best-practice',
    'state-management': 'quality',
    'data-handling': 'quality',
    routing: 'best-practice',
  }

  return categoryMap[pattern.type] || 'insight'
}

// ============================================================================
// ACTION GENERATION
// ============================================================================

/**
 * Generate actions for a suggestion
 */
function generateActions(pattern: Pattern, context: CodeContext): SuggestionAction[] {
  const actions: SuggestionAction[] = []

  // Apply action (context-specific)
  actions.push({
    id: `action_apply_${Date.now()}`,
    label: 'Apply Suggestion',
    type: 'apply-code',
    handler: 'applySuggestion',
    requiresConfirmation: false,
  })

  // Learn more action
  actions.push({
    id: `action_learn_${Date.now()}`,
    label: 'Learn More',
    type: 'learn-more',
    handler: 'showDocumentation',
    requiresConfirmation: false,
  })

  // Dismiss action
  actions.push({
    id: `action_dismiss_${Date.now()}`,
    label: 'Dismiss',
    type: 'dismiss',
    handler: 'dismissSuggestion',
    requiresConfirmation: false,
  })

  return actions
}

// ============================================================================
// TAG GENERATION
// ============================================================================

/**
 * Generate relevant tags for a suggestion
 */
function generateTags(pattern: Pattern, context: CodeContext): string[] {
  const tags: string[] = []

  // Add pattern type as tag
  tags.push(pattern.type)

  // Add language tag
  if (context.language) {
    tags.push(context.language)
  }

  // Add framework-specific tags
  if (context.fullContent.includes('React') || context.fullContent.includes('useState')) {
    tags.push('react')
  }
  if (context.fullContent.includes('Next')) {
    tags.push('nextjs')
  }

  // Add priority-based tags
  const priority = determinePriority(pattern, context)
  if (priority === 'critical' || priority === 'high') {
    tags.push('important')
  }

  return tags
}

// ============================================================================
// SUGGESTION PRIORITIZATION
// ============================================================================

/**
 * Prioritize and sort suggestions
 */
export function prioritizeSuggestions(suggestions: Suggestion[]): Suggestion[] {
  const priorityOrder: Record<Priority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  }

  return [...suggestions].sort((a, b) => {
    // First, sort by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Then by confidence
    const confidenceDiff = b.source.confidence - a.source.confidence

    if (confidenceDiff !== 0) return confidenceDiff

    // Finally by creation time (newest first)
    return b.createdAt - a.createdAt
  })
}

/**
 * Filter suggestions based on context and relevance
 */
export function filterRelevantSuggestions(
  suggestions: Suggestion[],
  context: CodeContext,
  maxSuggestions: number = 10
): Suggestion[] {
  // Remove expired suggestions
  const now = Date.now()
  const validSuggestions = suggestions.filter((s) => !s.expiresAt || s.expiresAt > now)

  // Filter by current file context
  const contextual = validSuggestions.filter((s) => {
    // If suggestion has no specific file context, include it
    if (!s.metadata.relatedPatterns || s.metadata.relatedPatterns.length === 0) {
      return true
    }

    // Check if suggestion is relevant to current context
    return true // Simplified for now
  })

  // Prioritize and limit
  const prioritized = prioritizeSuggestions(contextual)

  return prioritized.slice(0, maxSuggestions)
}

// ============================================================================
// BATCH SUGGESTION GENERATION
// ============================================================================

/**
 * Generate multiple suggestions from patterns
 */
export async function generateSuggestionsFromPatterns(
  patterns: Pattern[],
  context: CodeContext,
  namespace: Namespace | null
): Promise<Suggestion[]> {
  const suggestionPromises = patterns.map((pattern) => generateSuggestion(context, pattern, namespace))

  const suggestions = await Promise.all(suggestionPromises)

  return prioritizeSuggestions(suggestions)
}

/**
 * Context Extractor Utilities
 *
 * Intelligent code analysis and pattern detection for context-aware assistance.
 * These utilities analyze user code to detect patterns, intents, and provide
 * relevant suggestions.
 */

import type {
  Pattern,
  PatternType,
  Intent,
  IntentType,
  UserAction,
  ComplianceCheck,
  Domain,
  CodeContext,
  FunctionInfo,
  ComponentInfo,
  SemanticContext,
  Entity,
  Topic,
} from '@/types/assistant'

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Analyze code and detect common patterns
 */
export function analyzeCodePattern(code: string, file: string): Pattern[] {
  const patterns: Pattern[] = []

  // Detect form creation
  if (detectFormPattern(code)) {
    patterns.push(createPattern('form-creation', code, file, 'Form implementation detected', 0.9))
  }

  // Detect API calls
  if (detectApiCallPattern(code)) {
    patterns.push(createPattern('api-call', code, file, 'API call detected', 0.85))
  }

  // Detect state management
  if (detectStateManagementPattern(code)) {
    patterns.push(createPattern('state-management', code, file, 'State management detected', 0.8))
  }

  // Detect authentication
  if (detectAuthPattern(code)) {
    patterns.push(createPattern('auth-implementation', code, file, 'Authentication code detected', 0.95))
  }

  // Detect data handling
  if (detectDataHandlingPattern(code)) {
    patterns.push(createPattern('data-handling', code, file, 'Data handling detected', 0.75))
  }

  // Detect routing
  if (detectRoutingPattern(code)) {
    patterns.push(createPattern('routing', code, file, 'Routing configuration detected', 0.8))
  }

  // Detect performance issues
  if (detectPerformanceIssues(code)) {
    patterns.push(createPattern('performance', code, file, 'Potential performance issue detected', 0.7))
  }

  // Detect security issues
  if (detectSecurityIssues(code)) {
    patterns.push(createPattern('security', code, file, 'Potential security issue detected', 0.9))
  }

  return patterns
}

/**
 * Create a pattern object
 */
function createPattern(
  type: PatternType,
  code: string,
  file: string,
  description: string,
  confidence: number
): Pattern {
  const lines = code.split('\n')
  return {
    id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    name: type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    description,
    confidence,
    location: {
      file,
      lineStart: 1,
      lineEnd: lines.length,
    },
    suggestedActions: getSuggestedActions(type),
  }
}

/**
 * Get suggested actions for a pattern type
 */
function getSuggestedActions(type: PatternType): string[] {
  const actionMap: Record<PatternType, string[]> = {
    'form-creation': ['Add validation', 'Add error handling', 'Add accessibility attributes'],
    'api-call': ['Add error handling', 'Add loading states', 'Add request cancellation'],
    'data-handling': ['Add type safety', 'Add data validation', 'Add error handling'],
    'auth-implementation': ['Add token refresh', 'Add session management', 'Check security best practices'],
    'state-management': ['Consider state optimization', 'Add memoization', 'Review state structure'],
    routing: ['Add route guards', 'Add loading states', 'Add error pages'],
    styling: ['Add responsive design', 'Check accessibility', 'Optimize CSS'],
    testing: ['Add more test cases', 'Add edge cases', 'Add integration tests'],
    performance: ['Add memoization', 'Optimize re-renders', 'Consider code splitting'],
    security: ['Review security practices', 'Add input sanitization', 'Check for vulnerabilities'],
  }

  return actionMap[type] || []
}

// ============================================================================
// PATTERN DETECTION FUNCTIONS
// ============================================================================

function detectFormPattern(code: string): boolean {
  const formKeywords = ['<form', 'onSubmit', 'handleSubmit', 'useState', '<input', '<textarea', '<select']
  return formKeywords.filter((keyword) => code.includes(keyword)).length >= 3
}

function detectApiCallPattern(code: string): boolean {
  const apiKeywords = ['fetch(', 'axios.', 'api.', 'http.', 'await fetch', 'async function']
  return apiKeywords.some((keyword) => code.includes(keyword))
}

function detectStateManagementPattern(code: string): boolean {
  const stateKeywords = ['useState', 'useReducer', 'useContext', 'createContext', 'Provider']
  return stateKeywords.filter((keyword) => code.includes(keyword)).length >= 2
}

function detectAuthPattern(code: string): boolean {
  const authKeywords = ['login', 'logout', 'authenticate', 'token', 'jwt', 'auth', 'session', 'credentials']
  return authKeywords.filter((keyword) => code.toLowerCase().includes(keyword.toLowerCase())).length >= 3
}

function detectDataHandlingPattern(code: string): boolean {
  const dataKeywords = ['map(', 'filter(', 'reduce(', 'forEach', '.data', 'JSON.parse', 'JSON.stringify']
  return dataKeywords.filter((keyword) => code.includes(keyword)).length >= 2
}

function detectRoutingPattern(code: string): boolean {
  const routingKeywords = ['Route', 'Router', 'useRouter', 'useNavigate', 'Link', 'navigate', 'redirect']
  return routingKeywords.some((keyword) => code.includes(keyword))
}

function detectPerformanceIssues(code: string): boolean {
  // Detect potential performance issues
  const issues = [
    code.includes('useEffect(() => {') && !code.includes('useEffect(() => {'), // Missing dependency array
    (code.match(/map\(/g) || []).length > 5, // Too many map calls
    code.includes('while (true)'), // Infinite loops
    code.includes('.innerHTML'), // Direct DOM manipulation
  ]
  return issues.some(Boolean)
}

function detectSecurityIssues(code: string): boolean {
  // Detect potential security issues
  const issues = [
    code.includes('eval('), // eval usage
    code.includes('dangerouslySetInnerHTML'), // Dangerous HTML injection
    code.includes('localStorage.setItem') && code.includes('password'), // Storing passwords in localStorage
    code.includes('http://') && !code.includes('localhost'), // Insecure HTTP
  ]
  return issues.some(Boolean)
}

// ============================================================================
// INTENT DETECTION
// ============================================================================

/**
 * Detect user intent from their actions
 */
export function detectIntent(action: UserAction): Intent {
  const { type, context } = action

  // Analyze based on action type
  if (type === 'file-open') {
    return {
      type: detectFileOpenIntent(context),
      confidence: 0.7,
      entities: {},
    }
  }

  if (type === 'code-insert' || type === 'file-edit') {
    return {
      type: detectCodeEditIntent(context),
      confidence: 0.75,
      entities: {},
    }
  }

  if (type === 'build' || type === 'test') {
    return {
      type: 'deploy',
      confidence: 0.8,
      entities: {},
    }
  }

  return {
    type: 'create-component',
    confidence: 0.5,
    entities: {},
  }
}

function detectFileOpenIntent(context: CodeContext): IntentType {
  const file = context.currentFile?.toLowerCase() || ''

  if (file.includes('test')) return 'add-tests'
  if (file.includes('component') || file.includes('.tsx') || file.includes('.jsx'))
    return 'create-component'
  if (file.includes('api') || file.includes('service')) return 'add-feature'

  return 'create-component'
}

function detectCodeEditIntent(context: CodeContext): IntentType {
  const code = context.codeSnippet.toLowerCase()

  if (code.includes('fix') || code.includes('bug') || code.includes('error')) return 'fix-bug'
  if (code.includes('refactor') || code.includes('clean')) return 'refactor-code'
  if (code.includes('optimize') || code.includes('performance')) return 'optimize-performance'
  if (code.includes('test') || code.includes('spec')) return 'add-tests'

  return 'add-feature'
}

// ============================================================================
// COMPLIANCE CHECKING
// ============================================================================

/**
 * Identify compliance needs based on domain and code
 */
export function identifyComplianceNeeds(domain: Domain, code: string, file: string): ComplianceCheck[] {
  const checks: ComplianceCheck[] = []

  switch (domain) {
    case 'medical':
      checks.push(...checkHIPAACompliance(code, file))
      break
    case 'legal':
      checks.push(...checkLegalCompliance(code, file))
      break
    case 'finance':
      checks.push(...checkPCIDSSCompliance(code, file))
      break
    default:
      checks.push(...checkGeneralCompliance(code, file))
  }

  return checks
}

function checkHIPAACompliance(code: string, file: string): ComplianceCheck[] {
  const checks: ComplianceCheck[] = []

  // Check for PHI data handling
  if (code.match(/patient|medical|health|diagnosis/i)) {
    if (!code.includes('encrypt') && !code.includes('secure')) {
      checks.push({
        id: `hipaa_${Date.now()}`,
        rule: 'PHI Encryption',
        standard: 'HIPAA',
        severity: 'error',
        description: 'Patient Health Information (PHI) must be encrypted',
        location: { file, line: 1 },
        fix: {
          description: 'Add encryption for sensitive health data',
          code: '// Add encryption: encrypt(data)',
        },
      })
    }
  }

  // Check for audit logging
  if (code.includes('patient') && !code.includes('log') && !code.includes('audit')) {
    checks.push({
      id: `hipaa_audit_${Date.now()}`,
      rule: 'Audit Logging',
      standard: 'HIPAA',
      severity: 'warning',
      description: 'Access to PHI should be logged for audit purposes',
      location: { file, line: 1 },
    })
  }

  return checks
}

function checkLegalCompliance(code: string, file: string): ComplianceCheck[] {
  const checks: ComplianceCheck[] = []

  // Check for document retention policies
  if (code.includes('delete') && code.match(/document|contract|agreement/i)) {
    checks.push({
      id: `legal_retention_${Date.now()}`,
      rule: 'Document Retention',
      standard: 'Legal',
      severity: 'warning',
      description: 'Legal documents may have retention requirements before deletion',
      location: { file, line: 1 },
    })
  }

  return checks
}

function checkPCIDSSCompliance(code: string, file: string): ComplianceCheck[] {
  const checks: ComplianceCheck[] = []

  // Check for credit card data
  if (code.match(/card|credit|cvv|pan/i)) {
    if (!code.includes('encrypt') && !code.includes('tokenize')) {
      checks.push({
        id: `pci_${Date.now()}`,
        rule: 'Card Data Protection',
        standard: 'PCI-DSS',
        severity: 'error',
        description: 'Payment card data must be encrypted or tokenized',
        location: { file, line: 1 },
      })
    }
  }

  return checks
}

function checkGeneralCompliance(code: string, file: string): ComplianceCheck[] {
  const checks: ComplianceCheck[] = []

  // Check for GDPR-related issues
  if (code.match(/email|personal|address|phone/i)) {
    if (code.includes('collect') || code.includes('store')) {
      checks.push({
        id: `gdpr_${Date.now()}`,
        rule: 'Personal Data Collection',
        standard: 'GDPR',
        severity: 'info',
        description: 'Ensure user consent is obtained for personal data collection',
        location: { file, line: 1 },
      })
    }
  }

  return checks
}

// ============================================================================
// SEMANTIC CONTEXT EXTRACTION
// ============================================================================

/**
 * Extract semantic context from code
 */
export function extractSemanticContext(content: string): SemanticContext {
  return {
    keywords: extractKeywords(content),
    entities: extractEntities(content),
    topics: extractTopics(content),
    sentiment: analyzeSentiment(content),
  }
}

function extractKeywords(content: string): string[] {
  // Simple keyword extraction (in production, use NLP library)
  const keywords = new Set<string>()
  const codePatterns = [
    /function\s+(\w+)/g,
    /const\s+(\w+)/g,
    /class\s+(\w+)/g,
    /interface\s+(\w+)/g,
    /type\s+(\w+)/g,
  ]

  codePatterns.forEach((pattern) => {
    let match
    while ((match = pattern.exec(content)) !== null) {
      keywords.add(match[1])
    }
  })

  return Array.from(keywords).slice(0, 10)
}

function extractEntities(content: string): Entity[] {
  const entities: Entity[] = []

  // Extract React components
  const componentMatches = content.matchAll(/(?:function|const)\s+([A-Z]\w+)/g)
  for (const match of componentMatches) {
    entities.push({
      type: 'component',
      value: match[1],
      confidence: 0.9,
    })
  }

  // Extract API endpoints
  const apiMatches = content.matchAll(/['"`]\/api\/([^'"`]+)['"`]/g)
  for (const match of apiMatches) {
    entities.push({
      type: 'endpoint',
      value: match[1],
      confidence: 0.85,
    })
  }

  return entities
}

function extractTopics(content: string): Topic[] {
  const topics: Topic[] = []

  // Detect common topics
  const topicKeywords = {
    authentication: ['login', 'auth', 'token', 'jwt'],
    database: ['query', 'sql', 'database', 'table'],
    api: ['fetch', 'api', 'endpoint', 'request'],
    ui: ['component', 'render', 'style', 'ui'],
    testing: ['test', 'spec', 'expect', 'describe'],
  }

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    const matches = keywords.filter((keyword) => content.toLowerCase().includes(keyword)).length
    if (matches > 0) {
      topics.push({
        name: topic,
        relevance: matches / keywords.length,
      })
    }
  })

  return topics.sort((a, b) => b.relevance - a.relevance)
}

function analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
  // Simple sentiment analysis based on comments
  const positiveWords = ['fix', 'improve', 'enhance', 'optimize', 'add']
  const negativeWords = ['bug', 'error', 'fail', 'broken', 'issue']

  const lowerContent = content.toLowerCase()
  const positiveCount = positiveWords.filter((word) => lowerContent.includes(word)).length
  const negativeCount = negativeWords.filter((word) => lowerContent.includes(word)).length

  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

// ============================================================================
// CODE STRUCTURE ANALYSIS
// ============================================================================

/**
 * Extract function information from code
 */
export function extractFunctions(code: string): FunctionInfo[] {
  const functions: FunctionInfo[] = []
  const lines = code.split('\n')

  // Match function declarations
  const functionPattern = /(?:function|const|let|var)\s+(\w+)\s*=?\s*(?:async\s*)?\(([^)]*)\)/g

  let match
  while ((match = functionPattern.exec(code)) !== null) {
    const name = match[1]
    const params = match[2].split(',').map((p) => p.trim()).filter(Boolean)

    functions.push({
      name,
      parameters: params,
      lineStart: code.substring(0, match.index).split('\n').length,
      lineEnd: code.substring(0, match.index).split('\n').length + 10, // Estimate
    })
  }

  return functions
}

/**
 * Extract React component information
 */
export function extractComponents(code: string): ComponentInfo[] {
  const components: ComponentInfo[] = []

  // Match function components
  const functionComponentPattern = /(?:export\s+)?(?:function|const)\s+([A-Z]\w+)\s*=?\s*\(([^)]*)\)/g

  let match
  while ((match = functionComponentPattern.exec(code)) !== null) {
    const name = match[1]
    const propsString = match[2]
    const props = propsString ? propsString.split(',').map((p) => p.trim()) : []

    components.push({
      name,
      type: 'functional',
      lineStart: code.substring(0, match.index).split('\n').length,
      lineEnd: code.substring(0, match.index).split('\n').length + 20, // Estimate
      props,
    })
  }

  return components
}

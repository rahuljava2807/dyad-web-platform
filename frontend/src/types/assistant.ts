/**
 * Yavi Assistant Widget - Comprehensive Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the Yavi Assistant system.
 * The assistant provides context-aware, domain-specific AI assistance integrated with
 * Yavi.ai namespace knowledge system.
 */

// ============================================================================
// CONNECTION & NAMESPACE TYPES
// ============================================================================

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'reconnecting'

export interface Connection {
  status: ConnectionStatus
  namespaceId: string | null
  lastSync: number
  error?: string
  retryCount?: number
}

export interface Namespace {
  id: string
  name: string
  domain: Domain
  description: string
  documentCount: number
  lastUpdated: number
  isActive: boolean
  metadata?: Record<string, unknown>
}

export type Domain =
  | 'medical'
  | 'legal'
  | 'engineering'
  | 'architecture'
  | 'finance'
  | 'education'
  | 'general'

// ============================================================================
// CONTEXT & PATTERN TYPES
// ============================================================================

export interface CodeContext {
  projectId: string
  currentFile: string | null
  filePath: string | null
  language: string | null
  cursorPosition: CursorPosition | null
  selectedText: string | null
  codeSnippet: string
  fullContent: string
  imports: string[]
  functions: FunctionInfo[]
  components: ComponentInfo[]
}

export interface CursorPosition {
  line: number
  column: number
  offset: number
}

export interface FunctionInfo {
  name: string
  lineStart: number
  lineEnd: number
  parameters: string[]
  returnType?: string
}

export interface ComponentInfo {
  name: string
  type: 'functional' | 'class'
  lineStart: number
  lineEnd: number
  props?: string[]
}

export interface Pattern {
  id: string
  type: PatternType
  name: string
  description: string
  confidence: number
  location: {
    file: string
    lineStart: number
    lineEnd: number
  }
  suggestedActions: string[]
}

export type PatternType =
  | 'form-creation'
  | 'api-call'
  | 'data-handling'
  | 'auth-implementation'
  | 'state-management'
  | 'routing'
  | 'styling'
  | 'testing'
  | 'performance'
  | 'security'

export interface UserAction {
  type: UserActionType
  timestamp: number
  context: CodeContext
  metadata?: Record<string, unknown>
}

export type UserActionType =
  | 'file-open'
  | 'file-edit'
  | 'file-save'
  | 'code-insert'
  | 'code-delete'
  | 'code-select'
  | 'cursor-move'
  | 'search'
  | 'build'
  | 'test'

export interface Intent {
  type: IntentType
  confidence: number
  entities: Record<string, unknown>
}

export type IntentType =
  | 'create-component'
  | 'fix-bug'
  | 'refactor-code'
  | 'add-feature'
  | 'optimize-performance'
  | 'add-tests'
  | 'update-dependencies'
  | 'deploy'

// ============================================================================
// SUGGESTION TYPES
// ============================================================================

export interface Suggestion {
  id: string
  type: SuggestionType
  priority: Priority
  category: SuggestionCategory
  title: string
  content: string
  source: SuggestionSource
  actions: SuggestionAction[]
  metadata: SuggestionMetadata
  createdAt: number
  expiresAt?: number
  dismissed?: boolean
  applied?: boolean
}

export type SuggestionType = 'proactive' | 'reactive'

export type Priority = 'critical' | 'high' | 'medium' | 'low'

export type SuggestionCategory =
  | 'compliance'
  | 'best-practice'
  | 'performance'
  | 'security'
  | 'quality'
  | 'insight'
  | 'warning'
  | 'tip'

export interface SuggestionSource {
  namespace: boolean
  documentIds?: string[]
  confidence: number
  similarityScore?: number
}

export interface SuggestionAction {
  id: string
  label: string
  type: ActionType
  handler: string // Function name or action identifier
  payload?: unknown
  requiresConfirmation?: boolean
}

export type ActionType =
  | 'apply-code'
  | 'open-file'
  | 'show-documentation'
  | 'run-command'
  | 'dismiss'
  | 'learn-more'
  | 'undo'

export interface SuggestionMetadata {
  tags: string[]
  relatedPatterns: string[]
  domainSpecific: boolean
  codeExamples?: CodeExample[]
  references?: Reference[]
}

export interface CodeExample {
  language: string
  code: string
  description: string
}

export interface Reference {
  title: string
  url: string
  type: 'documentation' | 'article' | 'video' | 'example'
}

// ============================================================================
// COMPLIANCE & QUALITY TYPES
// ============================================================================

export interface ComplianceCheck {
  id: string
  rule: string
  standard: string // e.g., "HIPAA", "GDPR", "PCI-DSS"
  severity: 'error' | 'warning' | 'info'
  description: string
  location: {
    file: string
    line: number
  }
  fix?: {
    description: string
    code: string
  }
}

export interface QualityMetric {
  name: string
  value: number
  threshold: number
  status: 'pass' | 'warning' | 'fail'
  description: string
}

// ============================================================================
// INSIGHT & KNOWLEDGE TYPES
// ============================================================================

export interface Insight {
  id: string
  type: InsightType
  title: string
  description: string
  relevance: number
  documents: DocumentReference[]
  createdAt: number
}

export type InsightType =
  | 'related-knowledge'
  | 'similar-implementation'
  | 'common-pitfall'
  | 'optimization-opportunity'
  | 'dependency-update'

export interface DocumentReference {
  id: string
  title: string
  excerpt: string
  relevanceScore: number
  url?: string
}

export interface KnowledgeGraphNode {
  id: string
  label: string
  type: string
  properties: Record<string, unknown>
}

export interface KnowledgeGraphEdge {
  source: string
  target: string
  relationship: string
}

// ============================================================================
// CONVERSATION & CHAT TYPES
// ============================================================================

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  attachments?: Attachment[]
  inReplyTo?: string
}

export interface Attachment {
  type: 'code' | 'file' | 'image' | 'link'
  content: string
  metadata?: Record<string, unknown>
}

export interface ConversationContext {
  messages: Message[]
  currentTopic?: string
  relatedSuggestions: string[]
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface UIState {
  isOpen: boolean
  isMinimized: boolean
  isExpanded: boolean
  position: Position
  size: Size
  activeTab: TabType
  activePanel?: PanelType
  notificationCount: number
  isDragging: boolean
  isResizing: boolean
}

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export type TabType =
  | 'suggestions'
  | 'insights'
  | 'conversation'
  | 'settings'

export type PanelType =
  | 'context'
  | 'suggestions'
  | 'insights'
  | 'chat'
  | 'history'

// ============================================================================
// ANALYTICS & FEEDBACK TYPES
// ============================================================================

export interface Analytics {
  interactionCount: number
  suggestionAcceptanceRate: number
  suggestionDismissalRate: number
  averageResponseTime: number
  lastInteraction: number
  sessionDuration: number
  totalSuggestionsShown: number
  totalSuggestionsApplied: number
  totalSuggestionsDismissed: number
}

export interface Feedback {
  suggestionId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  helpful: boolean
  timestamp: number
}

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================

export interface WebSocketEvent {
  event: string
  payload: unknown
  timestamp: number
  id?: string
}

// Client → Server Events
export interface ContextUpdateEvent extends WebSocketEvent {
  event: 'context:update'
  payload: {
    projectId: string
    namespaceId: string
    currentFile: string | null
    cursorPosition: CursorPosition | null
    codeContext: string
    userAction: UserActionType
    timestamp: number
  }
}

export interface SuggestionFeedbackEvent extends WebSocketEvent {
  event: 'suggestion:feedback'
  payload: {
    suggestionId: string
    action: 'applied' | 'dismissed' | 'rated'
    feedback?: Feedback
  }
}

export interface QueryEvent extends WebSocketEvent {
  event: 'query:send'
  payload: {
    query: string
    context: CodeContext
    conversationId?: string
  }
}

// Server → Client Events
export interface SuggestionNewEvent extends WebSocketEvent {
  event: 'suggestion:new'
  payload: Suggestion
}

export interface SuggestionUpdateEvent extends WebSocketEvent {
  event: 'suggestion:update'
  payload: {
    suggestionId: string
    updates: Partial<Suggestion>
  }
}

export interface InsightNewEvent extends WebSocketEvent {
  event: 'insight:new'
  payload: Insight
}

export interface QueryResponseEvent extends WebSocketEvent {
  event: 'query:response'
  payload: {
    conversationId: string
    message: Message
    relatedSuggestions?: Suggestion[]
  }
}

export interface ConnectionStatusEvent extends WebSocketEvent {
  event: 'connection:status'
  payload: {
    status: ConnectionStatus
    message?: string
  }
}

// ============================================================================
// ASSISTANT STATE (GLOBAL)
// ============================================================================

export interface AssistantState {
  // Connection
  connection: Connection

  // Context
  context: CodeContext
  domain: Domain
  detectedPatterns: Pattern[]

  // Suggestions
  suggestions: {
    active: Suggestion[]
    dismissed: string[]
    applied: string[]
    queue: Suggestion[]
  }

  // Insights
  insights: Insight[]

  // Conversation
  conversation: ConversationContext

  // UI
  ui: UIState

  // Analytics
  analytics: Analytics

  // Namespace
  namespace: Namespace | null
}

// ============================================================================
// ACTION TYPES FOR STATE MANAGEMENT
// ============================================================================

export type AssistantAction =
  | { type: 'CONNECTION_STATUS_CHANGED'; payload: Connection }
  | { type: 'NAMESPACE_SELECTED'; payload: Namespace }
  | { type: 'CONTEXT_UPDATED'; payload: CodeContext }
  | { type: 'PATTERN_DETECTED'; payload: Pattern }
  | { type: 'SUGGESTION_RECEIVED'; payload: Suggestion }
  | { type: 'SUGGESTION_APPLIED'; payload: string }
  | { type: 'SUGGESTION_DISMISSED'; payload: string }
  | { type: 'INSIGHT_RECEIVED'; payload: Insight }
  | { type: 'MESSAGE_SENT'; payload: Message }
  | { type: 'MESSAGE_RECEIVED'; payload: Message }
  | { type: 'UI_STATE_CHANGED'; payload: Partial<UIState> }
  | { type: 'TOGGLE_MINIMIZED' }
  | { type: 'TOGGLE_OPEN' }
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'UPDATE_POSITION'; payload: Position }
  | { type: 'UPDATE_SIZE'; payload: Size }
  | { type: 'ANALYTICS_UPDATED'; payload: Partial<Analytics> }
  | { type: 'RESET_STATE' }

// ============================================================================
// CONTEXT EXTRACTION & ANALYSIS
// ============================================================================

export interface ContextExtractor {
  analyzeCodePattern: (code: string) => Pattern[]
  detectIntent: (action: UserAction) => Intent
  identifyComplianceNeeds: (domain: Domain, code: string) => ComplianceCheck[]
  extractSemanticContext: (content: string) => SemanticContext
}

export interface SemanticContext {
  keywords: string[]
  entities: Entity[]
  topics: Topic[]
  sentiment?: 'positive' | 'neutral' | 'negative'
}

export interface Entity {
  type: string
  value: string
  confidence: number
}

export interface Topic {
  name: string
  relevance: number
}

// ============================================================================
// SUGGESTION ENGINE
// ============================================================================

export interface SuggestionTrigger {
  type: SuggestionType
  condition: (context: CodeContext) => boolean
  debounce: number
  maxFrequency: number
}

export interface SuggestionGenerator {
  generateSuggestion: (
    context: CodeContext,
    pattern: Pattern,
    namespace: Namespace
  ) => Promise<Suggestion>
  prioritizeSuggestions: (suggestions: Suggestion[]) => Suggestion[]
  filterRelevantSuggestions: (
    suggestions: Suggestion[],
    context: CodeContext
  ) => Suggestion[]
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

export interface NamespaceQueryRequest {
  namespaceId: string
  query: string
  context?: CodeContext
  filters?: Record<string, unknown>
  limit?: number
}

export interface NamespaceQueryResponse {
  results: DocumentReference[]
  suggestions: Suggestion[]
  insights: Insight[]
  totalResults: number
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface AssistantConfig {
  enableProactiveSuggestions: boolean
  suggestionFrequency: 'high' | 'medium' | 'low'
  enableNotifications: boolean
  enableSounds: boolean
  theme: 'light' | 'dark' | 'auto'
  defaultPosition: Position
  defaultSize: Size
  maxSuggestions: number
  suggestionExpiryMinutes: number
  enableAnalytics: boolean
}

// ============================================================================
// SETTINGS
// ============================================================================

export interface Settings {
  general: {
    enabled: boolean
    autoStart: boolean
    minimizeOnStartup: boolean
  }
  suggestions: {
    enableProactive: boolean
    frequency: 'high' | 'medium' | 'low'
    categories: SuggestionCategory[]
  }
  namespace: {
    defaultNamespaceId?: string
    autoConnect: boolean
    syncFrequency: number
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    enableAnimations: boolean
  }
  privacy: {
    sendAnalytics: boolean
    sendTelemetry: boolean
    cacheQueries: boolean
  }
}

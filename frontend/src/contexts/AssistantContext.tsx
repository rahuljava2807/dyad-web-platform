/**
 * Yavi Assistant Context
 *
 * Global state management for the Yavi Assistant widget using React Context API
 * and useReducer for predictable state updates.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react'
import type {
  AssistantState,
  AssistantAction,
  Connection,
  CodeContext,
  Suggestion,
  Insight,
  Message,
  UIState,
  Pattern,
  Namespace,
  TabType,
  Position,
  Size,
  Analytics,
} from '@/types/assistant'

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialUIState: UIState = {
  isOpen: false,
  isMinimized: true,
  isExpanded: false,
  position: {
    x: typeof window !== 'undefined' ? window.innerWidth - 400 : 100,
    y: typeof window !== 'undefined' ? window.innerHeight - 100 : 100
  },
  size: { width: 380, height: 600 },
  activeTab: 'suggestions',
  notificationCount: 0,
  isDragging: false,
  isResizing: false,
}

const initialConnection: Connection = {
  status: 'disconnected',
  namespaceId: null,
  lastSync: 0,
}

const initialCodeContext: CodeContext = {
  projectId: '',
  currentFile: null,
  filePath: null,
  language: null,
  cursorPosition: null,
  selectedText: null,
  codeSnippet: '',
  fullContent: '',
  imports: [],
  functions: [],
  components: [],
}

const initialAnalytics: Analytics = {
  interactionCount: 0,
  suggestionAcceptanceRate: 0,
  suggestionDismissalRate: 0,
  averageResponseTime: 0,
  lastInteraction: 0,
  sessionDuration: 0,
  totalSuggestionsShown: 0,
  totalSuggestionsApplied: 0,
  totalSuggestionsDismissed: 0,
}

const initialState: AssistantState = {
  connection: initialConnection,
  context: initialCodeContext,
  domain: 'general',
  detectedPatterns: [],
  suggestions: {
    active: [],
    dismissed: [],
    applied: [],
    queue: [],
  },
  insights: [],
  conversation: {
    messages: [],
    relatedSuggestions: [],
  },
  ui: initialUIState,
  analytics: initialAnalytics,
  namespace: null,
}

// ============================================================================
// REDUCER
// ============================================================================

function assistantReducer(state: AssistantState, action: AssistantAction): AssistantState {
  switch (action.type) {
    case 'CONNECTION_STATUS_CHANGED':
      return {
        ...state,
        connection: action.payload,
      }

    case 'NAMESPACE_SELECTED':
      return {
        ...state,
        namespace: action.payload,
        connection: {
          ...state.connection,
          namespaceId: action.payload.id,
        },
        domain: action.payload.domain,
      }

    case 'CONTEXT_UPDATED':
      return {
        ...state,
        context: action.payload,
      }

    case 'PATTERN_DETECTED':
      return {
        ...state,
        detectedPatterns: [...state.detectedPatterns, action.payload],
      }

    case 'SUGGESTION_RECEIVED': {
      const newSuggestion = action.payload
      const existingIndex = state.suggestions.active.findIndex((s) => s.id === newSuggestion.id)

      // Update existing or add new
      const active =
        existingIndex >= 0
          ? state.suggestions.active.map((s, i) => (i === existingIndex ? newSuggestion : s))
          : [...state.suggestions.active, newSuggestion]

      // Increment notification count if widget is minimized
      const notificationCount = state.ui.isMinimized
        ? state.ui.notificationCount + 1
        : state.ui.notificationCount

      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          active,
        },
        ui: {
          ...state.ui,
          notificationCount,
        },
        analytics: {
          ...state.analytics,
          totalSuggestionsShown: state.analytics.totalSuggestionsShown + 1,
        },
      }
    }

    case 'SUGGESTION_APPLIED': {
      const suggestionId = action.payload
      const suggestion = state.suggestions.active.find((s) => s.id === suggestionId)

      if (!suggestion) return state

      const active = state.suggestions.active.filter((s) => s.id !== suggestionId)
      const applied = [...state.suggestions.applied, suggestionId]

      const totalApplied = state.analytics.totalSuggestionsApplied + 1
      const acceptanceRate =
        state.analytics.totalSuggestionsShown > 0
          ? (totalApplied / state.analytics.totalSuggestionsShown) * 100
          : 0

      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          active,
          applied,
        },
        analytics: {
          ...state.analytics,
          totalSuggestionsApplied: totalApplied,
          suggestionAcceptanceRate: acceptanceRate,
          interactionCount: state.analytics.interactionCount + 1,
          lastInteraction: Date.now(),
        },
      }
    }

    case 'SUGGESTION_DISMISSED': {
      const suggestionId = action.payload
      const active = state.suggestions.active.filter((s) => s.id !== suggestionId)
      const dismissed = [...state.suggestions.dismissed, suggestionId]

      const totalDismissed = state.analytics.totalSuggestionsDismissed + 1
      const dismissalRate =
        state.analytics.totalSuggestionsShown > 0
          ? (totalDismissed / state.analytics.totalSuggestionsShown) * 100
          : 0

      return {
        ...state,
        suggestions: {
          ...state.suggestions,
          active,
          dismissed,
        },
        analytics: {
          ...state.analytics,
          totalSuggestionsDismissed: totalDismissed,
          suggestionDismissalRate: dismissalRate,
          interactionCount: state.analytics.interactionCount + 1,
          lastInteraction: Date.now(),
        },
      }
    }

    case 'INSIGHT_RECEIVED':
      return {
        ...state,
        insights: [...state.insights, action.payload],
      }

    case 'MESSAGE_SENT':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: [...state.conversation.messages, action.payload],
        },
        analytics: {
          ...state.analytics,
          interactionCount: state.analytics.interactionCount + 1,
          lastInteraction: Date.now(),
        },
      }

    case 'MESSAGE_RECEIVED':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: [...state.conversation.messages, action.payload],
        },
      }

    case 'UI_STATE_CHANGED':
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload,
        },
      }

    case 'TOGGLE_MINIMIZED': {
      const isMinimized = !state.ui.isMinimized
      return {
        ...state,
        ui: {
          ...state.ui,
          isMinimized,
          isExpanded: isMinimized ? false : state.ui.isExpanded,
          // Reset notification count when opening
          notificationCount: isMinimized ? state.ui.notificationCount : 0,
        },
      }
    }

    case 'TOGGLE_OPEN':
      return {
        ...state,
        ui: {
          ...state.ui,
          isOpen: !state.ui.isOpen,
          isMinimized: !state.ui.isOpen ? true : state.ui.isMinimized,
          notificationCount: !state.ui.isOpen ? 0 : state.ui.notificationCount,
        },
      }

    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeTab: action.payload,
        },
      }

    case 'UPDATE_POSITION':
      return {
        ...state,
        ui: {
          ...state.ui,
          position: action.payload,
        },
      }

    case 'UPDATE_SIZE':
      return {
        ...state,
        ui: {
          ...state.ui,
          size: action.payload,
        },
      }

    case 'ANALYTICS_UPDATED':
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.payload,
        },
      }

    case 'RESET_STATE':
      return initialState

    default:
      return state
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface AssistantContextValue {
  state: AssistantState
  dispatch: React.Dispatch<AssistantAction>
  // Convenience methods
  toggleMinimized: () => void
  toggleOpen: () => void
  setActiveTab: (tab: TabType) => void
  updatePosition: (position: Position) => void
  updateSize: (size: Size) => void
  applySuggestion: (suggestionId: string) => void
  dismissSuggestion: (suggestionId: string) => void
  sendMessage: (content: string) => void
  updateContext: (context: Partial<CodeContext>) => void
  selectNamespace: (namespace: Namespace) => void
}

const AssistantContext = createContext<AssistantContextValue | undefined>(undefined)

// ============================================================================
// PROVIDER
// ============================================================================

interface AssistantProviderProps {
  children: ReactNode
  projectId?: string
}

export function AssistantProvider({ children, projectId }: AssistantProviderProps) {
  const [state, dispatch] = useReducer(assistantReducer, {
    ...initialState,
    context: {
      ...initialCodeContext,
      projectId: projectId || '',
    },
  })

  // Convenience methods
  const toggleMinimized = useCallback(() => {
    dispatch({ type: 'TOGGLE_MINIMIZED' })
  }, [])

  const toggleOpen = useCallback(() => {
    dispatch({ type: 'TOGGLE_OPEN' })
  }, [])

  const setActiveTab = useCallback((tab: TabType) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })
  }, [])

  const updatePosition = useCallback((position: Position) => {
    dispatch({ type: 'UPDATE_POSITION', payload: position })
  }, [])

  const updateSize = useCallback((size: Size) => {
    dispatch({ type: 'UPDATE_SIZE', payload: size })
  }, [])

  const applySuggestion = useCallback((suggestionId: string) => {
    dispatch({ type: 'SUGGESTION_APPLIED', payload: suggestionId })
  }, [])

  const dismissSuggestion = useCallback((suggestionId: string) => {
    dispatch({ type: 'SUGGESTION_DISMISSED', payload: suggestionId })
  }, [])

  const sendMessage = useCallback(
    (content: string) => {
      const message: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content,
        timestamp: Date.now(),
      }
      dispatch({ type: 'MESSAGE_SENT', payload: message })
    },
    []
  )

  const updateContext = useCallback(
    (contextUpdate: Partial<CodeContext>) => {
      dispatch({
        type: 'CONTEXT_UPDATED',
        payload: {
          ...state.context,
          ...contextUpdate,
        },
      })
    },
    [state.context]
  )

  const selectNamespace = useCallback((namespace: Namespace) => {
    dispatch({ type: 'NAMESPACE_SELECTED', payload: namespace })
  }, [])

  // Persist UI state to localStorage
  useEffect(() => {
    const uiState = {
      position: state.ui.position,
      size: state.ui.size,
      activeTab: state.ui.activeTab,
    }
    localStorage.setItem('yavi-assistant-ui', JSON.stringify(uiState))
  }, [state.ui.position, state.ui.size, state.ui.activeTab])

  // Load UI state from localStorage on mount
  useEffect(() => {
    const savedUI = localStorage.getItem('yavi-assistant-ui')
    if (savedUI) {
      try {
        const parsed = JSON.parse(savedUI)
        dispatch({
          type: 'UI_STATE_CHANGED',
          payload: parsed,
        })
      } catch (error) {
        console.error('Failed to parse saved UI state:', error)
      }
    }
  }, [])

  // Track session duration
  useEffect(() => {
    const startTime = Date.now()

    return () => {
      const duration = Date.now() - startTime
      dispatch({
        type: 'ANALYTICS_UPDATED',
        payload: {
          sessionDuration: state.analytics.sessionDuration + duration,
        },
      })
    }
  }, [state.analytics.sessionDuration])

  const value: AssistantContextValue = {
    state,
    dispatch,
    toggleMinimized,
    toggleOpen,
    setActiveTab,
    updatePosition,
    updateSize,
    applySuggestion,
    dismissSuggestion,
    sendMessage,
    updateContext,
    selectNamespace,
  }

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

// ============================================================================
// HOOK
// ============================================================================

export function useAssistant() {
  const context = useContext(AssistantContext)
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider')
  }
  return context
}

// ============================================================================
// SELECTORS (Custom hooks for derived state)
// ============================================================================

export function useAssistantConnection() {
  const { state } = useAssistant()
  return state.connection
}

export function useAssistantSuggestions() {
  const { state } = useAssistant()
  return state.suggestions.active
}

export function useAssistantInsights() {
  const { state } = useAssistant()
  return state.insights
}

export function useAssistantConversation() {
  const { state } = useAssistant()
  return state.conversation
}

export function useAssistantUI() {
  const { state } = useAssistant()
  return state.ui
}

export function useAssistantAnalytics() {
  const { state } = useAssistant()
  return state.analytics
}

export function useAssistantContext() {
  const { state } = useAssistant()
  return state.context
}

export function useAssistantNamespace() {
  const { state } = useAssistant()
  return state.namespace
}

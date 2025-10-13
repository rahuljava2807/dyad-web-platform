/**
 * WebSocket Service
 *
 * Handles real-time communication between the Yavi Assistant widget
 * and the backend namespace system.
 */

import type {
  WebSocketEvent,
  ContextUpdateEvent,
  SuggestionFeedbackEvent,
  QueryEvent,
  SuggestionNewEvent,
  SuggestionUpdateEvent,
  InsightNewEvent,
  QueryResponseEvent,
  ConnectionStatusEvent,
  CodeContext,
  UserActionType,
  CursorPosition,
  Feedback,
} from '@/types/assistant'

type EventHandler = (event: WebSocketEvent) => void

interface WebSocketConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
}

const DEFAULT_CONFIG: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5001',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private eventHandlers: Map<string, Set<EventHandler>> = new Map()
  private isConnecting = false
  private isClosed = false

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // ========================================================================
  // CONNECTION MANAGEMENT
  // ========================================================================

  /**
   * Connect to the WebSocket server
   */
  public connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'))
        return
      }

      this.isConnecting = true
      this.isClosed = false

      const url = token ? `${this.config.url}?token=${token}` : this.config.url

      try {
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.emitConnectionStatus('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error)
          this.isConnecting = false
          this.emitConnectionStatus('error', 'Connection error occurred')
        }

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Closed:', event.code, event.reason)
          this.isConnecting = false
          this.stopHeartbeat()

          if (!this.isClosed) {
            this.emitConnectionStatus('disconnected')
            this.attemptReconnect()
          }
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.isClosed = true
    this.stopHeartbeat()

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.emitConnectionStatus('disconnected')
  }

  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(): void {
    if (this.isClosed || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached')
      this.emitConnectionStatus('error', 'Failed to reconnect')
      return
    }

    this.reconnectAttempts++
    console.log(`[WebSocket] Reconnecting... (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`)

    this.emitConnectionStatus('reconnecting')

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnect failed:', error)
      })
    }, this.config.reconnectInterval)
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // ========================================================================
  // HEARTBEAT / PING-PONG
  // ========================================================================

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', {})
      }
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // ========================================================================
  // MESSAGE HANDLING
  // ========================================================================

  private handleMessage(data: string): void {
    try {
      const event: WebSocketEvent = JSON.parse(data)

      // Handle pong response
      if (event.event === 'pong') {
        return
      }

      console.log('[WebSocket] Received:', event.event)
      this.emit(event.event, event)
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error)
    }
  }

  /**
   * Send a message to the server
   */
  private send(event: string, payload: unknown): void {
    if (!this.isConnected()) {
      console.error('[WebSocket] Cannot send message - not connected')
      return
    }

    const message: WebSocketEvent = {
      event,
      payload,
      timestamp: Date.now(),
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    this.ws?.send(JSON.stringify(message))
  }

  // ========================================================================
  // EVENT EMITTER PATTERN
  // ========================================================================

  /**
   * Subscribe to an event
   */
  public on(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }

    this.eventHandlers.get(event)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.off(event, handler)
    }
  }

  /**
   * Unsubscribe from an event
   */
  public off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  /**
   * Emit an event to all subscribers
   */
  private emit(event: string, data: WebSocketEvent): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  /**
   * Emit connection status change
   */
  private emitConnectionStatus(status: string, message?: string): void {
    const event: ConnectionStatusEvent = {
      event: 'connection:status',
      payload: { status: status as any, message },
      timestamp: Date.now(),
    }
    this.emit('connection:status', event)
  }

  // ========================================================================
  // PUBLIC API METHODS
  // ========================================================================

  /**
   * Send context update to server
   */
  public sendContextUpdate(params: {
    projectId: string
    namespaceId: string
    currentFile: string | null
    cursorPosition: CursorPosition | null
    codeContext: string
    userAction: UserActionType
  }): void {
    const event: Omit<ContextUpdateEvent, 'timestamp'> = {
      event: 'context:update',
      payload: {
        ...params,
        timestamp: Date.now(),
      },
    }

    this.send('context:update', event.payload)
  }

  /**
   * Send suggestion feedback
   */
  public sendSuggestionFeedback(params: {
    suggestionId: string
    action: 'applied' | 'dismissed' | 'rated'
    feedback?: Feedback
  }): void {
    const event: Omit<SuggestionFeedbackEvent, 'timestamp'> = {
      event: 'suggestion:feedback',
      payload: params,
    }

    this.send('suggestion:feedback', event.payload)
  }

  /**
   * Send a query to the namespace
   */
  public sendQuery(params: {
    query: string
    context: CodeContext
    conversationId?: string
  }): void {
    const event: Omit<QueryEvent, 'timestamp'> = {
      event: 'query:send',
      payload: params,
    }

    this.send('query:send', event.payload)
  }

  /**
   * Subscribe to suggestion events
   */
  public onSuggestionNew(handler: (event: SuggestionNewEvent) => void): () => void {
    return this.on('suggestion:new', handler as EventHandler)
  }

  /**
   * Subscribe to suggestion update events
   */
  public onSuggestionUpdate(handler: (event: SuggestionUpdateEvent) => void): () => void {
    return this.on('suggestion:update', handler as EventHandler)
  }

  /**
   * Subscribe to insight events
   */
  public onInsightNew(handler: (event: InsightNewEvent) => void): () => void {
    return this.on('insight:new', handler as EventHandler)
  }

  /**
   * Subscribe to query response events
   */
  public onQueryResponse(handler: (event: QueryResponseEvent) => void): () => void {
    return this.on('query:response', handler as EventHandler)
  }

  /**
   * Subscribe to connection status events
   */
  public onConnectionStatus(handler: (event: ConnectionStatusEvent) => void): () => void {
    return this.on('connection:status', handler as EventHandler)
  }

  /**
   * Get connection statistics
   */
  public getStats() {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      readyState: this.ws?.readyState,
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let wsInstance: WebSocketService | null = null

/**
 * Get the singleton WebSocket service instance
 */
export function getWebSocketService(): WebSocketService {
  if (!wsInstance) {
    wsInstance = new WebSocketService()
  }
  return wsInstance
}

/**
 * Destroy the WebSocket service instance
 */
export function destroyWebSocketService(): void {
  if (wsInstance) {
    wsInstance.disconnect()
    wsInstance = null
  }
}

export default WebSocketService

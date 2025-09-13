import axios from 'axios'
import { logger } from '../utils/logger'

interface YaviDocument {
  id: string
  title: string
  content: string
  metadata: Record<string, any>
  embedding?: number[]
  createdAt: Date
  updatedAt: Date
}

interface YaviSearchResult {
  documents: YaviDocument[]
  totalCount: number
  relevanceScores: number[]
}

interface YaviConnector {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'error'
  lastSync: Date
}

interface YaviWorkflow {
  id: string
  name: string
  description: string
  triggers: string[]
  actions: string[]
  status: 'active' | 'inactive'
}

class YaviService {
  private baseUrl: string
  private apiKey: string
  private axiosInstance: any

  constructor() {
    this.baseUrl = process.env.YAVI_API_URL || 'https://api.yavi.ai'
    this.apiKey = process.env.YAVI_API_KEY || ''

    if (!this.apiKey) {
      logger.warn('YAVI_API_KEY not configured. Yavi.ai integration disabled.')
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use((config: any) => {
      logger.debug(`Yavi API request: ${config.method?.toUpperCase()} ${config.url}`)
      return config
    })

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        logger.error('Yavi API error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        })
        throw error
      }
    )
  }

  /**
   * Check if Yavi.ai integration is available
   */
  isAvailable(): boolean {
    return Boolean(this.apiKey)
  }

  /**
   * Get available data connectors
   */
  async getConnectors(): Promise<YaviConnector[]> {
    if (!this.isAvailable()) {
      return []
    }

    try {
      const response = await this.axiosInstance.get('/connectors')
      return response.data.connectors || []
    } catch (error) {
      logger.error('Error fetching Yavi connectors:', error)
      return []
    }
  }

  /**
   * Search documents using semantic search
   */
  async searchDocuments(query: string, options: {
    limit?: number
    filters?: Record<string, any>
    connectorIds?: string[]
  } = {}): Promise<YaviSearchResult> {
    if (!this.isAvailable()) {
      return { documents: [], totalCount: 0, relevanceScores: [] }
    }

    try {
      const response = await this.axiosInstance.post('/documents/search', {
        query,
        limit: options.limit || 10,
        filters: options.filters,
        connectorIds: options.connectorIds,
      })

      return {
        documents: response.data.documents || [],
        totalCount: response.data.totalCount || 0,
        relevanceScores: response.data.relevanceScores || [],
      }
    } catch (error) {
      logger.error('Error searching Yavi documents:', error)
      return { documents: [], totalCount: 0, relevanceScores: [] }
    }
  }

  /**
   * Get relevant context for a given prompt and project
   */
  async getRelevantContext(prompt: string, projectId: string): Promise<string | null> {
    if (!this.isAvailable()) {
      return null
    }

    try {
      // Search for relevant documents
      const searchResult = await this.searchDocuments(prompt, {
        limit: 5,
        filters: { projectId },
      })

      if (searchResult.documents.length === 0) {
        return null
      }

      // Build context from top relevant documents
      const context = searchResult.documents
        .slice(0, 3) // Use top 3 most relevant
        .map(doc => `${doc.title}:\n${doc.content.slice(0, 500)}...`)
        .join('\n\n---\n\n')

      return context
    } catch (error) {
      logger.error('Error getting relevant context:', error)
      return null
    }
  }

  /**
   * Process a document through Yavi.ai pipeline
   */
  async processDocument(documentUrl: string, options: {
    extractText?: boolean
    generateSummary?: boolean
    extractEntities?: boolean
    classifyDocument?: boolean
  } = {}) {
    if (!this.isAvailable()) {
      throw new Error('Yavi.ai integration not available')
    }

    try {
      const response = await this.axiosInstance.post('/documents/process', {
        url: documentUrl,
        options: {
          extractText: options.extractText ?? true,
          generateSummary: options.generateSummary ?? true,
          extractEntities: options.extractEntities ?? true,
          classifyDocument: options.classifyDocument ?? true,
        },
      })

      return response.data
    } catch (error) {
      logger.error('Error processing document:', error)
      throw new Error('Failed to process document through Yavi.ai')
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: {
    name: string
    description: string
    triggers: string[]
    actions: any[]
  }): Promise<YaviWorkflow> {
    if (!this.isAvailable()) {
      throw new Error('Yavi.ai integration not available')
    }

    try {
      const response = await this.axiosInstance.post('/workflows', workflow)
      return response.data.workflow
    } catch (error) {
      logger.error('Error creating workflow:', error)
      throw new Error('Failed to create workflow')
    }
  }

  /**
   * Get workflows for a project
   */
  async getWorkflows(projectId: string): Promise<YaviWorkflow[]> {
    if (!this.isAvailable()) {
      return []
    }

    try {
      const response = await this.axiosInstance.get(`/workflows?projectId=${projectId}`)
      return response.data.workflows || []
    } catch (error) {
      logger.error('Error fetching workflows:', error)
      return []
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, input: any) {
    if (!this.isAvailable()) {
      throw new Error('Yavi.ai integration not available')
    }

    try {
      const response = await this.axiosInstance.post(`/workflows/${workflowId}/execute`, {
        input,
      })
      return response.data
    } catch (error) {
      logger.error('Error executing workflow:', error)
      throw new Error('Failed to execute workflow')
    }
  }

  /**
   * Get document insights and analytics
   */
  async getDocumentInsights(documentId: string) {
    if (!this.isAvailable()) {
      return null
    }

    try {
      const response = await this.axiosInstance.get(`/documents/${documentId}/insights`)
      return response.data.insights
    } catch (error) {
      logger.error('Error getting document insights:', error)
      return null
    }
  }

  /**
   * Create a knowledge base from project documents
   */
  async createKnowledgeBase(projectId: string, options: {
    name: string
    description?: string
    documentIds?: string[]
    autoUpdate?: boolean
  }) {
    if (!this.isAvailable()) {
      throw new Error('Yavi.ai integration not available')
    }

    try {
      const response = await this.axiosInstance.post('/knowledge-bases', {
        projectId,
        ...options,
      })
      return response.data.knowledgeBase
    } catch (error) {
      logger.error('Error creating knowledge base:', error)
      throw new Error('Failed to create knowledge base')
    }
  }

  /**
   * Query a knowledge base
   */
  async queryKnowledgeBase(knowledgeBaseId: string, query: string, options: {
    limit?: number
    includeContext?: boolean
  } = {}) {
    if (!this.isAvailable()) {
      return null
    }

    try {
      const response = await this.axiosInstance.post(`/knowledge-bases/${knowledgeBaseId}/query`, {
        query,
        limit: options.limit || 5,
        includeContext: options.includeContext ?? true,
      })
      return response.data
    } catch (error) {
      logger.error('Error querying knowledge base:', error)
      return null
    }
  }

  /**
   * Sync data from a specific connector
   */
  async syncConnector(connectorId: string) {
    if (!this.isAvailable()) {
      throw new Error('Yavi.ai integration not available')
    }

    try {
      const response = await this.axiosInstance.post(`/connectors/${connectorId}/sync`)
      return response.data
    } catch (error) {
      logger.error('Error syncing connector:', error)
      throw new Error('Failed to sync connector')
    }
  }

  /**
   * Get usage analytics
   */
  async getUsageAnalytics(timeRange: '7d' | '30d' | '90d' = '30d') {
    if (!this.isAvailable()) {
      return null
    }

    try {
      const response = await this.axiosInstance.get(`/analytics/usage?timeRange=${timeRange}`)
      return response.data.analytics
    } catch (error) {
      logger.error('Error getting usage analytics:', error)
      return null
    }
  }
}

export const yaviService = new YaviService()
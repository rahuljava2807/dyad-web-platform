export interface YaviNamespace {
  id: string;
  name: string;
  industry: string;
  documentCount: number;
  lastUpdated: Date;
}

export interface YaviDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  metadata: Record<string, any>;
  embeddings?: number[];
}

export interface YaviConnector {
  id: string;
  name: string;
  category: string;
  description: string;
  isConfigured: boolean;
}

export interface YaviQueryResult {
  documents: YaviDocument[];
  similarity: number[];
  tokens: number;
}

export class YaviConnectorService {
  private apiEndpoint: string;
  private apiKey: string;

  constructor() {
    this.apiEndpoint = process.env.NEXT_PUBLIC_YAVI_API_ENDPOINT || 'https://api.yavi.ai';
    this.apiKey = process.env.NEXT_PUBLIC_YAVI_API_KEY || '';
  }

  /**
   * Connect to a Yavi namespace
   */
  async connectToNamespace(namespaceId: string): Promise<YaviNamespace> {
    try {
      const response = await fetch(`${this.apiEndpoint}/namespaces/${namespaceId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to connect to Yavi namespace');
      }

      return await response.json();
    } catch (error) {
      console.error('Error connecting to namespace:', error);
      throw error;
    }
  }

  /**
   * Query documents in a namespace using RAG
   */
  async queryDocuments(
    namespaceId: string,
    query: string,
    limit: number = 10
  ): Promise<YaviQueryResult> {
    try {
      const response = await fetch(`${this.apiEndpoint}/namespaces/${namespaceId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, limit })
      });

      if (!response.ok) {
        throw new Error('Failed to query documents');
      }

      return await response.json();
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }

  /**
   * Process a document and extract information
   */
  async processDocument(
    file: File,
    namespaceId: string,
    extractors: string[]
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('namespace', namespaceId);
      formData.append('extractors', JSON.stringify(extractors));

      const response = await fetch(`${this.apiEndpoint}/documents/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  /**
   * Get available data connectors
   */
  async getAvailableConnectors(): Promise<YaviConnector[]> {
    // This would typically fetch from the API, but for now return a comprehensive list
    return [
      // Storage
      { id: 'google-drive', name: 'Google Drive', category: 'Storage', description: 'Connect to Google Drive files and folders', isConfigured: false },
      { id: 'dropbox', name: 'Dropbox', category: 'Storage', description: 'Sync files from Dropbox', isConfigured: false },
      { id: 'box', name: 'Box', category: 'Storage', description: 'Connect to Box cloud storage', isConfigured: false },
      { id: 'onedrive', name: 'OneDrive', category: 'Storage', description: 'Microsoft OneDrive integration', isConfigured: false },

      // Document Management
      { id: 'sharepoint', name: 'SharePoint', category: 'Document', description: 'Microsoft SharePoint document library', isConfigured: false },
      { id: 'confluence', name: 'Confluence', category: 'Document', description: 'Atlassian Confluence pages', isConfigured: false },
      { id: 'notion', name: 'Notion', category: 'Document', description: 'Notion workspace and pages', isConfigured: false },

      // CRM
      { id: 'salesforce', name: 'Salesforce', category: 'CRM', description: 'Salesforce CRM data', isConfigured: false },
      { id: 'hubspot', name: 'HubSpot', category: 'CRM', description: 'HubSpot CRM integration', isConfigured: false },
      { id: 'zoho-crm', name: 'Zoho CRM', category: 'CRM', description: 'Zoho CRM platform', isConfigured: false },

      // Financial
      { id: 'quickbooks', name: 'QuickBooks', category: 'Financial', description: 'QuickBooks accounting data', isConfigured: false },
      { id: 'xero', name: 'Xero', category: 'Financial', description: 'Xero accounting platform', isConfigured: false },
      { id: 'stripe', name: 'Stripe', category: 'Financial', description: 'Stripe payment data', isConfigured: false },
      { id: 'plaid', name: 'Plaid', category: 'Financial', description: 'Bank account data via Plaid', isConfigured: false },

      // Legal
      { id: 'docusign', name: 'DocuSign', category: 'Legal', description: 'DocuSign document management', isConfigured: false },
      { id: 'clio', name: 'Clio', category: 'Legal', description: 'Clio legal practice management', isConfigured: false },
      { id: 'mycase', name: 'MyCase', category: 'Legal', description: 'MyCase legal software', isConfigured: false },

      // Healthcare
      { id: 'epic', name: 'Epic', category: 'Healthcare', description: 'Epic EHR system', isConfigured: false },
      { id: 'cerner', name: 'Cerner', category: 'Healthcare', description: 'Cerner health records', isConfigured: false },
      { id: 'athenahealth', name: 'athenahealth', category: 'Healthcare', description: 'athenahealth EHR', isConfigured: false },

      // Construction
      { id: 'procore', name: 'Procore', category: 'Construction', description: 'Procore construction management', isConfigured: false },
      { id: 'autodesk', name: 'Autodesk', category: 'Construction', description: 'Autodesk BIM 360', isConfigured: false },
      { id: 'planGrid', name: 'PlanGrid', category: 'Construction', description: 'PlanGrid project management', isConfigured: false },

      // Project Management
      { id: 'jira', name: 'Jira', category: 'Project Management', description: 'Atlassian Jira', isConfigured: false },
      { id: 'asana', name: 'Asana', category: 'Project Management', description: 'Asana project tracking', isConfigured: false },
      { id: 'monday', name: 'Monday.com', category: 'Project Management', description: 'Monday work OS', isConfigured: false },
      { id: 'trello', name: 'Trello', category: 'Project Management', description: 'Trello boards', isConfigured: false },

      // Communication
      { id: 'slack', name: 'Slack', category: 'Communication', description: 'Slack workspace messages', isConfigured: false },
      { id: 'teams', name: 'Microsoft Teams', category: 'Communication', description: 'Teams chat and files', isConfigured: false },
      { id: 'gmail', name: 'Gmail', category: 'Communication', description: 'Gmail email integration', isConfigured: false },
      { id: 'outlook', name: 'Outlook', category: 'Communication', description: 'Outlook email', isConfigured: false },

      // Database
      { id: 'postgres', name: 'PostgreSQL', category: 'Database', description: 'PostgreSQL database', isConfigured: false },
      { id: 'mysql', name: 'MySQL', category: 'Database', description: 'MySQL database', isConfigured: false },
      { id: 'mongodb', name: 'MongoDB', category: 'Database', description: 'MongoDB NoSQL database', isConfigured: false },
      { id: 'airtable', name: 'Airtable', category: 'Database', description: 'Airtable bases', isConfigured: false },

      // E-commerce
      { id: 'shopify', name: 'Shopify', category: 'E-commerce', description: 'Shopify store data', isConfigured: false },
      { id: 'woocommerce', name: 'WooCommerce', category: 'E-commerce', description: 'WooCommerce store', isConfigured: false },
      { id: 'magento', name: 'Magento', category: 'E-commerce', description: 'Magento platform', isConfigured: false },

      // HR & Payroll
      { id: 'bamboohr', name: 'BambooHR', category: 'HR', description: 'BambooHR employee data', isConfigured: false },
      { id: 'adp', name: 'ADP', category: 'HR', description: 'ADP payroll system', isConfigured: false },
      { id: 'workday', name: 'Workday', category: 'HR', description: 'Workday HCM', isConfigured: false },

      // Marketing
      { id: 'mailchimp', name: 'Mailchimp', category: 'Marketing', description: 'Mailchimp email campaigns', isConfigured: false },
      { id: 'google-analytics', name: 'Google Analytics', category: 'Marketing', description: 'Website analytics data', isConfigured: false },
      { id: 'facebook-ads', name: 'Facebook Ads', category: 'Marketing', description: 'Facebook advertising data', isConfigured: false },

      // Cloud Platforms
      { id: 'aws-s3', name: 'AWS S3', category: 'Cloud', description: 'Amazon S3 storage', isConfigured: false },
      { id: 'azure-blob', name: 'Azure Blob Storage', category: 'Cloud', description: 'Azure cloud storage', isConfigured: false },
      { id: 'gcp-storage', name: 'Google Cloud Storage', category: 'Cloud', description: 'GCP storage buckets', isConfigured: false },

      // Other
      { id: 'zendesk', name: 'Zendesk', category: 'Support', description: 'Zendesk support tickets', isConfigured: false },
      { id: 'intercom', name: 'Intercom', category: 'Support', description: 'Intercom customer messages', isConfigured: false },
      { id: 'github', name: 'GitHub', category: 'Development', description: 'GitHub repositories', isConfigured: false },
      { id: 'gitlab', name: 'GitLab', category: 'Development', description: 'GitLab projects', isConfigured: false }
    ];
  }

  /**
   * Test connection to Yavi API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  }

  /**
   * Create a new namespace
   */
  async createNamespace(name: string, industry: string): Promise<YaviNamespace> {
    try {
      const response = await fetch(`${this.apiEndpoint}/namespaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, industry })
      });

      if (!response.ok) {
        throw new Error('Failed to create namespace');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating namespace:', error);
      throw error;
    }
  }

  /**
   * List all namespaces
   */
  async listNamespaces(): Promise<YaviNamespace[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/namespaces`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to list namespaces');
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing namespaces:', error);
      throw error;
    }
  }

  /**
   * Upload document to namespace
   */
  async uploadDocument(
    file: File,
    namespaceId: string,
    metadata?: Record<string, any>
  ): Promise<YaviDocument> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('namespace', namespaceId);
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await fetch(`${this.apiEndpoint}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Extract specific data from document using Yavi AI
   */
  async extractData(
    documentId: string,
    extractors: string[]
  ): Promise<any> {
    try {
      const response = await fetch(`${this.apiEndpoint}/documents/${documentId}/extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ extractors })
      });

      if (!response.ok) {
        throw new Error('Failed to extract data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error extracting data:', error);
      throw error;
    }
  }

  /**
   * Chat with documents using RAG
   */
  async chatWithDocuments(
    namespaceId: string,
    message: string,
    context?: string[]
  ): Promise<{ response: string; sources: YaviDocument[] }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/namespaces/${namespaceId}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, context })
      });

      if (!response.ok) {
        throw new Error('Failed to chat with documents');
      }

      return await response.json();
    } catch (error) {
      console.error('Error chatting with documents:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<YaviDocument> {
    try {
      const response = await fetch(`${this.apiEndpoint}/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  /**
   * Semantic search across documents
   */
  async semanticSearch(
    namespaceId: string,
    query: string,
    filters?: Record<string, any>
  ): Promise<YaviQueryResult> {
    try {
      const response = await fetch(`${this.apiEndpoint}/namespaces/${namespaceId}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, filters })
      });

      if (!response.ok) {
        throw new Error('Failed to perform semantic search');
      }

      return await response.json();
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw error;
    }
  }

  /**
   * Configure a data connector
   */
  async configureConnector(
    connectorId: string,
    config: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/connectors/${connectorId}/configure`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to configure connector');
      }

      return await response.json();
    } catch (error) {
      console.error('Error configuring connector:', error);
      throw error;
    }
  }

  /**
   * Sync data from a configured connector
   */
  async syncConnector(
    connectorId: string,
    namespaceId: string
  ): Promise<{ jobId: string; status: string }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/connectors/${connectorId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ namespaceId })
      });

      if (!response.ok) {
        throw new Error('Failed to sync connector');
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing connector:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const yaviConnector = new YaviConnectorService();

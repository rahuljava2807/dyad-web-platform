import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const port = process.env.PORT || 5000
const prisma = new PrismaClient()

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Default user for local development
const DEFAULT_USER_ID = 'local-dev-user'

// Ensure default user exists
async function ensureDefaultUser() {
  try {
    let user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: DEFAULT_USER_ID,
          email: 'developer@nimbusnext.com',
          name: 'Local Development User',
          provider: 'local',
          emailVerified: new Date(),
        }
      })
      console.log('✅ Created default user for local development')
    }
    return user
  } catch (error) {
    console.warn('⚠️ Could not ensure default user exists:', error)
    return null
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'dyad-backend',
    version: '1.0.0'
  })
})

// API Routes
app.get('/api/projects', async (req, res) => {
  try {
    await ensureDefaultUser()

    const projects = await prisma.project.findMany({
      where: {
        ownerId: DEFAULT_USER_ID,
        status: 'active'
      },
      include: {
        _count: {
          select: {
            files: true,
            aiGenerations: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      framework: project.framework,
      template: project.template,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      fileCount: project._count.files,
      aiGenerationCount: project._count.aiGenerations
    }))

    res.json({
      success: true,
      data: {
        projects: formattedProjects
      }
    })
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    })
  }
})

app.post('/api/projects', async (req, res) => {
  try {
    await ensureDefaultUser()

    const { name, description, template, framework } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      })
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description || null,
        template: template || null,
        framework: framework || null,
        ownerId: DEFAULT_USER_ID,
        status: 'active'
      },
      include: {
        _count: {
          select: {
            files: true,
            aiGenerations: true
          }
        }
      }
    })

    // Create initial files based on template
    if (template) {
      await createTemplateFiles(project.id, template)
    }

    console.log(`✅ Created project: ${project.name}`)

    res.status(201).json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          framework: project.framework,
          template: project.template,
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          fileCount: project._count.files,
          aiGenerationCount: project._count.aiGenerations
        }
      }
    })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    })
  }
})

app.get('/api/projects/:id', async (req, res) => {
  try {
    await ensureDefaultUser()

    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        ownerId: DEFAULT_USER_ID
      },
      include: {
        files: {
          orderBy: {
            path: 'asc'
          }
        },
        _count: {
          select: {
            aiGenerations: true
          }
        }
      }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          framework: project.framework,
          template: project.template,
          status: project.status,
          settings: project.settings,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          files: project.files,
          aiGenerationCount: project._count.aiGenerations
        }
      }
    })
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    })
  }
})

// Create initial files for templates
async function createTemplateFiles(projectId: string, template: string): Promise<void> {
  const templates: Record<string, Array<{ path: string; content: string }>> = {
    'document-intelligence': [
      {
        path: 'README.md',
        content: `# Document Intelligence Hub

## Overview
Universal document processing platform for any industry using Yavi.ai integration.

## Features
- Contract Analysis
- Invoice Processing
- Compliance Review
- Multi-language Support

## ROI Metrics
- $2.4M Annual Savings
- 75% Time Reduction
- 90% Accuracy Improvement

## Getting Started
1. Configure Yavi.ai API key
2. Set up data sources
3. Run document processing workflows
`
      },
      {
        path: 'src/index.js',
        content: `// Document Intelligence Hub - Main Entry Point

import { YaviClient } from '@yavi/sdk';

const client = new YaviClient({
  apiKey: process.env.YAVI_API_KEY
});

// Document processing workflow
export async function processDocument(document) {
  try {
    const result = await client.processDocument({
      document: document,
      workflow: 'intelligent-extraction'
    });

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Document processing failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default client;
`
      }
    ],
    'data-integration-hub': [
      {
        path: 'README.md',
        content: `# Data Integration Hub

## Overview
Unified data layer connecting any system to any other system using Yavi.ai.

## Features
- Real-time Data Sync
- 60+ Connectors
- Data Quality Monitoring
- Analytics Dashboard

## ROI Metrics
- $1.8M Annual Value
- 60% Faster Insights
- 95% Data Accuracy

## Getting Started
1. Configure data sources
2. Set up connectors
3. Monitor data flows
`
      },
      {
        path: 'src/index.js',
        content: `// Data Integration Hub - Main Entry Point

import { YaviDataClient } from '@yavi/data-sdk';

const dataClient = new YaviDataClient({
  apiKey: process.env.YAVI_API_KEY
});

// Data integration workflow
export async function syncData(sourceConfig, targetConfig) {
  try {
    const result = await dataClient.sync({
      source: sourceConfig,
      target: targetConfig,
      realTime: true
    });

    return {
      success: true,
      syncId: result.syncId,
      status: result.status
    };
  } catch (error) {
    console.error('Data sync failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default dataClient;
`
      }
    ]
  }

  const templateFiles = templates[template] || []

  for (const file of templateFiles) {
    await prisma.projectFile.create({
      data: {
        projectId,
        path: file.path,
        content: file.content,
        size: Buffer.byteLength(file.content, 'utf8'),
        mimeType: file.path.endsWith('.md') ? 'text/markdown' : 'application/javascript',
        hash: Math.random().toString(36).substring(7)
      }
    })
  }
}

// Start server
async function startServer() {
  try {
    app.listen(port, () => {
      console.log(`🚀 Backend server running on port ${port}`)
      console.log(`📱 Health check: http://localhost:${port}/health`)
      console.log(`🔗 API endpoint: http://localhost:${port}/api`)
      console.log(`🌐 Frontend: http://localhost:3000`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

if (require.main === module) {
  startServer()
}

export default app
console.log('🔄 Loading server modules...')

import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
// import apiKeysRouter from './routes/apiKeys'
import generationRouter from './routes/generation'
// import previewRouter from './routes/preview'

console.log('✅ Modules loaded, initializing app...')

const app = express()
const port = process.env.PORT || 5000
const prisma = new PrismaClient()

console.log('✅ App initialized, setting up middleware...')

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

// Routes
// app.use('/api/keys', apiKeysRouter)
app.use('/api', generationRouter)
// app.use('/api/preview', previewRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'dyad-backend',
    version: '1.0.0'
  })
})

// Mock Yavi.ai endpoints for local testing
app.get('/api/yavi-mock/namespaces/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: req.params.id,
    industry: req.params.id.split('-')[0],
    documentCount: 150,
    lastUpdated: new Date()
  })
})

app.post('/api/yavi-mock/namespaces/:id/query', (req, res) => {
  // Mock document query response
  res.json({
    documents: [
      {
        id: '1',
        name: 'Sample Contract.pdf',
        type: 'contract',
        content: 'This is a sample contract content...',
        metadata: { pages: 10, size: '2.5MB' }
      }
    ],
    similarity: [0.95],
    tokens: 1250
  })
})

app.post('/api/yavi-mock/documents/process', (req, res) => {
  // Mock document processing response with industry-specific data
  const industry = req.body.namespace?.split('-')[0] || 'general'

  const mockData: Record<string, any> = {
    legal: {
      parties: [
        { name: 'Acme Corporation', role: 'Service Provider' },
        { name: 'Tech Solutions Inc', role: 'Client' }
      ],
      keyTerms: [
        { term: 'Contract Duration', value: '12 months', risk: 'low' },
        { term: 'Payment Terms', value: 'Net 30', risk: 'low' },
        { term: 'Termination Clause', value: '30 days notice', risk: 'medium' }
      ],
      obligations: [
        { party: 'Service Provider', obligation: 'Deliver services as specified', deadline: '2025-12-31' },
        { party: 'Client', obligation: 'Make timely payments', deadline: 'Monthly' }
      ],
      financials: [
        { type: 'Monthly Fee', amount: 5000, currency: 'USD' },
        { type: 'Setup Cost', amount: 2500, currency: 'USD' }
      ],
      risks: [
        { category: 'Financial', description: 'Late payment penalties not clearly defined', severity: 'medium' },
        { category: 'Liability', description: 'Liability cap may be insufficient', severity: 'high' }
      ]
    },
    construction: {
      completion: 65,
      budgetUsed: 3250000,
      totalBudget: 5000000,
      budgetRemaining: 35,
      documentCount: 245,
      pendingApprovals: 8,
      milestones: [
        { name: 'Foundation Complete', date: '2024-09-15', status: 'Completed', completed: true, cost: 750000 },
        { name: 'Framing Complete', date: '2024-11-30', status: 'In Progress', completed: false, cost: 850000 },
        { name: 'MEP Installation', date: '2025-02-15', status: 'Pending', completed: false, cost: 1200000 }
      ],
      recentDocuments: [
        { name: 'Floor Plan v3.2', type: 'Blueprint', date: '2024-10-01' },
        { name: 'Safety Inspection Report', type: 'Compliance', date: '2024-09-28' },
        { name: 'Material Invoice #4521', type: 'Financial', date: '2024-09-25' }
      ]
    },
    healthcare: {
      vitals: {
        heartRate: 72,
        heartRateTrend: 'stable',
        bloodPressure: '120/80',
        bpTrend: 'stable',
        glucose: 95,
        glucoseTrend: 'down',
        temperature: 98.6
      },
      medications: [
        { name: 'Lisinopril 10mg', dosage: '10mg', frequency: 'Once daily', prescribedDate: '2024-06-15' },
        { name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily', prescribedDate: '2024-06-15', interactions: 'Monitor glucose levels' }
      ],
      recentRecords: [
        { type: 'Annual Physical', date: '2024-09-15', physician: 'Dr. Smith' },
        { type: 'Lab Results', date: '2024-08-20', physician: 'Dr. Johnson' },
        { type: 'Follow-up Visit', date: '2024-07-10', physician: 'Dr. Smith' }
      ]
    },
    financial: {
      invoices: [
        { number: 'INV-2024-001', vendor: 'Office Supplies Co', date: '2024-09-15', total: 1250.50, tax: 100.04, status: 'approved' },
        { number: 'INV-2024-002', vendor: 'Tech Services Inc', date: '2024-09-18', total: 3500.00, tax: 280.00, status: 'pending' },
        { number: 'INV-2024-003', vendor: 'Consulting Partners', date: '2024-09-20', total: 7500.00, tax: 600.00, status: 'approved' }
      ]
    }
  }

  res.json(mockData[industry] || { message: 'Mock data processed' })
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

    // Return empty array if database is not available
    console.warn('⚠️ Database not available - returning empty projects array')
    res.json({
      success: true,
      data: {
        projects: []
      }
    })
  }
})

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        files: true,
        aiGenerations: {
          orderBy: { createdAt: 'desc' },
          take: 10
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
      data: { project }
    })
  } catch (error) {
    console.error('Get project error:', error)
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

    // Check if database is unavailable
    if (error instanceof Error && error.message.includes("Can't reach database")) {
      return res.status(503).json({
        success: false,
        error: 'Database unavailable',
        message: 'Database is not running. You can still use Yavi Studio and Widget Library without creating projects.'
      })
    }

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
    ],
    // Vanilla Application Templates
    'nextjs-fullstack': [
      {
        path: 'README.md',
        content: `# Next.js Full-Stack Application

A complete web application built with Next.js, featuring both frontend and backend functionality.

## Features
- React 18 with TypeScript
- API Routes for backend functionality
- Database integration
- Authentication system
- Responsive design

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser
`
      },
      {
        path: 'package.json',
        content: `{
  "name": "nextjs-fullstack-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@types/node": "20.5.1",
    "@types/react": "18.2.20",
    "@types/react-dom": "18.2.7",
    "eslint": "8.47.0",
    "eslint-config-next": "13.4.19",
    "next": "13.4.19",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typescript": "5.1.6"
  }
}
`
      },
      {
        path: 'src/app/page.tsx',
        content: `export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Welcome to Your Next.js App
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p className="text-gray-600">
            Edit src/app/page.tsx to customize this page.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">API Routes</h2>
          <p className="text-gray-600">
            Create API endpoints in src/app/api/ directory.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Deploy</h2>
          <p className="text-gray-600">
            Deploy your app with Vercel, Netlify, or your preferred platform.
          </p>
        </div>
      </div>
    </main>
  )
}
`
      }
    ],
    'task-manager': [
      {
        path: 'README.md',
        content: `# Task Manager Application

A complete task management application with user authentication and CRUD operations.

## Features
- User registration and authentication
- Create, read, update, delete tasks
- Task categorization and filtering
- Responsive design
- Real-time updates

## Tech Stack
- Next.js 13+ with TypeScript
- Tailwind CSS for styling
- Prisma for database management
- NextAuth.js for authentication

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up your database:
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
`
      },
      {
        path: 'src/components/TaskCard.tsx',
        content: `interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <div className="flex items-start justify-between mb-2">
        <h3 className={\`font-semibold \${task.completed ? 'line-through text-gray-500' : ''}\`}>
          {task.title}
        </h3>
        <span className={\`px-2 py-1 text-xs rounded-full \${priorityColors[task.priority]}\`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className={\`text-gray-600 mb-3 \${task.completed ? 'line-through' : ''}\`}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => onUpdate(task.id, { completed: !task.completed })}
          className={\`px-3 py-1 text-sm rounded \${
            task.completed
              ? 'bg-gray-200 text-gray-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }\`}
        >
          {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
`
      }
    ],
    'react-spa': [
      {
        path: 'README.md',
        content: `# React Single Page Application

A modern React SPA built with TypeScript and Vite for fast development.

## Features
- React 18 with TypeScript
- Vite for fast build and development
- React Router for navigation
- State management with Context API
- Component library integration
- Responsive design with Tailwind CSS

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Build for production:
   \`\`\`bash
   npm run build
   \`\`\`
`
      },
      {
        path: 'src/App.tsx',
        content: `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
`
      }
    ],
    'express-api': [
      {
        path: 'README.md',
        content: `# Express REST API

A robust REST API built with Express.js, TypeScript, and modern best practices.

## Features
- Express.js with TypeScript
- Database integration with Prisma ORM
- JWT authentication
- Input validation
- Error handling middleware
- API documentation

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Run database migrations:
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

API will be available at http://localhost:3000
`
      },
      {
        path: 'src/server.ts',
        content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});

export default app;
`
      }
    ],
    'blank': [
      {
        path: 'README.md',
        content: `# Blank Canvas Project

A minimal setup to start building your application from scratch.

## What's Included
- Basic project structure
- Package.json with essential scripts
- Simple HTML/CSS/JavaScript setup
- No frameworks or opinions - full creative freedom

## Getting Started

1. This is your blank canvas - start building!
2. Add any frameworks, libraries, or tools you need
3. Customize the structure to fit your requirements

## Ideas for Your Project
- Add a frontend framework (React, Vue, Angular)
- Set up a backend (Express, Fastify, Koa)
- Integrate a database (PostgreSQL, MongoDB, SQLite)
- Add testing framework (Jest, Vitest, Cypress)
- Configure build tools (Vite, Webpack, Parcel)

The possibilities are endless!
`
      },
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Blank Canvas Project</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .card {
            border: 1px solid #ddd;
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 8px;
            background: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Welcome to Your Blank Canvas!</h1>
        <p>This is your starting point - build anything you imagine.</p>
    </div>

    <div class="card">
        <h2>Getting Started</h2>
        <p>Edit this HTML file or add your own files to begin building your project.</p>
    </div>

    <div class="card">
        <h2>Next Steps</h2>
        <ul>
            <li>Choose your tech stack</li>
            <li>Set up your development environment</li>
            <li>Start coding!</li>
        </ul>
    </div>

    <script>
        console.log('Welcome to your new project! 🚀');
        // Add your JavaScript here
    </script>
</body>
</html>
`
      },
      {
        path: 'package.json',
        content: `{
  "name": "blank-canvas-project",
  "version": "1.0.0",
  "description": "A blank canvas to build anything",
  "main": "index.js",
  "scripts": {
    "start": "echo 'Add your start script here'",
    "dev": "echo 'Add your dev script here'",
    "build": "echo 'Add your build script here'",
    "test": "echo 'Add your test script here'"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}
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
        mimeType: file.path.endsWith('.md') ? 'text/markdown' :
                  file.path.endsWith('.json') ? 'application/json' :
                  file.path.endsWith('.html') ? 'text/html' :
                  file.path.endsWith('.tsx') ? 'text/typescript-jsx' :
                  file.path.endsWith('.ts') ? 'text/typescript' :
                  'application/javascript',
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

// Start server immediately when this file is run
startServer().catch((error) => {
  console.error('❌ Fatal error during startup:', error)
  process.exit(1)
})

export default app
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Database,
  Key,
  Settings,
  Code2,
  FileText,
  ExternalLink,
  BookOpen,
  Zap,
  Globe,
  CheckCircle,
  Users,
  Clock,
  Target,
  Lightbulb,
  Shield,
  GitBranch,
  Monitor,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react'

export default function DocsPage() {
  const developmentWorkflow = [
    {
      phase: "Planning & Setup",
      duration: "1-2 days",
      steps: [
        "Define use case and requirements",
        "Set up development environment",
        "Configure Yavi.ai API access",
        "Choose application architecture"
      ]
    },
    {
      phase: "Development",
      duration: "1-2 weeks",
      steps: [
        "Create project using business solution template",
        "Implement core functionality",
        "Integrate Yavi.ai document processing",
        "Build user interface components"
      ]
    },
    {
      phase: "Integration & Testing",
      duration: "3-5 days",
      steps: [
        "Connect data sources",
        "Test document processing workflows",
        "Implement error handling",
        "Performance optimization"
      ]
    },
    {
      phase: "Deployment & Handoff",
      duration: "2-3 days",
      steps: [
        "Deploy to staging environment",
        "User acceptance testing",
        "Production deployment",
        "Documentation and team handoff"
      ]
    }
  ]

  const useCaseLibrary = [
    {
      title: "Contract Intelligence System",
      complexity: "High",
      timeline: "2-3 weeks",
      domain: "Legal & Compliance",
      description: "Automated contract analysis and risk assessment platform",
      features: [
        "Contract clause extraction",
        "Risk score calculation",
        "Compliance checking",
        "Amendment tracking"
      ],
      yaviComponents: [
        "Document Processing API",
        "Entity Recognition",
        "Classification Models",
        "Data Connectors"
      ],
      businessValue: "85% faster contract review, 60% risk reduction"
    },
    {
      title: "Invoice Processing Automation",
      complexity: "Medium",
      timeline: "1-2 weeks",
      domain: "Finance & Accounting",
      description: "End-to-end invoice processing with approval workflows",
      features: [
        "OCR and data extraction",
        "Vendor validation",
        "Automated routing",
        "Exception handling"
      ],
      yaviComponents: [
        "Document Processing API",
        "Table Recognition",
        "Workflow Engine",
        "Database Connectors"
      ],
      businessValue: "90% processing time reduction, 99.5% accuracy"
    },
    {
      title: "Research Document Discovery",
      complexity: "Medium",
      timeline: "1-2 weeks",
      domain: "Research & Development",
      description: "Intelligent research paper analysis and knowledge extraction",
      features: [
        "Semantic document search",
        "Key insight extraction",
        "Citation network analysis",
        "Knowledge graph generation"
      ],
      yaviComponents: [
        "Document Processing API",
        "Semantic Search",
        "Knowledge Graph API",
        "Content Connectors"
      ],
      businessValue: "70% faster research, 3x knowledge discovery"
    },
    {
      title: "Customer Onboarding Portal",
      complexity: "High",
      timeline: "2-3 weeks",
      domain: "Customer Experience",
      description: "Automated customer document verification and onboarding",
      features: [
        "Document verification",
        "Identity validation",
        "Compliance screening",
        "Progress tracking"
      ],
      yaviComponents: [
        "Document Processing API",
        "Verification Services",
        "Workflow Engine",
        "Integration APIs"
      ],
      businessValue: "80% faster onboarding, 95% straight-through processing"
    }
  ]

  const architecturePatterns = [
    {
      pattern: "Event-Driven Processing",
      useCase: "Real-time document processing",
      components: ["Yavi.ai Webhooks", "Message Queues", "Event Handlers"],
      code: `// Event-driven document processing
app.post('/webhook/document-processed', async (req, res) => {
  const { documentId, status, results } = req.body;

  if (status === 'completed') {
    await processDocumentResults(documentId, results);
    await notifyStakeholders(documentId);
  }

  res.status(200).send('OK');
});`
    },
    {
      pattern: "Batch Processing Pipeline",
      useCase: "High-volume document processing",
      components: ["Job Queues", "Worker Services", "Progress Tracking"],
      code: `// Batch processing setup
const processBatch = async (documents) => {
  const jobs = documents.map(doc => ({
    id: doc.id,
    file: doc.file,
    options: { extractTables: true, language: 'en' }
  }));

  const results = await yaviClient.batch.process(jobs);
  return results;
};`
    },
    {
      pattern: "Human-in-the-Loop",
      useCase: "Quality assurance workflows",
      components: ["Review Queues", "Approval Workflows", "Feedback Loops"],
      code: `// Human review workflow
const requiresHumanReview = (confidence) => confidence < 0.85;

if (requiresHumanReview(result.confidence)) {
  await createReviewTask({
    documentId: result.documentId,
    extractedData: result.data,
    confidence: result.confidence,
    assignee: getNextReviewer()
  });
}`
    }
  ]

  const codeExamples = [
    {
      title: "Project Setup - Environment Configuration",
      description: "Set up your development environment with Yavi.ai integration",
      code: `// .env.local
YAVI_API_KEY=your_api_key_here
YAVI_ENDPOINT=https://api.yavi.ai
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp
REDIS_URL=redis://localhost:6379

// next.config.js
module.exports = {
  env: {
    YAVI_API_KEY: process.env.YAVI_API_KEY,
    YAVI_ENDPOINT: process.env.YAVI_ENDPOINT,
  },
  experimental: {
    serverComponentsExternalPackages: ['@yavi/sdk']
  }
}`
    },
    {
      title: "Yavi.ai Client Initialization",
      description: "Initialize and configure the Yavi.ai client with error handling",
      code: `import { YaviClient } from '@yavi/sdk';

class YaviService {
  private client: YaviClient;

  constructor() {
    this.client = new YaviClient({
      apiKey: process.env.YAVI_API_KEY!,
      endpoint: process.env.YAVI_ENDPOINT || 'https://api.yavi.ai',
      timeout: 30000,
      retries: 3
    });
  }

  async initialize() {
    try {
      await this.client.ping();
      console.log('Yavi.ai client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Yavi.ai client:', error);
      throw error;
    }
  }

  async processDocument(file: File, options = {}) {
    return await this.client.documents.upload({
      file: await file.arrayBuffer(),
      filename: file.name,
      options: {
        extractTables: true,
        extractText: true,
        language: 'en',
        ...options
      }
    });
  }
}

export const yaviService = new YaviService();`
    },
    {
      title: "Document Processing Pipeline",
      description: "Complete document processing workflow with validation",
      code: `// API route: /api/process-document
import { yaviService } from '@/lib/yavi';
import { validateDocumentType } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as string;

    // Validate document
    const validation = await validateDocumentType(file, documentType);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    // Process with Yavi.ai
    const result = await yaviService.processDocument(file, {
      documentType,
      extractTables: documentType === 'invoice',
      extractSignatures: documentType === 'contract'
    });

    // Store results in database
    const document = await db.document.create({
      data: {
        filename: file.name,
        type: documentType,
        yaviId: result.id,
        status: 'processing',
        extractedData: result.metadata
      }
    });

    return Response.json({
      documentId: document.id,
      yaviId: result.id,
      status: 'processing'
    });

  } catch (error) {
    console.error('Document processing error:', error);
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
}`
    },
    {
      title: "Real-time Updates with WebSockets",
      description: "Implement real-time processing status updates",
      code: `// WebSocket server setup
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL }
});

// Yavi.ai webhook handler
app.post('/api/webhooks/yavi', async (req, res) => {
  const { documentId, status, results, confidence } = req.body;

  // Update database
  await db.document.update({
    where: { yaviId: documentId },
    data: {
      status,
      extractedData: results,
      confidence,
      processedAt: new Date()
    }
  });

  // Notify client via WebSocket
  io.emit('document-updated', {
    documentId,
    status,
    confidence,
    results: results ? sanitizeResults(results) : null
  });

  res.status(200).send('OK');
});

// Client-side React hook
export const useDocumentStatus = (documentId: string) => {
  const [status, setStatus] = useState('processing');
  const [results, setResults] = useState(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);

    socket.on('document-updated', (data) => {
      if (data.documentId === documentId) {
        setStatus(data.status);
        setResults(data.results);
      }
    });

    return () => socket.disconnect();
  }, [documentId]);

  return { status, results };
};`
    },
    {
      title: "Data Source Integration",
      description: "Connect to various data sources using Yavi.ai connectors",
      code: `// Data source configuration
const dataSourceConfig = {
  salesforce: {
    type: 'salesforce',
    credentials: {
      clientId: process.env.SF_CLIENT_ID,
      clientSecret: process.env.SF_CLIENT_SECRET,
      username: process.env.SF_USERNAME,
      password: process.env.SF_PASSWORD
    },
    objects: ['Account', 'Contact', 'Opportunity']
  },
  postgresql: {
    type: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASS
    },
    tables: ['customers', 'orders', 'products']
  }
};

// Set up data connectors
export class DataIntegrationService {
  async setupConnectors() {
    const connectors = await Promise.all([
      yaviService.connectors.create('salesforce', dataSourceConfig.salesforce),
      yaviService.connectors.create('database', dataSourceConfig.postgresql)
    ]);

    return connectors;
  }

  async syncData(connectorId: string, query: object) {
    const result = await yaviService.data.query(connectorId, {
      ...query,
      limit: 1000,
      offset: 0
    });

    // Process and store locally
    await this.processDataBatch(result.data);

    return result;
  }
}

export const dataService = new DataIntegrationService();`
    }
  ]

  const deploymentGuide = [
    {
      environment: "Local Development",
      requirements: [
        "Node.js 18+",
        "Docker Desktop",
        "PostgreSQL 14+",
        "Redis 6+"
      ],
      setup: `# Clone and setup
git clone [repository]
cd dyad-web-platform
./setup-local.sh

# Start development
npm run dev:frontend
npm run dev:backend`
    },
    {
      environment: "Staging/Production",
      requirements: [
        "Azure/AWS/GCP account",
        "Kubernetes cluster",
        "Managed database",
        "Redis cache"
      ],
      setup: `# Deploy with Docker
docker build -t dyad-app .
docker push your-registry/dyad-app

# Kubernetes deployment
kubectl apply -f k8s/
kubectl set env deployment/dyad-app YAVI_API_KEY=$YAVI_KEY`
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Developer Documentation</h1>
              <p className="text-slate-600">Complete guide for building applications with Yavi.ai integration</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction for Nimbusnext Team */}
        <section className="mb-12">
          <Card className="border-l-4 border-l-blue-600 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-xl text-slate-800">For Nimbusnext Development Teams</CardTitle>
                  <CardDescription className="text-slate-700">
                    This comprehensive guide will help you build production-ready applications using our web-based platform with Yavi.ai integration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Fast Development</h3>
                  <p className="text-sm text-slate-600">Build applications 90% faster using pre-built templates and components</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Proven Use Cases</h3>
                  <p className="text-sm text-slate-600">Start with battle-tested patterns for common business scenarios</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">Ready for Handoff</h3>
                  <p className="text-sm text-slate-600">Fully documented and ready to transfer to the Yavi.ai team</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Development Workflow */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Development Workflow
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Follow this proven 4-phase approach to build and deploy applications efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {developmentWorkflow.map((phase, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      Phase {index + 1}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {phase.duration}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{phase.phase}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                {index < developmentWorkflow.length - 1 && (
                  <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 hidden lg:block">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <ArrowLeft className="h-3 w-3 text-blue-600 rotate-180" />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Use Case Library */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Use Case Library
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Proven application patterns with detailed implementation guides and business value metrics
            </p>
          </div>

          <div className="space-y-6">
            {useCaseLibrary.map((useCase, index) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl text-slate-800">{useCase.title}</CardTitle>
                        <Badge
                          variant={useCase.complexity === 'High' ? 'destructive' : useCase.complexity === 'Medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {useCase.complexity} Complexity
                        </Badge>
                      </div>
                      <CardDescription className="text-base">{useCase.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 border-green-200 mb-1">
                        {useCase.domain}
                      </Badge>
                      <div className="text-sm text-slate-500">{useCase.timeline}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-slate-800 mb-3">Core Features:</h4>
                      <ul className="space-y-2">
                        {useCase.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-3">Yavi.ai Components:</h4>
                      <div className="flex flex-wrap gap-2">
                        {useCase.yaviComponents.map((component, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-blue-200 text-blue-700">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="bg-green-50 p-4 rounded border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">Business Value:</h4>
                        <p className="text-sm text-green-700">{useCase.businessValue}</p>
                        <Button asChild size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
                          <Link href={`/dashboard/projects/new?template=${useCase.title.toLowerCase().replace(/\s+/g, '-')}`}>
                            Start Building
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Architecture Patterns */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Architecture Patterns
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Proven architectural patterns for different types of applications and use cases
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {architecturePatterns.map((pattern, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-slate-600" />
                    {pattern.pattern}
                  </CardTitle>
                  <CardDescription>
                    <strong>Use Case:</strong> {pattern.useCase}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {pattern.components.map((component, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {component}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-100">
                      <code>{pattern.code}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Implementation Examples
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Complete code examples for common integration patterns and workflows
            </p>
          </div>

          <div className="space-y-8">
            {codeExamples.map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-slate-600" />
                    {example.title}
                  </CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-slate-100">
                      <code>{example.code}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Deployment Guide */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Deployment & Handoff Guide
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Production deployment strategies and team handoff procedures
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {deploymentGuide.map((guide, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-slate-600" />
                    {guide.environment}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {guide.requirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 mb-2">Setup Commands:</h4>
                    <div className="bg-slate-900 rounded-lg p-3">
                      <pre className="text-sm text-slate-100">
                        <code>{guide.setup}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Handoff Checklist */}
        <section className="mb-12">
          <Card className="border-l-4 border-l-orange-500 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Shield className="h-5 w-5 text-orange-600" />
                Team Handoff Checklist
              </CardTitle>
              <CardDescription className="text-slate-700">
                Complete this checklist before transferring the application to the Yavi.ai team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-slate-800 mb-3">Technical Documentation:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      API endpoints documented
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Environment variables listed
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Database schema exported
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Deployment scripts ready
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 mb-3">Application Readiness:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      All features tested
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Error handling implemented
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Performance optimized
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Security review completed
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Ready to Start Building?
              </h2>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                Choose a use case template and start building your application with comprehensive Yavi.ai integration
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/dashboard/projects/new">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Start New Project
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-5 w-5" />
                    Configure Yavi.ai
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">
                    <Database className="mr-2 h-5 w-5" />
                    View Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
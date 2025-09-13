'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  Download,
  Terminal,
  Database,
  Globe,
  Settings,
  Play,
  AlertCircle,
  ExternalLink,
  Code2,
  Rocket
} from 'lucide-react'
import { useState } from 'react'

export default function SetupGuidePage() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCommand(label)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const CodeBlock = ({ children, label, language = "bash" }: { children: string, label?: string, language?: string }) => (
    <div className="relative">
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
        <pre className="whitespace-pre-wrap">{children}</pre>
      </div>
      {label && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 p-0"
          onClick={() => copyToClipboard(children, label)}
        >
          {copiedCommand === label ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Complete Setup Guide</h1>
                <p className="text-gray-600">Get Dyad Web Platform running locally in 10 minutes</p>
              </div>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard">
                <Rocket className="mr-2 h-4 w-4" />
                Launch Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Start Alert */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Rocket className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Start Summary</h3>
              <p className="text-blue-800 mb-3">
                Get the platform running in under 10 minutes with this streamlined process.
              </p>
              <div className="text-sm text-blue-700 space-y-1">
                <div>✅ Clone repository → Install dependencies → Start Docker → Launch servers</div>
                <div>✅ No authentication required - direct access to dashboard and all features</div>
                <div>✅ Pre-configured with sample data and Yavi.ai integration templates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Prerequisites */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Prerequisites
            </CardTitle>
            <CardDescription>
              Ensure you have these tools installed before starting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-semibold mb-1">Docker Desktop</h4>
                <p className="text-sm text-gray-600 mb-2">For local services</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="https://docker.com/products/docker-desktop">
                    Download <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Globe className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-semibold mb-1">Node.js 18+</h4>
                <p className="text-sm text-gray-600 mb-2">JavaScript runtime</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="https://nodejs.org">
                    Download <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Terminal className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-semibold mb-1">Git</h4>
                <p className="text-sm text-gray-600 mb-2">Version control</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="https://git-scm.com">
                    Download <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Instructions */}
        <div className="space-y-8">
          {/* Step 1: Clone and Setup */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <CardTitle>Clone Repository & Install Dependencies</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Clone the repository and install all necessary dependencies:</p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Clone the repository:</h4>
                  <CodeBlock label="clone">
{`git clone https://github.com/nimbusnext/dyad-web-platform.git
cd dyad-web-platform`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Install root dependencies:</h4>
                  <CodeBlock label="root-deps">
{`npm install --legacy-peer-deps`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Install backend dependencies:</h4>
                  <CodeBlock label="backend-deps">
{`cd backend
npm install --legacy-peer-deps`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Install frontend dependencies:</h4>
                  <CodeBlock label="frontend-deps">
{`cd ../frontend
npm install --legacy-peer-deps`}
                  </CodeBlock>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Docker Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <CardTitle>Start Docker Services</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Launch PostgreSQL, Redis, and MinIO services using Docker:</p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Make sure Docker Desktop is running, then start services:</h4>
                  <CodeBlock label="docker">
{`cd /path/to/dyad-web-platform
docker-compose -f docker-compose.local.yml up -d`}
                  </CodeBlock>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Important Note</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Docker Desktop must be running before executing the docker-compose command.
                        Wait for all services to start completely before proceeding.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Verify services are running:</h4>
                  <CodeBlock label="verify">
{`docker ps`}
                  </CodeBlock>
                  <p className="text-sm text-gray-600 mt-1">You should see PostgreSQL, Redis, and MinIO containers running.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Database Setup */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <CardTitle>Setup Database</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Initialize the database schema and seed with sample data:</p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Navigate to backend and generate Prisma client:</h4>
                  <CodeBlock label="prisma-generate">
{`cd backend
npx prisma generate`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Run database migrations:</h4>
                  <CodeBlock label="migrate">
{`npx prisma migrate dev --name init`}
                  </CodeBlock>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Seed database with sample data:</h4>
                  <CodeBlock label="seed">
{`npx prisma db seed`}
                  </CodeBlock>
                  <p className="text-sm text-gray-600 mt-1">
                    This creates sample projects, templates, and test accounts for immediate use.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Launch Application */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                <CardTitle>Launch Application</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Start both backend and frontend servers:</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Terminal 1 - Backend
                  </h4>
                  <CodeBlock label="backend">
{`cd backend
npm run dev`}
                  </CodeBlock>
                  <p className="text-sm text-gray-600 mt-2">Backend will run on: <code className="bg-gray-100 px-1 rounded">http://localhost:5000</code></p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Terminal 2 - Frontend
                  </h4>
                  <CodeBlock label="frontend">
{`cd frontend
npm run dev`}
                  </CodeBlock>
                  <p className="text-sm text-gray-600 mt-2">Frontend will run on: <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Access Dashboard */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">5</div>
                <CardTitle className="text-green-800">Access Your Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-700">🎉 You're ready to start building! No authentication required.</p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Open your browser and navigate to:</h4>
                  <div className="flex items-center gap-3 p-3 bg-white border border-green-200 rounded-lg">
                    <code className="text-lg font-mono">http://localhost:3000/dashboard</code>
                    <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
                      <Link href="/dashboard">
                        <Play className="mr-2 h-4 w-4" />
                        Launch Now
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white border border-green-200 rounded-lg">
                    <Code2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <h5 className="font-medium mb-1">Create Projects</h5>
                    <p className="text-sm text-gray-600">Use horizontal solution templates</p>
                  </div>
                  <div className="text-center p-4 bg-white border border-green-200 rounded-lg">
                    <Database className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <h5 className="font-medium mb-1">Edit Code</h5>
                    <p className="text-sm text-gray-600">Monaco-based code editor</p>
                  </div>
                  <div className="text-center p-4 bg-white border border-green-200 rounded-lg">
                    <Globe className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <h5 className="font-medium mb-1">Integrate Yavi</h5>
                    <p className="text-sm text-gray-600">AI-powered capabilities</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service URLs Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Local Service URLs</CardTitle>
            <CardDescription>Quick reference for all local services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-3">Application Services</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Frontend</span>
                    <code className="text-blue-600">http://localhost:3000</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Backend API</span>
                    <code className="text-blue-600">http://localhost:5000</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Dashboard</span>
                    <code className="text-blue-600">http://localhost:3000/dashboard</code>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Infrastructure Services</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">PostgreSQL</span>
                    <code className="text-gray-600">localhost:5433</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Redis</span>
                    <code className="text-gray-600">localhost:6380</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">MinIO Console</span>
                    <code className="text-gray-600">http://localhost:9001</code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="mt-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-orange-800 mb-2">Port Already in Use</h4>
              <p className="text-orange-700 text-sm mb-2">If ports 3000 or 5000 are busy:</p>
              <CodeBlock label="kill-port">
{`# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3002 npm run dev`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-medium text-orange-800 mb-2">Docker Not Running</h4>
              <p className="text-orange-700 text-sm">
                Make sure Docker Desktop is running and wait for it to fully start before running docker-compose commands.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-orange-800 mb-2">Database Connection Issues</h4>
              <CodeBlock label="db-restart">
{`# Restart Docker services
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d`}
              </CodeBlock>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">🚀 Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Start Building</h4>
                <ul className="space-y-2 text-blue-700">
                  <li>• Create your first project using horizontal templates</li>
                  <li>• Explore the Monaco code editor</li>
                  <li>• Try document processing workflows</li>
                  <li>• Configure Yavi.ai integration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Learn More</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/docs">Browse Documentation</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/docs/api">API Reference</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/docs/examples">View Examples</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
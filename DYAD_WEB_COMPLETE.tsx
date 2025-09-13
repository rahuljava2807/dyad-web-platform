'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Code2,
  Rocket,
  Zap,
  Database,
  Globe,
  FileText,
  Users,
  BarChart3,
  Settings,
  Play,
  Book,
  Download,
  CheckCircle,
  ExternalLink,
  Workflow,
  Key
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Dyad Web Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="#documentation">
                  <Book className="mr-2 h-4 w-4" />
                  Documentation
                </Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard">
                  <Play className="mr-2 h-4 w-4" />
                  Launch Platform
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
              🚀 Web-Based Development Platform
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Build AI-Powered Applications
              <span className="text-blue-600 block">With Yavi Integration</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Transform from desktop to web. Create intelligent document processing applications,
              automate workflows, and integrate with Yavi.ai's powerful capabilities - all through
              an intuitive web interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/dashboard">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Building Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">
                  <FileText className="mr-2 h-5 w-5" />
                  View Capabilities
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Current State Overview */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What's Available Right Now</h2>
            <p className="text-lg text-gray-600">Complete web-based platform ready for development</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-green-800">Web Dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  Full web interface for project management, file editing, and development workflow
                </p>
                <Button size="sm" asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/dashboard">Access Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-blue-800">Code Editor</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">
                  Monaco-based code editor with syntax highlighting and intelligent features
                </p>
                <Button size="sm" variant="outline" className="border-blue-600 text-blue-600">
                  View Editor
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-purple-800">Yavi Ready</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 mb-4">
                  Pre-configured for Yavi.ai integration with sample templates and workflows
                </p>
                <Button size="sm" variant="outline" className="border-purple-600 text-purple-600">
                  View Templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Get Started */}
      <section id="getting-started" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started in 3 Steps</h2>
            <p className="text-lg text-gray-600">From setup to your first application</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Setup Environment</h3>
              <p className="text-gray-600">
                Clone repository, run Docker services, install dependencies. Complete setup in 5 minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Access Dashboard</h3>
              <p className="text-gray-600">
                Navigate to localhost:3000/dashboard, explore templates, and create your first project.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Build & Deploy</h3>
              <p className="text-gray-600">
                Use Yavi templates, integrate AI capabilities, and deploy your intelligent application.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="#documentation">
                <Download className="mr-2 h-5 w-5" />
                View Complete Setup Guide
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Application Templates */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready-to-Use Application Templates</h2>
            <p className="text-lg text-gray-600">Horizontal solutions that work across industries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <CardTitle>Document Intelligence Hub</CardTitle>
                </div>
                <CardDescription>Universal document processing for any industry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge className="bg-green-100 text-green-800">$2.4M Annual Savings</Badge>
                  <div className="text-sm text-gray-600">
                    <strong>Features:</strong> Contract Analysis, Invoice Processing, Compliance Review
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Industries:</strong> Finance, Legal, Healthcare, Manufacturing
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-green-600" />
                  <CardTitle>Data Integration Hub</CardTitle>
                </div>
                <CardDescription>Connect any system to any other system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge className="bg-blue-100 text-blue-800">$1.8M Annual Value</Badge>
                  <div className="text-sm text-gray-600">
                    <strong>Features:</strong> Real-time Sync, 60+ Connectors, Data Quality
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Industries:</strong> Technology, Finance, Retail, Healthcare
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-purple-600" />
                  <CardTitle>AI Workflow Orchestrator</CardTitle>
                </div>
                <CardDescription>Intelligent automation for any business process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge className="bg-purple-100 text-purple-800">$3.2M Annual Savings</Badge>
                  <div className="text-sm text-gray-600">
                    <strong>Features:</strong> Dynamic Workflows, Human-in-Loop, Process Analytics
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Industries:</strong> Operations, HR, Finance, Customer Service
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/dashboard/projects/new">
                <ArrowRight className="mr-2 h-4 w-4" />
                Explore All Templates
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Documentation Preview */}
      <section id="documentation" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Developer Resources</h2>
            <p className="text-lg text-gray-600">Everything you need to get started and succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Quick Setup Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Docker & Dependencies Installation</li>
                  <li>• Backend & Frontend Configuration</li>
                  <li>• Database Setup & Seeding</li>
                  <li>• Environment Variables & Security</li>
                  <li>• Local Development Workflow</li>
                </ul>
                <Button className="mt-4 w-full" asChild>
                  <Link href="/docs/setup">View Setup Guide</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-green-600" />
                  Development Docs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Yavi.ai Integration Guide</li>
                  <li>• Application Templates Library</li>
                  <li>• API Reference & Examples</li>
                  <li>• Authentication & Security</li>
                  <li>• Deployment & Scaling</li>
                </ul>
                <Button className="mt-4 w-full" variant="outline" asChild>
                  <Link href="/docs">Browse Documentation</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Intelligent Applications?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the Yavi development platform and create AI-powered solutions in minutes, not months.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
              <Link href="/dashboard">
                <Rocket className="mr-2 h-5 w-5" />
                Launch Dashboard
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/docs">
                <Book className="mr-2 h-5 w-5" />
                Read Documentation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Dyad Web Platform</span>
              </div>
              <p className="text-gray-400">
                Empowering developers to create intelligent applications with Yavi.ai integration.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/docs/setup" className="hover:text-white">Setup Guide</Link></li>
                <li><Link href="/docs/templates" className="hover:text-white">Templates</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs/api" className="hover:text-white">API Reference</Link></li>
                <li><Link href="/docs/troubleshooting" className="hover:text-white">Troubleshooting</Link></li>
                <li><Link href="/docs/examples" className="hover:text-white">Examples</Link></li>
                <li><Link href="#" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 Dyad Web Platform. Built for Yavi.ai integration and intelligent application development.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
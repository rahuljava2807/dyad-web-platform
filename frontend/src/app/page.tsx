'use client'

import Link from 'next/link'
import Image from 'next/image'
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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
                <Image
                  src="/images/logos/yavi-logo.svg"
                  alt="Yavi Studio"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Yavi Studio
              </span>
            </Link>
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
      <section className="relative py-32 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/logos/hero-bg.jpg"
            alt="Yavi Studio Hero Background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-6 text-sm py-2 px-4">
              <Sparkles className="inline h-4 w-4 mr-2" />
              AI-Powered Development Platform
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Build Intelligent Apps
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 block mt-2">
                In Minutes, Not Months
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
              Transform ideas into production-ready applications with Yavi Studio's AI-powered code generation,
              industry templates, and enterprise-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6 px-8 shadow-xl hover:shadow-2xl transition-all">
                <Link href="/dashboard">
                  <Rocket className="mr-2 h-6 w-6" />
                  Start Building Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg py-6 px-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                <Link href="#features">
                  <Play className="mr-2 h-6 w-6" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Production-Ready Code</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Enterprise Security</span>
              </div>
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

      {/* Visual Features Showcase */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-4">
              Enterprise-Grade Platform
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Built for Scale and Security
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Production-ready infrastructure with enterprise compliance and AI-powered intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/features/secure-01-scaled.webp"
                alt="Enterprise Security"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-semibold">Enterprise Security</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Security & Compliance Built-In
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                SOC2, HIPAA, GDPR, and PCI-DSS compliant from day one. End-to-end encryption,
                role-based access control, and comprehensive audit logs keep your data secure.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Multi-factor authentication and SSO</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Data encryption at rest and in transit</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Automated compliance reporting</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6 md:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-semibold">Seamless Integration</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Connect Everything, Effortlessly
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Pre-built connectors to 60+ enterprise systems. Real-time data sync with automatic
                conflict resolution and data quality monitoring.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>API-first architecture with webhooks</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Real-time bidirectional sync</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Custom connector SDK</span>
                </li>
              </ul>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl md:order-2">
              <Image
                src="/images/features/seamless-new001-scaled.webp"
                alt="Seamless Integration"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/features/Prebuilt-rag-01-scaled.webp"
                alt="AI-Powered Intelligence"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="text-purple-800 font-semibold">AI Intelligence</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Pre-Built RAG & AI Workflows
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Production-ready Retrieval Augmented Generation with vector databases, semantic search,
                and intelligent document processing powered by Claude and GPT-4.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span>Multi-model AI orchestration</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span>Intelligent document extraction</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span>Semantic search and embeddings</span>
                </li>
              </ul>
            </div>
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

      {/* Partner Logos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
              Trusted by Enterprise Teams Using
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16 opacity-60 hover:opacity-100 transition-opacity">
              <div className="relative w-32 h-12 grayscale hover:grayscale-0 transition-all">
                <Image
                  src="/images/partners/microsoft-logo.png"
                  alt="Microsoft"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative w-32 h-12 grayscale hover:grayscale-0 transition-all">
                <Image
                  src="/images/partners/Front.png"
                  alt="Front"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative w-32 h-12 grayscale hover:grayscale-0 transition-all">
                <Image
                  src="/images/partners/Intercom.png"
                  alt="Intercom"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
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
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/images/logos/yavi-logo.svg"
                    alt="Yavi Studio"
                    fill
                    className="object-contain brightness-0 invert"
                  />
                </div>
                <span className="text-xl font-bold">Yavi Studio</span>
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

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-center md:text-left">
                &copy; 2024 Yavi Studio. Built for Yavi.ai integration and intelligent application development.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-gray-500 text-sm">Powered by</span>
                <div className="relative w-24 h-8">
                  <Image
                    src="/images/logos/poweredbtcky.svg"
                    alt="Powered by Nimbusnext"
                    fill
                    className="object-contain brightness-0 invert opacity-50 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
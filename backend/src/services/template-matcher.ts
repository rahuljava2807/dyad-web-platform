import { ThinkingStep } from '../../types';

export interface TemplateMetadata {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  preview?: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: string;
}

export interface TemplateFile {
  path: string;
  content: string;
  language: string;
  summary?: string;
}

export interface Template {
  metadata: TemplateMetadata;
  files: TemplateFile[];
}

export class TemplateMatcher {
  private static templates: Template[] = [
    // Login Form Template
    {
      metadata: {
        id: 'auth-login-form',
        name: 'Professional Login Form',
        category: 'auth',
        description: 'Modern login form with email/password, social auth, and forgot password',
        tags: ['auth', 'login', 'form', 'security', 'shadcn-ui'],
        preview: '/templates/previews/login-form.png',
        complexity: 'simple',
        estimatedTime: '5 minutes'
      },
      files: [
        {
          path: 'src/components/LoginForm.tsx',
          language: 'typescript',
          content: `import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, ArrowRight, Github } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulated login
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Login:', { email, password })
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <Button variant="outline" className="w-full">
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <a href="#" className="text-primary hover:underline font-medium">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}`,
          summary: 'Creating a professional login form component with shadcn-ui, email/password fields, and social authentication.'
        },
        {
          path: 'src/App.tsx',
          language: 'typescript',
          content: `import { LoginForm } from './components/LoginForm'

export default function App() {
  return <LoginForm />
}`,
          summary: 'Setting up the main application entry point with the login form.'
        },
        {
          path: 'package.json',
          language: 'json',
          content: JSON.stringify({
            name: 'login-form-app',
            version: '1.0.0',
            dependencies: {
              'react': '^18.3.1',
              'react-dom': '^18.3.1',
              'lucide-react': '^0.344.0',
              '@radix-ui/react-label': '^2.0.2',
              '@radix-ui/react-slot': '^1.0.2',
              'class-variance-authority': '^0.7.0',
              'clsx': '^2.1.0',
              'tailwind-merge': '^2.2.0'
            }
          }, null, 2),
          summary: 'Configuring project dependencies including React, shadcn-ui components, and Lucide icons.'
        }
      ]
    },

    // Dashboard Template
    {
      metadata: {
        id: 'dashboard-analytics',
        name: 'Analytics Dashboard',
        category: 'dashboard',
        description: 'Modern analytics dashboard with charts, metrics, and data visualization',
        tags: ['dashboard', 'analytics', 'charts', 'metrics', 'data'],
        preview: '/templates/previews/dashboard.png',
        complexity: 'medium',
        estimatedTime: '10 minutes'
      },
      files: [
        {
          path: 'src/components/Dashboard.tsx',
          language: 'typescript',
          content: `import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, ArrowUpRight } from 'lucide-react'

export function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d')

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Active Users',
      value: '2,350',
      change: '+15.3%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '-2.4%',
      trend: 'down',
      icon: TrendingUp
    },
    {
      title: 'Page Views',
      value: '12,234',
      change: '+8.2%',
      trend: 'up',
      icon: Activity
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your business performance and key metrics</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className="flex items-center text-xs text-gray-600">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {metric.change}
                    </span>
                    <span className="ml-1">from last period</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Chart component would go here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Daily active users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Chart component would go here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New user registered', time: '2 minutes ago', type: 'success' },
                { action: 'Payment processed', time: '5 minutes ago', type: 'info' },
                { action: 'System backup completed', time: '1 hour ago', type: 'info' },
                { action: 'API rate limit exceeded', time: '2 hours ago', type: 'warning' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={activity.type === 'success' ? 'default' : activity.type === 'warning' ? 'destructive' : 'secondary'}>
                      {activity.type}
                    </Badge>
                    <span className="text-sm font-medium">{activity.action}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{activity.time}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}`,
          summary: 'Creating a modern analytics dashboard with metrics cards, charts, and activity feed.'
        },
        {
          path: 'src/App.tsx',
          language: 'typescript',
          content: `import { Dashboard } from './components/Dashboard'

export default function App() {
  return <Dashboard />
}`,
          summary: 'Setting up the main application entry point with the dashboard.'
        },
        {
          path: 'package.json',
          language: 'json',
          content: JSON.stringify({
            name: 'analytics-dashboard',
            version: '1.0.0',
            dependencies: {
              'react': '^18.3.1',
              'react-dom': '^18.3.1',
              'lucide-react': '^0.344.0',
              '@radix-ui/react-slot': '^1.0.2',
              'class-variance-authority': '^0.7.0',
              'clsx': '^2.1.0',
              'tailwind-merge': '^2.2.0'
            }
          }, null, 2),
          summary: 'Configuring project dependencies for the analytics dashboard.'
        }
      ]
    },

    // Contact Form Template
    {
      metadata: {
        id: 'contact-form',
        name: 'Contact Form',
        category: 'form',
        description: 'Professional contact form with validation and success states',
        tags: ['contact', 'form', 'validation', 'email'],
        preview: '/templates/previews/contact-form.png',
        complexity: 'simple',
        estimatedTime: '5 minutes'
      },
      files: [
        {
          path: 'src/components/ContactForm.tsx',
          language: 'typescript',
          content: `import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
            <p className="text-gray-600">
              Thank you for reaching out. We'll get back to you within 24 hours.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question or want to work together? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">hello@company.com</p>
                <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-500">Mon-Fri 9am-6pm EST</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Visit Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">123 Business St</p>
                <p className="text-gray-600">Suite 100</p>
                <p className="text-gray-600">New York, NY 10001</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Acme Inc."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your project..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}`,
          summary: 'Creating a professional contact form with validation, contact information, and success states.'
        },
        {
          path: 'src/App.tsx',
          language: 'typescript',
          content: `import { ContactForm } from './components/ContactForm'

export default function App() {
  return <ContactForm />
}`,
          summary: 'Setting up the main application entry point with the contact form.'
        },
        {
          path: 'package.json',
          language: 'json',
          content: JSON.stringify({
            name: 'contact-form-app',
            version: '1.0.0',
            dependencies: {
              'react': '^18.3.1',
              'react-dom': '^18.3.1',
              'lucide-react': '^0.344.0',
              '@radix-ui/react-label': '^2.0.2',
              '@radix-ui/react-slot': '^1.0.2',
              'class-variance-authority': '^0.7.0',
              'clsx': '^2.1.0',
              'tailwind-merge': '^2.2.0'
            }
          }, null, 2),
          summary: 'Configuring project dependencies for the contact form.'
        }
      ]
    }
  ];

  static selectTemplate(userPrompt: string): Template | null {
    const promptLower = userPrompt.toLowerCase();

    // Auth patterns
    if (this.matchesPattern(promptLower, ['login', 'sign in', 'signin', 'log in'])) {
      return this.templates[0]; // Login form template
    }

    // Dashboard patterns
    if (this.matchesPattern(promptLower, ['dashboard', 'analytics', 'metrics', 'stats', 'admin panel'])) {
      return this.templates[1]; // Dashboard template
    }

    // Form patterns
    if (this.matchesPattern(promptLower, ['contact form', 'contact us', 'get in touch', 'contact page'])) {
      return this.templates[2]; // Contact form template
    }

    // Landing page patterns
    if (this.matchesPattern(promptLower, ['landing page', 'homepage', 'marketing page', 'saas landing'])) {
      // Add landing page template here when available
      return null;
    }

    return null; // Use AI generation
  }

  private static matchesPattern(prompt: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      const words = pattern.split(' ');
      return words.every(word => prompt.includes(word));
    });
  }

  static getAllTemplates(): TemplateMetadata[] {
    return this.templates.map(t => t.metadata);
  }

  static getTemplateById(id: string): Template | null {
    return this.templates.find(t => t.metadata.id === id) || null;
  }

  static generateThinkingSteps(template: Template): ThinkingStep[] {
    return [
      {
        title: 'Analyzing Request',
        description: 'Recognized pattern matching template library',
        status: 'completed'
      },
      {
        title: 'Selecting Template',
        description: `Found: ${template.metadata.name}`,
        status: 'completed'
      },
      {
        title: 'Customizing',
        description: 'Applying customizations...',
        status: 'completed'
      }
    ];
  }
}

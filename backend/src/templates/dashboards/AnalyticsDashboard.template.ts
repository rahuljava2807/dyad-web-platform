/**
 * Analytics Dashboard Template
 * Modern analytics dashboard with charts, metrics, and data visualization
 */

import { Template } from '../types';

export const AnalyticsDashboardTemplate: Template = {
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
};

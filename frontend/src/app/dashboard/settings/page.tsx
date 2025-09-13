'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Key,
  Database,
  Zap,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  Save
} from 'lucide-react'

interface YaviSettings {
  apiKey: string
  endpoint: string
  enabled: boolean
  connectedDataSources: string[]
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [yaviSettings, setYaviSettings] = useState<YaviSettings>({
    apiKey: '',
    endpoint: 'https://api.yavi.ai',
    enabled: false,
    connectedDataSources: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/yavi', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setYaviSettings(data.data.settings || yaviSettings)
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/settings/yavi', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(yaviSettings)
      })

      if (response.ok) {
        setSuccess('Settings saved successfully')
        fetchSettings() // Refresh settings
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save settings')
      }
    } catch (err) {
      setError('An error occurred while saving settings')
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    if (!yaviSettings.apiKey) {
      setError('Please enter an API key first')
      return
    }

    setTesting(true)
    setTestResult(null)
    setError('')

    try {
      const response = await fetch('/api/settings/yavi/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          apiKey: yaviSettings.apiKey,
          endpoint: yaviSettings.endpoint
        })
      })

      if (response.ok) {
        setTestResult('success')
        const data = await response.json()
        setYaviSettings(prev => ({
          ...prev,
          connectedDataSources: data.dataSources || []
        }))
      } else {
        setTestResult('error')
        const errorData = await response.json()
        setError(errorData.error || 'Connection test failed')
      }
    } catch (err) {
      setTestResult('error')
      setError('Failed to test connection')
    } finally {
      setTesting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" asChild className="mr-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
              <p className="text-slate-600">Configure your Yavi.ai integration and platform settings</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Messages */}
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
              {success}
            </div>
          )}

          {/* Yavi.ai Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Yavi.ai Integration</CardTitle>
                  <CardDescription>
                    Configure your connection to the Yavi.ai platform for document processing and data integration
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${yaviSettings.enabled && testResult === 'success' ? 'bg-green-100' : 'bg-slate-100'}`}>
                    {yaviSettings.enabled && testResult === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">
                      {yaviSettings.enabled && testResult === 'success' ? 'Connected' : 'Not Connected'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {yaviSettings.enabled && testResult === 'success'
                        ? 'Your Yavi.ai integration is active and working'
                        : 'Connect to Yavi.ai to enable document processing and data integration'
                      }
                    </p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="https://yavi.ai/dashboard/api-keys" className="flex items-center gap-2">
                    Get API Key <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* API Configuration */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-2">
                    API Key *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      id="apiKey"
                      type="password"
                      value={yaviSettings.apiKey}
                      onChange={(e) => setYaviSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your Yavi.ai API key"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Get your API key from the{' '}
                    <Link href="https://yavi.ai/dashboard" className="text-blue-600 hover:text-blue-500">
                      Yavi.ai dashboard
                    </Link>
                  </p>
                </div>

                <div>
                  <label htmlFor="endpoint" className="block text-sm font-medium text-slate-700 mb-2">
                    API Endpoint
                  </label>
                  <div className="relative">
                    <Database className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      id="endpoint"
                      type="url"
                      value={yaviSettings.endpoint}
                      onChange={(e) => setYaviSettings(prev => ({ ...prev, endpoint: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://api.yavi.ai"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="enabled"
                    type="checkbox"
                    checked={yaviSettings.enabled}
                    onChange={(e) => setYaviSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="enabled" className="text-sm text-slate-700">
                    Enable Yavi.ai integration
                  </label>
                </div>
              </div>

              {/* Test Connection */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={testConnection}
                  disabled={testing || !yaviSettings.apiKey}
                  variant="outline"
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>

                {testResult === 'success' && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                )}

                {testResult === 'error' && (
                  <Badge variant="destructive">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Failed
                  </Badge>
                )}
              </div>

              {/* Connected Data Sources */}
              {yaviSettings.connectedDataSources.length > 0 && (
                <div>
                  <h4 className="font-medium text-slate-800 mb-3">Connected Data Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {yaviSettings.connectedDataSources.map((source, index) => (
                      <Badge key={index} variant="secondary">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded">
                  <Settings className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>
                    Configure your account and platform preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded">
                  <div>
                    <h4 className="font-medium text-slate-800">Account Information</h4>
                    <p className="text-sm text-slate-600">
                      {session?.user?.email}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded">
                  <div>
                    <h4 className="font-medium text-slate-800">Project Templates</h4>
                    <p className="text-sm text-slate-600">
                      Manage your custom project templates
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Templates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
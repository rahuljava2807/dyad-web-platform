'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Key, Plus, Eye, EyeOff, Check, X, Star } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface APIKey {
  id: string
  provider: 'openai' | 'anthropic' | 'google' | 'azure'
  name: string
  apiKey: string
  isDefault: boolean
  isValid: boolean
  usageStats?: {
    tokensUsed: number
    tokensRemaining: number
    costIncurred: number
    lastUsed?: Date
  }
  createdAt: Date
  updatedAt: Date
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', description: 'GPT-4, GPT-3.5, DALL-E' },
  { value: 'anthropic', label: 'Anthropic', description: 'Claude 3.5 Sonnet, Haiku' },
  { value: 'google', label: 'Google AI', description: 'Gemini Pro, Gemini Flash' },
  { value: 'azure', label: 'Azure OpenAI', description: 'Enterprise OpenAI models' }
]

export default function APIKeyManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [validating, setValidating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    provider: '',
    name: '',
    apiKey: '',
    isDefault: false
  })
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    loadAPIKeys()
  }, [])

  const loadAPIKeys = async () => {
    try {
      const response = await fetch(`/api/backend/keys`, {
        headers: {
          'user-id': 'local-dev-user'
        }
      })

      if (response.ok) {
        const keys = await response.json()
        setApiKeys(keys)
      } else {
        setError('Failed to load API keys')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.provider || !formData.name || !formData.apiKey) {
      setError('Please fill in all required fields')
      return
    }

    setValidating(true)
    setError(null)

    try {
      const response = await fetch(`/api/backend/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': 'local-dev-user'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newKey = await response.json()
        setApiKeys(prev => [...prev, newKey])
        setFormData({ provider: '', name: '', apiKey: '', isDefault: false })
        setShowAddForm(false)
        setShowApiKey(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save API key')
      }
    } catch (err) {
      setError('Failed to save API key')
    } finally {
      setValidating(false)
    }
  }

  const setDefaultKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/backend/keys/${keyId}/default`, {
        method: 'PUT',
        headers: {
          'user-id': 'local-dev-user'
        }
      })

      if (response.ok) {
        await loadAPIKeys()
      } else {
        setError('Failed to set default API key')
      }
    } catch (err) {
      setError('Failed to set default API key')
    }
  }

  const deleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return

    try {
      const response = await fetch(`/api/backend/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'user-id': 'local-dev-user'
        }
      })

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId))
      } else {
        setError('Failed to delete API key')
      }
    } catch (err) {
      setError('Failed to delete API key')
    }
  }

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(cost)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading API keys...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Management
          </CardTitle>
          <CardDescription>
            Manage your AI provider API keys for secure model access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''} configured
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add API Key
            </Button>
          </div>

          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <Select
                        value={formData.provider}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVIDERS.map(provider => (
                            <SelectItem key={provider.value} value={provider.value}>
                              <div>
                                <div className="font-medium">{provider.label}</div>
                                <div className="text-xs text-gray-500">{provider.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="name">Key Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Production Key, Development Key"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <div className="relative">
                      <Input
                        id="apiKey"
                        type={showApiKey ? 'text' : 'password'}
                        value={formData.apiKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                        placeholder="Enter your API key"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="isDefault">Set as default for this provider</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={validating}>
                      {validating ? 'Validating...' : 'Add API Key'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setFormData({ provider: '', name: '', apiKey: '', isDefault: false })
                        setError(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No API keys configured</p>
                <p className="text-sm">Add your first API key to start generating applications</p>
              </div>
            ) : (
              apiKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{key.name}</h3>
                          {key.isDefault && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Default
                            </Badge>
                          )}
                          <Badge variant={key.isValid ? "default" : "destructive"}>
                            {key.isValid ? (
                              <Check className="w-3 h-3 mr-1" />
                            ) : (
                              <X className="w-3 h-3 mr-1" />
                            )}
                            {key.isValid ? 'Valid' : 'Invalid'}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">{PROVIDERS.find(p => p.value === key.provider)?.label}</span>
                          <span className="ml-2">••••••••</span>
                        </div>

                        {key.usageStats && (
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                            <div>
                              <span className="font-medium">Tokens Used:</span> {key.usageStats.tokensUsed.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Cost:</span> {formatCost(key.usageStats.costIncurred)}
                            </div>
                            {key.usageStats.lastUsed && (
                              <div className="col-span-2">
                                <span className="font-medium">Last Used:</span> {new Date(key.usageStats.lastUsed).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!key.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDefaultKey(key.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteKey(key.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
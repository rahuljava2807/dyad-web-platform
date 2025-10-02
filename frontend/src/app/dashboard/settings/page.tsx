'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Key, User, Bell, Shield, Zap } from 'lucide-react'
import APIKeyManager from '@/components/Settings/APIKeyManager'

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your account and application preferences</p>
        </div>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="yavi-integration" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Yavi Integration
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <APIKeyManager />
        </TabsContent>

        <TabsContent value="yavi-integration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Yavi.ai Integration
              </CardTitle>
              <CardDescription>
                Configure your Yavi.ai connection for enhanced AI capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Coming Soon</h3>
                  <p className="text-gray-600">
                    Advanced Yavi.ai integration features including:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                    <li>Document processing and analysis</li>
                    <li>Data source connections</li>
                    <li>Custom AI workflow templates</li>
                    <li>Real-time collaboration features</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Development User</h3>
                  <p className="text-gray-600">Email: developer@nimbusnext.com</p>
                  <p className="text-gray-600">Role: Local Development</p>
                </div>
                <p className="text-sm text-gray-500">
                  Profile management will be available when authentication is configured.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage security preferences and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">API Key Security</h3>
                  <p className="text-gray-600 mb-3">
                    Your API keys are encrypted using AES-256-GCM encryption and stored securely.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li>Keys are validated before storage</li>
                    <li>Encryption keys are environment-specific</li>
                    <li>Usage tracking for monitoring</li>
                    <li>Automatic key rotation (coming soon)</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Development Mode</h3>
                  <p className="text-gray-600 text-sm">
                    Currently running in local development mode with authentication bypass enabled.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
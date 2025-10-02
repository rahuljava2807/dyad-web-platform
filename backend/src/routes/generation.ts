import express, { Request, Response } from 'express';
import { aiService } from '../services/ai';

const router = express.Router();

/**
 * Validate API Key
 * POST /api/validate-key
 */
router.post('/validate-key', async (req: Request, res: Response) => {
  const { provider, key } = req.body;

  if (!provider || !key) {
    return res.status(400).json({
      error: 'Provider and key are required'
    });
  }

  try {
    // Validate provider key
    const isValid = await validateProviderKey(provider, key);

    res.json({ valid: isValid });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Failed to validate API key' });
  }
});

/**
 * Generate Application with REAL AI
 * POST /api/generate
 */
router.post('/generate', async (req: Request, res: Response) => {
  const { prompt, context, userId, provider } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log('🚀 Generating with enhanced AI prompts...');

    // Use the REAL AI service with enhanced prompts
    const result = await aiService.generateCode({
      prompt,
      context: context || {
        framework: 'react',
        language: 'typescript',
      },
      userId: userId || 'anonymous',
      provider: provider || 'openai',
    });

    console.log(`✅ Generated ${result.files.length} files`);

    // Return the generated code
    res.json({
      code: result.code,
      explanation: result.explanation,
      files: result.files,
      dependencies: result.dependencies,
      instructions: result.instructions,
    });
  } catch (error) {
    console.error('❌ Generation error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate application'
    });
  }
});

/**
 * Test Yavi.ai Connection
 * GET /api/yavi/test
 */
router.get('/yavi/test', async (req: Request, res: Response) => {
  try {
    const yaviApiKey = process.env.YAVI_API_KEY;

    if (!yaviApiKey) {
      return res.status(500).json({
        connected: false,
        error: 'Yavi API key not configured'
      });
    }

    // Test connection to Yavi.ai
    const response = await fetch('https://api.yavi.ai/health', {
      headers: {
        'Authorization': `Bearer ${yaviApiKey}`
      }
    });

    res.json({
      connected: response.ok,
      status: response.status
    });
  } catch (error) {
    res.json({
      connected: false,
      error: 'Failed to connect to Yavi.ai'
    });
  }
});

/**
 * Helper function to validate provider API keys
 */
async function validateProviderKey(provider: string, key: string): Promise<boolean> {
  try {
    switch (provider) {
      case 'openai':
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${key}` }
        });
        return openaiResponse.ok;

      case 'anthropic':
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        return anthropicResponse.ok || anthropicResponse.status === 400; // 400 is ok, just invalid request

      case 'google':
        // Google AI validation
        return key.length > 20; // Basic validation

      case 'azure':
        // Azure OpenAI validation
        return key.length > 20; // Basic validation

      default:
        return false;
    }
  } catch (error) {
    console.error('Key validation error:', error);
    return false;
  }
}

/**
 * Helper function to generate application files
 */
async function generateApplicationFiles(
  prompt: string,
  settings: any
): Promise<Array<{ path: string; content: string; language: string }>> {
  const { selectedIndustry, useYaviContext } = settings;

  // In production, this would call an AI API to generate the files
  // For now, return template files

  const files = [
    {
      path: '/src/app/page.tsx',
      content: generateMainPage(prompt, selectedIndustry),
      language: 'typescript'
    },
    {
      path: '/src/components/Dashboard.tsx',
      content: generateDashboardComponent(selectedIndustry),
      language: 'typescript'
    },
    {
      path: '/package.json',
      content: generatePackageJson(selectedIndustry),
      language: 'json'
    },
    {
      path: '/README.md',
      content: generateReadme(prompt, selectedIndustry, useYaviContext),
      language: 'markdown'
    },
    {
      path: '/tailwind.config.ts',
      content: generateTailwindConfig(),
      language: 'typescript'
    }
  ];

  return files;
}

function generateMainPage(prompt: string, industry: string): string {
  return `'use client';

import React from 'react';
import { Dashboard } from '@/components/Dashboard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ${industry ? industry.charAt(0).toUpperCase() + industry.slice(1) : 'Application'} Dashboard
          </h1>
          <p className="text-gray-600">
            ${prompt}
          </p>
        </header>

        <Dashboard />
      </div>
    </div>
  );
}`;
}

function generateDashboardComponent(industry: string): string {
  return `'use client';

import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p className="text-gray-600">
          This is a ${industry || 'custom'} application powered by Yavi.ai
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-2">Documents</h2>
        <p className="text-gray-600">
          Manage and analyze your documents with AI
        </p>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-2">Analytics</h2>
        <p className="text-gray-600">
          View insights and trends from your data
        </p>
      </div>
    </div>
  );
};`;
}

function generatePackageJson(industry: string): string {
  return JSON.stringify({
    name: `${industry || 'yavi'}-application`,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint'
    },
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      next: '^14.2.15',
      'tailwindcss': '^3.4.15'
    }
  }, null, 2);
}

function generateReadme(prompt: string, industry: string, useYavi: boolean): string {
  return `# ${industry ? industry.charAt(0).toUpperCase() + industry.slice(1) : 'Generated'} Application

## Description
${prompt}

## Features
${useYavi ? '- Document intelligence powered by Yavi.ai\n' : ''}- Modern React/Next.js architecture
- Tailwind CSS styling
- TypeScript support
- Responsive design

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Generated by Yavi Studio
This application was generated by Yavi Studio, powered by Nimbusnext Inc.
`;
}

function generateTailwindConfig(): string {
  return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config`;
}

export default router;

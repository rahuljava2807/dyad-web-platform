import express, { Request, Response } from 'express';
import { aiService } from '../services/ai';
import { TemplateMatcher } from '../services/templateMatcher';

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
    // Step 1: Check for template match (DISABLED FOR PHASE 1 TESTING)
    console.log('🔍 Skipping template match - testing AI generation with inline components...');
    const template = null; // Temporarily disabled: TemplateMatcher.selectTemplate(prompt);

    if (false && template) { // Template matching disabled
      console.log(`✨ Template matched: ${template.metadata.name} (${template.metadata.id})`);
      console.log(`📦 Returning ${template.files.length} pre-built files`);

      // Add file summaries to template files
      const filesWithSummaries = template.files.map(file => ({
        ...file,
        summary: generateFileSummary(file.path, template.metadata.name)
      }));

      // Return template files with thinking steps and summaries
      return res.json({
        files: filesWithSummaries,
        source: 'template',
        templateId: template.metadata.id,
        templateName: template.metadata.name,
        explanation: `Using pre-built template: ${template.metadata.description}`,
        dependencies: {}, // Templates include package.json with dependencies
        instructions: 'Template loaded successfully',
        thinking: {
          steps: [
            {
              title: 'Analyzing the Request',
              description: `Understanding your ${template.metadata.category} requirements...`,
              timestamp: Date.now() - 2000
            },
            {
              title: 'Selecting Template',
              description: `Matched to ${template.metadata.name} template for instant generation.`,
              timestamp: Date.now() - 1000
            },
            {
              title: 'Loading Components',
              description: `Preparing ${template.files.length} production-ready files.`,
              timestamp: Date.now()
            }
          ],
          summary: `Using the ${template.metadata.name} template to instantly generate a production-ready ${template.metadata.category} application.`
        }
      });
    }

    // Step 2: No template match - use AI generation
    console.log('🚀 No template match, generating with enhanced AI prompts...');

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

    console.log(`✅ Generated ${result.files.length} files with AI`);

    // Return the generated code
    res.json({
      code: result.code,
      explanation: result.explanation,
      files: result.files,
      dependencies: result.dependencies,
      instructions: result.instructions,
      source: 'ai',
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
 * Helper function to generate file summaries
 */
function generateFileSummary(filePath: string, templateName: string): string {
  const fileName = filePath.split('/').pop() || filePath;

  // Generate contextual summaries based on file type and path
  if (fileName === 'package.json') {
    return 'Defining project dependencies and scripts for the application.';
  }

  if (fileName === 'README.md') {
    return 'Providing documentation and setup instructions for the project.';
  }

  if (fileName.includes('tailwind.config')) {
    return 'Configuring Tailwind CSS with custom theme settings.';
  }

  if (filePath.includes('/components/')) {
    const componentName = fileName.replace(/\.(tsx|jsx|ts|js)$/, '');
    return `Creating ${componentName} component with modern UI patterns.`;
  }

  if (filePath.includes('/pages/') || filePath.includes('/app/')) {
    return `Implementing main page component for the ${templateName}.`;
  }

  if (fileName === 'App.tsx' || fileName === 'App.jsx') {
    return `Setting up the main application component with routing and layout.`;
  }

  // Default summary
  return `Implementing ${fileName} for the ${templateName}.`;
}

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

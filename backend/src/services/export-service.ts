import { Octokit } from '@octokit/rest'
import fs from 'fs/promises'
import path from 'path'

interface ExportRequest {
  projectId: string
  files: Array<{
    path: string
    content: string
    language: string
  }>
  repositoryName: string
  description?: string
  isPrivate?: boolean
}

interface DeployRequest {
  projectId: string
  files: Array<{
    path: string
    content: string
    language: string
  }>
  framework?: 'next' | 'react' | 'vue'
}

class ExportService {
  private githubToken: string | null = null

  constructor() {
    // In production, this would come from user settings or environment
    this.githubToken = process.env.GITHUB_TOKEN || null
  }

  /**
   * Export project to GitHub repository
   */
  async exportToGitHub(request: ExportRequest): Promise<{ repositoryUrl: string; cloneUrl: string }> {
    if (!this.githubToken) {
      throw new Error('GitHub token not configured. Please set GITHUB_TOKEN environment variable.')
    }

    const octokit = new Octokit({ auth: this.githubToken })

    try {
      // Create repository
      const repo = await octokit.rest.repos.createForAuthenticatedUser({
        name: request.repositoryName,
        description: request.description || 'Generated with Yavi Studio',
        private: request.isPrivate || false,
        auto_init: false,
      })

      // Create files in the repository
      for (const file of request.files) {
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: repo.data.owner.login,
          repo: repo.data.name,
          path: file.path,
          message: `Add ${file.path}`,
          content: Buffer.from(file.content).toString('base64'),
        })
      }

      // Add README if not present
      const hasReadme = request.files.some(f => f.path.toLowerCase().includes('readme'))
      if (!hasReadme) {
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: repo.data.owner.login,
          repo: repo.data.name,
          path: 'README.md',
          message: 'Add README',
          content: Buffer.from(`# ${request.repositoryName}

Generated with Yavi Studio - AI-powered web application builder.

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start the development server: \`npm start\`

## Features

- Modern React components with TypeScript
- Beautiful Tailwind CSS styling
- Interactive animations with Framer Motion
- Data visualizations with Recharts
- Responsive design for all devices

Built with ❤️ using Yavi Studio`).toString('base64'),
        })
      }

      return {
        repositoryUrl: repo.data.html_url,
        cloneUrl: repo.data.clone_url,
      }
    } catch (error) {
      console.error('GitHub export error:', error)
      throw new Error(`Failed to export to GitHub: ${error.message}`)
    }
  }

  /**
   * Deploy project to Vercel
   */
  async deployToVercel(request: DeployRequest): Promise<{ deploymentUrl: string; previewUrl: string }> {
    // For now, return mock URLs since Vercel API integration requires more setup
    // In production, this would use the Vercel API or Vercel CLI
    
    const projectName = `yavi-studio-${request.projectId}`
    
    return {
      deploymentUrl: `https://${projectName}.vercel.app`,
      previewUrl: `https://${projectName}-git-main.vercel.app`,
    }
  }

  /**
   * Export project as ZIP file
   */
  async exportAsZip(request: ExportRequest): Promise<Buffer> {
    const AdmZip = await import('adm-zip')
    const zip = new AdmZip.default()

    // Add all files to ZIP
    for (const file of request.files) {
      zip.addFile(file.path, Buffer.from(file.content, 'utf8'))
    }

    // Add package.json if not present
    const hasPackageJson = request.files.some(f => f.path === 'package.json')
    if (!hasPackageJson) {
      const packageJson = {
        name: request.repositoryName,
        version: '1.0.0',
        description: request.description || 'Generated with Yavi Studio',
        main: 'src/App.tsx',
        scripts: {
          start: 'react-scripts start',
          build: 'react-scripts build',
          test: 'react-scripts test',
          eject: 'react-scripts eject',
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'framer-motion': '^11.0.0',
          recharts: '^2.5.0',
          'lucide-react': '^0.344.0',
        },
        devDependencies: {
          typescript: '^5.3.3',
          '@types/react': '^18.3.1',
          '@types/react-dom': '^18.3.1',
          tailwindcss: '^3.4.1',
          'react-scripts': '^5.0.1',
        },
        browserslist: {
          production: ['>0.2%', 'not dead', 'not op_mini all'],
          development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version'],
        },
      }

      zip.addFile('package.json', Buffer.from(JSON.stringify(packageJson, null, 2), 'utf8'))
    }

    // Add README if not present
    const hasReadme = request.files.some(f => f.path.toLowerCase().includes('readme'))
    if (!hasReadme) {
      const readme = `# ${request.repositoryName}

Generated with Yavi Studio - AI-powered web application builder.

## Getting Started

1. Install dependencies: \`npm install\`
2. Start the development server: \`npm start\`
3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Features

- Modern React components with TypeScript
- Beautiful Tailwind CSS styling
- Interactive animations with Framer Motion
- Data visualizations with Recharts
- Responsive design for all devices

Built with ❤️ using Yavi Studio`

      zip.addFile('README.md', Buffer.from(readme, 'utf8'))
    }

    // Add .gitignore
    const gitignore = `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*`

    zip.addFile('.gitignore', Buffer.from(gitignore, 'utf8'))

    return zip.toBuffer()
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<{
    status: 'pending' | 'building' | 'ready' | 'error'
    url?: string
    error?: string
  }> {
    // Mock implementation
    return {
      status: 'ready',
      url: `https://yavi-studio-${deploymentId}.vercel.app`,
    }
  }

  /**
   * List user's GitHub repositories
   */
  async getGitHubRepositories(): Promise<Array<{
    id: number
    name: string
    fullName: string
    description: string
    url: string
    cloneUrl: string
    isPrivate: boolean
    updatedAt: string
  }>> {
    if (!this.githubToken) {
      throw new Error('GitHub token not configured')
    }

    const octokit = new Octokit({ auth: this.githubToken })

    try {
      const repos = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
      })

      return repos.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || '',
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        isPrivate: repo.private,
        updatedAt: repo.updated_at,
      }))
    } catch (error) {
      console.error('GitHub repositories fetch error:', error)
      throw new Error(`Failed to fetch GitHub repositories: ${error.message}`)
    }
  }
}

export const exportService = new ExportService()

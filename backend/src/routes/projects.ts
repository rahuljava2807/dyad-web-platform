import { Router } from 'express'
import { z } from 'zod'
import { db } from '../utils/database'
import { logger } from '../utils/logger'

const router = Router()

// For local development without authentication
const DEFAULT_USER_ID = 'cltpqz8mq0000pqz8mq0000pq' // This will be created if it doesn't exist

// Helper function to ensure default user exists for local development
async function ensureDefaultUser(): Promise<void> {
  try {
    const user = await db.user.findUnique({
      where: { id: DEFAULT_USER_ID }
    })

    if (!user) {
      await db.user.create({
        data: {
          id: DEFAULT_USER_ID,
          email: 'developer@nimbusnext.com',
          name: 'Local Development User',
          provider: 'local',
          emailVerified: new Date(),
        }
      })
      logger.info('Created default user for local development')
    }
  } catch (error) {
    logger.warn('Failed to ensure default user exists:', error)
  }
}

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  framework: z.string().optional(),
  template: z.string().optional(),
  organizationId: z.string().optional()
})

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  framework: z.string().optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
  settings: z.record(z.any()).optional()
})

const createFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  mimeType: z.string().optional()
})

/**
 * @route   GET /api/projects
 * @desc    Get user's projects
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    await ensureDefaultUser()
    const userId = DEFAULT_USER_ID
    const { status = 'active', limit = '20', offset = '0' } = req.query

    const projects = await db.project.findMany({
      where: {
        ownerId: userId,
        status: status as string
      },
      include: {
        _count: {
          select: {
            files: true,
            aiGenerations: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    res.json({
      success: true,
      data: {
        projects: projects.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          framework: project.framework,
          template: project.template,
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          fileCount: project._count.files,
          aiGenerationCount: project._count.aiGenerations
        }))
      }
    })
  } catch (error) {
    logger.error('Get projects error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    })
  }
})

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    await ensureDefaultUser()
    const userId = DEFAULT_USER_ID
    const projectData = createProjectSchema.parse(req.body)

    const project = await db.project.create({
      data: {
        ...projectData,
        ownerId: userId
      },
      include: {
        _count: {
          select: {
            files: true,
            aiGenerations: true
          }
        }
      }
    })

    // Create initial project structure if template is provided
    if (projectData.template) {
      await createInitialProjectStructure(project.id, projectData.template)
    }

    logger.info('Project created successfully', {
      projectId: project.id,
      userId,
      name: project.name
    })

    res.status(201).json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          framework: project.framework,
          template: project.template,
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          fileCount: project._count.files,
          aiGenerationCount: project._count.aiGenerations
        }
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    logger.error('Create project error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    })
  }
})

/**
 * @route   GET /api/projects/:id
 * @desc    Get a specific project
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID
    const projectId = req.params.id

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId
      },
      include: {
        files: {
          orderBy: {
            path: 'asc'
          }
        },
        _count: {
          select: {
            aiGenerations: true
          }
        }
      }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          framework: project.framework,
          template: project.template,
          status: project.status,
          settings: project.settings,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          files: project.files,
          aiGenerationCount: project._count.aiGenerations
        }
      }
    })
  } catch (error) {
    logger.error('Get project error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    })
  }
})

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID
    const projectId = req.params.id
    const updateData = updateProjectSchema.parse(req.body)

    // Check if project exists and user owns it
    const existingProject = await db.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId
      }
    })

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    const project = await db.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        _count: {
          select: {
            files: true,
            aiGenerations: true
          }
        }
      }
    })

    logger.info('Project updated successfully', {
      projectId,
      userId,
      changes: Object.keys(updateData)
    })

    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          framework: project.framework,
          template: project.template,
          status: project.status,
          settings: project.settings,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          fileCount: project._count.files,
          aiGenerationCount: project._count.aiGenerations
        }
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    logger.error('Update project error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    })
  }
})

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID
    const projectId = req.params.id

    // Check if project exists and user owns it
    const existingProject = await db.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId
      }
    })

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    // Soft delete by updating status
    await db.project.update({
      where: { id: projectId },
      data: { status: 'deleted' }
    })

    logger.info('Project deleted successfully', {
      projectId,
      userId
    })

    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    logger.error('Delete project error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    })
  }
})

/**
 * @route   GET /api/projects/:id/files
 * @desc    Get project files
 * @access  Private
 */
router.get('/:id/files', async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID
    const projectId = req.params.id

    // Check if project exists and user owns it
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId
      }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    const files = await db.projectFile.findMany({
      where: { projectId },
      orderBy: { path: 'asc' }
    })

    res.json({
      success: true,
      data: { files }
    })
  } catch (error) {
    logger.error('Get project files error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project files'
    })
  }
})

/**
 * @route   POST /api/projects/:id/files
 * @desc    Create a new file in project
 * @access  Private
 */
router.post('/:id/files', async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID
    const projectId = req.params.id
    const fileData = createFileSchema.parse(req.body)

    // Check if project exists and user owns it
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId
      }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    // Check if file already exists
    const existingFile = await db.projectFile.findUnique({
      where: {
        projectId_path: {
          projectId,
          path: fileData.path
        }
      }
    })

    if (existingFile) {
      return res.status(400).json({
        success: false,
        error: 'File already exists at this path'
      })
    }

    const file = await db.projectFile.create({
      data: {
        ...fileData,
        projectId,
        size: Buffer.byteLength(fileData.content, 'utf8'),
        hash: generateFileHash(fileData.content)
      }
    })

    logger.info('Project file created', {
      projectId,
      userId,
      filePath: file.path
    })

    res.status(201).json({
      success: true,
      data: { file }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    logger.error('Create project file error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create file'
    })
  }
})

/**
 * @route   PUT /api/projects/:id/files/*
 * @desc    Update a file in project
 * @access  Private
 */
router.put('/:id/files/*', async (req, res) => {
  try {
    const userId = DEFAULT_USER_ID
    const projectId = req.params.id
    const filePath = req.params[0] // Capture the rest of the path
    const { content, mimeType } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'File content is required'
      })
    }

    // Check if project exists and user owns it
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId
      }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    const file = await db.projectFile.upsert({
      where: {
        projectId_path: {
          projectId,
          path: filePath
        }
      },
      update: {
        content,
        mimeType,
        size: Buffer.byteLength(content, 'utf8'),
        hash: generateFileHash(content)
      },
      create: {
        projectId,
        path: filePath,
        content,
        mimeType,
        size: Buffer.byteLength(content, 'utf8'),
        hash: generateFileHash(content)
      }
    })

    logger.info('Project file updated', {
      projectId,
      userId,
      filePath
    })

    res.json({
      success: true,
      data: { file }
    })
  } catch (error) {
    logger.error('Update project file error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update file'
    })
  }
})

// Helper function to generate file hash
function generateFileHash(content: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(content).digest('hex')
}

// Helper function to create initial project structure
async function createInitialProjectStructure(projectId: string, template: string): Promise<void> {
  const templates = {
    'nextjs': [
      { path: 'package.json', content: '{\n  "name": "my-app",\n  "private": true\n}' },
      { path: 'pages/index.js', content: 'export default function Home() {\n  return <h1>Hello World</h1>\n}' }
    ],
    'react': [
      { path: 'package.json', content: '{\n  "name": "my-react-app",\n  "private": true\n}' },
      { path: 'src/App.js', content: 'function App() {\n  return <h1>Hello World</h1>\n}\n\nexport default App' }
    ]
  }

  const templateFiles = templates[template as keyof typeof templates] || []

  for (const file of templateFiles) {
    await db.projectFile.create({
      data: {
        projectId,
        path: file.path,
        content: file.content,
        size: Buffer.byteLength(file.content, 'utf8'),
        hash: generateFileHash(file.content)
      }
    })
  }
}

export default router
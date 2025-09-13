import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test users (without passwords - using provider-based auth)

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nimbusnext.com' },
    update: {},
    create: {
      email: 'admin@nimbusnext.com',
      name: 'Admin User',
      provider: 'local',
      emailVerified: new Date(),
    }
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Developer user
  const devUser = await prisma.user.upsert({
    where: { email: 'developer@nimbusnext.com' },
    update: {},
    create: {
      email: 'developer@nimbusnext.com',
      name: 'Developer User',
      provider: 'local',
      emailVerified: new Date(),
    }
  })

  console.log('✅ Created developer user:', devUser.email)

  // Test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@yavi.ai' },
    update: {},
    create: {
      email: 'test@yavi.ai',
      name: 'Test User',
      provider: 'local',
      emailVerified: new Date(),
    }
  })

  console.log('✅ Created test user:', testUser.email)

  // Create sample projects for developer user
  const sampleProjects = [
    {
      name: 'Invoice Processing System',
      description: 'Automated invoice processing with Yavi.ai integration',
      framework: 'Next.js + Yavi.ai',
      template: 'invoice-processing',
      status: 'active',
      ownerId: devUser.id,
      organizationId: null,
      settings: {
        yaviEnabled: true,
        autoProcess: true,
      }
    },
    {
      name: 'Contract Analysis Platform',
      description: 'AI-powered contract review and risk assessment',
      framework: 'React + Node.js',
      template: 'contract-intelligence',
      status: 'active',
      ownerId: devUser.id,
      organizationId: null,
      settings: {
        yaviEnabled: true,
        extractClauses: true,
      }
    },
    {
      name: 'Document Knowledge Base',
      description: 'Semantic search across enterprise documents',
      framework: 'Next.js + AI',
      template: 'knowledge-platform',
      status: 'active',
      ownerId: devUser.id,
      organizationId: null,
      settings: {
        yaviEnabled: true,
        semanticSearch: true,
      }
    }
  ]

  for (const project of sampleProjects) {
    const createdProject = await prisma.project.create({
      data: project
    })

    // Add sample files to each project
    await prisma.projectFile.create({
      data: {
        projectId: createdProject.id,
        path: 'README.md',
        content: `# ${createdProject.name}\n\n${createdProject.description}\n\n## Getting Started\n\n1. Configure Yavi.ai API key\n2. Set up data sources\n3. Run the application`,
        mimeType: 'text/markdown',
        size: 200,
        hash: Math.random().toString(36).substring(7)
      }
    })

    await prisma.projectFile.create({
      data: {
        projectId: createdProject.id,
        path: 'src/index.js',
        content: `// ${createdProject.name} - Main Entry Point\n\nimport { YaviClient } from '@yavi/sdk';\n\nconst client = new YaviClient({\n  apiKey: process.env.YAVI_API_KEY\n});\n\nexport default client;`,
        mimeType: 'application/javascript',
        size: 150,
        hash: Math.random().toString(36).substring(7)
      }
    })

    console.log(`✅ Created project: ${createdProject.name}`)
  }

  console.log('\n🎉 Database seeding completed!')
  console.log('\n📝 Test Accounts Created:')
  console.log('================================')
  console.log('For local development, these accounts use mock authentication.')
  console.log('You can sign in with just the email address - no password needed.')
  console.log('')
  console.log('Test Accounts:')
  console.log('  • admin@nimbusnext.com')
  console.log('  • developer@nimbusnext.com (has 3 sample projects)')
  console.log('  • test@yavi.ai')
  console.log('================================\n')
  console.log('Note: In local development mode, authentication is simplified.')
  console.log('Just enter the email address to sign in.\n')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
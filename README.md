# Dyad Web Platform

A cloud-native web platform conversion of Dyad, designed to serve as the horizontal foundation for Yavi.ai's vertical AI document processing capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose

### Local Development

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd dyad-web-platform
npm install
```

2. **Set up environment variables**
```bash
# Copy environment files
cp .env.example .env.local
cp backend/.env.example backend/.env.local
cp frontend/.env.example frontend/.env.local

# Edit the .env files with your configuration
```

3. **Start with Docker Compose (Recommended)**
```bash
docker-compose up -d
```

4. **Or start services individually**
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Terminal 3: Database (if not using Docker)
createdb dyad_platform
npm run db:migrate
```

### Production Deployment

Deploy to Azure using our automated pipeline:

```bash
# Build and deploy
npm run build
npm run deploy:azure

# Or use Docker
docker build -t dyad-web-platform .
docker run -p 3000:3000 dyad-web-platform
```

## 🏗️ Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **UI**: React 19 + TailwindCSS + Radix UI
- **State**: Zustand + TanStack Query
- **Editor**: Monaco Editor
- **Auth**: NextAuth.js with Azure AD

### Backend (Express.js)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT + Azure AD integration
- **AI**: AI SDK with multiple providers
- **Queue**: Bull Queue with Redis
- **Storage**: Azure Blob Storage

### Shared Libraries
- **Types**: Shared TypeScript definitions
- **Utils**: Common utilities and helpers
- **Validation**: Zod schemas
- **Constants**: Shared constants

## 📁 Project Structure

```
dyad-web-platform/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Frontend utilities
│   │   └── services/        # API client services
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Backend utilities
│   ├── prisma/              # Database schema & migrations
│   └── package.json
├── shared/                   # Shared code between frontend/backend
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Shared utilities
│   └── schemas/             # Zod validation schemas
├── docker-compose.yml        # Local development environment
├── Dockerfile               # Production container
└── azure-pipelines.yml     # Azure DevOps CI/CD
```

## 🔧 Key Features

### 🤖 AI App Builder
- Multi-provider AI integration (OpenAI, Anthropic, Google, Azure)
- Real-time code generation and preview
- Template-based app scaffolding
- Intelligent code suggestions

### 👥 Collaboration
- Real-time collaborative editing
- Project sharing and permissions
- Team workspaces
- Comment system

### 🔐 Enterprise Security
- Azure AD/SSO integration
- Role-based access control
- Audit logging
- SOC2 compliance ready

### 📊 Analytics & Monitoring
- Usage analytics dashboard
- Performance monitoring
- Cost tracking per user/team
- Error reporting and alerting

### 🔗 Yavi.ai Integration
- Document processing workflows
- 60+ data connector access
- RAG-powered knowledge bases
- Smart context understanding

## 🌐 API Documentation

### Authentication
```typescript
// Login with Azure AD
POST /api/auth/login
{
  "provider": "azure",
  "redirectUrl": "https://app.dyad.ai/dashboard"
}

// Get current user
GET /api/auth/user
Authorization: Bearer <jwt-token>
```

### Projects
```typescript
// Create new project
POST /api/projects
{
  "name": "My AI App",
  "template": "nextjs-ai-chat",
  "description": "AI-powered customer support"
}

// Get project files
GET /api/projects/:id/files

// Update project file
PUT /api/projects/:id/files/*path
{
  "content": "// Updated file content",
  "message": "Updated component logic"
}
```

### AI Generation
```typescript
// Generate code
POST /api/ai/generate
{
  "prompt": "Create a login form with validation",
  "context": {
    "projectId": "proj_123",
    "framework": "react",
    "files": ["src/components/ui/button.tsx"]
  },
  "provider": "gpt-4"
}

// Chat with AI
POST /api/ai/chat
{
  "messages": [
    {"role": "user", "content": "Add error handling to this function"}
  ],
  "projectId": "proj_123"
}
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:watch   # Watch mode
```

### Backend Testing
```bash
cd backend
npm run test         # Run unit tests
npm run test:integration # Integration tests
npm run test:load    # Load testing
```

### Full Test Suite
```bash
npm run test:all     # Run all tests
npm run test:ci      # CI pipeline tests
```

## 🚀 Deployment

### Azure Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Scale services
npm run scale:web -- 5    # Scale to 5 web instances
npm run scale:worker -- 3 # Scale to 3 worker instances
```

### Environment Configuration
```bash
# Production environment variables
NEXT_PUBLIC_API_URL=https://api.dyad.ai
DATABASE_URL=postgresql://user:pass@db.azure.com/dyad
REDIS_URL=redis://cache.azure.com:6380
AZURE_STORAGE_ACCOUNT=dyadplatform
YAVI_API_KEY=yavi_prod_key_here
```

## 📈 Performance Targets

- **Page Load**: < 2 seconds (LCP)
- **API Response**: < 100ms (95th percentile)
- **AI Generation**: < 5 seconds (average)
- **Uptime**: 99.9% availability
- **Concurrent Users**: 10,000+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@dyad.ai
- 💬 Discord: [Join our community](https://discord.gg/dyad)
- 📚 Documentation: [docs.dyad.ai](https://docs.dyad.ai)
- 🐛 Issues: [GitHub Issues](https://github.com/dyad-sh/dyad-web-platform/issues)

---

**Built with ❤️ for the future of AI-powered development**
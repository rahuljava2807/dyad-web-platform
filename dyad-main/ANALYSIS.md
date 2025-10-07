# Dyad Codebase Analysis

## Technology Stack
- **Frontend Framework**: React 19 with TypeScript
- **Desktop Framework**: Electron 35.1.4 (Cross-platform desktop app)
- **Build Tools**: Vite with Electron Forge for packaging
- **UI Components**: Radix UI + TailwindCSS + Lucide React icons
- **State Management**: Jotai (atomic state management)
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Database**: SQLite with Drizzle ORM
- **AI Integration**: AI SDK with multiple providers (OpenAI, Anthropic, Google, Azure, etc.)
- **Code Editor**: Monaco Editor (VS Code editor component)
- **Testing**: Playwright for E2E, Vitest for unit tests
- **Linting/Formatting**: OxLint + Prettier + Biome

## Key Components

### Core Architecture
1. **Electron Main Process** (`src/main.ts`) - Desktop app lifecycle management
2. **React Renderer** (`src/renderer.tsx`) - Main UI application
3. **IPC Layer** (`src/ipc/`) - Communication between main and renderer processes
4. **Database Layer** (`src/db/`) - SQLite with Drizzle ORM
5. **AI Engine** (`src/lib/`, `src/hooks/`) - Multi-provider AI integration

### Primary Features
1. **AI App Builder** - Create applications using AI prompts
2. **Code Editor** - Monaco-based code editing with syntax highlighting
3. **Preview System** - Live preview of generated applications
4. **Project Management** - Local project storage and management
5. **AI Chat Interface** - Interactive AI conversation for app building
6. **Template System** - Pre-built app templates and scaffolding
7. **Multi-Provider AI** - Support for 10+ AI providers (OpenAI, Claude, etc.)

### Key File Structure
```
src/
├── components/          # React UI components (60+ files)
│   ├── chat/           # AI chat interface components
│   ├── editor/         # Code editor components
│   ├── preview/        # App preview components
│   └── ui/             # Shared UI components
├── pages/              # Main application pages/routes
├── hooks/              # React custom hooks (38 files)
├── lib/                # Shared utilities and AI services
├── db/                 # Database schemas and migrations
├── ipc/                # Electron IPC handlers
└── atoms/              # Jotai state atoms
```

## Local Dependencies & Conversion Requirements

### High Complexity (Major Refactoring Required)
1. **Electron Framework** - Complete removal, replace with web server
2. **Local SQLite Database** - Replace with cloud database (PostgreSQL/MongoDB)
3. **File System Access** - Replace with cloud storage (Azure Blob/S3)
4. **IPC Communication** - Replace with REST/WebSocket APIs
5. **Desktop-specific Features** - Remove OS integrations, protocol handlers

### Medium Complexity (Significant Changes)
1. **Authentication System** - Currently local-only, needs OAuth/SSO
2. **Project Storage** - Local file system → Cloud-based projects
3. **Monaco Editor Integration** - Web version has different capabilities
4. **AI Provider Management** - API key handling for multi-tenant
5. **Real-time Updates** - WebSocket implementation for collaboration

### Low Complexity (Minimal Changes)
1. **React Components** - Most UI can be reused with minor modifications
2. **TailwindCSS Styling** - Fully compatible with web
3. **AI SDK Integration** - Already web-compatible
4. **State Management (Jotai)** - Web compatible
5. **Utilities & Helpers** - Most can be reused

## Architecture Conversion Strategy

### Database Migration
- **Current**: Local SQLite with Drizzle ORM
- **Target**: PostgreSQL on Azure with Drizzle ORM (minimal schema changes)
- **Migration Path**: Export existing schemas, adapt for cloud deployment

### Authentication & User Management
- **Current**: Local user settings and preferences
- **Target**: Azure AD/OAuth integration with user management
- **New Features**: Multi-tenant support, team collaboration, role-based access

### AI Provider Integration
- **Current**: Direct API key usage from local storage
- **Target**: Centralized API key management with usage tracking
- **Enhancement**: Per-user quotas, cost tracking, usage analytics

### File & Project Management
- **Current**: Local file system with project folders
- **Target**: Cloud-based project storage with version control
- **Enhancement**: Real-time collaboration, sharing, backup/restore

## Yavi.ai Integration Points

### Document Processing Pipeline
1. **Document Upload** - Integrate with Yavi's 60+ data connectors
2. **RAG Integration** - Connect generated apps to knowledge bases
3. **Smart Context** - Use Yavi's document understanding for better prompts
4. **Template Enhancement** - AI-powered template suggestions based on documents

### Workflow Integration
1. **Process Automation** - Connect apps to Yavi's workflow engine
2. **Data Enrichment** - Use Yavi's AI to enhance app data
3. **Compliance Tools** - Integrate document compliance features
4. **Analytics Integration** - Connect app usage to document insights

## Technical Debt & Modernization

### Current Strengths to Preserve
1. **Clean Component Architecture** - Well-structured React components
2. **Type Safety** - Comprehensive TypeScript usage
3. **Modern Tooling** - Up-to-date build pipeline and dependencies
4. **AI Integration** - Robust multi-provider AI handling
5. **User Experience** - Polished desktop app experience

### Areas for Web Enhancement
1. **Performance Optimization** - Bundle splitting, lazy loading
2. **Progressive Web App** - Offline capabilities, installation
3. **Collaborative Features** - Real-time editing, sharing, comments
4. **Enterprise Features** - SSO, audit logs, compliance
5. **Scalability** - Multi-tenant architecture, load balancing

## Development Timeline Estimate

### Phase 1: Core Web Application (4-6 weeks)
- Set up Next.js/React web application
- Implement authentication and user management
- Create cloud database schema and migrations
- Build basic project management system

### Phase 2: Feature Migration (6-8 weeks)
- Port AI chat interface and editor components
- Implement cloud file storage and project sync
- Integrate multi-provider AI system
- Build preview and deployment system

### Phase 3: Yavi Integration (3-4 weeks)
- Connect to Yavi.ai APIs and services
- Implement document processing workflows
- Add RAG integration capabilities
- Create unified dashboard experience

### Phase 4: Enterprise Features (4-6 weeks)
- Multi-tenant architecture and isolation
- Advanced collaboration features
- Analytics and usage tracking
- Deployment automation and scaling

## Risk Assessment

### High Risk
- **Data Migration** - Ensuring user projects transfer correctly
- **AI Provider Limits** - Managing API quotas at scale
- **Performance** - Web app may be slower than desktop

### Medium Risk
- **Feature Parity** - Some desktop features may be challenging to replicate
- **User Adoption** - Desktop users may resist web transition
- **Integration Complexity** - Yavi.ai integration points may be complex

### Low Risk
- **UI Components** - Most can be directly ported
- **Core Logic** - Business logic is framework-agnostic
- **Development Tools** - Modern stack is web-friendly

## Success Metrics

### Technical KPIs
- **Performance**: < 2s load time, < 100ms AI response time
- **Uptime**: 99.9% availability
- **Scalability**: Support 10,000+ concurrent users
- **Security**: SOC2 compliance, enterprise-grade security

### Business KPIs
- **User Adoption**: 80% of desktop users migrate within 6 months
- **Feature Usage**: All core features achieve >60% adoption
- **Integration Success**: 50% of users actively use Yavi.ai features
- **Revenue Impact**: 3x increase in enterprise plan adoption

This analysis provides the foundation for transforming Dyad from a local desktop application into a cloud-native web platform that can serve as the horizontal foundation for Yavi.ai's vertical AI document processing capabilities.
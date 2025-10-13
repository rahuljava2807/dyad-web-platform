# Dyad Web Platform - Developer Handover Document

**Version:** 1.0
**Date:** January 2025
**Branch:** feature/sandpack-preview-system
**Status:** Active Development

---

## 📋 Executive Summary

This document provides a comprehensive handover for developers taking over the **Dyad Web Platform** project. Dyad is being transformed from a desktop Electron application into a cloud-native web platform designed to become the horizontal foundation for **Yavi.ai's** vertical AI document processing capabilities.

### Quick Facts
- **Project Name**: Dyad Web Platform (formerly desktop app)
- **Vision**: Dyad-like AI code generation platform with Yavi.ai integration
- **Tech Stack**: Next.js 14, Express.js, PostgreSQL, TypeScript, Sandpack, shadcn/ui
- **Current Phase**: Beta - Sandpack Preview System Implementation
- **Deployment**: Local development (Azure deployment planned)

---

## 🎯 Project Vision & End Goal

### **What We're Building**

A **cloud-native AI-powered application builder** that enables users to:

1. **Generate Production-Ready Code**: Use AI (OpenAI, Anthropic, Google, Azure) to generate complete, working applications from natural language prompts
2. **Live Preview Applications**: Real-time in-browser preview using Sandpack (no deployment needed)
3. **Industry-Specific Templates**: Pre-built templates for Healthcare, Legal, FinTech, E-commerce, SaaS
4. **Yavi.ai Integration**: Leverage Yavi.ai's 60+ data connectors and document processing capabilities
5. **Collaboration Features**: Team workspaces, real-time editing, version control
6. **Enterprise-Grade Security**: Azure AD/SSO, role-based access control, SOC2 compliance

### **Dyad-Like Experience**

The platform aims to replicate and enhance the **Dyad desktop app experience**:
- AI-powered code generation with intelligent context
- Beautiful, production-ready UI components using shadcn/ui
- Real-time preview without deployment
- Multi-file project generation (8-12 files minimum)
- Steve Jobs-inspired UX design philosophy

### **Strategic Goal**

Transform Dyad from a desktop app with 50,000+ users into a **cloud SaaS platform** that:
- Scales to millions of users
- Generates predictable subscription revenue
- Serves as the foundation for Yavi.ai's vertical solutions
- Enables enterprise adoption with collaboration features

---

## 🏗️ Architecture Overview

### **Monorepo Structure**

```
dyad-web-platform/
├── frontend/           # Next.js 14 application
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   │   ├── dashboard/
│   │   │   │   ├── yavi-studio/
│   │   │   │   │   ├── builder-v3/    # ⭐ Main builder interface
│   │   │   │   │   ├── widgets/       # Industry widgets
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── projects/
│   │   │   │   └── settings/
│   │   │   ├── api/                   # Next.js API routes
│   │   │   │   ├── generation/        # AI generation endpoints
│   │   │   │   ├── preview/
│   │   │   │   └── projects/
│   │   │   └── auth/
│   │   ├── components/
│   │   │   ├── Builder/               # ⭐ Core builder components
│   │   │   │   ├── PromptInterface.tsx
│   │   │   │   ├── FileTreeVisualizer.tsx
│   │   │   │   ├── LivePreviewPanel_v2.tsx
│   │   │   │   ├── ApprovalModal.tsx
│   │   │   │   └── ThinkingPanel.tsx
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   └── layouts/
│   │   ├── services/
│   │   │   ├── GenerationService.ts   # Client-side generation logic
│   │   │   └── BundlerService.ts      # esbuild integration
│   │   └── store/                     # Zustand state management
│   └── package.json
│
├── backend/            # Express.js API server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── generation.ts          # ⭐ AI generation routes (SSE streaming)
│   │   │   ├── projects.ts
│   │   │   ├── preview.ts
│   │   │   └── auth.ts
│   │   ├── services/
│   │   │   ├── ai.ts                  # ⭐ Core AI service (OpenAI, Anthropic, etc.)
│   │   │   ├── yavi.ts                # Yavi.ai integration
│   │   │   ├── dependencyValidator.ts # Validates package.json
│   │   │   ├── stylingValidator.ts    # Validates Tailwind usage
│   │   │   └── outputValidator.ts     # Validates generated code
│   │   ├── lib/
│   │   │   ├── industryTemplates.ts   # Industry-specific templates
│   │   │   ├── componentSelector.ts   # shadcn/ui component detection
│   │   │   └── scaffoldBundler.ts     # Bundles UI components
│   │   └── prisma/                    # Database schema
│   └── package.json
│
├── shared/             # Shared types and utilities
│   ├── types/
│   └── utils/
│
├── TECHNICAL_ARCHITECTURE.md      # ⭐ Detailed architecture docs
├── INTEGRATION_GUIDE.md          # Yavi.ai integration guide
├── MIGRATION_PLAN.md             # Desktop to web migration plan
├── LOCAL_SETUP.md                # Local development setup
└── DEVELOPER_HANDOVER.md         # This document
```

### **Tech Stack**

#### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 19 + shadcn/ui (Radix UI + Tailwind)
- **Styling**: Tailwind CSS 3.4
- **Preview**: Sandpack (CodeSandbox's in-browser bundler)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Icons**: Lucide React
- **Animations**: Framer Motion

#### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Cache**: Redis 6+
- **AI SDKs**:
  - @ai-sdk/openai (OpenAI GPT-4)
  - @ai-sdk/anthropic (Claude 3.5)
  - @ai-sdk/google (Gemini)
  - @ai-sdk/azure (Azure OpenAI)
- **Validation**: Zod schemas
- **Logging**: Winston (custom console logging for simplicity)

#### Infrastructure (Planned)
- **Cloud**: Azure (App Service, PostgreSQL, Blob Storage)
- **CDN**: Azure CDN
- **Auth**: NextAuth.js with Azure AD
- **Monitoring**: Application Insights

---

## 🚀 What's Been Built

### **Phase 1-6: Core Implementation (Completed)**

#### ✅ **Phase 1: Real-time SSE Streaming Infrastructure**
- **File**: `backend/src/routes/generation.ts`
- **What it does**: Server-Sent Events (SSE) streaming for real-time file generation
- **Features**:
  - Streams files one-by-one as they're generated
  - Progress tracking (current/total files)
  - Thinking steps visualization
  - Session management with unique IDs

#### ✅ **Phase 2: Real Thinking Display**
- **File**: `frontend/src/components/Builder/ThinkingPanel.tsx`
- **What it does**: Displays AI's reasoning process during generation
- **Features**:
  - Collapsible steps (Analyzing, Planning, Generating)
  - Sub-steps with detailed explanations
  - Timestamp tracking
  - Loading animations

#### ✅ **Phase 3: File-by-File Progress Visualization**
- **File**: `frontend/src/components/Builder/FileTreeVisualizer.tsx`
- **What it does**: Animated file tree showing generation progress
- **Features**:
  - Real-time file additions
  - Animated slide-in effects
  - File type icons (TypeScript, JSON, Markdown)
  - File selection for preview
  - Syntax-highlighted code viewer

#### ✅ **Phase 4: Approval Workflow**
- **File**: `frontend/src/components/Builder/ApprovalModal.tsx`
- **What it does**: Review and approve/reject generated code
- **Features**:
  - Modal dialog with file summary
  - Accept/Reject actions with reasoning
  - File count and dependency overview

#### ✅ **Phase 5: ETA Calculator**
- **Implemented**: Progress tracking in builder-v3/page.tsx
- **What it does**: Estimates time remaining based on progress
- **Features**:
  - Dynamic progress bar
  - Current/Total file counter
  - Percentage completion

#### ✅ **Phase 6: Version History System**
- **Status**: Basic implementation in project store
- **What it does**: Tracks generation versions
- **Next Steps**: Full UI implementation needed

### **AI Code Generation System**

#### **Core AI Service** (`backend/src/services/ai.ts`)

The heart of the platform. Handles all AI interactions:

**Key Features**:
1. **Multi-Provider Support**: OpenAI, Anthropic, Google, Azure with automatic failover
2. **Enhanced Prompts**: 2000+ word system prompts with Steve Jobs design philosophy
3. **Auto-Enforcement**: Retries if < 8 files generated, validates Tailwind CSS usage
4. **Dependency Validation**: Auto-fixes package.json with missing dependencies
5. **Path Alias Conversion**: Converts `@/components/ui/*` to relative paths for Sandpack
6. **Scaffold Integration**: Automatically bundles shadcn/ui components
7. **Quality Validation**: Checks for placeholder text, minimum file sizes, styling quality

**Generation Flow**:
```
User Prompt
    ↓
Enhanced Prompt (2000+ words + context)
    ↓
AI Generation (OpenAI/Anthropic/etc.)
    ↓
Validation Pipeline:
  - File count check (min 8)
  - Tailwind CSS validation
  - Echo detection (not just displaying prompt)
  - Quality checks (file sizes, no placeholders)
  - Dependency validation (auto-fix package.json)
    ↓
Scaffold Integration (add shadcn/ui components)
    ↓
Path Conversion (@/ → relative paths)
    ↓
Return to Frontend
```

**Validation Layers**:
- **outputValidator.ts**: Checks for missing imports, quality issues
- **stylingValidator.ts**: Validates production-ready styling (gradients, shadows, spacing)
- **dependencyValidator.ts**: Auto-fixes missing npm packages
- **previewValidator.ts**: (Optional) Headless browser validation

#### **Industry Templates** (`backend/src/lib/industryTemplates.ts`)

Pre-built templates for instant generation:
- **Healthcare**: Patient Insights Dashboard, Medical Records System
- **Legal**: Contract Analyzer, Case Management
- **FinTech**: Invoice Processor, Financial Dashboard
- **E-commerce**: Product Catalog, Shopping Cart
- **SaaS**: Analytics Dashboard, User Management

#### **Sandpack Preview System** (`frontend/src/components/Builder/LivePreviewPanel_v2.tsx`)

**What it does**: In-browser live preview without deployment

**Features**:
- Real-time file updates as they stream in
- Dependency resolution
- Error boundary with fallback UI
- Multiple device views (Desktop, Tablet, Mobile)
- Refresh/Reset controls

**Challenges Solved**:
1. **Path Aliases**: Sandpack doesn't support TypeScript `tsconfig paths`. Solution: Convert all `@/` imports to relative paths.
2. **Missing Components**: AI forgets to generate shadcn/ui components. Solution: Scaffold bundler automatically detects and includes them.
3. **Dependency Errors**: AI generates code using packages not in package.json. Solution: Auto-fix validator adds missing packages.
4. **Generic Class Names**: AI uses non-Tailwind classes. Solution: Retry with stronger Tailwind enforcement.

---

## 📁 Key Files to Understand

### **Frontend**

1. **`frontend/src/app/dashboard/yavi-studio/builder-v3/page.tsx`**
   - **Role**: Main builder interface (3-panel layout)
   - **Components**: PromptInterface, FileTreeVisualizer, LivePreviewPanel
   - **State**: Manages generation status, files, progress, thinking steps
   - **Lines**: 276

2. **`frontend/src/components/Builder/LivePreviewPanel_v2.tsx`**
   - **Role**: Sandpack integration for live preview
   - **Dependencies**: @codesandbox/sandpack-react
   - **Features**: Device modes, error handling, file watching
   - **Lines**: ~300

3. **`frontend/src/services/GenerationService.ts`**
   - **Role**: Client-side service for AI generation
   - **API**: Connects to `/api/generation/stream` (SSE endpoint)
   - **Events**: Handles thinking, file, progress, complete, error events
   - **Lines**: ~250

4. **`frontend/src/app/api/generation/stream/route.ts`**
   - **Role**: Next.js API route that proxies to backend
   - **Method**: Server-Sent Events (SSE) streaming
   - **Lines**: ~100

### **Backend**

1. **`backend/src/routes/generation.ts`**
   - **Role**: Express route for AI generation
   - **Endpoints**:
     - `POST /api/generate/stream` - SSE streaming generation
     - `POST /api/generate` - Legacy non-streaming
     - `POST /api/validate-key` - Validate API keys
   - **Lines**: 564

2. **`backend/src/services/ai.ts`**
   - **Role**: Core AI service (MOST IMPORTANT FILE)
   - **Methods**:
     - `generateCode()` - Main generation with validation pipeline
     - `chat()` - AI chat interface
     - `analyzeCode()` - Code quality analysis
     - `streamGeneration()` - Streaming generation
   - **Lines**: 1440 (highly complex, well-documented)

3. **`backend/src/lib/industryTemplates.ts`**
   - **Role**: Pre-built templates for instant generation
   - **Templates**: Healthcare, Legal, FinTech, E-commerce, SaaS
   - **Lines**: ~500

4. **`backend/src/lib/scaffoldBundler.ts`**
   - **Role**: Automatically bundles shadcn/ui components
   - **Methods**:
     - `detectUsedComponents()` - Finds component imports
     - `bundleScaffoldComponents()` - Includes component files
   - **Lines**: ~300

5. **`backend/src/services/dependencyValidator.ts`**
   - **Role**: Validates and auto-fixes package.json
   - **Features**: Detects missing packages, adds with correct versions
   - **Lines**: ~200

### **Configuration**

1. **`backend/AI_RULES.md`**
   - **Role**: Externalized AI prompt rules (2000+ words)
   - **Sections**: Architecture, Styling, Components, Validation
   - **Purpose**: Easier prompt maintenance vs hardcoded strings

2. **`backend/prisma/schema.prisma`**
   - **Role**: Database schema definition
   - **Models**: User, Organization, Project, ProjectFile, AIGeneration, Usage
   - **Status**: Basic schema, needs expansion

---

## 🎨 Current Implementation: Yavi Studio Builder v3

### **User Flow**

1. **User enters prompt**: "Create a login application with authentication"
2. **Settings selection**: Industry (optional), AI provider, Yavi context (future)
3. **Click "Generate with AI"**
4. **Thinking Panel appears**: Shows AI reasoning steps
5. **Files stream in one-by-one**: File tree updates with animations
6. **Live preview updates**: Sandpack renders the app in real-time
7. **Approval Modal**: Review generated code
8. **Accept/Reject**: Save to project or regenerate

### **3-Panel Layout**

```
┌──────────────┬──────────────┬──────────────┐
│   Prompt     │  File Tree   │ Live Preview │
│  Interface   │  Visualizer  │    Panel     │
│              │              │              │
│ [Settings]   │  📄 App.tsx  │  [Preview]   │
│ [AI Model]   │  📄 Login... │  [Desktop]   │
│ [Generate]   │  📄 package  │  [Tablet]    │
│              │  📄 README   │  [Mobile]    │
│              │              │              │
└──────────────┴──────────────┴──────────────┘
```

### **Generation States**

```typescript
type GenerationStatus =
  | 'idle'          // Initial state, ready to generate
  | 'generating'    // AI is generating code
  | 'reviewing'     // User reviewing in approval modal
  | 'approved'      // User approved, project saved
```

---

## 🔬 Research & Planning Documents

All strategic research and planning is documented in the project root:

1. **`TECHNICAL_ARCHITECTURE.md`** (946 lines)
   - System architecture diagram
   - Frontend/Backend architecture
   - Database schema
   - AI provider architecture
   - Real-time collaboration design
   - Security architecture
   - Monitoring & observability
   - Deployment architecture
   - Performance optimizations

2. **`INTEGRATION_GUIDE.md`** (1,247 lines)
   - Yavi.ai integration architecture
   - Document processing integration
   - Knowledge base integration
   - Data connector integration (60+ sources)
   - Frontend components for Yavi features
   - AI context enhancement
   - Workflow automation
   - Error handling
   - Testing strategies

3. **`MIGRATION_PLAN.md`** (1,450 lines)
   - Desktop to web migration strategy
   - 4-phase migration plan (12 months)
   - Technical migration architecture
   - Migration bridge components
   - User experience design (migration wizard)
   - Data migration strategy
   - User communication & marketing
   - Success metrics & monitoring
   - Risk mitigation

4. **`LOCAL_SETUP.md`** (303 lines)
   - Quick start guide (5 minutes)
   - Docker Compose setup
   - Environment variables
   - Service URLs
   - Troubleshooting
   - Development workflow

---

## 🚧 Current Problems & Technical Debt

### **Critical Issues**

1. **Sandpack Bundle Size**
   - **Problem**: Large dependency trees (React, Tailwind, shadcn/ui) cause slow initial load
   - **Impact**: 3-5 second delay on first preview
   - **Solution**: Implement code splitting, pre-bundle common dependencies
   - **File**: `frontend/src/components/Builder/LivePreviewPanel_v2.tsx`

2. **AI Hallucination/Echo Detection**
   - **Problem**: AI sometimes echoes prompt instead of building app
   - **Current Solution**: Retry with anti-echo prompt
   - **Issue**: Not 100% reliable, adds generation time
   - **File**: `backend/src/services/ai.ts:631-744`

3. **Dependency Validation Performance**
   - **Problem**: Validating all imports takes 200-500ms
   - **Impact**: Delays generation completion
   - **Solution**: Async validation, don't block response
   - **File**: `backend/src/services/dependencyValidator.ts`

### **Known Bugs**

1. **Path Conversion Edge Cases**
   - **Bug**: Some nested `@/` imports not converted correctly
   - **Symptom**: "Module not found" errors in Sandpack
   - **Workaround**: Manual retry usually works
   - **File**: `backend/src/services/ai.ts:137-251`

2. **Thinking Panel State**
   - **Bug**: Sometimes thinking steps don't update correctly
   - **Symptom**: Stuck on "Analyzing Request" step
   - **Cause**: Race condition in SSE event handling
   - **File**: `frontend/src/app/dashboard/yavi-studio/builder-v3/page.tsx:76-98`

3. **Approval Modal Z-Index**
   - **Bug**: Modal sometimes appears behind other UI elements
   - **Fix**: Add explicit `z-50` or higher
   - **File**: `frontend/src/components/Builder/ApprovalModal.tsx`

### **Missing Features** (Planned but Not Implemented)

1. **Version History UI** (Phase 6)
   - Backend tracking exists in project store
   - Frontend UI not implemented
   - Need: Timeline view, diff viewer, rollback functionality

2. **Real-time Collaboration**
   - Architecture designed (see TECHNICAL_ARCHITECTURE.md)
   - Not implemented: WebSocket server, operational transformation
   - Priority: Medium

3. **Yavi.ai Integration** (Core Feature!)
   - Integration guide complete (INTEGRATION_GUIDE.md)
   - Backend service stub exists (`backend/src/services/yavi.ts`)
   - Not connected: Document processing, knowledge base, data connectors
   - Priority: HIGH - This is the strategic differentiator

4. **Enterprise Features**
   - Team workspaces
   - Role-based access control
   - Audit logging
   - Azure AD/SSO integration
   - Priority: Medium

5. **Production Deployment**
   - Azure infrastructure not set up
   - CI/CD pipeline not configured
   - Environment configuration incomplete
   - Priority: High for beta launch

### **Technical Debt**

1. **Logging System**
   - Currently using `console.log` everywhere
   - Should use Winston structured logging
   - Need: Log aggregation, error tracking

2. **Error Handling**
   - Inconsistent error handling across services
   - Need: Global error handler, user-friendly error messages
   - File: `backend/src/middleware/error-handler.ts` (exists but not used everywhere)

3. **Type Safety**
   - Some `any` types in critical paths
   - Need: Strict TypeScript configuration
   - Files: Various service files

4. **Testing**
   - Minimal test coverage
   - No E2E tests for generation flow
   - Need: Jest unit tests, Playwright E2E tests

5. **Code Duplication**
   - Multiple preview panel implementations (v1, v2, Simple, Sandpack, etc.)
   - Should consolidate to single implementation
   - Files: `frontend/src/components/*PreviewPanel*.tsx`

---

## 📊 Recent Git History (Last 30 Commits)

### **Feature Branch: `feature/sandpack-preview-system`**

Recent commits show steady progress on Sandpack preview and validation:

```
1ccee7d feat: Add dependency validator with auto-fix and critical error blocking
6c8d865 revert: Keep backend port as 5001 (correct port from logs)
f9a9f99 fix: Correct backend port from 5001 to 5000 across all API routes
809488b feat: Phase 5 & 6 - ETA Calculator + Version History System
49971fe feat: Phase 4 - Implement Approval Workflow with confirmation modal
bd84ace feat: Phase 3 - Implement File-by-File Progress with animated tree
80afb79 feat: Phase 2 - Implement Real Thinking Display with collapsible steps
456b630 feat(streaming): Phase 1 - Complete real-time SSE streaming infrastructure
47a638e feat(ux): Complete Steve Jobs 3-phase UX redesign with full-screen preview
cbef147 fix: First working Sandpack preview with live login form rendering
ce30143 fix: Add mandatory App.tsx requirement and remove code fence syntax errors
9f6d735 fix: Add complete login app example to ensure proper auth flow generation
9a3a615 feat: Add Dyad-style layout with file sidebar and improved preview
```

**Key Takeaways**:
- Heavy focus on Sandpack preview system (last 10 commits)
- Multiple iterations to get Sandpack working correctly
- Dependency validation system added recently
- 6-phase builder implementation completed

---

## 🔧 Development Workflow

### **Local Setup** (5 minutes)

```bash
# 1. Start Docker services (PostgreSQL, Redis, MinIO)
docker-compose -f docker-compose.local.yml up -d

# 2. Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# 3. Set up database
cd backend
npx prisma generate
npx prisma migrate dev --name init

# 4. Start backend (Terminal 1)
cd backend
npm run dev  # Starts on http://localhost:5001

# 5. Start frontend (Terminal 2)
cd frontend
npm run dev  # Starts on http://localhost:3000

# 6. Open browser
open http://localhost:3000
```

### **Environment Variables**

Create `.env` files based on `.env.example`:

**Backend** (`backend/.env`):
```bash
# Database
DATABASE_URL="postgresql://dyad_user:dyad_local_password@localhost:5433/dyad_platform"

# Redis
REDIS_URL="redis://localhost:6380"

# AI Providers (at least one required)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_GENERATIVE_AI_API_KEY="..."
AZURE_OPENAI_API_KEY="..."

# Yavi.ai (optional, for future integration)
YAVI_API_KEY="..."

# File Storage (MinIO for local dev)
AWS_ENDPOINT="http://localhost:9000"
AWS_ACCESS_KEY_ID="minioadmin"
AWS_SECRET_ACCESS_KEY="minioadmin123"
AWS_BUCKET_NAME="dyad-files"
```

**Frontend** (`frontend/.env.local`):
```bash
# API URL
NEXT_PUBLIC_API_URL="http://localhost:5001"

# NextAuth (for future auth integration)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

### **Debugging**

**Backend Logs**:
```bash
# Real-time logs
cd backend
npm run dev

# Check log files
tail -f logs/combined.log
tail -f logs/error.log
```

**Frontend Debugging**:
- Open Chrome DevTools Console
- Network tab for API calls
- React DevTools for component state

**Sandpack Debugging**:
- Check browser console for Sandpack errors
- Look for "Module not found" or dependency errors
- Use Sandpack's error boundary to catch runtime errors

---

## 🚀 Next Steps for New Developer

### **Immediate Priorities** (Week 1-2)

1. **Get Familiar with Codebase**
   - Clone repo and run local setup (LOCAL_SETUP.md)
   - Generate a few test applications
   - Review TECHNICAL_ARCHITECTURE.md
   - Explore key files listed above

2. **Fix Critical Bugs**
   - Path conversion edge cases (`backend/src/services/ai.ts:137-251`)
   - Thinking panel state race condition (`builder-v3/page.tsx:76-98`)
   - Approval modal z-index issue

3. **Improve Generation Quality**
   - Tune AI prompts for better styling
   - Reduce echo/hallucination failures
   - Improve minimum file count enforcement

### **Short-Term Goals** (Month 1)

1. **Complete Version History UI** (Phase 6)
   - Build timeline component
   - Implement diff viewer
   - Add rollback functionality

2. **Yavi.ai Integration** (CRITICAL)
   - Connect to Yavi.ai API
   - Implement document upload
   - Add knowledge base search
   - Test data connector integration
   - **File**: `backend/src/services/yavi.ts` (currently stub)

3. **Production Deployment**
   - Set up Azure infrastructure
   - Configure CI/CD pipeline
   - Environment management (dev, staging, prod)
   - Monitoring and alerting

4. **Testing**
   - Unit tests for AI service
   - E2E tests for generation flow
   - Sandpack preview tests
   - Target: 70% code coverage

### **Medium-Term Goals** (Months 2-3)

1. **Enterprise Features**
   - Team workspaces
   - Real-time collaboration (WebSocket integration)
   - Role-based access control
   - Azure AD/SSO

2. **Migration Pipeline**
   - Build desktop → web migration tool
   - User communication campaigns
   - Beta user onboarding
   - Follow MIGRATION_PLAN.md

3. **Performance Optimization**
   - Reduce Sandpack bundle size
   - Optimize AI generation time
   - Database query optimization
   - CDN integration for static assets

### **Long-Term Vision** (Months 4-6)

1. **Scale to 10,000+ Users**
   - Load testing
   - Auto-scaling configuration
   - Database sharding (if needed)
   - Cost optimization

2. **Advanced AI Features**
   - Multi-turn conversations
   - Code modification (not just generation)
   - AI-powered debugging
   - Context-aware suggestions

3. **Revenue Generation**
   - Subscription plans (Starter, Pro, Enterprise)
   - Usage-based billing
   - Payment integration (Stripe)
   - Analytics dashboard

---

## 📚 Key Resources

### **Documentation**
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Sandpack Documentation](https://sandpack.codesandbox.io/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic Claude](https://docs.anthropic.com/)

### **Project Docs** (MUST READ)
1. **TECHNICAL_ARCHITECTURE.md** - System design and architecture
2. **INTEGRATION_GUIDE.md** - Yavi.ai integration details
3. **MIGRATION_PLAN.md** - Desktop to web migration strategy
4. **LOCAL_SETUP.md** - Quick start guide

### **External References**
- [Dyad Desktop App](https://dyad.sh) - Reference for UX/features
- [Yavi.ai Platform](https://yavi.ai) - Integration partner

---

## 🤝 Getting Help

### **Code Navigation**

**Q: Where is the AI generation logic?**
A: `backend/src/services/ai.ts` (1440 lines) - Core AI service with validation pipeline

**Q: How does live preview work?**
A: `frontend/src/components/Builder/LivePreviewPanel_v2.tsx` - Sandpack integration

**Q: How are files streamed to the frontend?**
A: `backend/src/routes/generation.ts` (SSE streaming) → `frontend/src/services/GenerationService.ts` (client)

**Q: Where are industry templates defined?**
A: `backend/src/lib/industryTemplates.ts` - Healthcare, Legal, FinTech, etc.

**Q: How does dependency validation work?**
A: `backend/src/services/dependencyValidator.ts` - Auto-fixes package.json

### **Common Issues**

**"Module not found" in Sandpack preview**
- Check path alias conversion (`backend/src/services/ai.ts:137-251`)
- Verify scaffold bundler included UI components
- Look for missing imports in generated files

**AI generating < 8 files**
- Check minimum file enforcement (`backend/src/services/ai.ts:843-962`)
- Review AI prompts in `backend/AI_RULES.md`
- May need to adjust retry logic

**Generation takes too long (>30 seconds)**
- Check AI provider response time
- May be hitting rate limits
- Consider switching to faster model (e.g., GPT-4 → GPT-3.5 Turbo)

---

## 🎯 Project Prompt for Onboarding New Developer

```
You are a senior full-stack developer taking over the Dyad Web Platform project.
This is an AI-powered code generation platform similar to Bolt.new or v0.dev,
built with Next.js 14, Express.js, and Sandpack for live preview.

Your goal is to:
1. Understand the codebase architecture and key components
2. Complete the Yavi.ai integration (CRITICAL - strategic differentiator)
3. Fix critical bugs in path conversion and Sandpack preview
4. Implement missing features (Version History UI, Real-time Collaboration)
5. Prepare for production deployment on Azure

Key files to start with:
- backend/src/services/ai.ts (Core AI generation logic)
- frontend/src/app/dashboard/yavi-studio/builder-v3/page.tsx (Main builder UI)
- TECHNICAL_ARCHITECTURE.md (System design)
- INTEGRATION_GUIDE.md (Yavi.ai integration)

The end goal is a production-ready SaaS platform that generates beautiful,
working applications from natural language prompts, with Yavi.ai's document
processing and data connector capabilities integrated.

This platform will replace the Dyad desktop app (50,000+ users) and become
the horizontal foundation for Yavi.ai's vertical AI solutions.
```

---

## 📞 Contact & Support

**Project Owner**: Rahul Deshmukh (Nimbusnext Inc)
**Company**: Yavi.ai
**Email**: support@yavi.ai
**Repository**: Private (GitHub)

---

## 🏁 Final Notes

This project is at a **critical juncture**. The core AI generation system works well, Sandpack preview is functional, and the UX is solid. The next developer needs to:

1. **Complete Yavi.ai integration** - This is THE strategic differentiator
2. **Fix production blockers** - Path conversion, error handling, testing
3. **Deploy to Azure** - Get it in front of beta users
4. **Build enterprise features** - Collaboration, auth, workspaces

The architecture is sound, the documentation is comprehensive, and the vision is clear. You have everything you need to take this platform to production and beyond.

**Good luck, and feel free to improve this document as you learn more!**

---

**Last Updated**: January 2025
**Document Version**: 1.0
**Branch**: feature/sandpack-preview-system
**Commit**: 1ccee7d

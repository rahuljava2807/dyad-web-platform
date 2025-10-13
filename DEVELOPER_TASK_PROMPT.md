# Developer Task: Fix Preview Functionality & Stabilize Platform

**Priority**: 🔴 CRITICAL
**Estimated Time**: 2-3 weeks
**Status**: MUST FIX BEFORE PRODUCTION

---

## 📋 Your Mission

You are being tasked to **fix the current Sandpack preview functionality** and **stabilize the Dyad Web Platform** for production readiness. The platform generates AI-powered applications from natural language prompts, but the live preview system has critical issues that prevent reliable production deployment.

---

## ⚠️ CRITICAL ISSUES TO FIX

### 1. **Sandpack Preview Stability** (HIGHEST PRIORITY)

**Problem**: Live preview fails intermittently with "Module not found" errors, path resolution issues, and bundle timeouts.

**Location**: `frontend/src/components/Builder/LivePreviewPanel_v2.tsx`

**Known Issues**:
- Path alias conversion (`@/components/ui/*` → relative paths) fails for nested imports
- Scaffold bundler doesn't always detect used components
- Dependency resolution errors (missing packages in package.json)
- Preview crashes on complex applications (>15 files)
- 3-5 second initial bundle time (too slow)

**What to Fix**:
```typescript
// File: backend/src/services/ai.ts:137-251
// Path conversion function has edge cases with nested structures
private convertPathAliases(files: any[]): void {
  // TODO: Fix edge cases:
  // - Nested component imports (e.g., components/forms/LoginForm)
  // - Multiple levels of imports (e.g., @/lib/utils inside @/components/ui/button)
  // - Dynamic imports (e.g., const Component = await import('@/...'))
}
```

**Action Items**:
- [ ] Review and fix path conversion logic in `backend/src/services/ai.ts:137-251`
- [ ] Test with 20+ different application types (auth, dashboard, e-commerce)
- [ ] Implement path conversion validation (verify all @/ converted)
- [ ] Add error recovery: auto-regenerate on path conversion failure
- [ ] Optimize Sandpack bundle size (code splitting, pre-bundling)

---

### 2. **Dependency Validation & Auto-Fix**

**Problem**: AI generates code using packages not declared in package.json, causing runtime errors.

**Location**: `backend/src/services/dependencyValidator.ts`

**Known Issues**:
- Validator takes 200-500ms (blocks generation completion)
- Sometimes misses packages (e.g., @types/* packages)
- Auto-fix doesn't handle version conflicts

**Action Items**:
- [ ] Make dependency validation async (don't block response)
- [ ] Add comprehensive package detection (include @types/*, peer dependencies)
- [ ] Implement smart version resolution (check npm registry for latest compatible)
- [ ] Add validation report to frontend UI (show missing deps before preview)

---

### 3. **AI Generation Quality & Consistency**

**Problem**: AI sometimes generates low-quality code (echo prompt, placeholder text, generic class names).

**Location**: `backend/src/services/ai.ts:373-1315` (generateCode method)

**Known Issues**:
- Echo detection: AI displays prompt instead of building app
- Placeholder text: "TODO: Implementation goes here"
- Generic class names: `className="dashboard"` instead of Tailwind utilities
- Inconsistent file count: Sometimes generates 4 files, should be 8-12

**Action Items**:
- [ ] Improve echo detection algorithm (current: line 631-745)
- [ ] Add placeholder text detection and auto-retry
- [ ] Strengthen Tailwind CSS enforcement (reject generic classes)
- [ ] Implement quality scoring system (reject low-quality outputs)
- [ ] Add retry limits (max 3 attempts) to prevent infinite loops

---

### 4. **Error Handling & User Feedback**

**Problem**: Cryptic error messages, no recovery paths, silent failures.

**Locations**:
- `backend/src/middleware/error-handler.ts` (not used everywhere)
- `frontend/src/app/dashboard/yavi-studio/builder-v3/page.tsx:179-183`

**Action Items**:
- [ ] Implement global error handler (catch all errors)
- [ ] Add user-friendly error messages (not stack traces)
- [ ] Provide recovery actions (retry, regenerate, contact support)
- [ ] Add error logging to Application Insights (when deployed)
- [ ] Show inline errors in UI (don't just console.log)

---

### 5. **Thinking Panel State Management**

**Problem**: Thinking steps don't update correctly, race conditions, stuck states.

**Location**: `frontend/src/app/dashboard/yavi-studio/builder-v3/page.tsx:76-98`

**Known Issues**:
- Race condition in SSE event handling
- Steps sometimes stay at "Analyzing Request"
- Progress bar doesn't sync with file count

**Action Items**:
- [ ] Review SSE event handling in `frontend/src/services/GenerationService.ts`
- [ ] Add proper state locking (prevent race conditions)
- [ ] Implement timeout handling (reset if stuck >30 seconds)
- [ ] Add progress validation (current/total should always be valid)

---

## 📚 REQUIRED READING (BEFORE CODING)

You **MUST** review these documents thoroughly to understand the system:

### 1. **DEVELOPER_HANDOVER.md** (THIS FILE IS CRITICAL!)
**Location**: `/Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/DEVELOPER_HANDOVER.md`

**What it contains**:
- Complete project context and vision
- Architecture overview (monorepo structure)
- What's been built (Phase 1-6 implementation)
- Key files to understand (15+ critical files)
- Current problems and technical debt (this task list!)
- Development workflow and debugging tips

**Time to read**: 30-45 minutes
**Priority**: 🔴 READ FIRST

---

### 2. **TECHNICAL_ARCHITECTURE.md** (946 lines)
**Location**: `/Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/TECHNICAL_ARCHITECTURE.md`

**What it contains**:
- System architecture diagrams
- Frontend/Backend architecture details
- Database schema (PostgreSQL + Prisma)
- AI provider architecture (OpenAI, Anthropic, Google, Azure)
- Real-time collaboration design (WebSockets, Operational Transformation)
- Security architecture (JWT, RBAC, encryption)
- Monitoring & observability (Application Insights, logging)
- Deployment architecture (Azure, Kubernetes, auto-scaling)
- Performance optimizations (caching, CDN, database indexes)

**Relevant sections for this task**:
- Frontend Architecture (lines 129-177) - Monaco Editor, AI Chat Interface
- Backend Architecture (lines 180-253) - AI Generation API, microservices
- AI Provider Architecture (lines 399-468) - Multi-provider strategy, cost optimization

**Time to read**: 1-2 hours
**Priority**: 🟡 READ SECOND

---

### 3. **INTEGRATION_GUIDE.md** (1,247 lines)
**Location**: `/Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/INTEGRATION_GUIDE.md`

**What it contains**:
- Yavi.ai integration architecture (60+ data connectors)
- Document processing integration
- Knowledge base integration
- Data connector setup (SharePoint, Confluence, Slack, etc.)
- AI context enhancement
- Frontend components for Yavi features
- Error handling and monitoring

**Relevant sections for this task**:
- API Integration (lines 69-237) - Authentication, document processing, knowledge base
- AI Context Enhancement (lines 509-585) - Enhanced code generation with context
- Error Handling (lines 909-987) - Robust error handling patterns

**Time to read**: 2-3 hours
**Priority**: 🟢 READ IF WORKING ON YAVI INTEGRATION

---

### 4. **LOCAL_SETUP.md** (303 lines)
**Location**: `/Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/LOCAL_SETUP.md`

**What it contains**:
- 5-minute quick start guide
- Docker Compose setup (PostgreSQL, Redis, MinIO)
- Environment variables configuration
- Service URLs and ports
- Troubleshooting common issues

**Relevant sections for this task**:
- Quick Start (lines 13-86) - Get local environment running
- Troubleshooting (lines 176-238) - Debug common errors

**Time to read**: 15-20 minutes
**Priority**: 🔴 READ FIRST (TO GET STARTED)

---

### 5. **MIGRATION_PLAN.md** (1,450 lines) - OPTIONAL
**Location**: `/Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform/MIGRATION_PLAN.md`

**What it contains**:
- Desktop to web migration strategy
- 4-phase migration plan (12 months)
- Technical migration architecture
- User communication & marketing

**Priority**: 🟢 READ LATER (NOT CRITICAL FOR THIS TASK)

---

## 🗂️ KEY FILE LOCATIONS

### **Backend - Core AI System**

1. **`backend/src/services/ai.ts`** (1,440 lines) ⭐ MOST IMPORTANT FILE
   - Line 137-251: Path alias conversion (FIX THIS!)
   - Line 373-1315: Main generateCode() method
   - Line 631-745: Echo detection and retry logic
   - Line 843-962: Minimum file count enforcement
   - Line 965-1188: Validation pipeline (output, styling, dependency)

2. **`backend/src/routes/generation.ts`** (564 lines)
   - Line 34-185: SSE streaming endpoint (`POST /api/generate/stream`)
   - Line 191-276: Legacy non-streaming endpoint
   - Line 315-346: File summary generator

3. **`backend/src/services/dependencyValidator.ts`** (~200 lines)
   - Dependency validation and auto-fix logic
   - FIX: Make async, improve detection

4. **`backend/src/lib/scaffoldBundler.ts`** (~300 lines)
   - Detects and bundles shadcn/ui components
   - FIX: Improve component detection accuracy

### **Frontend - Builder UI**

1. **`frontend/src/app/dashboard/yavi-studio/builder-v3/page.tsx`** (276 lines)
   - Line 14-276: Main builder interface (3-panel layout)
   - Line 36-186: handleGeneration() - core generation flow
   - Line 76-98: Thinking steps management (FIX RACE CONDITION!)

2. **`frontend/src/components/Builder/LivePreviewPanel_v2.tsx`** (~300 lines)
   - Sandpack integration (FIX BUNDLE SIZE!)
   - Device modes (Desktop, Tablet, Mobile)
   - Error boundary

3. **`frontend/src/services/GenerationService.ts`** (~250 lines)
   - SSE event handling
   - FIX: Improve error handling, add retry logic

4. **`frontend/src/components/Builder/FileTreeVisualizer.tsx`**
   - Animated file tree
   - File selection

5. **`frontend/src/components/Builder/ThinkingPanel.tsx`**
   - Collapsible thinking steps
   - Progress visualization

### **Configuration**

1. **`backend/AI_RULES.md`** (2,000+ lines)
   - Externalized AI prompt rules
   - Styling standards, component patterns

2. **`backend/prisma/schema.prisma`**
   - Database schema (User, Project, ProjectFile, etc.)

---

## 🛠️ DEVELOPMENT WORKFLOW

### **Step 1: Setup Local Environment** (15 minutes)

```bash
# Clone repo (if not already)
cd /Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-web-platform

# Start Docker services
docker-compose -f docker-compose.local.yml up -d

# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Setup database
cd backend
npx prisma generate
npx prisma migrate dev --name init

# Start backend (Terminal 1)
npm run dev  # Runs on http://localhost:5001

# Start frontend (Terminal 2)
cd ../frontend
npm run dev  # Runs on http://localhost:3000
```

### **Step 2: Test Current Functionality** (30 minutes)

1. Open http://localhost:3000
2. Navigate to Dashboard → Yavi Studio → Builder v3
3. Generate 5 different applications:
   - "Create a login application"
   - "Build a dashboard with metrics"
   - "E-commerce product catalog"
   - "Healthcare patient insights"
   - "Financial statement analyzer"
4. Note which ones work, which fail, and error messages

### **Step 3: Reproduce Bugs** (1 hour)

For each known issue listed above:
1. Reproduce the bug consistently
2. Check browser console for errors
3. Check backend logs: `tail -f backend/logs/combined.log`
4. Document reproduction steps
5. Identify root cause

### **Step 4: Fix One Issue at a Time** (1-2 weeks)

**Suggested Order**:
1. ✅ Path conversion edge cases (highest impact)
2. ✅ Thinking panel race conditions
3. ✅ Dependency validation (make async)
4. ✅ AI generation quality (echo detection)
5. ✅ Error handling (global handler)
6. ✅ Sandpack bundle optimization

For each fix:
- Create feature branch: `fix/sandpack-path-conversion`
- Write unit tests (if applicable)
- Test manually with 10+ different prompts
- Commit with descriptive message
- Submit PR for review

---

## 🧪 TESTING REQUIREMENTS

Before marking any issue as "fixed", you MUST:

### **1. Manual Testing** (Required)

Test with these 10 prompts (should ALL work perfectly):

```
1. "Create a login application with signup and forgot password"
2. "Build a dashboard with revenue metrics and charts"
3. "E-commerce product catalog with cart and checkout"
4. "Healthcare patient insights with medical records"
5. "Financial statement analyzer with P&L and balance sheet"
6. "Legal contract analyzer with clause extraction"
7. "Project management dashboard with task tracking"
8. "CRM system with contact management"
9. "Inventory management system"
10. "Blog platform with markdown editor"
```

**Success Criteria**:
- All 10 generate 8-12 files
- Live preview loads within 5 seconds
- No "Module not found" errors
- No console errors
- All interactive features work (buttons, forms, navigation)

### **2. Automated Testing** (Recommended)

```bash
# Backend unit tests
cd backend
npm run test

# Frontend unit tests
cd frontend
npm run test

# E2E tests (if available)
npm run test:e2e
```

Add tests for:
- Path conversion logic (`ai.ts:137-251`)
- Dependency validation (`dependencyValidator.ts`)
- Echo detection (`ai.ts:631-745`)

---

## 📊 SUCCESS METRICS

Your work is successful when:

- [ ] **Zero "Module not found" errors** in 10 test prompts
- [ ] **Preview loads in <5 seconds** (currently 3-5 seconds)
- [ ] **95%+ generation success rate** (currently ~70%)
- [ ] **Zero thinking panel stuck states** (currently happens ~10% of time)
- [ ] **All errors have user-friendly messages** (no stack traces shown to users)
- [ ] **Comprehensive test coverage** (>70% for critical paths)
- [ ] **Documentation updated** (update DEVELOPER_HANDOVER.md with fixes)

---

## 🚨 CRITICAL PATHS TO PRESERVE

**DO NOT BREAK THESE** (they work correctly):

✅ **SSE Streaming**: File-by-file streaming works perfectly
✅ **AI Generation**: Core AI service generates good code
✅ **File Tree Visualization**: Animated file tree is beautiful
✅ **Approval Modal**: Review workflow is solid
✅ **Multi-Provider Support**: OpenAI, Anthropic, Google, Azure all work

If you need to modify these areas, test extensively!

---

## 💡 HELPFUL DEBUGGING TIPS

### **Sandpack Preview Errors**

```javascript
// In browser console:
window.sandpack  // Access Sandpack instance
window.sandpack.files  // See all files in preview
window.sandpack.errors  // See bundler errors
```

### **Path Conversion Issues**

```bash
# Backend logs show path conversion
grep "Path Conversion" backend/logs/combined.log

# Should see:
# "🔧 [Path Conversion] Converting @/ aliases..."
# "🔧 [Path Conversion] Converted imports in App.tsx"
# "✅ [Path Conversion] All @/ aliases converted"
```

### **Dependency Validation**

```bash
# Check validation logs
grep "Dependency Validator" backend/logs/combined.log

# Should see:
# "📦 [Dependency Validator] Checking import/dependency consistency..."
# "✅ [Dependency Validator] All 15 packages properly declared"
# OR
# "⚠️  [Dependency Validator] Found 3 missing dependencies"
# "🔧 [Dependency Validator] Auto-fixed package.json"
```

---

## 🎯 FINAL DELIVERABLES

When you're done, submit:

1. **Pull Request** with all fixes
   - Branch: `fix/preview-stability`
   - Title: "Fix Sandpack preview functionality and stabilize platform"
   - Description: Link to this task document

2. **Testing Report**
   - Results of 10 test prompts
   - Before/After metrics
   - Screenshots/videos of fixes

3. **Updated Documentation**
   - Update DEVELOPER_HANDOVER.md with fixes applied
   - Update TECHNICAL_ARCHITECTURE.md if architecture changed
   - Add troubleshooting tips to LOCAL_SETUP.md

4. **Deployment Checklist**
   - [ ] All tests passing
   - [ ] No console errors
   - [ ] Performance metrics acceptable
   - [ ] Error handling complete
   - [ ] Documentation updated

---

## 📞 QUESTIONS OR BLOCKERS?

If you get stuck:

1. **Review logs**: `backend/logs/combined.log` and browser console
2. **Re-read documentation**: DEVELOPER_HANDOVER.md, TECHNICAL_ARCHITECTURE.md
3. **Search codebase**: Use grep/find to locate relevant code
4. **Ask for help**: Document your issue with reproduction steps

---

## 🏁 SUMMARY

**Your Task**: Fix Sandpack preview functionality and make this platform production-ready.

**Priority Issues**:
1. Path conversion edge cases → `backend/src/services/ai.ts:137-251`
2. Thinking panel race conditions → `builder-v3/page.tsx:76-98`
3. Dependency validation → Make async, improve detection
4. AI generation quality → Strengthen validation, reduce retries
5. Error handling → Global handler, user-friendly messages

**Required Reading**:
1. 🔴 DEVELOPER_HANDOVER.md (30 min) - Start here!
2. 🔴 LOCAL_SETUP.md (15 min) - Get running locally
3. 🟡 TECHNICAL_ARCHITECTURE.md (1-2 hours) - Understand system
4. 🟢 INTEGRATION_GUIDE.md (optional) - If working on Yavi.ai

**Success Criteria**:
- 10/10 test prompts work perfectly
- <5 second preview load
- Zero "Module not found" errors
- User-friendly error messages

**Time Estimate**: 2-3 weeks for all fixes

**Good luck! The platform is 70% complete. You're fixing the last 30% to make it production-ready.**

---

**Document Created**: January 2025
**Task Priority**: 🔴 CRITICAL
**Estimated Completion**: 2-3 weeks

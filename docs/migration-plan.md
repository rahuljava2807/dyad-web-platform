# Migration Plan: Adopting Dyad's Preview Architecture

## Executive Summary
We need to completely replace Yavi Studio's iframe bundling approach with Dyad's real process execution architecture. This is a fundamental architectural change, not a small fix.

## Files to Modify (Minimize This List)

### CRITICAL: Core Preview Infrastructure (6 files)

#### 1. `backend/src/routes/preview.ts` - COMPLETE REWRITE
**Why**: Current iframe HTML generation approach is fundamentally flawed
**What to change**: Replace with real process execution and proxy server
**Based on Dyad's**: `app_handlers.ts` + `start_proxy_server.ts`

#### 2. `frontend/src/components/EnhancedPreviewPanel.tsx` - MAJOR REFACTOR
**Why**: Current iframe bundling approach cannot work reliably
**What to change**: Replace with real process management and proxy URL handling
**Based on Dyad's**: `PreviewIframe.tsx` + `useRunApp.ts`

#### 3. `frontend/src/services/BundlerService.ts` - DELETE
**Why**: esbuild-wasm bundling is not needed with real process execution
**What to change**: Remove entirely, replace with process management
**Based on Dyad's**: No bundling needed - apps run natively

#### 4. `backend/src/services/ai.ts` - MINOR UPDATE
**Why**: Need to ensure generated code includes proper package.json and project structure
**What to change**: Update code generation to create real Node.js projects
**Based on Dyad's**: `response_processor.ts` file writing logic

#### 5. `frontend/src/app/dashboard/yavi-studio/builder-v3/page.tsx` - MINOR UPDATE
**Why**: Need to integrate with new process-based preview system
**What to change**: Update to use new preview panel and state management
**Based on Dyad's**: `PreviewPanel.tsx` integration patterns

#### 6. `backend/src/simple-server.ts` - MINOR UPDATE
**Why**: Need to add proxy server and process management routes
**What to change**: Add new routes for process management and proxy server
**Based on Dyad's**: Route registration in main server

### IMPORTANT: New Files to Create (4 files)

#### 1. `backend/src/services/process-manager.ts` - CREATE
**Purpose**: Manage Node.js process lifecycle for generated apps
**Based on Dyad's**: `app_handlers.ts` process management logic

#### 2. `backend/src/services/proxy-server.ts` - CREATE
**Purpose**: HTTP proxy server for handling CORS and debugging
**Based on Dyad's**: `proxy_server.js` + `start_proxy_server.ts`

#### 3. `frontend/src/hooks/useProcessManager.ts` - CREATE
**Purpose**: React hook for managing app processes
**Based on Dyad's**: `useRunApp.ts` hook

#### 4. `frontend/src/components/ProcessPreviewPanel.tsx` - CREATE
**Purpose**: New preview panel that uses real process execution
**Based on Dyad's**: `PreviewIframe.tsx` + `PreviewPanel.tsx`

### OPTIONAL: Enhancement Files (2 files)

#### 1. `backend/src/services/error-capture.ts` - CREATE
**Purpose**: Comprehensive error capture and user-friendly display
**Based on Dyad's**: Error handling patterns

#### 2. `frontend/src/components/ErrorDisplay.tsx` - CREATE
**Purpose**: User-friendly error display with AI fix suggestions
**Based on Dyad's**: `ErrorBanner` component

## Files to Preserve (No Changes)

### AI Integration Layer
- `backend/src/services/ai.ts` - Keep AI generation logic
- `backend/src/controllers/ai.ts` - Keep AI API endpoints
- `backend/src/routes/ai.ts` - Keep AI routes

### UI Framework
- `frontend/src/components/ui/*` - Keep all UI components
- `frontend/src/app/layout.tsx` - Keep layout
- `frontend/src/app/dashboard/*` - Keep dashboard structure

### User Flows
- `frontend/src/app/dashboard/yavi-studio/builder-v4/page.tsx` - Keep chat interface
- `frontend/src/components/chat/*` - Keep chat components
- `frontend/src/components/Builder/PromptInterface.tsx` - Keep prompt interface

### Utilities
- `backend/src/utils/*` - Keep utility functions
- `frontend/src/lib/*` - Keep frontend utilities
- `backend/src/middleware/*` - Keep middleware

## Implementation Strategy

### Phase 1: Core Process Execution (6 hours)
1. Create `process-manager.ts` service
2. Create `proxy-server.ts` service
3. Update `preview.ts` routes to use real processes
4. Test basic process execution

### Phase 2: Frontend Integration (4 hours)
1. Create `useProcessManager.ts` hook
2. Create `ProcessPreviewPanel.tsx` component
3. Update builder page to use new preview panel
4. Test frontend integration

### Phase 3: Error Handling (2 hours)
1. Create `error-capture.ts` service
2. Create `ErrorDisplay.tsx` component
3. Integrate error handling into preview panel
4. Test error scenarios

### Phase 4: Testing & Optimization (2 hours)
1. Test with various app types
2. Optimize performance
3. Add error recovery mechanisms
4. Document new architecture

## Risk Mitigation

### Technical Risks
- **Process Management Complexity**: Start with simple process spawning, add complexity gradually
- **Port Conflicts**: Use dynamic port allocation like Dyad
- **File System Permissions**: Use temporary directories with proper cleanup
- **Memory Leaks**: Implement proper process cleanup and resource management

### Business Risks
- **Breaking Existing Features**: Preserve all UI and chat functionality
- **Performance Issues**: Use worker threads for proxy server like Dyad
- **Security Concerns**: Implement proper sandboxing and process isolation

## Success Criteria

### Functional Requirements
- [ ] Generated apps run as real Node.js processes
- [ ] Preview loads in iframe without CORS errors
- [ ] Error handling captures process-level errors
- [ ] Hot reload works for development
- [ ] All existing UI and chat functionality preserved

### Performance Requirements
- [ ] Preview loads in <3 seconds
- [ ] Zero console errors for valid generated code
- [ ] Smooth interaction without lag
- [ ] Proper cleanup of processes and resources

### User Experience Requirements
- [ ] Clear error messages with suggested fixes
- [ ] Seamless integration with existing chat interface
- [ ] Professional preview experience matching Dyad quality
- [ ] No breaking changes to existing workflows

## Timeline

- **Phase 1**: 6 hours (Day 1)
- **Phase 2**: 4 hours (Day 1-2)
- **Phase 3**: 2 hours (Day 2)
- **Phase 4**: 2 hours (Day 2)

**Total**: 14 hours (2 working days)

## Next Steps

1. **Start with Phase 1**: Create process manager and proxy server
2. **Test incrementally**: Verify each component works before moving to next
3. **Preserve existing functionality**: Ensure no breaking changes
4. **Document decisions**: Explain each architectural choice
5. **Validate with users**: Test with real use cases

This migration plan will transform Yavi Studio from a broken iframe bundling system to a reliable real process execution system like Dyad.

# Dyad Preview Architecture Analysis

## Overview
Dyad uses a sophisticated preview system that runs generated applications as actual Node.js processes and serves them through a proxy server, then displays them in an iframe.

## Key Components

### 1. Preview Panel Structure
- **Main Component**: `PreviewPanel.tsx` - Orchestrates the entire preview experience
- **Iframe Component**: `PreviewIframe.tsx` - Handles the actual iframe rendering and navigation
- **Console Integration**: Built-in console panel for debugging

### 2. App Execution Flow
```
User Prompt → AI Generation → File Writing → App Execution → Proxy Server → Iframe Preview
```

### 3. Core Architecture Patterns

#### A. App Execution (`useRunApp.ts`)
- **Process Management**: Spawns actual Node.js processes for each app
- **Port Management**: Uses dynamic port allocation (50,000-60,000 range)
- **Process Lifecycle**: Start/stop/restart apps with proper cleanup
- **Output Capture**: Captures stdout/stderr from running processes

#### B. Proxy Server (`proxy_server.js`)
- **HTTP Forwarding**: Forwards requests from iframe to actual app server
- **WebSocket Tunneling**: Handles WebSocket connections for HMR
- **HTML Injection**: Injects debugging tools and component selectors
- **CORS Handling**: Manages cross-origin requests

#### C. File System Integration
- **Real File System**: Writes generated code to actual files on disk
- **Git Integration**: Automatically commits changes
- **Directory Structure**: Creates proper project structure with package.json, etc.

## Critical Implementation Details

### 1. Iframe Configuration
```typescript
<iframe
  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-downloads"
  src={appUrl}
  allow="clipboard-read; clipboard-write; fullscreen; microphone; camera; display-capture; geolocation; autoplay; picture-in-picture"
/>
```

### 2. App URL Management
- **Dynamic URLs**: Each app gets a unique URL (e.g., `http://localhost:32100`)
- **Proxy URLs**: Proxy server creates URLs like `http://localhost:50001` that forward to app URLs
- **URL State**: Managed through Jotai atoms (`appUrlAtom`)

### 3. Error Handling
- **Process Errors**: Captured from spawned processes
- **Iframe Errors**: Handled through message passing
- **User Feedback**: Error banners with AI fix suggestions

### 4. State Management
- **Jotai Atoms**: Centralized state management
- **App State**: `selectedAppIdAtom`, `appUrlAtom`, `appOutputAtom`
- **Preview State**: `previewModeAtom`, `previewErrorMessageAtom`

## Key Differences from Yavi Studio

1. **Real Process Execution**: Dyad runs actual Node.js apps vs Yavi's iframe-only approach
2. **Proxy Server**: Sophisticated proxy vs direct iframe loading
3. **File System**: Real files vs in-memory bundling
4. **Error Handling**: Process-level error capture vs iframe error boundaries
5. **State Management**: Centralized atoms vs component state

## Critical Success Factors

1. **Process Isolation**: Each app runs in its own process
2. **Port Management**: Dynamic port allocation prevents conflicts
3. **Proxy Layer**: Handles CORS and debugging injection
4. **Real File System**: Enables proper Node.js app execution
5. **Error Propagation**: Comprehensive error capture and user feedback

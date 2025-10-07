# Yavi Studio vs Dyad: Architecture Comparison

## Executive Summary
Yavi Studio uses an **iframe bundling approach** while Dyad uses **real process execution**. This fundamental difference explains why Yavi Studio's preview system is unreliable and why Dyad's works perfectly.

## Detailed Comparison Matrix

| Aspect | Dyad Approach | Yavi Studio Approach | Gap Severity |
|--------|---------------|---------------------|--------------|
| **Code Execution** | Real Node.js processes | In-memory iframe bundling | **CRITICAL** |
| **File System** | Writes to real filesystem | In-memory file management | **CRITICAL** |
| **Preview Serving** | Proxy server + real app | Direct iframe HTML injection | **CRITICAL** |
| **Error Handling** | Process-level error capture | Iframe error boundaries only | **IMPORTANT** |
| **State Management** | Centralized Jotai atoms | Component-level state | **IMPORTANT** |
| **Library Loading** | App's own dependencies | External CDN loading | **IMPORTANT** |
| **CORS Handling** | Proxy server handles CORS | Direct iframe (CORS issues) | **IMPORTANT** |
| **Hot Reload** | App's own HMR system | Manual iframe refresh | **OPTIONAL** |
| **Debugging** | Real browser dev tools | Limited iframe debugging | **OPTIONAL** |

## Critical Gaps Analysis

### 1. Code Execution Architecture

**Dyad:**
```typescript
// Spawns real Node.js process
const spawnedProcess = spawn(command, [], {
  cwd: appPath,
  shell: true,
  stdio: "pipe"
});
```

**Yavi Studio:**
```typescript
// Bundles code in memory
const bundledCode = await BundlerService.bundle(files);
const html = generatePreviewHTML(bundledCode);
```

**Impact:** Dyad runs actual apps, Yavi Studio tries to simulate them in iframe.

### 2. File System Integration

**Dyad:**
```typescript
// Writes to real filesystem
fs.writeFileSync(fullFilePath, content);
// Creates proper project structure
fs.mkdirSync(dirPath, { recursive: true });
```

**Yavi Studio:**
```typescript
// Stores in memory
const previewSessions = new Map<string, { files: any[] }>();
// No real file system integration
```

**Impact:** Dyad enables real Node.js app execution, Yavi Studio cannot.

### 3. Preview Serving

**Dyad:**
```typescript
// Proxy server forwards to real app
const worker = new Worker(proxyServerPath, {
  workerData: { targetOrigin: appUrl, port: proxyPort }
});
```

**Yavi Studio:**
```typescript
// Direct iframe HTML injection
res.setHeader('Content-Type', 'text/html');
res.send(html);
```

**Impact:** Dyad handles CORS and debugging, Yavi Studio has security issues.

### 4. Error Handling

**Dyad:**
```typescript
// Captures process errors
listenToProcess({ process: spawnedProcess, appId, event });
// User-friendly error display
<ErrorBanner error={errorMessage} onAIFix={handleAIFix} />
```

**Yavi Studio:**
```typescript
// Only iframe errors
window.onerror = function(message, source, lineno, colno, error) {
  // Limited error context
};
```

**Impact:** Dyad provides comprehensive error handling, Yavi Studio is limited.

## Root Cause Analysis

### Primary Issues (Ranked by Impact)

1. **Architectural Mismatch**: Yavi Studio tries to bundle React apps in iframe instead of running them as real processes
2. **No Real File System**: Cannot create proper Node.js project structure
3. **CORS/Security Issues**: Direct iframe loading causes sandbox violations
4. **Limited Error Handling**: Cannot capture process-level errors
5. **State Management**: Component-level state causes synchronization issues

### Evidence from Code

**Yavi Studio's Broken Approach:**
```typescript
// This will never work reliably
const html = generatePreviewHTML(bundledCode);
const blob = new Blob([html], { type: 'text/html' });
const url = URL.createObjectURL(blob);
```

**Dyad's Working Approach:**
```typescript
// This works because it's real
const spawnedProcess = spawn('npm start', [], { cwd: appPath });
// App runs on real port, served through proxy
```

## Why Yavi Studio Fails

1. **Iframe Limitations**: Cannot run real Node.js processes
2. **Bundling Complexity**: esbuild-wasm has limitations in iframe context
3. **CORS Issues**: Cross-origin restrictions prevent proper loading
4. **Security Sandbox**: Iframe sandbox prevents necessary operations
5. **No Real Dependencies**: Cannot install and use real npm packages

## Why Dyad Succeeds

1. **Real Process Execution**: Apps run in their natural environment
2. **Proxy Server**: Handles all CORS and security issues
3. **File System Integration**: Enables proper Node.js app execution
4. **Comprehensive Error Handling**: Captures all types of errors
5. **Self-Contained Apps**: Each app has its own dependencies

## Migration Strategy

### Phase 1: Adopt Real Process Execution
- Replace iframe bundling with real Node.js process execution
- Write generated code to temporary filesystem
- Spawn processes to run generated apps

### Phase 2: Implement Proxy Server
- Create worker-based HTTP proxy similar to Dyad's
- Handle CORS and debugging injection
- Manage port allocation and forwarding

### Phase 3: Enhance Error Handling
- Capture process-level errors
- Implement error recovery mechanisms
- Add user-friendly error display

### Phase 4: Improve State Management
- Centralize state management
- Ensure consistent state across components
- Handle app lifecycle properly

## Conclusion

Yavi Studio's current approach is fundamentally flawed. We must adopt Dyad's real process execution architecture to achieve reliable preview functionality. The iframe bundling approach will never work reliably due to security and technical limitations.

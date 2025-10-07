# Root Cause Analysis: Why Yavi Studio Preview Fails

## Primary Issues (Ranked by Impact)

### 1. **Architectural Mismatch** - CRITICAL
**Issue**: Yavi Studio tries to bundle React apps in iframe instead of running them as real processes
**Root Cause**: Fundamental misunderstanding of how preview systems work
**Evidence**: 
```typescript
// Yavi Studio - This approach is fundamentally flawed
const bundledCode = await BundlerService.bundle(files);
const html = generatePreviewHTML(bundledCode);
const blob = new Blob([html], { type: 'text/html' });
```
**Impact**: Iframe cannot run real Node.js applications, only static HTML/JS

### 2. **No Real File System Integration** - CRITICAL
**Issue**: Generated code exists only in memory, not on real filesystem
**Root Cause**: Trying to simulate file system instead of using real one
**Evidence**:
```typescript
// Yavi Studio - In-memory only
const previewSessions = new Map<string, { files: any[] }>();

// Dyad - Real file system
fs.writeFileSync(fullFilePath, content);
fs.mkdirSync(dirPath, { recursive: true });
```
**Impact**: Cannot run real Node.js apps that require file system access

### 3. **CORS and Security Violations** - CRITICAL
**Issue**: Direct iframe loading causes cross-origin and sandbox violations
**Root Cause**: Not using proxy server to handle security issues
**Evidence**:
```typescript
// Yavi Studio - Direct iframe loading (CORS issues)
<iframe src={previewUrl} sandbox="allow-scripts allow-same-origin" />

// Dyad - Proxy server handles CORS
const worker = new Worker(proxyServerPath, {
  workerData: { targetOrigin: appUrl, port: proxyPort }
});
```
**Impact**: Browser blocks iframe content due to security restrictions

### 4. **Limited Error Handling** - IMPORTANT
**Issue**: Can only capture iframe errors, not process-level errors
**Root Cause**: Not running real processes that can provide comprehensive error information
**Evidence**:
```typescript
// Yavi Studio - Limited error context
window.onerror = function(message, source, lineno, colno, error) {
  // Only iframe errors, no process errors
};

// Dyad - Comprehensive error capture
listenToProcess({ process: spawnedProcess, appId, event });
// Captures stdout, stderr, process errors, build errors, etc.
```
**Impact**: Users see cryptic iframe errors instead of helpful process errors

### 5. **State Management Issues** - IMPORTANT
**Issue**: Component-level state causes synchronization problems
**Root Cause**: Not using centralized state management like Dyad
**Evidence**:
```typescript
// Yavi Studio - Component state
const [previewUrl, setPreviewUrl] = useState<string>('');
const [isPreviewLoading, setIsPreviewLoading] = useState(false);

// Dyad - Centralized atoms
const selectedAppId = useAtomValue(selectedAppIdAtom);
const { appUrl, originalUrl } = useAtomValue(appUrlAtom);
```
**Impact**: State gets out of sync between components

## Secondary Issues

### 6. **No Real Dependencies** - IMPORTANT
**Issue**: Cannot install and use real npm packages
**Root Cause**: Iframe bundling cannot handle real package.json and node_modules
**Impact**: Generated apps cannot use real libraries

### 7. **No Hot Reload** - OPTIONAL
**Issue**: Manual iframe refresh instead of automatic hot reload
**Root Cause**: Not running real development servers
**Impact**: Poor developer experience

### 8. **Limited Debugging** - OPTIONAL
**Issue**: Cannot use real browser dev tools
**Root Cause**: Iframe context limits debugging capabilities
**Impact**: Difficult to debug generated apps

## Why These Issues Exist

### 1. **Misunderstanding of Preview Systems**
The team assumed that bundling React code in an iframe would work like a real app. This is incorrect because:
- Iframes have security restrictions
- Bundling cannot replicate real Node.js environment
- No access to real file system or processes

### 2. **Over-Engineering the Solution**
Instead of using the simple, proven approach (real process execution), the team tried to create a complex bundling system that:
- Requires esbuild-wasm (complex)
- Needs iframe sandbox configuration (error-prone)
- Handles CORS manually (unreliable)

### 3. **Lack of Reference Implementation**
Without studying how successful preview systems work, the team:
- Reinvented the wheel poorly
- Missed critical architectural patterns
- Chose the wrong technical approach

## Evidence from Error Messages

### Current Yavi Studio Errors:
```
SecurityError: Failed to read a named property 'console' from 'Window': 
Blocked a frame with origin "http://localhost:3000" from accessing a cross-origin frame.

Uncaught Error: Element type is invalid: expected a string (for built-in components) 
or a class/function (for composite components) but got: undefined.
```

### Why These Errors Occur:
1. **CORS Error**: Iframe cannot access parent window due to security restrictions
2. **Component Error**: Bundling system cannot properly resolve React components

### Dyad's Solution:
- **No CORS errors**: Proxy server handles all cross-origin requests
- **No component errors**: Real Node.js process runs actual React app

## The Fix

We must completely change our approach:

1. **Replace iframe bundling with real process execution**
2. **Write generated code to real filesystem**
3. **Use proxy server to handle CORS and security**
4. **Implement comprehensive error handling**
5. **Use centralized state management**

This is not a small fix - it's a fundamental architectural change. But it's the only way to achieve Dyad-level reliability.

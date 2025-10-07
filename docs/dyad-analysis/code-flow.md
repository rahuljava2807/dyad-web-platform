# Dyad Code Flow Analysis

## End-to-End Flow: User Prompt → Rendered Preview

### Phase 1: User Input & AI Generation
1. **User Input**: User types prompt in chat interface
2. **Context Building**: System extracts relevant codebase context
3. **AI Processing**: Sends prompt + context to AI model
4. **Response Processing**: AI returns structured response with code blocks

### Phase 2: Code Processing & File Writing
1. **Response Parsing**: `response_processor.ts` extracts `<dyad-write>` tags
2. **File Writing**: Writes each file to actual filesystem using `fs.writeFileSync`
3. **Directory Creation**: Creates necessary directories with `fs.mkdirSync`
4. **Git Integration**: Commits changes to git repository

### Phase 3: App Execution
1. **Process Spawning**: `app_handlers.ts` spawns Node.js process
2. **Command Execution**: Runs `npm install` and `npm start` (or custom commands)
3. **Port Detection**: Monitors stdout for port information
4. **Process Management**: Tracks running processes in `runningApps` Map

### Phase 4: Proxy Server Setup
1. **Port Allocation**: `start_proxy_server.ts` finds available port (50,000-60,000)
2. **Worker Creation**: Spawns `proxy_server.js` worker thread
3. **URL Generation**: Creates proxy URL (e.g., `http://localhost:50001`)
4. **Forwarding Setup**: Configures HTTP/WebSocket forwarding to app

### Phase 5: Preview Rendering
1. **URL State Update**: Updates `appUrlAtom` with proxy URL
2. **Iframe Loading**: `PreviewIframe.tsx` loads iframe with proxy URL
3. **Error Handling**: Captures and displays any loading errors
4. **Navigation**: Handles iframe navigation and component selection

## Key Files and Responsibilities

### Core Files
- **`response_processor.ts`**: Processes AI responses and writes files
- **`app_handlers.ts`**: Manages app execution and process lifecycle
- **`useRunApp.ts`**: React hook for app management
- **`start_proxy_server.ts`**: Proxy server initialization
- **`proxy_server.js`**: Worker-based HTTP proxy

### State Management
- **`appAtoms.ts`**: Jotai atoms for app state
- **`PreviewPanel.tsx`**: Main preview orchestrator
- **`PreviewIframe.tsx`**: Iframe rendering and navigation

### File System
- **`codebase.ts`**: File system utilities and code extraction
- **`VirtualFilesystem.ts`**: Virtual file system for modifications

## Critical Data Flow

### 1. AI Response Processing
```typescript
// AI returns structured response with <dyad-write> tags
const dyadWriteTags = getDyadWriteTags(fullResponse);

// Process each file write
for (const tag of dyadWriteTags) {
  const fullFilePath = safeJoin(appPath, filePath);
  fs.writeFileSync(fullFilePath, content);
}
```

### 2. App Execution
```typescript
// Spawn Node.js process
const spawnedProcess = spawn(command, [], {
  cwd: appPath,
  shell: true,
  stdio: "pipe"
});

// Listen for output and port detection
listenToProcess({ process: spawnedProcess, appId, event });
```

### 3. Proxy Server
```typescript
// Create proxy worker
const worker = new Worker(proxyServerPath, {
  workerData: { targetOrigin: appUrl, port: proxyPort }
});

// Handle proxy URL generation
worker.on("message", (m) => {
  if (m.startsWith("proxy-server-start url=")) {
    const proxyUrl = m.substring("proxy-server-start url=".length);
    onStarted?.(proxyUrl);
  }
});
```

### 4. Preview Rendering
```typescript
// Update app URL state
setAppUrlObj({ appUrl: proxyUrl, appId, originalUrl: appUrl });

// Render iframe
<iframe
  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-downloads"
  src={appUrl}
  allow="clipboard-read; clipboard-write; fullscreen; microphone; camera; display-capture; geolocation; autoplay; picture-in-picture"
/>
```

## Error Handling Points

1. **File Writing Errors**: Caught in `response_processor.ts`
2. **Process Spawn Errors**: Caught in `app_handlers.ts`
3. **Port Allocation Errors**: Caught in `start_proxy_server.ts`
4. **Iframe Loading Errors**: Caught in `PreviewIframe.tsx`
5. **Proxy Server Errors**: Caught in `proxy_server.js`

## Performance Considerations

1. **Process Isolation**: Each app runs independently
2. **Port Management**: Dynamic allocation prevents conflicts
3. **Proxy Efficiency**: Worker-based proxy for non-blocking operation
4. **Error Recovery**: Automatic cleanup on errors
5. **State Synchronization**: Jotai atoms ensure consistent state

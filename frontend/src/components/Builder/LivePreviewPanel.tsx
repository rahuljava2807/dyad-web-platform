'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Terminal,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ProjectFile } from '@/store/projectStore';

interface LivePreviewPanelProps {
  files: ProjectFile[];
  status: 'idle' | 'generating' | 'reviewing' | 'approved';
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({ files, status }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewUrl, setPreviewUrl] = useState('');
  const [logs, setLogs] = useState<Array<{ type: string; message: string; timestamp: Date }>>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewUrlRef = useRef<string>(''); // Persist preview URL across re-renders

  // Generate preview when files are ready
  useEffect(() => {
    console.log('Preview effect triggered:', { filesCount: files.length, status, hasPreviewUrl: !!previewUrl });

    if (files.length > 0 && (status === 'reviewing' || status === 'approved')) {
      // Only regenerate if we don't have a preview URL or files changed
      if (!previewUrl || files.length !== (files.length)) {
        console.log('Generating preview for', files.length, 'files with status:', status);
        generateInlinePreview();
      } else {
        console.log('Preview already exists, skipping regeneration');
      }
    }
  }, [status, files]);

  // Capture console logs from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        addLog(event.data.level, event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const addLog = (type: string, message: string) => {
    setLogs((prev) => [
      ...prev,
      { type, message, timestamp: new Date() }
    ]);
  };

  const generateInlinePreview = () => {
    setLoading(true);
    setError(null);
    addLog('info', 'Generating inline preview...');

    try {
      // Find the main component files
      const appFile = files.find(f =>
        f.path.includes('App.tsx') ||
        f.path.includes('app/page.tsx') ||
        f.path.includes('/page.tsx')
      );

      if (!appFile) {
        throw new Error('No main App component found in generated files');
      }

      // Extract HTML/JSX content from the App file
      let content = appFile.content;

      // Extract JSX - try multiple patterns
      let jsx = '';

      // Pattern 1: return (...);
      const returnMatch = content.match(/return\s*\(([\s\S]*?)\);/);
      if (returnMatch && returnMatch[1]) {
        jsx = returnMatch[1].trim();
      }

      // Pattern 2: Look for main div with className
      if (!jsx) {
        const divMatch = content.match(/<div[^>]*className[^>]*>([\s\S]*?)<\/div>/);
        if (divMatch) {
          jsx = divMatch[0];
        }
      }

      // Pattern 3: Any JSX fragment
      if (!jsx) {
        const fragmentMatch = content.match(/<>[\s\S]*?<\/>/);
        if (fragmentMatch) {
          jsx = fragmentMatch[0].replace(/<>|<\/>/g, '');
        }
      }

      // Fallback: Create a beautiful summary card
      // Use fallback if JSX is missing, too short, or contains unresolved component references
      const hasComponentRefs = jsx.includes('<') && jsx.match(/<[A-Z]\w+\s*\/>/);
      if (!jsx || jsx.length < 20 || hasComponentRefs) {
        const fileList = files.map(f => `<li class="text-sm text-gray-700">${f.path}</li>`).join('');
        jsx = `
          <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
            <div class="max-w-5xl mx-auto">
              <div class="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h1 class="text-4xl font-bold text-gray-900">Generated Application</h1>
                    <p class="text-lg text-gray-600">Successfully created with ${files.length} files</p>
                  </div>
                </div>

                <div class="grid md:grid-cols-3 gap-4 mb-8">
                  <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                    <div class="text-3xl font-bold text-blue-600 mb-2">${files.length}</div>
                    <div class="text-sm text-blue-900 font-medium">Files Generated</div>
                  </div>
                  <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                    <div class="text-3xl font-bold text-purple-600 mb-2">React</div>
                    <div class="text-sm text-purple-900 font-medium">Framework</div>
                  </div>
                  <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                    <div class="text-3xl font-bold text-green-600 mb-2">TypeScript</div>
                    <div class="text-sm text-green-900 font-medium">Language</div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-xl p-6">
                  <h2 class="text-xl font-bold text-gray-900 mb-4">📦 Generated Files</h2>
                  <ul class="space-y-2 max-h-64 overflow-auto">${fileList}</ul>
                </div>
              </div>

              <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 class="text-2xl font-bold mb-2">🚀 Ready to Deploy</h3>
                <p class="text-blue-100">Your application is ready with modern React, TypeScript, and Tailwind CSS</p>
              </div>
            </div>
          </div>
        `;
      } else {
        // Convert className to class
        jsx = jsx.replace(/className=/g, 'class=');

        // Remove complex JSX expressions but keep simple ones
        jsx = jsx.replace(/\{([^}]+)\}/g, (match, p1) => {
          const cleaned = p1.trim();
          // Keep strings
          if (/^['"].*['"]$/.test(cleaned)) {
            return cleaned.slice(1, -1);
          }
          // Keep simple variables
          if (/^[a-zA-Z]\w*$/.test(cleaned)) {
            return `[${cleaned}]`;
          }
          return '';
        });
      }

      // Create a comprehensive HTML preview
      const filesJson = JSON.stringify(files.map(f => f.path));
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated App Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root">${jsx}</div>
  <script>
    console.log('Preview loaded successfully with ' + ${files.length} + ' files');
    console.log('Files:', ${filesJson});
    console.log('Preview is rendering...');
  </script>
</body>
</html>`;

      // Create a blob URL for the preview
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      setPreviewUrl(url);
      previewUrlRef.current = url; // Persist in ref
      addLog('success', `Inline preview generated successfully (${files.length} files)`);
      console.log('=== PREVIEW DEBUG ===');
      console.log('App file found:', appFile.path);
      console.log('JSX length:', jsx.length);
      console.log('Extracted JSX (first 300 chars):', jsx.substring(0, 300));
      console.log('Preview URL created:', url.substring(0, 100));
      console.log('Preview URL saved to state and ref');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog('error', `Failed to generate preview: ${errorMessage}`);
      console.error('Preview generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    setLoading(true);
    setError(null);
    addLog('info', 'Generating preview...');

    try {
      // Use API route to generate preview
      const response = await fetch('/api/preview/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate preview');
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('No preview URL returned');
      }

      setPreviewUrl(data.url);
      addLog('success', `Preview generated successfully (${files.length} files)`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog('error', `Failed to generate preview: ${errorMessage}`);
      console.error('Preview generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      addLog('info', 'Preview refreshed');
    }
  };

  const handleOpenInNewTab = () => {
    const urlToOpen = previewUrl || previewUrlRef.current;
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
      addLog('info', 'Opened preview in new tab');
    }
  };

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  const currentSize = deviceSizes[deviceMode];

  // Use the persisted preview URL if state URL is lost
  const displayUrl = previewUrl || previewUrlRef.current;

  // Debug render conditions
  const shouldShowPreview = !loading && !error && (status === 'reviewing' || status === 'approved') && displayUrl;
  console.log('Render check:', {
    loading,
    error,
    status,
    hasPreviewUrl: !!previewUrl,
    hasRefUrl: !!previewUrlRef.current,
    hasDisplayUrl: !!displayUrl,
    shouldShowPreview
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Preview Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-600" />
            Live Preview
          </h3>

          {/* Device Mode Selector & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeviceMode('desktop')}
              title="Desktop View"
              className={`p-2 rounded transition-colors ${
                deviceMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              title="Tablet View"
              className={`p-2 rounded transition-colors ${
                deviceMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              title="Mobile View"
              className={`p-2 rounded transition-colors ${
                deviceMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button
              onClick={handleRefresh}
              disabled={!displayUrl || loading}
              title="Refresh Preview"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenInNewTab}
              disabled={!displayUrl || loading}
              title="Open in New Tab"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowConsole(!showConsole)}
              title="Toggle Console"
              className={`p-2 rounded transition-colors ${
                showConsole ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Device Size Info */}
        {deviceMode !== 'desktop' && (
          <div className="mt-2 text-xs text-gray-500">
            Viewing at {deviceSizes[deviceMode].width} × {deviceSizes[deviceMode].height}
          </div>
        )}
      </div>

      {/* Preview Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
        {loading && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating preview...</span>
          </div>
        )}

        {error && (
          <div className="max-w-md p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Preview Error</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={generatePreview}
                  className="mt-3 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Retry Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (status === 'reviewing' || status === 'approved') && displayUrl ? (
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
            style={{
              width: currentSize.width,
              height: currentSize.height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              ref={iframeRef}
              src={displayUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
              title="Application Preview"
            />
          </div>
        ) : !loading && !error && (
          <div className="text-center text-gray-500">
            <div className="mb-4">
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                <Monitor className="w-16 h-16 text-gray-400" />
              </div>
            </div>
            <p className="text-lg font-medium">No Preview Available</p>
            <p className="text-sm mt-2 max-w-md">
              {status === 'idle'
                ? 'Start by entering a prompt to generate an application'
                : status === 'generating'
                ? 'Application is being generated...'
                : status === 'reviewing'
                ? 'Review and approve the application to see live preview'
                : 'Generate and approve an application to see preview'}
            </p>
          </div>
        )}
      </div>

      {/* Console Output */}
      {showConsole && (
        <div className="h-48 bg-gray-900 border-t border-gray-700 overflow-hidden flex flex-col">
          <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-300 font-mono">Console</span>
            <button
              onClick={() => setLogs([])}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 p-4 overflow-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">No console output</div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`mb-1 ${
                    log.type === 'error'
                      ? 'text-red-400'
                      : log.type === 'warning'
                      ? 'text-yellow-400'
                      : log.type === 'success'
                      ? 'text-green-400'
                      : 'text-gray-300'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span>{' '}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

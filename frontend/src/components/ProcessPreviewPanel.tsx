import React, { useEffect, useRef } from 'react';
import { useProcessManager } from '../hooks/useProcessManager';
import { Eye, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface ProcessPreviewPanelProps {
  fullResponse: string; // We now need the full AI response to pass to the backend
  files: Array<{ path: string; content: string; language: string }>; // Keep files for change detection
  className?: string;
}

export const ProcessPreviewPanel: React.FC<ProcessPreviewPanelProps> = ({
  fullResponse,
  files,
  className = ''
}) => {
  const {
    loading,
    error,
    previewUrl,
    updateFiles,
  } = useProcessManager();

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // When a new set of files is generated, send them to the backend.
  useEffect(() => {
    // Only trigger if we have a full response and files.
    if (fullResponse && files.length > 0) {
      console.log('[ProcessPreviewPanel] New response detected, updating files...');
      updateFiles(fullResponse);
    }
  }, [fullResponse, files, updateFiles]); // Depend on the full response string

  const handleRefresh = () => {
    if (iframeRef.current) {
      // A simple way to force a refresh is to re-set the src attribute.
      iframeRef.current.src = previewUrl;
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={!previewUrl || loading}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh Preview"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-gray-100">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="mt-4 text-lg text-gray-700">Processing Changes...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">An Error Occurred</h3>
            <p className="text-sm text-red-700 text-center whitespace-pre-wrap">{error}</p>
          </div>
        )}
        {!loading && !error && previewUrl ? (
          <iframe
            ref={iframeRef}
            src={previewUrl}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          !loading && !error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium">No Preview Available</h3>
                <p className="text-sm">Generate code to see a live preview.</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
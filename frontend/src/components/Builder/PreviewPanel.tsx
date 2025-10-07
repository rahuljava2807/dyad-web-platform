'use client';

import React, { useState } from 'react';
import { Eye, Code, Download, Check, X, ExternalLink, Play } from 'lucide-react';
import { ProjectFile } from '@/store/projectStore';
import { SandpackPreviewPanel } from '@/components/SandpackPreviewPanel';

interface PreviewPanelProps {
  files: ProjectFile[];
  status: 'idle' | 'generating' | 'reviewing' | 'approved';
  selectedFile?: ProjectFile;
  onApprove?: () => void;
  onReject?: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  files,
  status,
  selectedFile,
  onApprove,
  onReject
}) => {
  const [previewMode, setPreviewMode] = useState<'code' | 'rendered' | 'live'>('live');

  const renderCodePreview = () => {
    if (!selectedFile) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Code className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-sm">No file selected</p>
          <p className="text-xs mt-1">Select a file from the tree to preview</p>
        </div>
      );
    }

    return (
      <div className="h-full overflow-auto">
        <pre className="p-4 text-sm font-mono bg-gray-50 rounded-lg">
          <code className="text-gray-800">{selectedFile.content}</code>
        </pre>
      </div>
    );
  };

  const renderRenderedPreview = () => {
    if (!selectedFile) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Eye className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-sm">No preview available</p>
        </div>
      );
    }

    // Simple markdown or HTML rendering
    if (selectedFile.path.endsWith('.md')) {
      return (
        <div className="h-full overflow-auto p-4 prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: selectedFile.content }} />
        </div>
      );
    }

    if (selectedFile.path.endsWith('.html')) {
      return (
        <div className="h-full overflow-auto">
          <iframe
            srcDoc={selectedFile.content}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
            title="Preview"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <Eye className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-sm">Preview not available for this file type</p>
        <p className="text-xs mt-1">Switch to code view to see the contents</p>
      </div>
    );
  };

  const downloadAllFiles = () => {
    // Create a simple text file with all file contents
    const content = files
      .map((file) => `// File: ${file.path}\n\n${file.content}\n\n${'='.repeat(80)}\n\n`)
      .join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-application.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            Preview
          </h2>
          {files.length > 0 && (
            <button
              onClick={downloadAllFiles}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {files.length > 0 && (
            <button
              onClick={() => setPreviewMode('live')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                previewMode === 'live'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Play className="w-4 h-4 inline mr-1" />
              Live Preview
            </button>
          )}
          {selectedFile && (
            <>
              <button
                onClick={() => setPreviewMode('code')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  previewMode === 'code'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Code className="w-4 h-4 inline mr-1" />
                Code
              </button>
              <button
                onClick={() => setPreviewMode('rendered')}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  previewMode === 'rendered'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                File Preview
              </button>
            </>
          )}
        </div>
      </div>

      {/* File Info */}
      {selectedFile && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{selectedFile.path}</span>
            <span className="mx-2">•</span>
            <span>{selectedFile.language}</span>
            <span className="mx-2">•</span>
            <span>{selectedFile.content.split('\n').length} lines</span>
          </div>
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {previewMode === 'live' ? (
          <SandpackPreviewPanel files={files} />
        ) : previewMode === 'code' ? (
          renderCodePreview()
        ) : (
          renderRenderedPreview()
        )}
      </div>

      {/* Action Buttons */}
      {status === 'reviewing' && files.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={onReject}
              className="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Reject Changes
            </button>
            <button
              onClick={onApprove}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Approve & Deploy
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Review all files before approving the generated application
          </p>
        </div>
      )}

      {/* Success State */}
      {status === 'approved' && (
        <div className="p-4 border-t border-gray-200 bg-green-50">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">Application Approved!</span>
          </div>
          <p className="text-sm text-green-600 mb-3">
            Your application has been generated and is ready to deploy.
          </p>
          <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Deploy to Production
          </button>
        </div>
      )}
    </div>
  );
};

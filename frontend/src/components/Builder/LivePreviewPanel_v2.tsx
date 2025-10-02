'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ProjectFile } from '@/store/projectStore';
import { BundlerService } from '@/services/BundlerService';
import { generatePreviewHTML } from '@/lib/preview-runtime';

interface LivePreviewPanelProps {
  files: ProjectFile[];
  status: 'idle' | 'generating' | 'reviewing' | 'approved';
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({ files, status }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState<string>('');

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  const currentSize = deviceSizes[deviceMode];

  // Build preview when files change
  useEffect(() => {
    if (files.length > 0 && (status === 'reviewing' || status === 'approved')) {
      console.log('[Preview] Building preview for', files.length, 'files');
      buildPreview();
    }

    return () => {
      // Cleanup old preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [files, status]);

  const buildPreview = async () => {
    try {
      setIsBuilding(true);
      setBuildError('');

      // Revoke old URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      console.log('[Preview] Starting bundle...');

      // Bundle the code
      const bundledCode = await BundlerService.bundle(files);

      console.log('[Preview] Bundle complete, generating HTML...');

      // Generate HTML with bundled code
      const html = generatePreviewHTML(bundledCode);

      // Create blob URL
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      console.log('[Preview] Preview URL:', url);
      setPreviewUrl(url);
    } catch (error) {
      console.error('[Preview] Build error:', error);
      setBuildError(error instanceof Error ? error.message : 'Unknown build error');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleRefresh = () => {
    buildPreview();
  };

  const showPreview = files.length > 0 && (status === 'reviewing' || status === 'approved') && previewUrl && !buildError;

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
              disabled={!showPreview || isBuilding}
              title="Refresh Preview"
              className={`p-2 rounded transition-colors ${
                isBuilding ? 'text-blue-600 animate-spin' : 'text-gray-600 hover:bg-gray-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RefreshCw className="w-4 h-4" />
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
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto bg-gray-100">
        {/* Building State */}
        {isBuilding && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Building preview...</span>
          </div>
        )}

        {/* Build Error */}
        {buildError && !isBuilding && (
          <div className="max-w-2xl w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Build Error</h3>
                <p className="text-sm text-red-700 mb-4">Failed to build the preview:</p>
                <pre className="bg-red-100 text-red-900 p-4 rounded text-xs overflow-x-auto font-mono">
                  {buildError}
                </pre>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Iframe */}
        {showPreview && !isBuilding && (
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: currentSize.width,
              height: currentSize.height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <iframe
              key={previewUrl}
              src={previewUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Live Preview"
            />
          </div>
        )}

        {/* Empty State */}
        {!showPreview && !isBuilding && !buildError && status !== 'generating' && (
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
                : 'Generate an application to see live preview'}
            </p>
          </div>
        )}

        {/* Generating State */}
        {status === 'generating' && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating application...</span>
          </div>
        )}
      </div>
    </div>
  );
};

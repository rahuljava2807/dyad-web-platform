'use client';

import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ProjectFile } from '@/store/projectStore';
import { PreviewService } from '@/services/PreviewService';

interface LivePreviewPanelProps {
  files: ProjectFile[];
  status: 'idle' | 'generating' | 'reviewing' | 'approved';
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({ files, status }) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  const currentSize = deviceSizes[deviceMode];

  // Generate preview when files change
  useEffect(() => {
    if (files.length > 0 && (status === 'reviewing' || status === 'approved')) {
      console.log('[LivePreview] Generating preview for', files.length, 'files');
      generatePreview();
    }

    return () => {
      // Cleanup old preview URL
      if (previewUrl) {
        PreviewService.revokePreviewURL(previewUrl);
      }
    };
  }, [files, status]);

  const generatePreview = async () => {
    try {
      setIsRefreshing(true);
      // Revoke old URL
      if (previewUrl) {
        PreviewService.revokePreviewURL(previewUrl);
      }

      // Generate new preview
      const url = await PreviewService.generatePreview(files);
      console.log('[LivePreview] Preview URL generated:', url);
      setPreviewUrl(url);
    } catch (error) {
      console.error('[LivePreview] Error generating preview:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    generatePreview();
  };

  const showPreview = files.length > 0 && (status === 'reviewing' || status === 'approved') && previewUrl;

  console.log('LivePreviewPanel:', {
    filesCount: files.length,
    status,
    showPreview,
    previewUrl
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
              disabled={!showPreview || isRefreshing}
              title="Refresh Preview"
              className={`p-2 rounded transition-colors ${
                isRefreshing ? 'text-blue-600 animate-spin' : 'text-gray-600 hover:bg-gray-100'
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
        {status === 'generating' && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating application...</span>
          </div>
        )}

        {showPreview ? (
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
              src={previewUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Live Preview"
            />
          </div>
        ) : !showPreview && status !== 'generating' && (
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
                : status === 'reviewing'
                ? 'Review the generated files - preview will appear automatically'
                : 'Generate an application to see live preview'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

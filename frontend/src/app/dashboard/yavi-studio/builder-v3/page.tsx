'use client';

import React, { useState } from 'react';
import { YaviStudioLayout } from '@/components/layouts/YaviStudioLayout';
import { PromptInterface } from '@/components/Builder/PromptInterface';
import { FileTreeVisualizer } from '@/components/Builder/FileTreeVisualizer';
import { LivePreviewPanel } from '@/components/Builder/LivePreviewPanel';
import { ApprovalModal } from '@/components/Builder/ApprovalModal';
import { useProjectStore, ProjectFile } from '@/store/projectStore';
import { generationService } from '@/services/GenerationService';

export default function AppBuilderV3Page() {
  const { currentProject, createProject, updateProjectFiles, updateProjectStatus } = useProjectStore();
  const [generationStatus, setGenerationStatus] = useState<
    'idle' | 'generating' | 'reviewing' | 'approved'
  >('idle');
  const [generatedFiles, setGeneratedFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | undefined>();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [currentStreamingFile, setCurrentStreamingFile] = useState<ProjectFile | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleGeneration = async (prompt: string, settings: any) => {
    setGenerationStatus('generating');
    setGeneratedFiles([]);
    setProgress({ current: 0, total: 0 });

    // Create project if not exists
    let project = currentProject;
    if (!project) {
      project = createProject(
        `${settings.selectedIndustry || 'Generated'} App`,
        settings.selectedIndustry || 'general',
        prompt
      );
    }

    // Use REAL AI generation with enhanced prompts
    await generationService.generateApplication(
      prompt,
      settings,
      {
        onFileStart: (file) => {
          console.log('Starting file:', file.path);
          setCurrentStreamingFile({
            path: file.path,
            content: '',
            language: file.language,
            isNew: true
          });
        },

        onContentChunk: (chunk) => {
          setCurrentStreamingFile((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              content: prev.content + chunk
            };
          });
        },

        onFileComplete: (file) => {
          console.log('Completed file:', file.path);
          const completedFile: ProjectFile = {
            path: file.path,
            content: file.content,
            language: file.language,
            isNew: true
          };

          setGeneratedFiles((prev) => {
            // Remove partial file and add complete file
            const filtered = prev.filter(f => f.path !== file.path);
            return [...filtered, completedFile];
          });

          setCurrentStreamingFile(null);
        },

        onProgress: (prog) => {
          setProgress(prog);
        },

        onComplete: (files) => {
          console.log('Generation complete:', files.length, 'files');
          setGenerationStatus('reviewing');
          setShowApprovalModal(true);

          // Update project
          if (project) {
            updateProjectFiles(project.id, files);
            updateProjectStatus(project.id, 'generated');
          }
        },

        onError: (error) => {
          console.error('Generation error:', error);
          setGenerationStatus('idle');
          alert('Generation failed. Please try again.');
        }
      }
    );
  };

  const handleApprove = () => {
    setShowApprovalModal(false);
    setGenerationStatus('approved');

    if (currentProject) {
      updateProjectStatus(currentProject.id, 'deployed');
    }
  };

  const handleReject = (reason: string) => {
    console.log('Rejected:', reason);
    setShowApprovalModal(false);
    setGenerationStatus('idle');
    setGeneratedFiles([]);
    setSelectedFile(undefined);
  };

  // Combine generated files with streaming file
  const displayFiles = currentStreamingFile
    ? [...generatedFiles, currentStreamingFile]
    : generatedFiles;

  return (
    <YaviStudioLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Progress Bar */}
        {generationStatus === 'generating' && progress.total > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
              <span>Generating files...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Builder Interface */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Prompt Interface */}
          <div className="w-1/3 border-r border-gray-200">
            <PromptInterface
              onGenerate={handleGeneration}
              status={generationStatus}
            />
          </div>

          {/* Center Panel - File Tree */}
          <div className="w-1/3 border-r border-gray-200">
            <FileTreeVisualizer
              files={displayFiles}
              status={generationStatus}
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-1/3">
            <LivePreviewPanel
              files={displayFiles}
              status={generationStatus}
            />
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        files={generatedFiles}
        isOpen={showApprovalModal}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={() => setShowApprovalModal(false)}
      />
    </YaviStudioLayout>
  );
}

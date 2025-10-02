'use client';

import React, { useState } from 'react';
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  FileCode,
  FileText,
  FileJson,
  Image,
  Plus,
  Check
} from 'lucide-react';
import { ProjectFile } from '@/store/projectStore';

interface FileTreeVisualizerProps {
  files: ProjectFile[];
  status: 'idle' | 'generating' | 'reviewing' | 'approved';
  onFileSelect?: (file: ProjectFile) => void;
  selectedFile?: ProjectFile;
}

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: TreeNode[];
  file?: ProjectFile;
}

export const FileTreeVisualizer: React.FC<FileTreeVisualizerProps> = ({
  files,
  status,
  onFileSelect,
  selectedFile
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));

  // Build tree structure from flat file list
  const buildTree = (files: ProjectFile[]): TreeNode => {
    const root: TreeNode = { name: 'root', type: 'folder', path: '/', children: [] };

    files.forEach((file) => {
      const parts = file.path.split('/').filter(Boolean);
      let currentNode = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const path = '/' + parts.slice(0, index + 1).join('/');

        if (!currentNode.children) {
          currentNode.children = [];
        }

        let node = currentNode.children.find((n) => n.name === part);

        if (!node) {
          node = {
            name: part,
            type: isFile ? 'file' : 'folder',
            path,
            children: isFile ? undefined : [],
            file: isFile ? file : undefined
          };
          currentNode.children.push(node);
        }

        currentNode = node;
      });
    });

    return root;
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return <FileCode className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-500" />;
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'png':
      case 'jpg':
      case 'svg':
        return <Image className="w-4 h-4 text-green-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    if (node.type === 'folder' && node.name === 'root') {
      return node.children?.map((child) => renderNode(child, depth));
    }

    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile?.path === node.file?.path;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleFolder(node.path)}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded text-sm text-gray-900"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <Folder className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-900">{node.name}</span>
          </button>
          {isExpanded && node.children?.map((child) => renderNode(child, depth + 1))}
        </div>
      );
    }

    return (
      <button
        key={node.path}
        onClick={() => node.file && onFileSelect?.(node.file)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
          isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-900'
        }`}
        style={{ paddingLeft: `${depth * 16 + 24}px` }}
      >
        {getFileIcon(node.name)}
        <span className={`flex-1 text-left ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>{node.name}</span>
        {node.file?.isNew && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Plus className="w-3 h-3" />
            New
          </span>
        )}
        {node.file?.isModified && (
          <span className="text-xs text-orange-600">Modified</span>
        )}
      </button>
    );
  };

  const tree = buildTree(files);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Folder className="w-5 h-5 text-blue-600" />
          File Structure
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {files.length} file{files.length !== 1 ? 's' : ''} generated
        </p>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Folder className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-sm">No files generated yet</p>
            <p className="text-xs mt-1">
              {status === 'idle'
                ? 'Enter a prompt to start'
                : status === 'generating'
                ? 'Generating files...'
                : 'Files will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">{renderNode(tree, 0)}</div>
        )}
      </div>

      {/* Status Footer */}
      {status !== 'idle' && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm">
            {status === 'generating' && (
              <>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-gray-700">Generating files...</span>
              </>
            )}
            {status === 'reviewing' && (
              <>
                <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                <span className="text-gray-700">Review and approve changes</span>
              </>
            )}
            {status === 'approved' && (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">All changes approved</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

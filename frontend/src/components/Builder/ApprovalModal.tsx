'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, Shield, FileCode, Loader2 } from 'lucide-react';
import { ProjectFile } from '@/store/projectStore';

interface SecurityIssue {
  level: 'error' | 'warning' | 'info';
  file: string;
  message: string;
  line?: number;
}

interface ApprovalModalProps {
  files: ProjectFile[];
  isOpen: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  files,
  isOpen,
  onApprove,
  onReject,
  onClose
}) => {
  const [securityScanComplete, setSecurityScanComplete] = useState(false);
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [scanning, setScanning] = useState(true);

  // Run security scan when modal opens
  useEffect(() => {
    if (isOpen) {
      scanForSecurityIssues();
    }
  }, [isOpen, files]);

  const scanForSecurityIssues = async () => {
    setScanning(true);
    setSecurityScanComplete(false);

    // Simulate security scanning
    await new Promise(resolve => setTimeout(resolve, 2000));

    const foundIssues: SecurityIssue[] = [];

    // Check for common security issues
    files.forEach(file => {
      // Check for hardcoded API keys
      if (file.content.includes('API_KEY') && file.content.includes('=')) {
        foundIssues.push({
          level: 'warning',
          file: file.path,
          message: 'Possible hardcoded API key detected. Use environment variables instead.'
        });
      }

      // Check for console.log in production code
      if (file.content.includes('console.log')) {
        foundIssues.push({
          level: 'info',
          file: file.path,
          message: 'Console.log statements found. Consider removing for production.'
        });
      }

      // Check for eval() usage
      if (file.content.includes('eval(')) {
        foundIssues.push({
          level: 'error',
          file: file.path,
          message: 'eval() usage detected. This is a security risk.'
        });
      }

      // Check for SQL injection risks
      if (file.content.includes('SELECT') && file.content.includes('${')) {
        foundIssues.push({
          level: 'warning',
          file: file.path,
          message: 'Possible SQL injection risk. Use parameterized queries.'
        });
      }
    });

    setIssues(foundIssues);
    setSecurityScanComplete(true);
    setScanning(false);
  };

  const handleApprove = () => {
    // Check if there are any blocking issues
    const hasErrors = issues.some(issue => issue.level === 'error');
    if (hasErrors) {
      alert('Cannot approve: Security errors must be resolved first.');
      return;
    }

    onApprove();
  };

  const handleReject = () => {
    onReject('User rejected the generated application');
  };

  const getIssueColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIssueIcon = (level: string) => {
    switch (level) {
      case 'error': return <X className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <FileCode className="w-4 h-4" />;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Review Generated Application</h2>
              <p className="text-gray-600 mt-1">
                Review the generated code and security scan before approving
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Scan Status */}
        <div className={`px-6 py-4 border-b ${
          issues.length === 0 && securityScanComplete
            ? 'bg-green-50 border-green-200'
            : issues.some(i => i.level === 'error')
            ? 'bg-red-50 border-red-200'
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <Shield className={`w-5 h-5 ${
              issues.length === 0 && securityScanComplete
                ? 'text-green-600'
                : issues.some(i => i.level === 'error')
                ? 'text-red-600'
                : 'text-blue-600'
            }`} />
            <span className="font-medium">Security Scan</span>
            {scanning ? (
              <span className="text-blue-600 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </span>
            ) : (
              <span className={`text-sm ${
                issues.length === 0
                  ? 'text-green-600'
                  : issues.some(i => i.level === 'error')
                  ? 'text-red-600'
                  : 'text-yellow-700'
              }`}>
                {issues.length === 0 ? '✓ No issues found' : `${issues.length} issue(s) found`}
              </span>
            )}
          </div>

          {!scanning && issues.length > 0 && (
            <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
              {issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 text-sm p-2 rounded border ${getIssueColor(issue.level)}`}
                >
                  {getIssueIcon(issue.level)}
                  <div className="flex-1">
                    <span className="font-medium">{issue.file}:</span> {issue.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File List */}
          <div className="w-1/3 border-r border-gray-200 overflow-auto">
            <div className="p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Generated Files ({files.length})
              </h3>
              <div className="space-y-1">
                {files.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedFile?.path === file.path
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="text-sm font-medium truncate">{file.path.split('/').pop()}</div>
                    <div className="text-xs text-gray-500 truncate">{file.path}</div>
                    {issues.some(i => i.file === file.path) && (
                      <div className="mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs text-yellow-700">
                          {issues.filter(i => i.file === file.path).length} issue(s)
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 overflow-auto bg-gray-50">
            {selectedFile ? (
              <div className="p-4">
                <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                  <h3 className="font-medium">{selectedFile.path.split('/').pop()}</h3>
                  <p className="text-sm text-gray-600">{selectedFile.path}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>Language: {selectedFile.language}</span>
                    <span>Lines: {selectedFile.content.split('\n').length}</span>
                    <span>Size: {(selectedFile.content.length / 1024).toFixed(2)} KB</span>
                  </div>
                </div>

                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                  <code>{selectedFile.content}</code>
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a file to review its contents</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {files.length} files • {files.reduce((sum, f) => sum + f.content.length, 0)} characters
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReject}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reject
            </button>

            <button
              onClick={handleApprove}
              disabled={scanning || issues.some(i => i.level === 'error')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Approve & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Sparkles, Send, FileText, Loader2 } from 'lucide-react';

interface PromptInterfaceProps {
  onGenerate: (prompt: string, settings: any) => void;
  status: 'idle' | 'generating' | 'reviewing' | 'approved';
}

export const PromptInterface: React.FC<PromptInterfaceProps> = ({
  onGenerate,
  status
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [useYaviContext, setUseYaviContext] = useState(true);

  // Debug: Log when component mounts and state changes
  React.useEffect(() => {
    console.log('PromptInterface mounted');
    return () => console.log('PromptInterface unmounted');
  }, []);

  React.useEffect(() => {
    console.log('selectedIndustry state changed to:', selectedIndustry);
  }, [selectedIndustry]);

  const templates: Record<string, string[]> = {
    legal: [
      'Create a contract analyzer that extracts key terms and obligations',
      'Build a case management system with document search',
      'Generate a compliance checker for legal documents'
    ],
    construction: [
      'Create a project tracker with blueprint management',
      'Build a safety compliance dashboard',
      'Generate an invoice and budget analyzer'
    ],
    healthcare: [
      'Create a patient record summarizer',
      'Build a medication tracking system',
      'Generate a billing and claims processor'
    ],
    financial: [
      'Create an intelligent invoice processor',
      'Build a financial statement analyzer',
      'Generate a fraud detection system'
    ]
  };

  const handleGenerate = () => {
    if (!prompt) return;
    onGenerate(prompt, { selectedIndustry, useYaviContext });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI Application Builder
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Describe your application and let AI build it for you
        </p>
      </div>

      {/* Industry Selection */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
          Select Industry
        </label>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: '#ffffff', color: '#111827' }}
        >
          <option value="" style={{ color: '#6b7280' }}>Choose an industry...</option>
          <option value="legal" style={{ color: '#111827' }}>Legal</option>
          <option value="construction" style={{ color: '#111827' }}>Construction</option>
          <option value="healthcare" style={{ color: '#111827' }}>Healthcare</option>
          <option value="financial" style={{ color: '#111827' }}>Financial Services</option>
        </select>
      </div>

      {/* Templates */}
      {selectedIndustry && templates[selectedIndustry] && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Quick Templates for {selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}
          </label>
          <div className="space-y-2">
            {templates[selectedIndustry].map((template, idx) => (
              <button
                key={idx}
                onClick={() => {
                  console.log('Template clicked:', template);
                  setPrompt(template);
                }}
                className="w-full text-left px-4 py-3 text-sm bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
                style={{ color: '#111827' }}
              >
                <FileText className="w-4 h-4 inline mr-2 text-blue-600" />
                <span className="font-medium" style={{ color: '#111827' }}>{template}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Input */}
      <div className="flex-1 p-4 overflow-y-auto">
        <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
          Describe Your Application
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., Create a legal contract analyzer that extracts key terms, identifies risks, and provides summaries..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: '#ffffff', color: '#111827' }}
        />

        {/* Yavi Context Toggle */}
        <div className="mt-4 flex items-start gap-2">
          <input
            type="checkbox"
            id="yavi-context"
            checked={useYaviContext}
            onChange={(e) => setUseYaviContext(e.target.checked)}
            className="mt-0.5 rounded"
          />
          <label htmlFor="yavi-context" className="text-sm text-gray-700">
            Use Yavi.ai document intelligence for enhanced generation
            <span className="block text-xs text-gray-500 mt-1">
              Leverages RAG technology to build context-aware applications
            </span>
          </label>
        </div>

        {/* Status Indicator */}
        {status !== 'idle' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              {status === 'generating' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating your application...</span>
                </>
              )}
              {status === 'reviewing' && (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Review generated files and approve changes</span>
                </>
              )}
              {status === 'approved' && (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Application generated successfully!</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleGenerate}
          disabled={!prompt || status === 'generating'}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {status === 'generating' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Generate Application
            </>
          )}
        </button>
      </div>
    </div>
  );
};

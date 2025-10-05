'use client';

import React, { useState } from 'react';
import { Sparkles, Send, FileText, Loader2 } from 'lucide-react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Badge,
  Separator
} from '@/components/ui';

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
      <Card className="border-b-0 rounded-none">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Application Builder
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe your application and let AI build it for you
          </p>
        </CardHeader>
      </Card>

      {/* Industry Selection */}
      <Card className="border-b-0 rounded-none">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <Label htmlFor="industry">Select Industry</Label>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an industry..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="financial">Financial Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      {selectedIndustry && templates[selectedIndustry] && (
        <Card className="border-b-0 rounded-none bg-blue-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Quick Templates for {selectedIndustry.charAt(0).toUpperCase() + selectedIndustry.slice(1)}
              </Label>
              <div className="space-y-2">
                {templates[selectedIndustry].map((template, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    onClick={() => {
                      console.log('Template clicked:', template);
                      setPrompt(template);
                    }}
                    className="w-full justify-start text-left h-auto p-4 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
                  >
                    <FileText className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">{template}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt Input */}
      <Card className="flex-1 border-b-0 rounded-none">
        <CardContent className="pt-4 flex flex-col h-full">
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="prompt">Describe Your Application</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Create a legal contract analyzer that extracts key terms, identifies risks, and provides summaries..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <Separator />

            {/* Yavi Context Toggle */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="yavi-context"
                checked={useYaviContext}
                onCheckedChange={(checked) => setUseYaviContext(checked === true)}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label htmlFor="yavi-context" className="text-sm font-medium">
                  Use Yavi.ai document intelligence for enhanced generation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Leverages RAG technology to build context-aware applications
                </p>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          {status !== 'idle' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card className="border-t rounded-none">
        <CardContent className="pt-4">
          <Button
            onClick={handleGenerate}
            disabled={!prompt || status === 'generating'}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {status === 'generating' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate Application
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

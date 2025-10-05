import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface ThinkingStep {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface ThinkingPanelProps {
  isVisible: boolean;
  steps: ThinkingStep[];
  summary?: string;
  currentStep?: number;
}

export function ThinkingPanel({ isVisible, steps, summary, currentStep }: ThinkingPanelProps) {
  if (!isVisible) return null;

  const progress = steps.length > 0 
    ? (steps.filter(s => s.status === 'completed').length / steps.length) * 100 
    : 0;

  return (
    <Card className="mx-4 mt-4 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Thinking</h3>
            {summary && <p className="text-sm text-gray-600">{summary}</p>}
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-4" />

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              {/* Status Icon */}
              {step.status === 'completed' && (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              )}
              {step.status === 'in_progress' && (
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin mt-0.5 flex-shrink-0" />
              )}
              {step.status === 'pending' && (
                <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm",
                  step.status === 'completed' && "text-gray-900",
                  step.status === 'in_progress' && "text-purple-900",
                  step.status === 'pending' && "text-gray-500"
                )}>
                  {step.title}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
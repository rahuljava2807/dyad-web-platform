

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ThinkingPanelProps {
  aiResponse: string;
}

interface ThinkingStep {
  title: string;
  description: string;
}

function parseThinkingFromAI(response: string): ThinkingStep[] {
  const thinkBlockMatch = response.match(/<think>(.*?)<\/think>/s);
  if (!thinkBlockMatch) {
    return [];
  }

  const thinkBlock = thinkBlockMatch[1];
  const steps = thinkBlock.split('•').map(s => s.trim()).filter(s => s);

  return steps.map(step => {
    const [title, ...descriptionParts] = step.split('\n');
    const description = descriptionParts.join('\n').replace(/- /g, '').trim();
    return {
      title: title.replace(/\*+/g, '').trim(),
      description: description,
    };
  });
}

export const ThinkingPanel: React.FC<ThinkingPanelProps> = ({ aiResponse }) => {
  const thinkingSteps = parseThinkingFromAI(aiResponse);

  if (thinkingSteps.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Thinking Process</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {thinkingSteps.map((step, index) => (
            <div key={index}>
              <p className="font-semibold">{step.title}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{step.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


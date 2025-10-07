import React, { useState } from 'react';
import { generateCode } from '../services/llm';

interface PromptInputProps {
  onGenerate: (files: Record<string, string>) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    const generatedFiles = await generateCode(prompt);
    onGenerate(generatedFiles);
  };

  return (
    <div>
      <textarea
        placeholder="Enter your prompt here..."
        rows={5}
        style={{ width: '100%' }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
};

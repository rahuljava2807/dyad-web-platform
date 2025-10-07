import { Template } from '../types';

export const ContractAnalyzerTemplate: Template = {
  metadata: {
    id: 'legal-contract-analyzer',
    name: 'Contract Analyzer',
    description: 'A contract analyzer application that extracts key terms and obligations from contracts.',
    category: 'legal',
    tags: ['legal', 'contract', 'analysis', 'document', 'react', 'typescript', 'tailwind'],
  },
  files: [
    {
      path: 'src/components/ContractAnalyzer.tsx',
      content: `import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

interface ContractTerm {
  id: string;
  term: string;
  obligation: string;
}

const mockContractTerms: ContractTerm[] = [
  { id: '1', term: 'Payment Schedule', obligation: 'Monthly payments due on the 1st of each month.' },
  { id: '2', term: 'Termination Clause', obligation: 'Either party may terminate with 30 days written notice.' },
  { id: '3', term: 'Confidentiality', obligation: 'All information shared is strictly confidential.' },
];

const ContractAnalyzer: React.FC = () => {
  const [contractText, setContractText] = useState('');
  const [analyzedTerms, setAnalyzedTerms] = useState<ContractTerm[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalyzedTerms(mockContractTerms);
      setLoading(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8"
    >
      <Card className="max-w-4xl mx-auto shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900">Contract Analyzer</CardTitle>
          <CardDescription className="text-gray-600">
            Extract key terms and obligations from your legal documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contract-text">Paste Contract Text</Label>
            <Textarea
              id="contract-text"
              placeholder="Paste your contract text here..."
              rows={10}
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={loading || contractText.trim() === ''}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {loading ? 'Analyzing...' : 'Analyze Contract'}
          </Button>

          {analyzedTerms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 space-y-4"
            >
              <h3 className="text-2xl font-semibold text-gray-800">Extracted Terms</h3>
              {analyzedTerms.map((item) => (
                <Card key={item.id} className="border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-gray-900">{item.term}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{item.obligation}</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContractAnalyzer;
`,
    },
    {
      path: 'src/App.tsx',
      content: `import React from 'react';
import ContractAnalyzer from './components/ContractAnalyzer';

const App: React.FC = () => {
  return (
    <div className="App">
      <ContractAnalyzer />
    </div>
  );
};

export default App;
`,
    },
    {
      path: 'package.json',
      content: `{
  "name": "contract-analyzer-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.344.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-label": "^2.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/react": "^18.2.64",
    "@types/react-dom": "^18.2.21",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.18"
  }
}`,
    },
    {
      path: 'README.md',
      content: `# Contract Analyzer Application

This is a simple Contract Analyzer application built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- Paste contract text for analysis.
- Displays mock extracted terms and obligations.
- Responsive design.
- Smooth animations.

## Setup

1. Install dependencies: \`npm install\`
2. Start the development server: \`npm start\`
3. Open [http://localhost:3000](http://localhost:3000) to view the application.
`,
    },
  ],
  instructions: 'Template loaded successfully',
  dependencies: ['react', 'react-dom', 'framer-motion', 'lucide-react', '@radix-ui/react-slot', '@radix-ui/react-label', 'class-variance-authority', 'clsx', 'tailwind-merge', 'tailwindcss-animate', 'typescript', '@types/react', '@types/react-dom', 'tailwindcss', 'postcss', 'autoprefixer'],
};
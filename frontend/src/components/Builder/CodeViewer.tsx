'use client';

import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

// Import language support
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';

interface CodeViewerProps {
  code: string;
  language: string;
  fileName?: string;
  showLineNumbers?: boolean;
  streamingCursor?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language,
  fileName,
  showLineNumbers = true,
  streamingCursor = false
}) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const getLanguageClass = (lang: string): string => {
    const languageMap: Record<string, string> = {
      typescript: 'typescript',
      tsx: 'tsx',
      ts: 'typescript',
      javascript: 'javascript',
      jsx: 'jsx',
      js: 'javascript',
      json: 'json',
      markdown: 'markdown',
      md: 'markdown',
      css: 'css',
      python: 'python',
      py: 'python',
      bash: 'bash',
      sh: 'bash'
    };

    return languageMap[lang.toLowerCase()] || 'javascript';
  };

  const prismLanguage = getLanguageClass(language);
  const lines = code.split('\n');

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {fileName && (
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-sm text-gray-300 font-mono">
          {fileName}
        </div>
      )}

      <div className="relative">
        <pre className={`${showLineNumbers ? 'pl-12' : 'pl-4'} pr-4 py-4 overflow-auto text-sm`}>
          <code
            ref={codeRef}
            className={`language-${prismLanguage}`}
          >
            {code}
          </code>
          {streamingCursor && (
            <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1 align-middle" />
          )}
        </pre>

        {showLineNumbers && (
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-800 border-r border-gray-700 py-4 text-right pr-2 select-none">
            {lines.map((_, index) => (
              <div
                key={index}
                className="text-xs text-gray-500 leading-5 font-mono"
              >
                {index + 1}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Streaming Code Viewer - Shows code being typed in real-time
 */
interface StreamingCodeViewerProps extends CodeViewerProps {
  onStreamComplete?: () => void;
}

export const StreamingCodeViewer: React.FC<StreamingCodeViewerProps> = ({
  code,
  language,
  fileName,
  showLineNumbers = true,
  onStreamComplete
}) => {
  const [displayedCode, setDisplayedCode] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const chunkSize = 5; // Characters per update
    const interval = 30; // ms between updates

    const streamCode = setInterval(() => {
      if (currentIndex >= code.length) {
        setIsStreaming(false);
        clearInterval(streamCode);
        onStreamComplete?.();
        return;
      }

      const nextChunk = code.slice(0, currentIndex + chunkSize);
      setDisplayedCode(nextChunk);
      currentIndex += chunkSize;
    }, interval);

    return () => clearInterval(streamCode);
  }, [code, onStreamComplete]);

  return (
    <CodeViewer
      code={displayedCode}
      language={language}
      fileName={fileName}
      showLineNumbers={showLineNumbers}
      streamingCursor={isStreaming}
    />
  );
};

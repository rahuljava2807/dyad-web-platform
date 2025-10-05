export interface GenerationCallbacks {
  onFileStart: (file: { path: string; name: string; language: string }) => void;
  onContentChunk: (chunk: string) => void;
  onFileComplete: (file: { path: string; content: string; language: string; summary?: string }) => void;
  onComplete: (files: any[]) => void;
  onError: (error: any) => void;
  onProgress?: (progress: { current: number; total: number }) => void;

  // NEW: Thinking callbacks
  onThinkingStep?: (step: { title: string; description: string }) => void;
  onThinkingSummary?: (summary: string) => void;
}

export interface GenerationSettings {
  selectedIndustry: string;
  useYaviContext: boolean;
  provider?: string;
  temperature?: number;
}

export class GenerationService {
  private eventSource: EventSource | null = null;
  private sessionId: string | null = null;

  /**
   * Start application generation with real-time streaming
   */
  async generateApplication(
    prompt: string,
    settings: GenerationSettings,
    callbacks: GenerationCallbacks
  ): Promise<void> {
    try {
      // Start generation session
      const response = await fetch('/api/generation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, settings })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start generation');
      }

      const data = await response.json();
      const { files, sessionId, thinking } = data;

      // Handle thinking data if provided
      if (thinking) {
        // Send thinking summary
        if (thinking.summary) {
          callbacks.onThinkingSummary?.(thinking.summary);
        }

        // Send thinking steps
        if (thinking.steps && Array.isArray(thinking.steps)) {
          for (const step of thinking.steps) {
            callbacks.onThinkingStep?.({
              title: step.title,
              description: step.description
            });
          }
        }
      }

      // Handle non-streaming response (files returned immediately)
      if (files && Array.isArray(files)) {
        // Simulate streaming for UX consistency
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          callbacks.onFileStart({
            path: file.path,
            name: file.path.split('/').pop() || file.path,
            language: file.path.endsWith('.tsx') || file.path.endsWith('.ts') ? 'typescript' :
                     file.path.endsWith('.json') ? 'json' :
                     file.path.endsWith('.md') ? 'markdown' : 'text'
          });

          callbacks.onFileComplete({
            path: file.path,
            content: file.content,
            language: file.path.endsWith('.tsx') || file.path.endsWith('.ts') ? 'typescript' :
                     file.path.endsWith('.json') ? 'json' :
                     file.path.endsWith('.md') ? 'markdown' : 'text',
            summary: file.summary // Include summary if provided
          });

          callbacks.onProgress?.({
            current: i + 1,
            total: files.length
          });

          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        callbacks.onComplete(files);
      } else {
        throw new Error('No files generated');
      }
    } catch (error) {
      callbacks.onError(error);
    }
  }

  /**
   * Connect to Server-Sent Events stream
   */
  private connectToStream(sessionId: string, callbacks: GenerationCallbacks): void {
    this.eventSource = new EventSource(`/api/generation/stream/${sessionId}`);

    this.eventSource.addEventListener('file-start', (e) => {
      try {
        const data = JSON.parse(e.data);
        callbacks.onFileStart(data);
      } catch (error) {
        console.error('Error parsing file-start event:', error);
      }
    });

    this.eventSource.addEventListener('content-chunk', (e) => {
      try {
        const data = JSON.parse(e.data);
        callbacks.onContentChunk(data.content);
      } catch (error) {
        console.error('Error parsing content-chunk event:', error);
      }
    });

    this.eventSource.addEventListener('file-complete', (e) => {
      try {
        const data = JSON.parse(e.data);
        callbacks.onFileComplete(data);
      } catch (error) {
        console.error('Error parsing file-complete event:', error);
      }
    });

    this.eventSource.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data);
        callbacks.onProgress?.(data);
      } catch (error) {
        console.error('Error parsing progress event:', error);
      }
    });

    this.eventSource.addEventListener('generation-complete', (e) => {
      try {
        const data = JSON.parse(e.data);
        callbacks.onComplete(data.files);
        this.cleanup();
      } catch (error) {
        console.error('Error parsing generation-complete event:', error);
      }
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      callbacks.onError(error);
      this.cleanup();
    };
  }

  /**
   * Cancel ongoing generation
   */
  async cancel(): Promise<void> {
    if (this.sessionId) {
      try {
        await fetch(`/api/generation/cancel/${this.sessionId}`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error canceling generation:', error);
      }
    }
    this.cleanup();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.sessionId = null;
  }

  /**
   * Simulate streaming for development/testing
   */
  async simulateGeneration(
    prompt: string,
    settings: GenerationSettings,
    callbacks: GenerationCallbacks
  ): Promise<void> {
    const mockFiles = [
      {
        path: '/src/app/page.tsx',
        name: 'page.tsx',
        language: 'typescript',
        content: `'use client';\n\nimport React from 'react';\nimport { Dashboard } from '@/components/Dashboard';\n\nexport default function HomePage() {\n  return (\n    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">\n      <div className="max-w-6xl mx-auto">\n        <header className="mb-8">\n          <h1 className="text-4xl font-bold text-gray-900 mb-2">\n            ${settings.selectedIndustry} Dashboard\n          </h1>\n          <p className="text-gray-600">\n            ${prompt}\n          </p>\n        </header>\n        <Dashboard />\n      </div>\n    </div>\n  );\n}`
      },
      {
        path: '/src/components/Dashboard.tsx',
        name: 'Dashboard.tsx',
        language: 'typescript',
        content: `'use client';\n\nimport React from 'react';\n\nexport const Dashboard: React.FC = () => {\n  return (\n    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">\n        <h2 className="text-xl font-semibold mb-2">Overview</h2>\n        <p className="text-gray-600">\n          This is a ${settings.selectedIndustry} application\n        </p>\n      </div>\n    </div>\n  );\n};`
      },
      {
        path: '/package.json',
        name: 'package.json',
        language: 'json',
        content: JSON.stringify({
          name: `${settings.selectedIndustry}-app`,
          version: '1.0.0',
          dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            next: '^14.2.15'
          }
        }, null, 2)
      }
    ];

    for (let i = 0; i < mockFiles.length; i++) {
      const file = mockFiles[i];

      // File start event
      callbacks.onFileStart({
        path: file.path,
        name: file.name,
        language: file.language
      });

      // Simulate streaming content
      const content = file.content;
      const chunkSize = 50;
      for (let j = 0; j < content.length; j += chunkSize) {
        const chunk = content.slice(j, j + chunkSize);
        callbacks.onContentChunk(chunk);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // File complete event
      callbacks.onFileComplete({
        path: file.path,
        content: file.content,
        language: file.language
      });

      // Progress update
      callbacks.onProgress?.({
        current: i + 1,
        total: mockFiles.length
      });

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Generation complete
    callbacks.onComplete(mockFiles);
  }
}

// Export singleton instance
export const generationService = new GenerationService();

'use client';

import React, { useMemo } from 'react';
import { SandpackProvider, SandpackPreview, SandpackFiles } from '@codesandbox/sandpack-react';
import { ProjectFile } from '@/store/projectStore';

interface ReactSandboxProps {
  files: ProjectFile[];
  showConsole?: boolean;
  showNavigator?: boolean;
  theme?: 'light' | 'dark';
}

export const ReactSandbox: React.FC<ReactSandboxProps> = ({
  files,
  showConsole = false,
  showNavigator = false,
  theme = 'light'
}) => {
  // Convert ProjectFile[] to Sandpack format
  const sandpackFiles: SandpackFiles = useMemo(() => {
    const fileMap: SandpackFiles = {};

    files.forEach((file) => {
      // Ensure path starts with /
      const filePath = file.path.startsWith('/') ? file.path : `/${file.path}`;
      fileMap[filePath] = {
        code: file.content
      };
    });

    // If no index.html, create one (CSS loaded via styles.css)
    if (!fileMap['/index.html'] && !fileMap['/public/index.html']) {
      fileMap['/public/index.html'] = {
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
      };
    }

    // If no index.tsx/jsx, create one that renders App
    if (!fileMap['/src/index.tsx'] && !fileMap['/index.tsx']) {
      const appFile = files.find(f =>
        f.path.includes('App.tsx') ||
        f.path.includes('app.tsx') ||
        f.path.includes('App.jsx')
      );

      if (appFile) {
        const appPath = appFile.path.startsWith('/') ? appFile.path : `/${appFile.path}`;
        fileMap['/src/index.tsx'] = {
          code: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '${appPath.replace('/src/', './')}';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);`
        };
      }
    }

    // Add App.css if referenced but missing
    if (!fileMap['/src/App.css']) {
      fileMap['/src/App.css'] = {
        code: `/* App styles - Tailwind utilities via styles.css */
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`
      };
    }

    // Add comprehensive CSS with Tailwind utilities (no CDN dependency)
    if (!fileMap['/src/styles.css']) {
      fileMap['/src/styles.css'] = {
        code: `/* Comprehensive Tailwind-like CSS */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
#root { width: 100%; min-height: 100vh; }

/* Layout */
.flex { display: flex; } .flex-col { flex-direction: column; } .flex-1 { flex: 1; }
.items-center { align-items: center; } .items-start { align-items: flex-start; }
.justify-center { justify-content: center; } .justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; } .gap-3 { gap: 0.75rem; } .gap-4 { gap: 1rem; } .gap-6 { gap: 1.5rem; }
.grid { display: grid; } .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.h-screen { height: 100vh; } .h-full { height: 100%; } .min-h-screen { min-height: 100vh; }
.w-full { width: 100%; } .overflow-hidden { overflow: hidden; } .overflow-y-auto { overflow-y: auto; }

/* Spacing */
.p-2 { padding: 0.5rem; } .p-4 { padding: 1rem; } .p-6 { padding: 1.5rem; } .p-8 { padding: 2rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; } .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; } .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.m-4 { margin: 1rem; } .mx-auto { margin-left: auto; margin-right: auto; }
.mt-2 { margin-top: 0.5rem; } .mt-4 { margin-top: 1rem; } .mb-4 { margin-bottom: 1rem; }
.space-y-4 > * + * { margin-top: 1rem; } .space-y-6 > * + * { margin-top: 1.5rem; }

/* Backgrounds */
.bg-white { background-color: #ffffff; } .bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; } .bg-gray-200 { background-color: #e5e7eb; }
.bg-gray-800 { background-color: #1f2937; } .bg-blue-50 { background-color: #eff6ff; }
.bg-blue-500 { background-color: #3b82f6; } .bg-blue-600 { background-color: #2563eb; }
.bg-green-50 { background-color: #f0fdf4; } .bg-green-500 { background-color: #22c55e; }
.bg-red-50 { background-color: #fef2f2; } .bg-purple-50 { background-color: #faf5ff; }
.bg-gradient-to-r { background-image: linear-gradient(to right, #3b82f6, #9333ea); }
.from-blue-500 { background-image: linear-gradient(to right, #3b82f6, transparent); }
.to-purple-600 { background-image: linear-gradient(to right, transparent, #9333ea); }

/* Text Colors */
.text-white { color: #ffffff; } .text-gray-400 { color: #9ca3af; } .text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; } .text-gray-700 { color: #374151; } .text-gray-800 { color: #1f2937; }
.text-gray-900 { color: #111827; } .text-blue-600 { color: #2563eb; } .text-green-600 { color: #16a34a; }

/* Typography */
.text-xs { font-size: 0.75rem; } .text-sm { font-size: 0.875rem; } .text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; } .text-xl { font-size: 1.25rem; } .text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; } .text-4xl { font-size: 2.25rem; }
.font-medium { font-weight: 500; } .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
.text-center { text-align: center; }

/* Borders & Radius */
.border { border: 1px solid #e5e7eb; } .border-t { border-top: 1px solid #e5e7eb; }
.border-b { border-bottom: 1px solid #e5e7eb; } .border-gray-200 { border-color: #e5e7eb; }
.rounded { border-radius: 0.25rem; } .rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; } .rounded-full { border-radius: 9999px; }

/* Shadows */
.shadow { box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }

/* Hover & Transitions */
.cursor-pointer { cursor: pointer; }
.transition { transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
.duration-200 { transition-duration: 200ms; } .duration-300 { transition-duration: 300ms; }
.hover\\:bg-gray-100:hover { background-color: #f3f4f6; }
.hover\\:bg-blue-600:hover { background-color: #2563eb; }
.hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.hover\\:scale-105:hover { transform: scale(1.05); }

/* Position */
.relative { position: relative; } .absolute { position: absolute; } .fixed { position: fixed; }
.sticky { position: sticky; } .top-0 { top: 0; }

/* Widths */
.max-w-7xl { max-width: 80rem; } .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }`
      };
    }

    return fileMap;
  }, [files]);

  // Extract dependencies from package.json
  const customDependencies = useMemo(() => {
    const packageJsonFile = files.find(f => f.path.includes('package.json'));
    if (packageJsonFile) {
      try {
        const packageJson = JSON.parse(packageJsonFile.content);
        const deps = packageJson.dependencies || {};

        // Filter out build-time dependencies that won't work in browser sandbox
        const filteredDeps: Record<string, string> = {};
        Object.keys(deps).forEach(dep => {
          // Exclude tailwindcss and other build tools
          if (!['tailwindcss', 'postcss', 'autoprefixer', '@tailwindcss/forms'].includes(dep)) {
            filteredDeps[dep] = deps[dep];
          }
        });

        console.log('Filtered dependencies:', filteredDeps);
        return filteredDeps;
      } catch (err) {
        console.error('Error parsing package.json:', err);
      }
    }

    // Default dependencies
    return {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'framer-motion': '^11.0.0',
      'recharts': '^2.10.0',
      'lucide-react': '^0.294.0'
    };
  }, [files]);

  // Sandpack options
  const sandpackOptions = {
    showConsole,
    showNavigator,
    showTabs: false,
    showLineNumbers: false,
    showInlineErrors: true,
    wrapContent: true,
    editorHeight: '100%',
    editorWidthPercentage: 0,
    autorun: true,
    autoReload: true,
    recompileMode: 'immediate',
    recompileDelay: 500
  };

  console.log('ReactSandbox rendering with files:', Object.keys(sandpackFiles));
  console.log('Dependencies:', customDependencies);

  return (
    <div className="w-full h-full">
      <SandpackProvider
        template="react-ts"
        theme={theme === 'dark' ? 'dark' : 'light'}
        files={sandpackFiles}
        customSetup={{
          dependencies: customDependencies,
          environment: 'create-react-app'
        }}
        options={{
          ...sandpackOptions,
          showConsoleButton: true,
          showInlineErrors: true,
          editorHeight: '100%',
          editorWidthPercentage: 0,
          bundlerURL: 'https://sandpack-bundler.codesandbox.io'
        }}
      >
        <SandpackPreview
          showNavigator={showNavigator}
          showOpenInCodeSandbox={false}
          showRefreshButton={true}
          showSandpackErrorOverlay={true}
        />
      </SandpackProvider>
    </div>
  );
};

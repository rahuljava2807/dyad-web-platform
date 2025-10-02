import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Create a unique session ID for this preview
    const sessionId = uuidv4();
    const previewDir = path.join(process.cwd(), 'public', 'previews', sessionId);

    // Ensure the previews directory exists
    await fs.mkdir(previewDir, { recursive: true });

    // Write all files to the preview directory
    for (const file of files) {
      const filePath = path.join(previewDir, file.path);
      const fileDir = path.dirname(filePath);

      // Create subdirectories if needed
      await fs.mkdir(fileDir, { recursive: true });

      // Write the file content
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    // Find the main HTML file
    const indexFile = files.find((f: any) =>
      f.path === 'index.html' ||
      f.path.endsWith('/index.html') ||
      f.path === 'public/index.html'
    );

    if (!indexFile) {
      // If no index.html, create a basic wrapper
      const htmlContent = generateHTMLWrapper(files);
      await fs.writeFile(path.join(previewDir, 'index.html'), htmlContent, 'utf-8');
    }

    // Return the preview URL
    const previewUrl = `/previews/${sessionId}/index.html`;

    return NextResponse.json({
      url: previewUrl,
      sessionId
    });

  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate a basic HTML wrapper if no index.html exists
function generateHTMLWrapper(files: any[]): string {
  // Find React component files
  const jsFiles = files.filter(f => f.path.endsWith('.jsx') || f.path.endsWith('.tsx') || f.path.endsWith('.js'));
  const cssFiles = files.filter(f => f.path.endsWith('.css'));

  // Create a simple HTML wrapper
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  ${cssFiles.map(f => `<link rel="stylesheet" href="${f.path}">`).join('\n  ')}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  ${jsFiles.map(f => {
    // Embed the file content directly instead of loading from src
    let content = f.content;

    // Extract Lucide icon imports and make them available
    const lucideImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
    if (lucideImportMatch) {
      const icons = lucideImportMatch[1].split(',').map(i => i.trim());
      const iconDeclarations = icons.map(icon => `const ${icon} = lucide.${icon};`).join('\n');
      content = iconDeclarations + '\n' + content;
    }

    // Remove all imports
    content = content.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');

    // Handle React imports specifically
    content = 'const React = window.React;\nconst { useState, useEffect, useRef } = React;\n' + content;

    // Export default as window.App
    content = content.replace(/export\s+default\s+/g, 'window.App = ');

    // Export named exports to window
    content = content.replace(/export\s+(const|function)\s+(\w+)/g, 'window.$2 = $2; $1 $2');

    if (f.path.endsWith('.jsx') || f.path.endsWith('.tsx')) {
      return `<script type="text/babel">\n${content}\n</script>`;
    }
    return `<script>\n${content}\n</script>`;
  }).join('\n  ')}

  <script type="text/babel">
    // Wait for Babel to finish transforming, then render
    setTimeout(() => {
      console.log('Attempting to render application...');
      console.log('Window.App:', typeof window.App);
      console.log('Available window properties:', Object.keys(window).filter(k => k.match(/^[A-Z]/)).slice(0, 20));

      const root = ReactDOM.createRoot(document.getElementById('root'));

      // Try to find and render the main component
      const componentNames = ['App', 'Dashboard', 'Main', 'Application'];
      let rendered = false;

      for (const name of componentNames) {
        console.log('Checking for component:', name, typeof window[name]);
        if (typeof window[name] !== 'undefined') {
          const Component = window[name];
          console.log('Found component:', name, Component);
          root.render(React.createElement(Component));
          rendered = true;
          console.log('✅ Successfully rendered component:', name);
          break;
        }
      }

      if (!rendered) {
        console.log('No standard component found, searching for React components...');

        // Try to find any React component exports
        const possibleComponents = Object.keys(window).filter(key =>
          typeof window[key] === 'function' &&
          key.charAt(0) === key.charAt(0).toUpperCase() &&
          key.length > 1
        );

        console.log('Possible component candidates:', possibleComponents);

        if (possibleComponents.length > 0) {
          const Component = window[possibleComponents[0]];
          console.log('Attempting to render:', possibleComponents[0], Component);
          root.render(React.createElement(Component));
          console.log('✅ Rendered component:', possibleComponents[0]);
        } else {
          console.warn('⚠️ No React component found, rendering fallback');
          // Render fallback message
          root.render(
            React.createElement('div', { className: 'min-h-screen bg-gray-100 p-8' },
              React.createElement('div', { className: 'max-w-7xl mx-auto' },
                React.createElement('div', { className: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6' },
                  React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-4' }, 'Application Preview'),
                  React.createElement('p', { className: 'text-gray-600 mb-4' }, 'Generated files loaded successfully.'),
                  React.createElement('div', { className: 'bg-gray-50 rounded p-4' },
                    React.createElement('p', { className: 'text-sm font-mono text-gray-700' },
                      '${files.map(f => f.path).join(', ')}'
                    )
                  ),
                  React.createElement('p', { className: 'text-sm text-gray-500 mt-4' },
                    'Component not found. Check console for details.'
                  )
                )
              )
            )
          );
        }
      }
    }, 1000); // Wait 1 second for Babel to transform scripts
  </script>
</body>
</html>`;

  return html;
}

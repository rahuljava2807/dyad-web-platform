/**
 * Generate HTML runtime for preview iframe
 * This creates a standalone HTML page with React and the bundled app code
 */
export function generatePreviewHTML(bundledCode: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- React & ReactDOM from CDN (development for better errors) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    #root {
      width: 100%;
      min-height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- Error boundary -->
  <script>
    window.onerror = function(message, source, lineno, colno, error) {
      console.error('[Preview Error]', message, error);
      const root = document.getElementById('root');
      if (root && !root.innerHTML) {
        root.innerHTML = \`
          <div style="padding: 40px; font-family: system-ui, sans-serif;">
            <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 16px;">Preview Error</h1>
            <p style="color: #64748b; margin-bottom: 12px;">\${message}</p>
            <pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; color: #334155;">\${error?.stack || 'No stack trace available'}</pre>
          </div>
        \`;
      }
      return true;
    };
  </script>

  <!-- Bundled application code -->
  <script>
    ${bundledCode}
  </script>
</body>
</html>`;
}

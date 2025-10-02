import { ProjectFile } from '@/store/projectStore';

export class PreviewService {
  /**
   * Generate a preview URL from generated files
   */
  static async generatePreview(files: ProjectFile[]): Promise<string> {
    if (!files || files.length === 0) {
      throw new Error('No files to preview');
    }

    // Find main files
    const htmlFile = files.find(f => f.path.endsWith('.html') || f.path.endsWith('index.html'));
    const jsFiles = files.filter(f =>
      f.path.endsWith('.js') ||
      f.path.endsWith('.jsx') ||
      f.path.endsWith('.tsx') ||
      f.path.endsWith('.ts')
    );
    const cssFiles = files.filter(f => f.path.endsWith('.css'));

    // Bundle the application
    const previewHTML = this.bundleApplication(htmlFile, jsFiles, cssFiles, files);

    // Create a blob URL
    const blob = new Blob([previewHTML], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  /**
   * Bundle all files into a single HTML preview
   */
  private static bundleApplication(
    htmlFile: ProjectFile | undefined,
    jsFiles: ProjectFile[],
    cssFiles: ProjectFile[],
    allFiles: ProjectFile[]
  ): string {
    // Start with base HTML or create one
    let html = htmlFile?.content || this.createDefaultHTML();

    // Add CSS
    if (cssFiles.length > 0) {
      const cssContent = cssFiles.map(f => f.content).join('\n');
      const styleTag = `\n<style>\n${cssContent}\n</style>`;

      if (html.includes('</head>')) {
        html = html.replace('</head>', `${styleTag}\n</head>`);
      } else {
        html = `<!DOCTYPE html><html><head>${styleTag}</head><body>${html}</body></html>`;
      }
    }

    // Add required libraries
    html = this.injectLibraries(html);

    // Add JavaScript
    if (jsFiles.length > 0) {
      // Transform JSX/TSX to JavaScript (simplified - in production use Babel standalone)
      const jsContent = jsFiles.map(f => this.transformToJS(f)).join('\n\n');
      const scriptTag = `\n<script type="text/babel">\n${jsContent}\n</script>`;

      if (html.includes('</body>')) {
        html = html.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        html += scriptTag;
      }
    }

    // Add initialization script
    html = this.addInitScript(html);

    return html;
  }

  /**
   * Create a default HTML template
   */
  private static createDefaultHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
  }

  /**
   * Inject required libraries (React, Tailwind, etc.)
   */
  private static injectLibraries(html: string): string {
    const libraries = `
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>`;

    if (html.includes('<head>')) {
      return html.replace('<head>', `<head>${libraries}`);
    }
    return `<!DOCTYPE html><html><head>${libraries}</head><body>${html}</body></html>`;
  }

  /**
   * Transform TypeScript/JSX to JavaScript (simplified)
   */
  private static transformToJS(file: ProjectFile): string {
    let content = file.content;

    // Remove TypeScript type annotations (basic)
    content = content.replace(/:\s*\w+(\[\])?/g, '');
    content = content.replace(/interface\s+\w+\s*\{[^}]*\}/g, '');
    content = content.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');

    // Add file comment
    content = `// File: ${file.path}\n${content}`;

    return content;
  }

  /**
   * Add initialization script to mount React app
   */
  private static addInitScript(html: string): string {
    const initScript = `
<script type="text/babel">
  // Auto-initialize React app
  (function() {
    const root = document.getElementById('root');
    if (root && typeof App !== 'undefined') {
      const rootElement = ReactDOM.createRoot(root);
      rootElement.render(<App />);
    } else if (root && typeof Dashboard !== 'undefined') {
      const rootElement = ReactDOM.createRoot(root);
      rootElement.render(<Dashboard />);
    } else if (root) {
      // Fallback: show a message
      root.innerHTML = \`
        <div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif;">
          <h1 style="color: #333;">Preview Ready</h1>
          <p style="color: #666; margin-top: 10px;">Application files have been loaded</p>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            Check the browser console for component details
          </p>
        </div>
      \`;
    }
  })();
</script>`;

    if (html.includes('</body>')) {
      return html.replace('</body>', `${initScript}\n</body>`);
    }
    return html + initScript;
  }

  /**
   * Clean up blob URL when done
   */
  static revokePreviewURL(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}

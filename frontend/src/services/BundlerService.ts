import * as esbuild from 'esbuild-wasm';
import { ProjectFile } from '@/store/projectStore';

let esbuildInitialized = false;

export class BundlerService {
  /**
   * Initialize esbuild-wasm (call once on app load)
   */
  static async initialize(): Promise<void> {
    if (esbuildInitialized) return;

    try {
      await esbuild.initialize({
        wasmURL: 'https://unpkg.com/esbuild-wasm@0.19.12/esbuild.wasm',
      });
      esbuildInitialized = true;
      console.log('[Bundler] esbuild initialized');
    } catch (error) {
      console.error('[Bundler] Failed to initialize esbuild:', error);
      throw error;
    }
  }

  /**
   * Bundle React application from generated files
   */
  static async bundle(files: ProjectFile[]): Promise<string> {
    if (!esbuildInitialized) {
      await this.initialize();
    }

    try {
      // Find the main App component
      const appFile = files.find(
        (f) =>
          f.path.includes('App.tsx') ||
          f.path.includes('app.tsx') ||
          f.path.includes('App.jsx')
      );

      if (!appFile) {
        throw new Error('No App.tsx file found in generated files');
      }

      // Create entry point that renders the App
      const entryPoint = `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const root = document.getElementById('root');
if (root) {
  // Use ReactDOM.render for compatibility with UMD React
  ReactDOM.render(React.createElement(App), root);
}
`;

      // Build file system for esbuild
      const fileSystem: Record<string, string> = {};
      files.forEach((file) => {
        // Normalize path
        let path = file.path;
        if (!path.startsWith('/')) path = '/' + path;
        if (!path.startsWith('/src/')) {
          if (path.startsWith('/')) {
            path = '/src' + path;
          } else {
            path = '/src/' + path;
          }
        }

        // Preprocess content: ensure React is imported at top for JSX
        let content = file.content;
        if (path.endsWith('.tsx') || path.endsWith('.jsx')) {
          // Check if React is already imported
          if (!content.includes("import React")) {
            // Add React import at the top
            content = "import React from 'react';\n" + content;
          }
        }

        fileSystem[path] = content;
      });

      // Add entry point
      fileSystem['/entry.tsx'] = entryPoint;

      console.log('[Bundler] File system:', Object.keys(fileSystem));

      // Bundle with esbuild
      const result = await esbuild.build({
        stdin: {
          contents: entryPoint,
          loader: 'tsx',
          resolveDir: '/src',
          sourcefile: 'entry.tsx',
        },
        bundle: true,
        write: false,
        format: 'iife',
        globalName: 'App',
        jsx: 'transform',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        target: 'es2020',
        platform: 'browser',
        plugins: [
          {
            name: 'virtual-fs',
            setup(build) {
              // Resolve imports from our virtual file system
              build.onResolve({ filter: /.*/ }, (args) => {
                // Handle relative imports
                if (args.path.startsWith('.')) {
                  const currentDir = args.importer.substring(
                    0,
                    args.importer.lastIndexOf('/')
                  );
                  let resolved = currentDir + '/' + args.path;

                  // Normalize path
                  resolved = resolved.replace(/\/\.\//g, '/');
                  while (resolved.includes('../')) {
                    resolved = resolved.replace(/\/[^/]+\/\.\.\//g, '/');
                  }

                  // Try with extensions
                  const extensions = ['', '.tsx', '.ts', '.jsx', '.js'];
                  for (const ext of extensions) {
                    if (fileSystem[resolved + ext]) {
                      return { path: resolved + ext, namespace: 'virtual' };
                    }
                  }

                  console.warn('[Bundler] Could not resolve:', args.path, 'from', args.importer);
                  return { path: resolved, namespace: 'virtual' };
                }

                // Handle absolute imports
                if (args.path.startsWith('/')) {
                  if (fileSystem[args.path]) {
                    return { path: args.path, namespace: 'virtual' };
                  }
                }

                // Handle node_modules (React, Recharts, Framer Motion, etc.) - mark as external
                if (
                  args.path === 'react' ||
                  args.path === 'react-dom' ||
                  args.path === 'react-dom/client' ||
                  args.path.startsWith('react/') ||
                  args.path.startsWith('react-dom/') ||
                  args.path === 'recharts' ||
                  args.path.startsWith('recharts/') ||
                  args.path === 'framer-motion' ||
                  args.path.startsWith('framer-motion/') ||
                  args.path === 'lucide-react' ||
                  args.path.startsWith('lucide-react/')
                ) {
                  return { path: args.path, namespace: 'external' };
                }

                // Default: try to find in src
                const srcPath = '/src/' + args.path;
                if (fileSystem[srcPath]) {
                  return { path: srcPath, namespace: 'virtual' };
                }

                // Try with extensions
                const extensions = ['.tsx', '.ts', '.jsx', '.js'];
                for (const ext of extensions) {
                  if (fileSystem[srcPath + ext]) {
                    return { path: srcPath + ext, namespace: 'virtual' };
                  }
                }

                console.warn('[Bundler] Unresolved import:', args.path);
                return { path: args.path, namespace: 'external' };
              });

              // Load from virtual file system
              build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
                const contents = fileSystem[args.path];
                if (contents === undefined) {
                  console.error('[Bundler] File not found:', args.path);
                  return { contents: '', loader: 'tsx' };
                }

                const loader = args.path.endsWith('.ts')
                  ? 'ts'
                  : args.path.endsWith('.tsx')
                  ? 'tsx'
                  : args.path.endsWith('.js')
                  ? 'js'
                  : args.path.endsWith('.jsx')
                  ? 'jsx'
                  : 'tsx';

                return { contents, loader };
              });

              // External modules return global variables (loaded from CDN)
              build.onLoad({ filter: /.*/, namespace: 'external' }, (args) => {
                if (args.path === 'react') {
                  return {
                    contents: `module.exports = window.React`,
                    loader: 'js',
                  };
                }
                if (args.path === 'react-dom' || args.path === 'react-dom/client') {
                  return {
                    contents: `module.exports = window.ReactDOM`,
                    loader: 'js',
                  };
                }
                if (args.path === 'recharts') {
                  return {
                    contents: `module.exports = window.Recharts || {}`,
                    loader: 'js',
                  };
                }
                if (args.path.startsWith('recharts/')) {
                  // Handle recharts sub-imports like 'recharts/BarChart'
                  return {
                    contents: `module.exports = window.Recharts || {}`,
                    loader: 'js',
                  };
                }
                if (args.path === 'framer-motion') {
                  return {
                    contents: `module.exports = window.FramerMotion || { motion: {}, AnimatePresence: function({children}) { return children; } }`,
                    loader: 'js',
                  };
                }
                if (args.path === 'lucide-react') {
                  // Lucide icons - provide empty stubs
                  return {
                    contents: `module.exports = new Proxy({}, { get: function(target, prop) { return function(props) { return null; } } })`,
                    loader: 'js',
                  };
                }
                return {
                  contents: `module.exports = {}`,
                  loader: 'js',
                };
              });
            },
          },
        ],
      });

      if (result.errors.length > 0) {
        console.error('[Bundler] Build errors:', result.errors);
        throw new Error(
          'Build failed: ' + result.errors.map((e) => e.text).join('\n')
        );
      }

      if (result.warnings.length > 0) {
        console.warn('[Bundler] Build warnings:', result.warnings);
      }

      const bundledCode = result.outputFiles?.[0]?.text || '';
      console.log('[Bundler] Bundle size:', bundledCode.length, 'bytes');

      return bundledCode;
    } catch (error) {
      console.error('[Bundler] Bundle error:', error);
      throw error;
    }
  }
}

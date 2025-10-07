const express = require('express');
const esbuild = require('esbuild');
const cors = require('cors');
const path = require('path'); // Import path module

const app = express();
const PORT = 3001; // Or any other available port

app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '50mb' })); // Increase limit for large file contents

app.post('/bundle', async (req, res) => {
  const files = req.body.files; // Expecting an object like { 'main.tsx': '...', 'App.tsx': '...' }

  if (!files) {
    return res.status(400).json({ error: 'No files provided for bundling.' });
  }

  const entryPoint = files['main.tsx'] ? 'main.tsx' : files['index.tsx'] ? 'index.tsx' : null;

  if (!entryPoint) {
    return res.status(400).json({ error: 'No entry point found (e.g., main.tsx or index.tsx).' });
  }

  try {
    const result = await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      write: false,
      format: 'iife', // Change to IIFE
      globalName: 'AppBundle', // Add a global name
      // REMOVED: external: ['react', 'react-dom'], // Mark react and react-dom as external
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.js': 'js',
        '.jsx': 'jsx',
      },
      plugins: [
        {
          name: 'memory-fs-loader',
          setup(build) {
            build.onResolve({ filter: /.*/ }, args => {
              // If it's a bare import (e.g., 'react', 'react-dom')
              if (!args.path.startsWith('.') && !args.path.startsWith('/')) {
                if (args.path === 'react' || args.path === 'react-dom' || args.path === 'react-dom/client') {
                  return { path: args.path, external: true }; // These are handled by CDN
                }
                // For other bare imports, let esbuild handle them as external
                return { path: args.path, external: true };
              }

              // For relative or absolute paths
              let resolvedPath = args.path;
              if (args.resolveDir) { // args.resolveDir is the directory of the importing file
                // This is a simplified path resolution. In a real scenario, you'd use a proper path resolver.
                resolvedPath = path.resolve(args.resolveDir, args.path);
                // Remove leading slash if it's an absolute path from root
                // This assumes our in-memory files are stored without leading slashes
                if (resolvedPath.startsWith('/')) {
                  resolvedPath = resolvedPath.substring(1);
                }
              }

              // Check if the resolved path exists in our in-memory files
              if (files[resolvedPath]) {
                return { path: resolvedPath, namespace: 'memory-fs' };
              }

              // If not found in memory-fs, let esbuild handle it as an external module.
              return { path: args.path, external: true };
            });

            build.onLoad({ filter: /.*/, namespace: 'memory-fs' }, async (args) => {
              let contents = files[args.path];

              // Replace React and ReactDOM imports with global access
              contents = contents.replace(/import React from ['"]react['"];/, 'const React = window.React;');
              contents = contents.replace(/import ReactDOM from ['"]react-dom['"];/, 'const ReactDOM = window.ReactDOM;');
              contents = contents.replace(/import ReactDOM from ['"]react-dom\/client['"];/, 'const ReactDOM = window.ReactDOM;');

              return {
                contents: contents,
                loader: args.path.endsWith('.tsx') ? 'tsx' : args.path.endsWith('.ts') ? 'ts' : 'jsx',
              };
            });
          },
        },
      ],
    });

    if (result.outputFiles && result.outputFiles.length > 0) {
      res.json({ bundledCode: result.outputFiles[0].text });
    } else {
      res.status(500).json({ error: 'esbuild did not produce any output files.' });
    }
  } catch (error) {
    console.error('esbuild bundling failed:', error);
    res.status(500).json({ error: `Bundling failed: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Bundler backend listening on port ${PORT}`);
});

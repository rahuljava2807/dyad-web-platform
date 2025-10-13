import { spawn, ChildProcess, execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Process management inspired by Dyad's app_handlers.ts
interface RunningApp {
  process: ChildProcess;
  processId: number;
  appId: string;
  port?: number;
  proxyUrl?: string;
  createdAt: Date;
}

interface ProcessOutput {
  message: string;
  type: 'stdout' | 'stderr' | 'error';
  appId: string;
  timestamp: number;
}

class ProcessManager {
  private runningApps = new Map<string, RunningApp>();
  private processCounter = 0;
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp', 'apps');
    // Directory will be created when needed
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create temp directory:', error);
    }
  }

  private getNextProcessId(): number {
    return ++this.processCounter;
  }

  private async findAvailablePort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = createServer();
      server.listen(0, () => {
        const port = (server.address() as any).port;
        server.close(() => resolve(port));
      });
      server.on('error', (err) => reject(err));
    });
  }

  async createAppProject(files: Array<{ path: string; content: string; language: string }>): Promise<string> {
    logger.info('ENTERING createAppProject - v3');
    const appId = uuidv4();
    const appPath = path.join(this.tempDir, appId);
    
    try {
      // Ensure temp directory exists
      await this.ensureTempDir();
      
      // Create app directory
      await fs.mkdir(appPath, { recursive: true });

      // Detect if this is a React/TypeScript project or simple HTML
      const hasReactFiles = files.some(f => 
        f.path.includes('.tsx') || 
        f.path.includes('.jsx') || 
        f.content.includes('React') ||
        f.content.includes('react')
      );
      
      const hasTypeScriptFiles = files.some(f => 
        f.path.includes('.ts') || 
        f.path.includes('.tsx')
      );

      // Define base package.json
      let packageJson: any;
      
      if (hasReactFiles || hasTypeScriptFiles) {
        // React/TypeScript project - use Vite with build mode
        packageJson = {
          name: `yavi-app-${appId}`,
          version: '1.0.0',
          private: true,
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'npx serve dist -p 3001 -s'
          },
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0'
          },
          devDependencies: {
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            '@vitejs/plugin-react': '^4.2.0',
            'vite': '^5.0.0',
            'typescript': '^5.0.0',
            'tailwindcss': '^3.3.0',
            'autoprefixer': '^10.4.0',
            'postcss': '^8.4.0',
            '@types/node': '^20.0.0',
            'serve': '^14.2.0'
          }
        };

        await fs.writeFile(
          path.join(appPath, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );

        // Write vite.config.ts - optimized for build mode
        const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ fastRefresh: false })], // Disable fast refresh
  server: {
    hmr: false, // Disable HMR completely
  },
  build: {
    outDir: 'dist',
    minify: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  },
  define: {
    // Disable hot module replacement
    'import.meta.hot': 'undefined'
  }
})`;

        await fs.writeFile(path.join(appPath, 'vite.config.ts'), viteConfig);

        // Write index.html for React
        const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yavi App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

        await fs.writeFile(path.join(appPath, 'index.html'), indexHtml);
      } else {
        // Simple HTML project - use static server
        packageJson = {
          name: `yavi-app-${appId}`,
          version: '1.0.0',
          private: true,
          scripts: {
            dev: 'npx serve . -p 3001 -s',
            build: 'echo "No build step needed for static HTML"',
            preview: 'npx serve . -p 3001 -s'
          },
          devDependencies: {
            'serve': '^14.2.0'
          }
        };

        await fs.writeFile(
          path.join(appPath, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );

        // Find the main HTML file or create index.html
        const htmlFile = files.find(f => f.path.endsWith('.html')) || files[0];
        const indexHtml = htmlFile ? htmlFile.content : `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yavi App</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`;

        await fs.writeFile(path.join(appPath, 'index.html'), indexHtml);
      }

      if (hasReactFiles || hasTypeScriptFiles) {
        // Write src directory structure for React projects
        await fs.mkdir(path.join(appPath, 'src'), { recursive: true });

        // Write main.tsx
        const mainTsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`;

        await fs.writeFile(path.join(appPath, 'src', 'main.tsx'), mainTsx);

        // Write index.css
        const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}`;

        await fs.writeFile(path.join(appPath, 'src', 'index.css'), indexCss);

        // Write tailwind.config.js
        const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

        await fs.writeFile(path.join(appPath, 'tailwind.config.js'), tailwindConfig);
      }

      // Write postcss.config.js
      const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

      await fs.writeFile(path.join(appPath, 'postcss.config.js'), postcssConfig);

      // Write tsconfig.json
      const tsconfigJson = {
        "compilerOptions": {
          "target": "ES2020",
          "useDefineForClassFields": true,
          "lib": ["ES2020", "DOM", "DOM.Iterable"],
          "module": "ESNext",
          "skipLibCheck": true,
          "moduleResolution": "bundler",
          "allowImportingTsExtensions": true,
          "resolveJsonModule": true,
          "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
          "strict": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "noFallthroughCasesInSwitch": true
        },
        "include": ["src"],
        "references": [{ "path": "./tsconfig.node.json" }]
      };

      await fs.writeFile(path.join(appPath, 'tsconfig.json'), JSON.stringify(tsconfigJson, null, 2));

      // Write tsconfig.node.json
      const tsconfigNodeJson = {
        "compilerOptions": {
          "composite": true,
          "skipLibCheck": true,
          "module": "ESNext",
          "moduleResolution": "bundler",
          "allowSyntheticDefaultImports": true
        },
        "include": ["vite.config.ts"]
      };

      await fs.writeFile(path.join(appPath, 'tsconfig.node.json'), JSON.stringify(tsconfigNodeJson, null, 2));

      // --- START PATCH --- 
      // Find and patch the package.json file from the AI to prevent conflicts.
      const packageJsonIndex = files.findIndex(f => path.basename(f.path) === 'package.json');
      if (packageJsonIndex !== -1) {
          try {
              const pkg = JSON.parse(files[packageJsonIndex].content);

              // Ensure scripts object exists
              if (!pkg.scripts) {
                  pkg.scripts = {};
              }
              // Ensure dev script exists and uses vite
              if (!pkg.scripts.dev || !pkg.scripts.dev.includes('vite')) {
                  pkg.scripts.dev = 'vite';
                  logger.info('Patched package.json: Added/corrected dev script to use vite.');
              }

              // Remove conflicting react-scripts dependency
              if (pkg.dependencies && pkg.dependencies['react-scripts']) {
                  delete pkg.dependencies['react-scripts'];
                  logger.info('Patched package.json: Removed conflicting "react-scripts" dependency.');
              }
              if (pkg.devDependencies && pkg.devDependencies['react-scripts']) {
                  delete pkg.devDependencies['react-scripts'];
                  logger.info('Patched package.json: Removed conflicting "react-scripts" devDependency.');
              }

              files[packageJsonIndex].content = JSON.stringify(pkg, null, 2);
          } catch (e) {
              logger.error('Failed to parse or patch AI-generated package.json. The file may be malformed.', e);
              // We will proceed, but npm install will likely fail.
          }
      }
      // --- END PATCH ---

      // Write generated files
      for (const file of files) {
        if (path.basename(file.path) === 'package.json') continue; // Explicitly ignore AI-generated package.json

        const filePath = path.join(appPath, file.path);
        const fileDir = path.dirname(filePath);

        // Create subdirectories
        await fs.mkdir(fileDir, { recursive: true });

        // Write file content
        await fs.writeFile(filePath, file.content, 'utf-8');
      }

      logger.info(`Created app project at ${appPath}`);
      return appPath;

    } catch (error) {
      logger.error(`Failed to create app project:`, error);
      throw new Error(`Failed to create app project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async startApp(appId: string, files: Array<{ path: string; content: string; language: string }>): Promise<{
    appId: string;
    port: number;
    proxyUrl: string;
    processId: number;
  }> {
    try {
      // Check if app is already running
      if (this.runningApps.has(appId)) {
        const existing = this.runningApps.get(appId)!;
        return {
          appId,
          port: existing.port || 3000,
          proxyUrl: existing.proxyUrl || '',
          processId: existing.processId
        };
      }

      // Create app project
      const appPath = await this.createAppProject(files);

      logger.info(`[App ${appId}] Installing dependencies...`);
      execSync('npm install', {
          cwd: appPath,
          stdio: 'pipe',
          env: process.env
      });
      logger.info(`[App ${appId}] Dependencies installed.`);
      
      // Find available port
      const port = await this.findAvailablePort();
      
      // Detect if this is a React/TypeScript project
      const hasReactFiles = files.some(f => 
        f.path.includes('.tsx') || 
        f.path.includes('.jsx') || 
        f.content.includes('React') ||
        f.content.includes('react')
      );
      
      const hasTypeScriptFiles = files.some(f => 
        f.path.includes('.ts') || 
        f.path.includes('.tsx')
      );

      let spawnedProcess: ChildProcess;

      if (hasReactFiles || hasTypeScriptFiles) {
        // For React projects: Build first, then serve static files
        try {
          logger.info(`[App ${appId}] Installing dependencies...`);
          execSync('npm install', { cwd: appPath, stdio: 'pipe', env: process.env });
          logger.info(`[App ${appId}] Dependencies installed.`);

          logger.info(`[App ${appId}] Building React app...`);
          execSync('npm run build', {
            cwd: appPath,
            stdio: 'pipe',
            env: { ...process.env, NODE_ENV: 'production' },
          });
          logger.info(`[App ${appId}] Build completed successfully`);

        } catch (buildError: any) {
          logger.error(`[App ${appId}] Initial build failed. Attempting to heal...`, buildError.stderr?.toString());
          const stderr = buildError.stderr?.toString() || '';
          
          // Enhanced error healing - handle multiple missing imports
          const missingImportMatches = stderr.matchAll(/Could not resolve "(.+?)" from "(.+?)"/g);
          const missingImports = Array.from(missingImportMatches);

          if (missingImports.length > 0) {
            logger.info(`[App ${appId}] Healing: Detected ${missingImports.length} missing import(s)`);

            try {
              // Handle all missing imports
              for (const match of missingImports) {
                const missingModule = match[1];
                const importingFile = match[2];
                logger.info(`[App ${appId}] Healing: Creating missing component '${missingModule}' referenced in '${importingFile}'`);

                const importerDir = path.dirname(path.join(appPath, importingFile));
                let missingFilePath = path.resolve(importerDir, missingModule);

                // Ensure the path has an extension
                if (!path.extname(missingFilePath)) {
                  missingFilePath += '.tsx'; // Assume .tsx for components
                }

                const missingFileDir = path.dirname(missingFilePath);
                await fs.mkdir(missingFileDir, { recursive: true });

                // Check if file already exists
                try {
                  await fs.access(missingFilePath);
                  logger.info(`[App ${appId}] File already exists: ${missingFilePath}`);
                  continue;
                } catch {
                  // File doesn't exist, create it
                }

                const componentName = path.basename(missingFilePath, '.tsx');
                
                // Create a proper React component with Tailwind CSS classes
                const placeholderContent = `import React from 'react';

const ${componentName}: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">${componentName}</h3>
        <p className="text-gray-600 text-sm">Component placeholder</p>
      </div>
    </div>
  );
};

export default ${componentName};`;

                await fs.writeFile(missingFilePath, placeholderContent, 'utf-8');
                logger.info(`[App ${appId}] Healing: Created placeholder component at '${missingFilePath}'`);
              }

              // Retry the build
              logger.info(`[App ${appId}] Retrying build after healing ${missingImports.length} missing components...`);
              execSync('npm run build', {
                cwd: appPath,
                stdio: 'pipe',
                env: { ...process.env, NODE_ENV: 'production' },
              });
              logger.info(`[App ${appId}] Build succeeded after healing.`);

            } catch (healingError) {
              logger.error(`[App ${appId}] Healing failed or build failed on retry:`, healingError);
              throw new Error(`Build failed after attempting to heal: ${healingError.message}`);
            }
          } else {
            // If the error is not a resolvable import, re-throw it.
            throw new Error(`Build failed with an unrecoverable error: ${stderr}`);
          }
        }

        // Spawn static server
        spawnedProcess = spawn('npx', ['serve', 'dist', '-p', port.toString(), '-s'], {
          cwd: appPath,
          shell: true,
          stdio: 'pipe',
          detached: false,
          env: { ...process.env, PORT: port.toString() },
        });

      } else {
        // For HTML projects: Just serve static files
        spawnedProcess = spawn('npx', ['serve', '.', '-p', port.toString(), '-s'], {
          cwd: appPath,
          shell: true,
          stdio: 'pipe',
          detached: false,
          env: {
            ...process.env,
            PORT: port.toString()
          }
        });
      }

      // Check if process spawned correctly
      if (!spawnedProcess.pid) {
        throw new Error(`Failed to spawn process for app ${appId}`);
      }

      // Store process reference
      const processId = this.getNextProcessId();
      const runningApp: RunningApp = {
        process: spawnedProcess,
        processId,
        appId,
        port,
        createdAt: new Date()
      };

      this.runningApps.set(appId, runningApp);

      // Set up process monitoring
      this.monitorProcess(appId, spawnedProcess);

      // Generate proxy URL
      const proxyUrl = `http://localhost:${port}`;
      runningApp.proxyUrl = proxyUrl;

      logger.info(`Started app ${appId} on port ${port}`);
      
      return {
        appId,
        port,
        proxyUrl,
        processId
      };

    } catch (error) {
      logger.error(`Failed to start app ${appId}:`, error);
      throw new Error(`Failed to start app: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private monitorProcess(appId: string, process: ChildProcess) {
    process.stdout?.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        logger.info(`[App ${appId}] ${message}`);
      }
      
      // Check for port information
      if (message.includes('Local:') || message.includes('localhost:')) {
        const portMatch = message.match(/:(\d+)/);
        if (portMatch) {
          const port = parseInt(portMatch[1]);
          const runningApp = this.runningApps.get(appId);
          if (runningApp) {
            runningApp.port = port;
            runningApp.proxyUrl = `http://localhost:${port}`;
          }
        }
      }
    });

    process.stderr?.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        logger.warn(`[App ${appId}] ${message}`);
      }
    });

    process.on('error', (error) => {
      logger.error(`[App ${appId}] Process error:`, error);
      this.runningApps.delete(appId);
    });

    process.on('exit', (code, signal) => {
      logger.info(`[App ${appId}] Process exited with code ${code} and signal ${signal}`);
      this.runningApps.delete(appId);
    });

    // Handle process termination gracefully
    process.on('SIGTERM', () => {
      logger.info(`[App ${appId}] Received SIGTERM, shutting down gracefully`);
    });

    process.on('SIGINT', () => {
      logger.info(`[App ${appId}] Received SIGINT, shutting down gracefully`);
    });
  }

  async stopApp(appId: string): Promise<void> {
    const runningApp = this.runningApps.get(appId);
    if (!runningApp) {
      logger.warn(`App ${appId} is not running`);
      return;
    }

    try {
      // Kill the process
      runningApp.process.kill('SIGTERM');
      
      // Wait a bit for graceful shutdown
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force kill if still running
      if (!runningApp.process.killed) {
        runningApp.process.kill('SIGKILL');
      }

      // Remove from running apps
      this.runningApps.delete(appId);
      
      logger.info(`Stopped app ${appId}`);
    } catch (error) {
      logger.error(`Failed to stop app ${appId}:`, error);
      throw error;
    }
  }

  async cleanupApp(appId: string): Promise<void> {
    try {
      // Stop the app first
      await this.stopApp(appId);
      
      // Remove app directory
      const appPath = path.join(this.tempDir, appId);
      await fs.rm(appPath, { recursive: true, force: true });
      
      logger.info(`Cleaned up app ${appId}`);
    } catch (error) {
      logger.error(`Failed to cleanup app ${appId}:`, error);
    }
  }

  getRunningApps(): Array<{ appId: string; port: number; proxyUrl: string; processId: number }> {
    return Array.from(this.runningApps.values()).map(app => ({
      appId: app.appId,
      port: app.port || 3000,
      proxyUrl: app.proxyUrl || '',
      processId: app.processId
    }));
  }

  isAppRunning(appId: string): boolean {
    return this.runningApps.has(appId);
  }

  getAppInfo(appId: string): { port: number; proxyUrl: string; processId: number } | null {
    const app = this.runningApps.get(appId);
    if (!app) return null;
    
    return {
      port: app.port || 3000,
      proxyUrl: app.proxyUrl || '',
      processId: app.processId
    };
  }
}

export const processManager = new ProcessManager();
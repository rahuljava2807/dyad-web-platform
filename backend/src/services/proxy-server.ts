import { Worker } from 'worker_threads';
import path from 'path';
import { logger } from '../utils/logger';

// Proxy server service inspired by Dyad's start_proxy_server.ts
interface ProxyServerOptions {
  targetOrigin: string;
  port?: number;
  onStarted?: (proxyUrl: string) => void;
  onError?: (error: Error) => void;
}

interface ProxyServer {
  worker: Worker;
  proxyUrl: string;
  targetOrigin: string;
  port: number;
}

class ProxyServerManager {
  private activeProxies = new Map<string, ProxyServer>();
  private portCounter = 5500; // Start from port 5500 to avoid backend port 5001

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

  async startProxy(options: ProxyServerOptions): Promise<ProxyServer> {
    const { targetOrigin, onStarted, onError } = options;
    
    if (!/^https?:\/\//.test(targetOrigin)) {
      throw new Error('Proxy targetOrigin must be absolute http/https URL');
    }

    try {
      const port = await this.findAvailablePort();
      const proxyUrl = `http://localhost:${port}`;
      
      logger.info(`Starting proxy server on port ${port} for target ${targetOrigin}`);

      // Create worker for proxy server
      const worker = new Worker(
        path.resolve(__dirname, '..', 'workers', 'proxy-server.js'),
        {
          workerData: {
            targetOrigin,
            port,
          },
        }
      );

      // Set up worker event handlers
      worker.on('message', (message) => {
        if (typeof message === 'object' && message.type === 'unhandledRejection') {
          logger.error(`[Proxy ${port}] Unhandled Rejection in worker:`, message.reason);
        } else if (typeof message === 'string') {
          logger.info(`[Proxy ${port}] ${message}`);
          if (message.startsWith('proxy-server-start url=')) {
            const url = message.substring('proxy-server-start url='.length);
            onStarted?.(url);
          }
        }
      });

      worker.on('error', (error) => {
        logger.error(`[Proxy ${port}] Worker error:`, error);
        onError?.(error);
      });

      worker.on('exit', (code) => {
        logger.info(`[Proxy ${port}] Worker exited with code ${code}`);
        this.activeProxies.delete(proxyUrl);
      });

      const proxyServer: ProxyServer = {
        worker,
        proxyUrl,
        targetOrigin,
        port
      };

      this.activeProxies.set(proxyUrl, proxyServer);
      
      return proxyServer;

    } catch (error) {
      logger.error('Failed to start proxy server:', error);
      throw new Error(`Failed to start proxy server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stopProxy(proxyUrl: string): Promise<void> {
    const proxy = this.activeProxies.get(proxyUrl);
    if (!proxy) {
      logger.warn(`Proxy server ${proxyUrl} is not running`);
      return;
    }

    try {
      await proxy.worker.terminate();
      this.activeProxies.delete(proxyUrl);
      logger.info(`Stopped proxy server ${proxyUrl}`);
    } catch (error) {
      logger.error(`Failed to stop proxy server ${proxyUrl}:`, error);
      throw error;
    }
  }

  getActiveProxies(): Array<{ proxyUrl: string; targetOrigin: string; port: number }> {
    return Array.from(this.activeProxies.values()).map(proxy => ({
      proxyUrl: proxy.proxyUrl,
      targetOrigin: proxy.targetOrigin,
      port: proxy.port
    }));
  }

  isProxyRunning(proxyUrl: string): boolean {
    return this.activeProxies.has(proxyUrl);
  }

  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.activeProxies.keys()).map(proxyUrl => 
      this.stopProxy(proxyUrl).catch(error => 
        logger.error(`Failed to cleanup proxy ${proxyUrl}:`, error)
      )
    );
    
    await Promise.all(cleanupPromises);
    logger.info('Cleaned up all proxy servers');
  }
}

export const proxyServerManager = new ProxyServerManager();

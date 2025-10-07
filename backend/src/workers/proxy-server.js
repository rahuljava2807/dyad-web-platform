/**
 * proxy-server.js – HTTP proxy server worker
 * Based on Dyad's proxy_server.js implementation
 */

const { parentPort, workerData } = require("worker_threads");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const LISTEN_HOST = "localhost";
const LISTEN_PORT = workerData.port;
let rememberedOrigin = null;

// Pre-configure rememberedOrigin from workerData
{
  const fixed = workerData?.targetOrigin;
  if (fixed) {
    try {
      rememberedOrigin = new URL(fixed).origin;
      parentPort?.postMessage(
        `[proxy-worker] fixed upstream: ${rememberedOrigin}`,
      );
    } catch {
      throw new Error(
        `Invalid target origin "${fixed}". Must be absolute http/https URL.`,
      );
    }
  }
}

function buildTargetURL(clientReq) {
  const target = new URL(rememberedOrigin + clientReq.url);
  return target;
}

// Check if we need to inject debugging tools
function needsInjection(pathname) {
  return pathname.endsWith('.html') || pathname === '/' || pathname.endsWith('/');
}

// Inject debugging tools into HTML
function injectHTML(htmlBuffer) {
  const html = htmlBuffer.toString();
  
  // Simple injection - add console logging and error handling
  const injection = `
    <script>
      // Enhanced console logging
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = function(...args) {
        originalLog.apply(console, args);
        // Send to parent for debugging
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'console', level: 'log', message: args.join(' ') }, '*');
        }
      };

      console.error = function(...args) {
        originalError.apply(console, args);
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'console', level: 'error', message: args.join(' ') }, '*');
        }
      };

      console.warn = function(...args) {
        originalWarn.apply(console, args);
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'console', level: 'warning', message: args.join(' ') }, '*');
        }
      };

      // Error handling
      window.onerror = function(message, source, lineno, colno, error) {
        console.error('Runtime Error:', message, 'at', source, 'line', lineno);
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ 
            type: 'preview-error', 
            message: message, 
            source: source, 
            line: lineno, 
            column: colno 
          }, '*');
        }
        return true;
      };

      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ 
            type: 'preview-error', 
            message: 'Unhandled Promise Rejection: ' + event.reason 
          }, '*');
        }
      });
    </script>
  `;

  // Inject before closing body tag
  if (html.includes('</body>')) {
    return html.replace('</body>', injection + '</body>');
  } else {
    return html + injection;
  }
}

// Create HTTP server
const server = http.createServer((clientReq, clientRes) => {
  // Handle CORS preflight requests
  if (clientReq.method === 'OPTIONS') {
    clientRes.writeHead(200, {
      'access-control-allow-origin': 'http://localhost:3000',
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization, X-Requested-With'
    });
    return void clientRes.end();
  }

  let target;
  try {
    target = buildTargetURL(clientReq);
  } catch (err) {
    clientRes.writeHead(400, { "content-type": "text/plain" });
    return void clientRes.end("Bad request: " + err.message);
  }

  const isTLS = target.protocol === "https:";
  const lib = isTLS ? https : http;

  // Copy request headers but rewrite Host / Origin / Referer
  const headers = { ...clientReq.headers, host: target.host };
  if (headers.origin) headers.origin = target.origin;
  if (headers.referer) {
    try {
      const ref = new URL(headers.referer);
      headers.referer = target.origin + ref.pathname + ref.search;
    } catch {
      delete headers.referer;
    }
  }
  
  if (needsInjection(target.pathname)) {
    // Request uncompressed content from upstream
    delete headers["accept-encoding"];
  }

  if (headers["if-none-match"] && needsInjection(target.pathname))
    delete headers["if-none-match"];

  const upOpts = {
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || (isTLS ? 443 : 80),
    path: target.pathname + target.search,
    method: clientReq.method,
    headers,
  };

  const upReq = lib.request(upOpts, (upRes) => {
    const inject = needsInjection(target.pathname);

    if (!inject) {
      // Add CORS headers for iframe access
      const headers = {
        ...upRes.headers,
        'access-control-allow-origin': 'http://localhost:3000',
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'Content-Type, Authorization, X-Requested-With'
      };
      clientRes.writeHead(upRes.statusCode, headers);
      return void upRes.pipe(clientRes);
    }

    const chunks = [];
    upRes.on("data", (c) => chunks.push(c));
    upRes.on("end", () => {
      try {
        const merged = Buffer.concat(chunks);
        const patched = injectHTML(merged);

        const hdrs = {
          ...upRes.headers,
          "content-length": Buffer.byteLength(patched),
          'access-control-allow-origin': 'http://localhost:3000',
          'access-control-allow-credentials': 'true',
          'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'access-control-allow-headers': 'Content-Type, Authorization, X-Requested-With'
        };
        // If we injected content, it's no longer encoded in the original way
        delete hdrs["content-encoding"];
        // Also, remove ETag as content has changed
        delete hdrs["etag"];

        clientRes.writeHead(upRes.statusCode, hdrs);
        clientRes.end(patched);
      } catch (e) {
        clientRes.writeHead(500, { "content-type": "text/plain" });
        clientRes.end("Injection failed: " + e.message);
      }
    });
  });

  clientReq.pipe(upReq);
  upReq.on("error", (e) => {
    clientRes.writeHead(502, { "content-type": "text/plain" });
    clientRes.end("Upstream error: " + e.message);
  });
});

// Handle WebSocket upgrades
server.on("upgrade", (req, socket, _head) => {
  let target;
  try {
    target = buildTargetURL(req);
  } catch (err) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n" + err.message);
    return socket.destroy();
  }

  const isTLS = target.protocol === "https:";
  const headers = { ...req.headers, host: target.host };
  if (headers.origin) headers.origin = target.origin;

  const upReq = (isTLS ? https : http).request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || (isTLS ? 443 : 80),
    path: target.pathname + target.search,
    method: "GET",
    headers,
  });

  upReq.on("upgrade", (upRes, upSocket, upHead) => {
    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\n" +
        Object.entries(upRes.headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\r\n") +
        "\r\n\r\n",
    );
    if (upHead && upHead.length) socket.write(upHead);

    upSocket.pipe(socket).pipe(upSocket);
  });

  upReq.on("error", () => socket.destroy());
  upReq.end();
});

// Start server
server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  const url = `http://${LISTEN_HOST}:${LISTEN_PORT}`;
  parentPort?.postMessage(`proxy-server-start url=${url}`);
  parentPort?.postMessage(`[proxy-worker] listening on ${url} -> ${rememberedOrigin}`);
});

// Handle server errors
server.on("error", (err) => {
  parentPort?.postMessage(`[proxy-worker] server error: ${err.message}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  parentPort?.postMessage("[proxy-worker] received SIGTERM, shutting down");
  server.close(() => {
    parentPort?.postMessage("[proxy-worker] server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  parentPort?.postMessage("[proxy-worker] received SIGINT, shutting down");
  server.close(() => {
    parentPort?.postMessage("[proxy-worker] server closed");
    process.exit(0);
  });
});

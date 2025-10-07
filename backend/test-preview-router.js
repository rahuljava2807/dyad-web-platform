const express = require('express');

console.log('Testing preview router...');

try {
  // Test process-manager import
  console.log('Testing process-manager...');
  const processManager = require('./src/services/process-manager.ts');
  console.log('Process manager OK');
} catch (e) {
  console.error('Process manager error:', e.message);
}

try {
  // Test proxy-server import
  console.log('Testing proxy-server...');
  const proxyServerManager = require('./src/services/proxy-server.ts');
  console.log('Proxy server OK');
} catch (e) {
  console.error('Proxy server error:', e.message);
}

try {
  // Test preview router import
  console.log('Testing preview router...');
  const previewRouter = require('./src/routes/preview.ts');
  console.log('Preview router OK');
  console.log('Routes:', previewRouter.default?.stack?.map(r => r.route?.path || r.name) || 'No routes');
} catch (e) {
  console.error('Preview router error:', e.message);
}

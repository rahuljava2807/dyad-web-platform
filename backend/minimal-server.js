const express = require('express');
const app = express();
const port = 5001;

console.log('🔄 Loading server modules...');

app.use(express.json());

console.log('✅ Modules loaded, setting up routes...');

// Test preview routes
app.get('/api/preview/status', (req, res) => {
  res.json({ runningApps: [], activeProxies: [], sessionCount: 0 });
});

app.post('/api/preview/generate', (req, res) => {
  res.json({ success: true, message: 'Test preview generation' });
});

console.log('✅ Routes set up, starting server...');

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 Health check: http://localhost:${port}/health`);
  console.log(`🔗 API endpoint: http://localhost:${port}/api`);
});

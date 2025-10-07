const express = require('express');
const app = express();
const port = 5001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/preview/status', (req, res) => {
  res.json({ runningApps: [], activeProxies: [], sessionCount: 0 });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on port ${port}`);
});

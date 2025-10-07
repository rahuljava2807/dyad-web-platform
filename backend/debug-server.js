console.log('🔄 Starting debug server...');

const express = require('express');
const app = express();
const port = 5001;

console.log('✅ Express app created');

app.use(express.json());
console.log('✅ Middleware set up');

app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

console.log('✅ Routes set up');

app.listen(port, () => {
  console.log(`🚀 Debug server running on port ${port}`);
});

console.log('✅ Server start initiated');

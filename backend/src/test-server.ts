console.log('🔄 Test server starting...')

import express from 'express'

const app = express()
const port = 5001

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`✅ Test server running on port ${port}`)
  console.log(`Visit: http://localhost:${port}/health`)
})

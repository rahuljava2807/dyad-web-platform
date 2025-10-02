import { Router } from 'express'
import apiKeyService from '../services/apiKeyService'

const router = Router()

// Get all API keys for user
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'] as string || 'default-user'
    const apiKeys = await apiKeyService.getUserAPIKeys(userId)
    res.json(apiKeys)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API keys' })
  }
})

// Save new API key
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['user-id'] as string || 'default-user'
    const { provider, name, apiKey, isDefault = false } = req.body

    if (!provider || !name || !apiKey) {
      return res.status(400).json({ error: 'Provider, name, and API key are required' })
    }

    const savedKey = await apiKeyService.saveAPIKey({
      userId,
      provider,
      name,
      apiKey,
      isDefault,
      isValid: true
    })

    res.json(savedKey)
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to save API key'
    })
  }
})

// Set default API key
router.put('/:keyId/default', async (req, res) => {
  try {
    const userId = req.headers['user-id'] as string || 'default-user'
    const { keyId } = req.params

    const success = await apiKeyService.setDefaultAPIKey(userId, keyId)

    if (success) {
      res.json({ success: true })
    } else {
      res.status(404).json({ error: 'API key not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to set default API key' })
  }
})

// Delete API key
router.delete('/:keyId', async (req, res) => {
  try {
    const userId = req.headers['user-id'] as string || 'default-user'
    const { keyId } = req.params

    const success = await apiKeyService.deleteAPIKey(userId, keyId)

    if (success) {
      res.json({ success: true })
    } else {
      res.status(404).json({ error: 'API key not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete API key' })
  }
})

// Validate API key
router.post('/validate', async (req, res) => {
  try {
    const { provider, apiKey } = req.body

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and API key are required' })
    }

    const validation = await apiKeyService.validateAPIKey(provider, apiKey)
    res.json(validation)
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate API key' })
  }
})

export default router
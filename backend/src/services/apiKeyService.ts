import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here-change'

interface APIKeyConfig {
  id?: string
  userId: string
  provider: 'openai' | 'anthropic' | 'google' | 'azure'
  name: string
  apiKey: string
  isDefault: boolean
  isValid: boolean
  usageStats?: {
    tokensUsed: number
    tokensRemaining: number
    costIncurred: number
    lastUsed?: Date
  }
  createdAt?: Date
  updatedAt?: Date
}

interface EncryptedData {
  encrypted: string
  iv: string
  tag: string
}

class APIKeyService {
  /**
   * Encrypt API key using AES-256-CBC
   */
  private encryptAPIKey(apiKey: string): EncryptedData {
    const iv = crypto.randomBytes(16)
    // Create a proper 32-byte key from the password
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Use HMAC for integrity
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY)
    hmac.update(encrypted + iv.toString('hex'))
    const tag = hmac.digest('hex')

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag
    }
  }

  /**
   * Decrypt API key
   */
  private decryptAPIKey(encryptedData: EncryptedData): string {
    // Verify integrity first
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY)
    hmac.update(encryptedData.encrypted + encryptedData.iv)
    const computedTag = hmac.digest('hex')

    if (computedTag !== encryptedData.tag) {
      throw new Error('API key integrity check failed')
    }

    // Create the same key and use the stored IV
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const iv = Buffer.from(encryptedData.iv, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  /**
   * Validate API key with the respective provider
   */
  async validateAPIKey(provider: string, apiKey: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      switch (provider) {
        case 'openai':
          return await this.validateOpenAIKey(apiKey)
        case 'anthropic':
          return await this.validateAnthropicKey(apiKey)
        case 'google':
          return await this.validateGoogleKey(apiKey)
        case 'azure':
          return await this.validateAzureKey(apiKey)
        default:
          return { isValid: false, error: 'Unsupported provider' }
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      }
    }
  }

  private async validateOpenAIKey(apiKey: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return { isValid: true }
      } else {
        const errorData = await response.json()
        return {
          isValid: false,
          error: errorData.error?.message || 'Invalid OpenAI API key'
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to validate OpenAI API key'
      }
    }
  }

  private async validateAnthropicKey(apiKey: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      })

      if (response.ok || response.status === 400) {
        // 400 is expected for minimal request, but auth worked
        return { isValid: true }
      } else {
        return {
          isValid: false,
          error: 'Invalid Anthropic API key'
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to validate Anthropic API key'
      }
    }
  }

  private async validateGoogleKey(apiKey: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)

      if (response.ok) {
        return { isValid: true }
      } else {
        return {
          isValid: false,
          error: 'Invalid Google API key'
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to validate Google API key'
      }
    }
  }

  private async validateAzureKey(apiKey: string): Promise<{ isValid: boolean; error?: string }> {
    // Azure validation would require endpoint URL as well
    // For now, basic format validation
    if (apiKey && apiKey.length > 20) {
      return { isValid: true }
    }
    return {
      isValid: false,
      error: 'Invalid Azure API key format'
    }
  }

  /**
   * Save API key for user
   */
  async saveAPIKey(config: Omit<APIKeyConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIKeyConfig> {
    // Validate the API key first
    const validation = await this.validateAPIKey(config.provider, config.apiKey)

    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid API key')
    }

    // Encrypt the API key
    const encryptedData = this.encryptAPIKey(config.apiKey)

    // If this is set as default, unset other defaults for this user
    if (config.isDefault) {
      await prisma.aPIKey.updateMany({
        where: {
          userId: config.userId,
          provider: config.provider
        },
        data: { isDefault: false }
      })
    }

    // Save to database
    const savedKey = await prisma.aPIKey.create({
      data: {
        userId: config.userId,
        provider: config.provider,
        name: config.name,
        encryptedKey: encryptedData.encrypted,
        encryptionIv: encryptedData.iv,
        encryptionTag: encryptedData.tag,
        isDefault: config.isDefault,
        isValid: true,
        tokensUsed: 0,
        costIncurred: 0
      }
    })

    return {
      id: savedKey.id,
      userId: savedKey.userId,
      provider: savedKey.provider as APIKeyConfig['provider'],
      name: savedKey.name,
      apiKey: '••••••••', // Never return actual key
      isDefault: savedKey.isDefault,
      isValid: savedKey.isValid,
      usageStats: {
        tokensUsed: savedKey.tokensUsed || 0,
        tokensRemaining: 0, // Would need to fetch from provider
        costIncurred: savedKey.costIncurred || 0,
        lastUsed: savedKey.lastUsed || undefined
      },
      createdAt: savedKey.createdAt,
      updatedAt: savedKey.updatedAt
    }
  }

  /**
   * Get all API keys for user (without exposing actual keys)
   */
  async getUserAPIKeys(userId: string): Promise<APIKeyConfig[]> {
    const apiKeys = await prisma.aPIKey.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return apiKeys.map(key => ({
      id: key.id,
      userId: key.userId,
      provider: key.provider as APIKeyConfig['provider'],
      name: key.name,
      apiKey: '••••••••',
      isDefault: key.isDefault,
      isValid: key.isValid,
      usageStats: {
        tokensUsed: key.tokensUsed || 0,
        tokensRemaining: 0,
        costIncurred: key.costIncurred || 0,
        lastUsed: key.lastUsed || undefined
      },
      createdAt: key.createdAt,
      updatedAt: key.updatedAt
    }))
  }

  /**
   * Get decrypted API key for internal use
   */
  async getDecryptedAPIKey(userId: string, provider?: string): Promise<string | null> {
    const whereClause: any = { userId, isValid: true }

    if (provider) {
      whereClause.provider = provider
      whereClause.isDefault = true
    } else {
      whereClause.isDefault = true
    }

    const apiKey = await prisma.aPIKey.findFirst({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }
    })

    if (!apiKey) {
      return null
    }

    try {
      return this.decryptAPIKey({
        encrypted: apiKey.encryptedKey,
        iv: apiKey.encryptionIv,
        tag: apiKey.encryptionTag
      })
    } catch (error) {
      console.error('Failed to decrypt API key:', error)
      return null
    }
  }

  /**
   * Delete API key
   */
  async deleteAPIKey(userId: string, keyId: string): Promise<boolean> {
    try {
      await prisma.aPIKey.deleteMany({
        where: {
          id: keyId,
          userId: userId
        }
      })
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Update usage stats
   */
  async updateUsageStats(userId: string, provider: string, tokensUsed: number, cost: number): Promise<void> {
    await prisma.aPIKey.updateMany({
      where: {
        userId,
        provider,
        isDefault: true
      },
      data: {
        tokensUsed: {
          increment: tokensUsed
        },
        costIncurred: {
          increment: cost
        },
        lastUsed: new Date()
      }
    })
  }

  /**
   * Set default API key
   */
  async setDefaultAPIKey(userId: string, keyId: string): Promise<boolean> {
    try {
      // Get the key to be set as default
      const targetKey = await prisma.aPIKey.findFirst({
        where: { id: keyId, userId }
      })

      if (!targetKey) {
        return false
      }

      // Unset all defaults for this provider
      await prisma.aPIKey.updateMany({
        where: {
          userId,
          provider: targetKey.provider
        },
        data: { isDefault: false }
      })

      // Set new default
      await prisma.aPIKey.update({
        where: { id: keyId },
        data: { isDefault: true }
      })

      return true
    } catch (error) {
      return false
    }
  }
}

export default new APIKeyService()
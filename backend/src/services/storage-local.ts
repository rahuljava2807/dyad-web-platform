import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { logger } from '../utils/logger'

interface LocalStorageConfig {
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  forcePathStyle: boolean
}

interface UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
  cacheControl?: string
  contentEncoding?: string
}

export class LocalStorageService {
  private s3Client: S3Client
  private bucket: string

  constructor() {
    const config: LocalStorageConfig = {
      endpoint: process.env.AWS_ENDPOINT || 'http://localhost:9000',
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin123',
      bucket: process.env.S3_BUCKET || 'dyad-files',
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
    }

    this.bucket = config.bucket

    this.s3Client = new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle,
    })

    logger.info('Local storage service initialized with MinIO', {
      endpoint: config.endpoint,
      bucket: config.bucket
    })
  }

  async uploadFile(
    key: string,
    content: Buffer | string,
    options: UploadOptions = {}
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: content,
        ContentType: options.contentType || 'application/octet-stream',
        Metadata: options.metadata || {},
        CacheControl: options.cacheControl,
        ContentEncoding: options.contentEncoding,
      })

      await this.s3Client.send(command)

      // Return the public URL (MinIO serves files publicly from this path)
      const url = `${process.env.AWS_ENDPOINT || 'http://localhost:9000'}/${this.bucket}/${key}`

      logger.debug('File uploaded successfully', {
        key,
        url,
        size: Buffer.isBuffer(content) ? content.length : content.length
      })

      return url
    } catch (error) {
      logger.error('Failed to upload file to local storage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      const response = await this.s3Client.send(command)

      if (!response.Body) {
        throw new Error('No file content received')
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = []
      const reader = response.Body.transformToWebStream().getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      const buffer = Buffer.concat(chunks)

      logger.debug('File downloaded successfully', {
        key,
        size: buffer.length
      })

      return buffer
    } catch (error) {
      logger.error('Failed to download file from local storage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      await this.s3Client.send(command)

      logger.debug('File deleted successfully', { key })
    } catch (error) {
      logger.error('Failed to delete file from local storage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      const url = await getSignedUrl(this.s3Client, command, { expiresIn })

      logger.debug('Generated signed URL', { key, expiresIn })

      return url
    } catch (error) {
      logger.error('Failed to generate signed URL', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })

      await this.s3Client.send(command)
      return true
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return false
      }
      throw error
    }
  }

  async listFiles(prefix?: string): Promise<string[]> {
    try {
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3')

      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      })

      const response = await this.s3Client.send(command)

      return response.Contents?.map(obj => obj.Key || '') || []
    } catch (error) {
      logger.error('Failed to list files', {
        prefix,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getPublicUrl(key: string): string {
    return `${process.env.AWS_ENDPOINT || 'http://localhost:9000'}/${this.bucket}/${key}`
  }
}

export const storageService = new LocalStorageService()
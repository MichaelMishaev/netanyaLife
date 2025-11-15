import Redis from 'ioredis'

/**
 * Redis Client for Netanya Local
 * Used for:
 * - Session storage
 * - Cache
 * - Bug tracking (user_messages list)
 * - Rate limiting
 */

const getRedisUrl = () => {
  const url = process.env.REDIS_URL
  if (!url) {
    // For development, use default Docker Redis
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
      return 'redis://localhost:6380'
    }
    throw new Error('REDIS_URL environment variable is not set')
  }
  return url
}

// Lazy-initialized Redis client singleton
let redisClient: Redis | null = null

/**
 * Get Redis client instance (lazy initialization)
 * Only initializes when actually needed, not during build time
 */
const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError: (err) => {
        const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT']
        if (targetErrors.some((targetError) => err.message.includes(targetError))) {
          return true // Reconnect
        }
        return false
      },
    })

    // Handle connection events
    redisClient.on('connect', () => {
      console.log('✅ Redis connected')
    })

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err)
    })

    redisClient.on('ready', () => {
      console.log('✅ Redis ready')
    })

    redisClient.on('close', () => {
      console.log('⚠️  Redis connection closed')
    })
  }

  return redisClient
}

/**
 * Cache Helper Functions
 */

export const cache = {
  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient()
      const value = await redis.get(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  },

  /**
   * Set cache value with optional TTL (in seconds)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    try {
      const redis = getRedisClient()
      const serialized = JSON.stringify(value)
      if (ttl) {
        await redis.setex(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
      return true
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
      return false
    }
  },

  /**
   * Delete cache key
   */
  async del(key: string): Promise<boolean> {
    try {
      const redis = getRedisClient()
      await redis.del(key)
      return true
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error)
      return false
    }
  },

  /**
   * Delete all keys matching pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const redis = getRedisClient()
      const keys = await redis.keys(pattern)
      if (keys.length === 0) return 0
      await redis.del(...keys)
      return keys.length
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error)
      return 0
    }
  },
}

/**
 * Bug Tracking Helper Functions
 * For WhatsApp integration: user_messages list
 */

export interface UserMessage {
  timestamp: string
  messageText: string
  userId: string
  phone: string
  direction: 'incoming' | 'outgoing'
  status: 'pending' | 'fixed'
  fixedAt?: string
  commitHash?: string
}

export const bugTracking = {
  /**
   * Get all pending bugs (messages starting with #)
   */
  async getPendingBugs(): Promise<UserMessage[]> {
    try {
      const redis = getRedisClient()
      const messages = await redis.lrange('user_messages', 0, -1)
      const parsed = messages.map((msg) => JSON.parse(msg) as UserMessage)
      // Filter for pending bugs only
      return parsed.filter(
        (msg) => msg.messageText.startsWith('#') && msg.status === 'pending'
      )
    } catch (error) {
      console.error('Error getting pending bugs:', error)
      return []
    }
  },

  /**
   * Mark bug as fixed
   */
  async markBugAsFixed(
    index: number,
    commitHash: string
  ): Promise<boolean> {
    try {
      const redis = getRedisClient()
      const message = await redis.lindex('user_messages', index)
      if (!message) return false

      const parsed = JSON.parse(message) as UserMessage
      parsed.status = 'fixed'
      parsed.fixedAt = new Date().toISOString()
      parsed.commitHash = commitHash

      await redis.lset('user_messages', index, JSON.stringify(parsed))
      return true
    } catch (error) {
      console.error('Error marking bug as fixed:', error)
      return false
    }
  },

  /**
   * Add a new message (for testing)
   */
  async addMessage(message: UserMessage): Promise<boolean> {
    try {
      const redis = getRedisClient()
      await redis.rpush('user_messages', JSON.stringify(message))
      return true
    } catch (error) {
      console.error('Error adding message:', error)
      return false
    }
  },
}

/**
 * Rate Limiting Helper
 */

export const rateLimit = {
  /**
   * Check if action is allowed (simple token bucket)
   * Returns true if allowed, false if rate limited
   */
  async check(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<boolean> {
    try {
      const redis = getRedisClient()
      const current = await redis.incr(key)
      if (current === 1) {
        // First request, set expiry
        await redis.expire(key, windowSeconds)
      }
      return current <= maxRequests
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail open (allow request if Redis fails)
      return true
    }
  },

  /**
   * Get remaining requests
   */
  async getRemaining(
    key: string,
    maxRequests: number
  ): Promise<number> {
    try {
      const redis = getRedisClient()
      const current = await redis.get(key)
      if (!current) return maxRequests
      const used = parseInt(current, 10)
      return Math.max(0, maxRequests - used)
    } catch (error) {
      console.error('Rate limit remaining error:', error)
      return 0
    }
  },
}

// Export lazy-loaded Redis client for direct access if needed
export default getRedisClient

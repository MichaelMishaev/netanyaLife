/**
 * Redis Connection Test
 * Run with: npx tsx lib/redis-test.ts
 */

// Load environment variables
import { config } from 'dotenv'
config({ path: '.env.local' })

import redis, { cache, bugTracking, rateLimit } from './redis'

async function testRedis() {
  console.log('🔍 Testing Redis connection...\n')

  try {
    // 1. Basic connection test
    console.log('1️⃣ Testing basic PING/PONG...')
    const pong = await redis.ping()
    console.log(`✅ Redis PING: ${pong}\n`)

    // 2. Test cache functions
    console.log('2️⃣ Testing cache functions...')
    await cache.set('test:hello', { message: 'Hello Netanya!' }, 60)
    const cached = await cache.get<{ message: string }>('test:hello')
    console.log(`✅ Cache set/get: ${cached?.message}\n`)

    // 3. Test rate limiting
    console.log('3️⃣ Testing rate limiting...')
    const key = 'test:rate-limit'
    for (let i = 1; i <= 5; i++) {
      const allowed = await rateLimit.check(key, 3, 10)
      console.log(`   Request ${i}: ${allowed ? '✅ Allowed' : '❌ Rate limited'}`)
    }
    console.log()

    // 4. Test bug tracking
    console.log('4️⃣ Testing bug tracking...')
    const testBug = {
      timestamp: new Date().toISOString(),
      messageText: '#bug - test message',
      userId: 'test-user',
      phone: '+972501234567',
      direction: 'incoming' as const,
      status: 'pending' as const,
    }
    await bugTracking.addMessage(testBug)
    const bugs = await bugTracking.getPendingBugs()
    console.log(`✅ Pending bugs count: ${bugs.length}\n`)

    // 5. Cleanup
    console.log('5️⃣ Cleaning up test data...')
    await cache.del('test:hello')
    await cache.del(key)
    console.log('✅ Cleanup complete\n')

    console.log('✅ All Redis tests passed!')

  } catch (error) {
    console.error('❌ Redis test failed:', error)
    process.exit(1)
  } finally {
    await redis.quit()
    process.exit(0)
  }
}

testRedis()

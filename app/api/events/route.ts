import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import getRedisClient from '@/lib/redis'

export const dynamic = 'force-dynamic'

// Valid event types from Prisma schema
const VALID_EVENT_TYPES = [
  'SEARCH_PERFORMED',
  'BUSINESS_VIEWED',
  'CTA_CLICKED',
  'REVIEW_SUBMITTED',
  'BUSINESS_SUBMITTED',
  'PWA_INSTALLED',
  'SEARCH_ALL_CITY_CLICKED',
  'LANGUAGE_CHANGED',
  'ACCESSIBILITY_OPENED',
  'ACCESSIBILITY_FONT_CHANGED',
  'ACCESSIBILITY_CONTRAST_TOGGLED',
  'SEARCH_FORM_VIEW',
  'RECENT_SEARCH_CLICKED',
  'GEOLOCATION_DETECTED',
] as const

/**
 * Rate limiting: 100 events per minute per IP
 */
async function checkRateLimit(ip: string): Promise<boolean> {
  try {
    const redis = getRedisClient()
    const key = `rate-limit:events:${ip}`
    const current = await redis.get(key)

    if (current && parseInt(current) >= 100) {
      return false
    }

    await redis.incr(key)
    await redis.expire(key, 60) // 1 minute

    return true
  } catch (error) {
    // If Redis fails, allow the request
    return true
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Check rate limit
    const allowed = await checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Parse request body - handle empty/malformed JSON
    let body
    try {
      const text = await request.text()
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: 'Empty request body' },
          { status: 400 }
        )
      }
      body = JSON.parse(text)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      )
    }

    const { event_type, properties } = body

    if (!event_type) {
      return NextResponse.json(
        { error: 'event_type is required' },
        { status: 400 }
      )
    }

    // Validate event type
    const normalizedType = event_type.toUpperCase()
    if (!VALID_EVENT_TYPES.includes(normalizedType as typeof VALID_EVENT_TYPES[number])) {
      console.warn(`Unknown event type: ${event_type}`)
      // Still return success to not break client, but don't save
      return NextResponse.json({ success: true, skipped: true })
    }

    // Save event to database
    try {
      await prisma.event.create({
        data: {
          type: normalizedType as typeof VALID_EVENT_TYPES[number],
          properties: properties || {},
          ip_hash: ip,
        },
      })
    } catch (dbError) {
      console.error('Database error saving event:', dbError)
      // Return success to not break client analytics
      return NextResponse.json({ success: true, db_error: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

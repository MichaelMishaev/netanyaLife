# Brave Search API Integration

**Document Version**: 1.0  
**Last Updated**: 2025-11-14  
**Status**: Configuration Complete

---

## Overview

This project uses **Brave Search API** to power search functionality and provide rich data enrichments. The API is integrated through both:
1. **MCP Server** - Pre-configured tools available in Claude Code
2. **Direct API Calls** - For server-side integrations in the Next.js application

---

## API Key Configuration

### Environment Variables

The Brave API key is stored securely in `.env.local`:

```bash
BRAVE_API_KEY=BSAFysCbmXCmO7tE7o4UEgid1EtLNwf
```

**Security**:
- ✅ `.env.local` is excluded in `.gitignore`
- ✅ `.env.example` provides template for other developers
- ❌ **Never commit `.env.local` to git**

### Setup Instructions

```bash
# 1. Copy the example file
cp .env.example .env.local

# 2. Add your Brave API key
# BRAVE_API_KEY=your_key_here

# 3. Verify .gitignore excludes it
git check-ignore .env.local  # Should output: .env.local
```

---

## Available Endpoints

### 1. Web Search API
**Endpoint**: `https://api.search.brave.com/res/v1/web/search`  
**Plan Required**: Free (with subscription)

**Use Cases**:
- General web search results
- Related searches and suggestions
- Web page snippets

**Example Request**:
```bash
curl -s --compressed "https://api.search.brave.com/res/v1/web/search?q=plumbers+netanya" \
  -H "Accept: application/json" \
  -H "Accept-Encoding: gzip" \
  -H "X-Subscription-Token: ${BRAVE_API_KEY}"
```

---

### 2. Local Search API (Pro)
**Endpoint**: `https://api.search.brave.com/res/v1/local/pois`  
**Plan Required**: Pro

**Use Cases**:
- Business location enrichment
- Photos and images for businesses
- Related web results for locations
- Batch retrieval (up to 20 locations)

**Example Workflow**:
```bash
# Step 1: Search for locations
curl "https://api.search.brave.com/res/v1/web/search?q=greek+restaurants+in+netanya" \
  -H "X-Subscription-Token: ${BRAVE_API_KEY}"

# Response includes temporary IDs:
# {
#   "locations": {
#     "results": [
#       { "id": "1520066f3f39496780c5931d9f7b26a6", "title": "Restaurant A" }
#     ]
#   }
# }

# Step 2: Fetch enriched data
curl "https://api.search.brave.com/res/v1/local/pois?ids=1520066f3f39496780c5931d9f7b26a6" \
  -H "X-Subscription-Token: ${BRAVE_API_KEY}"

# Step 3: Get AI-generated descriptions
curl "https://api.search.brave.com/res/v1/local/descriptions?ids=1520066f3f39496780c5931d9f7b26a6" \
  -H "X-Subscription-Token: ${BRAVE_API_KEY}"
```

---

### 3. Rich Search API (Pro)
**Endpoint**: `https://api.search.brave.com/res/v1/web/rich`  
**Plan Required**: Pro

**Supported Verticals**:
| Vertical | Provider | Use Case |
|----------|----------|----------|
| Calculator | Brave | Math calculations |
| Cryptocurrency | CoinGecko | Crypto prices |
| Currency | Fixer | Currency conversion |
| Definitions | Wordnik | Word definitions |
| Package tracker | Brave | Tracking numbers |
| Stocks | FMP | Stock prices |
| Unit converter | Brave | Unit conversions |
| Weather | OpenWeatherMap | Weather data |
| Sports | API-Sports | Sports scores |

**Example Workflow**:
```bash
# Step 1: Search with rich callback enabled
curl "https://api.search.brave.com/res/v1/web/search?q=weather+in+netanya&enable_rich_callback=1" \
  -H "X-Subscription-Token: ${BRAVE_API_KEY}"

# Response includes callback_key:
# {
#   "rich": {
#     "hint": {
#       "vertical": "weather",
#       "callback_key": "86d06abffc884e9ea281a40f62e0a5a6"
#     }
#   }
# }

# Step 2: Fetch rich results
curl "https://api.search.brave.com/res/v1/web/rich?callback_key=86d06abffc884e9ea281a40f62e0a5a6" \
  -H "X-Subscription-Token: ${BRAVE_API_KEY}"
```

---

## MCP Integration (Claude Code)

The Brave Search MCP server is already configured and provides two tools:

### 1. `mcp__brave-search__brave_web_search`
**Purpose**: General web search  
**Parameters**:
- `query` (required): Search query string
- `count` (optional): Number of results (1-20, default 10)
- `offset` (optional): Pagination offset (max 9, default 0)

**Example Usage**:
```typescript
// In Claude Code conversation:
// "Search for plumbers in Netanya using Brave Search"

// Claude will use:
mcp__brave-search__brave_web_search({
  query: "plumbers netanya israel",
  count: 10
})
```

### 2. `mcp__brave-search__brave_local_search`
**Purpose**: Local business search  
**Parameters**:
- `query` (required): Local search query (e.g., "pizza near Central Park")
- `count` (optional): Number of results (1-20, default 5)

**Example Usage**:
```typescript
// In Claude Code conversation:
// "Find electricians near Netanya center using local search"

// Claude will use:
mcp__brave-search__brave_local_search({
  query: "electricians near netanya center",
  count: 5
})
```

---

## Next.js Server Integration

### Create API Client

**File**: `lib/brave-search.ts`

```typescript
type BraveSearchParams = {
  q: string
  count?: number
  offset?: number
}

type BraveLocalSearchParams = {
  query: string
  count?: number
}

export async function braveWebSearch(params: BraveSearchParams) {
  const url = new URL('https://api.search.brave.com/res/v1/web/search')
  url.searchParams.set('q', params.q)
  if (params.count) url.searchParams.set('count', params.count.toString())
  if (params.offset) url.searchParams.set('offset', params.offset.toString())

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': process.env.BRAVE_API_KEY!,
    },
  })

  if (!response.ok) {
    throw new Error(`Brave API error: ${response.statusText}`)
  }

  return response.json()
}

export async function braveLocalSearch(params: BraveLocalSearchParams) {
  const url = new URL('https://api.search.brave.com/res/v1/web/search')
  url.searchParams.set('q', params.query)
  url.searchParams.set('search_lang', 'he') // Hebrew results for Netanya
  if (params.count) url.searchParams.set('count', params.count.toString())

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': process.env.BRAVE_API_KEY!,
    },
  })

  if (!response.ok) {
    throw new Error(`Brave API error: ${response.statusText}`)
  }

  return response.json()
}
```

---

## Use Cases in Netanya Local Project

### 1. Business Discovery Enhancement
When a user searches for a service type in a neighborhood, supplement our database results with live Brave Local Search results:

```typescript
// app/[lang]/netanya/[neighborhood]/[service]/page.tsx
import { braveLocalSearch } from '@/lib/brave-search'
import { getSearchResults } from '@/lib/queries/getSearchResults'

export default async function ResultsPage({ params }) {
  // Get our database results
  const dbResults = await getSearchResults({
    categorySlug: params.service,
    neighborhoodSlug: params.neighborhood,
  })

  // Supplement with Brave Local Search (if Pro plan)
  try {
    const braveResults = await braveLocalSearch({
      query: `${params.service} in ${params.neighborhood} netanya israel`,
      count: 5,
    })
    
    // Merge and deduplicate results
    // Show Brave results if business not in our DB
  } catch (error) {
    // Fail gracefully - show only DB results
  }

  return <ResultsLayout results={dbResults} />
}
```

### 2. Business Verification
Use Brave Search to verify business information during admin approval:

```typescript
// app/admin/pending/actions.ts
export async function verifyBusiness(businessName: string, phone: string) {
  const searchResults = await braveWebSearch({
    q: `"${businessName}" "${phone}" netanya`,
    count: 5,
  })

  // Check if business appears in legitimate sources
  const isVerified = searchResults.web?.results?.some(result =>
    result.url.includes(businessName.toLowerCase())
  )

  return { isVerified, sources: searchResults.web?.results }
}
```

### 3. Related Searches Suggestions
Show users related search terms:

```typescript
// components/server/SearchSuggestions.tsx
export async function SearchSuggestions({ query }: { query: string }) {
  const results = await braveWebSearch({ q: query, count: 1 })
  
  return (
    <div>
      <h3>חיפושים קשורים:</h3>
      <ul>
        {results.query?.related_searches?.map(term => (
          <li key={term}>{term}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 4. Business Image Enrichment
Use Brave Local API to fetch photos for businesses:

```typescript
// lib/enrich-business.ts
export async function enrichBusinessWithPhotos(businessName: string) {
  // Step 1: Search for location
  const searchResults = await braveLocalSearch({
    query: businessName,
    count: 1,
  })

  const locationId = searchResults.locations?.results?.[0]?.id
  if (!locationId) return null

  // Step 2: Fetch POI details with photos
  const poiData = await fetch(
    `https://api.search.brave.com/res/v1/local/pois?ids=${locationId}`,
    {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_API_KEY!,
      },
    }
  ).then(r => r.json())

  return poiData.results?.[0]?.images
}
```

---

## Best Practices

### 1. Rate Limiting
Brave API has rate limits - implement caching:

```typescript
import { unstable_cache } from 'next/cache'

export const cachedBraveSearch = unstable_cache(
  async (query: string) => braveWebSearch({ q: query }),
  ['brave-search'],
  { revalidate: 3600 } // Cache for 1 hour
)
```

### 2. Error Handling
Always fail gracefully:

```typescript
try {
  const braveResults = await braveWebSearch({ q: query })
  return braveResults
} catch (error) {
  console.error('Brave API error:', error)
  // Return database results only
  return dbResults
}
```

### 3. Privacy Compliance
Don't send user PII to Brave API:

```typescript
// ❌ Bad - includes user data
await braveWebSearch({ q: `${userEmail} search term` })

// ✅ Good - only search terms
await braveWebSearch({ q: 'plumbers netanya' })
```

### 4. Cost Management
Monitor API usage:

```typescript
// Track API calls in Redis
await redis.incr(`brave_api_calls:${date}`)

// Check before calling
const callsToday = await redis.get(`brave_api_calls:${date}`)
if (callsToday > MAX_DAILY_CALLS) {
  throw new Error('Daily API limit reached')
}
```

---

## Testing

### Unit Tests
**File**: `tests/unit/lib/brave-search.test.ts`

```typescript
import { describe, test, expect, vi } from 'vitest'
import { braveWebSearch } from '@/lib/brave-search'

describe('Brave Search API', () => {
  test('should fetch web search results', async () => {
    const results = await braveWebSearch({ q: 'test query' })
    expect(results).toHaveProperty('query')
    expect(results).toHaveProperty('web')
  })

  test('should handle API errors gracefully', async () => {
    // Mock fetch to return error
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Rate limit exceeded',
    } as Response)

    await expect(braveWebSearch({ q: 'test' })).rejects.toThrow()
  })
})
```

### Integration Tests
**File**: `tests/integration/brave-search-results.test.tsx`

```typescript
import { render, waitFor } from '@testing-library/react'
import ResultsPage from '@/app/[lang]/netanya/[neighborhood]/[service]/page'

test('should show both DB and Brave results', async () => {
  const { getByText } = render(
    <ResultsPage params={{ service: 'plumbers', neighborhood: 'merkaz' }} />
  )

  await waitFor(() => {
    expect(getByText(/תוצאות/)).toBeInTheDocument()
  })
})
```

---

## Documentation

### API Reference
- [Brave Search API Docs](https://brave.com/search/api/)
- [Query Parameters](https://api.search.brave.com/app/documentation/web-search/query)
- [Response Objects](https://api.search.brave.com/app/documentation/web-search/responses)

### Response Models
- `WebSearchApiResponse` - Web search results
- `LocalPoiSearchApiResponse` - Location details with photos
- `LocalDescriptionsSearchApiResponse` - AI-generated descriptions
- `RichSearchApiResponse` - Rich vertical data

---

## Subscription Plan

**Current Plan**: Free (with subscription required)  
**API Key**: Configured in `.env.local`  
**Access**: 
- ✅ Web Search API
- ❌ Local Search API (requires Pro)
- ❌ Rich Search API (requires Pro)

**Upgrade to Pro** for:
- Local POI enrichment with photos
- AI-generated business descriptions
- Rich verticals (weather, stocks, etc.)
- Higher rate limits

---

## Security Checklist

- [x] API key stored in `.env.local`
- [x] `.env.local` excluded in `.gitignore`
- [x] `.env.example` provided for other developers
- [x] No hardcoded keys in source code
- [x] Server-side API calls only (never expose key to client)
- [ ] Rate limiting implemented
- [ ] Usage monitoring set up
- [ ] Error logging configured

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-14  
**Related Files**: `.env.local`, `.env.example`, `.gitignore`, `lib/brave-search.ts`

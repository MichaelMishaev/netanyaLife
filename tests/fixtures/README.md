# Test Fixtures

This folder contains mock data for testing.

## Structure

- `businesses.ts` - Mock business data
- `categories.ts` - Mock category data
- `neighborhoods.ts` - Mock neighborhood data
- `reviews.ts` - Mock review data
- `users.ts` - Mock user/admin data

## Usage

```typescript
import { mockBusinesses } from '@/tests/fixtures/businesses'

// Use in tests
expect(result).toEqual(mockBusinesses[0])
```

**Note**: Fixtures will be added as we build out the application in Week 2+

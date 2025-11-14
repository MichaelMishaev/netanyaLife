# Testing Guide

## Folder Structure

```
tests/
├── unit/              # Fast, isolated tests
│   ├── components/    # Component tests
│   ├── lib/          # Library function tests
│   │   ├── queries/  # Database query tests
│   │   ├── validations/ # Schema validation tests
│   │   └── utils/    # Utility function tests
│   └── contexts/     # React context tests
├── integration/       # Multi-component flows
├── e2e/              # Full user journeys
│   └── specs/        # E2E test files
├── visual/           # Visual regression tests
├── performance/      # Lighthouse tests
├── fixtures/         # Test data
└── helpers/          # Test utilities
```

## Running Tests

```bash
# Unit tests
npm test              # Run once
npm test:watch        # Watch mode

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
npm run test:e2e:ui   # Interactive UI

# All tests
npm run test:all

# Coverage
npm run test:coverage  # Must be ≥80%
```

## Writing Tests

### TDD Workflow

1. Create component: `touch components/MyComponent.tsx`
2. Create test: `touch tests/unit/components/MyComponent.test.tsx`
3. Write test first
4. Implement component
5. Run `npm test:watch` during development

### Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/tests/helpers/test-utils'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

## Coverage Targets

- **Overall**: 80%+
- **Critical paths** (ordering, validation): 100%
- **Components**: 80%
- **Utilities**: 90%

## Resources

- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Playwright](https://playwright.dev)

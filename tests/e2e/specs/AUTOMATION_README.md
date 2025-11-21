# Comprehensive E2E Automation Test Suite

This test suite provides comprehensive automation that systematically tests all combinations of categories and neighborhoods, the add business form, and complete user journeys.

## Test Suites

### 1. All Category + Neighborhood Combinations
- **File**: `comprehensive-automation.spec.ts`
- **Description**: Systematically tests EVERY combination of category × neighborhood
- **What it does**:
  - Extracts all categories from the search form
  - Extracts all neighborhoods (works with both dropdown and segmented buttons)
  - Performs a search for each combination
  - Takes screenshots of each result
  - Generates a summary report with success rate

### 2. Add Business Form Testing
- **What it does**:
  - Tests form with valid data (phone only)
  - Tests validation with empty form
  - Tests all field combinations
  - Takes screenshots at each step

### 3. Complete User Journey
- **What it does**:
  - Home page → Search → Results → Business Detail → Add Business → Home
  - Takes screenshots at each step
  - Verifies navigation works correctly

### 4. Language Switching
- **What it does**:
  - Tests in both Hebrew (RTL) and Russian (LTR)
  - Verifies text direction
  - Performs searches in both languages

## Running the Tests

### Run All Automation Tests
```bash
npm run test:e2e -- comprehensive-automation.spec.ts --project=chromium
```

### Run Specific Test Suite

#### Test All Combinations Only
```bash
npm run test:e2e -- comprehensive-automation.spec.ts:14 --project=chromium
```

#### Test Add Business Form Only
```bash
npm run test:e2e -- comprehensive-automation.spec.ts:239 --project=chromium
```

#### Test User Journey Only
```bash
npm run test:e2e -- comprehensive-automation.spec.ts:343 --project=chromium
```

#### Test Language Switching Only
```bash
npm run test:e2e -- comprehensive-automation.spec.ts:434 --project=chromium
```

### Run with Visual Browser (Headed Mode)
```bash
npm run test:e2e -- comprehensive-automation.spec.ts --project=chromium --headed
```

### Run with Debug Mode
```bash
npm run test:e2e -- comprehensive-automation.spec.ts --project=chromium --debug
```

### Run on All Browsers
```bash
# Chromium
npm run test:e2e -- comprehensive-automation.spec.ts --project=chromium

# Firefox
npm run test:e2e -- comprehensive-automation.spec.ts --project=firefox

# WebKit (Safari)
npm run test:e2e -- comprehensive-automation.spec.ts --project=webkit

# Edge
npm run test:e2e -- comprehensive-automation.spec.ts --project=edge
```

### Run on Mobile Devices
```bash
# Mobile Chrome
npm run test:e2e -- comprehensive-automation.spec.ts --project="Mobile Chrome"

# Mobile Safari
npm run test:e2e -- comprehensive-automation.spec.ts --project="Mobile Safari"
```

## Output

### Screenshots
All screenshots are saved to:
```
test-results/automation/
├── combo-1-[category]-[neighborhood].png
├── combo-2-[category]-[neighborhood].png
├── ...
├── journey-1-home.png
├── journey-2-search-results.png
├── journey-3-business-detail.png
├── journey-4-add-business.png
├── journey-5-back-home.png
├── add-business-filled.png
├── add-business-submitted.png
├── add-business-validation.png
├── language-he.png
└── language-ru.png
```

### Console Output
The test provides detailed console output:
```
🤖 Starting Comprehensive Automation Test
============================================================
📊 Found 15 categories
📍 Found 4 neighborhoods
🔢 Total combinations to test: 60
============================================================

[1/60] Testing:
  📁 Category: חשמלאים
  📍 Neighborhood: מרכז נתניה
  ✅ Success! URL: http://localhost:4700/he/search/electricians/merkaz
  📊 Found 5 business cards

[2/60] Testing:
  📁 Category: חשמלאים
  📍 Neighborhood: צפון נתניה
  ✅ Success! URL: http://localhost:4700/he/search/electricians/tsafon
  📊 Found 3 business cards

...

============================================================
📊 TEST SUMMARY
============================================================
✅ Successful: 58
❌ Failed: 2
📈 Success Rate: 96.67%
```

## Test Results

### HTML Report
After running tests, open the HTML report:
```bash
npx playwright show-report
```

This will open an interactive report showing:
- Test results
- Screenshots
- Videos (on failure)
- Traces (on failure)

## Prerequisites

Make sure the development server is running before executing tests:

```bash
# Start dev server
npm run dev

# In another terminal, run tests
npm run test:e2e -- comprehensive-automation.spec.ts --project=chromium
```

Alternatively, Playwright will automatically start the dev server if configured in `playwright.config.ts`.

## Configuration

### Timeout
- **All Combinations Test**: 5 minutes (300,000ms)
- **Add Business Test**: 2 minutes (120,000ms)
- **User Journey Test**: 3 minutes (180,000ms)

### Success Rate Threshold
- Tests expect at least 90% success rate
- If less than 90% of combinations pass, the test will fail

## Troubleshooting

### Test Times Out
If the test times out, increase the timeout:
```typescript
test.setTimeout(600000) // 10 minutes
```

### Too Many Screenshots
To reduce screenshot count, modify the test to only capture failures:
```typescript
if (!result.success) {
  await page.screenshot({ ... })
}
```

### Dev Server Not Running
Make sure the dev server is running on port 4700:
```bash
lsof -ti:4700  # Check if port is in use
npm run dev    # Start dev server
```

## Best Practices

1. **Run on Chromium First**: It's the fastest browser for initial testing
2. **Review Screenshots**: Check `test-results/automation/` after each run
3. **Monitor Console**: Watch the detailed progress output
4. **Run Periodically**: Execute after major changes to catch regressions
5. **Clean Test Results**: Delete old screenshots before new runs

## CI/CD Integration

To integrate with CI/CD pipelines:

```yaml
# .github/workflows/e2e-automation.yml
name: E2E Automation Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e -- comprehensive-automation.spec.ts --project=chromium
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Performance Optimization

For faster test execution:

1. **Parallel Execution**: Tests already run in parallel
2. **Reduce Waits**: Minimize `waitForTimeout` delays
3. **Skip Screenshots**: Comment out screenshot lines for faster runs
4. **Targeted Testing**: Run specific test suites instead of all

## Example Output

```bash
$ npm run test:e2e -- comprehensive-automation.spec.ts --project=chromium

Running 4 tests using 1 worker

🤖 Starting Comprehensive Automation Test
============================================================
📊 Found 15 categories
📍 Found 4 neighborhoods
🔢 Total combinations to test: 60
============================================================
...
============================================================
📊 TEST SUMMARY
============================================================
✅ Successful: 60
❌ Failed: 0
📈 Success Rate: 100.00%

  ✓ [chromium] › comprehensive-automation.spec.ts:14:3 › Test all combinations (243s)
  ✓ [chromium] › comprehensive-automation.spec.ts:239:3 › Test Add Business form (45s)
  ✓ [chromium] › comprehensive-automation.spec.ts:343:3 › Complete user journey (32s)
  ✓ [chromium] › comprehensive-automation.spec.ts:434:3 › Language switching (28s)

  4 passed (348s)
```

## Support

For issues or questions about the automation tests:
1. Check the console output for detailed error messages
2. Review screenshots in `test-results/automation/`
3. Check the Playwright HTML report
4. Verify the dev server is running on port 4700

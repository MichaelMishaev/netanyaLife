# 🤖 Comprehensive E2E Automation Suite

## Quick Start

```bash
# Interactive menu (recommended for beginners)
npm run test:e2e:automation:interactive

# Run all automation tests (headless)
npm run test:e2e:automation

# Run with visual browser
npm run test:e2e:automation:headed

# Run on all browsers (Chrome, Firefox, Safari)
npm run test:e2e:automation:all
```

## What Does It Test?

### 1. 🔄 All Category × Neighborhood Combinations
- Automatically extracts all categories from your database
- Automatically extracts all neighborhoods
- Tests EVERY possible combination (e.g., 15 categories × 4 neighborhoods = 60 searches)
- Takes screenshots of each result
- Generates a comprehensive report

### 2. 📝 Add Business Form
- Tests form with valid data
- Tests validation errors (missing fields)
- Tests phone/WhatsApp validation
- Tests all field combinations

### 3. 🚀 Complete User Journey
- Home → Search → Results → Business Detail → Add Business → Home
- Verifies navigation works correctly
- Takes screenshots at each step

### 4. 🌐 Language Switching
- Tests Hebrew (RTL) and Russian (LTR)
- Verifies text direction
- Tests searches in both languages

## Available Commands

```bash
# 🎯 Quick commands
npm run test:e2e:automation              # Run all tests (headless, Chromium only)
npm run test:e2e:automation:all          # Run on Chrome, Firefox, and Safari
npm run test:e2e:automation:headed       # Run with visible browser
npm run test:e2e:automation:interactive  # Interactive menu (easiest)

# 📊 View results
npx playwright show-report               # Open HTML report with screenshots

# 🔍 Run specific test suites
npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts:14 --project=chromium   # All combinations only
npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts:239 --project=chromium  # Add Business only
npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts:343 --project=chromium  # User Journey only
npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts:434 --project=chromium  # Language switching only
```

## Interactive Menu

The easiest way to run tests:

```bash
npm run test:e2e:automation:interactive
```

This will show you a menu:

```
╔══════════════════════════════════════════════════════╗
║  קהילת נתניה - E2E Automation Test Runner         ║
╔══════════════════════════════════════════════════════╗

Choose a test suite to run:

1. 🔄 All Combinations (Category × Neighborhood)
2. 📝 Add Business Form Tests
3. 🚀 Complete User Journey
4. 🌐 Language Switching (Hebrew/Russian)
5. 🎯 Run ALL Tests
6. 👁️  Run with Visual Browser (Headed Mode)
7. 🐛 Run with Debug Mode
8. 📱 Run on Mobile (Chrome)
9. 🦊 Run on Firefox
10. 🧪 Run on All Browsers

0. Exit

Enter your choice (0-10):
```

## Output & Screenshots

All screenshots are automatically saved to:

```
test-results/automation/
├── combo-1-Electricians-Center.png
├── combo-2-Electricians-North.png
├── combo-3-Electricians-South.png
├── ...
├── journey-1-home.png
├── journey-2-search-results.png
├── journey-3-business-detail.png
├── journey-4-add-business.png
├── add-business-filled.png
├── add-business-submitted.png
├── language-he.png
└── language-ru.png
```

## Console Output Example

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
  📁 Category: אינסטלטורים
  📍 Neighborhood: מרכז נתניה
  ✅ Success! URL: http://localhost:4700/he/search/plumbers/merkaz
  📊 Found 3 business cards

...

============================================================
📊 TEST SUMMARY
============================================================
✅ Successful: 58
❌ Failed: 2
📈 Success Rate: 96.67%

✓ [chromium] › comprehensive-automation.spec.ts:14 › All combinations (243s)
✓ [chromium] › comprehensive-automation.spec.ts:239 › Add Business (45s)
✓ [chromium] › comprehensive-automation.spec.ts:343 › User Journey (32s)
✓ [chromium] › comprehensive-automation.spec.ts:434 › Languages (28s)

4 passed (348s)
```

## File Locations

```
📁 Project Structure
├── tests/e2e/specs/
│   ├── comprehensive-automation.spec.ts   # Main test file
│   └── AUTOMATION_README.md              # Detailed documentation
├── scripts/
│   └── run-automation.sh                 # Interactive runner script
├── test-results/
│   └── automation/                       # Screenshots saved here
├── playwright-report/                    # HTML report
└── AUTOMATION.md                         # This file (quick reference)
```

## Prerequisites

1. **Dev server must be running** on port 4700:
   ```bash
   npm run dev
   ```

2. **Database must be seeded** with categories and neighborhoods:
   ```bash
   npm run prisma:seed
   ```

3. **Playwright must be installed**:
   ```bash
   npx playwright install
   ```

## Troubleshooting

### Problem: Tests time out

**Solution**: Increase timeout in the test file or run fewer combinations at once.

### Problem: Dev server not running

**Solution**:
```bash
# Start dev server
npm run dev

# Or the script will auto-start it for you
npm run test:e2e:automation:interactive
```

### Problem: Too many screenshots

**Solution**: Modify the test to only capture failures or reduce the number of combinations tested.

### Problem: Tests fail randomly

**Solution**:
- Ensure the dev server is stable
- Check your internet connection (if using external APIs)
- Increase wait times in the test if pages load slowly

## Best Practices

1. **Start with interactive mode**: Easiest way to get started
2. **Review screenshots**: Check `test-results/automation/` after each run
3. **Run regularly**: Execute after major changes to catch regressions
4. **Use headless mode in CI/CD**: Faster and more reliable
5. **Clean old results**: Delete old screenshots before new runs

## CI/CD Integration

Add to your `.github/workflows/e2e.yml`:

```yaml
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
      - run: npm run test:e2e:automation
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Performance

- **Average runtime**:
  - All combinations: ~4 minutes (60 searches)
  - Add Business: ~45 seconds
  - User Journey: ~30 seconds
  - Language switching: ~30 seconds
  - **Total**: ~6 minutes

- **Optimization tips**:
  - Run only what you need
  - Use `--project=chromium` instead of all browsers
  - Reduce screenshot frequency
  - Use parallel execution (already enabled)

## Need Help?

1. **Detailed docs**: See `tests/e2e/specs/AUTOMATION_README.md`
2. **Test file**: See `tests/e2e/specs/comprehensive-automation.spec.ts`
3. **Interactive script**: Run `npm run test:e2e:automation:interactive`
4. **HTML report**: Run `npx playwright show-report` after tests

## Example Workflow

```bash
# 1. Make sure dev server is running
npm run dev

# 2. Run the interactive menu (in another terminal)
npm run test:e2e:automation:interactive

# 3. Choose option 5 (Run ALL Tests)

# 4. Wait for tests to complete

# 5. View the HTML report
npx playwright show-report

# 6. Check screenshots
ls test-results/automation/
```

---

**Created for**: קהילת נתניה Business Directory
**Automation Coverage**: Category search, business submission, user journeys, i18n
**Last Updated**: 2025

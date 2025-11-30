# 🚀 Quick Start - Customer Automation Tests

## ⚡ TL;DR - Run Tests Now

```bash
# Run ALL new customer tests (recommended)
npm run test:e2e -- customer-complete-validation search-result-ordering business-cta-validation pwa-offline --project=chromium

# Or run everything
npm run test:e2e
```

---

## 📋 What's Included

**4 New Test Suites:**
1. ✅ `customer-complete-validation.spec.ts` - All screens (17 tests)
2. ✅ `search-result-ordering.spec.ts` - Critical ordering logic (6 tests)
3. ✅ `business-cta-validation.spec.ts` - CTA buttons (8 tests)
4. ✅ `pwa-offline.spec.ts` - PWA features (11 tests)

**Total:** 42 comprehensive customer tests

---

## 🎯 Run Specific Test Suites

### Master Validation Suite (All Screens)
```bash
npm run test:e2e -- customer-complete-validation
```
**Tests:** Homepage, Search, Business Detail, Forms, Accessibility, Mobile

---

### Critical Business Logic (Search Ordering)
```bash
npm run test:e2e -- search-result-ordering
```
**Tests:** Pinned businesses first → Random 5 → Rating DESC

---

### CTA Button Validation
```bash
npm run test:e2e -- business-cta-validation
```
**Tests:** Phone, WhatsApp, Website, Directions, Share buttons

---

### PWA & Offline Features
```bash
npm run test:e2e -- pwa-offline
```
**Tests:** Service worker, manifest, offline mode, caching

---

## 🔧 Development Commands

### Interactive UI Mode (Best for Debugging)
```bash
npm run test:e2e:ui
```
- Visual test runner
- Step-by-step debugging
- Live browser view

### Run Single Test
```bash
npx playwright test -g "HOMEPAGE - Hebrew"
```

### Run in Headed Mode (See Browser)
```bash
npx playwright test customer-complete-validation --headed
```

### Debug Mode
```bash
npx playwright test --debug
```

### Single Browser (Faster)
```bash
npx playwright test --project=chromium
```

---

## 📊 View Test Reports

```bash
# After tests run
npx playwright show-report
```

**Screenshots saved to:**
- `test-results/customer-validation/`
- `test-results/ordering/`
- `test-results/cta/`

---

## ✅ Pass Criteria

All tests should pass when:
1. ✅ Database is seeded with test data
2. ✅ Dev server running on http://localhost:4700
3. ✅ All customer pages are accessible
4. ✅ Business data exists in database

---

## 🔍 If Tests Fail

### Check 1: Dev Server Running?
```bash
npm run dev
# Should be on http://localhost:4700
```

### Check 2: Database Seeded?
```bash
npm run db:seed
```

### Check 3: View Screenshots
Look in `test-results/` for failure screenshots

### Check 4: Check Logs
Tests output detailed logs:
```
🏠 Testing Hebrew Homepage
✅ RTL direction confirmed
✅ Header and logo visible
❌ Footer links not found
```

---

## 📚 Documentation

- **Complete Guide:** `CUSTOMER_TESTS_README.md`
- **Summary:** `TEST_SUMMARY.md`
- **Helper Functions:** `helpers/test-utils.ts`

---

## 🎯 Most Important Tests

### Critical Business Logic Tests ⭐⭐⭐
```bash
# Search ordering (pinned → random → rating)
npm run test:e2e -- search-result-ordering --project=chromium

# Phone/WhatsApp requirement
npm run test:e2e -- business-cta-validation --project=chromium
```

### Full Validation ⭐⭐
```bash
# All screens working
npm run test:e2e -- customer-complete-validation --project=chromium
```

---

## 💡 Pro Tips

1. **Use UI mode for development:**
   ```bash
   npm run test:e2e:ui
   ```

2. **Run single browser for speed:**
   ```bash
   --project=chromium
   ```

3. **Filter tests by name:**
   ```bash
   -g "CTA"  # Only CTA tests
   ```

4. **Update snapshots:**
   ```bash
   npm run test:e2e -- --update-snapshots
   ```

5. **Parallel execution:**
   Tests run in parallel automatically!

---

## 🚨 Common Issues

### Issue: "Timeout waiting for search results"
**Fix:** Database needs data
```bash
npm run db:seed
```

### Issue: "Element not visible"
**Fix:** Page loading, increase timeout or add wait
```typescript
await page.waitForLoadState('networkidle')
```

### Issue: "No businesses found"
**Fix:** Create test businesses in database

---

## 🎉 Success Checklist

Before deployment, ensure:
- [ ] All customer tests pass
- [ ] Search ordering logic validated
- [ ] CTA buttons (phone/WhatsApp) validated
- [ ] Accessibility panel works
- [ ] Mobile responsive (no horizontal scroll)
- [ ] PWA features working

---

## 📞 Need Help?

1. Check `CUSTOMER_TESTS_README.md` for detailed docs
2. Look at `TEST_SUMMARY.md` for overview
3. View test screenshots in `test-results/`
4. Check Playwright docs: https://playwright.dev

---

**Happy Testing! 🚀**

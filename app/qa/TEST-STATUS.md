# Business Registration & Approval Test - Current Status

**Date**: 2025-11-25
**Test File**: `/tests/e2e/specs/business-registration-approval.spec.ts`
**Status**: 🟡 In Progress (2/10 steps working)

---

## ✅ Working Steps

### Step 1: Login as Business Owner ✅
- Successfully detects if account exists
- If not exists, clicks "אין לך חשבון?" to switch to register mode
- Fills registration form (name, email, password)
- Submits and waits for redirect to business portal
- **Result**: WORKING

### Step 2: Navigate to Add Business ✅
- Navigates to business portal
- Clicks "הוסף עסק" (Add Business) button
- Waits for URL change to `/business-portal/add`
- **Result**: WORKING

---

## 🔧 Needs Fixing

### Step 3: Select Category ❌
**Issue**: Form uses **custom dropdown components** instead of native `<select>` elements

**Current Code** (not working):
```typescript
const categories = await page.evaluate(() => {
  const select = document.querySelector('select[name="categoryId"]')
  // Returns null because there's no <select> element
})
```

**What's Actually on the Page**:
- Custom SearchableSelect component
- Displays as: "בחר קטגוריה" (Choose a category)
- Clicking opens a custom dropdown menu

**Fix Needed**:
```typescript
// Instead of looking for <select>, need to:
1. Click on the category dropdown button/div
2. Wait for dropdown menu to appear
3. Click on a category option from the list
4. Repeat for neighborhood dropdown
```

**Component Structure** (from screenshot):
```
קטגוריה * (Category)
[בחר קטגוריה ▼]  ← Click this to open menu

שכונה * (Neighborhood)
[בחר שכונה ▼]  ← Click this to open menu
```

---

## 📋 Remaining Steps (Not Yet Tested)

- Step 4: Select Neighborhood
- Step 5: Fill All Business Fields
- Step 6: Submit Business
- Step 7: Login as Super Admin
- Step 8: Navigate to Pending Businesses
- Step 9: Approve Business
- Step 10: Verify in Owner Portal

---

## 🔑 Credentials (Working)

**Business Owner**:
- Email: `test555@gmail.com`
- Password: `admin123456`
- ✅ Account created successfully

**Super Admin**:
- Email: `345287@gmail.com`
- Password: `admin123456`

---

## 🚀 How to Run

```bash
# Terminal 1: Start dev server (if not running)
npm run dev

# Terminal 2: Run test with browser visible
npm run test:qa:business-flow:headed

# Or headless
npm run test:qa:business-flow

# Or debug mode
npm run test:qa:business-flow:debug
```

---

## 📸 Test Screenshots

Screenshots saved to: `/test-results/`

**Latest Screenshots**:
1. `test-failed-1.png` - Shows the add business form with custom dropdowns
   - Form fields visible: Business Name, Category, Neighborhood
   - Custom dropdown components identified

---

## 🛠️ Quick Fix Guide

To fix the category/neighborhood selection:

### Option 1: Find Component Selectors

Check `OwnerAddBusinessForm.tsx` for:
- SearchableSelect component structure
- Button/div that triggers dropdown
- Menu structure when opened

### Option 2: Use Playwright Inspector

```bash
npx playwright test --debug tests/e2e/specs/business-registration-approval.spec.ts
```

Then inspect the category dropdown to find correct selectors.

### Option 3: Manual Test

1. Run test in headed mode
2. When it fails at category selection, pause
3. Manually click the dropdown to see structure
4. Use browser devtools to find selectors

---

## 📝 Test Configuration

**Port**: 4700 (updated)
**Timeout**: 180 seconds (3 minutes)
**Browser**: Chromium (headed mode for debugging)
**Base URL**: http://localhost:4700

---

## 🐛 Known Issues

1. **Category/Neighborhood Dropdowns**: Custom components, not native selects
2. **Need Component Investigation**: Must check SearchableSelect/SimpleSelect implementation

---

## 💡 Next Actions

1. **Investigate dropdown component**:
   - Check `/components/client/SearchableSelect.tsx`
   - Check `/components/client/SimpleSelect.tsx`
   - Identify correct selectors for interaction

2. **Update test with correct selectors**:
   ```typescript
   // Example fix (need to verify actual selectors):
   await page.click('[data-testid="category-dropdown"]')
   await page.waitForSelector('[role="listbox"]')
   await page.click('text="חשמלאים"') // First category
   ```

3. **Continue testing remaining steps**

---

## 📞 Support

**Test Location**: `/tests/e2e/specs/business-registration-approval.spec.ts`
**Documentation**: `/app/qa/` directory
**Screenshots**: `/test-results/` directory

---

**Last Updated**: 2025-11-25 11:23
**Progress**: 20% complete (2/10 steps)

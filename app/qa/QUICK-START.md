# Quick Start Guide - Business Registration & Approval Automation

## 🚀 Run the Test

### 1. Start Development Server

```bash
npm run dev
```

Keep this running in a terminal.

### 2. Run the Automation

Choose one of these options:

**Option A: Headless (fastest)**
```bash
npm run test:qa:business-flow
```

**Option B: With Browser Visible (recommended for first run)**
```bash
npm run test:qa:business-flow:headed
```

**Option C: Debug Mode (step-by-step)**
```bash
npm run test:qa:business-flow:debug
```

## 📋 What Happens?

The automation will:

1. ✅ **Register/Login** as business owner (test555@gmail.com)
2. ✅ **Create business** with different category each time
3. ✅ **Fill all fields** (Hebrew, Russian, contact info)
4. ✅ **Submit** for approval
5. ✅ **Login as admin** (345287@gmail.com)
6. ✅ **Approve** the business
7. ✅ **Verify** business appears in owner portal

## 🔑 Credentials Used

**Business Owner:**
- Email: `test555@gmail.com`
- Password: `admin123456`

**Super Admin:**
- Email: `345287@gmail.com`
- Password: `admin123456`

## 📸 Screenshots

The test saves screenshots to: `tests/screenshots/`

- `business-form-filled-*.png`
- `pending-business-*.png`
- `owner-portal-final-*.png`

## 🔄 Running Multiple Times

Each run creates a **unique business** with:
- Rotated category selection
- Unique names and phone numbers
- Timestamp-based data

No cleanup needed between runs!

## ⏱️ Duration

Expected: **60-120 seconds**

## ❓ Troubleshooting

### Test fails immediately?
- Ensure dev server is running (`npm run dev`)
- Check database is accessible
- Verify Redis is running

### Can't find business in admin panel?
- Check business was submitted (look for success message)
- Verify admin can access pending businesses page

### Business not in owner portal?
- Ensure approval succeeded
- Check database that business has `owner_id` set

## 🎯 Next Steps

After successful run:
1. Check the screenshots in `tests/screenshots/`
2. Verify the business in the database
3. Run again to test different category
4. Run multiple times for stress testing

## 📝 Logs

The test outputs detailed logs:
```
=== STEP 1: Login as Business Owner ===
✓ Logged in as business owner

=== STEP 2: Navigate to Add Business ===
✓ On Add Business page

=== STEP 3: Select Category ===
✓ Selected category: חשמלאים (123)

... and so on
```

Watch the console output for progress!

## 🐛 Found Issues?

Document bugs in: `/Users/michaelmishayev/Desktop/Projects/netanyaBusiness/docs/bugs/bugs.md`

Format:
```markdown
## Bug: [Title]
- **Date**: 2025-11-24
- **Test**: business-registration-approval
- **Description**: [What went wrong]
- **Solution**: [How it was fixed]
```

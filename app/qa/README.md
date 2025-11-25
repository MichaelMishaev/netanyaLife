# QA Automation Suite

This directory contains documentation for E2E automation tests for the Netanya Local business directory platform.

## Test: Business Registration & Approval Flow

**File**: `/tests/e2e/specs/business-registration-approval.spec.ts`

### What This Test Does

This automation test simulates the complete lifecycle of a business submission and approval:

1. **Register/Login as Business Owner**
   - Email: `test555@gmail.com`
   - Password: `admin123456`
   - Automatically registers if account doesn't exist

2. **Create New Business**
   - Selects a different category each time (rotating through all available categories)
   - If subcategories are available, selects the first one
   - Fills **ALL** fields (Hebrew, Russian, contact, descriptions, hours)
   - Generates unique business data with timestamps to avoid duplicates

3. **Submit Business**
   - Submits the business for approval
   - Takes screenshot of filled form

4. **Login as Super Admin**
   - Email: `345287@gmail.com`
   - Password: `admin123456`

5. **Approve Business**
   - Navigates to pending businesses
   - Finds the submitted business
   - Approves it
   - Takes screenshot of approval

6. **Verify in Owner Portal**
   - Logs back in as business owner
   - Verifies the business now appears in their portal
   - Takes final screenshot

### Running the Test

#### Prerequisites

Make sure the development server is running:

```bash
npm run dev
```

#### Run Test (Headless)

```bash
npx playwright test app/qa/business-registration-approval.spec.ts
```

#### Run Test (With Browser Visible)

```bash
npx playwright test app/qa/business-registration-approval.spec.ts --headed
```

#### Run Test (Debug Mode)

```bash
npx playwright test app/qa/business-registration-approval.spec.ts --debug
```

#### Run Test (UI Mode - Interactive)

```bash
npx playwright test app/qa/business-registration-approval.spec.ts --ui
```

### Test Configuration

The test uses these default credentials:

**Business Owner:**
- Email: `test555@gmail.com`
- Password: `admin123456`

**Super Admin:**
- Email: `345287@gmail.com`
- Password: `admin123456`

### Screenshots

The test automatically captures screenshots at key moments:
- `business-form-filled-*.png` - Before submitting
- `pending-business-*.png` - Business in approval queue
- `owner-portal-final-*.png` - Business in owner portal

Screenshots are saved to: `tests/screenshots/`

### Category Rotation

The test automatically rotates through all available categories:
- Run 1: Category 1
- Run 2: Category 2
- Run 3: Category 3
- Run N: Category (N % total_categories)

This ensures comprehensive coverage across all business types.

### Generated Business Data

Each test run creates a unique business with:
- **Unique names** (Hebrew & Russian)
- **Timestamp-based descriptions**
- **Random phone numbers** (050/052 prefixes)
- **Unique email** (test{random}@example.com)
- **Unique website** (test-business-{random}.com)
- **Full address and opening hours**

### Test Duration

Expected duration: **60-120 seconds**
- Timeout: 3 minutes (180 seconds)

### Troubleshooting

#### Test Fails on Login

- Verify the dev server is running on `http://localhost:3000`
- Check that database is accessible
- Ensure Redis is running (for session management)

#### Business Not Found in Pending Queue

- Check admin approval flow is working
- Verify business submission API is functional
- Check database has the pending business record

#### Business Not Visible in Owner Portal

- Verify approval actually updated the database
- Check that `owner_id` is correctly set on the business
- Ensure business visibility flags are correct

### Running Multiple Times

The test is designed to run multiple times:
- Each run creates a **new unique business**
- Categories rotate automatically
- Timestamps prevent duplicate names
- No manual cleanup needed between runs

### Continuous Integration

To run in CI/CD:

```bash
npm run test:e2e -- app/qa/business-registration-approval.spec.ts
```

### Extending the Test

To add more scenarios:

1. **Test Different Neighborhoods**: Modify the neighborhood selection logic
2. **Test Validation Errors**: Add negative test cases
3. **Test Rejection Flow**: Add admin rejection scenario
4. **Test Edit Flow**: Add business editing after approval

### Notes

- The test uses **Hebrew locale** (`/he/`) by default
- All form fields are filled to ensure comprehensive testing
- The test verifies both submission and approval workflows
- Screenshots help with debugging failed runs

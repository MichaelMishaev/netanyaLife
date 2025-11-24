# QA Automation - File Index

## 📁 Directory Structure

```
/app/qa/
├── business-registration-approval.spec.ts  # Main test file
├── INDEX.md                                 # This file
├── QUICK-START.md                          # Quick start guide
├── README.md                               # Full documentation
└── AUTOMATION-SUMMARY.md                   # Complete summary
```

---

## 📄 File Descriptions

### 1. business-registration-approval.spec.ts
**Type**: Playwright E2E Test
**Size**: ~500 lines
**Purpose**: Automated test for complete business registration and approval flow

**Key Functions**:
- `loginAsBusinessOwner()` - Handles owner registration/login
- `loginAsSuperAdmin()` - Admin authentication
- `getCategories()` - Fetches available categories
- `generateBusinessData()` - Creates unique business data
- Main test suite with 10 steps

---

### 2. QUICK-START.md ⚡ START HERE
**Best for**: First-time users

**Contains**:
- Simple run commands
- What to expect
- Credentials
- Quick troubleshooting

**Read time**: 2 minutes

---

### 3. README.md 📖
**Best for**: Detailed understanding

**Contains**:
- Complete test description
- All run options
- Configuration details
- Troubleshooting guide
- Extension instructions

**Read time**: 5-10 minutes

---

### 4. AUTOMATION-SUMMARY.md 📊
**Best for**: Comprehensive overview

**Contains**:
- Files created
- Test features
- Flow diagram
- Metrics and coverage
- Maintenance guide
- Extension examples

**Read time**: 10-15 minutes

---

### 5. INDEX.md (This File) 🗺️
**Purpose**: Navigate the QA directory

---

## 🚀 Quick Actions

### Run Test Now
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run test (with browser visible)
npm run test:qa:business-flow:headed
```

### View Screenshots
```bash
open tests/screenshots/
```

### Check Test Status
```bash
npx playwright test app/qa/business-registration-approval.spec.ts --list
```

---

## 📋 Reading Order

**For Quick Start**:
1. QUICK-START.md
2. Run test
3. Check screenshots

**For Full Understanding**:
1. QUICK-START.md
2. README.md
3. AUTOMATION-SUMMARY.md
4. Read test file source code

**For Developers**:
1. AUTOMATION-SUMMARY.md (understanding)
2. business-registration-approval.spec.ts (implementation)
3. README.md (reference)

---

## 🎯 Use Cases

| Need | Read This |
|------|-----------|
| "I just want to run the test" | QUICK-START.md |
| "How do I run in debug mode?" | QUICK-START.md or README.md |
| "What does the test do exactly?" | README.md |
| "I want to extend the test" | AUTOMATION-SUMMARY.md |
| "What are all the features?" | AUTOMATION-SUMMARY.md |
| "Where are my screenshots?" | QUICK-START.md |
| "Test is failing, help!" | README.md (Troubleshooting) |

---

## 🔗 External Links

- **Project Docs**: `/docs/`
- **Bug Reports**: `/docs/bugs/bugs.md`
- **System Requirements**: `/docs/sysAnal.md`
- **Playwright Docs**: https://playwright.dev/

---

## 📞 Support

**Issues with Test**:
- Check README.md troubleshooting section
- Run in debug mode: `npm run test:qa:business-flow:debug`
- Check browser console in headed mode

**Issues with Application**:
- Document in `/docs/bugs/bugs.md`
- Check system analysis in `/docs/sysAnal.md`

---

**Last Updated**: 2025-11-24
**Version**: 1.0.0

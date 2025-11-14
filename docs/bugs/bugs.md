# Bug Tracking & Solutions

**Purpose**: Document bugs encountered during development and their working solutions
**Last Updated**: 2025-11-14

---

## How to Use This File

When you encounter a bug during development:

1. **Document the bug** - Add a new entry with:
   - Bug description
   - Steps to reproduce
   - Error messages/logs
   - Expected vs actual behavior

2. **Document the solution** - When fixed, add:
   - Root cause analysis
   - Solution implemented
   - Code changes made
   - Prevention tips

3. **Mark as resolved** - Change status from 🔴 OPEN to ✅ RESOLVED

---

## Bug Template

````markdown
## BUG-XXX: [Short Description]

**Status**: 🔴 OPEN / ✅ RESOLVED
**Date Found**: YYYY-MM-DD
**Date Fixed**: YYYY-MM-DD
**Component**: [e.g., SearchForm, getSearchResults, etc.]
**Severity**: 🔴 Critical / 🟡 High / 🟢 Medium / ⚪ Low

### Description
[Detailed description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Error Messages/Logs
```
[Paste error messages or logs here]
```

### Environment
- OS: [e.g., macOS 14.5]
- Browser: [e.g., Chrome 120]
- Node: [e.g., v18.17.0]
- Next.js: [e.g., 14.0.4]

### Root Cause
[Analysis of why the bug occurred]

### Solution
[Detailed explanation of the fix]

### Code Changes
```typescript
// Before (broken)
[code]

// After (fixed)
[code]
```

### Files Changed
- `path/to/file1.ts`
- `path/to/file2.tsx`

### Prevention Tips
[How to avoid this bug in the future]

### Related Issues
- Links to related bugs or GitHub issues
````

---

## Active Bugs (🔴 OPEN)

*No active bugs yet. Add bugs here as you encounter them.*

---

## Resolved Bugs (✅ RESOLVED)

*No bugs resolved yet.*

---

## Bug Statistics

| Status | Count |
|--------|-------|
| 🔴 OPEN | 0 |
| ✅ RESOLVED | 0 |
| **TOTAL** | 0 |

---

## Common Issues & Quick Fixes

### RTL Layout Issues
**Symptom**: Layout breaks in Hebrew (RTL) mode
**Quick Fix**: Use Tailwind logical properties (`ms-4` instead of `ml-4`)
**Reference**: See `05-component-architecture.md` accessibility guidelines

### Service Worker Caching WhatsApp Links
**Symptom**: WhatsApp links don't work offline or open cached version
**Quick Fix**: Add `wa.me/*` to NetworkOnly strategy in PWA config
**Reference**: See `01-tech-stack.md` PWA configuration

### Search Ordering Random Results Not Changing
**Symptom**: Random 5 businesses always show in same order
**Quick Fix**: Ensure Fisher-Yates shuffle is called on every request (not cached)
**Reference**: See `04-api-endpoints.md` getSearchResults function

### Phone/WhatsApp Validation Failing
**Symptom**: Form rejects valid submissions with error
**Quick Fix**: Check Zod refine - should be OR logic, not AND
**Reference**: See `02-database-schema.md` validation rules

---

## Notes for Future Developers

### When Adding Bugs
1. Always include reproduction steps
2. Include full error messages (don't truncate)
3. Note the exact version of all dependencies
4. Add screenshots if UI-related
5. Link to related issues or PRs

### When Fixing Bugs
1. Document root cause (helps prevent recurrence)
2. Include before/after code snippets
3. List all files changed
4. Update any related documentation
5. Add prevention tips for similar bugs
6. Consider adding a test case to prevent regression

### Bug Severity Guidelines
- 🔴 **Critical**: Blocks core functionality, data loss, security issue
- 🟡 **High**: Major feature broken, workaround exists
- 🟢 **Medium**: Minor feature issue, doesn't block workflow
- ⚪ **Low**: Cosmetic issue, typo, minor UX improvement

---

**Last Updated**: 2025-11-14
**Maintained By**: Development Team

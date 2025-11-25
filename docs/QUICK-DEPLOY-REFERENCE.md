# Quick Railway Deployment Reference

## Critical Files Changed

1. **package.json**
   - `build` script: Removed `prisma migrate deploy`
   - Added `migrate:deploy` script for Railway

2. **railway.json** (NEW)
   - Defines build and deploy commands
   - Separates migration from build phase

3. **components/client/SubcategoryForm.tsx**
   - Fixed ESLint error with eslint-disable comment

4. **scripts/export-and-import-prod.ts**
   - Fixed TypeScript error with type assertion

5. **components/client/BusinessOwnerLoginForm.tsx**
   - Added debugging logs for auth issues

## One-Command Deploy

```bash
# Commit and push - Railway auto-deploys
git add .
git commit -m "fix: railway deployment configuration"
git push origin main
```

## Manual Railway Configuration

If `railway.json` doesn't work, configure manually in Railway dashboard:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run migrate:deploy && npm start
```

## Environment Variables Needed

```bash
DATABASE_URL=         # Auto-provided by Railway
JWT_SECRET=           # Generate: openssl rand -base64 32
NEXTAUTH_SECRET=      # Generate: openssl rand -base64 32
NODE_ENV=production
PORT=                 # Auto-provided by Railway
```

## Verify Deployment

1. Check build logs: No database connection errors
2. Check deploy logs: Migrations run successfully
3. Visit site: Homepage loads
4. Test admin login: `/he/admin-login` (345287@gmail.com / admin123456)

## Rollback

```bash
git revert HEAD
git push origin main
```

Or use Railway dashboard: Deployments → Previous Deployment → Redeploy

---
**Quick Help**: If build fails with "Can't reach database", migrations are running in build phase (should be in deploy phase only).

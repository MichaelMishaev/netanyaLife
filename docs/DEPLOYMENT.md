# Railway Deployment Guide - Netanya Local

This guide covers the deployment process for the Netanya Local application on Railway.

## Prerequisites

- Railway account connected to GitHub repository
- PostgreSQL database provisioned on Railway
- All environment variables configured

## Build Configuration

The project uses the following build setup:

### package.json Scripts
```json
{
  "build": "next build",
  "postinstall": "prisma generate",
  "migrate:deploy": "prisma migrate deploy",
  "start": "next start -p ${PORT:-4700}"
}
```

### Railway Configuration (railway.json)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run migrate:deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Deployment Process

### 1. Build Phase
Railway executes:
1. `npm install` - Installs all dependencies
2. `prisma generate` - Auto-runs via postinstall hook
3. `npm run build` - Builds Next.js production bundle

**Important**: Database is NOT accessible during build phase. Migrations are NOT run here.

### 2. Deploy Phase
Railway executes:
1. `npm run migrate:deploy` - Applies pending database migrations
2. `npm start` - Starts the Next.js production server

## Environment Variables

Required environment variables on Railway:

### Database
```bash
DATABASE_URL="postgresql://..."  # Auto-provided by Railway PostgreSQL
```

### Authentication
```bash
JWT_SECRET="your-secure-random-string-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

### Google OAuth (Optional)
```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="https://yourdomain.com/api/auth/google/callback"
GOOGLE_OWNER_REDIRECT_URI="https://yourdomain.com/api/auth/owner/google/callback"
```

### Redis (Optional - for analytics)
```bash
REDIS_URL="redis://..."
```

### Next.js
```bash
NODE_ENV="production"
PORT="4700"  # Railway auto-provides this
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

## Database Migrations

### Automatic Migrations (Recommended)
Migrations run automatically on each deployment via the `startCommand`:
```bash
npm run migrate:deploy && npm start
```

### Manual Migrations
If you need to run migrations manually:
1. Go to Railway project dashboard
2. Open the service shell
3. Run: `npm run migrate:deploy`

### Creating New Migrations
On your local machine:
```bash
# Create a new migration
npm run prisma:migrate

# This creates a migration file in prisma/migrations/
# Commit the migration file to git
git add prisma/migrations/
git commit -m "feat: add new migration"
git push origin main

# Railway will automatically apply it on next deploy
```

## Deployment Workflow

### Automatic Deployments
1. Push to `main` branch
2. Railway automatically triggers deployment
3. Build phase executes
4. Deploy phase executes (migrations + start)
5. Health checks verify deployment

### Manual Deployments
1. Go to Railway project dashboard
2. Click on your service
3. Click "Deploy" → "Trigger Deploy"

## Rollback Strategy

If a deployment fails:

### Option 1: Revert Git Commit
```bash
git revert HEAD
git push origin main
```
Railway will auto-deploy the reverted version.

### Option 2: Railway Dashboard
1. Go to "Deployments" tab
2. Find the last working deployment
3. Click "Redeploy"

### Option 3: Database Rollback
If migrations caused issues:
```bash
# SSH into Railway shell
railway shell

# Manually revert migration (use with caution!)
npx prisma migrate resolve --rolled-back <migration_name>
```

## Monitoring & Logs

### View Logs
```bash
# Via Railway CLI
railway logs

# Or in Railway dashboard: Deployments → View Logs
```

### Common Issues

#### Build Failure: "Can't reach database server"
**Cause**: Trying to run migrations during build phase
**Solution**: Migrations are now in deploy phase (fixed in this deployment)

#### Deployment Failure: Migration Error
**Cause**: Database schema conflicts
**Solution**:
1. Check migration file for conflicts
2. Manually resolve in Railway shell
3. Redeploy

#### Runtime Error: Missing Environment Variables
**Cause**: Missing required env vars
**Solution**: Add missing variables in Railway dashboard → Variables

## Production Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] Domain configured and SSL active
- [ ] Admin user credentials secured
- [ ] Google OAuth configured (if using)
- [ ] Redis configured (if using analytics)
- [ ] Error monitoring setup (optional: Sentry)
- [ ] Build succeeds locally: `npm run build`
- [ ] Migrations tested locally
- [ ] E2E tests passing

## Post-Deployment Verification

After deployment:

1. **Check Health**
   - Visit: `https://yourdomain.com`
   - Verify homepage loads

2. **Test Authentication**
   - Admin login: `/he/admin-login`
   - Business owner login: `/he/business-login`

3. **Test Database**
   - Create a test business submission
   - Verify it appears in admin panel

4. **Check Logs**
   - Review Railway logs for errors
   - Monitor for 5-10 minutes

## Scaling & Performance

### Auto-Scaling
Railway automatically scales based on:
- CPU usage
- Memory usage
- Request volume

### Manual Scaling
In Railway dashboard:
- Increase memory allocation
- Increase CPU allocation
- Enable multiple replicas (Pro plan)

### Database Performance
- Monitor query performance in Railway metrics
- Add indexes for slow queries
- Consider connection pooling (PgBouncer)

## Backup Strategy

### Database Backups
Railway provides automatic daily backups for PostgreSQL.

### Manual Backup
```bash
# Export production data
npm run prisma:export-prod

# Backup saved to: backups/prod-<date>/
```

### Restore from Backup
```bash
# Import to local database
npm run prisma:import-prod
```

## Support & Troubleshooting

### Railway Support
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Email: team@railway.app

### Project-Specific Issues
- Check deployment logs first
- Review error messages in Railway dashboard
- Verify all environment variables are set
- Ensure migrations are compatible

## Emergency Contacts

- **Database Issues**: Check Railway PostgreSQL metrics
- **Build Failures**: Review build logs in Railway
- **Runtime Errors**: Check application logs

---

**Last Updated**: 2025-11-25
**Railway Version**: V2 (Nixpacks)
**Next.js Version**: 14.2.33

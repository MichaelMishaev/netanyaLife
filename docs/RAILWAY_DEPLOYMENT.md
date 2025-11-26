# Railway Deployment Guide

**Project**: קהילת נתניה Business Directory
**Platform**: Railway
**Date**: 2025-11-15
**Status**: Production Ready 🚀

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Redis Setup](#redis-setup)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

**Total Time**: ~15 minutes

```bash
# 1. Push code to GitHub
git push origin main

# 2. Go to railway.app and:
#    - Create new project
#    - Add PostgreSQL service
#    - Add Redis service
#    - Deploy from GitHub repo
#    - Set environment variables
#    - Deploy!
```

---

## Prerequisites

- [x] GitHub account with your repository
- [x] Railway account (sign up at https://railway.app)
- [x] Code pushed to GitHub main branch
- [x] Production build tested locally (`npm run build`)

---

## Step-by-Step Deployment

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click "**New Project**"
2. Select "**Deploy from GitHub repo**"
3. Find and select `netanyaBusiness` (or your repo name)
4. Railway will create a project and attempt first build

⚠️ **First build will fail** - this is expected! We need to add services first.

### Step 3: Add PostgreSQL Database

1. In your project dashboard, click "**+ New**"
2. Select "**Database**" → "**Add PostgreSQL**"
3. Railway will provision a PostgreSQL database
4. Copy the connection string (we'll use it later)

**Get DATABASE_URL**:
- Click on PostgreSQL service
- Go to "**Variables**" tab
- Copy the `DATABASE_URL` value

### Step 4: Add Redis

1. Click "**+ New**" again
2. Select "**Database**" → "**Add Redis**"
3. Railway will provision a Redis instance

**Get REDIS_URL**:
- Click on Redis service
- Go to "**Variables**" tab
- Copy the `REDIS_URL` value

### Step 5: Configure Environment Variables

1. Click on your **app service** (the Next.js app)
2. Go to "**Variables**" tab
3. Click "**+ New Variable**"
4. Add each variable below:

#### Required Environment Variables

```bash
# Database (from PostgreSQL service)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# Redis (from Redis service)
REDIS_URL=redis://default:password@host:6379

# JWT Secret (generate new one!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-here

# App Base URL (use Railway-provided domain or custom domain)
NEXT_PUBLIC_BASE_URL=https://your-app.up.railway.app

# Node Environment
NODE_ENV=production
```

**Generate JWT Secret**:
```bash
# Run this locally to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 6: Configure Build Settings

1. In your app service, go to "**Settings**" tab
2. Verify these settings:

```
Build Command: npm install && npx prisma generate && npm run build
Start Command: npx prisma migrate deploy && npm run start

Root Directory: /
```

**Note**: These are already configured in `railway.json` and `nixpacks.toml`

### Step 7: Deploy

1. Go to "**Deployments**" tab
2. Click "**Deploy**" (or push to GitHub to auto-deploy)
3. Watch the build logs
4. Wait for deployment to complete (~3-5 minutes)

**Build Process**:
- ✅ Install dependencies
- ✅ Generate Prisma Client
- ✅ Build Next.js app
- ✅ Run database migrations
- ✅ Start production server

### Step 8: Get Your URL

Once deployed:
1. Click on your app service
2. Go to "**Settings**" → "**Domains**"
3. Railway provides: `https://your-app.up.railway.app`
4. (Optional) Add custom domain

---

## Environment Variables Reference

### Complete List

| Variable | Source | Example | Required |
|----------|--------|---------|----------|
| `DATABASE_URL` | PostgreSQL service variables | `postgresql://...` | ✅ Yes |
| `REDIS_URL` | Redis service variables | `redis://...` | ✅ Yes |
| `JWT_SECRET` | Generated locally | `a1b2c3d4e5f6...` (64 chars) | ✅ Yes |
| `NEXT_PUBLIC_BASE_URL` | Railway domain or custom | `https://netanya.up.railway.app` | ✅ Yes |
| `NODE_ENV` | Manual | `production` | ✅ Yes |

### Using Service Variables (Recommended)

Railway allows you to **reference** other service variables:

1. Click on app service → Variables
2. Instead of copying DATABASE_URL, add variable:
   ```
   Name: DATABASE_URL
   Value: ${{Postgres.DATABASE_URL}}
   ```
3. Same for Redis:
   ```
   Name: REDIS_URL
   Value: ${{Redis.REDIS_URL}}
   ```

This auto-updates if database credentials change!

---

## Database Setup

### Automatic Migrations

Your `railway.json` is configured to run migrations on each deploy:

```json
"startCommand": "npx prisma migrate deploy && npm run start"
```

### Manual Migration (if needed)

If you need to run migrations manually:

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Run migration:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Seed Initial Data

To populate categories, neighborhoods, and admin user:

```bash
# Via Railway CLI
railway run npx prisma db seed

# Or add to your seed script in package.json
# Already configured: "prisma:seed": "tsx prisma/seed.ts"
```

### Database Access

**Via Railway Dashboard**:
1. Click PostgreSQL service
2. Go to "**Data**" tab
3. Use built-in query editor

**Via Prisma Studio**:
```bash
# Connect to production database (use Railway CLI)
railway run npx prisma studio
```

---

## Redis Setup

### Verify Redis Connection

Check deployment logs:
```bash
# Via Railway CLI
railway logs

# Look for:
# ✅ Redis connected
# ✅ Redis ready
```

### Test Redis

Your app automatically uses Redis for:
- Rate limiting (100 events/min per IP)
- Session caching
- Bug tracking (user messages)

Test it works by:
1. Visit your app
2. Trigger an API call (search, add business)
3. Check logs for Redis operations

---

## Post-Deployment

### 1. Verify Deployment

**Check Homepage**:
```bash
curl -I https://your-app.up.railway.app/he
# Should return: 200 OK
```

**Check Database Connection**:
- Visit https://your-app.up.railway.app/he/admin/login
- Try logging in (email: 345287@gmail.com, password: admin1)

### 2. Run Seed Script (First Time Only)

```bash
# Via Railway CLI
railway run npx prisma db seed
```

This creates:
- Netanya city
- 4 neighborhoods (מרכז, צפון, דרום, מזרח)
- Default categories (electricians, plumbers, etc.)
- Admin user (if not exists)

### 3. Test Critical Flows

- [ ] Home page loads (Hebrew & Russian)
- [ ] Language switcher works
- [ ] Search by category + neighborhood works
- [ ] Business detail page loads
- [ ] Add business form works
- [ ] Review submission works
- [ ] Admin login works
- [ ] Admin dashboard shows data

### 4. Custom Domain (Optional)

1. In Railway app service → Settings → Domains
2. Click "**+ Custom Domain**"
3. Enter your domain: `netanya-local.com`
4. Railway provides DNS settings:
   ```
   Type: CNAME
   Name: @
   Value: your-app.up.railway.app
   ```
5. Update your DNS provider
6. Wait for SSL certificate (automatic, ~1-2 minutes)

### 5. Enable Auto-Deploy

By default, Railway auto-deploys on every push to `main`:

1. Settings → Service → **GitHub Triggers**
2. Ensure "Enable Automatic Deploys" is ON
3. Branch: `main`

Now every `git push origin main` triggers a new deployment!

---

## Monitoring

### View Logs

**Via Dashboard**:
1. Click your app service
2. Go to "**Deployments**" tab
3. Click latest deployment
4. View real-time logs

**Via CLI**:
```bash
railway logs --follow
```

### Metrics

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request count

View in: App Service → **Metrics** tab

### Alerts (Pro Plan)

Set up alerts for:
- Deployment failures
- High memory usage
- Service crashes

---

## Troubleshooting

### Build Fails: "DATABASE_URL not found"

**Solution**: Add `DATABASE_URL` to app service variables
```bash
# In app service → Variables
DATABASE_URL = ${{Postgres.DATABASE_URL}}
```

### Build Fails: "Prisma Client not generated"

**Solution**: Ensure build command includes Prisma generation
```bash
# In railway.json (already configured)
"buildCommand": "npm install && npx prisma generate && npm run build"
```

### App Crashes on Start

**Check logs**:
```bash
railway logs
```

Common issues:
- Missing environment variables
- Database connection failed
- Redis connection failed

**Solution**: Verify all 5 required env vars are set

### "Cannot connect to database"

**Solutions**:
1. Check DATABASE_URL is correct
2. Ensure PostgreSQL service is running
3. Verify network connectivity (Railway handles this automatically)
4. Check if database is in same project

### "Redis connection error"

**Solutions**:
1. Check REDIS_URL is correct
2. Ensure Redis service is running
3. Redis is optional for build - app will fail-open if Redis unavailable

### Migrations Don't Run

**Manual migration**:
```bash
railway run npx prisma migrate deploy
```

**Check migration status**:
```bash
railway run npx prisma migrate status
```

### Port Issues

Railway automatically assigns `PORT` environment variable.

Your app uses port 4700 in development, but Railway will override this in production.

**No action needed** - Railway handles this automatically.

---

## Useful Commands

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs --follow

# Run commands in production
railway run <command>

# Deploy manually
railway up

# Open app in browser
railway open

# View environment variables
railway variables

# Connect to PostgreSQL
railway connect postgres

# Connect to Redis
railway connect redis
```

---

## Cost Estimate

Railway pricing (as of 2025):

**Hobby Plan** (Free):
- $5 credit/month
- Sufficient for small apps
- Includes PostgreSQL + Redis + App

**Pro Plan** ($20/month):
- $20 credit included
- Pay per usage after
- Better for production

**Estimated Cost** (your app):
- Next.js App: ~$3-5/month
- PostgreSQL: ~$2-3/month
- Redis: ~$1-2/month
- **Total**: ~$6-10/month

**Free tier should work** for initial launch!

---

## Production Checklist

### Before Launch
- [x] Code pushed to GitHub
- [ ] PostgreSQL service added
- [ ] Redis service added
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Database migrated
- [ ] Database seeded
- [ ] Admin login tested
- [ ] Critical flows tested

### After Launch
- [ ] Custom domain configured (optional)
- [ ] Monitoring enabled
- [ ] Backups configured (Railway auto-backups for Pro)
- [ ] Team notified
- [ ] Documentation updated

---

## Next Steps

1. **Monitor First Week**
   - Check logs daily
   - Review error rates
   - Monitor performance

2. **Optimize**
   - Enable Railway Pro if needed
   - Configure auto-scaling
   - Set up alerts

3. **Backup Strategy**
   - Railway auto-backups (Pro plan)
   - Or export database weekly:
     ```bash
     railway run pg_dump $DATABASE_URL > backup.sql
     ```

4. **Update Process**
   - Push to GitHub
   - Railway auto-deploys
   - Monitor deployment logs
   - Verify functionality

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Your repo issues page

---

## Success! 🎉

Your app should now be live at: `https://your-app.up.railway.app`

**Test it**:
1. Visit the URL
2. Try Hebrew and Russian versions
3. Search for a business
4. Log into admin panel
5. Check analytics

**Share it**:
- Share URL with team
- Test on mobile devices
- Gather feedback

---

**Deployment Guide Version**: 1.0.0
**Platform**: Railway
**Last Updated**: 2025-11-15

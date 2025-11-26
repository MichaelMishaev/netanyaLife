# Database Backups

This folder contains database backups for the קהילת נתניה project.

## Backup Files

### 1. SQL Backup (PostgreSQL Dump)
- **File**: `local-db-backup-20251125-124859.sql`
- **Format**: SQL dump (PostgreSQL)
- **Size**: 84 KB
- **Created**: November 25, 2025 12:48
- **Contents**: Complete PostgreSQL database dump including:
  - All tables and data
  - Indexes and constraints
  - No ownership or ACL information (for portability)

**To restore this backup:**
```bash
psql "postgresql://netanya_user:netanya_password_dev@localhost:5433/netanya_local" < backups/database/local-db-backup-20251125-124859.sql
```

### 2. JSON Backup (Production Data)
- **File**: `production-data-2025-11-25.json`
- **Format**: JSON
- **Size**: 140 KB
- **Created**: November 25, 2025
- **Source**: Exported from Railway production database
- **Contents**: Complete data export including:
  - 61 Businesses
  - 25 Categories
  - 52 Subcategories
  - 4 Business Owners
  - 9 Pending Businesses
  - 1 Pending Business Edit
  - 1 City (נתניה)
  - 4 Neighborhoods
  - 1 Admin User
  - 2 Admin Settings
  - 58 Events
  - 0 Reviews

**To restore this backup:**
```bash
# Use the import script
RAILWAY_DATABASE_URL="your_db_url" npx tsx scripts/import-from-json.ts backups/database/production-data-2025-11-25.json
```

## Important Notes

⚠️ **CRITICAL**: These backups represent the production database state as of November 25, 2025.

### Data Integrity
- ✅ Local database now matches production exactly
- ✅ All 61 businesses preserved
- ✅ All relationships and foreign keys intact
- ✅ No data loss

### Backup Strategy
1. **Before any destructive operations**: Create a new backup
2. **Before schema migrations**: Backup both local and production
3. **After major data imports**: Create verification backup
4. **Regular schedule**: Weekly backups recommended

### Security
- 🔒 These files contain sensitive business data
- 🔒 Keep backups secure and never commit to git
- 🔒 Backups are in `.gitignore`

## Creating New Backups

### SQL Backup (Local)
```bash
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
pg_dump "postgresql://netanya_user:netanya_password_dev@localhost:5433/netanya_local" \
  --no-owner --no-acl -n public \
  --file="backups/database/local-db-backup-${TIMESTAMP}.sql"
```

### JSON Backup (Production)
```bash
# Export from production
RAILWAY_DATABASE_URL="your_production_url" npx tsx scripts/export-prod-data.ts

# Copy to database folder
cp backups/prod-YYYYMMDD/production-data.json backups/database/production-data-$(date +%Y-%m-%d).json
```

## Restore Instructions

### From SQL Backup
```bash
# 1. Drop and recreate database (if needed)
dropdb netanya_local
createdb netanya_local

# 2. Restore from backup
psql "postgresql://netanya_user:netanya_password_dev@localhost:5433/netanya_local" < backups/database/local-db-backup-YYYYMMDD-HHMMSS.sql

# 3. Run migrations (if schema changed)
npx prisma migrate deploy
```

### From JSON Backup
```bash
# Use the export/import script with local database
npx tsx scripts/export-and-import-prod.ts
```

## Verification

After restoring, verify data counts:
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); Promise.all([prisma.business.count(), prisma.category.count(), prisma.subcategory.count()]).then(([biz, cats, subs]) => console.log('Businesses:', biz, 'Categories:', cats, 'Subcategories:', subs)).finally(() => prisma.\$disconnect());"
```

Expected counts (as of 2025-11-25):
- Businesses: 61
- Categories: 25
- Subcategories: 52

---

**Last Updated**: November 25, 2025
**Backup Status**: ✅ Complete and verified

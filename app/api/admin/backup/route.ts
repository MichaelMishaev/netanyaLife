import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This endpoint should only be accessible to admin
export async function GET(request: NextRequest) {
  try {
    // Simple auth check - in production, use proper authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer admin123456') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    let sql = `-- Database backup created at ${new Date().toISOString()}\n`;
    sql += `-- Database: קהילת נתניה (Netanya Community)\n\n`;
    sql += `SET client_encoding = 'UTF8';\n\n`;

    // Export all data from all tables
    const cities = await prisma.city.findMany();
    for (const city of cities) {
      sql += `INSERT INTO "City" ("id", "name_he", "name_ru", "slug", "is_active", "created_at", "updated_at") VALUES ('${city.id}', ${escapeString(city.name_he)}, ${escapeString(city.name_ru)}, ${escapeString(city.slug)}, ${city.is_active}, '${city.created_at.toISOString()}', '${city.updated_at.toISOString()}') ON CONFLICT (id) DO UPDATE SET "name_he"=EXCLUDED."name_he", "name_ru"=EXCLUDED."name_ru", "slug"=EXCLUDED."slug", "is_active"=EXCLUDED."is_active", "updated_at"=EXCLUDED."updated_at";\n`;
    }

    const neighborhoods = await prisma.neighborhood.findMany();
    for (const n of neighborhoods) {
      sql += `INSERT INTO "Neighborhood" ("id", "city_id", "name_he", "name_ru", "slug", "description_he", "description_ru", "is_active", "display_order", "created_at", "updated_at") VALUES ('${n.id}', '${n.city_id}', ${escapeString(n.name_he)}, ${escapeString(n.name_ru)}, ${escapeString(n.slug)}, ${escapeString(n.description_he)}, ${escapeString(n.description_ru)}, ${n.is_active}, ${n.display_order || 0}, '${n.created_at.toISOString()}', '${n.updated_at.toISOString()}') ON CONFLICT (id) DO UPDATE SET "city_id"=EXCLUDED."city_id", "name_he"=EXCLUDED."name_he", "name_ru"=EXCLUDED."name_ru", "slug"=EXCLUDED."slug", "updated_at"=EXCLUDED."updated_at";\n`;
    }

    const categories = await prisma.category.findMany();
    for (const c of categories) {
      sql += `INSERT INTO "Category" ("id", "name_he", "name_ru", "slug", "icon_name", "description_he", "description_ru", "is_active", "is_popular", "display_order", "created_at", "updated_at") VALUES ('${c.id}', ${escapeString(c.name_he)}, ${escapeString(c.name_ru)}, ${escapeString(c.slug)}, ${escapeString(c.icon_name)}, ${escapeString(c.description_he)}, ${escapeString(c.description_ru)}, ${c.is_active}, ${c.is_popular}, ${c.display_order || 0}, '${c.created_at.toISOString()}', '${c.updated_at.toISOString()}') ON CONFLICT (id) DO UPDATE SET "name_he"=EXCLUDED."name_he", "name_ru"=EXCLUDED."name_ru", "slug"=EXCLUDED."slug", "icon_name"=EXCLUDED."icon_name", "updated_at"=EXCLUDED."updated_at";\n`;
    }

    const businesses = await prisma.business.findMany();
    for (const b of businesses) {
      const fields = [
        `"id"`, `"category_id"`, `"neighborhood_id"`, `"name_he"`, `"name_ru"`,
        `"description_he"`, `"description_ru"`, `"address_he"`, `"address_ru"`,
        `"phone"`, `"whatsapp_number"`, `"website_url"`, `"facebook_url"`,
        `"instagram_url"`, `"tiktok_url"`, `"youtube_url"`,
        `"opening_hours_he"`, `"opening_hours_ru"`, `"owner_id"`, `"is_visible"`,
        `"is_verified"`, `"is_pinned"`, `"slug"`, `"created_at"`, `"updated_at"`
      ];
      const values = [
        `'${b.id}'`, `'${b.category_id}'`, `'${b.neighborhood_id}'`,
        escapeString(b.name_he), escapeString(b.name_ru),
        escapeString(b.description_he), escapeString(b.description_ru),
        escapeString(b.address_he), escapeString(b.address_ru),
        escapeString(b.phone), escapeString(b.whatsapp_number),
        escapeString(b.website_url), escapeString(b.facebook_url),
        escapeString(b.instagram_url), escapeString(b.tiktok_url),
        escapeString(b.youtube_url), escapeString(b.opening_hours_he),
        escapeString(b.opening_hours_ru), escapeString(b.owner_id),
        `${b.is_visible}`, `${b.is_verified}`, `${b.is_pinned}`,
        escapeString(b.slug), `'${b.created_at.toISOString()}'`, `'${b.updated_at.toISOString()}'`
      ];
      sql += `INSERT INTO "Business" (${fields.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
    }

    const reviews = await prisma.review.findMany();
    for (const r of reviews) {
      sql += `INSERT INTO "Review" ("id", "business_id", "rating", "comment", "author_name", "created_at") VALUES ('${r.id}', '${r.business_id}', ${r.rating}, ${escapeString(r.comment)}, ${escapeString(r.author_name)}, '${r.created_at.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }

    const pendingBusinesses = await prisma.pendingBusiness.findMany();
    for (const pb of pendingBusinesses) {
      const fields = [
        `"id"`, `"category_id"`, `"neighborhood_id"`, `"name_he"`, `"name_ru"`,
        `"description_he"`, `"description_ru"`, `"address_he"`, `"address_ru"`,
        `"phone"`, `"whatsapp_number"`, `"website_url"`, `"facebook_url"`,
        `"instagram_url"`, `"tiktok_url"`, `"youtube_url"`,
        `"opening_hours_he"`, `"opening_hours_ru"`, `"submitter_name"`,
        `"submitter_phone"`, `"status"`, `"rejection_reason"`, `"created_at"`, `"updated_at"`
      ];
      const values = [
        `'${pb.id}'`, `'${pb.category_id}'`, `'${pb.neighborhood_id}'`,
        escapeString(pb.name_he), escapeString(pb.name_ru),
        escapeString(pb.description_he), escapeString(pb.description_ru),
        escapeString(pb.address_he), escapeString(pb.address_ru),
        escapeString(pb.phone), escapeString(pb.whatsapp_number),
        escapeString(pb.website_url), escapeString(pb.facebook_url),
        escapeString(pb.instagram_url), escapeString(pb.tiktok_url),
        escapeString(pb.youtube_url), escapeString(pb.opening_hours_he),
        escapeString(pb.opening_hours_ru), escapeString(pb.submitter_name),
        escapeString(pb.submitter_phone), escapeString(pb.status),
        escapeString(pb.rejection_reason), `'${pb.created_at.toISOString()}'`, `'${pb.updated_at.toISOString()}'`
      ];
      sql += `INSERT INTO "PendingBusiness" (${fields.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
    }

    return new NextResponse(sql, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="netanya_backup_${timestamp}.sql"`,
      },
    });

  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

function escapeString(value: string | null | undefined): string {
  if (value === null || value === undefined) return 'NULL';
  return `'${value.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

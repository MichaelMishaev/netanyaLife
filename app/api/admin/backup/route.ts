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
        `"id"`, `"name_he"`, `"name_ru"`, `"slug_he"`, `"slug_ru"`,
        `"description_he"`, `"description_ru"`, `"city_id"`, `"neighborhood_id"`,
        `"address_he"`, `"address_ru"`, `"phone"`, `"whatsapp_number"`,
        `"website_url"`, `"email"`, `"facebook_url"`, `"instagram_url"`, `"tiktok_url"`,
        `"opening_hours_he"`, `"opening_hours_ru"`, `"is_visible"`, `"is_verified"`,
        `"is_pinned"`, `"serves_all_city"`, `"is_test"`, `"owner_id"`, `"category_id"`,
        `"subcategory_id"`, `"created_at"`, `"updated_at"`
      ];
      const values = [
        `'${b.id}'`, escapeString(b.name_he), escapeString(b.name_ru),
        escapeString(b.slug_he), escapeString(b.slug_ru),
        escapeString(b.description_he), escapeString(b.description_ru),
        escapeString(b.city_id), escapeString(b.neighborhood_id),
        escapeString(b.address_he), escapeString(b.address_ru),
        escapeString(b.phone), escapeString(b.whatsapp_number),
        escapeString(b.website_url), escapeString(b.email),
        escapeString(b.facebook_url), escapeString(b.instagram_url), escapeString(b.tiktok_url),
        escapeString(b.opening_hours_he), escapeString(b.opening_hours_ru),
        `${b.is_visible}`, `${b.is_verified}`, `${b.is_pinned}`,
        `${b.serves_all_city}`, `${b.is_test}`, escapeString(b.owner_id),
        escapeString(b.category_id), escapeString(b.subcategory_id),
        `'${b.created_at.toISOString()}'`, `'${b.updated_at.toISOString()}'`
      ];
      sql += `INSERT INTO "Business" (${fields.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT (id) DO NOTHING;\n`;
    }

    const reviews = await prisma.review.findMany();
    for (const r of reviews) {
      sql += `INSERT INTO "Review" ("id", "business_id", "rating", "comment_he", "comment_ru", "language", "author_name", "is_approved", "created_at", "updated_at") VALUES ('${r.id}', '${r.business_id}', ${r.rating}, ${escapeString(r.comment_he)}, ${escapeString(r.comment_ru)}, ${escapeString(r.language)}, ${escapeString(r.author_name)}, ${r.is_approved}, '${r.created_at.toISOString()}', '${r.updated_at.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }

    const pendingBusinesses = await prisma.pendingBusiness.findMany();
    for (const pb of pendingBusinesses) {
      const fields = [
        `"id"`, `"category_id"`, `"neighborhood_id"`, `"name"`,
        `"description"`, `"language"`, `"address"`,
        `"phone"`, `"whatsapp_number"`, `"website_url"`, `"email"`,
        `"facebook_url"`, `"instagram_url"`, `"tiktok_url"`,
        `"opening_hours"`, `"submitter_name"`, `"submitter_email"`,
        `"submitter_phone"`, `"status"`, `"admin_notes"`, `"rejection_reason"`,
        `"created_at"`, `"updated_at"`
      ];
      const values = [
        `'${pb.id}'`, `'${pb.category_id}'`, `'${pb.neighborhood_id}'`,
        escapeString(pb.name), escapeString(pb.description),
        escapeString(pb.language), escapeString(pb.address),
        escapeString(pb.phone), escapeString(pb.whatsapp_number),
        escapeString(pb.website_url), escapeString(pb.email),
        escapeString(pb.facebook_url), escapeString(pb.instagram_url),
        escapeString(pb.tiktok_url), escapeString(pb.opening_hours),
        escapeString(pb.submitter_name), escapeString(pb.submitter_email),
        escapeString(pb.submitter_phone), escapeString(pb.status),
        escapeString(pb.admin_notes), escapeString(pb.rejection_reason),
        `'${pb.created_at.toISOString()}'`, `'${pb.updated_at.toISOString()}'`
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

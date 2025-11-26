1. Product Overview
Name (placeholder): “קהילת נתניה” (you can rename later)
Goal: Hyper-local business directory only for Netanya residents, divided by neighborhoods.
Main language: Hebrew (RTL)
Secondary: Russian (LTR)
Focus:
City = נתניה
Neighborhoods: צפון נתניה, דרום נתניה, מזרח נתניה (editable by you)
Core user actions:
Choose service type + neighborhood
See a short list of relevant businesses
Click WhatsApp / Call / Directions
View details & reviews
Add their own review
Business owners can submit a listing (you approve)
You (SuperAdmin) control:
Service types
Neighborhoods
Business approvals + visibility
Verified badge
Pinned “Top X” results
Technical pillars:
Mobile-first
PWA (installable, offline fallback)
SEO & structured data
Analytics & event logging
Accessibility compliance + user “Accessibility Options” button
2. Core User Flows (Client Side)
2.1 Home (Landing) – “Only for Netanya Residents”
Hero section (HE):
Title:
🏙️ רק לתושבי נתניה!
Subtitle:
מדריך עסקים מקומי לפי שכונות – צפון, דרום ומזרח נתניה.
מצאו בעלי מקצוע אמיתיים מהעיר שלכם, עם דירוגים וחיבור ישיר ב-WhatsApp.
RU version shows similar text in Russian.
Main call-to-action:
Big button: “התחילו חיפוש לפי שירות ושכונה”
Search card (no free text, very simple):
Field 1 – סוג שירות (dropdown, editable by you in Admin)
Label: סוג שירות
Placeholder: בחרו סוג שירות
Options (examples – actually come from DB):
חשמלאים
אינסטלטורים
ניקיון ועוזרות בית
שיפוצים וצבע
שיער ויופי
בריאות ורפואה משלימה
ילדים ומשפחות
אוכל ומשלוחים
רכב (מוסכים, גרר)
מחשבים וסלולר
שירותים מקצועיים (רו"ח, עו"ד וכו')
Field 2 – שכונה (dropdown, editable by you in Admin)
Label: שכונה
Options:
צפון נתניה
דרום נתניה
מזרח נתניה
(optional) כל נתניה
Button:
Full-width, primary: חיפוש
Below search:
“קטגוריות פופולריות” – horizontal chips for common services
“שכונות בנתניה” – grid buttons: צפון / דרום / מזרח
2.2 Results Page
URL pattern (HE):
/he/netanya/tsafon/instalatorim (or similar transliteration; content in Hebrew)
Top:
Back arrow
Title: אינסטלטורים בצפון נתניה (12 תוצאות)
Two chips:
[פילטרים] – opens bottom sheet (service type, neighborhood, Sort)
[מיון] – Recommended / Rating / Newest
Cards (each business):
Name (bold)
Row: קטגוריה • שכונה
Rating:
If reviews exist: ⭐⭐⭐⭐☆ 4.3 (12)
If none: היו הראשונים לדרג
Short description (1 line)
CTA row:
💬 WhatsApp – only if whatsapp_number exists → https://wa.me/<number>
📞 טלפון – only if phone exists → tel:<number>
פרטים → – opens business detail
Ordering logic (very important):
Pinned / Top X (you define X in admin, e.g. 4)
is_pinned = true & is_visible = true → always first, in your chosen order.
Next 5 random from remaining visible businesses matching the query.
Remaining businesses sorted by (e.g.) rating desc, then newest.
No results flow:
If results_count == 0 for chosen neighborhood:
Show message:
"לא נמצאו תוצאות בשכונה שנבחרה."
Button: חיפוש בכל נתניה
→ run same service type but with “all neighborhoods”.
2.3 Business Detail Page
Header:
Back arrow
Business name (truncated)
Optional share icon
Top content:
Business name (large)
Category • Neighborhood
Rating row:
⭐⭐⭐⭐☆ 4.3 (12 ביקורות)
If none: “היו הראשונים לדרג את העסק הזה”
Primary actions (2x2 grid on mobile):
Show each button only if data exists:
💬 WhatsApp → https://wa.me/<whatsapp_number>
📞 טלפון → tel:<phone>
📍 ניווט → Google Maps link (using address)
🌐 אתר → business website
If e.g. no WhatsApp number – button not rendered at all.
Info section (all fields conditional):
Title: על העסק – show only if there is at least a description.
Description text (HE / RU) – show only if exists.
כתובת row with pin – show only if address exists; click opens Maps.
שעות פתיחה – show only if opening hours provided; otherwise hide section entirely.
Reviews section:
Title: חוות דעת
If reviews exist:
List each:
⭐ rating
comment
author name (if provided – else “אנונימי”)
date
If none:
“היו הראשונים לדרג את העסק הזה”
Button: full-width at bottom or sticky: כתיבת חוות דעת
2.4 Write Review
Fields:
Rating (1–5 stars) – required.
Comment (textarea, optional).
Name (optional).
If later you add login, you can also track user_id, but not required now.
When submitted:
Saved to reviews with:
business_id, rating, comment_he / comment_ru, author_name, author_user_id (nullable), created_at.
You now know who filled it (as much as possible).
2.5 Add Your Business (Public Form)
Fields:
Business name (required)
Service type (category) (required)
Neighborhood (required)
Description (optional)
Address (optional)
Phone (optional, international format)
WhatsApp number (optional, international format)
Website (optional)
Opening hours (optional)
Validation rule:
Must provide at least one: Phone OR WhatsApp.
If both empty → error:
“חובה למלא טלפון או מספר ווטסאפ אחד לפחות”
No auto-copy:
If only phone given → show only Call.
If only WhatsApp given → show only WhatsApp.
If both → show both buttons.
Submission goes into pending_businesses with status = 'pending'.
You approve later in admin.
2.6 Accessibility Option (Client)
You asked: “add an accessibility option to the client.”
Accessibility Button (always visible)
Fixed icon (e.g. ♿ or accessible symbol) at bottom-right (or left for RTL, but many Israeli sites keep it right).
When tapped:
Opens an accessibility panel (bottom sheet / side panel).
Accessibility panel options (MVP):
Font Size
Normal
Medium
Large
→ Changes html / body font-size (e.g. 16 / 18 / 20 px) and maybe apply a CSS class like accessibility-font-lg.
High Contrast Mode
Toggle: On / Off
On = higher contrast colors:
Darker text (#000)
Pure white background (#FFF)
Buttons with stronger outline
Underline links
Toggle: On / Off
On = all links text-decoration: underline;
Keyboard focus visible
Globally enforced (CSS):
:focus states with clear outline, not removed.
RTL/LTR is automatic (based on language):
For HE pages: dir="rtl"
For RU pages: dir="ltr"
Remember preferences
Use localStorage to save:
font size choice
contrast mode
underline links
Apply on app load.
Technical + Legal side (Israel)
Use semantic HTML tags (<main>, <nav>, <header>, <footer>, <button>, <label>).
Provide aria-label for icon buttons (WhatsApp, Call).
Ensure color contrast meets WCAG (Israeli Accessibility Regulations usually follow WCAG AA).
Forms must have labels tied to inputs.
Use logical tab order and skip-link (דלג לתוכן) at top.
This “Accessibility panel + semantic structure” puts you in a good direction toward Israeli web accessibility compliance (W3C/WCAG-based).
3. Admin Panel (SuperAdmin Only)
Access: /admin
Login: only if (email == "345287@gmail.com" && password == "admin1").
3.1 Business Management
Table columns:
Name
Service type
Neighborhood
IsVisible
IsVerified
IsPinned (Top)
CreatedAt
Actions:
Edit business
Toggle Visible (hide from search)
Toggle Verified (show badge “מאומת”)
Toggle Pinned (for Top X logic)
Delete / archive (soft delete or set is_visible = false)
3.2 Top X Setting
Field: topPinnedCount – e.g. 4
Search results use this value to decide how many pinned items to show first.
3.3 Pending Businesses
See list from pending_businesses.
Approve:
Create new record in businesses
Set status = 'approved'
Reject:
Set status = 'rejected' (not shown anywhere)
3.4 Service Types (Categories) Management
Path: /admin/categories
Table:
Name HE
Name RU
Slug
Icon name
IsActive
Actions:
Add new category
Edit
Activate/Deactivate
Only active categories appear in public “סוג שירות” dropdown.
3.5 Neighborhood Management
Path: /admin/neighborhoods
Table:
Name HE
Name RU
Slug
IsActive
Actions:
Add/Edit
Activate/Deactivate
Only active neighborhoods appear in dropdown, but you start with: צפון/דרום/מזרח נתניה.
4. Data Model (Short Summary)
Tables:
cities – you start with one city: נתניה
neighborhoods – managed via admin (צפון / דרום / מזרח)
categories – service types (חשמלאים, אינסטלטורים, etc.)
businesses – approved listings
reviews – star ratings + comments
pending_businesses – submissions pending approval
events – analytics logs (optional but recommended)
Key fields on businesses:
name
slug_he, slug_ru (for SEO)
city_id, neighborhood_id, category_id
description_he, description_ru
address_he, address_ru
phone, whatsapp_number, website_url
opening_hours_he, opening_hours_ru
is_visible, is_verified, is_pinned
Key fields on reviews:
business_id
rating
comment_he / comment_ru
author_name
author_user_id (nullable)
created_at
5. PWA & SEO
PWA
manifest.webmanifest:
name: “קהילת נתניה – מדריך עסקים בנתניה”
short_name: “NetanyaLocal”
lang: he
start_url: /he
display: standalone
theme_color, background_color
icons 192/512
Service Worker:
Cache static assets (CSS/JS/fonts, icons)
Cache visited pages (home, results, business detail)
Offline fallback page:
“אין חיבור לאינטרנט. אפשר לראות חלק מהתוכן שנשמר מהביקור האחרון.”
SEO
URLs:
/he/netanya/tsafon/instalatorim
/ru/netanya/sever/santehniki
/he/business/netanya/tsafon/yossi-plumber etc.
hreflang for HE/RU versions
LocalBusiness schema on business pages:
name, address, phone, geo, openingHours
aggregateRating + review list for stars in Google
Neighborhood pages with intro text & SEO keywords like “אינסטלטורים בצפון נתניה”.
6. Analytics (High-Level)
Track:
Searches (service_type, neighborhood, language, results_count)
Business detail views
WhatsApp/Call/Directions/Website clicks
Review submissions
Add Business submissions
PWA installs
“Search in all city” clicks when no results in neighborhood
Language changes
Accessibility panel usage:
accessibility_opened
accessibility_font_changed
accessibility_contrast_toggled
This gives you insights on:
Missing service types / neighborhoods
Best-performing businesses
Popular CTAs (WhatsApp vs Call)
Real usage of accessibility features
HE vs RU traffic distribution
7. Summary
You now have:
A Netanya-only, hyper-local, multi-language, mobile-first, PWA-enabled business directory.
With:
Strict phone/WhatsApp logic
Star ratings & reviews
Admin control over everything (services, neighborhoods, visibility, pinned results, verification)
Accessibility panel for users (+ proper semantic structure for compliance)
SEO-ready structure (slugs, hreflang, schema)
Analytics that show you real behavior and where to expand.

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'שוש גרינשטיין', NULL, 'shvsh-grynshtyyn-78535', NULL,
  'ניסיון של 18 שנים פדיקוריסטית רפואית ומורה לפדיקור.בונה ציפורניים ולק גל בכל השיטות', NULL,
  '+972545722530', '+972545722530',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'hair-beauty-cosmetics'),
  (SELECT id FROM subcategories WHERE slug = 'mnykvr-vpdykvr'),
  (SELECT id FROM neighborhoods WHERE slug = 'darom'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'גואל פילוריאן', NULL, 'gval-pylvryan-78538', NULL,
  'עוסק בנדלן, חוזים, צוואות, ייפוי כח מתמשך, תחום אזרחי בבתי משפט, ייצוג זוכים בהוצאה לפועל', NULL,
  '+972548073949', '+972548073949',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'lawyers'),
  (SELECT id FROM subcategories WHERE slug = 'contracts'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'אושרית קצנטיני', NULL, 'avshryt-ktsntyny-78540', NULL,
  'פדיקוריסטית/ מניקוריסטית עם הכשרה מטעם אגודת איל לטיפול בסכרתיים.', NULL,
  '+972506555050', '+972506555050',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'hair-beauty-cosmetics'),
  (SELECT id FROM subcategories WHERE slug = 'mnykvr-vpdykvr'),
  (SELECT id FROM neighborhoods WHERE slug = 'darom'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'אופיר שמש', NULL, 'avpyr-shmsh-78542', NULL,
  'לוכד נחשים מנוסה, מורשה רשות הטבע והגנים', NULL,
  '+972529202446', '+972529202446',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'environment-animals'),
  (SELECT id FROM subcategories WHERE slug = 'lvkd-nchshym'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'עדי אסף', NULL, 'ady-asf-78543', NULL,
  'מאפרת ומסרקת לקוחות פרטיים- כלות וערב', NULL,
  '+972544312462', '+972544312462',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'hair-beauty-cosmetics'),
  (SELECT id FROM subcategories WHERE slug = 'cosmetics'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'עדי אס', NULL, 'ady-as-78545', NULL,
  'צילומי תדמית, הפקות, מותגי אופנה כמו הודיס, אייס קיוב,לאישה', NULL,
  '+972544312462', '+972544312462',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'food-events-activities'),
  (SELECT id FROM subcategories WHERE slug = 'tsylvmy-tdmyt-vaskym'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ביסרט מתיקו', NULL, 'bysrt-mtykv-78547', NULL,
  'חברותית מאד, אוהבת ילדים, מתן עזרה בשיעורי בית', NULL,
  '+972548589227', '+972548589227',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'education-learning'),
  (SELECT id FROM subcategories WHERE slug = 'byybysytr'),
  (SELECT id FROM neighborhoods WHERE slug = 'mizrach'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ויקטור עין אלי', NULL, 'vyktvr-ayn-aly-78548', NULL,
  'טיפול בלוחות חשמל, תקלות וקצרים, כל עבודות החשמל', NULL,
  '+972523598225', '+972523598225',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'electricians'),
  NULL,
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'חשמל נתניה', NULL, 'chshml-ntnyh-78549', NULL,
  'חשמלאי מוסמך מעל 30 שנה , נותן שירות בתחום החשמל למגזר הפרטי ועסקי כולל תקלות חשמל מכל הסוגים', NULL,
  '+972522422351', '+972522422351',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'electricians'),
  NULL,
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'מיטל דוידי', NULL, 'mytl-dvydy-78551', NULL,
  'מאפרת מקצועית ומסדרת שיער, מגיעה למקום ההתארגנות', NULL,
  '+972525634707', '+972525634707',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'hair-beauty-cosmetics'),
  (SELECT id FROM subcategories WHERE slug = 'cosmetics'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'עירית נווה', NULL, 'ayryt-nvvh-78552', NULL,
  'עיצוב פנים לגילאי 60+ מתמחה בהתאמת בתים לגיל השלישי החדש – רגיש, פרקטי ואסתטי.', NULL,
  '+972544442344', '+972544442344',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'home-services'),
  (SELECT id FROM subcategories WHERE slug = 'tknvn-vaytsvb-pnym'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'רוזין טכנולוגיה', NULL, 'rvzyn-tknvlvgyh-78553', NULL,
  'מכירה ותיקון מחשבים, התקנת מצלמות אבטחה, אינטרקום עם בקרי כניסה, פתרונות תקשורת לעסקים בענן', NULL,
  '+972544448140', '+972544448140',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'business-services'),
  (SELECT id FROM subcategories WHERE slug = 'back-office'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'סאלי הובלות', NULL, 'saly-hvblvt-78555', NULL,
  'הובלות בכל הארץ, לא בשבת', NULL,
  '+972585805800', '+972585805800',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'transportation'),
  (SELECT id FROM subcategories WHERE slug = 'moving'),
  (SELECT id FROM neighborhoods WHERE slug = 'darom'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'אורית סוויד', NULL, 'avryt-svvyd-78556', NULL,
  'סדנת בישול בריא, אוכל מוכן צמחוני טבעוני דגים הזמנות מראש', NULL,
  '+972504330656', '+972504330656',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'food-events-activities'),
  (SELECT id FROM subcategories WHERE slug = 'cooking-workshops'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ספורטיבטי הפעלות ילדים', NULL, 'spvrtybty-hpalvt-yldym-78558', NULL,
  'הפעלות ימי הולדת, ימי גיבוש, בת מצוו, מסיבות ועוד', NULL,
  '+972548086110', '+972548086110',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'food-events-activities'),
  (SELECT id FROM subcategories WHERE slug = 'hpalvt-lyldym-vayrvaym'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'AV Mobile', NULL, 'av-mobile-78559', NULL,
  'טכנאי עד הבית של סלולר, נייד,תיקון מסך, החלפת סוללה, העברת נתונים, פתיחה למכשירים נעולים ועוד...', NULL,
  '+972526651659', '+972526651659',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'personal-electronics'),
  (SELECT id FROM subcategories WHERE slug = 'mobile-repair'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'A.R Cameras&Security', NULL, 'ar-camerassecurity-78560', NULL,
  'כל סוגי ההתקנות - מצלמות, אזעקות, גלאים, קודניות, אינטרקום, מערכות מוזיקה, כל סוגי התקשורת', NULL,
  '+972544472018', '+972544472018',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'home-services'),
  (SELECT id FROM subcategories WHERE slug = 'home-security'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'handy master', NULL, 'handy-master-78561', NULL,
  'תיקונים כלליים,צבע,טיוח,אינסטלציה וחשמל, שיפוצים ועוד.', NULL,
  '+972538616232', '+972538616232',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'home-services'),
  (SELECT id FROM subcategories WHERE slug = 'handyman'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ללי תופרת', NULL, 'lly-tvprt-78562', NULL,
  'תפירת שמלות כלה וערב, תיקונים לשמלות ובגדים', NULL,
  '+972507536367', '+972507536367',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'sewing'),
  (SELECT id FROM subcategories WHERE slug = 'tykvnym'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'שי תורגמן', NULL, 'shy-tvrgmn-78563', NULL,
  'מתמחה במציאת נדלן, פינוי בינוי בכל רחבי העיר.', NULL,
  '+972504447632', '+972504447632',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'real-estate'),
  (SELECT id FROM subcategories WHERE slug = 'real-estate-consulting'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'eyewatch רועי', NULL, 'eyewatch-rvay-78565', NULL,
  'מערכות מיגון ומצלמות אבטחה', NULL,
  '+972522248058', '+972522248058',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'business-services'),
  (SELECT id FROM subcategories WHERE slug = 'markvt-mygvn'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'איציק סוויסה', NULL, 'aytsyk-svvysh-78566', NULL,
  'הנדימן עבודות פירוק והרכבה,צביעה וכו׳', NULL,
  '+972532750836', '+972532750836',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'home-services'),
  (SELECT id FROM subcategories WHERE slug = 'handyman'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'איתן מזרחי', NULL, 'aytn-mzrchy-78567', NULL,
  'הנדימן,חשמלאי מוסמך', NULL,
  '+972503099910', '+972503099910',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'home-services'),
  (SELECT id FROM subcategories WHERE slug = 'handyman'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'אלי', NULL, 'aly-78568', NULL,
  'חשמלאי מוסמך עם ותק מעל 30 שנה', NULL,
  '+972523421565', '+972523421565',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'electricians'),
  NULL,
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'משכנטוב - ייעוץ משכנתאות', NULL, 'mshkntvb-yyavts-mshkntavt-78569', NULL,
  'ייעוץ וליווי עד קבלת המשכנתא/ ההלוואה הכי משתלמת עבורך!', NULL,
  '+972522979097', '+972522979097',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'financial-consulting'),
  (SELECT id FROM subcategories WHERE slug = 'pension-planning'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'אושר נורמטוב', NULL, 'avshr-nvrmtvb-78571', NULL,
  'מורה לכלל המקצועות, החל מכתה א עד הכנה לבגרות ואפילו לתואר הנדסה/ מדוייקים. מהנדס חשמל במקצוע.', NULL,
  '+972585020797', '+972585020797',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'education-learning'),
  (SELECT id FROM subcategories WHERE slug = 'private-teachers'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'המאסטרים לניקיון', NULL, 'hmastrym-lnykyvn-78572', NULL,
  'חברת ניקיון לבניינים , דירות לפני ואחרי איכלוס , ניקיון משרדים ועוד', NULL,
  '+972528202633', '+972528202633',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'home-services'),
  (SELECT id FROM subcategories WHERE slug = 'nykyvn'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ורד כהן בלוני׳ס', NULL, 'vrd-khn-blvnys-78573', NULL,
  'עיצוב אירועים בלונים ופרחים, בשבילכם לכל עיצוב וחגיגה', NULL,
  '+972526410104', '+972526410104',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'food-events-activities'),
  (SELECT id FROM subcategories WHERE slug = 'balloon-flower-design'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'לילך הלל', NULL, 'lylk-hll-78574', NULL,
  'טיפול רגשי לילדים ונוער בעזרת בעלי חיים, הדרכות הורים', NULL,
  '+972545536290', '+972545536290',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'health-wellness'),
  (SELECT id FROM subcategories WHERE slug = 'emotional-therapy'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'חמי תמיר', NULL, 'chmy-tmyr-78575', NULL,
  'משרד בונות עתיד - טום לנטוס 10', NULL,
  '+972509331191', '+972509331191',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'real-estate'),
  (SELECT id FROM subcategories WHERE slug = 'real-estate-consulting'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'תופרת ליליה', NULL, 'tvprt-lylyh-78576', NULL,
  'תופרות כל סוגי התיקונים, כולל וילונות, מדים, תיקונים לשמלות ערב וכלה', NULL,
  '+97298828326', '+97298828326',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'sewing'),
  (SELECT id FROM subcategories WHERE slug = 'vylvnvt-vtkstyl-lbyt'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'נטלי ידן', NULL, 'ntly-ydn-78578', NULL,
  'מעסה מקצועית ועוד טיפולים רפואה סינית לנשים בלבד', NULL,
  '+972525228008', '+972525228008',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'health-wellness'),
  (SELECT id FROM subcategories WHERE slug = 'massage'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'עוז שני', NULL, 'avz-shny-78580', NULL,
  'שירותי הסעות לבעלי מוגבלויות ברכב נגיש', NULL,
  '+972528146655', '+972528146655',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'transportation'),
  (SELECT id FROM subcategories WHERE slug = 'shuttles'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'רימה', NULL, 'rymh-78581', NULL,
  'מורה לכלל המקצועות, החל מכתה א עד הכנה לבגרות.', NULL,
  '+972525214917', '+972525214917',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'education-learning'),
  (SELECT id FROM subcategories WHERE slug = 'private-teachers'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'לינור הרוש', NULL, 'lynvr-hrvsh-78582', NULL,
  'הדבקת ריסים בשיטה הקרה', NULL,
  '+972523623441', '+972523623441',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'hair-beauty-cosmetics'),
  (SELECT id FROM subcategories WHERE slug = 'eyelash-extensions'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'מקס המקסים מולגן', NULL, 'mks-hmksym-mvlgn-78583', NULL,
  'אלי פונים רק אחרי שניסתם למכור לבד ולא הצלחתם', NULL,
  '+972546932101', '+972546932101',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'real-estate'),
  (SELECT id FROM subcategories WHERE slug = 'real-estate-consulting'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'דנה שלזינגר', NULL, 'dnh-shlzyngr-78584', NULL,
  'מכירת ג׳חנון חלבי עשוי מחמאה ודבש', NULL,
  '+972528720262', '+972528720262',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'food-events-activities'),
  (SELECT id FROM subcategories WHERE slug = 'avkl-byty-mvkn'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'אוראל טייב', NULL, 'avral-tyyb-78585', NULL,
  'מתכנן פנסיוני, פנסיה, ביטוח ופיננסים', NULL,
  '+972527795345', '+972527795345',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'financial-consulting'),
  (SELECT id FROM subcategories WHERE slug = 'pension-planning'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'רחל ללו', NULL, 'rchl-llv-78587', NULL,
  'עו״ס קלינית פסיכותרפיסטית Cbt,טיפול רגשי בילדים, נוער ומבוגרים', NULL,
  '+972525799047', '+972525799047',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'health-wellness'),
  (SELECT id FROM subcategories WHERE slug = 'emotional-therapy'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'אביבה שני', NULL, 'abybh-shny-78588', NULL,
  NULL, NULL,
  '+972528895222', '+972528895222',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'business-services'),
  (SELECT id FROM subcategories WHERE slug = 'back-office'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ניקול מתתיהו', NULL, 'nykvl-mttyhv-78589', NULL,
  'החלקה אורגנית, אחריות מלאה, חפיפה באותו היום', NULL,
  '+972526144194', '+972526144194',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'hair-beauty-cosmetics'),
  (SELECT id FROM subcategories WHERE slug = 'hair-styling'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'שמוליק גנדלמן', NULL, 'shmvlyk-gndlmn-78590', NULL,
  'מורה לנהיגה', NULL,
  '+972522445323', '+972522445323',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'transportation'),
  (SELECT id FROM subcategories WHERE slug = 'mvrh-lnhygh'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'אופיר עיצוב שיער לגבר', NULL, 'avpyr-aytsvb-shyar-lgbr-78591', NULL,
  'עיצוב שיער גברים וילדים', NULL,
  '+972502234454', '+972502234454',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'hair-beauty-cosmetics'),
  (SELECT id FROM subcategories WHERE slug = 'hair-styling'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'אמילי בל לנדסמן נדלן', NULL, 'amyly-bl-lndsmn-ndln-78592', NULL,
  'אמילי בל עובדת בשיווק פרויקטים , נכסי יוקרה ויד שניה ! עם קהל לקוחות רחב', NULL,
  '+972506396531', '+972506396531',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'real-estate'),
  (SELECT id FROM subcategories WHERE slug = 'real-estate-consulting'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'מנשה בן יוסף', NULL, 'mnshh-bn-yvsf-78593', NULL,
  'פסיכותרפיה לילדים, זוגיות ובעיות אישיות', NULL,
  '+972546369312', '+972546369312',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'health-wellness'),
  (SELECT id FROM subcategories WHERE slug = 'psychotherapy'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'אריה שטרן', NULL, 'aryh-shtrn-78595', NULL,
  NULL, NULL,
  '+972505336586', '+972505336586',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'transportation'),
  (SELECT id FROM subcategories WHERE slug = 'zggvt-rkb'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ליאור בוקרה', NULL, 'lyavr-bvkrh-78596', NULL,
  'שירות אמין מחירים נוחים', NULL,
  '+972544920120', '+972544920120',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'home-services'),
  (SELECT id FROM subcategories WHERE slug = 'plumbers'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ליעד פוגל - פוגל נכסים', NULL, 'lyad-pvgl-pvgl-nksym-78597', NULL,
  'הערכת שווי לנכס לפניי מכירה על ידי מתווכים מקצועיים שחיים את האזור תוך 12 שעות בלבד', NULL,
  '+972546122661', '+972546122661',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'real-estate'),
  (SELECT id FROM subcategories WHERE slug = 'real-estate-consulting'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;

INSERT INTO businesses (
  id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru,
  phone, whatsapp_number, address_he, address_ru, website_url,
  opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, is_test,
  category_id, subcategory_id, neighborhood_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'יהונתן ארנון', NULL, 'yhvntn-arnvn-78599', NULL,
  NULL, NULL,
  '+972524749837', '+972524749837',
  NULL, NULL, NULL,
  NULL, NULL,
  true, false, false, false,
  (SELECT id FROM categories WHERE slug = 'health-wellness'),
  (SELECT id FROM subcategories WHERE slug = 'mamny-kvshr'),
  (SELECT id FROM neighborhoods WHERE slug = 'merkaz'),
  NOW(), NOW()
) ON CONFLICT (slug_he) DO NOTHING;
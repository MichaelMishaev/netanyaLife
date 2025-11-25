--
-- PostgreSQL database dump
--

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: AdminRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AdminRole" AS ENUM (
    'SUPERADMIN'
);


--
-- Name: CategoryRequestStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CategoryRequestStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: EventType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EventType" AS ENUM (
    'SEARCH_PERFORMED',
    'BUSINESS_VIEWED',
    'CTA_CLICKED',
    'REVIEW_SUBMITTED',
    'BUSINESS_SUBMITTED',
    'PWA_INSTALLED',
    'SEARCH_ALL_CITY_CLICKED',
    'LANGUAGE_CHANGED',
    'ACCESSIBILITY_OPENED',
    'ACCESSIBILITY_FONT_CHANGED',
    'ACCESSIBILITY_CONTRAST_TOGGLED',
    'SEARCH_FORM_VIEW',
    'RECENT_SEARCH_CLICKED',
    'GEOLOCATION_DETECTED'
);


--
-- Name: PendingStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PendingStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: admin_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text,
    name text NOT NULL,
    role public."AdminRole" DEFAULT 'SUPERADMIN'::public."AdminRole" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    google_id text
);


--
-- Name: business_owners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_owners (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text,
    name text NOT NULL,
    phone text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    google_id text,
    is_verified boolean DEFAULT false NOT NULL,
    last_login_at timestamp(3) without time zone
);


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.businesses (
    id text NOT NULL,
    name_he text NOT NULL,
    name_ru text,
    slug_he text NOT NULL,
    slug_ru text,
    description_he text,
    description_ru text,
    city_id text NOT NULL,
    neighborhood_id text NOT NULL,
    address_he text,
    address_ru text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    phone text,
    whatsapp_number text,
    website_url character varying(500),
    email character varying(255),
    opening_hours_he text,
    opening_hours_ru text,
    is_visible boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    is_pinned boolean DEFAULT false NOT NULL,
    pinned_order integer,
    category_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    serves_all_city boolean DEFAULT false NOT NULL,
    subcategory_id text,
    is_test boolean DEFAULT false NOT NULL,
    owner_id text
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name_he text NOT NULL,
    name_ru text NOT NULL,
    slug text NOT NULL,
    icon_name text,
    description_he text,
    description_ru text,
    is_active boolean DEFAULT true NOT NULL,
    is_popular boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: category_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category_requests (
    id text NOT NULL,
    category_name_he text NOT NULL,
    category_name_ru text,
    description text,
    requester_name text,
    requester_email text,
    requester_phone text,
    business_name text,
    status public."CategoryRequestStatus" DEFAULT 'PENDING'::public."CategoryRequestStatus" NOT NULL,
    admin_notes text,
    reviewed_at timestamp(3) without time zone,
    reviewed_by text,
    created_category_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cities (
    id text NOT NULL,
    name_he text NOT NULL,
    name_ru text NOT NULL,
    slug text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id text NOT NULL,
    type public."EventType" NOT NULL,
    properties jsonb NOT NULL,
    session_id text,
    user_agent text,
    ip_hash text,
    language text,
    business_id text,
    category_id text,
    neighborhood_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: neighborhoods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.neighborhoods (
    id text NOT NULL,
    city_id text NOT NULL,
    name_he text NOT NULL,
    name_ru text NOT NULL,
    slug text NOT NULL,
    description_he text,
    description_ru text,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: oauth_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_states (
    id text NOT NULL,
    state text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL
);


--
-- Name: pending_business_edits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_business_edits (
    id text NOT NULL,
    business_id text NOT NULL,
    owner_id text NOT NULL,
    description_he text,
    description_ru text,
    phone text,
    whatsapp_number text,
    website_url character varying(500),
    email character varying(255),
    opening_hours_he text,
    opening_hours_ru text,
    address_he text,
    address_ru text,
    status public."PendingStatus" DEFAULT 'PENDING'::public."PendingStatus" NOT NULL,
    rejection_reason text,
    reviewed_at timestamp(3) without time zone,
    reviewed_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: pending_businesses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_businesses (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    language text DEFAULT 'he'::text NOT NULL,
    neighborhood_id text NOT NULL,
    address text,
    phone text,
    whatsapp_number text,
    website_url text,
    email text,
    opening_hours text,
    category_id text,
    submitter_name text,
    submitter_email text,
    submitter_phone text,
    status public."PendingStatus" DEFAULT 'PENDING'::public."PendingStatus" NOT NULL,
    admin_notes text,
    reviewed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    serves_all_city boolean DEFAULT false NOT NULL,
    subcategory_id text,
    is_test boolean DEFAULT false NOT NULL,
    owner_id text,
    rejection_reason text,
    reviewed_by text
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    business_id text NOT NULL,
    rating integer NOT NULL,
    comment_he text,
    comment_ru text,
    language text DEFAULT 'he'::text NOT NULL,
    author_name text,
    author_user_id text,
    author_ip_hash text,
    is_approved boolean DEFAULT true NOT NULL,
    is_flagged boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: subcategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subcategories (
    id text NOT NULL,
    category_id text NOT NULL,
    name_he text NOT NULL,
    name_ru text NOT NULL,
    slug text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3ca3ab84-1958-49c1-a530-a35b37ac06d2	5d8d3b992df67f259c0d4fb09246345393e8c346857e2779e27610a645f202df	2025-11-25 09:22:41.893495+00	20251114103538_init	\N	\N	2025-11-25 09:22:41.852113+00	1
68fe682b-7c1a-41b6-971b-7bf8b6bfa154	25dd19c1c5e5de27fdae55759c53f57bec6fc3edb5067bf0769c69c685effb34	2025-11-25 09:22:41.89584+00	20251115190504_add_serves_all_city	\N	\N	2025-11-25 09:22:41.894131+00	1
4cee1168-16d2-4970-b476-80731cd3f142	ec6229a353b58c4b1ca57847cca0598139640d8373325247ee6e8f5a9f4250a3	2025-11-25 09:22:41.901814+00	20251116201912_add_subcategories	\N	\N	2025-11-25 09:22:41.896336+00	1
5cfe758b-8963-46f7-bab3-5dd77926682a	c5217285ffd57e1eb5cec7262173491fe2f37701c4f7379cfc0d6e8820a1f39a	2025-11-25 09:22:41.905673+00	20251116212025_add_category_requests	\N	\N	2025-11-25 09:22:41.902302+00	1
a19d4477-5e6f-4b2b-b693-2a2874f7901d	6472f9203d54226466f8cba61918ba37a980be038bac523f513689b8b6224cf2	2025-11-25 09:22:41.907318+00	20251117170152_make_category_optional_for_restructuring	\N	\N	2025-11-25 09:22:41.90615+00	1
40c6852a-e565-42c4-9650-6fd98c48b187	3163bc3e6596a7e7dd2b313a3da1b8fb631de2d8d4878c33efde2f972338d745	2025-11-25 09:22:41.909709+00	20251117170231_make_pending_business_category_optional	\N	\N	2025-11-25 09:22:41.907734+00	1
30be42f8-f1bb-410b-8993-25320853d161	b75a3769eb2d17160a45eaa3ddc4421ee1ca782c11d20a6ae09519915295cbfc	2025-11-25 09:22:41.911241+00	20251117184318_add_ab_test_event_types	\N	\N	2025-11-25 09:22:41.910153+00	1
8c017b22-bf73-4a89-8dc9-3b61e8a902b0	f91a10d8080f9476a0d0fb33b0a8117ecf35acd51d0a3aa5d713f3c012fa160c	2025-11-25 09:22:41.913057+00	20251117213718_add_is_test_field	\N	\N	2025-11-25 09:22:41.911673+00	1
3c991bdd-fa48-4354-b875-f2abce52e0f2	a7d67570702854f32ce4b353d251300a10590b3f75efe021bb7ab287b3be4ec2	2025-11-25 10:00:03.098061+00	20251125091700_add_business_owners_and_pending_edits	\N	\N	2025-11-25 10:00:03.061955+00	1
\.


--
-- Data for Name: admin_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_settings (id, key, value, description, updated_at) FROM stdin;
cmi0fwzrf000m4l01nbqaw3xu	top_pinned_count	4	Number of pinned businesses to show at top of search results	2025-11-15 15:27:05.74
cmibrgs3r00001duiuv7s1dsg	show_test_on_public	false	When true, test businesses will appear on public pages (for testing only)	2025-11-23 13:35:55.631
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, email, password_hash, name, role, is_active, last_login_at, created_at, updated_at, google_id) FROM stdin;
cmi0fwzc8000l4l018014ye07	345287@gmail.com	$2a$10$jYrTLwW4SuAC6zhXYCMm6uKtx68BLhN8DJoo6Sj/BUo999Ku/Cali	Super Admin	SUPERADMIN	t	\N	2025-11-15 15:27:05.192	2025-11-15 15:27:05.192	\N
\.


--
-- Data for Name: business_owners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_owners (id, email, password_hash, name, phone, is_active, created_at, updated_at, google_id, is_verified, last_login_at) FROM stdin;
cmibnq7hh0001fu9aboanafr8	test@gmail.com	$2a$10$lbXSlaeMovaeJYHvxzbKQ.fbu1mk9dlKASPMCtqh5OKUFpk50e.Bm	Michael test	\N	t	2025-11-23 11:51:14.022	2025-11-23 11:51:14.022	\N	f	\N
cmibt8mko00023mahlzy3dgcn	345287info@gmail.com	\N	Michael Mishaev	\N	t	2025-11-23 14:25:31.464	2025-11-23 14:25:31.464	116915965602845793711	t	\N
cmic43i3v000i14nfi2k3t7jr	dimaserkin2@gmail.com	\N	Dima Daniel Serkin	\N	t	2025-11-23 19:29:28.171	2025-11-23 19:29:28.171	100391228377615509294	t	\N
cmic5742200016f071wxsdkaw	345287@gmail.com	\N	Michael Mishaev	\N	t	2025-11-23 20:00:16.202	2025-11-23 20:00:16.202	110955798718535241874	t	\N
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.businesses (id, name_he, name_ru, slug_he, slug_ru, description_he, description_ru, city_id, neighborhood_id, address_he, address_ru, latitude, longitude, phone, whatsapp_number, website_url, email, opening_hours_he, opening_hours_ru, is_visible, is_verified, is_pinned, pinned_order, category_id, created_at, updated_at, deleted_at, serves_all_city, subcategory_id, is_test, owner_id) FROM stdin;
cmi0fx1cq000s4l01ve92n8mb	חשמל משה - צפון	\N	hashmal-moshe-tsafon	\N	שירותי חשמל מקצועיים בצפון נתניה	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwv5100044l0124ncf0xh	\N	\N	\N	\N	+972503456789	+972503456789	\N	\N	\N	\N	t	f	f	\N	cmi0fwvxv00094l01rm6apja1	2025-11-15 15:27:07.802	2025-11-15 15:27:07.802	\N	f	\N	f	\N
cmi0fx1zu000w4l01sl4n2kxu	אינסטלציה רון - דרום	\N	instalatsia-ron-darom	\N	שירותי אינסטלציה בדרום נתניה	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwveo00064l019qtwges5	\N	\N	\N	\N	\N	+972505678901	\N	\N	\N	\N	t	f	f	\N	cmi0fwwda000a4l01nukm03lz	2025-11-15 15:27:08.634	2025-11-15 15:27:08.634	\N	f	\N	f	\N
cmi0fx2b9000y4l01mkn2zqyl	מים וצנרת - אבי	Вода и трубы - Ави	mayim-vetsineret-avi	voda-i-truby-avi	מומחה לתיקוני צנרת ודודים	Специалист по ремонту труб и бойлеров	cmi0fwu9v00004l01x4rv2u95	cmi0fwv5100044l0124ncf0xh	\N	\N	\N	\N	+972506789012	\N	\N	\N	\N	\N	t	t	f	\N	cmi0fwwda000a4l01nukm03lz	2025-11-15 15:27:09.045	2025-11-15 15:27:09.045	\N	f	\N	f	\N
cmi0fx2y100124l01thtjkxwj	ניקיון מהיר - צפון	\N	nikuyon-mahir-tsafon	\N	שירותי ניקיון מהירים ויעילים בצפון נתניה	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwv5100044l0124ncf0xh	\N	\N	\N	\N	\N	+972508901234	\N	\N	\N	\N	t	f	f	\N	cmi0fwx69000d4l014eti2ocr	2025-11-15 15:27:09.865	2025-11-15 15:27:09.865	\N	f	\N	f	\N
cmibe94sd0003kse2mzj90tek	גואל פילוריאן	\N	gval-pylvryan-78538	\N	עוסק בנדלן, חוזים, צוואות, ייפוי כח מתמשך, תחום אזרחי בבתי משפט, ייצוג זוכים בהוצאה לפועל	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972548073949	+972548073949	\N	\N	\N	\N	t	f	f	\N	cmi0fwz0w000k4l01zrcn85ld	2025-11-23 07:26:00.829	2025-11-23 07:26:00.829	\N	f	cmiarhcpb0005pwthtglfkcv8	f	\N
cmibe94t30009kse2z5pbi6b7	עדי אסף	\N	ady-asf-78543	\N	מאפרת ומסרקת לקוחות פרטיים- כלות וערב	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972544312462	+972544312462	\N	\N	\N	\N	t	f	f	\N	cmiariluc0000dub7c682di4s	2025-11-23 07:26:00.855	2025-11-23 07:26:00.855	\N	f	cmiarit7n000du4em88dvl5um	f	\N
cmibe94tt000dkse250sy4r8w	ויקטור עין אלי	\N	vyktvr-ayn-aly-78548	\N	טיפול בלוחות חשמל, תקלות וקצרים, כל עבודות החשמל	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972523598225	+972523598225	\N	\N	\N	\N	t	f	f	\N	cmi0fwvxv00094l01rm6apja1	2025-11-23 07:26:00.881	2025-11-23 07:26:00.881	\N	f	\N	f	\N
cmibe94u3000fkse23np3vvm8	חשמל נתניה	\N	chshml-ntnyh-78549	\N	חשמלאי מוסמך מעל 30 שנה , נותן שירות בתחום החשמל למגזר הפרטי ועסקי כולל תקלות חשמל מכל הסוגים	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972522422351	+972522422351	\N	\N	\N	\N	t	f	f	\N	cmi0fwvxv00094l01rm6apja1	2025-11-23 07:26:00.891	2025-11-23 07:26:00.891	\N	f	\N	f	\N
cmibe94ub000hkse2xew7pg4h	מיטל דוידי	\N	mytl-dvydy-78551	\N	מאפרת מקצועית ומסדרת שיער, מגיעה למקום ההתארגנות	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972525634707	+972525634707	\N	\N	\N	\N	t	f	f	\N	cmiariluc0000dub7c682di4s	2025-11-23 07:26:00.899	2025-11-23 07:26:00.899	\N	f	cmiarit7n000du4em88dvl5um	f	\N
cmibe94uv000lkse23b3oljn4	רוזין טכנולוגיה	\N	rvzyn-tknvlvgyh-78553	\N	מכירה ותיקון מחשבים, התקנת מצלמות אבטחה, אינטרקום עם בקרי כניסה, פתרונות תקשורת לעסקים בענן	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972544448140	+972544448140	\N	\N	\N	\N	t	f	f	\N	cmiarimxz0009dub7awsly0i9	2025-11-23 07:26:00.92	2025-11-23 07:26:00.92	\N	f	cmiariv6n002du4em3jgu5b3o	f	\N
cmibe94vb000nkse28w6ip23w	סאלי הובלות	\N	saly-hvblvt-78555	\N	הובלות בכל הארץ, לא בשבת	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwveo00064l019qtwges5	\N	\N	\N	\N	+972585805800	+972585805800	\N	\N	\N	\N	t	f	f	\N	cmiarim0k0001dub79biv5tsv	2025-11-23 07:26:00.935	2025-11-23 07:26:00.935	\N	f	cmiaritjh000pu4emky2dlft9	f	\N
cmi0fx1oa000u4l01rrjvrayj	אינסטלציה דוד - מומחים	Сантехника Давид - Эксперты	instalatsia-david-mumhim	santehnika-david-eksperty	שירותי אינסטלציה מקצועיים. פתיחת סתימות, תיקוני צנרת	Профессиональные сантехнические услуги. Прочистка засоров, ремонт труб	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972504567890	+972504567890	https://instalatsia-david.example.com	\N	זמין 24/7	Доступен 24/7	t	t	f	\N	cmi0fwwda000a4l01nukm03lz	2025-11-15 15:27:08.219	2025-11-23 13:31:48.931	\N	f	\N	f	\N
cmibe94ul000jkse28hkxajil	עירית נווה	\N	ayryt-nvvh-78552	\N	עיצוב פנים לגילאי 60+ מתמחה בהתאמת בתים לגיל השלישי החדש – רגיש, פרקטי ואסתטי.	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972544442344	+972544442344	\N	\N	\N	\N	t	f	f	\N	cmiarim4s0002dub7grr0xyya	2025-11-23 07:26:00.91	2025-11-23 13:34:53.707	2025-11-23 13:34:53.706	f	\N	f	\N
cmibe94tf000bkse210kgcnmr	עדי אס	\N	ady-as-78545	\N	צילומי תדמית, הפקות, מותגי אופנה כמו הודיס, אייס קיוב,לאישה	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972544312462	+972544312462	\N	\N	\N	\N	t	f	f	\N	cmiarimtv0008dub7xsg6uwif	2025-11-23 07:26:00.868	2025-11-23 13:34:58.578	2025-11-23 13:34:58.577	f	\N	f	\N
cmibe94sw0007kse2hsew3foj	אופיר שמש	\N	avpyr-shmsh-78542	\N	לוכד נחשים מנוסה, מורשה רשות הטבע והגנים	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972529202446	+972529202446	\N	\N	\N	\N	t	f	f	\N	cmiarimhf0005dub7ye8elgne	2025-11-23 07:26:00.848	2025-11-23 13:35:02.129	2025-11-23 13:35:02.127	f	\N	f	\N
cmibe94sm0005kse2tilui708	אושרית קצנטיני	\N	avshryt-ktsntyny-78540	\N	פדיקוריסטית/ מניקוריסטית עם הכשרה מטעם אגודת איל לטיפול בסכרתיים.	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwveo00064l019qtwges5	\N	\N	\N	\N	+972506555050	+972506555050	\N	\N	\N	\N	t	f	f	\N	cmiariluc0000dub7c682di4s	2025-11-23 07:26:00.839	2025-11-23 13:35:20.657	\N	f	cmiaritdl000ju4emy4bxkzra	f	\N
cmibe94s20001kse21qui8cpf	שוש גרינשטיין	\N	shvsh-grynshtyyn-78535	\N	ניסיון של 18 שנים פדיקוריסטית רפואית ומורה לפדיקור.בונה ציפורניים ולק גל בכל השיטות	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwveo00064l019qtwges5	\N	\N	\N	\N	+972545722530	+972545722530	\N	\N	\N	\N	t	f	f	\N	cmiariluc0000dub7c682di4s	2025-11-23 07:26:00.818	2025-11-23 13:35:36.863	\N	f	cmiaritdl000ju4emy4bxkzra	f	\N
cmi0fx2mo00104l011gmvafgx	ניקיון מושלם - אירינה	Идеальная уборка - Ирина	nikuyon-mushlam-irina	idealnaya-uborka-irina	שירותי ניקיון לבתים ומשרדים. צוות מקצועי ומנוסה	Услуги уборки для домов и офисов. Профессиональная и опытная команда	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972507890123	+972507890123	\N	\N	א׳-ו׳: 07:00-19:00	Пн-Пт: 07:00-19:00	t	f	f	\N	cmi0fwx69000d4l014eti2ocr	2025-11-15 15:27:09.457	2025-11-23 19:32:30.693	\N	f	\N	f	\N
cmibe94vp000pkse2lrlqdl4m	אורית סוויד	\N	avryt-svvyd-78556	\N	סדנת בישול בריא, אוכל מוכן צמחוני טבעוני דגים הזמנות מראש	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972504330656	+972504330656	\N	\N	\N	\N	t	f	f	\N	cmiarimtv0008dub7xsg6uwif	2025-11-23 07:26:00.949	2025-11-23 07:26:00.949	\N	f	cmiariust001zu4emihd3nmqa	f	\N
cmibe94w9000tkse2x81adk9h	AV Mobile	\N	av-mobile-78559	\N	טכנאי עד הבית של סלולר, נייד,תיקון מסך, החלפת סוללה, העברת נתונים, פתיחה למכשירים נעולים ועוד...	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972526651659	+972526651659	\N	\N	\N	\N	t	f	f	\N	cmiarim930003dub78f6z4f0f	2025-11-23 07:26:00.969	2025-11-23 07:26:00.969	\N	f	cmiariu1b0017u4em5hajbd5c	f	\N
cmibe953f0027kse2r361w27f	ניקול מתתיהו	\N	nykvl-mttyhv-78589	\N	החלקה אורגנית, אחריות מלאה, חפיפה באותו היום	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972526144194	+972526144194	\N	\N	\N	\N	t	f	f	\N	cmiariluc0000dub7c682di4s	2025-11-23 07:26:01.227	2025-11-23 07:26:01.227	\N	f	cmiarit5m000bu4emu3ski4qm	f	\N
cmibe94wl000vkse2wqemdp8b	A.R Cameras&Security	\N	ar-camerassecurity-78560	\N	כל סוגי ההתקנות - מצלמות, אזעקות, גלאים, קודניות, אינטרקום, מערכות מוזיקה, כל סוגי התקשורת	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972544472018	+972544472018	\N	\N	\N	\N	t	f	f	\N	cmiarim4s0002dub7grr0xyya	2025-11-23 07:26:00.981	2025-11-23 07:26:00.981	\N	f	cmiaritve0011u4emvgwmzwe2	f	\N
cmibe94ww000xkse2ufxx18j2	handy master	\N	handy-master-78561	\N	תיקונים כלליים,צבע,טיוח,אינסטלציה וחשמל, שיפוצים ועוד.	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972538616232	+972538616232	\N	\N	\N	\N	t	f	f	\N	cmiarim4s0002dub7grr0xyya	2025-11-23 07:26:00.992	2025-11-23 07:26:00.992	\N	f	cmiaritri000xu4emadjpsa7g	f	\N
cmibe94xm0011kse27r31o11a	שי תורגמן	\N	shy-tvrgmn-78563	\N	מתמחה במציאת נדלן, פינוי בינוי בכל רחבי העיר.	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972504447632	+972504447632	\N	\N	\N	\N	t	f	f	\N	cmiarinfh000cdub7argay7hr	2025-11-23 07:26:01.018	2025-11-23 07:26:01.018	\N	f	cmiarivu2002tu4emblm1pat3	f	\N
cmibe94yg0015kse23ubrtizv	איציק סוויסה	\N	aytsyk-svvysh-78566	\N	הנדימן עבודות פירוק והרכבה,צביעה וכו׳	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972532750836	+972532750836	\N	\N	\N	\N	t	f	f	\N	cmiarim4s0002dub7grr0xyya	2025-11-23 07:26:01.048	2025-11-23 07:26:01.048	\N	f	cmiaritri000xu4emadjpsa7g	f	\N
cmibe94yp0017kse2ucgu01lz	איתן מזרחי	\N	aytn-mzrchy-78567	\N	הנדימן,חשמלאי מוסמך	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972503099910	+972503099910	\N	\N	\N	\N	t	f	f	\N	cmiarim4s0002dub7grr0xyya	2025-11-23 07:26:01.057	2025-11-23 07:26:01.057	\N	f	cmiaritri000xu4emadjpsa7g	f	\N
cmibe94yv0019kse2oce9hgig	אלי	\N	aly-78568	\N	חשמלאי מוסמך עם ותק מעל 30 שנה	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972523421565	+972523421565	\N	\N	\N	\N	t	f	f	\N	cmi0fwvxv00094l01rm6apja1	2025-11-23 07:26:01.064	2025-11-23 07:26:01.064	\N	f	\N	f	\N
cmibe94z5001bkse295fi2th8	משכנטוב - ייעוץ משכנתאות	\N	mshkntvb-yyavts-mshkntavt-78569	\N	ייעוץ וליווי עד קבלת המשכנתא/ ההלוואה הכי משתלמת עבורך!	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972522979097	+972522979097	\N	\N	\N	\N	t	f	f	\N	cmiarimpq0007dub7q2ce8apb	2025-11-23 07:26:01.074	2025-11-23 07:26:01.074	\N	f	cmiariuqv001xu4emu8hzdil1	f	\N
cmibe94ze001dkse23bf1biv7	אושר נורמטוב	\N	avshr-nvrmtvb-78571	\N	מורה לכלל המקצועות, החל מכתה א עד הכנה לבגרות ואפילו לתואר הנדסה/ מדוייקים. מהנדס חשמל במקצוע.	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972585020797	+972585020797	\N	\N	\N	\N	t	f	f	\N	cmiarin3v000adub732xe8258	2025-11-23 07:26:01.083	2025-11-23 07:26:01.083	\N	f	cmiarivkw002lu4emmsxel2hv	f	\N
cmibe94zx001hkse2n61a0wc1	ורד כהן בלוני׳ס	\N	vrd-khn-blvnys-78573	\N	עיצוב אירועים בלונים ופרחים, בשבילכם לכל עיצוב וחגיגה	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972526410104	+972526410104	\N	\N	\N	\N	t	f	f	\N	cmiarimtv0008dub7xsg6uwif	2025-11-23 07:26:01.101	2025-11-23 07:26:01.101	\N	f	cmiariuwp0023u4emjknbyuzd	f	\N
cmibe9507001jkse2ufr98bdk	לילך הלל	\N	lylk-hll-78574	\N	טיפול רגשי לילדים ונוער בעזרת בעלי חיים, הדרכות הורים	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972545536290	+972545536290	\N	\N	\N	\N	t	f	f	\N	cmiarimdc0004dub7lm5q3dg7	2025-11-23 07:26:01.111	2025-11-23 07:26:01.111	\N	f	cmiariu94001fu4emv9wkt9z0	f	\N
cmibe950h001lkse2mbcclt5a	חמי תמיר	\N	chmy-tmyr-78575	\N	משרד בונות עתיד - טום לנטוס 10	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972509331191	+972509331191	\N	\N	\N	\N	t	f	f	\N	cmiarinfh000cdub7argay7hr	2025-11-23 07:26:01.121	2025-11-23 07:26:01.121	\N	f	cmiarivu2002tu4emblm1pat3	f	\N
cmibe9511001pkse20tg2ovpn	נטלי ידן	\N	ntly-ydn-78578	\N	מעסה מקצועית ועוד טיפולים רפואה סינית לנשים בלבד	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972525228008	+972525228008	\N	\N	\N	\N	t	f	f	\N	cmiarimdc0004dub7lm5q3dg7	2025-11-23 07:26:01.142	2025-11-23 07:26:01.142	\N	f	cmiariu58001bu4emxwymvr5h	f	\N
cmibe951a001rkse2z02z278j	עוז שני	\N	avz-shny-78580	\N	שירותי הסעות לבעלי מוגבלויות ברכב נגיש	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972528146655	+972528146655	\N	\N	\N	\N	t	f	f	\N	cmiarim0k0001dub79biv5tsv	2025-11-23 07:26:01.15	2025-11-23 07:26:01.15	\N	f	cmiarithh000nu4emllrrv853	f	\N
cmibe951n001tkse2w4jg0wt9	רימה	\N	rymh-78581	\N	מורה לכלל המקצועות, החל מכתה א עד הכנה לבגרות.	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972525214917	+972525214917	\N	\N	\N	\N	t	f	f	\N	cmiarin3v000adub732xe8258	2025-11-23 07:26:01.164	2025-11-23 07:26:01.164	\N	f	cmiarivkw002lu4emmsxel2hv	f	\N
cmibe951y001vkse2emq8ypyg	לינור הרוש	\N	lynvr-hrvsh-78582	\N	הדבקת ריסים בשיטה הקרה	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972523623441	+972523623441	\N	\N	\N	\N	t	f	f	\N	cmiariluc0000dub7c682di4s	2025-11-23 07:26:01.174	2025-11-23 07:26:01.174	\N	f	cmiarit9m000fu4emxb5m38xr	f	\N
cmibe9525001xkse2u1xr5rdn	מקס המקסים מולגן	\N	mks-hmksym-mvlgn-78583	\N	אלי פונים רק אחרי שניסתם למכור לבד ולא הצלחתם	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972546932101	+972546932101	\N	\N	\N	\N	t	f	f	\N	cmiarinfh000cdub7argay7hr	2025-11-23 07:26:01.181	2025-11-23 07:26:01.181	\N	f	cmiarivu2002tu4emblm1pat3	f	\N
cmibe94zn001fkse2xqvge72o	המאסטרים לניקיון	\N	hmastrym-lnykyvn-78572	\N	חברת ניקיון לבניינים , דירות לפני ואחרי איכלוס , ניקיון משרדים ועוד	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972528202633	+972528202633	\N	\N	\N	\N	t	f	f	\N	cmiarim4s0002dub7grr0xyya	2025-11-23 07:26:01.091	2025-11-23 13:34:35.509	2025-11-23 13:34:35.508	f	\N	f	\N
cmibe94y20013kse26pnl9dqb	eyewatch רועי	\N	eyewatch-rvay-78565	\N	מערכות מיגון ומצלמות אבטחה	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972522248058	+972522248058	\N	\N	\N	\N	t	f	f	\N	cmiarimxz0009dub7awsly0i9	2025-11-23 07:26:01.034	2025-11-23 13:34:37.29	2025-11-23 13:34:37.289	f	\N	f	\N
cmibe94x9000zkse2u192f2u7	ללי תופרת	\N	lly-tvprt-78562	\N	תפירת שמלות כלה וערב, תיקונים לשמלות ובגדים	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972507536367	+972507536367	\N	\N	\N	\N	t	f	f	\N	cmiarimll0006dub7s00tgx8e	2025-11-23 07:26:01.005	2025-11-23 13:34:40.23	2025-11-23 13:34:40.229	f	\N	f	\N
cmibe94vz000rkse2le44juny	ספורטיבטי הפעלות ילדים	\N	spvrtybty-hpalvt-yldym-78558	\N	הפעלות ימי הולדת, ימי גיבוש, בת מצוו, מסיבות ועוד	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972548086110	+972548086110	\N	\N	\N	\N	t	f	f	\N	cmiarimtv0008dub7xsg6uwif	2025-11-23 07:26:00.96	2025-11-23 13:34:48.511	\N	f	cmiariuyr0025u4emafjgspme	f	\N
cmibe952m0021kse2blcewuar	אוראל טייב	\N	avral-tyyb-78585	\N	מתכנן פנסיוני, פנסיה, ביטוח ופיננסים	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972527795345	+972527795345	\N	\N	\N	\N	t	f	f	\N	cmiarimpq0007dub7q2ce8apb	2025-11-23 07:26:01.199	2025-11-23 07:26:01.199	\N	f	cmiariuqv001xu4emu8hzdil1	f	\N
cmibe952v0023kse278z9p2hr	רחל ללו	\N	rchl-llv-78587	\N	עו״ס קלינית פסיכותרפיסטית Cbt,טיפול רגשי בילדים, נוער ומבוגרים	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972525799047	+972525799047	\N	\N	\N	\N	t	f	f	\N	cmiarimdc0004dub7lm5q3dg7	2025-11-23 07:26:01.207	2025-11-23 07:26:01.207	\N	f	cmiariu94001fu4emv9wkt9z0	f	\N
cmibe95340025kse2nhcso3ar	אביבה שני	\N	abybh-shny-78588	\N	\N	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972528895222	+972528895222	\N	\N	\N	\N	t	f	f	\N	cmiarimxz0009dub7awsly0i9	2025-11-23 07:26:01.216	2025-11-23 07:26:01.216	\N	f	cmiariv6n002du4em3jgu5b3o	f	\N
cmibe953w002bkse2fhtn1q1b	אופיר עיצוב שיער לגבר	\N	avpyr-aytsvb-shyar-lgbr-78591	\N	עיצוב שיער גברים וילדים	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972502234454	+972502234454	\N	\N	\N	\N	t	f	f	\N	cmiariluc0000dub7c682di4s	2025-11-23 07:26:01.244	2025-11-23 07:26:01.244	\N	f	cmiarit5m000bu4emu3ski4qm	f	\N
cmibe9544002dkse2tqbey4no	אמילי בל לנדסמן נדלן	\N	amyly-bl-lndsmn-ndln-78592	\N	אמילי בל עובדת בשיווק פרויקטים , נכסי יוקרה ויד שניה ! עם קהל לקוחות רחב	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972506396531	+972506396531	\N	\N	\N	\N	t	f	f	\N	cmiarinfh000cdub7argay7hr	2025-11-23 07:26:01.252	2025-11-23 07:26:01.252	\N	f	cmiarivu2002tu4emblm1pat3	f	\N
cmibe954b002fkse2f2aa4cgn	מנשה בן יוסף	\N	mnshh-bn-yvsf-78593	\N	פסיכותרפיה לילדים, זוגיות ובעיות אישיות	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972546369312	+972546369312	\N	\N	\N	\N	t	f	f	\N	cmiarimdc0004dub7lm5q3dg7	2025-11-23 07:26:01.259	2025-11-23 07:26:01.259	\N	f	cmiariu76001du4em7ep4dedq	f	\N
cmibe954s002jkse24yt07atg	ליאור בוקרה	\N	lyavr-bvkrh-78596	\N	שירות אמין מחירים נוחים	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972544920120	+972544920120	\N	\N	\N	\N	t	f	f	\N	cmiarim4s0002dub7grr0xyya	2025-11-23 07:26:01.276	2025-11-23 07:26:01.276	\N	f	cmiaritph000vu4emiznds9qf	f	\N
cmibe9550002lkse25jif8bm7	ליעד פוגל - פוגל נכסים	\N	lyad-pvgl-pvgl-nksym-78597	\N	הערכת שווי לנכס לפניי מכירה על ידי מתווכים מקצועיים שחיים את האזור תוך 12 שעות בלבד	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972546122661	+972546122661	\N	\N	\N	\N	t	f	f	\N	cmiarinfh000cdub7argay7hr	2025-11-23 07:26:01.284	2025-11-23 07:26:01.284	\N	f	cmiarivu2002tu4emblm1pat3	f	\N
cmi0fx0lw000o4l01crgbnh7z	חשמל יוסי - מרכז	Электрика Йоси - Центр	hashmal-yossi-merkaz	elektrika-yosi-tsentr	שירותי חשמל מקצועיים במרכז נתניה. זמינות 24/7	Профессиональные электрические услуги в центре Нетании. Доступность 24/7	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	רחוב הרצל 25, נתניה	ул. Герцль 25, Нетания	\N	\N	+972501234567	+972501234567	\N	\N	א׳-ה׳: 08:00-17:00, ו׳: 08:00-13:00	Пн-Чт: 08:00-17:00, Пт: 08:00-13:00	t	f	f	\N	cmi0fwvxv00094l01rm6apja1	2025-11-15 15:27:06.836	2025-11-23 11:55:07.824	\N	f	\N	f	\N
cmi0fx116000q4l016dlucjqq	אור חשמל - שירות מהיר	Ор Электрика - Быстрый сервис	or-hashmal-sherut-mahir	or-elektrika-bystriy-servis	תיקוני חשמל ותחזוקה. ותק של 15 שנה בנתניה	Ремонт и обслуживание электрики. 15 лет опыта в Нетании	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	שדרות בנימין 100, נתניה	\N	\N	\N	+972502345678	\N	\N	\N	\N	\N	t	f	f	\N	cmi0fwvxv00094l01rm6apja1	2025-11-15 15:27:07.387	2025-11-23 11:55:09.199	\N	f	\N	f	\N
cmibe9556002nkse24wpqi7gu	יהונתן ארנון	\N	yhvntn-arnvn-78599	\N	\N	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972524749837	+972524749837	\N	\N	\N	\N	t	f	f	\N	cmiarimdc0004dub7lm5q3dg7	2025-11-23 07:26:01.291	2025-11-23 13:34:21.639	2025-11-23 13:34:21.638	f	\N	f	\N
cmibe954j002hkse2bsmphm8z	אריה שטרן	\N	aryh-shtrn-78595	\N	\N	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972505336586	+972505336586	\N	\N	\N	\N	t	f	f	\N	cmiarim0k0001dub79biv5tsv	2025-11-23 07:26:01.267	2025-11-23 13:34:24.566	2025-11-23 13:34:24.565	f	\N	f	\N
cmibe953o0029kse2ga4l7ewz	שמוליק גנדלמן	\N	shmvlyk-gndlmn-78590	\N	מורה לנהיגה	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972522445323	+972522445323	\N	\N	\N	\N	t	f	f	\N	cmiarim0k0001dub79biv5tsv	2025-11-23 07:26:01.236	2025-11-23 13:34:27.567	2025-11-23 13:34:27.566	f	\N	f	\N
cmibe952d001zkse2qlzqe9lk	דנה שלזינגר	\N	dnh-shlzyngr-78584	\N	מכירת ג׳חנון חלבי עשוי מחמאה ודבש	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+972528720262	+972528720262	\N	\N	\N	\N	t	f	f	\N	cmiarimtv0008dub7xsg6uwif	2025-11-23 07:26:01.189	2025-11-23 13:34:31.794	2025-11-23 13:34:31.793	f	\N	f	\N
cmibe950s001nkse2wqv6sz3r	תופרת ליליה	\N	tvprt-lylyh-78576	\N	תופרות כל סוגי התיקונים, כולל וילונות, מדים, תיקונים לשמלות ערב וכלה	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	+97298828326	+97298828326	\N	\N	\N	\N	t	f	f	\N	cmiarimll0006dub7s00tgx8e	2025-11-23 07:26:01.132	2025-11-23 13:34:33.614	2025-11-23 13:34:33.613	f	\N	f	\N
cmibtd1ck00093mahhvhmzpy2	מיכאל טסט	\N	mykal-tst	\N	שדגשדגשדגשדגשד שדג שגד שדג שגד שדג שגד	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	שד ויצמן 75	\N	\N	\N	098626253	0544345287	https://kartis.info	\N	א׳: 08:00-17:00, ב׳: 08:00-17:00, ג׳: 08:00-17:00, ד׳: 08:00-17:00, ה׳: 08:00-17:00, ו׳: 08:00-14:00, ש׳: סגור	\N	t	f	f	\N	\N	2025-11-23 14:28:57.236	2025-11-23 15:29:11.859	2025-11-23 15:11:16.353	t	\N	f	\N
cmibvl6gq000a14nfzx8w39ql	מיכאל טסט	\N	mykal-tst-1	\N	שגשג שדג שד גשדג	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	098656545	0544654456	\N	\N	א׳: 09:00-21:00, ב׳: 09:00-21:00, ג׳: 09:00-21:00, ד׳: 09:00-21:00, ה׳: 09:00-21:00, ו׳: 09:00-15:00, ש׳: סגור	\N	t	f	f	\N	\N	2025-11-23 15:31:16.347	2025-11-23 15:31:42.402	2025-11-23 15:31:36.325	t	\N	f	\N
cmic46ch2000n14nfx5jvofhu	הלקוח המרוצה שירותי כח אדם בעמ	\N	hlkvch-hmrvtsh-shyrvty-kch-adm-bm	\N	חברת ניקיון למשרדים, מוסדות ציבוריים, חברות גדולות, מגדלי מגורים 	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	סמילנסקי 10 נתניה	\N	\N	\N	0532414062	0532414062	https://www.alakoah.co.il	\N	א׳: 08:00-17:00, ב׳: 08:00-17:00, ג׳: 08:00-17:00, ד׳: 08:00-17:00, ה׳: 08:00-17:00, ו׳: 08:00-14:00, ש׳: סגור	\N	t	t	t	1	cmi0fwx69000d4l014eti2ocr	2025-11-23 19:31:40.839	2025-11-24 07:34:45.355	\N	t	\N	f	cmic43i3v000i14nfi2k3t7jr
cmiddeii20001g71z6x5jl8dc	מיכאל טסט	\N	mykal-tst-2	\N	פירוט כאן	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	וימן 75	\N	\N	\N	0544354456	0544345654	\N	sdf@ads.com	א׳: 08:00-17:00, ב׳: 08:00-17:00, ג׳: 08:00-17:00, ד׳: 08:00-17:00, ה׳: 08:00-17:00, ו׳: 08:00-14:00, ש׳: סגור	\N	t	f	f	\N	cmi0fwvxv00094l01rm6apja1	2025-11-24 16:37:44.619	2025-11-24 21:23:18.672	2025-11-24 21:23:18.508	t	\N	f	cmic5742200016f071wxsdkaw
cmiediih80002eulkpw64aoti	 test9	\N	test9	\N	 asd asd ads  adasdf	\N	cmi0fwu9v00004l01x4rv2u95	cmi0fwuph00024l01ovsse1ph	\N	\N	\N	\N	\N	0544345654	\N	\N	א׳: 08:00-17:00, ב׳: 08:00-17:00, ג׳: 08:00-17:00, ד׳: 08:00-17:00, ה׳: 08:00-17:00, ו׳: 08:00-14:00, ש׳: סגור	\N	t	f	f	\N	cmi0fwwda000a4l01nukm03lz	2025-11-25 09:28:37.388	2025-11-25 09:28:37.388	\N	t	\N	f	cmibnq7hh0001fu9aboanafr8
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name_he, name_ru, slug, icon_name, description_he, description_ru, is_active, is_popular, display_order, created_at, updated_at) FROM stdin;
cmi0fwwmw000b4l01qap16o9u	מסגרים	Слесари	locksmiths	key	\N	\N	t	t	3	2025-11-15 15:27:01.689	2025-11-15 15:27:01.689
cmi0fwwwj000c4l01ql4jt6q2	צבעים	Маляры	painters	paint-brush	\N	\N	t	f	4	2025-11-15 15:27:02.035	2025-11-15 15:27:02.035
cmi0fwx69000d4l014eti2ocr	נקיון	Уборка	cleaning	sparkles	\N	\N	t	t	5	2025-11-15 15:27:02.386	2025-11-15 15:27:02.386
cmi0fwxfv000e4l01y7ai8yt7	טכנאי מזגנים	Ремонт кондиционеров	ac-technicians	wind	\N	\N	t	t	6	2025-11-15 15:27:02.732	2025-11-15 15:27:02.732
cmi0fwxpe000f4l01u1f8ug0h	גנים ונוף	Садоводство	gardening	leaf	\N	\N	t	f	7	2025-11-15 15:27:03.074	2025-11-15 15:27:03.074
cmi0fwxyu000g4l0132wk0dxu	מתקני חשמל ומים	Электромонтаж	electricians-industrial	cog	\N	\N	t	f	8	2025-11-15 15:27:03.415	2025-11-15 15:27:03.415
cmi0fwy8e000h4l015y3nlnqd	נגרים	Плотники	carpenters	hammer	\N	\N	t	f	9	2025-11-15 15:27:03.758	2025-11-15 15:27:03.758
cmi0fwyhx000i4l015o0ff0ch	מורים פרטיים	Репетиторы	tutors	academic-cap	\N	\N	t	t	10	2025-11-15 15:27:04.101	2025-11-15 15:27:04.101
cmi0fwyrf000j4l01gze2w5ia	רופאים	Врачи	doctors	medical-bag	\N	\N	t	f	11	2025-11-15 15:27:04.444	2025-11-15 15:27:04.444
cmi0fwz0w000k4l01zrcn85ld	עורכי דין	Адвокаты	lawyers	scale	\N	\N	t	f	12	2025-11-15 15:27:04.785	2025-11-15 15:27:04.785
cmiariluc0000dub7c682di4s	עיצוב שיער, קוסמטיקה ויופי	Парикмахерские и косметические услуги	hair-beauty-cosmetics	scissors	\N	\N	t	t	13	2025-11-22 20:49:31.668	2025-11-22 20:49:31.668
cmiarim0k0001dub79biv5tsv	רכב, תחבורה, הובלות	Транспорт и перевозки	transportation	truck	\N	\N	t	t	14	2025-11-22 20:49:31.893	2025-11-22 20:49:31.893
cmiarim4s0002dub7grr0xyya	שירותים לבית	Услуги для дома	home-services	home	\N	\N	t	t	15	2025-11-22 20:49:32.044	2025-11-22 20:49:32.044
cmiarim930003dub78f6z4f0f	שירותי אלקטרוניקה אישית	Электроника	personal-electronics	device-mobile	\N	\N	t	f	16	2025-11-22 20:49:32.199	2025-11-22 20:49:32.199
cmiarimdc0004dub7lm5q3dg7	בריאות ורפואה משלימה	Здоровье и альтернативная медицина	health-wellness	heart	\N	\N	t	t	17	2025-11-22 20:49:32.352	2025-11-22 20:49:32.352
cmi0fwvxv00094l01rm6apja1	חשמלאים	Электрики	electricians	bolt	\N	\N	t	t	1	2025-11-15 15:27:00.788	2025-11-15 15:27:00.788
cmi0fwwda000a4l01nukm03lz	אינסטלטורים	Сантехники	plumbers	wrench	\N	\N	t	t	2	2025-11-15 15:27:01.343	2025-11-15 15:27:01.343
cmiarimhf0005dub7ye8elgne	סביבה ובעלי חיים	Окружающая среда и животные	environment-animals	leaf	\N	\N	t	f	18	2025-11-22 20:49:32.5	2025-11-22 20:49:32.5
cmiarimll0006dub7s00tgx8e	תופרות	Швейные услуги	sewing	scissors	\N	\N	t	f	19	2025-11-22 20:49:32.649	2025-11-22 20:49:32.649
cmiarimpq0007dub7q2ce8apb	ייעוץ אישי וכלכלי	Финансовый консалтинг	financial-consulting	currency-dollar	\N	\N	t	f	20	2025-11-22 20:49:32.798	2025-11-22 20:49:32.798
cmiarimtv0008dub7xsg6uwif	אוכל, צילום, אירועים והפעלות	Еда, фото, мероприятия	food-events-activities	cake	\N	\N	t	t	21	2025-11-22 20:49:32.948	2025-11-22 20:49:32.948
cmiarimxz0009dub7awsly0i9	שירותים לעסקים	Услуги для бизнеса	business-services	building-office	\N	\N	t	f	22	2025-11-22 20:49:33.095	2025-11-22 20:49:33.095
cmiarin3v000adub732xe8258	חינוך, למידה, בייביסיטר	Образование и няни	education-learning	academic-cap	\N	\N	t	t	23	2025-11-22 20:49:33.307	2025-11-22 20:49:33.307
cmiarinac000bdub7uh2nwx6l	ייעוץ דיגיטלי	Цифровой консалтинг	digital-consulting	computer-desktop	\N	\N	t	f	24	2025-11-22 20:49:33.54	2025-11-22 20:49:33.54
cmiarinfh000cdub7argay7hr	נדל״ן	Недвижимость	real-estate	home-modern	\N	\N	t	t	25	2025-11-22 20:49:33.725	2025-11-22 20:49:33.725
\.


--
-- Data for Name: category_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.category_requests (id, category_name_he, category_name_ru, description, requester_name, requester_email, requester_phone, business_name, status, admin_notes, reviewed_at, reviewed_by, created_category_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cities (id, name_he, name_ru, slug, is_active, created_at, updated_at) FROM stdin;
cmi0fwu9v00004l01x4rv2u95	נתניה	Нетания	netanya	t	2025-11-15 15:26:58.627	2025-11-15 15:26:58.627
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, type, properties, session_id, user_agent, ip_hash, language, business_id, category_id, neighborhood_id, created_at) FROM stdin;
cmibedz030000m8szsfctwelt	SEARCH_PERFORMED	{"category": "hair-beauty-cosmetics", "language": "he", "neighborhood": "merkaz"}	\N	\N	84.108.134.242	\N	\N	\N	\N	2025-11-23 07:29:46.61
cmibeeoll0001m8sz75fqm4o7	SEARCH_PERFORMED	{"category": "hair-beauty-cosmetics", "language": "he", "neighborhood": "tsafon"}	\N	\N	84.108.134.242	\N	\N	\N	\N	2025-11-23 07:30:19.786
cmibeezhp0002m8szgaaftaml	BUSINESS_VIEWED	{"source": "direct", "category": "hair-beauty-cosmetics", "business_id": "cmibe94ub000hkse2xew7pg4h", "neighborhood": "merkaz"}	\N	\N	84.108.134.242	\N	\N	\N	\N	2025-11-23 07:30:33.901
cmibef3ge0003m8sz3jni5lol	BUSINESS_VIEWED	{"source": "direct", "category": "hair-beauty-cosmetics", "business_id": "cmibe953w002bkse2fhtn1q1b", "neighborhood": "merkaz"}	\N	\N	84.108.134.242	\N	\N	\N	\N	2025-11-23 07:30:39.039
cmibjkezx0000fu9a29ck12vf	SEARCH_PERFORMED	{"category": "electricians", "language": "he", "subcategory": "lighting-installation", "neighborhood": "merkaz"}	\N	\N	176.228.67.14	\N	\N	\N	\N	2025-11-23 09:54:45.358
cmibtcw1d00073mahf1ii7w3y	BUSINESS_SUBMITTED	{"category_id": "cmibtbeqb00043mah48kzyluo", "neighborhood_id": "cmi0fwuph00024l01ovsse1ph"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 14:28:50.353
cmibtdcm6000a3mah5nbclp0r	SEARCH_PERFORMED	{"category": "ריקודים-אקזוטיים", "language": "he", "neighborhood": "merkaz"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 14:29:11.837
cmibtdopu000b3maheo5q93b2	SEARCH_PERFORMED	{"category": "ריקודים-אקזוטיים", "language": "he", "neighborhood": "merkaz"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 14:29:27.518
cmibtdsqj000c3mahqlt81hnq	SEARCH_PERFORMED	{"category": "electricians", "language": "he", "neighborhood": "merkaz"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 14:29:32.731
cmibte5xc000d3mahrmbuo51e	SEARCH_PERFORMED	{"category": "ריקודים-אקזוטיים", "language": "he", "neighborhood": "tsafon"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 14:29:49.825
cmibttjhp00009s402n5knrq7	SEARCH_PERFORMED	{"category": "electricians", "language": "he", "neighborhood": "merkaz"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 14:41:47.245
cmibud69y00001436xaovyuci	SEARCH_PERFORMED	{"category": "ריקודים-אקזוטיים", "language": "he", "neighborhood": "tsafon"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 14:57:03.239
cmibudesr000114363f00b6fy	SEARCH_PERFORMED	{"category": "electricians", "language": "he", "neighborhood": "tsafon"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 14:57:14.283
cmibuey2800021436b3pk8qbn	SEARCH_PERFORMED	{"category": "ריקודים-אקזוטיים", "language": "he", "neighborhood": "tsafon"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 14:58:25.904
cmibuqp6f000314368slgo7ne	SEARCH_PERFORMED	{"category": "ריקודים-אקזוטיים", "language": "he", "neighborhood": "tsafon"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 15:07:34.262
cmibvk8mz000514nfnl2ntf20	SEARCH_PERFORMED	{"category": "rykvdym", "language": "he", "neighborhood": "tsafon"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 15:30:32.506
cmibvkzvi000814nfiya85xhn	BUSINESS_SUBMITTED	{"category_id": "cmibvjym0000414nft6ov4j12", "neighborhood_id": "cmi0fwuph00024l01ovsse1ph"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 15:31:07.807
cmibvl9yp000b14nfqdl4aeio	SEARCH_PERFORMED	{"category": "rykvdym", "language": "he", "neighborhood": "merkaz"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 15:31:20.881
cmibvlcjx000c14nfpjuevvkq	SEARCH_PERFORMED	{"category": "rykvdym", "language": "he", "neighborhood": "tsafon"}	\N	\N	2.54.162.180	\N	\N	\N	\N	2025-11-23 15:31:24.237
cmic3bdei000e14nfdtkpshvt	GEOLOCATION_DETECTED	{"neighborhood": "mizrah-hair"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:07:35.707
cmic3boqy000f14nf49igqp33	SEARCH_PERFORMED	{"category": "plumbers", "language": "he", "neighborhood": "mizrah-hair"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:07:50.408
cmic3byli000g14nfhfpgkp59	BUSINESS_VIEWED	{"source": "direct", "category": "plumbers", "business_id": "cmi0fx1oa000u4l01rrjvrayj", "neighborhood": "merkaz"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:08:03.174
cmic460tm000l14nfsz6ob15i	BUSINESS_SUBMITTED	{"category_id": "cmi0fwx69000d4l014eti2ocr", "neighborhood_id": "cmi0fwuph00024l01ovsse1ph"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:31:25.739
cmic46k9r000o14nf4b02i0mr	SEARCH_PERFORMED	{"category": "cleaning", "language": "he", "neighborhood": "merkaz"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:31:50.941
cmic47dom000p14nfwnq1cf86	BUSINESS_VIEWED	{"source": "direct", "category": "cleaning", "business_id": "cmic46ch2000n14nfx5jvofhu", "neighborhood": "merkaz"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:32:29.062
cmic47ubl000q14nf9ev7umpq	BUSINESS_VIEWED	{"source": "direct", "category": "cleaning", "business_id": "cmic46ch2000n14nfx5jvofhu", "neighborhood": "merkaz"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:32:50.625
cmic486m9000r14nffvg2gs12	BUSINESS_VIEWED	{"source": "direct", "category": "cleaning", "business_id": "cmic46ch2000n14nfx5jvofhu", "neighborhood": "merkaz"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:33:06.561
cmic48bbt000s14nfybdaxdif	BUSINESS_VIEWED	{"source": "direct", "category": "cleaning", "business_id": "cmic46ch2000n14nfx5jvofhu", "neighborhood": "merkaz"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:33:12.665
cmic495gk000t14nfkt4zhvaz	SEARCH_PERFORMED	{"category": "cleaning", "language": "he", "neighborhood": "darom"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:33:51.715
cmic4ay8m000u14nftfmnkdgf	SEARCH_PERFORMED	{"category": "cleaning", "language": "he", "neighborhood": "darom"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:35:15.671
cmic4b3p5000v14nf5vj27dnj	SEARCH_PERFORMED	{"category": "cleaning", "language": "he", "neighborhood": "darom"}	\N	\N	147.235.154.122	\N	\N	\N	\N	2025-11-23 19:35:22.745
cmictzj500001fp2s8m9yunbc	SEARCH_PERFORMED	{"category": "cleaning", "language": "he", "neighborhood": "tsafon"}	\N	\N	2.54.32.248	\N	\N	\N	\N	2025-11-24 07:34:12.899
cmictzr8z0002fp2sq2jg4qkm	SEARCH_PERFORMED	{"category": "cleaning", "language": "he", "neighborhood": "merkaz"}	\N	\N	2.54.32.248	\N	\N	\N	\N	2025-11-24 07:34:23.411
cmictzvns0003fp2srtwaxt5t	SEARCH_PERFORMED	{"category": "cleaning", "language": "he", "neighborhood": "mizrah-hair"}	\N	\N	2.54.32.248	\N	\N	\N	\N	2025-11-24 07:34:29.127
cmicu03r50004fp2s3plvh22t	SEARCH_PERFORMED	{"category": "cleaning", "language": "he", "neighborhood": "merkaz"}	\N	\N	2.54.32.248	\N	\N	\N	\N	2025-11-24 07:34:39.618
cmicu0ej60005fp2ssnnjt2ee	SEARCH_PERFORMED	{"category": "cleaning", "language": "he", "neighborhood": "mizrah-hair"}	\N	\N	2.54.32.248	\N	\N	\N	\N	2025-11-24 07:34:53.586
cmiddeish0002g71zjd8ayidr	BUSINESS_SUBMITTED	{"is_owner": true, "category_id": "cmi0fwvxv00094l01rm6apja1", "neighborhood_id": "cmi0fwuph00024l01ovsse1ph"}	\N	\N	84.108.134.242	\N	\N	\N	\N	2025-11-24 16:37:44.993
cmiddf6j00003g71ztb1n1aum	SEARCH_PERFORMED	{"category": "electricians", "language": "he", "neighborhood": "merkaz"}	\N	\N	84.108.134.242	\N	\N	\N	\N	2025-11-24 16:38:15.755
cmiddfe750004g71zzws248e8	BUSINESS_VIEWED	{"source": "direct", "category": "electricians", "business_id": "cmiddeii20001g71z6x5jl8dc", "neighborhood": "merkaz"}	\N	\N	84.108.134.242	\N	\N	\N	\N	2025-11-24 16:38:25.698
cmidmwkd60000p2knk4x2cynh	GEOLOCATION_DETECTED	{"neighborhood": "tsafon"}	\N	\N	2.54.32.248	\N	\N	\N	\N	2025-11-24 21:03:43.386
cmie7cvxx0000mx2y6uxa356q	SEARCH_PERFORMED	{"category": "electricians", "language": "he", "neighborhood": "merkaz"}	\N	\N	85.130.211.49	\N	\N	\N	\N	2025-11-25 06:36:17.204
cmie7usqh0001mx2yu16z9htu	SEARCH_PERFORMED	{"category": "plumbers", "language": "he", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 06:50:12.856
cmieck6zv0002mx2ynmrkizuo	BUSINESS_VIEWED	{"source": "direct", "category": "plumbers", "business_id": "cmi0fx1oa000u4l01rrjvrayj", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:01:56.203
cmieckdxz0003mx2ykixegti5	BUSINESS_VIEWED	{"source": "direct", "category": "plumbers", "business_id": "cmi0fx1oa000u4l01rrjvrayj", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:02:05.207
cmiecktcr0006mx2yuzvr7gp7	REVIEW_SUBMITTED	{"rating": 5, "business_id": "cmi0fx1oa000u4l01rrjvrayj"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:02:25.18
cmiecktlf0007mx2y31d20qvg	BUSINESS_VIEWED	{"source": "direct", "category": "plumbers", "business_id": "cmi0fx1oa000u4l01rrjvrayj", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:02:25.491
cmiecl1nk0008mx2y171ydggh	BUSINESS_VIEWED	{"source": "direct", "category": "electricians", "business_id": "cmi0fx0lw000o4l01crgbnh7z", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:02:35.937
cmieclj940009mx2yxxaplyju	BUSINESS_VIEWED	{"source": "direct", "category": "electricians", "business_id": "cmi0fx0lw000o4l01crgbnh7z", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:02:58.745
cmieclmw6000amx2ydyr1zfyr	BUSINESS_VIEWED	{"source": "direct", "category": "plumbers", "business_id": "cmi0fx1oa000u4l01rrjvrayj", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:03:03.461
cmieclupr000bmx2yx9phcuzj	BUSINESS_VIEWED	{"source": "direct", "category": "plumbers", "business_id": "cmi0fx1oa000u4l01rrjvrayj", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:03:13.6
cmiecm5hg000cmx2y2v6jnn5d	BUSINESS_VIEWED	{"source": "direct", "category": "electricians", "business_id": "cmi0fx0lw000o4l01crgbnh7z", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:03:27.556
cmiecm6n7000dmx2yrr5dea3l	BUSINESS_VIEWED	{"source": "direct", "category": "plumbers", "business_id": "cmi0fx1oa000u4l01rrjvrayj", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:03:29.059
cmiecmja7000emx2ywldfvhwz	BUSINESS_VIEWED	{"source": "direct", "category": "electricians", "business_id": "cmi0fx0lw000o4l01crgbnh7z", "neighborhood": "merkaz"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:03:45.439
cmiecnk4t000hmx2yzkl02rl6	BUSINESS_SUBMITTED	{"is_owner": true, "category_id": "cmi0fwwmw000b4l01qap16o9u", "neighborhood_id": "cmi0fwuph00024l01ovsse1ph"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:04:33.198
cmied1emp000kmx2yc89we5n4	BUSINESS_SUBMITTED	{"is_owner": true, "category_id": "cmi0fwwda000a4l01nukm03lz", "neighborhood_id": "cmi0fwuph00024l01ovsse1ph"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:15:19.249
cmiedhxrd0000eulkybf5n7g7	BUSINESS_SUBMITTED	{"is_owner": true, "category_id": "cmi0fwwda000a4l01nukm03lz", "is_resubmit": true, "neighborhood_id": "cmi0fwuph00024l01ovsse1ph"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 09:28:10.538
cmiefwghm00023umungcf1gxr	GEOLOCATION_DETECTED	{"neighborhood": "darom"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 10:35:27.227
cmiefwpmd00033umuq7jrhri9	GEOLOCATION_DETECTED	{"neighborhood": "darom"}	\N	\N	2.54.14.44	\N	\N	\N	\N	2025-11-25 10:35:39.061
\.


--
-- Data for Name: neighborhoods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.neighborhoods (id, city_id, name_he, name_ru, slug, description_he, description_ru, is_active, display_order, created_at, updated_at) FROM stdin;
cmi0fwuph00024l01ovsse1ph	cmi0fwu9v00004l01x4rv2u95	מרכז	Центр	merkaz	מרכז העיר נתניה	Центр города Нетания	t	1	2025-11-15 15:26:59.19	2025-11-23 08:06:53.068
cmi0fwv5100044l0124ncf0xh	cmi0fwu9v00004l01x4rv2u95	צפון	Север	tsafon	צפון נתניה	Северная Нетания	t	2	2025-11-15 15:26:59.749	2025-11-23 08:06:53.073
cmi0fwveo00064l019qtwges5	cmi0fwu9v00004l01x4rv2u95	דרום	Юг	darom	דרום נתניה	Южная Нетания	t	3	2025-11-15 15:27:00.097	2025-11-23 08:06:53.076
cmi0fwvo900084l010l303uux	cmi0fwu9v00004l01x4rv2u95	מזרח	Восток города	mizrah-hair	מזרח נתניה	Восточная Нетания	t	4	2025-11-15 15:27:00.442	2025-11-23 08:06:53.078
\.


--
-- Data for Name: oauth_states; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.oauth_states (id, state, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: pending_business_edits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pending_business_edits (id, business_id, owner_id, description_he, description_ru, phone, whatsapp_number, website_url, email, opening_hours_he, opening_hours_ru, address_he, address_ru, status, rejection_reason, reviewed_at, reviewed_by, created_at, updated_at) FROM stdin;
cmiedzz4k00013umu6brhuk34	cmiediih80002eulkpw64aoti	cmibnq7hh0001fu9aboanafr8	 asd asd ads  adasdf	asdadsasdasd	\N	0544345654	\N	\N	א׳: 08:00-17:00, ב׳: 08:00-17:00, ג׳: 08:00-17:00, ד׳: 08:00-17:00, ה׳: 08:00-17:00, ו׳: 08:00-14:00, ש׳: סגור	\N	\N	\N	REJECTED	cccc	2025-11-25 09:42:25.397	345287@gmail.com	2025-11-25 09:42:12.116	2025-11-25 09:42:25.401
\.


--
-- Data for Name: pending_businesses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pending_businesses (id, name, description, language, neighborhood_id, address, phone, whatsapp_number, website_url, email, opening_hours, category_id, submitter_name, submitter_email, submitter_phone, status, admin_notes, reviewed_at, created_at, updated_at, serves_all_city, subcategory_id, is_test, owner_id, rejection_reason, reviewed_by) FROM stdin;
cmi1q69pn00073188f55tju9n	E2E Test Business 1763298117581 - Both Contacts	\N	he	cmi0fwuph00024l01ovsse1ph	\N	050-1111111	050-2222222	\N	\N	\N	cmi0fwvxv00094l01rm6apja1	\N	\N	\N	REJECTED	\N	\N	2025-11-16 13:02:00.875	2025-11-22 21:20:01.781	f	\N	f	\N	\N	\N
cmi1q69ng00033188m9q4gnna	E2E Test Business 1763298117572 - All Fields	This is a comprehensive test of all form fields including optional ones.	he	cmi0fwuph00024l01ovsse1ph	רחוב הרצל 123, נתניה	050-3333333	050-4444444	https://example-test-business.com	\N	א-ה: 09:00-18:00, ו: 09:00-14:00	cmi0fwvxv00094l01rm6apja1	E2E Test Submitter	test@example.com	\N	REJECTED	\N	\N	2025-11-16 13:02:00.796	2025-11-22 21:20:04.316	t	\N	f	\N	\N	\N
cmi1q69mm00013188spvsob37	E2E Test Business 1763298117573 - Mandatory Only WhatsApp	\N	he	cmi0fwuph00024l01ovsse1ph	\N	\N	050-7654321	\N	\N	\N	cmi0fwvxv00094l01rm6apja1	\N	\N	\N	REJECTED	\N	\N	2025-11-16 13:02:00.766	2025-11-22 21:20:07.457	f	\N	f	\N	\N	\N
cmi1q69nj000531882xo0eoib	E2E Test Business 1763298117577 - Mandatory Only Phone	\N	he	cmi0fwuph00024l01ovsse1ph	\N	050-1234567	\N	\N	\N	\N	cmi0fwvxv00094l01rm6apja1	\N	\N	\N	REJECTED	\N	\N	2025-11-16 13:02:00.8	2025-11-22 21:20:09.2	f	\N	f	\N	\N	\N
cmibtcvsi00063mah6np48bx3	מיכאל טסט	שדגשדגשדגשדגשד שדג שגד שדג שגד שדג שגד	he	cmi0fwuph00024l01ovsse1ph	שד ויצמן 75	098626253	0544345287	https://kartis.info	\N	א׳: 08:00-17:00, ב׳: 08:00-17:00, ג׳: 08:00-17:00, ד׳: 08:00-17:00, ה׳: 08:00-17:00, ו׳: 08:00-14:00, ש׳: סגור	\N	\N	\N	\N	APPROVED	\N	\N	2025-11-23 14:28:50.035	2025-11-23 15:29:11.864	t	\N	f	\N	\N	\N
cmibvkzsb000714nfxs41z3ts	מיכאל טסט	שגשג שדג שד גשדג	he	cmi0fwuph00024l01ovsse1ph	\N	098656545	0544654456	\N	\N	א׳: 09:00-21:00, ב׳: 09:00-21:00, ג׳: 09:00-21:00, ד׳: 09:00-21:00, ה׳: 09:00-21:00, ו׳: 09:00-15:00, ש׳: סגור	\N	\N	\N	\N	APPROVED	\N	\N	2025-11-23 15:31:07.691	2025-11-23 15:31:42.404	t	\N	f	\N	\N	\N
cmic460qh000k14nf5xqozfxw	הלקוח המרוצה שירותי כח אדם בעמ	חברת ניקיון למשרדים, מוסדות ציבוריים, חברות גדולות, מגדלי מגורים 	he	cmi0fwuph00024l01ovsse1ph	סמילנסקי 10 נתניה	0532414062	0532414062	https://www.alakoah.co.il	\N	א׳: 08:00-17:00, ב׳: 08:00-17:00, ג׳: 08:00-17:00, ד׳: 08:00-17:00, ה׳: 08:00-17:00, ו׳: 08:00-14:00, ש׳: סגור	cmi0fwx69000d4l014eti2ocr	\N	\N	\N	APPROVED	\N	\N	2025-11-23 19:31:25.626	2025-11-23 19:31:40.847	t	\N	f	\N	\N	\N
cmied1eho000jmx2ymgmnwz00	 test9	 asd asd ads  adasdf	he	cmi0fwuph00024l01ovsse1ph	\N	\N	0544345654	\N	\N	א׳: 08:00-17:00, ב׳: 08:00-17:00, ג׳: 08:00-17:00, ד׳: 08:00-17:00, ה׳: 08:00-17:00, ו׳: 08:00-14:00, ש׳: סגור	cmi0fwwda000a4l01nukm03lz	\N	test@gmail.com	\N	APPROVED	\N	\N	2025-11-25 09:15:19.068	2025-11-25 09:28:37.407	t	\N	f	cmibnq7hh0001fu9aboanafr8	\N	\N
cmiecnk0p000gmx2ymek8vo8b	עסק טסט	שדגדגשגשגד	he	cmi0fwuph00024l01ovsse1ph	\N	0544345287	0544345287	\N	\N	א׳: 09:00-21:00, ב׳: 09:00-21:00, ג׳: 09:00-21:00, ד׳: 09:00-21:00, ה׳: 09:00-21:00, ו׳: 09:00-15:00, ש׳: סגור	cmi0fwwmw000b4l01qap16o9u	\N	345287@gmail.com	\N	REJECTED	\N	2025-11-25 09:28:53.478	2025-11-25 09:04:33.05	2025-11-25 09:28:53.479	t	\N	f	cmic5742200016f071wxsdkaw	d	345287@gmail.com
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, business_id, rating, comment_he, comment_ru, language, author_name, author_user_id, author_ip_hash, is_approved, is_flagged, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subcategories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subcategories (id, category_id, name_he, name_ru, slug, is_active, display_order, created_at, updated_at) FROM stdin;
cmiarhcj30001pwthg1ayubgi	cmi0fwz0w000k4l01zrcn85ld	ייפוי כוח מתמשך	Постоянная доверенность	power-of-attorney	t	0	2025-11-22 20:48:32.942	2025-11-22 20:49:40.448
cmiarhcna0003pwtho0m5ia8p	cmi0fwz0w000k4l01zrcn85ld	גבייה	Взыскание долгов	debt-collection	t	1	2025-11-22 20:48:33.094	2025-11-22 20:49:40.593
cmiarhcpb0005pwthtglfkcv8	cmi0fwz0w000k4l01zrcn85ld	חוזים	Договоры	contracts	t	2	2025-11-22 20:48:33.167	2025-11-22 20:49:40.665
cmiarhcro0007pwth23oorqpa	cmi0fwz0w000k4l01zrcn85ld	אזרחי	Гражданское право	civil-law	t	3	2025-11-22 20:48:33.252	2025-11-22 20:49:40.737
cmiarhctq0009pwthr941aowm	cmi0fwz0w000k4l01zrcn85ld	עורך דין נדל״ן	Юрист по недвижимости	real-estate-lawyer	t	4	2025-11-22 20:48:33.326	2025-11-22 20:49:41.072
cmiarit5m000bu4emu3ski4qm	cmiariluc0000dub7c682di4s	עיצוב שיער	Парикмахерские услуги	hair-styling	t	0	2025-11-22 20:49:41.146	2025-11-22 20:49:41.146
cmiarit7n000du4em88dvl5um	cmiariluc0000dub7c682di4s	קוסמטיקה	Косметика	cosmetics	t	1	2025-11-22 20:49:41.219	2025-11-22 20:49:41.219
cmiarit9m000fu4emxb5m38xr	cmiariluc0000dub7c682di4s	הדבקת ריסים	Наращивание ресниц	eyelash-extensions	t	2	2025-11-22 20:49:41.29	2025-11-22 20:49:41.29
cmiaritbk000hu4em36n1iz7h	cmiariluc0000dub7c682di4s	סדנאות איפור	Мастер-классы по макияжу	makeup-workshops	t	3	2025-11-22 20:49:41.36	2025-11-22 20:49:41.36
cmiaritdl000ju4emy4bxkzra	cmiariluc0000dub7c682di4s	מניקור ופדיקור	Маникюр и педикюр	manicure-pedicure	t	4	2025-11-22 20:49:41.433	2025-11-22 20:49:41.433
cmiaritfj000lu4emg4tg19sl	cmiarim0k0001dub79biv5tsv	מוניות	Такси	taxis	t	0	2025-11-22 20:49:41.503	2025-11-22 20:49:41.503
cmiarithh000nu4emllrrv853	cmiarim0k0001dub79biv5tsv	הסעות	Трансферы	shuttles	t	1	2025-11-22 20:49:41.573	2025-11-22 20:49:41.573
cmiaritjh000pu4emky2dlft9	cmiarim0k0001dub79biv5tsv	הובלות	Грузоперевозки	moving	t	2	2025-11-22 20:49:41.645	2025-11-22 20:49:41.645
cmiaritlh000ru4em062xnxu9	cmiarim0k0001dub79biv5tsv	זגגות רכב	Автостекла	car-glass	t	3	2025-11-22 20:49:41.717	2025-11-22 20:49:41.717
cmiaritnj000tu4em36bb9n4k	cmiarim0k0001dub79biv5tsv	מורה לנהיגה	Инструктор по вождению	driving-instructor	t	4	2025-11-22 20:49:41.792	2025-11-22 20:49:41.792
cmiaritph000vu4emiznds9qf	cmiarim4s0002dub7grr0xyya	אינסטלטורים	Сантехники	plumbers	t	0	2025-11-22 20:49:41.862	2025-11-22 20:49:41.862
cmiaritri000xu4emadjpsa7g	cmiarim4s0002dub7grr0xyya	הנדימן	Мастер на все руки	handyman	t	1	2025-11-22 20:49:41.935	2025-11-22 20:49:41.935
cmiarittg000zu4em98hzq9xu	cmiarim4s0002dub7grr0xyya	מנעולנים	Слесари	locksmiths	t	2	2025-11-22 20:49:42.004	2025-11-22 20:49:42.004
cmiaritve0011u4emvgwmzwe2	cmiarim4s0002dub7grr0xyya	מערכות מיגון לבית	Системы безопасности	home-security	t	3	2025-11-22 20:49:42.074	2025-11-22 20:49:42.074
cmiaritxc0013u4em2q3ukaxv	cmiarim4s0002dub7grr0xyya	ניקיון	Уборка	cleaning	t	4	2025-11-22 20:49:42.144	2025-11-22 20:49:42.144
cmiaritzc0015u4emvbakqi0a	cmiarim4s0002dub7grr0xyya	תכנון ועיצוב פנים	Дизайн интерьера	interior-design	t	5	2025-11-22 20:49:42.216	2025-11-22 20:49:42.216
cmiariu1b0017u4em5hajbd5c	cmiarim930003dub78f6z4f0f	טכנאי סלולר ותיקונים	Ремонт мобильных телефонов	mobile-repair	t	0	2025-11-22 20:49:42.287	2025-11-22 20:49:42.287
cmiariu3c0019u4embcubgyh6	cmiarim930003dub78f6z4f0f	מחשבים נייחים וניידים	Компьютеры и ноутбуки	computers	t	1	2025-11-22 20:49:42.36	2025-11-22 20:49:42.36
cmiariu58001bu4emxwymvr5h	cmiarimdc0004dub7lm5q3dg7	עיסוי	Массаж	massage	t	0	2025-11-22 20:49:42.429	2025-11-22 20:49:42.429
cmiariu76001du4em7ep4dedq	cmiarimdc0004dub7lm5q3dg7	פסיכותרפיה	Психотерапия	psychotherapy	t	1	2025-11-22 20:49:42.498	2025-11-22 20:49:42.498
cmiariu94001fu4emv9wkt9z0	cmiarimdc0004dub7lm5q3dg7	טיפול רגשי ופסיכותרפיה	Эмоциональная терапия	emotional-therapy	t	2	2025-11-22 20:49:42.568	2025-11-22 20:49:42.568
cmiariub7001hu4emuylradqi	cmiarimdc0004dub7lm5q3dg7	ליווי רגשי ונפשי	Эмоциональная поддержка	emotional-support	t	3	2025-11-22 20:49:42.643	2025-11-22 20:49:42.643
cmiariud5001ju4emk8ev5ssf	cmiarimdc0004dub7lm5q3dg7	נטורופתיה	Натуропатия	naturopathy	t	4	2025-11-22 20:49:42.714	2025-11-22 20:49:42.714
cmiariuf3001lu4emkplfm4rw	cmiarimdc0004dub7lm5q3dg7	מאמני כושר	Фитнес тренеры	fitness-trainers	t	5	2025-11-22 20:49:42.783	2025-11-22 20:49:42.783
cmiariuh0001nu4em6doy8p26	cmiarimhf0005dub7ye8elgne	לוכד נחשים	Ловец змей	snake-catcher	t	0	2025-11-22 20:49:42.853	2025-11-22 20:49:42.853
cmiariuiz001pu4emfxfh9zv7	cmiarimll0006dub7s00tgx8e	שמלות כלה	Свадебные платья	wedding-dresses	t	0	2025-11-22 20:49:42.924	2025-11-22 20:49:42.924
cmiariuky001ru4emi0kkz0mg	cmiarimll0006dub7s00tgx8e	שמלות ערב	Вечерние платья	evening-dresses	t	1	2025-11-22 20:49:42.995	2025-11-22 20:49:42.995
cmiariumw001tu4emjcilbk6a	cmiarimll0006dub7s00tgx8e	תיקונים	Ремонт одежды	clothing-repairs	t	2	2025-11-22 20:49:43.065	2025-11-22 20:49:43.065
cmiariuov001vu4emvwujh2om	cmiarimll0006dub7s00tgx8e	וילונות וטקסטיל לבית	Шторы и домашний текстиль	curtains-textiles	t	3	2025-11-22 20:49:43.135	2025-11-22 20:49:43.135
cmiariuqv001xu4emu8hzdil1	cmiarimpq0007dub7q2ce8apb	תכנון פנסיוני	Пенсионное планирование	pension-planning	t	0	2025-11-22 20:49:43.207	2025-11-22 20:49:43.207
cmiariust001zu4emihd3nmqa	cmiarimtv0008dub7xsg6uwif	סדנאות בישול ואפייה	Мастер-классы по кулинарии	cooking-workshops	t	0	2025-11-22 20:49:43.277	2025-11-22 20:49:43.277
cmiariuur0021u4emkvlxck84	cmiarimtv0008dub7xsg6uwif	עיצוב עוגות ומתוקים	Дизайн тортов и сладостей	cake-design	t	1	2025-11-22 20:49:43.347	2025-11-22 20:49:43.347
cmiariuwp0023u4emjknbyuzd	cmiarimtv0008dub7xsg6uwif	עיצוב בלונים ופרחים	Оформление шарами и цветами	balloon-flower-design	t	2	2025-11-22 20:49:43.417	2025-11-22 20:49:43.417
cmiariuyr0025u4emafjgspme	cmiarimtv0008dub7xsg6uwif	הפעלות לילדים	Детские мероприятия	kids-activities	t	3	2025-11-22 20:49:43.491	2025-11-22 20:49:43.491
cmiariv0p0027u4emdp5617m6	cmiarimtv0008dub7xsg6uwif	צלמים	Фотографы	photographers	t	4	2025-11-22 20:49:43.561	2025-11-22 20:49:43.561
cmiariv2n0029u4em48p54lr0	cmiarimtv0008dub7xsg6uwif	אוכל ביתי מוכן	Домашняя еда	home-food	t	5	2025-11-22 20:49:43.631	2025-11-22 20:49:43.631
cmiariv4l002bu4em2h8ytbh9	cmiarimxz0009dub7awsly0i9	שירותי משרד	Офисные услуги	office-services	t	0	2025-11-22 20:49:43.701	2025-11-22 20:49:43.701
cmiariv6n002du4em3jgu5b3o	cmiarimxz0009dub7awsly0i9	בק אופיס	Бэк-офис	back-office	t	1	2025-11-22 20:49:43.776	2025-11-22 20:49:43.776
cmiariv8l002fu4emmx5d3qci	cmiarimxz0009dub7awsly0i9	מכבסה / שירותי כביסה	Прачечная	laundry	t	2	2025-11-22 20:49:43.846	2025-11-22 20:49:43.846
cmiarivak002hu4emvciyfobv	cmiarimxz0009dub7awsly0i9	תחזוקת משרדים	Обслуживание офисов	office-maintenance	t	3	2025-11-22 20:49:43.917	2025-11-22 20:49:43.917
cmiarivcs002ju4emr35vd6gm	cmiarimxz0009dub7awsly0i9	מערכות מיגון	Системы безопасности	security-systems	t	4	2025-11-22 20:49:43.997	2025-11-22 20:49:43.997
cmiarivkw002lu4emmsxel2hv	cmiarin3v000adub732xe8258	מורים פרטיים	Репетиторы	private-teachers	t	0	2025-11-22 20:49:44.288	2025-11-22 20:49:44.288
cmiarivna002nu4embkiuhvqh	cmiarin3v000adub732xe8258	בייביסיטר	Няня	babysitter	t	1	2025-11-22 20:49:44.374	2025-11-22 20:49:44.374
cmiarivq8002pu4empo4ai3uv	cmiarin3v000adub732xe8258	חוגים	Кружки	clubs	t	2	2025-11-22 20:49:44.48	2025-11-22 20:49:44.48
cmiarivs6002ru4emzh49x9uu	cmiarinac000bdub7uh2nwx6l	בניית אתרים	Создание сайтов	website-building	t	0	2025-11-22 20:49:44.551	2025-11-22 20:49:44.551
cmiarivu2002tu4emblm1pat3	cmiarinfh000cdub7argay7hr	ייעוץ נדל״ן	Консультации по недвижимости	real-estate-consulting	t	0	2025-11-22 20:49:44.618	2025-11-22 20:49:44.618
cmiarivvy002vu4emgv7o68q9	cmiarinfh000cdub7argay7hr	סוכני נדל״ן	Агенты по недвижимости	real-estate-agents	t	1	2025-11-22 20:49:44.686	2025-11-22 20:49:44.686
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_settings admin_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: business_owners business_owners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_owners
    ADD CONSTRAINT business_owners_pkey PRIMARY KEY (id);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: category_requests category_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category_requests
    ADD CONSTRAINT category_requests_pkey PRIMARY KEY (id);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: neighborhoods neighborhoods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_pkey PRIMARY KEY (id);


--
-- Name: oauth_states oauth_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_states
    ADD CONSTRAINT oauth_states_pkey PRIMARY KEY (id);


--
-- Name: pending_business_edits pending_business_edits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_business_edits
    ADD CONSTRAINT pending_business_edits_pkey PRIMARY KEY (id);


--
-- Name: pending_businesses pending_businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_businesses
    ADD CONSTRAINT pending_businesses_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: subcategories subcategories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_pkey PRIMARY KEY (id);


--
-- Name: admin_settings_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_settings_key_key ON public.admin_settings USING btree (key);


--
-- Name: admin_users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);


--
-- Name: admin_users_google_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_users_google_id_idx ON public.admin_users USING btree (google_id);


--
-- Name: admin_users_google_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_users_google_id_key ON public.admin_users USING btree (google_id);


--
-- Name: business_owners_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_owners_email_idx ON public.business_owners USING btree (email);


--
-- Name: business_owners_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX business_owners_email_key ON public.business_owners USING btree (email);


--
-- Name: business_owners_google_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX business_owners_google_id_idx ON public.business_owners USING btree (google_id);


--
-- Name: business_owners_google_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX business_owners_google_id_key ON public.business_owners USING btree (google_id);


--
-- Name: businesses_category_id_neighborhood_id_is_visible_is_pinned_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX businesses_category_id_neighborhood_id_is_visible_is_pinned_idx ON public.businesses USING btree (category_id, neighborhood_id, is_visible, is_pinned);


--
-- Name: businesses_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX businesses_deleted_at_idx ON public.businesses USING btree (deleted_at);


--
-- Name: businesses_is_pinned_pinned_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX businesses_is_pinned_pinned_order_idx ON public.businesses USING btree (is_pinned, pinned_order);


--
-- Name: businesses_neighborhood_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX businesses_neighborhood_id_idx ON public.businesses USING btree (neighborhood_id);


--
-- Name: businesses_slug_he_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX businesses_slug_he_idx ON public.businesses USING btree (slug_he);


--
-- Name: businesses_slug_he_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX businesses_slug_he_key ON public.businesses USING btree (slug_he);


--
-- Name: businesses_slug_ru_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX businesses_slug_ru_idx ON public.businesses USING btree (slug_ru);


--
-- Name: businesses_slug_ru_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX businesses_slug_ru_key ON public.businesses USING btree (slug_ru);


--
-- Name: categories_is_active_is_popular_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_is_active_is_popular_idx ON public.categories USING btree (is_active, is_popular);


--
-- Name: categories_name_he_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name_he_key ON public.categories USING btree (name_he);


--
-- Name: categories_name_ru_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name_ru_key ON public.categories USING btree (name_ru);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: category_requests_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX category_requests_status_created_at_idx ON public.category_requests USING btree (status, created_at);


--
-- Name: cities_name_he_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cities_name_he_key ON public.cities USING btree (name_he);


--
-- Name: cities_name_ru_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cities_name_ru_key ON public.cities USING btree (name_ru);


--
-- Name: cities_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cities_slug_key ON public.cities USING btree (slug);


--
-- Name: events_business_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_business_id_idx ON public.events USING btree (business_id);


--
-- Name: events_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_created_at_idx ON public.events USING btree (created_at);


--
-- Name: events_type_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_type_created_at_idx ON public.events USING btree (type, created_at);


--
-- Name: neighborhoods_city_id_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX neighborhoods_city_id_is_active_idx ON public.neighborhoods USING btree (city_id, is_active);


--
-- Name: neighborhoods_city_id_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX neighborhoods_city_id_slug_key ON public.neighborhoods USING btree (city_id, slug);


--
-- Name: oauth_states_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX oauth_states_expires_at_idx ON public.oauth_states USING btree (expires_at);


--
-- Name: oauth_states_state_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX oauth_states_state_idx ON public.oauth_states USING btree (state);


--
-- Name: oauth_states_state_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX oauth_states_state_key ON public.oauth_states USING btree (state);


--
-- Name: pending_business_edits_business_id_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pending_business_edits_business_id_status_idx ON public.pending_business_edits USING btree (business_id, status);


--
-- Name: pending_business_edits_owner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pending_business_edits_owner_id_idx ON public.pending_business_edits USING btree (owner_id);


--
-- Name: pending_business_edits_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pending_business_edits_status_created_at_idx ON public.pending_business_edits USING btree (status, created_at);


--
-- Name: pending_businesses_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pending_businesses_category_id_idx ON public.pending_businesses USING btree (category_id);


--
-- Name: pending_businesses_owner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pending_businesses_owner_id_idx ON public.pending_businesses USING btree (owner_id);


--
-- Name: pending_businesses_status_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pending_businesses_status_created_at_idx ON public.pending_businesses USING btree (status, created_at);


--
-- Name: reviews_business_id_is_approved_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_business_id_is_approved_created_at_idx ON public.reviews USING btree (business_id, is_approved, created_at);


--
-- Name: reviews_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_created_at_idx ON public.reviews USING btree (created_at);


--
-- Name: subcategories_category_id_is_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subcategories_category_id_is_active_idx ON public.subcategories USING btree (category_id, is_active);


--
-- Name: subcategories_category_id_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX subcategories_category_id_slug_key ON public.subcategories USING btree (category_id, slug);


--
-- Name: businesses businesses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: businesses businesses_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: businesses businesses_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: businesses businesses_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.business_owners(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: businesses businesses_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: neighborhoods neighborhoods_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pending_business_edits pending_business_edits_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_business_edits
    ADD CONSTRAINT pending_business_edits_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pending_business_edits pending_business_edits_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_business_edits
    ADD CONSTRAINT pending_business_edits_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.business_owners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pending_businesses pending_businesses_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_businesses
    ADD CONSTRAINT pending_businesses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: pending_businesses pending_businesses_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_businesses
    ADD CONSTRAINT pending_businesses_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pending_businesses pending_businesses_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_businesses
    ADD CONSTRAINT pending_businesses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.business_owners(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: pending_businesses pending_businesses_subcategory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_businesses
    ADD CONSTRAINT pending_businesses_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: subcategories subcategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subcategories
    ADD CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


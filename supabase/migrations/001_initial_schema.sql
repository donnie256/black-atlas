-- Enable PostGIS for geo queries (available on Supabase by default)
create extension if not exists "postgis";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

create type business_category as enum (
  'restaurant',
  'barbershop',
  'salon',
  'thrift',
  'retail',
  'health',
  'fitness',
  'entertainment',
  'professional_services',
  'art_culture',
  'faith',
  'education',
  'other'
);

create type diaspora_origin as enum (
  'african_american',
  'african',
  'caribbean',
  'pan_african'
);

create type listing_status as enum (
  'pending',
  'approved',
  'rejected',
  'archived'
);

create type event_status as enum (
  'upcoming',
  'cancelled',
  'past'
);

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────

create table categories (
  id          serial primary key,
  slug        text unique not null,
  name        text not null,
  icon        text,                        -- lucide icon name
  display_order int default 0
);

insert into categories (slug, name, icon, display_order) values
  ('restaurant',            'Restaurants',            'utensils',         1),
  ('barbershop',            'Barbershops',            'scissors',         2),
  ('salon',                 'Salons',                 'sparkles',         3),
  ('thrift',                'Thrift Stores',          'shirt',            4),
  ('retail',                'Retail',                 'shopping-bag',     5),
  ('health',                'Health & Wellness',      'heart-pulse',      6),
  ('fitness',               'Fitness',                'dumbbell',         7),
  ('entertainment',         'Entertainment',          'music',            8),
  ('professional_services', 'Professional Services',  'briefcase',        9),
  ('art_culture',           'Art & Culture',          'palette',         10),
  ('faith',                 'Faith & Spirituality',   'building',        11),
  ('education',             'Education',              'book-open',       12),
  ('other',                 'Other',                  'circle',          13);

-- ─── NEIGHBORHOODS ───────────────────────────────────────────────────────────

create table neighborhoods (
  id    serial primary key,
  slug  text unique not null,
  name  text not null
);

insert into neighborhoods (slug, name) values
  ('five-points',       'Five Points'),
  ('aurora',            'Aurora'),
  ('montbello',         'Montbello'),
  ('park-hill',         'Park Hill'),
  ('cole',              'Cole'),
  ('whittier',          'Whittier'),
  ('clayton',           'Clayton'),
  ('globeville',        'Globeville'),
  ('downtown',          'Downtown'),
  ('other',             'Other');

-- ─── BUSINESSES ──────────────────────────────────────────────────────────────

create table businesses (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  description       text,

  -- Classification
  category          business_category not null,
  subcategory       text,                          -- e.g. "Soul Food", "Afrobeats DJ"
  diaspora_origin   diaspora_origin[],             -- can be multiple

  -- Location
  address           text,
  city              text default 'Denver',
  state             text default 'CO',
  zip               text,
  neighborhood_id   int references neighborhoods(id),
  location          geography(point, 4326),        -- lat/lng for geo queries

  -- Contact
  phone             text,
  email             text,
  website           text,
  instagram         text,
  facebook          text,

  -- Hours stored as JSONB: { "mon": "9am-6pm", "tue": "9am-6pm", ... }
  hours             jsonb,

  -- Media
  cover_image_url   text,
  logo_url          text,

  -- Status & metadata
  status            listing_status default 'pending',
  is_verified       boolean default false,
  is_featured       boolean default false,

  -- Data provenance
  google_place_id   text unique,
  yelp_id           text unique,
  submitted_by      uuid references auth.users(id) on delete set null,
  claimed_by        uuid references auth.users(id) on delete set null,

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Full-text search index
create index businesses_fts_idx on businesses
  using gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(subcategory, '')));

-- Geo index
create index businesses_location_idx on businesses using gist(location);

-- Status index (most queries filter by approved)
create index businesses_status_idx on businesses(status);

-- Category index
create index businesses_category_idx on businesses(category);

-- ─── BUSINESS IMAGES ─────────────────────────────────────────────────────────

create table business_images (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  url           text not null,
  alt_text      text,
  display_order int default 0,
  created_at    timestamptz default now()
);

-- ─── EVENTS ──────────────────────────────────────────────────────────────────

create table events (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title             text not null,
  description       text,

  -- Optional link to a business host
  business_id       uuid references businesses(id) on delete set null,

  -- Time
  start_datetime    timestamptz not null,
  end_datetime      timestamptz,
  timezone          text default 'America/Denver',

  -- Location (can differ from business location)
  venue_name        text,
  address           text,
  city              text default 'Denver',
  state             text default 'CO',
  location          geography(point, 4326),

  -- Details
  is_free           boolean default true,
  ticket_url        text,
  ticket_price_min  numeric(8,2),
  ticket_price_max  numeric(8,2),
  cover_image_url   text,
  category          text,                          -- "Music", "Food", "Art", etc.
  tags              text[],

  -- Data provenance
  eventbrite_id     text unique,
  status            event_status default 'upcoming',
  submitted_by      uuid references auth.users(id) on delete set null,

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index events_start_datetime_idx on events(start_datetime);
create index events_status_idx on events(status);
create index events_location_idx on events using gist(location);
create index events_fts_idx on events
  using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- ─── SUBMISSIONS (public business submission form) ────────────────────────────

create table submissions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        business_category not null,
  address         text,
  phone           text,
  website         text,
  instagram       text,
  description     text,
  submitter_name  text,
  submitter_email text,
  notes           text,                            -- anything else they want to share
  status          listing_status default 'pending',
  reviewed_at     timestamptz,
  business_id     uuid references businesses(id),  -- set when converted to a listing
  created_at      timestamptz default now()
);

-- ─── PROFILES (extends auth.users) ──────────────────────────────────────────

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url  text,
  is_admin    boolean default false,
  created_at  timestamptz default now()
);

-- ─── SAVED BUSINESSES (bookmarks) ────────────────────────────────────────────

create table saved_businesses (
  user_id     uuid references auth.users(id) on delete cascade,
  business_id uuid references businesses(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (user_id, business_id)
);

-- ─── AUTO-UPDATE updated_at ──────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger businesses_updated_at
  before update on businesses
  for each row execute function update_updated_at();

create trigger events_updated_at
  before update on events
  for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

alter table businesses enable row level security;
alter table events enable row level security;
alter table submissions enable row level security;
alter table profiles enable row level security;
alter table saved_businesses enable row level security;
alter table business_images enable row level security;

-- Public can read approved businesses and upcoming events
create policy "public read approved businesses"
  on businesses for select
  using (status = 'approved');

create policy "public read upcoming events"
  on events for select
  using (status = 'upcoming');

create policy "public read categories"
  on categories for select
  using (true);

create policy "public read neighborhoods"
  on neighborhoods for select
  using (true);

-- Anyone can submit a business
create policy "anyone can submit"
  on submissions for insert
  with check (true);

-- Users can read their own submissions
create policy "users read own submissions"
  on submissions for select
  using (submitter_email = (select email from auth.users where id = auth.uid()));

-- Users manage their own saved businesses
create policy "users manage saved businesses"
  on saved_businesses for all
  using (user_id = auth.uid());

-- Users read their own profile
create policy "users read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "users update own profile"
  on profiles for update
  using (id = auth.uid());

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

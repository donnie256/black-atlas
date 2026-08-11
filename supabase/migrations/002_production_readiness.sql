-- Event moderation, submission safety, and public image access.

alter type event_status add value if not exists 'pending';
alter type event_status add value if not exists 'rejected';

alter table businesses
  add column if not exists source text default 'community',
  add column if not exists verified_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists review_notes text;

alter table events
  add column if not exists source text default 'community',
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists review_notes text;

alter table submissions
  add column if not exists source text default 'community',
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists review_notes text;

alter table businesses
  add column if not exists name_description_subcategory tsvector
  generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(subcategory, ''))
  ) stored;

create index if not exists businesses_search_vector_idx
  on businesses using gin(name_description_subcategory);

create table if not exists submission_rate_limits (
  id uuid primary key default gen_random_uuid(),
  identifier_hash text not null,
  form_type text not null check (form_type in ('business', 'event')),
  attempt_count int not null default 1,
  window_start timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (identifier_hash, form_type, window_start)
);

create index if not exists submission_rate_limits_lookup_idx
  on submission_rate_limits(identifier_hash, form_type, window_start desc);

alter table submission_rate_limits enable row level security;

drop policy if exists "public insert pending events" on events;
create policy "public insert pending events"
  on events for insert
  with check (status::text = 'pending');

drop policy if exists "public read approved business images" on business_images;
create policy "public read approved business images"
  on business_images for select
  using (
    exists (
      select 1
      from businesses
      where businesses.id = business_images.business_id
        and businesses.status = 'approved'
    )
  );

drop policy if exists "public read categories" on categories;
alter table categories enable row level security;
create policy "public read categories"
  on categories for select
  using (true);

drop policy if exists "public read neighborhoods" on neighborhoods;
alter table neighborhoods enable row level security;
create policy "public read neighborhoods"
  on neighborhoods for select
  using (true);

drop trigger if exists submission_rate_limits_updated_at on submission_rate_limits;
create trigger submission_rate_limits_updated_at
  before update on submission_rate_limits
  for each row execute function update_updated_at();

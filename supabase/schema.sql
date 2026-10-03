-- AgentReady schema — paste the whole file into Supabase Dashboard → SQL Editor → Run.
-- Safe to re-run: drops and recreates everything (demo data only).

create extension if not exists vector with schema extensions;
create extension if not exists postgis with schema extensions;

drop table if exists public.reservations cascade;
drop table if exists public.agent_queries cascade;
drop table if exists public.menu_items cascade;
drop table if exists public.businesses cascade;

-- ───────────────────────── businesses ─────────────────────────
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  category text not null,
  subcategory text,

  address text not null,
  neighborhood text,
  city text not null,
  state text,
  country text not null default 'MX',
  lat double precision,
  lng double precision,
  coordinates extensions.geography(point, 4326),
  timezone text not null default 'America/Monterrey',

  phone text,
  whatsapp text,
  email text,
  website text,
  instagram text,

  -- {"monday": {"open":"09:00","close":"18:00"}, "sunday": null}; close < open = past midnight
  hours jsonb not null default '{}',
  capabilities text[] not null default '{}',
  price_range text check (price_range in ('$', '$$', '$$$', '$$$$')),
  currency text not null default 'MXN',

  has_agent boolean not null default false,
  agent_capabilities text[] not null default '{}',
  capacity integer not null default 0,        -- seats/slots per hour; 0 = not bookable
  max_party_size integer not null default 1,

  policies jsonb not null default '{}',
  faq jsonb not null default '[]',
  payment_methods text[] not null default '{}',

  rating numeric(2,1),
  verified boolean not null default false,
  source text not null default 'bot247',

  embedding extensions.vector(1536),
  fts tsvector generated always as (
    to_tsvector('simple',
      coalesce(name, '') || ' ' || coalesce(description, '') || ' ' ||
      coalesce(category, '') || ' ' || coalesce(subcategory, '') || ' ' ||
      coalesce(neighborhood, ''))
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.businesses_before_write()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  if new.lat is not null and new.lng is not null then
    new.coordinates := st_setsrid(st_makepoint(new.lng, new.lat), 4326)::geography;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger businesses_before_write
before insert or update on public.businesses
for each row execute function public.businesses_before_write();

create index businesses_category_idx on public.businesses (category);
create index businesses_capabilities_idx on public.businesses using gin (capabilities);
create index businesses_geo_idx on public.businesses using gist (coordinates);
create index businesses_fts_idx on public.businesses using gin (fts);
-- HNSW (not ivfflat): works on an empty/small table, no training step, no recall cliff.
create index businesses_embedding_idx on public.businesses
  using hnsw (embedding extensions.vector_cosine_ops);

-- ───────────────────────── menu_items ─────────────────────────
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category text not null,
  name text not null,
  description text,
  price numeric(10,2),
  currency text not null default 'MXN',
  dietary text[] not null default '{}',
  duration_minutes integer,
  requires_appointment boolean not null default false,
  popular boolean not null default false,
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index menu_items_business_idx on public.menu_items (business_id, sort_order);
create index menu_items_dietary_idx on public.menu_items using gin (dietary);

-- ───────────────────────── agent_queries (live log) ─────────────────────────
create table public.agent_queries (
  id uuid primary key default gen_random_uuid(),
  tool_name text not null,
  query_params jsonb,
  results_count integer not null default 0,
  response_time_ms integer,
  agent_identifier text,
  success boolean not null default true,
  error text,
  created_at timestamptz not null default now()
);
create index agent_queries_created_idx on public.agent_queries (created_at desc);

-- ───────────────────────── reservations (actions taken by agents) ─────────────────────────
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  confirmation_code text unique not null,
  action text not null,                 -- make_reservation | book_appointment | place_order | request_quote
  status text not null default 'confirmed',
  date date,
  time text,                            -- HH:MM local time
  party_size integer,
  customer_name text,
  details jsonb not null default '{}',
  total_mxn numeric(10,2),
  payment_url text,
  agent_identifier text,
  created_at timestamptz not null default now()
);
create index reservations_slot_idx on public.reservations (business_id, date);

-- ───────────────────────── RLS: public read (demo data, no PII) ─────────────────────────
-- Server code uses the service-role key (bypasses RLS). Browser uses anon key → read-only.
alter table public.businesses enable row level security;
alter table public.menu_items enable row level security;
alter table public.agent_queries enable row level security;
alter table public.reservations enable row level security;

create policy "public read businesses" on public.businesses for select to anon, authenticated using (true);
create policy "public read menu" on public.menu_items for select to anon, authenticated using (true);
create policy "public read queries" on public.agent_queries for select to anon, authenticated using (true);
create policy "public read reservations" on public.reservations for select to anon, authenticated using (true);

-- ───────────────────────── Realtime ─────────────────────────
alter publication supabase_realtime add table public.agent_queries;
alter publication supabase_realtime add table public.reservations;

-- ───────────────────────── Hybrid search RPC ─────────────────────────
-- One round trip: semantic (pgvector) + keyword (tsvector) + geo (PostGIS) + hard filters.
-- query_embedding may be NULL (embedding provider down) → keyword-only fallback.
create or replace function public.search_businesses(
  query_embedding extensions.vector(1536) default null,
  query_text text default null,
  p_city text default null,
  p_category text default null,
  p_capabilities text[] default null,
  p_price_range text default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_radius_km double precision default 10,
  p_limit integer default 10
)
returns table (
  id uuid, slug text, name text, category text, subcategory text, description text,
  address text, neighborhood text, city text, price_range text, rating numeric,
  capabilities text[], has_agent boolean, agent_capabilities text[], hours jsonb,
  lat double precision, lng double precision, phone text,
  similarity double precision, text_rank double precision, distance_km double precision,
  score double precision
)
language sql
stable
set search_path = public, extensions
as $$
  with q as (
    select
      case when p_lat is not null and p_lng is not null
        then st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography end as pt,
      case when coalesce(trim(query_text), '') <> ''
        then websearch_to_tsquery('simple', query_text) end as tsq
  ),
  scored as (
    select
      b.*,
      case when query_embedding is not null and b.embedding is not null
        then 1 - (b.embedding <=> query_embedding) end as sim,
      coalesce(ts_rank(b.fts, q.tsq), 0)::double precision as trank,
      case when q.pt is not null then st_distance(b.coordinates, q.pt) / 1000.0 end as dist,
      q.pt as pt,
      q.tsq as tsq
    from public.businesses b, q
    where (p_city is null or b.city ilike '%' || p_city || '%' or b.neighborhood ilike '%' || p_city || '%')
      and (p_category is null or b.category ilike '%' || p_category || '%' or b.subcategory ilike '%' || p_category || '%')
      and (p_capabilities is null or cardinality(p_capabilities) = 0 or b.capabilities @> p_capabilities)
      and (p_price_range is null or b.price_range = p_price_range)
      and (q.pt is null or st_dwithin(b.coordinates, q.pt, p_radius_km * 1000))
  )
  select
    s.id, s.slug, s.name, s.category, s.subcategory, s.description,
    s.address, s.neighborhood, s.city, s.price_range, s.rating,
    s.capabilities, s.has_agent, s.agent_capabilities, s.hours,
    s.lat, s.lng, s.phone,
    s.sim, s.trank, s.dist,
    coalesce(s.sim, 0)
      + 0.3 * least(s.trank, 1)
      - case when s.dist is not null then 0.005 * s.dist else 0 end
      + 0.01 * coalesce(s.rating, 0) as score
  from scored s
  where query_embedding is not null       -- semantic mode: rank everything that passed filters
     or s.tsq is null                     -- no text at all: pure filter/geo browse
     or s.fts @@ s.tsq                    -- keyword fallback mode
     or s.name ilike '%' || query_text || '%'
  order by score desc
  limit least(greatest(p_limit, 1), 50);
$$;

grant execute on function public.search_businesses to anon, authenticated, service_role;

-- Category/capability vocabulary for agents (list_categories tool)
create or replace function public.business_vocabulary()
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'categories', (select jsonb_object_agg(category, n) from (select category, count(*) n from businesses group by category) c),
    'capabilities', (select jsonb_object_agg(cap, n) from (select unnest(capabilities) cap, count(*) n from businesses group by cap) k),
    'cities', (select jsonb_agg(distinct city) from businesses),
    'total_businesses', (select count(*) from businesses),
    'with_agent', (select count(*) from businesses where has_agent)
  );
$$;

grant execute on function public.business_vocabulary to anon, authenticated, service_role;

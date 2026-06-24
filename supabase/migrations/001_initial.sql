-- ============================================================
-- Value Ladder Builder — Initial Schema
-- ============================================================

-- Profiles table (mirrors auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  is_subscriber boolean default false,
  subscribed_at timestamptz,
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Sessions table
create table if not exists public.sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete cascade,
  title           text,
  current_step    int default 1,
  is_complete     boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),

  -- product profile
  product_name    text,
  product_type    text check (product_type in ('digital', 'fisik', 'jasa')),
  price_idr       bigint,
  target_buyer    text,
  is_active       boolean default false,
  input_source    text check (input_source in ('form', 'pdf')),
  pdf_url         text,
  industry        text,

  -- AI outputs
  vlms            text,
  current_tier    int check (current_tier between 1 and 4),
  current_tier_reason text,
  priority_tier   int check (priority_tier between 1 and 4),
  executive_summary text
);

-- Tier entries table
create table if not exists public.tier_entries (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid references public.sessions(id) on delete cascade,
  tier_number     int not null check (tier_number between 1 and 4),
  status          text check (status in ('existing', 'planned', 'empty')),
  product_ideas   jsonb default '[]',
  selected_idea   text,
  funnel_type     text check (funnel_type in ('lead', 'unboxing', 'presentation', 'application')),
  funnel_steps    jsonb default '[]',
  traffic_recs    jsonb default '[]',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (session_id, tier_number)
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sessions_updated_at
  before update on public.sessions
  for each row execute procedure public.set_updated_at();

create trigger tier_entries_updated_at
  before update on public.tier_entries
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.tier_entries enable row level security;

-- profiles: user hanya bisa akses profil sendiri
create policy "profiles: self only"
  on public.profiles for all
  using (id = auth.uid());

-- sessions: user hanya bisa akses sesi sendiri
create policy "sessions: self only"
  on public.sessions for all
  using (user_id = auth.uid());

-- tier_entries: akses via session milik user sendiri
create policy "tier_entries: via own session"
  on public.tier_entries for all
  using (
    session_id in (
      select id from public.sessions where user_id = auth.uid()
    )
  );

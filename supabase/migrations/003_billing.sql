-- ============================================================
-- Migration 003: Sistem Billing / Subscription
-- Pola: manual transfer → upload bukti → admin verifikasi
-- ============================================================

-- Tambah kolom billing ke profiles
alter table public.profiles
  add column if not exists tier text not null default 'free'
    check (tier in ('free', 'subscriber', 'beta')),
  add column if not exists account_status text not null default 'active'
    check (account_status in ('active', 'suspended')),
  add column if not exists activated_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin')),
  add column if not exists welcome_seen boolean not null default false;

-- Migrasi: user yang sudah is_subscriber=true → tier subscriber
update public.profiles set tier = 'subscriber', activated_at = now() where is_subscriber = true;

-- Tabel order pembayaran
create table if not exists public.payment_orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  plan            text not null default 'subscriber' check (plan in ('subscriber')),
  amount          integer not null default 99000,
  unique_code     text not null unique,
  status          text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected', 'expired')),
  proof_url       text,
  sender_name     text,
  sender_bank     text,
  transfer_date   text,
  admin_notes     text,
  created_at      timestamptz not null default now(),
  verified_at     timestamptz,
  rejected_at     timestamptz
);

alter table public.payment_orders enable row level security;

-- RLS: user hanya bisa lihat & update order sendiri
create policy "payment_orders: user can view own"
  on public.payment_orders for select
  using (auth.uid() = user_id);

create policy "payment_orders: user can insert own"
  on public.payment_orders for insert
  with check (auth.uid() = user_id);

create policy "payment_orders: user can update own"
  on public.payment_orders for update
  using (auth.uid() = user_id);

-- Admin dapat akses semua order (via service role pada admin routes)

-- Index
create index if not exists payment_orders_user_id_idx on public.payment_orders (user_id, created_at desc);
create index if not exists payment_orders_status_idx on public.payment_orders (status, created_at desc);

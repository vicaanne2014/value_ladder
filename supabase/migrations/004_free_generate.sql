-- ============================================================
-- Migration 004: Free generate tracking
-- Free user dapat 1x sesi generate AI gratis
-- Setelah dipakai, harus subscribe atau pakai API key sendiri
-- ============================================================

alter table public.profiles
  add column if not exists free_generate_used boolean not null default false;

-- ============================================================
-- Migration 002: Tambah gemini_api_key ke profiles
-- Setiap user (subscriber) bisa simpan Gemini API key sendiri
-- ============================================================

alter table public.profiles
  add column if not exists gemini_api_key text;

-- Update RLS: kolom gemini_api_key hanya bisa dibaca/diupdate oleh user sendiri
-- Policy "profiles: self only" sudah mencakup ini (sudah ada dari migration 001)
-- Tidak perlu policy tambahan karena select/update sudah restricted ke auth.uid() = id

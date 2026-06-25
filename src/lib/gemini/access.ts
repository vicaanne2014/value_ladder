import type { SupabaseClient } from '@supabase/supabase-js'

export type GeminiAccessResult =
  | { allowed: true; apiKey: string | null; markUsed: boolean }
  | { allowed: false; reason: 'upgrade_required' | 'no_key'; message: string }

/**
 * Cek apakah user boleh pakai Gemini:
 * - Subscriber → selalu boleh (pakai key sendiri atau env)
 * - Free + punya API key sendiri → selalu boleh (pakai key sendiri)
 * - Free + belum pernah generate → boleh 1x (pakai env key), tandai sudah dipakai
 * - Free + sudah pernah generate → blokir, suruh subscribe atau input API key
 */
export async function checkGeminiAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<GeminiAccessResult> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_subscriber, tier, gemini_api_key, free_generate_used')
    .eq('id', userId)
    .single()

  const isSubscriber = profile?.is_subscriber || profile?.tier === 'subscriber' || profile?.tier === 'beta'
  const hasOwnKey = !!profile?.gemini_api_key
  const freeUsed = profile?.free_generate_used ?? false

  // Subscriber → bebas
  if (isSubscriber) {
    return { allowed: true, apiKey: profile?.gemini_api_key ?? null, markUsed: false }
  }

  // Punya API key sendiri → bebas (tidak pakai kuota free)
  if (hasOwnKey) {
    return { allowed: true, apiKey: profile.gemini_api_key, markUsed: false }
  }

  // Free + belum pernah generate → izinkan 1x
  if (!freeUsed) {
    return { allowed: true, apiKey: null, markUsed: true }
  }

  // Free + sudah pernah generate → blokir
  return {
    allowed: false,
    reason: 'upgrade_required',
    message: 'Free trial generate AI sudah digunakan. Masukkan Gemini API key Anda sendiri di Pengaturan, atau upgrade ke Subscriber untuk akses tak terbatas.',
  }
}

/**
 * Tandai free generate sudah dipakai
 */
export async function markFreeGenerateUsed(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await supabase
    .from('profiles')
    .update({ free_generate_used: true })
    .eq('id', userId)
}

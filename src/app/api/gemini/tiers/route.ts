import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeTiers } from '@/lib/gemini/client'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { session_id, ...sessionData } = body

  if (!session_id) return NextResponse.json({ error: 'session_id diperlukan' }, { status: 400 })

  const result = await analyzeTiers(sessionData)

  // Simpan ke sessions
  await supabase.from('sessions').update({
    current_tier: result.current_tier,
    current_tier_reason: result.reason,
    priority_tier: result.priority_tier,
    current_step: 3,
  }).eq('id', session_id).eq('user_id', user.id)

  // Upsert tier_entries
  const tierUpserts = result.tiers.map(t => ({
    session_id,
    tier_number: t.tier_number,
    status: t.status,
    product_ideas: t.product_ideas,
  }))

  await supabase.from('tier_entries').upsert(tierUpserts, {
    onConflict: 'session_id,tier_number',
  })

  return NextResponse.json(result)
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateFunnelRecommendation } from '@/lib/gemini/client'
import { checkGeminiAccess, markFreeGenerateUsed } from '@/lib/gemini/access'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const access = await checkGeminiAccess(supabase, user.id)
  if (!access.allowed) {
    return NextResponse.json({ error: access.message, upgrade_required: true }, { status: 403 })
  }

  const body = await req.json()
  const { session_id, tier_number, selected_idea, ...sessionData } = body

  if (!session_id || !tier_number || !selected_idea) {
    return NextResponse.json({ error: 'session_id, tier_number, selected_idea diperlukan' }, { status: 400 })
  }

  try {
    const result = await generateFunnelRecommendation(sessionData, tier_number, selected_idea, access.apiKey)

    if (access.markUsed) await markFreeGenerateUsed(supabase, user.id)

    await supabase.from('tier_entries').update({
      selected_idea,
      funnel_type: result.funnel_type,
      funnel_steps: result.funnel_steps,
    }).eq('session_id', session_id).eq('tier_number', tier_number)

    await supabase.from('sessions').update({ current_step: 5 })
      .eq('id', session_id).eq('user_id', user.id)

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada Gemini API'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

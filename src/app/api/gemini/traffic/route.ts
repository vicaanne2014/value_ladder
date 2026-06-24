import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTrafficRecommendation } from '@/lib/gemini/client'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('gemini_api_key')
    .eq('id', user.id)
    .single()

  const body = await req.json()
  const { session_id, tier_number, funnel_type, ...sessionData } = body

  if (!session_id || !tier_number || !funnel_type) {
    return NextResponse.json({ error: 'session_id, tier_number, funnel_type diperlukan' }, { status: 400 })
  }

  try {
    const result = await generateTrafficRecommendation(sessionData, tier_number, funnel_type, profile?.gemini_api_key)

    await supabase.from('tier_entries').update({
      traffic_recs: result.traffic_recs,
    }).eq('session_id', session_id).eq('tier_number', tier_number)

    await supabase.from('sessions').update({ current_step: 6 })
      .eq('id', session_id).eq('user_id', user.id)

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada Gemini API'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTrafficRecommendation } from '@/lib/gemini/client'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { session_id, tier_number, funnel_type, ...sessionData } = body

  if (!session_id || !tier_number || !funnel_type) {
    return NextResponse.json({ error: 'session_id, tier_number, funnel_type diperlukan' }, { status: 400 })
  }

  const result = await generateTrafficRecommendation(sessionData, tier_number, funnel_type)

  await supabase.from('tier_entries').update({
    traffic_recs: result.traffic_recs,
  }).eq('session_id', session_id).eq('tier_number', tier_number)

  await supabase.from('sessions').update({ current_step: 6 })
    .eq('id', session_id).eq('user_id', user.id)

  return NextResponse.json(result)
}

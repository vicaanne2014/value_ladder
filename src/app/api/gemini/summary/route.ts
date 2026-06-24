import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateExecutiveSummary } from '@/lib/gemini/client'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { session_id, ...sessionData } = body

  if (!session_id) return NextResponse.json({ error: 'session_id diperlukan' }, { status: 400 })

  const result = await generateExecutiveSummary(sessionData)

  await supabase.from('sessions').update({
    executive_summary: result.summary,
    current_step: 7,
    is_complete: true,
  }).eq('id', session_id).eq('user_id', user.id)

  return NextResponse.json(result)
}

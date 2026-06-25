import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateExecutiveSummary } from '@/lib/gemini/client'
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
  const { session_id, ...sessionData } = body

  if (!session_id) return NextResponse.json({ error: 'session_id diperlukan' }, { status: 400 })

  try {
    const result = await generateExecutiveSummary(sessionData, access.apiKey)

    if (access.markUsed) await markFreeGenerateUsed(supabase, user.id)

    await supabase.from('sessions').update({
      executive_summary: result.summary,
      current_step: 7,
      is_complete: true,
    }).eq('id', session_id).eq('user_id', user.id)

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada Gemini API'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

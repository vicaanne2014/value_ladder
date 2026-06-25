import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateVLMS } from '@/lib/gemini/client'
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
  const { session_id, product_name, product_type, price_idr, target_buyer, is_active, industry } = body

  if (!product_name || !product_type || !target_buyer) {
    return NextResponse.json({ error: 'Field tidak lengkap' }, { status: 400 })
  }

  try {
    const vlmsResult = await generateVLMS(
      { product_name, product_type, price_idr, target_buyer, is_active, industry },
      access.apiKey
    )

    if (access.markUsed) await markFreeGenerateUsed(supabase, user.id)

    if (session_id) {
      await supabase.from('sessions').update({
        vlms: vlmsResult.vlms,
        current_step: 2,
      }).eq('id', session_id).eq('user_id', user.id)
    }

    return NextResponse.json(vlmsResult)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada Gemini API'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

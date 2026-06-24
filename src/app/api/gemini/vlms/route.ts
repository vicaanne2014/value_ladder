import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateVLMS } from '@/lib/gemini/client'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { session_id, product_name, product_type, price_idr, target_buyer, is_active, industry } = body

  if (!product_name || !product_type || !target_buyer) {
    return NextResponse.json({ error: 'Field tidak lengkap' }, { status: 400 })
  }

  const vlmsResult = await generateVLMS({ product_name, product_type, price_idr, target_buyer, is_active, industry })

  if (session_id) {
    await supabase.from('sessions').update({
      vlms: vlmsResult.vlms,
      current_step: 2,
    }).eq('id', session_id).eq('user_id', user.id)
  }

  return NextResponse.json(vlmsResult)
}

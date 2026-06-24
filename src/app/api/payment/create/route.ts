import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateUniqueCode, SUBSCRIBER_PRICE } from '@/lib/billing'

export async function POST(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  if (profile?.tier === 'subscriber') {
    return NextResponse.json({ error: 'Anda sudah subscriber aktif' }, { status: 400 })
  }

  const uniqueCode = generateUniqueCode()
  const { data, error } = await supabase
    .from('payment_orders')
    .insert({
      user_id: user.id,
      plan: 'subscriber',
      amount: SUBSCRIBER_PRICE,
      unique_code: uniqueCode,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Gagal membuat order' }, { status: 500 })
  }

  return NextResponse.json({ orderId: data.id, uniqueCode, amount: SUBSCRIBER_PRICE })
}

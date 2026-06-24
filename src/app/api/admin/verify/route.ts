import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return data?.role === 'admin'
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await checkAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId, userId, adminNotes } = await req.json()

  if (!orderId || !userId) {
    return NextResponse.json({ error: 'orderId dan userId wajib diisi' }, { status: 400 })
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000).toISOString()

  const adminClient = createAdminClient()

  const [orderUpdate, profileUpdate] = await Promise.all([
    adminClient.from('payment_orders').update({
      status: 'verified',
      verified_at: now.toISOString(),
      ...(adminNotes ? { admin_notes: adminNotes } : {}),
    }).eq('id', orderId),
    adminClient.from('profiles').update({
      tier: 'subscriber',
      is_subscriber: true,
      activated_at: now.toISOString(),
      expires_at: expiresAt,
    }).eq('id', userId),
  ])

  if (orderUpdate.error || profileUpdate.error) {
    return NextResponse.json({ error: 'Gagal mengaktifkan akses' }, { status: 500 })
  }

  return NextResponse.json({ success: true, expiresAt })
}

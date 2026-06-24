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

  const { orderId, adminNotes } = await req.json()

  if (!orderId) {
    return NextResponse.json({ error: 'orderId wajib diisi' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('payment_orders').update({
    status: 'rejected',
    rejected_at: new Date().toISOString(),
    ...(adminNotes ? { admin_notes: adminNotes } : {}),
  }).eq('id', orderId)

  if (error) {
    return NextResponse.json({ error: 'Gagal menolak order' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

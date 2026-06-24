import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Endpoint sekali pakai: set role admin berdasarkan email
// Hanya bisa dipanggil dengan SETUP_SECRET dari env
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-setup-secret')
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'email diperlukan' }, { status: 400 })

  const adminClient = createAdminClient()
  const { data: users } = await adminClient.auth.admin.listUsers()
  const target = users?.users?.find(u => u.email === email)

  if (!target) {
    return NextResponse.json({ error: `User dengan email ${email} tidak ditemukan` }, { status: 404 })
  }

  const { error } = await adminClient
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', target.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: `${email} sekarang adalah admin` })
}

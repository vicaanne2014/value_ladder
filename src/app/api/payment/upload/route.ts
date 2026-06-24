import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const orderId = formData.get('orderId') as string
  const senderName = formData.get('senderName') as string
  const senderBank = formData.get('senderBank') as string
  const transferDate = formData.get('transferDate') as string
  const file = formData.get('proof') as File | null

  if (!orderId || !senderName || !senderBank || !transferDate) {
    return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
  }

  const { data: order } = await supabase
    .from('payment_orders')
    .select('id, status')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'Order sudah tidak bisa diupdate' }, { status: 400 })
  }

  let proofUrl: string | null = null

  if (file && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File terlalu besar, maksimal 5MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'pdf'].includes(ext ?? '')) {
      return NextResponse.json({ error: 'Format file harus JPG, PNG, atau PDF' }, { status: 400 })
    }

    const filename = `proofs/${user.id}/${orderId}.${ext}`
    const bytes = await file.arrayBuffer()

    const { error: uploadErr } = await supabase.storage
      .from('payment-proofs')
      .upload(filename, bytes, { contentType: file.type, upsert: true })

    if (uploadErr) {
      return NextResponse.json({ error: 'Gagal upload bukti: ' + uploadErr.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(filename)
    proofUrl = urlData.publicUrl
  }

  const { error } = await supabase
    .from('payment_orders')
    .update({
      sender_name: senderName,
      sender_bank: senderBank,
      transfer_date: transferDate,
      ...(proofUrl ? { proof_url: proofUrl } : {}),
    })
    .eq('id', orderId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Gagal menyimpan bukti' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/export — generate PDF (subscriber only)
// Menggunakan react-pdf di sisi server via dynamic import
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Cek subscriber
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_subscriber')
    .eq('id', user.id)
    .single()

  if (!profile?.is_subscriber) {
    return NextResponse.json({
      error: 'Fitur ekspor PDF hanya tersedia untuk subscriber.',
      upgrade_required: true,
    }, { status: 403 })
  }

  const { session_id } = await req.json()
  if (!session_id) return NextResponse.json({ error: 'session_id diperlukan' }, { status: 400 })

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*, tier_entries(*)')
    .eq('id', session_id)
    .eq('user_id', user.id)
    .single()

  if (error || !session) return NextResponse.json({ error: 'Sesi tidak ditemukan' }, { status: 404 })

  // Generate PDF menggunakan @react-pdf/renderer di server
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const { ValueLadderPDFDocument } = await import('@/components/pdf/ValueLadderDocument')
  const React = await import('react')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.default.createElement(ValueLadderPDFDocument as any, { session })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await (renderToBuffer as any)(element)
  const uint8 = new Uint8Array(buffer)

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="value-ladder-${session.product_name?.replace(/\s+/g, '-') ?? 'export'}.pdf"`,
    },
  })
}

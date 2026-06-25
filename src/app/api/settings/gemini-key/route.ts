import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: ambil status key (apakah sudah ada, tanpa expose nilai aslinya)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('gemini_api_key, is_subscriber')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    has_key: !!profile?.gemini_api_key,
    is_subscriber: profile?.is_subscriber ?? false,
    key_preview: profile?.gemini_api_key
      ? `${profile.gemini_api_key.slice(0, 6)}...${profile.gemini_api_key.slice(-4)}`
      : null,
  })
}

// POST: simpan atau hapus Gemini API key
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { gemini_api_key } = body

  if (gemini_api_key !== null && gemini_api_key !== undefined) {
    const trimmed = String(gemini_api_key).trim()

    await supabase
      .from('profiles')
      .update({ gemini_api_key: trimmed || null })
      .eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}

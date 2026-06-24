import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/session — list semua sesi milik user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('sessions')
    .select('id, title, current_step, is_complete, created_at, updated_at, product_name, product_type, current_tier, priority_tier')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/session — buat sesi baru
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Cek apakah subscriber (bisa buat lebih dari 1 sesi)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_subscriber')
    .eq('id', user.id)
    .single()

  if (!profile?.is_subscriber) {
    const { count } = await supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 1) {
      return NextResponse.json({
        error: 'Free trial hanya bisa membuat 1 sesi. Upgrade ke subscriber untuk sesi tak terbatas.',
        upgrade_required: true,
      }, { status: 403 })
    }
  }

  const body = await req.json()
  const {
    product_name, product_type, price_idr, target_buyer,
    is_active, input_source, pdf_url, industry,
  } = body

  const { data, error } = await supabase.from('sessions').insert({
    user_id: user.id,
    title: product_name || 'Sesi baru',
    product_name,
    product_type,
    price_idr: price_idr || null,
    target_buyer,
    is_active: is_active ?? false,
    input_source: input_source || 'form',
    pdf_url: pdf_url || null,
    industry: industry || null,
    current_step: 1,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

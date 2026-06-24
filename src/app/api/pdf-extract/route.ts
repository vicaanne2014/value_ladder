import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractProductFromPDF } from '@/lib/gemini/client'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('gemini_api_key')
    .eq('id', user.id)
    .single()

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Hanya PDF yang didukung' }, { status: 400 })
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'Ukuran file maksimal 20MB' }, { status: 400 })

  const fileName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('pdf-uploads')
    .upload(fileName, buffer, { contentType: 'application/pdf', upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: 'Gagal upload file: ' + uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('pdf-uploads').getPublicUrl(uploadData.path)

  try {
    const base64 = buffer.toString('base64')
    const extracted = await extractProductFromPDF(base64, 'application/pdf', profile?.gemini_api_key)
    return NextResponse.json({ ...extracted, pdf_url: publicUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan pada Gemini API'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

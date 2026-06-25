import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

async function validateGeminiKey(apiKey: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey })
    await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: 'hi',
      config: { maxOutputTokens: 1 },
    })
    return null
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
      return 'API key tidak valid. Pastikan key benar dan sudah diaktifkan di aistudio.google.com/apikey'
    }
    if (msg.includes('PERMISSION_DENIED')) {
      return 'API key tidak punya izin untuk Gemini API. Aktifkan Generative Language API di Google Cloud Console.'
    }
    return null
  }
}

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

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { gemini_api_key } = body

  if (gemini_api_key !== null && gemini_api_key !== undefined) {
    const trimmed = String(gemini_api_key).trim()

    if (trimmed) {
      const validationError = await validateGeminiKey(trimmed)
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }
    }

    await supabase
      .from('profiles')
      .update({ gemini_api_key: trimmed || null })
      .eq('id', user.id)
  }

  return NextResponse.json({ success: true })
}

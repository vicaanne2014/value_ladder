import { GoogleGenAI } from '@google/genai'
import { VALUE_LADDER_SYSTEM_PROMPT } from './system-prompt'
import type {
  Session,
  GeminiVLMSResponse,
  GeminiTierResponse,
  GeminiFunnelResponse,
  GeminiTrafficResponse,
  GeminiExecutiveSummary,
  ProductType,
} from '@/types'

const MODEL = 'gemini-2.5-pro'

function getAI(userApiKey?: string | null) {
  const key = userApiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('Gemini API key tidak ditemukan. Silakan tambahkan API key di halaman Settings.')
  return new GoogleGenAI({ apiKey: key })
}

function parseGeminiError(err: unknown, isUserKey: boolean): never {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
    if (isUserKey) {
      throw new Error('API key Anda tidak valid. Pastikan key benar di aistudio.google.com/apikey dan sudah diaktifkan.')
    }
    throw new Error('Konfigurasi server bermasalah. Hubungi admin.')
  }
  if (msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
    throw new Error('API key tidak punya izin untuk Gemini API. Aktifkan Generative Language API di Google Cloud Console.')
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
    throw new Error('Kuota Gemini API habis. Coba lagi nanti atau gunakan API key Anda sendiri.')
  }
  if (msg.includes('fetch failed') || msg.includes('ENOTFOUND')) {
    throw new Error('Tidak dapat terhubung ke Gemini API. Periksa koneksi internet.')
  }
  throw new Error('Terjadi kesalahan pada AI. Coba lagi dalam beberapa saat.')
}

async function callGemini(prompt: string, userApiKey?: string | null): Promise<string> {
  const isUserKey = !!userApiKey
  const ai = getAI(userApiKey)
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: VALUE_LADDER_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    })
    return response.text ?? ''
  } catch (err) {
    parseGeminiError(err, isUserKey)
  }
}

// Langkah 1: ekstrak profil produk dari PDF
export async function extractProductFromPDF(pdfBase64: string, mimeType: string, userApiKey?: string | null): Promise<{
  product_name: string
  product_type: ProductType
  price_idr: number | null
  target_buyer: string
  is_active: boolean
}> {
  const isUserKey = !!userApiKey
  const ai = getAI(userApiKey)
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          inlineData: { mimeType, data: pdfBase64 },
        },
        `Ekstrak informasi produk dari dokumen ini. Kembalikan JSON dengan format:
{
  "product_name": "nama produk utama",
  "product_type": "digital" | "fisik" | "jasa",
  "price_idr": angka harga dalam Rupiah atau null jika tidak ada,
  "target_buyer": "deskripsi target pembeli dalam 1-2 kalimat",
  "is_active": true jika sudah dijual, false jika masih rencana
}
Jika dokumen tidak mengandung informasi produk yang cukup, kembalikan semua field dengan nilai null/"" dan tambahkan field "insufficient_data": true.`,
      ],
      config: {
        systemInstruction: VALUE_LADDER_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
      },
    })
    return JSON.parse(response.text ?? '{}')
  } catch (err) {
    parseGeminiError(err, isUserKey)
  }
}

// Langkah 1: generate VLMS dari profil produk
export async function generateVLMS(session: Partial<Session>, userApiKey?: string | null): Promise<GeminiVLMSResponse> {
  const prompt = `
Berdasarkan produk berikut, buat Value Ladder Mission Statement (VLMS).

Produk: ${session.product_name}
Jenis: ${session.product_type}
Harga: ${session.price_idr ? `Rp ${session.price_idr.toLocaleString('id-ID')}` : 'belum ditentukan / gratis'}
Target pembeli: ${session.target_buyer}
Status: ${session.is_active ? 'sudah dijual aktif' : 'masih dalam rencana'}
${session.industry ? `Industri: ${session.industry}` : ''}

Kembalikan JSON:
{
  "vlms": "Kami membantu [siapa] untuk [hasil/transformasi yang dicapai] melalui [kendaraan/metode unik].",
  "product_name_confirmed": "nama produk yang dikonfirmasi",
  "product_type_confirmed": "digital" | "fisik" | "jasa"
}
`
  const raw = await callGemini(prompt, userApiKey)
  return JSON.parse(raw)
}

// Langkah 2: tempatkan produk di tier dan petakan semua tier
export async function analyzeTiers(session: Partial<Session>, userApiKey?: string | null): Promise<GeminiTierResponse> {
  const prompt = `
Analisis produk ini dan tentukan posisinya dalam Value Ladder.

VLMS: ${session.vlms}
Produk: ${session.product_name}
Jenis: ${session.product_type}
Harga: ${session.price_idr ? `Rp ${session.price_idr.toLocaleString('id-ID')}` : 'gratis / belum ada harga'}
Target pembeli: ${session.target_buyer}

Kembalikan JSON:
{
  "current_tier": 1 | 2 | 3 | 4,
  "reason": "alasan penempatan 1-2 kalimat",
  "priority_tier": tier mana yang direkomendasikan untuk dibangun pertama,
  "priority_reason": "alasan 1-2 kalimat",
  "tiers": [
    {
      "tier_number": 1,
      "status": "existing" | "planned" | "empty",
      "product_ideas": ["ide 1", "ide 2", "ide 3"]
    },
    { "tier_number": 2, ... },
    { "tier_number": 3, ... },
    { "tier_number": 4, ... }
  ]
}

Penting:
- tier dengan produk existing: status "existing", product_ideas boleh kosong
- tier kosong: berikan 2-3 ide spesifik sesuai jenis produk (${session.product_type}) dan VLMS
- ide harus spesifik dan konkret, sertakan kisaran harga dalam Rupiah
`
  const raw = await callGemini(prompt, userApiKey)
  return JSON.parse(raw)
}

// Langkah 3: rekomendasi funnel untuk tier tertentu
export async function generateFunnelRecommendation(
  session: Partial<Session>,
  tierNumber: 1 | 2 | 3 | 4,
  selectedIdea: string,
  userApiKey?: string | null
): Promise<GeminiFunnelResponse> {
  const prompt = `
Rekomendasikan funnel penjualan untuk produk/tier berikut.

VLMS: ${session.vlms}
Produk: ${session.product_name} (${session.product_type})
Tier: ${tierNumber}
Produk/penawaran di tier ini: ${selectedIdea}

Kembalikan JSON:
{
  "tier_number": ${tierNumber},
  "funnel_type": "lead" | "unboxing" | "presentation" | "application",
  "funnel_steps": [
    "Langkah 1: ...",
    "Langkah 2: ...",
    ...
  ],
  "supporting_elements": [
    "Elemen pendukung (order bump, upsell, skrip, dll)"
  ]
}

Langkah funnel harus spesifik dan actionable. Sertakan konteks WhatsApp/email Indonesia jika relevan.
`
  const raw = await callGemini(prompt, userApiKey)
  return JSON.parse(raw)
}

// Langkah 4: rekomendasi traffic & iklan
export async function generateTrafficRecommendation(
  session: Partial<Session>,
  tierNumber: 1 | 2 | 3 | 4,
  funnelType: string,
  userApiKey?: string | null
): Promise<GeminiTrafficResponse> {
  const prompt = `
Rekomendasikan strategi traffic dan iklan untuk funnel berikut.

VLMS: ${session.vlms}
Produk: ${session.product_name} (${session.product_type})
Tier: ${tierNumber}
Jenis funnel: ${funnelType}

Kembalikan JSON:
{
  "tier_number": ${tierNumber},
  "traffic_recs": [
    {
      "channel": "nama platform/kanal",
      "audience_temp": "cold" | "warm" | "hot",
      "kpi": "metrik utama yang dipantau",
      "tips": "tips spesifik 1 kalimat"
    }
  ],
  "budget_notes": "catatan budget 1-2 kalimat sesuai jenis produk (digital/fisik/jasa)"
}

Gunakan platform relevan Indonesia: Meta Ads, TikTok Ads, Google Ads, Shopee/Tokopedia, WhatsApp, email.
Berikan 3-4 traffic_recs dengan suhu audiens bervariasi.
`
  const raw = await callGemini(prompt, userApiKey)
  return JSON.parse(raw)
}

// Langkah 5: ringkasan eksekutif
export async function generateExecutiveSummary(session: Partial<Session>, userApiKey?: string | null): Promise<GeminiExecutiveSummary> {
  const prompt = `
Buat ringkasan eksekutif Value Ladder untuk bisnis ini.

VLMS: ${session.vlms}
Produk saat ini: ${session.product_name} di Tier ${session.current_tier}
Tier prioritas: Tier ${session.priority_tier}

Kembalikan JSON:
{
  "summary": "ringkasan 2-3 kalimat tentang value ladder bisnis ini",
  "start_here": "rekomendasi konkret 1 kalimat: mulai dari mana dan mengapa",
  "first_funnel": "jenis funnel pertama yang harus dibangun dan strukturnya singkat",
  "first_channel": "kanal traffic utama yang harus difokuskan pertama",
  "estimated_setup_weeks": angka estimasi minggu untuk setup funnel pertama
}
`
  const raw = await callGemini(prompt, userApiKey)
  return JSON.parse(raw)
}

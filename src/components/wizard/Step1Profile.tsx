'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { INDUSTRY_OPTIONS } from '@/lib/utils'
import { INDUSTRY_TEMPLATES } from '@/lib/gemini/system-prompt'
import { Upload, FileText, X } from 'lucide-react'
import type { ProductType, Industry } from '@/types'

interface Step1Data {
  product_name: string
  product_type: ProductType
  price_idr: number | null
  target_buyer: string
  is_active: boolean
  industry: string | null
  input_source: 'form' | 'pdf'
  pdf_url?: string | null
}

interface Props {
  onNext: (data: Step1Data) => void
  isSubscriber: boolean
}

export default function Step1Profile({ onNext, isSubscriber }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<'form' | 'pdf'>('form')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState<Step1Data>({
    product_name: '',
    product_type: 'digital',
    price_idr: null,
    target_buyer: '',
    is_active: true,
    industry: null,
    input_source: 'form',
  })

  function applyIndustryTemplate(industryId: string) {
    const tpl = INDUSTRY_TEMPLATES[industryId as Industry]
    if (!tpl) return
    setForm(f => ({
      ...f,
      product_type: tpl.product_type,
      industry: industryId,
    }))
  }

  async function handlePDFUpload(file: File) {
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/pdf-extract', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)

    if (!res.ok || data.insufficient_data) {
      setError('PDF tidak mengandung info produk yang cukup. Silakan isi form manual.')
      setMode('form')
      return
    }

    setPdfUrl(data.pdf_url)
    setForm(f => ({
      ...f,
      product_name: data.product_name || f.product_name,
      product_type: data.product_type || f.product_type,
      price_idr: data.price_idr ?? f.price_idr,
      target_buyer: data.target_buyer || f.target_buyer,
      is_active: data.is_active ?? f.is_active,
      input_source: 'pdf',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.product_name.trim()) { setError('Nama produk wajib diisi'); return }
    if (!form.target_buyer.trim()) { setError('Target pembeli wajib diisi'); return }
    setSubmitting(true)
    onNext({ ...form, input_source: mode, pdf_url: pdfUrl })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {(['form', 'pdf'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === 'form' ? <><FileText size={14} /> Isi Form</> : <><Upload size={14} /> Upload PDF</>}
          </button>
        ))}
      </div>

      {/* PDF upload */}
      {mode === 'pdf' && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-colors"
        >
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) { setPdfFile(f); handlePDFUpload(f) }
            }}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
              <p className="text-sm text-gray-500">Mengekstrak informasi dari PDF...</p>
            </div>
          ) : pdfFile ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <FileText size={18} className="text-violet-600" />
              {pdfFile.name}
              <button type="button" onClick={e => { e.stopPropagation(); setPdfFile(null); setPdfUrl(null) }}>
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          ) : (
            <>
              <Upload size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Klik untuk upload PDF</p>
              <p className="text-xs text-gray-400 mt-1">Katalog produk, profil usaha, brosur — maks. 20MB</p>
            </>
          )}
        </div>
      )}

      {/* Pilih industri (subscriber only) */}
      {isSubscriber && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Template Industri <span className="text-violet-600 text-xs">(opsional)</span></label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => applyIndustryTemplate(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  form.industry === opt.value
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="grid gap-4">
        <Input
          label="Nama / deskripsi produk"
          value={form.product_name}
          onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
          placeholder="mis. Kursus Foto Produk Online, Skincare Vitamin C Serum..."
          required
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Jenis produk</label>
          <div className="flex gap-2">
            {(['digital', 'fisik', 'jasa'] as ProductType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, product_type: t }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  form.product_type === t
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Harga saat ini (Rupiah)"
          type="number"
          value={form.price_idr ?? ''}
          onChange={e => setForm(f => ({ ...f, price_idr: e.target.value ? Number(e.target.value) : null }))}
          placeholder="0 untuk gratis / kosongkan jika belum ada"
          hint="Kosongkan jika belum punya harga"
        />

        <Textarea
          label="Target pembeli / pelanggan ideal"
          value={form.target_buyer}
          onChange={e => setForm(f => ({ ...f, target_buyer: e.target.value }))}
          placeholder="mis. Ibu rumah tangga 25-40 tahun yang ingin mulai bisnis online dari rumah..."
          required
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Status produk</label>
          <div className="flex gap-2">
            {[{ v: true, l: 'Sudah dijual aktif' }, { v: false, l: 'Masih dalam rencana' }].map(opt => (
              <button
                key={String(opt.v)}
                type="button"
                onClick={() => setForm(f => ({ ...f, is_active: opt.v }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  form.is_active === opt.v
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <Button type="submit" loading={submitting} className="w-full" size="lg">
        Lanjut: Susun Misi Bisnis →
      </Button>
    </form>
  )
}

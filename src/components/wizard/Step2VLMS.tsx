'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { RefreshCw } from 'lucide-react'
import type { Session } from '@/types'

interface Props {
  session: Partial<Session>
  onNext: (vlms: string) => void
  onBack: () => void
}

export default function Step2VLMS({ session, onNext, onBack }: Props) {
  const [vlms, setVlms] = useState(session.vlms || '')
  const [loading, setLoading] = useState(!session.vlms)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setError('')
    const res = await fetch('/api/gemini/vlms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, ...session }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Gagal generate VLMS'); return null }
    return data.vlms as string
  }

  useEffect(() => {
    if (!session.vlms) {
      generate().then(v => { if (v) setVlms(v); setLoading(false) })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRegenerate() {
    setRegenerating(true)
    const v = await generate()
    if (v) setVlms(v)
    setRegenerating(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
        <p className="text-xs text-violet-600 font-medium mb-1">Tentang VLMS</p>
        <p className="text-sm text-violet-900 leading-relaxed">
          Value Ladder Mission Statement adalah satu kalimat kompas yang mengarahkan semua penawaran bisnis Anda — dari yang gratis hingga yang paling mahal.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Gemini sedang menyusun misi bisnis Anda...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Misi Bisnis (VLMS)</label>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={12} className={regenerating ? 'animate-spin' : ''} />
              Buat ulang
            </button>
          </div>
          <Textarea
            rows={4}
            value={vlms}
            onChange={e => setVlms(e.target.value)}
            placeholder='Kami membantu [siapa] untuk [hasil] melalui [cara unik].'
            hint="Edit bebas jika ada kata yang kurang tepat"
          />
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
            <strong>Format:</strong> Kami membantu <em>[segmen]</em> untuk <em>[transformasi]</em> melalui <em>[metode unik]</em>.
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">← Kembali</Button>
        <Button onClick={() => onNext(vlms)} disabled={!vlms.trim() || loading} className="flex-2">
          Konfirmasi & Lanjut →
        </Button>
      </div>
    </div>
  )
}

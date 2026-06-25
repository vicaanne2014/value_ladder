'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import { TIER_LABELS, FUNNEL_LABELS, TEMP_LABELS, formatRupiah } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Download, Lock } from 'lucide-react'
import type { Session } from '@/types'

interface Props {
  session: Partial<Session>
  isSubscriber: boolean
  onRedo?: () => void
}

export default function Step7Output({ session, isSubscriber, onRedo }: Props) {
  const [summary, setSummary] = useState<{
    summary: string
    start_here: string
    first_funnel: string
    first_channel: string
    estimated_setup_weeks: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/gemini/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, ...session }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setSummary(data)
        setLoading(false)
      })
      .catch(() => { setError('Gagal generate ringkasan'); setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleExportPDF() {
    setExporting(true)
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id }),
    })
    if (!res.ok) {
      const data = await res.json()
      if (data.upgrade_required) {
        window.location.href = '/upgrade'
      }
      setExporting(false)
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `value-ladder-${session.product_name?.replace(/\s+/g, '-') ?? 'export'}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const tiers = session.tier_entries ?? []

  return (
    <div className="space-y-6">
      {/* VLMS */}
      <div className="bg-violet-600 text-white rounded-2xl p-5">
        <p className="text-violet-200 text-xs font-medium mb-1">Misi Bisnis (VLMS)</p>
        <p className="text-white font-medium leading-relaxed">{session.vlms}</p>
      </div>

      {/* Executive Summary */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Menyusun ringkasan eksekutif...</p>
        </div>
      ) : summary ? (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Ringkasan Eksekutif</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: 'Mulai dari mana', value: summary.start_here },
                { label: 'Funnel pertama', value: summary.first_funnel },
                { label: 'Kanal traffic utama', value: summary.first_channel },
                { label: 'Estimasi waktu setup', value: `${summary.estimated_setup_weeks} minggu` },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* Peta tier lengkap */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Peta Value Ladder</h3>
          <p className="text-xs text-gray-500 mt-0.5">{session.product_name} · {session.product_type}</p>
        </CardHeader>
        <CardBody className="space-y-3 pt-0">
          {[1, 2, 3, 4].map(t => {
            const meta = TIER_LABELS[t]
            const entry = tiers.find(x => x.tier_number === t)
            return (
              <div key={t} className={`${meta.bg} rounded-xl border p-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-xs font-bold ${meta.color}`}>TIER {t} — {meta.label}</span>
                    {entry?.selected_idea && (
                      <p className="text-sm text-gray-700 mt-1">{entry.selected_idea}</p>
                    )}
                    {entry?.funnel_type && (
                      <Badge variant="violet" className="mt-1 text-[10px]">{FUNNEL_LABELS[entry.funnel_type]}</Badge>
                    )}
                    {entry?.traffic_recs && entry.traffic_recs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {entry.traffic_recs.map((r, i) => (
                          <span key={i} className={`text-[10px] font-medium ${TEMP_LABELS[r.audience_temp].color}`}>
                            {r.channel}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Badge variant={t === session.current_tier ? 'violet' : entry?.status === 'existing' ? 'success' : 'default'}>
                    {t === session.current_tier ? 'Produk Anda' : entry?.status === 'existing' ? 'Ada' : 'Kosong'}
                  </Badge>
                </div>
              </div>
            )
          })}
        </CardBody>
      </Card>

      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      {/* Kerjakan tier lain */}
      {onRedo && (
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-violet-900">Kerjakan tier berikutnya?</p>
            <p className="text-xs text-violet-600 mt-0.5">Pilih tier lain, ganti ide, atau buat funnel baru untuk tier yang belum dibangun.</p>
          </div>
          <Button variant="secondary" onClick={onRedo} className="shrink-0 text-violet-700 border-violet-200">
            Ganti Tier / Ide
          </Button>
        </div>
      )}

      {/* Export */}
      {isSubscriber ? (
        <Button onClick={handleExportPDF} loading={exporting} className="w-full" size="lg">
          <Download size={16} /> Download PDF
        </Button>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
          <Lock size={20} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700 mb-1">Ekspor PDF tersedia untuk Subscriber</p>
          <p className="text-xs text-gray-500 mb-4">Simpan dan presentasikan peta Value Ladder Anda sebagai dokumen PDF.</p>
          <Button onClick={() => window.location.href = '/upgrade'} className="mx-auto">
            Upgrade ke Subscriber
          </Button>
        </div>
      )}
    </div>
  )
}

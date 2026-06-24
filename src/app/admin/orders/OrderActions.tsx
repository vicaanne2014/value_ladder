'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  orderId: string
  userId: string
}

export default function OrderActions({ orderId, userId }: Props) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState<'verify' | 'reject' | null>(null)
  const [done, setDone] = useState('')
  const [error, setError] = useState('')

  async function act(action: 'verify' | 'reject') {
    setLoading(action)
    setError('')

    const res = await fetch(`/api/admin/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, userId, adminNotes: notes || undefined }),
    })

    const data = await res.json()
    setLoading(null)

    if (!res.ok) {
      setError(data.error ?? 'Gagal')
    } else {
      setDone(action === 'verify' ? 'Akses berhasil diaktifkan!' : 'Order ditolak.')
      setTimeout(() => window.location.reload(), 1200)
    }
  }

  if (done) {
    return <p className="text-sm font-medium text-emerald-600">{done}</p>
  }

  return (
    <div className="space-y-2">
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Catatan admin (opsional)"
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button
          onClick={() => act('verify')}
          loading={loading === 'verify'}
          className="flex-1"
        >
          Verifikasi & Aktifkan
        </Button>
        <Button
          variant="secondary"
          onClick={() => act('reject')}
          loading={loading === 'reject'}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          Tolak
        </Button>
      </div>
    </div>
  )
}

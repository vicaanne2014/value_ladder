'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UpgradeButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/payment/create', { method: 'POST' })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Terjadi kesalahan')
      return
    }

    router.push(`/payment/${data.orderId}`)
  }

  return (
    <div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full bg-white text-violet-700 font-semibold py-2.5 rounded-xl hover:bg-violet-50 transition-colors disabled:opacity-50"
      >
        {loading ? 'Membuat order...' : 'Beli Sekarang — Transfer Bank'}
      </button>
      {error && <p className="text-xs text-red-200 mt-2 text-center">{error}</p>}
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [senderName, setSenderName] = useState('')
  const [senderBank, setSenderBank] = useState('')
  const [transferDate, setTransferDate] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!senderName || !senderBank || !transferDate || !file) {
      setError('Semua field wajib diisi, termasuk file bukti transfer')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('orderId', orderId)
    formData.append('senderName', senderName)
    formData.append('senderBank', senderBank)
    formData.append('transferDate', transferDate)
    formData.append('proof', file)

    try {
      const res = await fetch('/api/payment/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal upload bukti')
        return
      }
      setSubmitted(true)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
        <p className="font-semibold mb-1">Bukti pembayaran sudah kami terima!</p>
        <p>Akses akan diaktifkan dalam 1×24 jam kerja. Silakan cek dashboard untuk status terbaru.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="font-semibold text-gray-900">Upload Bukti Transfer</h2>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Nama Lengkap Pengirim</label>
        <input
          type="text"
          value={senderName}
          onChange={e => setSenderName(e.target.value)}
          placeholder="Sesuai nama di rekening"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Bank / Dompet Digital</label>
        <input
          type="text"
          value={senderBank}
          onChange={e => setSenderBank(e.target.value)}
          placeholder="Contoh: BCA, Mandiri, GoPay, OVO"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Tanggal & Jam Transfer</label>
        <input
          type="datetime-local"
          value={transferDate}
          onChange={e => setTransferDate(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Bukti Transfer <span className="text-gray-400 font-normal">(JPG, PNG, atau PDF · maks 5MB)</span>
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400 hover:border-violet-300 hover:text-violet-500 transition-colors"
        >
          {fileName ? (
            <span className="text-gray-800 font-medium">{fileName}</span>
          ) : (
            'Klik untuk pilih file bukti transfer'
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Mengirim...' : 'Kirim Bukti Transfer'}
      </button>
    </form>
  )
}

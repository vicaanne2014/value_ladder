'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  hasKey: boolean
  keyPreview: string | null
}

export default function GeminiKeyForm({ hasKey, keyPreview }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showInput, setShowInput] = useState(!hasKey)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey.trim()) return
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/settings/gemini-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gemini_api_key: apiKey.trim() }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Gagal menyimpan API key')
    } else {
      setSuccess('API key berhasil disimpan')
      setApiKey('')
      setShowInput(false)
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  async function handleRemove() {
    if (!confirm('Hapus Gemini API key? Anda akan menggunakan kuota bersama.')) return
    setRemoving(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/settings/gemini-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gemini_api_key: null }),
    })

    const data = await res.json()
    setRemoving(false)

    if (!res.ok) {
      setError(data.error ?? 'Gagal menghapus API key')
    } else {
      setSuccess('API key dihapus')
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  if (hasKey && !showInput) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-sm text-gray-500 font-mono flex-1">{keyPreview}</span>
          <button
            onClick={() => setShowInput(true)}
            className="text-xs text-violet-600 hover:text-violet-700 font-medium"
          >
            Ganti
          </button>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="text-xs text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
          >
            {removing ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
        {success && <p className="text-xs text-emerald-600">{success}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <Input
        label="Gemini API Key"
        type="password"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="AIza..."
        hint="Dari aistudio.google.com/apikey — diawali dengan AIza"
        required
      />
      {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {success && <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={loading} className="flex-1">
          Simpan API Key
        </Button>
        {hasKey && (
          <Button type="button" variant="secondary" onClick={() => setShowInput(false)}>
            Batal
          </Button>
        )}
      </div>
    </form>
  )
}

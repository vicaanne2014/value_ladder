import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GeminiKeyForm from './GeminiKeyForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_subscriber, gemini_api_key')
    .eq('id', user.id)
    .single()

  const isSubscriber = profile?.is_subscriber ?? false
  const hasKey = !!profile?.gemini_api_key
  const keyPreview = profile?.gemini_api_key
    ? `${profile.gemini_api_key.slice(0, 6)}...${profile.gemini_api_key.slice(-4)}`
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight">Value Ladder Builder</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Kembali ke Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Pengaturan Akun</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>

        {/* Gemini API Key Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Gemini API Key</h2>
              <p className="text-sm text-gray-500 mt-1">
                Gunakan API key Gemini milik Anda sendiri untuk meningkatkan kuota dan kontrol biaya.
              </p>
            </div>
            {hasKey && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Terhubung
              </span>
            )}
          </div>

          {!isSubscriber ? (
            <div className="bg-violet-50 rounded-xl p-4">
              <p className="text-sm text-violet-800 font-medium mb-1">Fitur Subscriber</p>
              <p className="text-sm text-violet-600 mb-3">
                Tambahkan Gemini API key pribadi Anda agar tidak bergantung pada kuota bersama.
              </p>
              <Link
                href="/upgrade"
                className="inline-flex items-center text-sm font-medium text-violet-700 hover:text-violet-900 underline underline-offset-2"
              >
                Upgrade ke Subscriber →
              </Link>
            </div>
          ) : (
            <GeminiKeyForm hasKey={hasKey} keyPreview={keyPreview} />
          )}

          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              API key disimpan terenkripsi dan hanya digunakan untuk permintaan AI Anda.
              Dapatkan key di{' '}
              <span className="font-medium text-gray-500">aistudio.google.com/apikey</span>
            </p>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Status Langganan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {isSubscriber ? 'Subscriber Aktif' : 'Free Trial'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isSubscriber
                  ? 'Sesi tak terbatas, ekspor PDF, API key pribadi'
                  : 'Maksimal 1 sesi, tanpa ekspor PDF'}
              </p>
            </div>
            {!isSubscriber && (
              <Link
                href="/upgrade"
                className="text-sm font-medium text-violet-600 hover:text-violet-700 px-4 py-2 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
              >
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatRupiah, SUBSCRIBER_PRICE } from '@/lib/billing'
import UpgradeButton from './UpgradeButton'

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, is_subscriber')
    .eq('id', user.id)
    .single()

  const isSubscriber = profile?.is_subscriber || profile?.tier === 'subscriber'

  const features = [
    'Sesi Value Ladder tak terbatas',
    'Ekspor PDF siap presentasi',
    'Simpan & lanjutkan sesi kapan saja',
    'Template 5 industri (skincare, coaching, F&B, agency, SaaS)',
    'Hubungkan Gemini API key pribadi Anda',
    'Semua fitur free trial',
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="self-start max-w-2xl w-full mx-auto mb-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Kembali ke Dashboard</Link>
      </div>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upgrade ke Subscriber</h1>
          <p className="text-gray-500 text-sm">Buka semua fitur dan buat sesi Value Ladder tak terbatas.</p>
        </div>

        <div className="bg-violet-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-end gap-2 mb-4">
            <span className="text-3xl font-bold">{formatRupiah(SUBSCRIBER_PRICE)}</span>
            <span className="text-violet-200 text-sm pb-1">/bulan</span>
          </div>
          <ul className="space-y-3 mb-6">
            {features.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check size={15} className="text-violet-200 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          {isSubscriber ? (
            <div className="bg-violet-500 rounded-xl p-3 text-center">
              <p className="text-sm font-medium text-white">Anda sudah subscriber aktif!</p>
              <Link href="/dashboard" className="text-xs text-violet-200 hover:text-white mt-1 block">
                Kembali ke Dashboard →
              </Link>
            </div>
          ) : (
            <UpgradeButton />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Pembayaran via transfer bank manual</p>
          <p className="text-xs text-gray-400">
            Setelah transfer, upload bukti pembayaran dan akses akan diaktifkan dalam 1×24 jam kerja.
          </p>
        </div>

        {!isSubscriber && (
          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/dashboard" className="hover:text-gray-700">Lanjut dengan free trial</Link>
          </p>
        )}
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Check } from 'lucide-react'

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 mb-8 self-start max-w-2xl w-full">
        ← Kembali ke Dashboard
      </Link>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upgrade ke Subscriber</h1>
          <p className="text-gray-500 text-sm">Buka semua fitur dan buat sesi Value Ladder tak terbatas.</p>
        </div>

        <div className="bg-violet-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-end gap-2 mb-1">
            <span className="text-3xl font-bold">Rp 99.000</span>
            <span className="text-violet-200 text-sm pb-1">/bulan</span>
          </div>
          <p className="text-violet-200 text-xs mb-6">atau Rp 799.000/tahun — hemat 33%</p>
          <ul className="space-y-3 mb-6">
            {[
              'Sesi Value Ladder tak terbatas',
              'Ekspor PDF siap presentasi',
              'Simpan & lanjutkan sesi kapan saja',
              'Template 5 industri (skincare, coaching, F&B, agency, SaaS)',
              'Semua fitur free trial',
            ].map(f => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check size={15} className="text-violet-200 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <p className="text-center text-xs text-violet-200">
            Integrasi pembayaran (Midtrans/Stripe) akan dikonfigurasi setelah setup production.
          </p>
        </div>

        <Link href="/dashboard" className="block text-center text-sm text-gray-500 hover:text-gray-700">
          Lanjut dengan free trial
        </Link>
      </div>
    </div>
  )
}

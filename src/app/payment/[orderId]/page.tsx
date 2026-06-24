import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRupiah } from '@/lib/billing'
import PaymentForm from './PaymentForm'

const BANK_INFO = {
  bank: 'BCA',
  noRek: '1234567890',
  atasNama: 'Value Ladder Builder',
}

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function PaymentPage({ params }: Props) {
  const { orderId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: order } = await supabase
    .from('payment_orders')
    .select('id, amount, unique_code, status, sender_name, created_at')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (!order) redirect('/upgrade')

  const totalAmount = order.amount + parseInt(order.unique_code.split('-')[2] ?? '0')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-gray-900">Value Ladder Builder</Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Pembayaran Subscriber</h1>

        {order.status === 'verified' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
            <p className="font-semibold text-emerald-800 mb-1">Akses sudah aktif!</p>
            <p className="text-sm text-emerald-600">Pembayaran Anda telah diverifikasi. Selamat menggunakan Value Ladder Builder.</p>
            <Link href="/dashboard" className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">
              Kembali ke Dashboard →
            </Link>
          </div>
        )}

        {order.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <p className="font-semibold text-red-800 mb-1">Pembayaran ditolak</p>
            <p className="text-sm text-red-600">Silakan hubungi admin atau buat order baru.</p>
          </div>
        )}

        {(order.status === 'pending') && (
          <>
            {/* Instruksi transfer */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
              <h2 className="font-semibold text-gray-900 mb-3">Transfer ke rekening berikut</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank</span>
                  <span className="font-medium text-gray-900">{BANK_INFO.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">No. Rekening</span>
                  <span className="font-mono font-medium text-gray-900">{BANK_INFO.noRek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Atas Nama</span>
                  <span className="font-medium text-gray-900">{BANK_INFO.atasNama}</span>
                </div>
                <div className="border-t border-gray-50 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jumlah Transfer</span>
                    <span className="font-bold text-violet-600 text-base">{formatRupiah(totalAmount)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Kode unik <span className="font-mono font-medium">{order.unique_code}</span> sudah termasuk dalam jumlah transfer.
                    Nominal ini memudahkan verifikasi otomatis.
                  </p>
                </div>
              </div>
            </div>

            {/* Form bukti */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              {order.sender_name ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-amber-500 text-xl">⏳</span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Menunggu Verifikasi</p>
                  <p className="text-sm text-gray-500">Bukti transfer dari <strong>{order.sender_name}</strong> sudah kami terima. Admin akan memverifikasi dalam 1×24 jam kerja.</p>
                </div>
              ) : (
                <PaymentForm orderId={order.id} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

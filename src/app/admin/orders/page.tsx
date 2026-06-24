import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatRupiah } from '@/lib/billing'
import OrderActions from './OrderActions'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const adminClient = createAdminClient()
  const { data: orders } = await adminClient
    .from('payment_orders')
    .select(`
      id, plan, amount, unique_code, status, sender_name, sender_bank, transfer_date, proof_url, admin_notes, created_at, verified_at, rejected_at,
      user_id
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: profileMap } = await adminClient
    .from('profiles')
    .select('id, email, tier')
    .in('id', (orders ?? []).map(o => o.user_id))

  const profileById = Object.fromEntries((profileMap ?? []).map(p => [p.id, p]))

  const statusLabel: Record<string, string> = {
    pending: 'Menunggu',
    verified: 'Diverifikasi',
    rejected: 'Ditolak',
    expired: 'Kedaluwarsa',
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    expired: 'bg-gray-50 text-gray-500 border-gray-200',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-gray-900">Value Ladder Builder</Link>
          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">Admin</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Verifikasi Pembayaran</h1>

        {(!orders || orders.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            Belum ada order pembayaran.
          </div>
        )}

        <div className="grid gap-4">
          {orders?.map(order => {
            const prof = profileById[order.user_id]
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${statusColor[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{order.unique_code}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{prof?.email ?? order.user_id}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatRupiah(order.amount)}</p>
                    <p className="text-xs text-gray-400">{order.plan}</p>
                  </div>
                </div>

                {(order.sender_name || order.sender_bank || order.transfer_date) && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 mb-3 text-sm text-gray-600 space-y-1">
                    {order.sender_name && <p>Pengirim: <span className="font-medium text-gray-900">{order.sender_name}</span></p>}
                    {order.sender_bank && <p>Bank: <span className="font-medium text-gray-900">{order.sender_bank}</span></p>}
                    {order.transfer_date && <p>Tanggal: <span className="font-medium text-gray-900">{order.transfer_date}</span></p>}
                    {order.proof_url && (
                      <p>
                        Bukti:{' '}
                        <a href={order.proof_url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline font-medium">
                          Lihat file
                        </a>
                      </p>
                    )}
                  </div>
                )}

                {order.admin_notes && (
                  <p className="text-xs text-gray-500 bg-yellow-50 px-3 py-2 rounded-lg mb-3">
                    Catatan: {order.admin_notes}
                  </p>
                )}

                {order.status === 'pending' && (
                  <OrderActions orderId={order.id} userId={order.user_id} />
                )}

                {order.status === 'verified' && (
                  <p className="text-xs text-emerald-600">
                    Diverifikasi: {order.verified_at ? new Date(order.verified_at).toLocaleString('id-ID') : '-'}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

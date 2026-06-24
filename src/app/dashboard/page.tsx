import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, ArrowRight, CheckCircle2, Clock } from 'lucide-react'
import { TIER_LABELS } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: sessions }] = await Promise.all([
    supabase.from('profiles').select('is_subscriber, tier, role').eq('id', user.id).single(),
    supabase.from('sessions')
      .select('id, title, current_step, is_complete, updated_at, product_name, product_type, current_tier, priority_tier')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
  ])

  const isSubscriber = profile?.is_subscriber || profile?.tier === 'subscriber' || profile?.tier === 'beta'
  const isAdmin = profile?.role === 'admin'
  const canCreateNew = isSubscriber || (sessions?.length ?? 0) === 0

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight">Value Ladder Builder</Link>
          <div className="flex items-center gap-3">
            {isSubscriber ? (
              <Badge variant="violet">Subscriber</Badge>
            ) : (
              <Link href="/upgrade" className="text-xs text-violet-600 font-medium hover:underline">Upgrade →</Link>
            )}
            {isAdmin && (
              <Link href="/admin/orders" className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium hover:bg-red-200 transition-colors">
                Admin
              </Link>
            )}
            <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              Pengaturan
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                Keluar
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sesi Value Ladder</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isSubscriber ? 'Sesi tak terbatas' : `${sessions?.length ?? 0}/1 sesi free trial`}
            </p>
          </div>
          {canCreateNew ? (
            <Link
              href="/session/new"
              className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-violet-700 transition-colors"
            >
              <Plus size={16} /> Buat Sesi Baru
            </Link>
          ) : (
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-violet-700 transition-colors"
            >
              Upgrade untuk Sesi Baru
            </Link>
          )}
        </div>

        {/* Empty state */}
        {(!sessions || sessions.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="text-violet-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Belum ada sesi</h3>
            <p className="text-sm text-gray-500 mb-6">Buat sesi pertama Anda dan mulai susun Value Ladder bisnis Anda.</p>
            <Link href="/session/new" className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors">
              <Plus size={16} /> Buat Sesi Pertama
            </Link>
          </div>
        )}

        {/* Session list */}
        <div className="grid gap-4">
          {sessions?.map(session => {
            const tierInfo = session.current_tier ? TIER_LABELS[session.current_tier] : null
            return (
              <Link
                key={session.id}
                href={`/session/${session.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-violet-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {session.is_complete ? (
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      ) : (
                        <Clock size={15} className="text-amber-500 shrink-0" />
                      )}
                      <h3 className="font-medium text-gray-900 truncate">{session.title || session.product_name || 'Tanpa judul'}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {session.product_type && (
                        <Badge>{session.product_type}</Badge>
                      )}
                      {tierInfo && (
                        <Badge variant="violet">Tier {session.current_tier} — {tierInfo.label}</Badge>
                      )}
                      <span className="text-xs text-gray-400">
                        Langkah {session.current_step}/7 · {new Date(session.updated_at!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-violet-500 shrink-0 mt-0.5 transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

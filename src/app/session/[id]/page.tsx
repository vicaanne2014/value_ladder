import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import WizardShell from '@/components/wizard/WizardShell'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: session }, { data: profile }] = await Promise.all([
    supabase.from('sessions').select('*, tier_entries(*)').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('profiles').select('is_subscriber').eq('id', user.id).single(),
  ])

  if (!session) notFound()

  const isSubscriber = profile?.is_subscriber ?? false

  return <WizardShell isSubscriber={isSubscriber} initialSession={session} />
}

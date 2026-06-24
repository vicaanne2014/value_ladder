import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WizardShell from '@/components/wizard/WizardShell'

export default async function NewSessionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_subscriber')
    .eq('id', user.id)
    .single()

  const isSubscriber = profile?.is_subscriber ?? false

  // Cek batas sesi free trial
  if (!isSubscriber) {
    const { count } = await supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 1) redirect('/upgrade')
  }

  return <WizardShell isSubscriber={isSubscriber} />
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { StepIndicator } from './StepIndicator'
import Step1Profile from './Step1Profile'
import Step2VLMS from './Step2VLMS'
import Step3Tiers from './Step3Tiers'
import Step4Ideas from './Step4Ideas'
import Step5Funnel from './Step5Funnel'
import Step6Traffic from './Step6Traffic'
import Step7Output from './Step7Output'
import type { Session, GeminiTierResponse, GeminiFunnelResponse, GeminiTrafficResponse } from '@/types'

interface Props {
  isSubscriber: boolean
  initialSession?: Session
}

export default function WizardShell({ isSubscriber, initialSession }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(initialSession?.current_step ?? 1)
  const [session, setSession] = useState<Partial<Session>>(initialSession ?? {})

  // Langkah-spesifik state
  const [tierResult, setTierResult] = useState<GeminiTierResponse | null>(null)
  const [priorityTier, setPriorityTier] = useState<number>(0)
  const [selectedIdea, setSelectedIdea] = useState('')
  const [funnelResult, setFunnelResult] = useState<GeminiFunnelResponse | null>(null)
  const [trafficResult, setTrafficResult] = useState<GeminiTrafficResponse | null>(null)

  async function createOrUpdateSession(data: Partial<Session>): Promise<Session> {
    if (session.id) {
      const res = await fetch(`/api/session/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    } else {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const created = await res.json()
      router.replace(`/session/${created.id}`)
      return created
    }
  }

  async function handleStep1(data: Parameters<typeof Step1Profile>[0]['onNext'] extends (d: infer D) => void ? D : never) {
    const created = await createOrUpdateSession({ ...data, current_step: 2 })
    setSession(s => ({ ...s, ...created, ...data }))
    setStep(2)
  }

  async function handleStep2(vlms: string) {
    await fetch(`/api/session/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vlms, current_step: 3 }),
    })
    setSession(s => ({ ...s, vlms, current_step: 3 }))
    setStep(3)
  }

  async function handleStep3(result: GeminiTierResponse) {
    setTierResult(result)
    setSession(s => ({
      ...s,
      current_tier: result.current_tier,
      priority_tier: result.priority_tier,
      current_step: 4,
    }))
    setStep(4)
  }

  async function handleStep4(tier: number, idea: string) {
    setPriorityTier(tier)
    setSelectedIdea(idea)
    setStep(5)
  }

  async function handleStep5(result: GeminiFunnelResponse) {
    setFunnelResult(result)
    setSession(s => ({
      ...s,
      tier_entries: s.tier_entries?.map(t =>
        t.tier_number === priorityTier
          ? { ...t, selected_idea: selectedIdea, funnel_type: result.funnel_type, funnel_steps: result.funnel_steps }
          : t
      ),
    }))
    setStep(6)
  }

  async function handleStep6(result: GeminiTrafficResponse) {
    setTrafficResult(result)
    setSession(s => ({
      ...s,
      tier_entries: s.tier_entries?.map(t =>
        t.tier_number === priorityTier
          ? { ...t, traffic_recs: result.traffic_recs }
          : t
      ),
    }))
    setStep(7)
  }

  const STEP_TITLES: Record<number, string> = {
    1: 'Profil Produk',
    2: 'Misi Bisnis (VLMS)',
    3: 'Peta Tier',
    4: 'Pilih Prioritas',
    5: 'Rekomendasi Funnel',
    6: 'Strategi Traffic & Iklan',
    7: 'Hasil Value Ladder',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</Link>
          <span className="text-sm font-medium text-gray-900">{STEP_TITLES[step]}</span>
          <span className="text-xs text-gray-400">{step}/7</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Step indicator */}
        <div className="mb-6">
          <StepIndicator current={step} />
        </div>

        {/* VLMS header (langkah 2+) */}
        {step >= 2 && session.vlms && (
          <div className="mb-4 bg-violet-50 border border-violet-100 rounded-xl px-4 py-2.5 text-xs text-violet-700">
            <span className="font-medium">Misi:</span> {session.vlms}
          </div>
        )}

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {step === 1 && (
            <Step1Profile onNext={handleStep1} isSubscriber={isSubscriber} />
          )}
          {step === 2 && (
            <Step2VLMS session={session} onNext={handleStep2} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <Step3Tiers session={session} onNext={handleStep3} onBack={() => setStep(2)} />
          )}
          {step === 4 && tierResult && (
            <Step4Ideas
              tierResult={tierResult}
              tierEntries={session.tier_entries ?? []}
              sessionId={session.id ?? ''}
              sessionData={session as Record<string, unknown>}
              onNext={handleStep4}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <Step5Funnel
              session={session}
              priorityTier={priorityTier}
              selectedIdea={selectedIdea}
              onNext={handleStep5}
              onBack={() => setStep(4)}
            />
          )}
          {step === 6 && funnelResult && (
            <Step6Traffic
              session={session}
              priorityTier={priorityTier}
              funnelType={funnelResult.funnel_type}
              onNext={handleStep6}
              onBack={() => setStep(5)}
            />
          )}
          {step === 7 && (
            <Step7Output
              session={session}
              isSubscriber={isSubscriber}
              onRedo={() => setStep(4)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

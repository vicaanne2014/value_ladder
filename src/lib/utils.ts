import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number | null | undefined): string {
  if (amount == null) return 'Belum ditentukan'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export const TIER_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Bait / Lead Magnet', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  2: { label: 'Entry Offer', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  3: { label: 'Core / Flagship', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  4: { label: 'Premium / Back-End', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
}

export const FUNNEL_LABELS: Record<string, string> = {
  lead: 'Lead Funnel',
  unboxing: 'Unboxing Funnel',
  presentation: 'Presentation Funnel',
  application: 'Application Funnel',
}

export const TEMP_LABELS: Record<string, { label: string; color: string }> = {
  cold: { label: 'Cold Traffic', color: 'text-sky-600' },
  warm: { label: 'Warm Traffic', color: 'text-orange-500' },
  hot: { label: 'Hot Traffic', color: 'text-red-600' },
}

export const INDUSTRY_OPTIONS = [
  { value: 'skincare', label: 'Skincare / Kecantikan' },
  { value: 'coaching', label: 'Coaching / Edukasi' },
  { value: 'fnb', label: 'Food & Beverage (F&B)' },
  { value: 'agency', label: 'Agency / Konsultan' },
  { value: 'saas', label: 'Software / SaaS' },
]

export type ProductType = 'digital' | 'fisik' | 'jasa'
export type InputSource = 'form' | 'pdf'
export type TierStatus = 'existing' | 'planned' | 'empty'
export type FunnelType = 'lead' | 'unboxing' | 'presentation' | 'application'
export type AudienceTemp = 'cold' | 'warm' | 'hot'

export interface TrafficRec {
  channel: string
  audience_temp: AudienceTemp
  kpi: string
  tips?: string
}

export interface TierEntry {
  id?: string
  session_id?: string
  tier_number: 1 | 2 | 3 | 4
  status: TierStatus
  product_ideas: string[]
  selected_idea?: string | null
  funnel_type?: FunnelType | null
  funnel_steps: string[]
  traffic_recs: TrafficRec[]
}

export interface Session {
  id?: string
  user_id?: string
  title?: string
  current_step: number
  is_complete: boolean
  created_at?: string
  updated_at?: string

  // product profile
  product_name?: string
  product_type?: ProductType
  price_idr?: number | null
  target_buyer?: string
  is_active?: boolean
  input_source?: InputSource
  pdf_url?: string | null
  industry?: string | null

  // AI outputs
  vlms?: string
  current_tier?: 1 | 2 | 3 | 4
  current_tier_reason?: string
  priority_tier?: 1 | 2 | 3 | 4
  executive_summary?: string

  // joined
  tier_entries?: TierEntry[]
}

export interface Profile {
  id: string
  email?: string
  is_subscriber: boolean
  subscribed_at?: string
  created_at: string
}

// Gemini response shapes
export interface GeminiVLMSResponse {
  vlms: string
  product_name_confirmed: string
  product_type_confirmed: ProductType
}

export interface GeminiTierResponse {
  current_tier: 1 | 2 | 3 | 4
  reason: string
  priority_tier: 1 | 2 | 3 | 4
  priority_reason: string
  tiers: {
    tier_number: 1 | 2 | 3 | 4
    status: TierStatus
    product_ideas: string[]
  }[]
}

export interface GeminiTierIdea {
  idea: string
  description: string
  estimated_production_time: string
  price_suggestion: string
}

export interface GeminiFunnelResponse {
  tier_number: 1 | 2 | 3 | 4
  funnel_type: FunnelType
  funnel_steps: string[]
  supporting_elements: string[]
}

export interface GeminiTrafficResponse {
  tier_number: 1 | 2 | 3 | 4
  traffic_recs: TrafficRec[]
  budget_notes: string
}

export interface GeminiExecutiveSummary {
  summary: string
  start_here: string
  first_funnel: string
  first_channel: string
  estimated_setup_weeks: number
}

// Industry templates
export type Industry = 'skincare' | 'coaching' | 'fnb' | 'agency' | 'saas'

export interface IndustryTemplate {
  id: Industry
  label: string
  product_type: ProductType
  vlms_template: string
  tier1_default: string
  tier2_default: string
  tier3_default: string
  tier4_default: string
}

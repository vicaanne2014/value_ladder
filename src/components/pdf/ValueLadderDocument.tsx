import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Session } from '@/types'

const TIER_NAMES: Record<number, string> = {
  1: 'Tier 1 — Bait / Lead Magnet',
  2: 'Tier 2 — Entry Offer',
  3: 'Tier 3 — Core / Flagship',
  4: 'Tier 4 — Premium / Back-End',
}

const FUNNEL_NAMES: Record<string, string> = {
  lead: 'Lead Funnel',
  unboxing: 'Unboxing Funnel',
  presentation: 'Presentation Funnel',
  application: 'Application Funnel',
}

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', padding: 40, lineHeight: 1.5 },
  header: { marginBottom: 24, borderBottom: '2pt solid #7c3aed', paddingBottom: 12 },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#7c3aed', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#6b7280' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 8, borderBottom: '1pt solid #e5e7eb', paddingBottom: 4 },
  vlmsBox: { backgroundColor: '#f5f3ff', border: '1pt solid #ddd6fe', borderRadius: 6, padding: 10, marginBottom: 20 },
  vlmsLabel: { fontSize: 8, color: '#7c3aed', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  vlmsText: { fontSize: 11, color: '#1e1b4b', fontFamily: 'Helvetica-BoldOblique' },
  tierBox: { border: '1pt solid #e5e7eb', borderRadius: 6, padding: 10, marginBottom: 8 },
  tierLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#7c3aed', marginBottom: 3 },
  tierIdea: { fontSize: 10, color: '#374151', marginBottom: 4 },
  funnelTag: { fontSize: 8, color: '#7c3aed', backgroundColor: '#ede9fe', padding: '2 6', borderRadius: 4, marginBottom: 4 },
  step: { fontSize: 9, color: '#4b5563', marginBottom: 3, paddingLeft: 8 },
  trafficItem: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  trafficChannel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111827', flex: 1 },
  trafficKpi: { fontSize: 9, color: '#6b7280', flex: 2 },
  summaryBox: { backgroundColor: '#f9fafb', border: '1pt solid #e5e7eb', borderRadius: 6, padding: 10, marginBottom: 8 },
  summaryLabel: { fontSize: 8, color: '#6b7280', marginBottom: 2 },
  summaryValue: { fontSize: 10, color: '#111827', fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: '0.5pt solid #e5e7eb', paddingTop: 6 },
  footerText: { fontSize: 8, color: '#9ca3af' },
})

interface Props {
  session: Session & { tier_entries?: Session['tier_entries'] }
}

export function ValueLadderPDFDocument({ session }: Props) {
  const tiers = session.tier_entries ?? []
  const priorityTier = tiers.find(t => t.tier_number === session.priority_tier)

  return (
    <Document title={`Value Ladder — ${session.product_name}`}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Value Ladder Builder</Text>
          <Text style={s.subtitle}>
            {session.product_name} · {session.product_type} · Dibuat {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* VLMS */}
        <View style={s.vlmsBox}>
          <Text style={s.vlmsLabel}>MISI BISNIS (VLMS)</Text>
          <Text style={s.vlmsText}>{session.vlms}</Text>
        </View>

        {/* Executive Summary */}
        {session.executive_summary && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Ringkasan Eksekutif</Text>
            <Text style={{ fontSize: 10, color: '#374151', lineHeight: 1.6 }}>{session.executive_summary}</Text>
          </View>
        )}

        {/* Peta Tier */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Peta Value Ladder</Text>
          {[1, 2, 3, 4].map(t => {
            const entry = tiers.find(x => x.tier_number === t)
            return (
              <View key={t} style={s.tierBox}>
                <Text style={s.tierLabel}>{TIER_NAMES[t]}{t === session.current_tier ? ' ← Produk Anda' : ''}</Text>
                {entry?.selected_idea ? (
                  <Text style={s.tierIdea}>{entry.selected_idea}</Text>
                ) : entry?.product_ideas && (entry.product_ideas as string[]).length > 0 ? (
                  <>
                    <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 3 }}>Ide yang bisa dibangun:</Text>
                    {(entry.product_ideas as string[]).map((idea, i) => (
                      <Text key={i} style={{ ...s.step, color: '#6b7280' }}>• {idea}</Text>
                    ))}
                  </>
                ) : (
                  <Text style={{ ...s.tierIdea, color: '#9ca3af', fontFamily: 'Helvetica-Oblique' }}>Belum ada ide</Text>
                )}
                {entry?.funnel_type && (
                  <Text style={s.funnelTag}>{FUNNEL_NAMES[entry.funnel_type]}</Text>
                )}
                {entry?.funnel_steps && entry.funnel_steps.length > 0 && (
                  <>
                    <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 2 }}>Langkah funnel:</Text>
                    {entry.funnel_steps.map((step, i) => (
                      <Text key={i} style={s.step}>• {step}</Text>
                    ))}
                  </>
                )}
                {entry?.traffic_recs && entry.traffic_recs.length > 0 && (
                  <>
                    <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 4, marginBottom: 2 }}>Traffic:</Text>
                    {entry.traffic_recs.map((r, i) => (
                      <View key={i} style={s.trafficItem}>
                        <Text style={s.trafficChannel}>{r.channel}</Text>
                        <Text style={s.trafficKpi}>KPI: {r.kpi}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            )
          })}
        </View>

        {/* Prioritas Eksekusi */}
        {priorityTier && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Mulai dari Mana</Text>
            <View style={s.summaryBox}>
              <Text style={s.summaryLabel}>Tier prioritas pertama</Text>
              <Text style={s.summaryValue}>{TIER_NAMES[session.priority_tier!]}</Text>
            </View>
            {priorityTier.selected_idea && (
              <View style={s.summaryBox}>
                <Text style={s.summaryLabel}>Produk/penawaran</Text>
                <Text style={s.summaryValue}>{priorityTier.selected_idea}</Text>
              </View>
            )}
            {priorityTier.funnel_type && (
              <View style={s.summaryBox}>
                <Text style={s.summaryLabel}>Funnel yang dibangun</Text>
                <Text style={s.summaryValue}>{FUNNEL_NAMES[priorityTier.funnel_type]}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Value Ladder Builder — Berbasis DotCom Secrets & Expert Secrets (Russell Brunson)</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

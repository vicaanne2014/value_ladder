// System prompt Gemini — diadaptasi dari SKILL.md + tiga file referensi skill value-ladder-builder

export const VALUE_LADDER_SYSTEM_PROMPT = `
Kamu adalah konsultan strategi penjualan ahli yang membantu pemilik bisnis Indonesia menyusun Value Ladder — tangga nilai produk dari penawaran gratis/murah sampai premium.

Kerangka kerja ini diadaptasi dari konsep Russell Brunson (DotCom Secrets & Expert Secrets), disesuaikan untuk konteks Indonesia: mata uang Rupiah, platform Shopee/Tokopedia/WhatsApp/Meta Ads/TikTok Ads.

## Prinsip Utama Value Ladder

Value Ladder adalah peta seluruh penawaran dalam satu bisnis, disusun dari paling murah/gratis (bawah tangga) hingga paling mahal (puncak). Semakin tinggi tangganya:
- Semakin besar nilai yang diberikan kepada pelanggan
- Semakin besar harga yang dibayar pelanggan
- Semakin dalam hubungan antara bisnis dan pelanggan

## Empat Tier Harga

| Tier | Label | Rentang Harga IDR | Tujuan Utama |
|------|-------|-------------------|--------------|
| 1 | Bait / Lead Magnet | Gratis – Rp 50.000 | Akuisisi lead, kumpulkan kontak, buktikan nilai kecil |
| 2 | Entry Offer | Rp 15.000 – Rp 1.500.000 | Konversi lead jadi pembeli pertama kali |
| 3 | Core / Flagship | Rp 1.500.000 – Rp 30.000.000 | Produk utama, mesin profit utama |
| 4 | Premium / Back-End | > Rp 30.000.000 | Layanan intensif, LTV tertinggi, hubungan personal |

Catatan: rentang harga adalah acuan, bukan rumus baku. Yang terpenting adalah lompatan nilai dan lompatan harga yang masuk akal antar tier.

## Empat Jenis Funnel

### Tier 1 — Lead Funnel
Tujuan: kumpulkan kontak (nama, email, WhatsApp), bukan jual.
Struktur: Squeeze page → Form opt-in → Thank you page (langsung tawarkan Tier 2)
Variasi: squeeze funnel, survey funnel, sample/trial funnel

### Tier 2 — Unboxing Funnel
Tujuan: ubah lead jadi pembeli pertama, tambah nilai transaksi via order bump & upsell.
Struktur: Halaman penawaran murah → Order bump (checkout) → Upsell 1-klik → Downsell jika ditolak → Thank you page
Variasi: buku/produk fisik gratis ongkir, cart funnel, challenge funnel

### Tier 3 — Presentation Funnel
Tujuan: jual produk utama, butuh edukasi & pembangunan kepercayaan dulu.
Struktur: Registrasi → Webinar/VSL (ceritakan masalah, solusi lama gagal, solusi baru) → Closing dengan bonus & urgensi → Checkout
Variasi: webinar funnel (live/rekaman), VSL funnel, product launch funnel (3-4 video/email)

### Tier 4 — Application Funnel
Tujuan: jual harga tinggi via percakapan manusia (sales call), bukan otomatis.
Struktur: Landing page premium → Form aplikasi (saring calon serius) → Penjadwalan call → Sesi closing (setter + closer) → Onboarding

## Funnel Stacking
Cara memindahkan pelanggan dari satu tier ke tier berikutnya secara otomatis:
- Thank you page setiap funnel → langsung tampilkan undangan funnel tier berikutnya
- Email/WhatsApp follow-up setelah pembelian → undangan bertahap ke tier berikutnya
- Saat produk/layanan tier ini selesai dirasakan manfaatnya → saat terbaik tawarkan tier berikutnya

## Strategi Traffic per Tier

### Suhu Audiens
- Cold traffic: belum kenal brand → tawarkan Tier 1 (resistensi rendah)
- Warm traffic: sudah berinteraksi (follower, retargeting) → Tier 2-3
- Hot traffic: pelanggan lama, list WA/email aktif → Tier 3-4 dan retensi

### Rekomendasi Kanal
- Tier 1: Meta Ads/TikTok Ads (cold B2C), Google Search Ads (aktif cari solusi), konten organik → KPI: CPL, conversion rate opt-in
- Tier 2: Retargeting ke opt-in Tier 1, email/WA sequence follow-up, iklan testimoni/before-after → KPI: AOV, tingkat konversi checkout
- Tier 3: Webinar/VSL dipromosikan ke warm+hot traffic, lookalike dari pembeli → KPI: show-up rate webinar, konversi hadir→beli, CPA
- Tier 4: Email/WA personal ke pelanggan existing, iklan sangat tersegmentasi, closing via sales call → KPI: closing rate dari aplikasi, LTV

## Prinsip Penting
1. JANGAN rekomendasikan semua tier dibangun sekaligus. Satu tier dulu, buktikan profitable, baru kembangkan.
2. Front-end harus spesifik dan bernilai nyata, bukan generik ("konsultasi gratis" → kalah vs "audit gratis + laporan PDF").
3. Selalu ada langkah jelas berikutnya setelah pelanggan selesai di satu tier (funnel stacking).
4. Produk fisik: hitung margin realistis termasuk ongkos produksi, logistik, stok.
5. Selalu gunakan Rupiah dan konteks Indonesia kecuali user menyatakan pasar lain.

## Format Output
Selalu kembalikan JSON yang valid dan terstruktur sesuai instruksi spesifik per endpoint. Jangan tambahkan teks di luar JSON kecuali diminta.
`

// Ide tier per jenis produk (untuk fallback/context)
export const TIER_IDEAS_BY_TYPE = {
  digital: {
    1: ['Ebook/checklist gratis PDF', 'Webinar gratis 60 menit', 'Mini-kelas video 3 hari', 'Template gratis download'],
    2: ['Ebook berbayar Rp 49.000–199.000', 'Mini-course 5 modul', 'Template/toolkit digital berbayar', 'Challenge 5 hari berbayar'],
    3: ['Kursus flagship lengkap', 'Bootcamp intensif', 'Software/membership bulanan', 'Program mentoring grup'],
    4: ['Coaching 1-on-1 bulanan', 'Mastermind eksklusif', 'Done-for-you service', 'Lisensi/white-label'],
  },
  fisik: {
    1: ['Sample gratis (bayar ongkir)', 'Trial pack ukuran kecil', 'Panduan/ebook edukasi produk', 'Free sample di marketplace'],
    2: ['Produk single unit / starter pack', 'Bundle kecil 2-3 item', 'Versi mini/trial berbayar', 'Produk entry dengan order bump'],
    3: ['Bundle besar / paket lengkap', 'Subscription replenishment bulanan', 'Versi premium/lini lanjutan', 'Paket langganan hemat'],
    4: ['Paket VIP eksklusif', 'Kerja sama B2B / bulk order', 'Layanan custom/private label', 'Program distributor / reseller premium'],
  },
  jasa: {
    1: ['Konsultasi awal gratis 30 menit', 'Free audit/cek awal', 'Free report/analisis singkat', 'Webinar edukasi gratis'],
    2: ['Layanan dasar single session', 'Paket kecil 2-3 sesi', 'Trial layanan berbayar', 'Audit berbayar dengan laporan'],
    3: ['Paket lengkap multi-sesi', 'Retainer bulanan standar', 'Program 3 bulan', 'Layanan ongoing bulanan'],
    4: ['Program premium/VIP', 'Retainer jangka panjang eksklusif', 'Kemitraan strategis', 'Done-for-you premium'],
  },
}

// Template per industri
export const INDUSTRY_TEMPLATES = {
  skincare: {
    label: 'Skincare / Kecantikan',
    product_type: 'fisik' as const,
    vlms_template: 'Kami membantu [wanita Indonesia usia 25-40] untuk [mendapatkan kulit sehat & cerah alami] melalui [rangkaian perawatan kulit berbahan aktif terpilih].',
    tier1_default: 'Sample gratis + bayar ongkir (starter kit mini 3ml)',
    tier2_default: 'Starter pack 30ml (1 bulan pemakaian) + order bump toner murah',
    tier3_default: 'Bundle paket lengkap 3-6 bulan + program perawatan rutin',
    tier4_default: 'Program VIP: konsultasi kulit personal + produk custom formulasi',
  },
  coaching: {
    label: 'Coaching / Edukasi',
    product_type: 'digital' as const,
    vlms_template: 'Kami membantu [profesional muda Indonesia] untuk [mencapai [hasil spesifik]] melalui [metode/sistem unik kami].',
    tier1_default: 'Webinar gratis 60 menit / ebook panduan singkat',
    tier2_default: 'Mini-course online 5 modul Rp 97.000–297.000',
    tier3_default: 'Program coaching grup intensif 3 bulan',
    tier4_default: 'Coaching 1-on-1 bulanan Rp 5-15 juta/bulan',
  },
  fnb: {
    label: 'Food & Beverage (F&B)',
    product_type: 'fisik' as const,
    vlms_template: 'Kami membantu [pecinta kuliner Indonesia] untuk [menikmati [produk spesifik] berkualitas premium di rumah] melalui [produk artisanal buatan tangan kami].',
    tier1_default: 'Trial pack sample / tester 1 porsi (bayar ongkir)',
    tier2_default: 'Paket starter 3-5 porsi / varian terlaris',
    tier3_default: 'Subscription box bulanan / paket hemat 3 bulan',
    tier4_default: 'Kerja sama B2B (kafe, restoran, hotel) / custom catering',
  },
  agency: {
    label: 'Agency / Konsultan',
    product_type: 'jasa' as const,
    vlms_template: 'Kami membantu [bisnis UMKM Indonesia] untuk [mencapai [hasil bisnis spesifik]] melalui [layanan [jenis layanan] terstruktur kami].',
    tier1_default: 'Free audit / analisis singkat + laporan PDF',
    tier2_default: 'Paket starter: 1 proyek atau 3 sesi konsultasi',
    tier3_default: 'Retainer bulanan: layanan penuh ongoing',
    tier4_default: 'Kemitraan strategis / done-for-you premium jangka panjang',
  },
  saas: {
    label: 'Software / SaaS',
    product_type: 'digital' as const,
    vlms_template: 'Kami membantu [target pengguna] untuk [menyelesaikan masalah spesifik] melalui [software/platform kami yang mudah digunakan].',
    tier1_default: 'Free trial 14 hari tanpa kartu kredit',
    tier2_default: 'Paket Starter bulanan Rp 99.000–299.000/bulan',
    tier3_default: 'Paket Pro / Business bulanan dengan fitur lengkap',
    tier4_default: 'Paket Enterprise: custom, onboarding personal, SLA',
  },
}

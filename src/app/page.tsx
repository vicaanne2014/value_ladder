import Link from 'next/link'
import { ArrowRight, BarChart3, FileText, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-gray-900 tracking-tight">Value Ladder Builder</span>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              Masuk
            </Link>
            <Link href="/auth/register" className="text-sm font-medium bg-violet-600 text-white px-4 py-1.5 rounded-xl hover:bg-violet-700 transition-colors">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-medium px-3 py-1 rounded-full mb-6 border border-violet-100">
          <Zap size={12} />
          Powered by Gemini 2.5 Pro
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-2xl mb-4">
          Susun Value Ladder Bisnis Anda dalam{' '}
          <span className="text-violet-600">15 Menit</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mb-8 leading-relaxed">
          Dari satu produk yang sudah ada, bangun strategi penjualan lengkap — peta produk, funnel, dan iklan — berbasis kerangka Russell Brunson, disesuaikan untuk pasar Indonesia.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-violet-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors"
          >
            Coba Gratis Sekarang <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 bg-white text-gray-700 font-medium px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Sudah punya akun? Masuk
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <BarChart3 className="text-violet-600" size={24} />,
              title: 'Peta 4 Tier Produk',
              desc: 'Tempatkan produk Anda di tier yang tepat dan dapatkan 2–3 ide konkret untuk tier yang kosong.',
            },
            {
              icon: <ArrowRight className="text-violet-600" size={24} />,
              title: 'Rekomendasi Funnel',
              desc: 'Lead Funnel, Unboxing, Webinar, sampai Application Funnel — dipilihkan sesuai tier dan jenis produk.',
            },
            {
              icon: <FileText className="text-violet-600" size={24} />,
              title: 'Ekspor PDF Siap Pakai',
              desc: 'Download ringkasan eksekutif + peta lengkap dalam PDF yang bisa langsung dipresentasikan ke tim.',
            },
          ].map((f, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Harga Sederhana</h2>
          <p className="text-gray-500 text-sm">Coba gratis dulu, upgrade kalau mau lebih.</p>
        </div>
        <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="font-semibold text-gray-900 mb-1">Free Trial</div>
            <div className="text-3xl font-bold text-gray-900 mb-4">Gratis</div>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              {['1 sesi lengkap', 'Tampilan peta di layar', 'Semua 7 langkah wizard'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> {f}
                </li>
              ))}
              {['Ekspor PDF', 'Sesi tersimpan lebih dari 1'].map(f => (
                <li key={f} className="flex items-center gap-2 text-gray-400">
                  <span>✗</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/register" className="block text-center text-sm font-medium border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors">
              Mulai Gratis
            </Link>
          </div>
          <div className="bg-violet-600 rounded-2xl p-6 text-white">
            <div className="font-semibold mb-1">Subscriber</div>
            <div className="text-3xl font-bold mb-1">Rp 99.000<span className="text-lg font-normal opacity-75">/bulan</span></div>
            <div className="text-violet-200 text-xs mb-4">atau Rp 799.000/tahun (hemat 33%)</div>
            <ul className="text-sm space-y-2 mb-6">
              {['Sesi tak terbatas', 'Ekspor PDF', 'Simpan & lanjutkan sesi', 'Template 5 industri', 'Semua fitur free trial'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-violet-200">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/register" className="block text-center text-sm font-medium bg-white text-violet-600 rounded-xl py-2.5 hover:bg-violet-50 transition-colors">
              Mulai Berlangganan
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Value Ladder Builder — Berbasis kerangka DotCom Secrets &amp; Expert Secrets oleh Russell Brunson
      </footer>
    </main>
  )
}

import {
  AlertTriangle,
  ShieldCheck,
  FileText,
  TrendingUp,
  Utensils,
} from 'lucide-react';
import { projects, totalBudgetAudited, totalRedFlags, formatCompactRupiah } from '@/data/projects';
import { initialReports } from '@/data/reports';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface HeroProps {
  onJumpToAudit: () => void;
  onJumpToReports: () => void;
  onJumpToMbg: () => void;
}

interface Stat {
  label: string;
  value: number;
  format: (n: number) => string;
  icon: typeof ShieldCheck;
  accent: string;
  ring: string;
  glow: string;
  suffix?: string;
  caption: string;
}

export function Hero({ onJumpToAudit, onJumpToReports, onJumpToMbg }: HeroProps) {
  const totalLoss = projects.reduce((s, p) => {
    return s + p.rincianBarang.reduce((acc, b) => {
      const diff = b.hargaLPJ - b.hargaPasar;
      return acc + (diff > 0 ? diff * b.jumlah : 0);
    }, 0);
  }, 0);

  const stats: Stat[] = [
    {
      label: 'Total Anggaran Diaudit',
      value: totalBudgetAudited(),
      format: formatCompactRupiah,
      icon: TrendingUp,
      accent: 'text-sky-400',
      ring: 'ring-sky-400/30',
      glow: 'group-hover:shadow-glow-cyan',
      caption: `${projects.length} proyek terpantau`,
    },
    {
      label: 'Total Anomali Terdeteksi',
      value: totalRedFlags(),
      format: (n) => String(Math.round(n)),
      icon: AlertTriangle,
      accent: 'text-danger',
      ring: 'ring-danger/30',
      glow: 'group-hover:shadow-glow-red',
      suffix: ' Red Flag',
      caption: `Est. kerugian ${formatCompactRupiah(totalLoss)}`,
    },
    {
      label: 'Total Laporan Warga',
      value: initialReports.length,
      format: (n) => String(Math.round(n)),
      icon: FileText,
      accent: 'text-neon',
      ring: 'ring-neon/30',
      glow: 'group-hover:shadow-glow-green',
      suffix: ' Laporan',
      caption: 'Warga aktif melapor',
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-neon/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-danger/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10 animate-fade-in">
            <ShieldCheck size={14} className="text-neon" />
            Didukung AI Anomaly Detection &amp; Verifikasi On-chain
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-5xl sm:leading-[1.1] animate-fade-in-up">
            Kawal setiap rupiah
            <br />
            <span className="bg-gradient-to-r from-neon via-emerald-400 to-teal-300 bg-clip-text text-transparent text-glow-green">
              anggaran publik
            </span>
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl text-base text-slate-300 sm:text-lg animate-fade-in-up"
            style={{ animationDelay: '120ms' }}
          >
            KawalDana AI memindai LPJ proyek pemerintah, mendeteksi mark-up harga &amp;
            ketidaksesuaian realisasi, lalu memverifikasi temuan lewat laporan warga
            yang tervalidasi on-chain.
          </p>
          <div
            className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center animate-fade-in-up"
            style={{ animationDelay: '240ms' }}
          >
            <button
              onClick={onJumpToAudit}
              className="rounded-xl bg-gradient-to-r from-neon to-emerald-500 px-5 py-2.5 text-sm font-semibold text-ink-900 shadow-glow-green transition hover:shadow-[0_0_30px_-4px_rgba(34,197,94,0.7)]"
            >
              Mulai AI Audit LPJ
            </button>
            <button
              onClick={onJumpToMbg}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <Utensils size={15} className="text-neon" />
              Audit MBG Vision
            </button>
            <button
              onClick={onJumpToReports}
              className="rounded-xl bg-white/5 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
            >
              Lihat Laporan Warga
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '360ms' }}>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`group relative overflow-hidden rounded-2xl glass p-5 ring-1 ${s.ring} ${s.glow} transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      {s.label}
                    </p>
                    <p className={`mt-2 font-display text-2xl font-bold sm:text-3xl ${s.accent}`}>
                      <AnimatedNumber value={s.value} format={s.format} />
                      {s.suffix && <span className="text-base sm:text-lg">{s.suffix}</span>}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500">{s.caption}</p>
                  </div>
                  <span className={`shrink-0 rounded-xl bg-white/5 p-2.5 ${s.accent} ring-1 ring-white/10`}>
                    <Icon size={22} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

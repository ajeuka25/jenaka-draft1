import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import {
  projects,
  getRiskLevel,
  getEstimatedLoss,
  totalBudgetAudited,
  formatCompactRupiah,
  formatRupiah,
  type RiskLevel,
} from '@/data/projects';

interface Segment {
  level: RiskLevel;
  label: string;
  value: number;
  color: string;
  bg: string;
  text: string;
  icon: typeof ShieldCheck;
}

export function BudgetDonut() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(t);
  }, []);

  const total = totalBudgetAudited();
  const byLevel: Record<RiskLevel, number> = { aman: 0, waspada: 0, bahaya: 0 };
  projects.forEach((p) => {
    byLevel[getRiskLevel(p.skorRisiko)] += p.totalAnggaran;
  });
  const totalLoss = projects.reduce((s, p) => s + getEstimatedLoss(p), 0);

  const segments: Segment[] = (
    [
      {
        level: 'bahaya',
        label: 'Bahaya / Korupsi',
        value: byLevel.bahaya,
        color: '#EF4444',
        bg: 'bg-danger',
        text: 'text-danger',
        icon: AlertOctagon,
      },
      {
        level: 'waspada',
        label: 'Waspada',
        value: byLevel.waspada,
        color: '#F59E0B',
        bg: 'bg-amber-400',
        text: 'text-amber-400',
        icon: AlertTriangle,
      },
      {
        level: 'aman',
        label: 'Aman',
        value: byLevel.aman,
        color: '#22C55E',
        bg: 'bg-neon',
        text: 'text-neon',
        icon: ShieldCheck,
      },
    ] as Segment[]
  ).filter((s) => s.value > 0);

  const size = 200;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  let offsetAccum = 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Donut chart */}
      <div className="flex flex-col items-center justify-center rounded-2xl glass p-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              className="fill-none stroke-white/5"
            />
            {segments.map((seg) => {
              const pct = seg.value / total;
              const dash = pct * circ;
              const gap = circ - dash;
              const offset = -offsetAccum * circ;
              offsetAccum += pct;
              return (
                <circle
                  key={seg.level}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={stroke}
                  strokeLinecap="butt"
                  strokeDasharray={`${animate ? dash : 0} ${gap}`}
                  strokeDashoffset={offset}
                  className="fill-none transition-all duration-1000 ease-out"
                  style={{ stroke: seg.color, filter: `drop-shadow(0 0 4px ${seg.color}66)` }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">
              Total Anggaran
            </span>
            <span className="font-display text-xl font-bold text-white">
              {formatCompactRupiah(total)}
            </span>
            <span className="mt-1 text-[11px] text-slate-500">
              {projects.length} proyek
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-5 w-full space-y-2">
          {segments.map((seg) => {
            const pct = ((seg.value / total) * 100).toFixed(1);
            const Icon = seg.icon;
            return (
              <div
                key={seg.level}
                className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/5"
              >
                <span className={`h-3 w-3 shrink-0 rounded-full ${seg.bg}`} />
                <Icon size={15} className={`shrink-0 ${seg.text}`} />
                <span className="text-sm text-slate-300">{seg.label}</span>
                <span className="ml-auto flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {formatCompactRupiah(seg.value)}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ring-1 ${
                      seg.level === 'aman'
                        ? 'bg-neon/15 text-neon ring-neon/30'
                        : seg.level === 'waspada'
                          ? 'bg-amber-400/15 text-amber-400 ring-amber-400/30'
                          : 'bg-danger/15 text-danger ring-danger/30'
                    }`}
                  >
                    {pct}%
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anomaly impact panel */}
      <div className="flex flex-col gap-4 rounded-2xl glass p-6">
        <div>
          <h3 className="font-display text-base font-semibold text-white">
            Dampak Anomali terhadap Anggaran
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Perbandingan anggaran total vs potensi kerugian dari mark-up harga.
          </p>
        </div>

        {/* Big comparison bar */}
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-slate-300">Anggaran Diaudit</span>
              <span className="font-semibold text-white">
                {formatRupiah(total)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-1000 ease-out"
                style={{ width: animate ? '100%' : '0%' }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-danger">
                <AlertTriangle size={14} /> Potensi Kerugian
              </span>
              <span className="font-semibold text-danger">
                {formatRupiah(totalLoss)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-danger to-red-400 transition-all duration-1000 ease-out"
                style={{
                  width: animate ? `${(totalLoss / total) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Est. Kerugian
            </p>
            <p className="mt-1 font-display text-lg font-bold text-danger">
              {formatCompactRupiah(totalLoss)}
            </p>
          </div>
          <div className="rounded-xl border border-neon/20 bg-neon/10 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Anggaran Bersih
            </p>
            <p className="mt-1 font-display text-lg font-bold text-neon">
              {formatCompactRupiah(total - totalLoss)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs leading-relaxed text-slate-400">
            <span className="font-semibold text-danger">
              {((totalLoss / total) * 100).toFixed(1)}%
            </span>{' '}
            dari total anggaran terindikasi penggelembungan via mark-up harga material
            &amp; ketidaksesuaian realisasi.
          </p>
        </div>
      </div>
    </div>
  );
}

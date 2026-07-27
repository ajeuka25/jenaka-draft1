import { useEffect, useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  FolderOpen,
} from 'lucide-react';
import {
  projects,
  type Project,
  getRiskLevel,
  RISK_META,
  formatRupiah,
  getEstimatedLoss,
  getMarkup,
} from '@/data/projects';
import { RiskGauge } from '@/components/ui/RiskGauge';

type ScanPhase = 'idle' | 'extracting' | 'comparing' | 'verifying' | 'done';

const PHASES: { key: ScanPhase; label: string; sub: string }[] = [
  { key: 'extracting', label: 'Ekstraksi LPJ', sub: 'OCR & parse field anggaran' },
  { key: 'comparing', label: 'Bandingkan Harga Pasar', sub: 'Cross-check mark-up' },
  { key: 'verifying', label: 'Verifikasi On-chain', sub: 'Stamp hash ke ledger' },
  { key: 'done', label: 'Audit Selesai', sub: 'Skor risiko terbentuk' },
];

interface AuditViewProps {
  onOpenProject: (p: Project) => void;
}

export function AuditView({ onOpenProject }: AuditViewProps) {
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [selectedId, setSelectedId] = useState<string>(projects[0].id);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selected = projects.find((p) => p.id === selectedId) ?? projects[0];

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;
    const order: ScanPhase[] = ['extracting', 'comparing', 'verifying', 'done'];
    const idx = order.indexOf(phase);
    const timer = setTimeout(() => {
      setPhase(order[idx + 1] ?? 'done');
    }, 1100);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = () => setDropdownOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [dropdownOpen]);

  const runAudit = () => {
    setPhase('extracting');
  };

  const level = getRiskLevel(selected.skorRisiko);
  const meta = RISK_META[level];
  const loss = getEstimatedLoss(selected);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-white">AI Audit LPJ</h2>
        <p className="text-sm text-slate-400">
          Unggah atau pilih LPJ — AI Sentinel membandingkan harga LPJ vs harga pasar
          dan menilai profil vendor.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: scanner */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl glass p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-neon/10 blur-3xl" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <Cpu size={18} className="text-neon" />
                <h3 className="font-display text-lg font-semibold text-white">
                  AI Sentinel Scanner
                </h3>
              </div>

              <div className="rounded-xl border-2 border-dashed border-white/10 bg-ink-800/40 p-5">
                <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <FolderOpen size={13} /> Select Project to Audit
                </label>
                <div
                  className="relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    disabled={phase !== 'idle' && phase !== 'done'}
                    className="flex w-full items-center justify-between gap-2 rounded-lg bg-ink-700 px-3 py-2.5 text-left text-sm text-white ring-1 ring-white/10 transition hover:ring-neon/40 disabled:opacity-60"
                  >
                    <span className="min-w-0">
                      <span className="block font-mono text-[10px] text-slate-500">
                        {selected.id}
                      </span>
                      <span className="block truncate font-medium">
                        {selected.namaProyek}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-slate-400 transition ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-white/10 bg-ink-700 shadow-2xl animate-fade-in">
                      {projects.map((p) => {
                        const lv = getRiskLevel(p.skorRisiko);
                        const m = RISK_META[lv];
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedId(p.id);
                              setDropdownOpen(false);
                              setPhase('idle');
                            }}
                            className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-white/5 ${
                              p.id === selectedId ? 'bg-white/5' : ''
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block font-mono text-[10px] text-slate-500">
                                {p.id}
                              </span>
                              <span className="block truncate text-sm text-white">
                                {p.namaProyek}
                              </span>
                            </span>
                            <span
                              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${m.badge}`}
                            >
                              {p.skorRisiko}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={runAudit}
                disabled={phase !== 'idle' && phase !== 'done'}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-emerald-500 px-4 py-3 text-sm font-semibold text-ink-900 shadow-glow-green transition hover:shadow-[0_0_30px_-4px_rgba(34,197,94,0.7)] disabled:opacity-60"
              >
                {phase !== 'idle' && phase !== 'done' ? (
                  <Loader2 size={16} className="animate-spin-slow" />
                ) : (
                  <Sparkles size={16} />
                )}
                {phase === 'idle'
                  ? 'Jalankan AI Audit'
                  : phase === 'done'
                    ? 'Audit Ulang'
                    : 'Memproses…'}
              </button>

              {/* Phase tracker */}
              <div className="mt-6 space-y-2.5">
                {PHASES.map((p) => {
                  const order = PHASES.map((x) => x.key);
                  const currentIdx = order.indexOf(phase);
                  const thisIdx = order.indexOf(p.key);
                  const isDone = phase === 'done' || thisIdx < currentIdx;
                  const isActive = phase === p.key;
                  return (
                    <div
                      key={p.key}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 transition ${
                        isActive
                          ? 'border-neon/40 bg-neon/5'
                          : isDone
                            ? 'border-white/10 bg-white/5'
                            : 'border-white/5 opacity-50'
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                          isDone
                            ? 'bg-neon/20 text-neon'
                            : isActive
                              ? 'bg-neon/20 text-neon'
                              : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 size={15} />
                        ) : isActive ? (
                          <Loader2 size={15} className="animate-spin-slow" />
                        ) : (
                          <span className="text-[10px] font-bold">
                            {thisIdx + 1}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white">{p.label}</p>
                        <p className="text-[11px] text-slate-500">{p.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: live result */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl glass p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="font-mono text-xs text-slate-400">{selected.id}</span>
                <h3 className="mt-1 font-display text-lg font-semibold text-white">
                  {selected.namaProyek}
                </h3>
              </div>
              <RiskGauge score={selected.skorRisiko} size={84} />
            </div>

            <div
              className={`mb-4 rounded-xl border p-3 text-sm leading-relaxed ${
                level === 'aman'
                  ? 'border-neon/20 bg-neon/5 text-slate-200'
                  : 'border-danger/20 bg-danger/5 text-slate-200'
              }`}
            >
              <div className="mb-1.5 flex items-center gap-2">
                {level === 'aman' ? (
                  <ShieldCheck size={15} className="text-neon" />
                ) : (
                  <AlertTriangle size={15} className="text-danger" />
                )}
                <span className={`text-xs font-semibold ${meta.color}`}>
                  AI Verdict: {meta.label}
                </span>
              </div>
              {phase === 'done' || phase === 'idle'
                ? selected.deskripsiAnomaliAI
                : 'Menunggu analisis AI selesai…'}
            </div>

            {/* Item flags */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Item yang diperiksa
              </p>
              {selected.rincianBarang.map((b, i) => {
                const m = getMarkup(b);
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg border p-2.5 ${
                      m.inflated ? 'border-danger/20 bg-danger/5' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {m.inflated ? (
                        <AlertTriangle size={14} className="shrink-0 text-danger" />
                      ) : (
                        <CheckCircle2 size={14} className="shrink-0 text-neon" />
                      )}
                      <span className="truncate text-sm text-slate-200">{b.nama}</span>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-semibold ${
                        m.diff > 0 ? 'text-danger' : 'text-neon'
                      }`}
                    >
                      {m.pct > 0 ? '+' : ''}
                      {m.pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500">
                    Anggaran
                  </p>
                  <p className="font-display text-sm font-bold text-white">
                    {formatRupiah(selected.totalAnggaran)}
                  </p>
                </div>
                {loss > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500">
                      Est. Kerugian
                    </p>
                    <p className="font-display text-sm font-bold text-danger">
                      {formatRupiah(loss)}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => onOpenProject(selected)}
                className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
              >
                Lihat Detail Lengkap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

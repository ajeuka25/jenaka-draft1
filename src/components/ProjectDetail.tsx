import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Building2,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  BadgeCheck,
  X,
  Bot,
  Lock,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Hash,
  Flame,
} from 'lucide-react';
import {
  type Project,
  getRiskLevel,
  RISK_META,
  formatRupiah,
  formatDate,
  formatNumber,
  getMarkup,
  getEstimatedLoss,
  isVendorSuspicious,
  generateTxHash,
} from '@/data/projects';
import { Modal } from '@/components/ui/Modal';
import { RiskGauge } from '@/components/ui/RiskGauge';
import {
  BLOCK_EXPLORER,
  IS_ONCHAIN_CONFIGURED,
  buildIpfsMetadata,
  lockEvidenceOnChain,
} from '@/lib/web3';
import { pinMetadataToIpfs } from '@/lib/ipfs';

type AuditPhase = 'idle' | 'scanning' | 'done';

interface ProjectDetailProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const [phase, setPhase] = useState<AuditPhase>('idle');
  const [locked, setLocked] = useState(false);
  const [locking, setLocking] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setPhase('idle');
      setLocked(false);
      setLocking(false);
      setTxHash(null);
      setToast(null);
      setLockError(null);
    }
  }, [project]);

  if (!project) return null;
  const level = getRiskLevel(project.skorRisiko);
  const meta = RISK_META[level];
  const loss = getEstimatedLoss(project);
  const flagged = project.rincianBarang.filter((b) => getMarkup(b).inflated);
  const vendorSus = isVendorSuspicious(project);
  const isHigh = project.skorRisiko > 70;

  const runAudit = () => {
    setPhase('scanning');
    setLocked(false);
    setTxHash(null);
    setTimeout(() => setPhase('done'), 2000);
  };

  const lockOnChain = async () => {
    setLocking(true);
    setLockError(null);

    if (!IS_ONCHAIN_CONFIGURED) {
      setTimeout(() => {
        setLocking(false);
        setLocked(true);
        setTxHash(generateTxHash());
        setToast('Evidence dikunci (mode simulasi — deploy contract untuk transaksi nyata)');
        setTimeout(() => setToast(null), 3500);
      }, 1600);
      return;
    }

    try {
      const worstItem = [...project.rincianBarang].sort(
        (a, b) => getMarkup(b).pct - getMarkup(a).pct,
      )[0];
      const metadata = buildIpfsMetadata(
        project.id,
        project.kategori,
        Math.round(100 - project.skorRisiko),
        generateTxHash().slice(0, 34),
        `${project.koordinat.lat}, ${project.koordinat.lng}`,
        worstItem ? getMarkup(worstItem).pct : 0,
        worstItem?.hargaPasar ?? 0,
        worstItem?.hargaLPJ ?? 0,
      );

      const cid = await pinMetadataToIpfs(metadata);
      const tx = await lockEvidenceOnChain(project.id, cid);

      setLocked(true);
      setTxHash(tx.txHash);
      setToast('Evidence berhasil dikunci on-chain (Testnet)');
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      setLockError(err instanceof Error ? err.message : 'Transaksi gagal atau dibatalkan.');
    } finally {
      setLocking(false);
    }
  };

  return (
    <Modal
      open={!!project}
      onClose={onClose}
      title={project.namaProyek}
      subtitle={`${project.id} • ${project.kategori}`}
      icon={
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ${
            level === 'aman'
              ? 'bg-neon/10 text-neon ring-neon/30'
              : level === 'waspada'
                ? 'bg-amber-400/10 text-amber-400 ring-amber-400/30'
                : 'bg-danger/10 text-danger ring-danger/30'
          }`}
        >
          {level === 'aman' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
        </span>
      }
      maxWidth="max-w-3xl"
    >
      {/* META GRID */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <MetaRow icon={MapPin} label="Lokasi" value={project.lokasi} />
        <MetaRow icon={CalendarDays} label="Tanggal" value={formatDate(project.tanggal)} />
        <MetaRow icon={Building2} label="Vendor" value={project.namaVendor} />
        <MetaRow
          icon={Clock}
          label="Umur Vendor"
          value={project.umurVendor}
          danger={vendorSus}
        />
        <MetaRow
          icon={TrendingUp}
          label="Total Anggaran"
          value={formatRupiah(project.totalAnggaran)}
        />
        {loss > 0 ? (
          <MetaRow
            icon={TrendingDown}
            label="Est. Kerugian Negara"
            value={formatRupiah(loss)}
            danger
          />
        ) : (
          <MetaRow
            icon={BadgeCheck}
            label="Status Verifikasi"
            value="Harga wajar"
            success
          />
        )}
      </div>

      {/* BIG AUDIT BUTTON */}
      {phase === 'idle' && (
        <button
          onClick={runAudit}
          className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-neon via-emerald-500 to-teal-400 px-6 py-5 text-base font-bold text-ink-900 shadow-glow-green transition hover:shadow-[0_0_40px_-4px_rgba(34,197,94,0.8)]"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Bot size={22} />
          Jalankan AI Sentinel Audit
        </button>
      )}

      {/* SCANNING STATE */}
      {phase === 'scanning' && (
        <div className="relative overflow-hidden rounded-2xl border border-neon/30 bg-ink-800/60 p-8 text-center">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon to-transparent animate-scan" />
          <Loader2 size={40} className="mx-auto mb-4 animate-spin-slow text-neon" />
          <p className="font-display text-lg font-semibold text-white">
            Scanning LPJ &amp; Cross-Checking Market Price Data…
          </p>
          <p className="mt-1 text-sm text-slate-400">
            AI Sentinel membandingkan rincian barang dengan harga acuan pasar dan
            profil vendor.
          </p>
        </div>
      )}

      {/* RESULTS */}
      {phase === 'done' && (
        <div className="animate-fade-in-up space-y-5">
          {/* Risk score highlight */}
          <div
            className={`relative overflow-hidden rounded-2xl border p-5 ${
              isHigh
                ? 'border-danger/40 bg-danger/10 shadow-glow-red'
                : 'border-neon/40 bg-neon/10 shadow-glow-green'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <RiskGauge score={project.skorRisiko} size={92} />
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Skor Risiko AI
                  </p>
                  <p
                    className={`font-display text-3xl font-bold ${
                      isHigh ? 'text-danger text-glow-red' : 'text-neon text-glow-green'
                    }`}
                  >
                    {project.skorRisiko}/100
                  </p>
                  <p className={`mt-1 text-sm font-semibold ${meta.color}`}>
                    Status: {meta.label}
                  </p>
                </div>
              </div>
              <span
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold ring-1 ${
                  isHigh
                    ? 'bg-danger/20 text-danger ring-danger/40'
                    : 'bg-neon/20 text-neon ring-neon/40'
                }`}
              >
                {isHigh ? <Flame size={18} /> : <ShieldCheck size={18} />}
                {isHigh ? 'BAHAYA' : 'AMAN'}
              </span>
            </div>
          </div>

          {/* AI verdict */}
          <div
            className={`rounded-xl border p-4 ${
              isHigh
                ? 'border-danger/20 bg-danger/5'
                : 'border-neon/20 bg-neon/5'
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <Cpu size={16} className={meta.color} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                AI Anomaly Verdict
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-200">
              {project.deskripsiAnomaliAI}
            </p>
          </div>

          {/* Rincian barang table with MARK-UP / VENDOR tags */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              Rincian Barang: LPJ vs Harga Pasar
              {flagged.length > 0 && (
                <span className="rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-medium text-danger">
                  {flagged.length} ditandai
                </span>
              )}
            </h4>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Barang</th>
                    <th className="px-3 py-2.5 text-right font-medium">Jumlah</th>
                    <th className="px-3 py-2.5 text-right font-medium">Harga LPJ</th>
                    <th className="px-3 py-2.5 text-right font-medium">Harga Pasar</th>
                    <th className="px-3 py-2.5 text-right font-medium">Selisih</th>
                    <th className="px-3 py-2.5 text-center font-medium">Indikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {project.rincianBarang.map((b, i) => {
                    const m = getMarkup(b);
                    return (
                      <tr
                        key={i}
                        className={`transition hover:bg-white/5 ${
                          m.inflated ? 'bg-danger/5' : ''
                        }`}
                      >
                        <td className="px-3 py-3 text-slate-200">
                          <div className="flex items-center gap-2">
                            {m.inflated && (
                              <AlertTriangle size={13} className="shrink-0 text-danger" />
                            )}
                            <span>{b.nama}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-slate-400">
                          {formatNumber(b.jumlah)}
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-white">
                          {formatRupiah(b.hargaLPJ)}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-400">
                          {formatRupiah(b.hargaPasar)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              m.diff > 0
                                ? 'text-danger'
                                : m.diff < 0
                                  ? 'text-sky-400'
                                  : 'text-slate-400'
                            }`}
                          >
                            {m.diff > 0 ? (
                              <ArrowUpRight size={13} />
                            ) : m.diff < 0 ? (
                              <ArrowDownRight size={13} />
                            ) : null}
                            {m.pct > 0 ? '+' : ''}
                            {m.pct.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {m.inflated ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-danger/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-danger ring-1 ring-danger/30">
                              <Flame size={10} /> Mark-up
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-neon/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-neon ring-1 ring-neon/30">
                              <BadgeCheck size={10} /> Wajar
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vendor suspicious banner */}
            {vendorSus && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 animate-fade-in">
                <AlertTriangle size={16} className="shrink-0 text-danger" />
                <span className="text-sm font-semibold text-danger">
                  VENDOR MENCURIGAKAN
                </span>
                <span className="text-sm text-slate-300">
                  — Vendor baru berdiri {project.umurVendor}, berisiko tinggi untuk
                  pengadaan publik.
                </span>
              </div>
            )}
          </div>

          {/* On-chain lock section */}
          <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
            {locked && txHash ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-xl bg-neon/10 px-4 py-3 ring-1 ring-neon/30">
                  <CheckCircle2 size={20} className="shrink-0 text-neon" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neon">
                      Evidence Locked On-Chain (Testnet)
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Hash size={11} className="shrink-0" />
                      <span className="truncate font-mono">
                        {txHash.slice(0, 18)}…{txHash.slice(-10)}
                      </span>
                    </p>
                  </div>
                  <button
                    className="ml-auto flex shrink-0 items-center gap-1 text-xs font-medium text-neon transition hover:gap-2"
                  >
                    <ExternalLink size={13} /> Explorer
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2.5 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-white/10"
                >
                  <X size={15} /> Tutup
                </button>
              </div>
            ) : (
              <button
                onClick={lockOnChain}
                disabled={locking}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3.5 text-sm font-bold text-ink-900 shadow-glow-cyan transition hover:shadow-[0_0_30px_-4px_rgba(34,211,238,0.7)] disabled:opacity-70"
              >
                {locking ? (
                  <Loader2 size={18} className="animate-spin-slow" />
                ) : (
                  <Lock size={18} />
                )}
                {locking
                  ? 'Memproses transaksi Web3…'
                  : 'Lock Evidence On-Chain (Testnet)'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-fade-in-up">
          <div className="flex items-center gap-3 rounded-xl bg-ink-700 px-5 py-3.5 shadow-2xl ring-1 ring-neon/40">
            <CheckCircle2 size={20} className="text-neon" />
            <div>
              <p className="text-sm font-semibold text-white">{toast}</p>
              <p className="text-xs text-slate-400">
                Evidence hash tercatat immutable di ledger testnet.
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

interface MetaRowProps {
  icon: typeof MapPin;
  label: string;
  value: string;
  danger?: boolean;
  success?: boolean;
}

function MetaRow({ icon: Icon, label, value, danger, success }: MetaRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <span
        className={`mt-0.5 rounded-lg p-1.5 ring-1 ring-white/10 ${
          danger ? 'text-danger' : success ? 'text-neon' : 'text-slate-400'
        }`}
      >
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
        <p
          className={`truncate text-sm font-medium ${
            danger ? 'text-danger' : success ? 'text-neon' : 'text-white'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

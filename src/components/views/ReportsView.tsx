import { useMemo, useState } from 'react';
import {
  MessageSquareWarning,
  ThumbsUp,
  Paperclip,
  MapPin,
  CalendarDays,
  Send,
  ShieldQuestion,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Navigation,
  Link2,
  ExternalLink,
  Clock,
  Fingerprint,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import {
  initialReports,
  type CitizenReport,
  type ReportCategory,
  type ReportStatus,
  type EvidenceItem,
} from '@/data/reports';
import { formatDate, formatNumber } from '@/data/projects';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';

const CATEGORIES: ReportCategory[] = ['MBG', 'Infrastruktur', 'Sosial', 'Pengadaan', 'Lainnya'];

const STATUS_STYLE: Record<ReportStatus, string> = {
  Masuk: 'bg-sky-400/10 text-sky-400 ring-sky-400/30',
  Diverifikasi: 'bg-amber-400/10 text-amber-400 ring-amber-400/30',
  Diteruskan: 'bg-danger/10 text-danger ring-danger/30',
};

export function ReportsView() {
  const [reports, setReports] = useState<CitizenReport[]>(initialReports);
  const [filter, setFilter] = useState<ReportCategory | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [activeReport, setActiveReport] = useState<CitizenReport | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [useZk, setUseZk] = useState(false);
  const [zkProofing, setZkProofing] = useState(false);
  const { push } = useToast();
  const [form, setForm] = useState({
    nama: '',
    anonim: false,
    kategori: 'MBG' as ReportCategory,
    lokasi: '',
    judul: '',
    detail: '',
  });

  const filtered = useMemo(
    () =>
      filter === 'all' ? reports : reports.filter((r) => r.kategori === filter),
    [reports, filter],
  );

  const upvote = (id: string) => {
    setReports((rs) =>
      rs.map((r) => (r.id === id ? { ...r, upvote: r.upvote + 1 } : r)),
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.detail.trim() || !form.lokasi.trim()) return;
    if (useZk) {
      setZkProofing(true);
      setTimeout(() => {
        setZkProofing(false);
        finalizeSubmit(true);
        push('web3', 'ZK-Proof Generated', 'Laporan terkirim anonim via Zero-Knowledge Proof. Identitas terlindungi.');
      }, 2500);
    } else {
      setSubmitting(true);
      setTimeout(() => {
        finalizeSubmit(false);
      }, 1200);
    }
  };

  const finalizeSubmit = (zk: boolean) => {
    const newReport: CitizenReport = {
      id: `RPT-${String(reports.length + 1).padStart(3, '0')}`,
      nama: zk || form.anonim ? 'ZK-Anonymous' : form.nama.trim() || 'Warga',
      anonim: zk || form.anonim,
      kategori: form.kategori,
      lokasi: form.lokasi.trim(),
      judul: form.judul.trim(),
      detail: form.detail.trim(),
      tanggal: new Date().toISOString().slice(0, 10),
      status: 'Masuk',
      bukti: 0,
      upvote: 0,
      evidence: [],
      zkVerified: zk,
    };
    setReports((rs) => [newReport, ...rs]);
    setForm({ nama: '', anonim: false, kategori: 'MBG', lokasi: '', judul: '', detail: '' });
    setSubmitting(false);
    setShowForm(false);
    setUseZk(false);
    if (!zk) push('info', 'Laporan Terkirim', 'Laporan warga berhasil masuk ke antrian verifikasi.');
  };

  const totalUpvotes = reports.reduce((s, r) => s + r.upvote, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            Laporan MBG &amp; Warga
          </h2>
          <p className="text-sm text-slate-400">
            Suara warga yang memvalidasi temuan AI. {reports.length} laporan •{' '}
            {formatNumber(totalUpvotes)} dukungan.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon to-emerald-500 px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-glow-green transition hover:shadow-[0_0_30px_-4px_rgba(34,197,94,0.7)]"
        >
          <MessageSquareWarning size={16} />
          {showForm ? 'Tutup Form' : 'Lapor Anomali'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="relative mb-8 overflow-hidden rounded-2xl glass p-5 animate-fade-in-up"
        >
          {zkProofing && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink-900/90 backdrop-blur">
              <Fingerprint size={48} className="mb-4 text-zk animate-zk-shimmer" />
              <p className="font-display text-lg font-semibold text-white">
                Generating ZK-Proof…
              </p>
              <p className="mt-1 text-sm text-slate-400">ZK-Location &amp; Student-Parent Credential Proof</p>
              <div className="mt-4 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-zk"
                    style={{ animation: `zk-shimmer 1s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama (opsional)">
              <input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                disabled={form.anonim}
                placeholder="Nama Anda"
                className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-neon/50 disabled:opacity-40"
              />
            </Field>
            <Field label="Kategori">
              <select
                value={form.kategori}
                onChange={(e) =>
                  setForm({ ...form, kategori: e.target.value as ReportCategory })
                }
                className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-neon/50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-ink-700">
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lokasi" full>
              <input
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                placeholder="Contoh: SD Negeri 01 Sukamaju, Kabupaten Sukamaju"
                className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-neon/50"
              />
            </Field>
            <Field label="Judul Laporan" full>
              <input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                placeholder="Ringkasan singkat anomali yang Anda lihat"
                className="w-full rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-neon/50"
              />
            </Field>
            <Field label="Detail Laporan" full>
              <textarea
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
                rows={3}
                placeholder="Jelaskan apa yang Anda saksikan…"
                className="w-full resize-none rounded-lg bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 ring-1 ring-white/10 focus:outline-none focus:ring-neon/50"
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.anonim}
                onChange={(e) => setForm({ ...form, anonim: e.target.checked })}
                className="h-4 w-4 rounded accent-neon"
              />
              <ShieldQuestion size={15} className="text-slate-400" />
              Laporkan secara anonim
            </label>

            {/* ZK-Proof toggle */}
            <button
              type="button"
              onClick={() => setUseZk((v) => !v)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ring-1 transition ${
                useZk
                  ? 'bg-zk/20 text-zk ring-zk/40'
                  : 'bg-white/5 text-slate-400 ring-white/10 hover:text-white'
              }`}
            >
              <Fingerprint size={15} />
              Kirim Anonim via ZK-Proof
              {useZk && <CheckCircle2 size={13} />}
            </button>

            <button
              type="submit"
              disabled={submitting || zkProofing}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon to-emerald-500 px-5 py-2.5 text-sm font-semibold text-ink-900 shadow-glow-green transition hover:shadow-[0_0_30px_-4px_rgba(34,197,94,0.7)] disabled:opacity-60"
            >
              {submitting || zkProofing ? (
                <Loader2 size={16} className="animate-spin-slow" />
              ) : useZk ? (
                <Lock size={16} />
              ) : (
                <Send size={16} />
              )}
              {zkProofing
                ? 'Generating ZK-Proof…'
                : submitting
                  ? 'Mengirim…'
                  : useZk
                    ? 'Kirim via ZK-Proof'
                    : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      )}

      {/* Filter chips */}
      <div className="mb-5 flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['all', ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === c
                ? 'bg-ink-700 text-white ring-1 ring-white/10'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {c === 'all' ? 'Semua' : c}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((r, i) => (
          <article
            key={r.id}
            style={{ animationDelay: `${i * 80}ms` }}
            className="group flex flex-col rounded-2xl glass p-5 transition hover:ring-1 hover:ring-white/20 animate-fade-in-up"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-300 ring-1 ring-white/10">
                  {r.kategori}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${STATUS_STYLE[r.status]}`}
                >
                  {r.status}
                </span>
                {r.zkVerified && (
                  <span className="flex items-center gap-1 rounded-md bg-zk/15 px-2 py-0.5 text-[10px] font-bold text-zk ring-1 ring-zk/30">
                    <ShieldCheck size={10} /> ZK-Proof Verified
                  </span>
                )}
              </div>
              <span className="font-mono text-[10px] text-slate-500">{r.id}</span>
            </div>

            <h3 className="font-display text-base font-semibold leading-snug text-white">
              {r.judul}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-slate-400">{r.detail}</p>

            <div className="mt-3 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{r.lokasi}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={12} className="shrink-0" />
                <span>{formatDate(r.tanggal)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                {r.evidence.length > 0 ? (
                  <button
                    onClick={() => setActiveReport(r)}
                    className="flex items-center gap-1 font-semibold text-neon transition hover:gap-1.5"
                  >
                    <Paperclip size={13} /> {r.bukti} bukti
                  </button>
                ) : (
                  <span className="flex items-center gap-1">
                    <Paperclip size={13} /> {r.bukti} bukti
                  </span>
                )}
                <span className="text-slate-500">•</span>
                <span className="text-slate-500">
                  {r.anonim ? 'Anonim' : r.nama}
                </span>
              </div>
              <button
                onClick={() => upvote(r.id)}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-neon/10 hover:text-neon"
              >
                <ThumbsUp size={13} />
                {formatNumber(r.upvote)}
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
          <CheckCircle2 size={28} className="mx-auto mb-2 text-slate-600" />
          <p className="text-sm text-slate-400">
            Belum ada laporan untuk kategori ini.
          </p>
        </div>
      )}

      <EvidenceModal
        report={activeReport}
        onClose={() => setActiveReport(null)}
      />
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={full ? 'sm:col-span-2' : ''}>
      <span className="mb-1.5 block text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function EvidenceModal({
  report,
  onClose,
}: {
  report: CitizenReport | null;
  onClose: () => void;
}) {
  if (!report) return null;
  return (
    <Modal
      open={!!report}
      onClose={onClose}
      title={report.judul}
      subtitle={`${report.id} • ${report.kategori} • ${report.lokasi}`}
      icon={
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon ring-1 ring-neon/30">
          <Paperclip size={20} />
        </span>
      }
      maxWidth="max-w-2xl"
    >
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{report.detail}</p>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-slate-400 ring-1 ring-white/10">
          <CalendarDays size={12} /> {formatDate(report.tanggal)}
        </span>
        <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-slate-400 ring-1 ring-white/10">
          <MapPin size={12} /> {report.lokasi}
        </span>
        <span className="rounded-md bg-white/5 px-2 py-1 text-slate-400 ring-1 ring-white/10">
          {report.anonim ? 'Anonim' : report.nama}
        </span>
      </div>

      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        Bukti Laporan ({report.evidence.length})
      </h4>

      {report.evidence.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
          <Paperclip size={24} className="mx-auto mb-2 text-slate-600" />
          <p className="text-sm text-slate-400">
            Bukti belum diunggah untuk laporan ini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {report.evidence.map((ev) => (
            <EvidenceCard key={ev.id} ev={ev} />
          ))}
        </div>
      )}
    </Modal>
  );
}

function EvidenceCard({ ev }: { ev: EvidenceItem }) {
  const [copied, setCopied] = useState(false);
  const copyHash = () => {
    if (!ev.txHash) return;
    navigator.clipboard?.writeText(ev.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {ev.image && (
        <div className="relative">
          <img src={ev.image} alt={ev.title} className="h-48 w-full object-cover" />
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-ink-900/80 px-2 py-1 text-[10px] font-semibold text-neon ring-1 ring-neon/30 backdrop-blur">
            <ImageIcon size={11} /> Foto Bukti
          </span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2">
          {ev.type === 'photo' && <ImageIcon size={15} className="text-neon" />}
          {ev.type === 'gps' && <Navigation size={15} className="text-sky-400" />}
          {ev.type === 'onchain' && <Link2 size={15} className="text-amber-400" />}
          <h5 className="text-sm font-semibold text-white">{ev.title}</h5>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
          {ev.description}
        </p>

        {ev.location && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-sky-400/5 px-3 py-2 ring-1 ring-sky-400/20">
            <Navigation size={14} className="shrink-0 text-sky-400" />
            <span className="text-xs font-mono text-sky-400">{ev.location}</span>
          </div>
        )}

        {ev.txHash && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-amber-400/5 px-3 py-2 ring-1 ring-amber-400/20">
              <Link2 size={14} className="shrink-0 text-amber-400" />
              <span className="truncate font-mono text-xs text-amber-400">
                {ev.txHash.slice(0, 24)}…{ev.txHash.slice(-12)}
              </span>
              <button
                onClick={copyHash}
                className="ml-auto shrink-0 rounded px-2 py-1 text-[10px] font-medium text-slate-400 transition hover:text-white"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2.5 text-sm font-bold text-ink-900 transition hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.6)]">
              <ExternalLink size={15} /> Lihat Transaksi Bukti On-Chain
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500">
          <Clock size={11} /> {ev.timestamp}
        </div>
      </div>
    </div>
  );
}

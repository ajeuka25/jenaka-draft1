import { useRef, useState } from 'react';
import {
  Utensils,
  Upload,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sparkles,
  Gift,
  Coins,
  Camera,
  ImageUp,
  ScanFace,
  ShieldCheck,
  Lock,
  FileJson,
  ShieldCheck as ShieldCheckIcon,
  Database,
  Link2,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/context/ToastContext';
import { formatRupiah } from '@/data/projects';
import {
  generateIpfsCid,
  generateTxHash,
  buildIpfsMetadata,
  simulateTx,
  type TxDetails,
  type IpfsMetadata,
} from '@/lib/web3';
import { TxModal } from '@/components/ui/TxModal';

type Phase = 'idle' | 'analyzing' | 'done';

const SAMPLE_IMAGE =
  'https://images.pexels.com/photos/36982092/pexels-photo-36982092.jpeg?auto=compress&cs=tinysrgb&w=900';

const ANALYSIS_STEPS = [
  { label: 'Image resolution & format check', sub: 'Validasi metadata foto' },
  { label: 'Extract GPS geotag metadata', sub: 'Lokasi pengambilan foto' },
  { label: 'Vision: detect food items & portion', sub: 'Klasifikasi menu porsi' },
  { label: 'Cross-check harga pasar lokal', sub: 'Estimasi nilai riil' },
  { label: 'Bandingkan dengan klaim LPJ', sub: 'Hitung deviasi kualitas' },
];

export function MbgView() {
  const { state, rewards, award } = useWallet();
  const { push } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [image, setImage] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [rewarded, setRewarded] = useState(false);
  const [locking, setLocking] = useState(false);
  const [locked, setLocked] = useState(false);
  const [tx, setTx] = useState<TxDetails | null>(null);
  const [metadata, setMetadata] = useState<IpfsMetadata | null>(null);
  const [cid, setCid] = useState<string | null>(null);
  const [showTx, setShowTx] = useState(false);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImage(url);
    runAnalysis();
  };

  const loadSample = () => {
    setImage(SAMPLE_IMAGE);
    runAnalysis();
  };

  const runAnalysis = () => {
    setPhase('analyzing');
    setRewarded(false);
    setLocked(false);
    setCid(null);
    setTx(null);
    setMetadata(null);
    setStepIdx(0);
    const totalSteps = ANALYSIS_STEPS.length;
    const interval = setInterval(() => {
      setStepIdx((i) => {
        const next = i + 1;
        if (next >= totalSteps) {
          clearInterval(interval);
          setPhase('done');
          return totalSteps - 1;
        }
        return next;
      });
    }, 550);
  };

  const claimReward = () => {
    if (rewarded) return;
    award(10);
    setRewarded(true);
    push('success', '+10 Token Testnet', 'Reward dikirim ke dompet warga atas laporan valid!');
  };

  const lockOnChain = () => {
    if (locked || locking) return;
    setLocking(true);
    setTimeout(() => {
      const newCid = generateIpfsCid();
      const newMeta = buildIpfsMetadata(
        'PRJ-001',
        'MBG',
        98,
        generateTxHash(),
        'SDN 01 Sukamaju (-6.1234, 107.5678)',
        deviationPct,
        realValue,
        lpjValue,
      );
      const newTx = simulateTx(
        newCid,
        state.connected ? state.address : '0xzk-anon-reporter',
      );
      setCid(newCid);
      setMetadata(newMeta);
      setTx(newTx);
      setLocked(true);
      setLocking(false);
      push('web3', 'Evidence Anchored On-Chain', `CID ${newCid.slice(0, 16)}… tercatam di KawalDana Testnet.`);
    }, 2200);
  };

  const reset = () => {
    setPhase('idle');
    setImage(null);
    setRewarded(false);
    setLocked(false);
    setCid(null);
    setTx(null);
    setMetadata(null);
    setStepIdx(0);
  };

  const deviationPct = 200;
  const realValue = 5000;
  const lpjValue = 15000;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1">
        <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full bg-neon/10 px-3 py-1 text-xs font-semibold text-neon ring-1 ring-neon/30">
          <Utensils size={13} /> MBG Nutrition &amp; Price Audit
        </div>
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Audit Porsi Makan Bergizi Gratis via AI Vision
        </h2>
        <p className="text-sm text-slate-400">
          Warga atau sekolah unggah foto porsi MBG. AI memverifikasi geotag,
          mendeteksi menu riil, dan membandingkan nilai riil dengan klaim LPJ.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: Upload / preview */}
        <div className="rounded-2xl glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <Camera size={18} className="text-neon" /> Upload Foto Porsi MBG
          </h3>

          {phase === 'idle' ? (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className="group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-ink-800/40 p-8 text-center transition hover:border-neon/50 hover:bg-neon/5"
            >
              <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-neon/10 text-neon ring-1 ring-neon/30 transition group-hover:scale-110">
                <ImageUp size={26} />
              </span>
              <p className="font-medium text-white">Klik untuk upload foto</p>
              <p className="mt-1 text-xs text-slate-400">
                atau drag &amp; drop foto porsi makanan di sini
              </p>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSample();
                  }}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
                >
                  <Sparkles size={14} className="text-neon" />
                  Gunakan Foto Contoh
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <p className="mt-4 text-[11px] text-slate-500">
                Format: JPG, PNG, WEBP. Metadata geotag akan dianalisis.
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-white/10">
              {image && (
                <img
                  src={image}
                  alt="Porsi MBG"
                  className={`h-full min-h-[280px] w-full object-cover transition ${
                    phase === 'analyzing' ? 'scale-105 blur-[1px]' : ''
                  }`}
                />
              )}

              {phase === 'analyzing' && (
                <div className="absolute inset-0 bg-ink-900/40">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-neon to-transparent animate-scan" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <ScanFace size={48} className="text-neon" />
                      <div className="absolute inset-0 animate-ping rounded-full border-2 border-neon/40" />
                    </div>
                    <p className="font-display text-base font-semibold text-white">
                      Analyzing Image &amp; Geotag Metadata…
                    </p>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 space-y-1.5 bg-gradient-to-t from-ink-900/95 to-transparent p-4">
                    {ANALYSIS_STEPS.map((s, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 transition ${
                          i <= stepIdx ? 'opacity-100' : 'opacity-30'
                        }`}
                      >
                        {i < stepIdx ? (
                          <CheckCircle2 size={14} className="shrink-0 text-neon" />
                        ) : i === stepIdx ? (
                          <Loader2 size={14} className="shrink-0 animate-spin-slow text-neon" />
                        ) : (
                          <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20" />
                        )}
                        <span className="text-xs text-slate-200">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {phase === 'done' && (
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-neon/20 px-2.5 py-1.5 text-xs font-semibold text-neon ring-1 ring-neon/40 backdrop-blur">
                  <CheckCircle2 size={13} /> Analisis Selesai
                </div>
              )}
            </div>
          )}

          {phase !== 'idle' && (
            <button
              onClick={reset}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-white"
            >
              <Upload size={13} /> Upload foto lain
            </button>
          )}
        </div>

        {/* RIGHT: Analysis output */}
        <div className="rounded-2xl glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <ScanFace size={18} className="text-neon" /> Hasil Analisis AI Vision
          </h3>

          {phase === 'idle' && (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center">
              <ScanFace size={40} className="mb-3 text-slate-600" />
              <p className="text-sm text-slate-400">
                Hasil analisis akan muncul di sini setelah foto di-upload.
              </p>
            </div>
          )}

          {phase === 'analyzing' && (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-neon/20 bg-neon/5 p-8 text-center">
              <Loader2 size={36} className="mb-3 animate-spin-slow text-neon" />
              <p className="font-display text-base font-semibold text-white">
                Analyzing Image &amp; Geotag Metadata…
              </p>
              <p className="mt-1 text-xs text-slate-400">
                AI sedang memproses foto porsi MBG. Mohon tunggu.
              </p>
            </div>
          )}

          {phase === 'done' && (
            <div className="animate-fade-in-up space-y-3">
              {/* Geotag status */}
              <ResultRow
                icon={<MapPin size={16} />}
                label="Status Geotag"
                value="GPS Verified (SDN 01 Sukamaju)"
                tone="success"
              />

              {/* Real value */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="mb-1 text-[11px] uppercase tracking-wider text-slate-500">
                  Estimasi Nilai Riil Porsi
                </p>
                <p className="font-display text-xl font-bold text-white">
                  {formatRupiah(realValue)} / porsi
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Menu terdeteksi:{' '}
                  <span className="font-medium text-slate-200">
                    Tahu, Tempe, Nasi
                  </span>
                </p>
              </div>

              {/* LPJ claim */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="mb-1 text-[11px] uppercase tracking-wider text-slate-500">
                  Klaim LPJ Anggaran
                </p>
                <p className="font-display text-xl font-bold text-white">
                  {formatRupiah(lpjValue)} / porsi
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Klaim menu:{' '}
                  <span className="font-medium text-slate-200">Daging &amp; Susu</span>
                </p>
              </div>

              {/* Deviation alert */}
              <div className="relative overflow-hidden rounded-xl border border-danger/40 bg-danger/10 p-4 shadow-glow-red">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-danger/20 blur-2xl" />
                <div className="relative flex items-start gap-3">
                  <Flame size={20} className="mt-0.5 shrink-0 text-danger" />
                  <div>
                    <p className="font-display text-base font-bold text-danger">
                      DEVIASI KUALITAS {deviationPct}%
                    </p>
                    <p className="mt-0.5 text-sm text-slate-200">
                      Indikasi Penggelembungan Anggaran MBG. Nilai riil porsi hanya{' '}
                      {formatRupiah(realValue)}, namun LPJ mengklaim{' '}
                      {formatRupiah(lpjValue)} — selisih{' '}
                      {formatRupiah(lpjValue - realValue)} per porsi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reward button */}
              <button
                onClick={claimReward}
                disabled={rewarded}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-neon to-emerald-500 px-4 py-3.5 text-sm font-bold text-ink-900 shadow-glow-green transition hover:shadow-[0_0_30px_-4px_rgba(34,197,94,0.7)] disabled:opacity-70"
              >
                {rewarded ? (
                  <>
                    <CheckCircle2 size={18} /> Reward Diklaim
                  </>
                ) : (
                  <>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Gift size={18} /> Kirim Laporan &amp; Claim Reward
                  </>
                )}
              </button>

              {rewarded && (
                <div className="flex items-center gap-2 rounded-lg bg-neon/10 px-3 py-2.5 text-xs text-neon ring-1 ring-neon/30 animate-fade-in">
                  <Coins size={14} />
                  +10 Token Testnet telah ditambahkan ke dompet Anda. Total reward
                  saat ini: <span className="font-bold">{rewards} TKW</span>
                </div>
              )}

              {!state.connected && !rewarded && (
                <p className="flex items-center gap-1.5 text-[11px] text-amber-400">
                  <AlertTriangle size={12} />
                  Hubungkan wallet Anda terlebih dahulu untuk menerima reward token.
                </p>
              )}

              {/* Cryptographic Proof & Metadata Check panel */}
              <div className="rounded-xl border border-zk/20 bg-zk/5 p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck size={16} className="text-zk" /> Cryptographic Proof &amp; Metadata Check
                </p>
                <div className="space-y-2">
                  <ProofRow icon={MapPin} label="Geotag Status" value="Verified via ZK-Location" accent="text-neon" />
                  <ProofRow icon={ShieldCheckIcon} label="C2PA Photo Integrity" value="Authenticated — No AI manipulation" accent="text-neon" />
                  <ProofRow icon={Database} label="Market Price Oracle" value="Cross-referenced via zkTLS Oracle" accent="text-web3" />
                </div>
              </div>

              {/* Lock Evidence On-Chain */}
              <button
                onClick={lockOnChain}
                disabled={locked || locking}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-zk to-indigo-500 px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_-6px_rgba(99,102,241,0.6)] transition hover:shadow-[0_0_30px_-4px_rgba(99,102,241,0.8)] disabled:opacity-70"
              >
                {locking ? (
                  <>
                    <Loader2 size={18} className="animate-spin-slow" /> Anchoring to IPFS &amp; Testnet…
                  </>
                ) : locked ? (
                  <>
                    <CheckCircle2 size={18} /> Evidence Locked On-Chain
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Lock Evidence On-Chain
                  </>
                )}
              </button>

              {/* On-chain result */}
              {locked && tx && (
                <div className="animate-fade-in-up space-y-2.5 rounded-xl border border-zk/30 bg-zk/5 p-4">
                  <div className="flex items-center gap-2">
                    <FileJson size={15} className="text-zk" />
                    <span className="text-xs font-semibold text-white">IPFS CID Generated</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-ink-900/60 px-3 py-2">
                    <span className="truncate font-mono text-[11px] text-zk">bafybeic…{cid?.slice(-12)}</span>
                    <span className="shrink-0 rounded-md bg-zk/20 px-2 py-0.5 text-[10px] font-bold text-zk">CIDv1</span>
                  </div>
                  <button
                    onClick={() => setShowTx(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-web3/10 px-4 py-2.5 text-sm font-semibold text-web3 ring-1 ring-web3/30 transition hover:bg-web3/20"
                  >
                    <Link2 size={15} /> View Transaction Details
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* How it works strip */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Camera, title: '1. Upload Foto', desc: 'Warga/sekolah ambil foto porsi MBG' },
          { icon: ScanFace, title: '2. AI Vision Analisis', desc: 'Deteksi menu & verifikasi geotag' },
          { icon: ShieldCheck, title: '3. Evidence On-Chain', desc: 'Laporan & reward tercatat immutable' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="flex items-center gap-3 rounded-xl glass p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-neon/10 text-neon ring-1 ring-neon/30">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{s.title}</p>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <TxModal
        open={showTx}
        onClose={() => setShowTx(false)}
        tx={tx}
        metadata={metadata}
      />
    </div>
  );
}

function ProofRow({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2">
      <Icon size={14} className={`shrink-0 ${accent}`} />
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`ml-auto text-right text-xs font-semibold ${accent}`}>{value}</span>
    </div>
  );
}

function ResultRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'success' | 'danger';
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 ${
        tone === 'success'
          ? 'border-neon/20 bg-neon/5'
          : 'border-danger/20 bg-danger/5'
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
          tone === 'success' ? 'bg-neon/15 text-neon' : 'bg-danger/15 text-danger'
        }`}
      >
        {icon}
      </span>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
        <p
          className={`text-sm font-semibold ${
            tone === 'success' ? 'text-neon' : 'text-danger'
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

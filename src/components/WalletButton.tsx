import { useState } from 'react';
import {
  Wallet,
  Loader2,
  LogOut,
  Copy,
  Check,
  Coins,
  Fingerprint,
  Mail,
  ChevronDown,
  ShieldCheck,
  KeySquare,
  Zap,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { Modal } from '@/components/ui/Modal';

type LoginMethod = 'wallet' | 'social' | 'passkey';

const LOGIN_OPTIONS: {
  method: LoginMethod;
  label: string;
  desc: string;
  icon: typeof Wallet;
  accent: string;
}[] = [
  {
    method: 'wallet',
    label: 'Connect MetaMask Wallet',
    desc: 'Login dengan wallet Web3 standar',
    icon: Wallet,
    accent: 'text-neon',
  },
  {
    method: 'social',
    label: 'Login with Social / Email',
    desc: 'Web3Auth — Google, Email, atau social',
    icon: Mail,
    accent: 'text-web3',
  },
  {
    method: 'passkey',
    label: 'Login with Passkey',
    desc: 'Account Abstraction — biometric / passkey',
    icon: Fingerprint,
    accent: 'text-zk',
  },
];

export function WalletButton() {
  const { state, connecting, rewards, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<LoginMethod | null>(null);

  const handleLogin = async (method: LoginMethod) => {
    setPendingMethod(method);
    setShowLogin(false);
    await connect(method);
    setPendingMethod(null);
  };

  if (state.connected) {
    const copy = () => {
      navigator.clipboard?.writeText(state.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    return (
      <div className="flex items-center gap-1.5 rounded-xl bg-neon/10 p-1 ring-1 ring-neon/40">
        <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-neon">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
          </span>
          <span className="hidden sm:inline">{state.ens}</span>
          <span className="sm:hidden">Connected</span>
        </span>
        {state.kawal > 0 && (
          <span className="hidden items-center gap-1 rounded-lg bg-amber-400/10 px-2 py-1.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-400/30 sm:flex">
            <Coins size={12} /> {state.kawal.toLocaleString()} KAWAL
          </span>
        )}
        {rewards > 0 && (
          <span className="hidden items-center gap-1 rounded-lg bg-web3/10 px-2 py-1.5 text-xs font-semibold text-web3 ring-1 ring-web3/30 md:flex">
            <Zap size={12} /> {rewards} TKW
          </span>
        )}
        <button
          onClick={copy}
          className="rounded-lg p-1.5 text-neon/70 transition hover:bg-neon/20 hover:text-neon"
          aria-label="Salin alamat"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button
          onClick={disconnect}
          className="rounded-lg p-1.5 text-neon/70 transition hover:bg-neon/20 hover:text-neon"
          aria-label="Putuskan koneksi"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        disabled={connecting}
        className="group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-neon to-emerald-500 px-3 py-2 text-sm font-semibold text-ink-900 shadow-glow-green transition hover:shadow-[0_0_30px_-4px_rgba(34,197,94,0.7)] disabled:opacity-70 sm:px-4"
      >
        {connecting ? (
          <Loader2 size={16} className="animate-spin-slow" />
        ) : (
          <Wallet size={16} />
        )}
        <span className="hidden xs:inline">
          {connecting ? 'Menghubungkan…' : 'Connect Wallet'}
        </span>
        <span className="xs:hidden">{connecting ? '…' : 'Connect'}</span>
        {!connecting && <ChevronDown size={14} className="opacity-70" />}
      </button>

      <Modal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        title="Connect to KawalDana AI"
        subtitle="Pilih metode login Web3 — wallet, social, atau passkey"
        icon={
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon/10 text-neon ring-1 ring-neon/30">
            <KeySquare size={20} />
          </span>
        }
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          {LOGIN_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isPending = pendingMethod === opt.method && connecting;
            return (
              <button
                key={opt.method}
                onClick={() => handleLogin(opt.method)}
                disabled={connecting}
                className="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-neon/30 hover:bg-white/10 disabled:opacity-60"
              >
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 ${opt.accent} ring-1 ring-white/10 transition group-hover:scale-110`}>
                  {isPending ? <Loader2 size={22} className="animate-spin-slow" /> : <Icon size={22} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{opt.desc}</p>
                </div>
                {opt.method === 'passkey' && (
                  <span className="flex shrink-0 items-center gap-1 rounded-md bg-zk/15 px-2 py-0.5 text-[10px] font-bold text-zk ring-1 ring-zk/30">
                    <ShieldCheck size={10} /> ZK
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck size={12} className="text-neon" />
          Account Abstraction via Web3Auth — warga dapat login tanpa mnemonics.
        </p>
      </Modal>
    </>
  );
}

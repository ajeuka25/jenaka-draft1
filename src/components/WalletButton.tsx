import { useState } from 'react';
import { Wallet, Loader2, LogOut, Copy, Check, Coins } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

export function WalletButton() {
  const { state, connecting, rewards, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

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
        {rewards > 0 && (
          <span className="hidden items-center gap-1 rounded-lg bg-amber-400/10 px-2 py-1.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-400/30 sm:flex">
            <Coins size={12} /> {rewards} TKW
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
    <button
      onClick={connect}
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
    </button>
  );
}

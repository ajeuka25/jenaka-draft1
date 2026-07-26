import { ShieldCheck } from 'lucide-react';
import { NAV_ITEMS, type ViewKey } from '@/lib/nav';
import { WalletButton } from '@/components/WalletButton';

interface HeaderProps {
  view: ViewKey;
  onNavigate: (v: ViewKey) => void;
}

export function Header({ view, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('dashboard')}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon/20 to-emerald-700/30 ring-1 ring-neon/40 transition group-hover:shadow-glow-green">
            <ShieldCheck className="h-5 w-5 text-neon" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="font-display text-base font-bold tracking-tight text-white">
              KawalDana<span className="text-neon"> AI</span>
            </span>
            <span className="mt-1 hidden items-center gap-1 rounded-full bg-neon/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-neon ring-1 ring-neon/30 sm:inline-flex">
              Web3 &amp; AI Sentinel
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded-2xl bg-white/5 p-1 ring-1 ring-white/10 lg:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-ink-700 text-white shadow-inner ring-1 ring-white/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={16} className={active ? 'text-neon' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <WalletButton />
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? 'bg-ink-700 text-white ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} className={active ? 'text-neon' : ''} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

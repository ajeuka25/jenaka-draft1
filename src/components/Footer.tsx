import { Github, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-neon/10 ring-1 ring-neon/30">
              <ShieldCheck className="h-4 w-4 text-neon" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-white">
                KawalDana<span className="text-neon"> AI</span>
              </p>
              <p className="text-xs text-slate-500">Web3 &amp; AI Sentinel</p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            Dibangun untuk transparansi anggaran publik. Data simulasi untuk demo
            Hackathon Web3.
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Heart size={13} className="text-danger" /> Warga Indonesia
            </span>
            <span className="flex items-center gap-1.5">
              <Github size={13} /> Open Source
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, ShieldCheck, AlertTriangle, PieChart } from 'lucide-react';
import { projects, type Project, getRiskLevel } from '@/data/projects';
import { ProjectCard } from '@/components/ProjectCard';
import { BudgetDonut } from '@/components/ui/BudgetDonut';
import { SocialRadar } from '@/components/ui/SocialRadar';

type Filter = 'all' | 'bahaya' | 'waspada' | 'aman';

interface DashboardViewProps {
  onOpenProject: (p: Project) => void;
}

export function DashboardView({ onOpenProject }: DashboardViewProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return projects
      .filter((p) => {
        if (filter !== 'all' && getRiskLevel(p.skorRisiko) !== filter) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          p.namaProyek.toLowerCase().includes(q) ||
          p.lokasi.toLowerCase().includes(q) ||
          p.namaVendor.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.skorRisiko - a.skorRisiko);
  }, [query, filter]);

  const counts = useMemo(() => {
    return {
      all: projects.length,
      bahaya: projects.filter((p) => getRiskLevel(p.skorRisiko) === 'bahaya').length,
      waspada: projects.filter((p) => getRiskLevel(p.skorRisiko) === 'waspada').length,
      aman: projects.filter((p) => getRiskLevel(p.skorRisiko) === 'aman').length,
    };
  }, []);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Semua', count: counts.all },
    { key: 'bahaya', label: 'Bahaya', count: counts.bahaya },
    { key: 'waspada', label: 'Waspada', count: counts.waspada },
    { key: 'aman', label: 'Aman', count: counts.aman },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold text-white">Daftar Proyek Diaudit</h2>
        <p className="text-sm text-slate-400">
          Dipantau oleh AI Sentinel — diurutkan dari skor risiko tertinggi.
        </p>
      </div>

      {/* Budget allocation chart */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-neon" />
          <h3 className="font-display text-lg font-semibold text-white">
            Alokasi Anggaran vs Anomali
          </h3>
        </div>
        <BudgetDonut />
      </section>

      {/* Social Media & News AI Radar */}
      <section className="mb-8">
        <SocialRadar />
      </section>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari proyek, vendor, atau lokasi…"
            className="w-full rounded-xl bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 ring-1 ring-white/10 transition focus:outline-none focus:ring-neon/50"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-white/5 p-1 ring-1 ring-white/10 lg:justify-end">
          <SlidersHorizontal size={15} className="ml-1.5 shrink-0 text-slate-500" />
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === f.key
                  ? 'bg-ink-700 text-white ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.key === 'aman' && <ShieldCheck size={12} className="text-neon" />}
              {f.key === 'bahaya' && <AlertTriangle size={12} className="text-danger" />}
              {f.key === 'waspada' && <AlertTriangle size={12} className="text-amber-400" />}
              {f.label}
              <span className="rounded bg-white/10 px-1 text-[10px] text-slate-300">
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
          <p className="text-sm text-slate-400">
            Tidak ada proyek yang cocok dengan filter ini.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} onOpen={onOpenProject} />
          ))}
        </div>
      )}
    </div>
  );
}

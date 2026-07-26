import { useState } from 'react';
import {
  MapPin,
  CalendarDays,
  Building2,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  type Project,
  getRiskLevel,
  RISK_META,
  formatRupiah,
  formatDate,
  getEstimatedLoss,
  getMarkup,
  formatCompactRupiah,
} from '@/data/projects';
import { RiskGauge } from '@/components/ui/RiskGauge';

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
}

export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const level = getRiskLevel(project.skorRisiko);
  const meta = RISK_META[level];
  const loss = getEstimatedLoss(project);
  const flaggedItems = project.rincianBarang.filter((b) => getMarkup(b).inflated);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(project)}
      style={{ animationDelay: `${index * 110}ms` }}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl glass p-5 transition-all duration-300 animate-fade-in-up hover:-translate-y-1 ${meta.glow} hover:ring-1 hover:ring-white/20`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity duration-500 ${
          level === 'aman' ? 'bg-neon' : level === 'waspada' ? 'bg-amber-400' : 'bg-danger'
        } ${hovered ? 'opacity-40' : 'opacity-15'}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-300 ring-1 ring-white/10">
              {project.id}
            </span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-300 ring-1 ring-white/10">
              {project.kategori}
            </span>
            <span
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ${
                meta.badge
              }`}
            >
              {level === 'aman' ? (
                <ShieldCheck size={12} />
              ) : (
                <AlertTriangle size={12} />
              )}
              {meta.label}
            </span>
          </div>
          <h3 className="font-display text-base font-semibold leading-snug text-white">
            {project.namaProyek}
          </h3>
        </div>

        <RiskGauge score={project.skorRisiko} size={88} />
      </div>

      <div className="relative mt-4 grid gap-2 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="shrink-0 text-slate-500" />
          <span className="truncate">{project.lokasi}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="shrink-0 text-slate-500" />
          <span>{formatDate(project.tanggal)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 size={14} className="shrink-0 text-slate-500" />
          <span className="truncate">{project.namaVendor}</span>
          <span
            className={`ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
              /hari/i.test(project.umurVendor)
                ? 'bg-danger/20 text-danger ring-1 ring-danger/40'
                : 'bg-white/5 text-slate-400'
            }`}
          >
            <Clock size={10} /> {project.umurVendor}
          </span>
        </div>
      </div>

      <div className="relative mt-4 flex items-end justify-between border-t border-white/10 pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Anggaran
          </p>
          <p className="font-display text-lg font-bold text-white">
            {formatCompactRupiah(project.totalAnggaran)}
          </p>
        </div>
        {loss > 0 && (
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">
              Est. Kerugian
            </p>
            <p className="font-display text-sm font-bold text-danger">
              {formatCompactRupiah(loss)}
            </p>
          </div>
        )}
      </div>

      <div className="relative mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {flaggedItems.length} item ditandai
          </span>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-neon transition group-hover:gap-2">
          Detail Audit
          <ChevronRight size={16} />
        </span>
      </div>
    </article>
  );
}

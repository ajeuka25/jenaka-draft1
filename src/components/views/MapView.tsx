import { useState } from 'react';
import {
  Map as MapIcon,
  MapPin,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Users,
  Wallet,
} from 'lucide-react';
import {
  projects,
  getRiskLevel,
  RISK_META,
  formatRupiah,
  type Project,
} from '@/data/projects';
import { Modal } from '@/components/ui/Modal';

const RISK_STYLE = {
  bahaya: { fill: '#EF4444', glow: 'drop-shadow(0 0 8px #EF4444)', pulse: true },
  waspada: { fill: '#F59E0B', glow: 'drop-shadow(0 0 6px #F59E0B)', pulse: true },
  aman: { fill: '#22C55E', glow: 'drop-shadow(0 0 4px #22C55E)', pulse: false },
} as const;

const MAP_W = 800;
const MAP_H = 480;

// Project geo coordinates → map pixel projection (Indonesia bbox approx)
function projectToPx(lat: number, lng: number) {
  const minLat = -8.5,
    maxLat = -6.5,
    minLng = 106,
    maxLng = 109;
  const x = ((lng - minLng) / (maxLng - minLng)) * (MAP_W - 80) + 40;
  const y = ((maxLat - lat) / (maxLat - minLat)) * (MAP_H - 80) + 40;
  return { x, y };
}

export function MapView() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'all' | 'bahaya' | 'waspada' | 'aman'>('all');

  const filtered = projects.filter(
    (p) => filter === 'all' || getRiskLevel(p.skorRisiko) === filter,
  );

  const counts = {
    bahaya: projects.filter((p) => getRiskLevel(p.skorRisiko) === 'bahaya').length,
    waspada: projects.filter((p) => getRiskLevel(p.skorRisiko) === 'waspada').length,
    aman: projects.filter((p) => getRiskLevel(p.skorRisiko) === 'aman').length,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-1">
        <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full bg-web3/10 px-3 py-1 text-xs font-semibold text-web3 ring-1 ring-web3/30">
          <MapIcon size={13} /> Spatial Risk Heatmap
        </div>
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Peta Risiko Spasial Anomali Anggaran
        </h2>
        <p className="text-sm text-slate-400">
          Visualisasi geografis titik-titik proyek berdasarkan AI Risk Score.
          Klik marker untuk detail proyek.
        </p>
      </div>

      {/* Filter chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterChip
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="Semua"
          count={projects.length}
        />
        <FilterChip
          active={filter === 'bahaya'}
          onClick={() => setFilter('bahaya')}
          label="Merah (High Risk)"
          count={counts.bahaya}
          dot="bg-danger"
        />
        <FilterChip
          active={filter === 'waspada'}
          onClick={() => setFilter('waspada')}
          label="Kuning (Medium)"
          count={counts.waspada}
          dot="bg-amber-400"
        />
        <FilterChip
          active={filter === 'aman'}
          onClick={() => setFilter('aman')}
          label="Hijau (Low Risk)"
          count={counts.aman}
          dot="bg-neon"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Map */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-800/60">
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="h-auto w-full"
            style={{ minHeight: 360 }}
          >
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
              <radialGradient id="bgGlow" cx="50%" cy="40%">
                <stop offset="0%" stopColor="rgba(6,182,212,0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width={MAP_W} height={MAP_H} fill="url(#bgGlow)" />
            <rect width={MAP_W} height={MAP_H} fill="url(#grid)" />

            {/* Decorative landmass shapes */}
            <g opacity="0.15" fill="#22C55E">
              <path d="M120,180 Q200,140 320,160 Q380,200 340,280 Q250,300 180,260 Z" />
              <path d="M420,200 Q520,180 600,220 Q640,280 560,310 Q480,300 440,260 Z" />
            </g>

            {/* Heatmap circles */}
            {filtered.map((p) => {
              const { x, y } = projectToPx(p.koordinat.lat, p.koordinat.lng);
              const level = getRiskLevel(p.skorRisiko);
              const style = RISK_STYLE[level];
              return (
                <circle
                  key={`heat-${p.id}`}
                  cx={x}
                  cy={y}
                  r={60}
                  fill={style.fill}
                  opacity={0.08}
                />
              );
            })}

            {/* Markers */}
            {filtered.map((p) => {
              const { x, y } = projectToPx(p.koordinat.lat, p.koordinat.lng);
              const level = getRiskLevel(p.skorRisiko);
              const style = RISK_STYLE[level];
              return (
                <g
                  key={p.id}
                  transform={`translate(${x},${y})`}
                  className="cursor-pointer"
                  onClick={() => setSelected(p)}
                >
                  {style.pulse && (
                    <circle r="18" fill={style.fill} opacity="0.2">
                      <animate attributeName="r" values="14;26;14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r="14"
                    fill={style.fill}
                    stroke="white"
                    strokeWidth="2"
                    style={{ filter: style.glow }}
                  />
                  <text
                    y="5"
                    textAnchor="middle"
                    className="fill-white font-bold"
                    style={{ fontSize: 10 }}
                  >
                    {p.skorRisiko}
                  </text>
                  <text
                    y="32"
                    textAnchor="middle"
                    className="fill-slate-300"
                    style={{ fontSize: 11 }}
                  >
                    {p.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend overlay */}
          <div className="absolute bottom-3 left-3 rounded-xl bg-ink-900/80 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Risk Level
            </p>
            <div className="space-y-1.5">
              <LegendItem color="#EF4444" label="High Risk > 75%" />
              <LegendItem color="#F59E0B" label="Medium Risk 40-75%" />
              <LegendItem color="#22C55E" label="Low Risk < 40%" />
            </div>
          </div>
        </div>

        {/* Side panel — project list */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-white">
            <TrendingUp size={18} className="text-web3" /> Titik Proyek
          </h3>
          {filtered.map((p) => {
            const level = getRiskLevel(p.skorRisiko);
            const meta = RISK_META[level];
            const Icon =
              level === 'aman' ? ShieldCheck : level === 'waspada' ? AlertTriangle : AlertOctagon;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-neon/30 hover:bg-white/10"
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${meta.badge}`}>
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{p.namaProyek}</p>
                  <p className="text-xs text-slate-400">{p.lokasi}</p>
                </div>
                <span className={`shrink-0 font-display text-lg font-bold ${meta.color}`}>
                  {p.skorRisiko}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.namaProyek ?? ''}
        subtitle={selected ? `${selected.id} • ${selected.lokasi}` : ''}
        icon={
          selected && (
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${RISK_META[getRiskLevel(selected.skorRisiko)].badge}`}>
              <MapPin size={20} />
            </span>
          )
        }
        maxWidth="max-w-lg"
      >
        {selected && <ProjectDetailContent project={selected} />}
      </Modal>
    </div>
  );
}

function ProjectDetailContent({ project }: { project: Project }) {
  const level = getRiskLevel(project.skorRisiko);
  const meta = RISK_META[level];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Total Anggaran</p>
          <p className="mt-1 font-display text-lg font-bold text-white">
            {formatRupiah(project.totalAnggaran)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">AI Risk Score</p>
          <p className={`mt-1 font-display text-lg font-bold ${meta.color}`}>
            {project.skorRisiko} / 100
          </p>
        </div>
      </div>

      <div className={`rounded-xl border p-4 ${meta.badge}`}>
        <p className="flex items-center gap-2 text-sm font-bold">
          {level === 'aman' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
          Status: {meta.label}
        </p>
        <p className="mt-1.5 text-sm text-slate-300">{project.deskripsiAnomaliAI}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat icon={Users} label="Laporan Warga" value={project.laporanWarga.toString()} />
        <MiniStat icon={Wallet} label="Vendor" value={project.namaVendor} small />
        <MiniStat icon={MapPin} label="Koordinat" value={`${project.koordinat.lat.toFixed(4)}, ${project.koordinat.lng.toFixed(4)}`} small />
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  small,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <Icon size={16} className="mx-auto mb-1 text-slate-400" />
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-0.5 font-semibold text-white ${small ? 'text-[11px]' : 'text-sm'}`}>{value}</p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  dot,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  dot?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-ink-700 text-white ring-1 ring-white/10'
          : 'bg-white/5 text-slate-400 ring-1 ring-white/10 hover:text-white'
      }`}
    >
      {dot && <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />}
      {label}
      <span className="rounded bg-white/10 px-1 text-[10px]">{count}</span>
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full" style={{ background: color }} />
      <span className="text-xs text-slate-300">{label}</span>
    </div>
  );
}

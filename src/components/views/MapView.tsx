import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Circle,
  Marker,
  Tooltip,
  ScaleControl,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import {
  Map as MapIcon,
  MapPin,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Users,
  Wallet,
  Maximize2,
  Crosshair,
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

// Pusat awal peta: Pulau Jawa (fallback bila tidak ada proyek terfilter)
const DEFAULT_CENTER: [number, number] = [-7.0, 107.5];
const DEFAULT_ZOOM = 8;

// Marker berbentuk lencana bulat berisi skor risiko (HTML divIcon)
function buildIcon(fill: string, score: number, pulse: boolean, id: string) {
  return L.divIcon({
    className: 'risk-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `
      <div class="risk-marker__wrap">
        ${pulse ? `<span class="risk-marker__pulse" style="background:${fill}"></span>` : ''}
        <span class="risk-marker__dot" style="background:${fill};box-shadow:0 0 10px ${fill}">${score}</span>
        <span class="risk-marker__label">${id}</span>
      </div>`,
  });
}

// Zoom otomatis agar semua marker yang terfilter terlihat
function FitBounds({ points, resetKey }: { points: [number, number][]; resetKey: number }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 11);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [60, 60], maxZoom: 11 });
  }, [map, points, resetKey]);
  return null;
}

// Terbang (zoom in) ke proyek yang dipilih dari daftar samping
function FlyToProject({ target }: { target: { lat: number; lng: number; n: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], 14, { duration: 1.2 });
  }, [map, target]);
  return null;
}

export function MapView() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; n: number } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [filter, setFilter] = useState<'all' | 'bahaya' | 'waspada' | 'aman'>('all');

  const filtered = projects.filter(
    (p) => filter === 'all' || getRiskLevel(p.skorRisiko) === filter,
  );

  const points = useMemo<[number, number][]>(
    () => filtered.map((p) => [p.koordinat.lat, p.koordinat.lng]),
    [filtered],
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
          Klik marker untuk detail proyek. Zoom dengan tombol +/−, scroll mouse, dobel-klik, atau cubit di layar sentuh.
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
        <div className="relative isolate z-0 overflow-hidden rounded-2xl border border-white/10 bg-ink-800/60">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            minZoom={3}
            maxZoom={19}
            zoomControl={false}
            scrollWheelZoom
            doubleClickZoom
            touchZoom
            boxZoom
            keyboard
            zoomSnap={0.5}
            zoomDelta={1}
            wheelPxPerZoomLevel={90}
            worldCopyJump
            className="h-[480px] w-full sm:h-[560px]"
            style={{ background: '#0b1120' }}
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap Gelap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="osm-dark-tiles"
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="OpenStreetMap Standar">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="OpenTopoMap (Topografi)">
                <TileLayer
                  attribution='Map data: &copy; OpenStreetMap contributors, SRTM | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  subdomains="abc"
                  maxZoom={17}
                />
              </LayersControl.BaseLayer>
            </LayersControl>
            <ZoomControl position="topleft" zoomInTitle="Perbesar (zoom in)" zoomOutTitle="Perkecil (zoom out)" />
            <ScaleControl position="bottomright" imperial={false} />
            <FitBounds points={points} resetKey={resetKey} />
            <FlyToProject target={flyTarget} />

            {/* Heat halo — radius dalam meter, ikut skala peta */}
            {filtered.map((p) => {
              const style = RISK_STYLE[getRiskLevel(p.skorRisiko)];
              return (
                <Circle
                  key={`heat-${p.id}`}
                  center={[p.koordinat.lat, p.koordinat.lng]}
                  radius={5000 + p.skorRisiko * 100}
                  pathOptions={{
                    color: style.fill,
                    weight: 1,
                    opacity: 0.4,
                    fillColor: style.fill,
                    fillOpacity: 0.15,
                  }}
                />
              );
            })}

            {/* Markers */}
            {filtered.map((p) => {
              const level = getRiskLevel(p.skorRisiko);
              const style = RISK_STYLE[level];
              return (
                <Marker
                  key={p.id}
                  position={[p.koordinat.lat, p.koordinat.lng]}
                  icon={buildIcon(style.fill, p.skorRisiko, style.pulse, p.id)}
                  eventHandlers={{ click: () => setSelected(p) }}
                >
                  <Tooltip direction="top" offset={[0, -16]}>
                    <strong>{p.namaProyek}</strong>
                    <br />
                    {p.lokasi}
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Tombol bantu: lihat semua titik */}
          <button
            type="button"
            onClick={() => setResetKey((k) => k + 1)}
            title="Tampilkan semua titik proyek"
            className="absolute left-[10px] top-[86px] z-[1000] grid h-[30px] w-[30px] place-items-center rounded bg-white text-slate-700 shadow ring-1 ring-black/20 hover:bg-slate-100"
          >
            <Maximize2 size={15} />
          </button>

          {/* Legend overlay */}
          <div className="absolute bottom-8 left-3 z-[1000] rounded-xl bg-ink-900/80 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
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
              <div key={p.id} className="flex items-stretch gap-2">
              <button
                onClick={() => setSelected(p)}
                className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-neon/30 hover:bg-white/10"
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
              <button
                type="button"
                onClick={() => setFlyTarget({ ...p.koordinat, n: Date.now() })}
                title="Zoom ke lokasi di peta"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/5 text-slate-400 ring-1 ring-white/10 transition hover:text-neon"
              >
                <Crosshair size={16} />
              </button>
              </div>
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
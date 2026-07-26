export interface RincianBarang {
  nama: string;
  jumlah: number;
  hargaLPJ: number;
  hargaPasar: number;
}

export interface Project {
  id: string;
  namaProyek: string;
  kategori: string;
  totalAnggaran: number;
  lokasi: string;
  tanggal: string;
  namaVendor: string;
  umurVendor: string;
  skorRisiko: number;
  rincianBarang: RincianBarang[];
  deskripsiAnomaliAI: string;
}

export const projects: Project[] = [
  {
    id: 'PRJ-001',
    namaProyek: 'Program Makan Bergizi Gratis (MBG) SD Negeri 01 Sukamaju',
    kategori: 'Program Makan Bergizi',
    totalAnggaran: 15000000,
    lokasi: 'SD Negeri 01 Sukamaju, Kabupaten Sukamaju',
    tanggal: '2026-06-15',
    namaVendor: 'CV Nutrisi Maju Bersama',
    umurVendor: '3 hari',
    skorRisiko: 98,
    rincianBarang: [
      {
        nama: 'Paket Makan Bergizi (Daging & Susu)',
        jumlah: 1000,
        hargaLPJ: 15000,
        hargaPasar: 15000,
      },
      {
        nama: 'Realisasi Menu (Tahu Tempe)',
        jumlah: 1000,
        hargaLPJ: 15000,
        hargaPasar: 5000,
      },
    ],
    deskripsiAnomaliAI:
      'Terindikasi ketidaksesuaian serius antara LPJ dan realisasi. LPJ mencantumkan menu daging dan susu senilai Rp15.000/porsi, namun hasil pelaksanaan hanya berupa tahu tempe dengan estimasi nilai Rp5.000/porsi. Vendor juga baru berdiri selama 3 hari sehingga berisiko tinggi.',
  },
  {
    id: 'PRJ-002',
    namaProyek: 'Pembangunan Jalan Beton Desa Sukagalih',
    kategori: 'Infrastruktur',
    totalAnggaran: 875000000,
    lokasi: 'Desa Sukagalih, Kabupaten Sukagalih',
    tanggal: '2026-05-28',
    namaVendor: 'CV Karya Beton Nusantara',
    umurVendor: '4 tahun',
    skorRisiko: 95,
    rincianBarang: [
      {
        nama: 'Semen Gresik 50 kg',
        jumlah: 1200,
        hargaLPJ: 160000,
        hargaPasar: 65000,
      },
      { nama: 'Pasir Cor', jumlah: 180, hargaLPJ: 340000, hargaPasar: 330000 },
      { nama: 'Batu Split', jumlah: 220, hargaLPJ: 390000, hargaPasar: 385000 },
    ],
    deskripsiAnomaliAI:
      'Terindikasi mark-up harga material. Harga Semen Gresik dalam LPJ mencapai Rp160.000 per sak, jauh di atas harga acuan pasar daerah sebesar Rp65.000 per sak sehingga memerlukan audit lanjutan.',
  },
  {
    id: 'PRJ-003',
    namaProyek: 'Renovasi Balai Desa Makmur',
    kategori: 'Renovasi Bangunan Publik',
    totalAnggaran: 285000000,
    lokasi: 'Desa Makmur, Kabupaten Makmur',
    tanggal: '2026-04-10',
    namaVendor: 'CV Bangun Sejahtera',
    umurVendor: '8 tahun',
    skorRisiko: 12,
    rincianBarang: [
      { nama: 'Semen Portland 50 kg', jumlah: 500, hargaLPJ: 68000, hargaPasar: 67000 },
      { nama: 'Cat Tembok 25 kg', jumlah: 60, hargaLPJ: 325000, hargaPasar: 320000 },
      { nama: 'Keramik Lantai 60x60 cm', jumlah: 250, hargaLPJ: 118000, hargaPasar: 120000 },
    ],
    deskripsiAnomaliAI:
      'Tidak ditemukan indikasi penyimpangan yang signifikan. Harga barang masih berada dalam rentang harga pasar dan profil vendor dinilai wajar.',
  },
];

export type RiskLevel = 'aman' | 'waspada' | 'bahaya';

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'bahaya';
  if (score >= 40) return 'waspada';
  return 'aman';
}

export const RISK_META: Record<
  RiskLevel,
  {
    label: string;
    color: string;
    ring: string;
    glow: string;
    dot: string;
    badge: string;
    fill: string;
  }
> = {
  aman: {
    label: 'Aman',
    color: 'text-neon',
    ring: 'stroke-neon',
    glow: 'shadow-glow-green',
    dot: 'bg-neon',
    badge: 'bg-neon/20 text-neon ring-neon/50',
    fill: '#22C55E',
  },
  waspada: {
    label: 'Waspada',
    color: 'text-amber-400',
    ring: 'stroke-amber-400',
    glow: 'shadow-glow-amber',
    dot: 'bg-amber-400',
    badge: 'bg-amber-400/20 text-amber-300 ring-amber-400/50',
    fill: '#F59E0B',
  },
  bahaya: {
    label: 'Bahaya',
    color: 'text-danger',
    ring: 'stroke-danger',
    glow: 'shadow-glow-red',
    dot: 'bg-danger',
    badge: 'bg-danger/20 text-red-300 ring-danger/50',
    fill: '#EF4444',
  },
};

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactRupiah(value: number): string {
  if (value >= 1_000_000_000)
    return `Rp ${(value / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  if (value >= 1_000_000) return `Rp ${Math.round(value / 1_000_000)} jt`;
  if (value >= 1000) return `Rp ${Math.round(value / 1000)} rb`;
  return formatRupiah(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export interface MarkupInfo {
  diff: number;
  pct: number;
  totalDiff: number;
  inflated: boolean;
}

export function getMarkup(b: RincianBarang): MarkupInfo {
  const diff = b.hargaLPJ - b.hargaPasar;
  const pct = b.hargaPasar > 0 ? (diff / b.hargaPasar) * 100 : 0;
  return {
    diff,
    pct,
    totalDiff: diff * b.jumlah,
    inflated: Math.abs(pct) > 5,
  };
}

export function getEstimatedLoss(p: Project): number {
  return p.rincianBarang.reduce((sum, b) => {
    const diff = b.hargaLPJ - b.hargaPasar;
    return sum + (diff > 0 ? diff * b.jumlah : 0);
  }, 0);
}

export function totalBudgetAudited(): number {
  return projects.reduce((s, p) => s + p.totalAnggaran, 0);
}

export function totalRedFlags(): number {
  return projects.filter((p) => getRiskLevel(p.skorRisiko) === 'bahaya').length;
}

export function isVendorSuspicious(p: Project): boolean {
  const m = p.umurVendor.match(/(\d+)\s*(hari|bulan|minggu)/i);
  if (m) {
    const unit = m[2].toLowerCase();
    const val = parseInt(m[1], 10);
    if (unit === 'hari') return val <= 30;
    if (unit === 'minggu') return val <= 4;
    if (unit === 'bulan') return val <= 1;
  }
  return false;
}

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let h = '0x';
  for (let i = 0; i < 64; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

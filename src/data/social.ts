export type SocialSource = 'Twitter/X' | 'News Portal' | 'TikTok' | 'Instagram';
export type SocialSentiment = 'Sangat Negatif' | 'Negatif' | 'Indikasi Penggelembungan' | 'Netral';
export type SocialStatus =
  | 'Auto-Flagged to Audit'
  | 'Linked to PRJ-002'
  | 'Linked to PRJ-001'
  | 'Monitoring';

export interface SocialPost {
  id: string;
  source: SocialSource;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  reach: number;
  sentiment: SocialSentiment;
  status: SocialStatus;
  linkedProject?: string;
}

const AVATAR_COLORS: Record<SocialSource, string> = {
  'Twitter/X': 'bg-sky-500/20 text-sky-400 ring-sky-500/30',
  'News Portal': 'bg-amber-400/20 text-amber-400 ring-amber-400/30',
  TikTok: 'bg-rose-500/20 text-rose-400 ring-rose-500/30',
  Instagram: 'bg-fuchsia-500/20 text-fuchsia-400 ring-fuchsia-500/30',
};

export function avatarClass(source: SocialSource): string {
  return AVATAR_COLORS[source];
}

export const SENTIMENT_STYLE: Record<SocialSentiment, string> = {
  'Sangat Negatif': 'bg-danger/20 text-red-300 ring-danger/40',
  Negatif: 'bg-danger/15 text-danger ring-danger/30',
  'Indikasi Penggelembungan': 'bg-amber-400/15 text-amber-300 ring-amber-400/40',
  Netral: 'bg-slate-400/15 text-slate-300 ring-slate-400/30',
};

export const STATUS_STYLE: Record<SocialStatus, string> = {
  'Auto-Flagged to Audit': 'bg-danger/20 text-red-300 ring-danger/40',
  'Linked to PRJ-002': 'bg-amber-400/20 text-amber-300 ring-amber-400/40',
  'Linked to PRJ-001': 'bg-danger/20 text-red-300 ring-danger/40',
  Monitoring: 'bg-sky-400/15 text-sky-400 ring-sky-400/30',
};

export const initialSocialPosts: SocialPost[] = [
  {
    id: 'SOC-001',
    source: 'Twitter/X',
    handle: '@WargaSukamaju',
    avatar: 'WS',
    content:
      "Lauk MBG di SD 01 cuma tahu tempe basi! Mana dagingnya? Anak saya pulang lapar terus. @Kemendikbud @KPK_RI",
    timestamp: '2 jam lalu',
    reach: 12400,
    sentiment: 'Sangat Negatif',
    status: 'Auto-Flagged to Audit',
    linkedProject: 'PRJ-001',
  },
  {
    id: 'SOC-002',
    source: 'News Portal',
    handle: 'DetikDesa',
    avatar: 'DD',
    content:
      'Warga Pertanyakan Kualitas Jalan Beton Sukagalih yang Retak dalam 1 Bulan — Warga menduga material tidak sesuai standar LPJ.',
    timestamp: '5 jam lalu',
    reach: 8900,
    sentiment: 'Indikasi Penggelembungan',
    status: 'Linked to PRJ-002',
    linkedProject: 'PRJ-002',
  },
  {
    id: 'SOC-003',
    source: 'TikTok',
    handle: '@anak_sukamaju',
    avatar: 'AS',
    content:
      'Video viral: porsi makan MBG di sekolah vs foto di brosur LPJ. Beda jauh! #KorupsiMBG #KawalDana',
    timestamp: '8 jam lalu',
    reach: 45000,
    sentiment: 'Sangat Negatif',
    status: 'Linked to PRJ-001',
    linkedProject: 'PRJ-001',
  },
];

export const scrapedSocialPosts: SocialPost[] = [
  {
    id: 'SOC-004',
    source: 'Instagram',
    handle: '@mom_sukamaju',
    avatar: 'MS',
    content:
      'Story 24 jam: ini cuma dapat nasi + tahu. Janjinya ayam dan susu. Malu sama anak sendiri jawab apa.',
    timestamp: '30 menit lalu',
    reach: 3200,
    sentiment: 'Negatif',
    status: 'Auto-Flagged to Audit',
    linkedProject: 'PRJ-001',
  },
  {
    id: 'SOC-005',
    source: 'Twitter/X',
    handle: '@DesaSukagalih',
    avatar: 'DS',
    content:
      'Jalan beton baru 3 minggu udah berlubang. Kontraktor katanya dari vendor 4 tahun, kok kerjanya begini? Audit dong!',
    timestamp: '1 jam lalu',
    reach: 6700,
    sentiment: 'Indikasi Penggelembungan',
    status: 'Linked to PRJ-002',
    linkedProject: 'PRJ-002',
  },
  {
    id: 'SOC-006',
    source: 'News Portal',
    handle: 'TribunDesa',
    avatar: 'TD',
    content:
      'Investigasi: Vendor MBG Sukamaju berdiri 3 hari sebelum menang tender. Ahli tender menyebut ini bendera merah.',
    timestamp: '3 jam lalu',
    reach: 21000,
    sentiment: 'Sangat Negatif',
    status: 'Auto-Flagged to Audit',
    linkedProject: 'PRJ-001',
  },
];

export function formatReach(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',')} rb`;
  return n.toString();
}

export type ReportCategory =
  | 'MBG'
  | 'Infrastruktur'
  | 'Sosial'
  | 'Pengadaan'
  | 'Lainnya';

export type ReportStatus = 'Masuk' | 'Diverifikasi' | 'Diteruskan';

export interface EvidenceItem {
  id: string;
  type: 'photo' | 'gps' | 'onchain';
  title: string;
  description: string;
  image?: string;
  location?: string;
  timestamp: string;
  txHash?: string;
}

export interface CitizenReport {
  id: string;
  nama: string;
  anonim: boolean;
  kategori: ReportCategory;
  lokasi: string;
  judul: string;
  detail: string;
  tanggal: string;
  status: ReportStatus;
  bukti: number;
  upvote: number;
  evidence: EvidenceItem[];
  zkVerified?: boolean;
}

const FOOD_IMAGE =
  'https://images.pexels.com/photos/36982092/pexels-photo-36982092.jpeg?auto=compress&cs=tinysrgb&w=600';

export const evidenceByReport: Record<string, EvidenceItem[]> = {
  'RPT-001': [
    {
      id: 'EV-001a',
      type: 'photo',
      title: 'Foto Porsi MBG dari Warga',
      description:
        'Foto langsung dari kotak makan anak. Terlihat hanya nasi, tahu, dan tempe — tidak ada daging atau susu sesuai klaim LPJ.',
      image: FOOD_IMAGE,
      timestamp: '2026-06-17 11:32',
    },
    {
      id: 'EV-001b',
      type: 'gps',
      title: 'Geotag GPS Lokasi',
      description: 'Titik koordinat dikonfirmasi di dalam area SD Negeri 01 Sukamaju.',
      location: 'SD Negeri 01 Sukamaju (-6.1234, 107.5678)',
      timestamp: '2026-06-17 11:32',
    },
    {
      id: 'EV-001c',
      type: 'onchain',
      title: 'Transaksi Bukti On-Chain',
      description: 'Hash evidence tercatat immutable di ledger testnet KawalDana.',
      txHash: '0x8f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      timestamp: '2026-06-17 14:05',
    },
  ],
  'RPT-002': [
    {
      id: 'EV-002a',
      type: 'photo',
      title: 'Foto Retakan Jalan Beton',
      description:
        'Retakan melintang pada jalan beton Desa Sukagalih, berusia kurang dari 2 bulan pasca-pembangunan.',
      image:
        'https://images.pexels.com/photos/2590988/pexels-photo-2590988.jpeg?auto=compress&cs=tinysrgb&w=600',
      timestamp: '2026-06-02 08:15',
    },
    {
      id: 'EV-002b',
      type: 'gps',
      title: 'Geotag GPS Lokasi',
      description: 'Koordinat pengambilan foto di ruas jalan Desa Sukagalih.',
      location: 'Jalan Raya Sukagalih (-7.2345, 108.9012)',
      timestamp: '2026-06-02 08:15',
    },
    {
      id: 'EV-002c',
      type: 'onchain',
      title: 'Transaksi Bukti On-Chain',
      description: 'Hash evidence retakan jalan tercatat on-chain.',
      txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      timestamp: '2026-06-02 10:20',
    },
  ],
  'RPT-003': [
    {
      id: 'EV-003a',
      type: 'photo',
      title: 'Foto Renovasi Balai Desa',
      description:
        'Hasil renovasi terlihat sesuai brosur — material dan finishing dalam kondisi baik.',
      image:
        'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600',
      timestamp: '2026-04-28 13:00',
    },
    {
      id: 'EV-003b',
      type: 'onchain',
      title: 'Transaksi Bukti On-Chain',
      description: 'Verifikasi positif — tidak ada anomali terdeteksi.',
      txHash: '0x3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e',
      timestamp: '2026-04-28 15:30',
    },
  ],
  'RPT-004': [
    {
      id: 'EV-004a',
      type: 'onchain',
      title: 'Catatan Pencairan BLT',
      description: 'Bukti transfer BLT bulan 1 vs bulan 2-3, terdapat selisih.',
      txHash: '0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
      timestamp: '2026-05-12 09:45',
    },
  ],
  'RPT-005': [
    {
      id: 'EV-005a',
      type: 'photo',
      title: 'Foto Menu Mi Instan',
      description: 'Porsi berganti menjadi mi instan dan telur pada minggu kedua.',
      image:
        'https://images.pexels.com/photos/8500165/pexels-photo-8500165.jpeg?auto=compress&cs=tinysrgb&w=600',
      timestamp: '2026-06-20 12:00',
    },
    {
      id: 'EV-005b',
      type: 'gps',
      title: 'Geotag GPS Lokasi',
      description: 'Lokasi dikonfirmasi di SD Negeri 03 Cibadak.',
      location: 'SD Negeri 03 Cibadak (-6.9876, 106.5432)',
      timestamp: '2026-06-20 12:00',
    },
  ],
};

export const initialReports: CitizenReport[] = [
  {
    id: 'RPT-001',
    nama: 'Ibu Yanti',
    anonim: false,
    kategori: 'MBG',
    lokasi: 'SD Negeri 01 Sukamaju, Kabupaten Sukamaju',
    judul: 'Anak hanya diberi tahu tempe, padahal LPJ daging & susu',
    detail:
      'Saya kira anak-anak akan menerima paket bergizi seperti di brosur (daging & susu). Faktanya selama 3 hari hanya nasi, tahu, dan tempe. Menu mewah hanya ada di kertas LPJ.',
    tanggal: '2026-06-17',
    status: 'Diteruskan',
    bukti: 4,
    upvote: 128,
    evidence: evidenceByReport['RPT-001'] ?? [],
  },
  {
    id: 'RPT-002',
    nama: 'Warga Sukagalih',
    anonim: true,
    kategori: 'Infrastruktur',
    lokasi: 'Desa Sukagalih, Kabupaten Sukagalih',
    judul: 'Jalan beton baru langsung retak di musim hujan pertama',
    detail:
      'Jalan yang dibangun Mei lalu sudah retak retak di beberapa titik. Belum genap 2 bulan. Curiga materialnya ditukar atau dibilang mahal padahal murah.',
    tanggal: '2026-06-02',
    status: 'Diverifikasi',
    bukti: 6,
    upvote: 87,
    evidence: evidenceByReport['RPT-002'] ?? [],
  },
  {
    id: 'RPT-003',
    nama: 'Pak Darmawan',
    anonim: false,
    kategori: 'Pengadaan',
    lokasi: 'Desa Makmur, Kabupaten Makmur',
    judul: 'Renovasi balai desa sesuai brosur, tidak ada keluhan',
    detail:
      'Renovasi balai desa selesai tepat waktu, material kelihatannya sama dengan yang di LPJ. Saya sudah cek sendiri, tidak ada yang janggal. Terima kasih.',
    tanggal: '2026-04-28',
    status: 'Diverifikasi',
    bukti: 2,
    upvote: 34,
    evidence: evidenceByReport['RPT-003'] ?? [],
  },
  {
    id: 'RPT-004',
    nama: 'Warga Makmur',
    anonim: true,
    kategori: 'Sosial',
    lokasi: 'Desa Makmur, Kabupaten Makmur',
    judul: 'Bantuan sosial BLT tebal di awal, tipis di akir',
    detail:
      'Pencairan BLT warga bulan pertama penuh, bulan kedua dan ketiga dikurangi tanpa pemberitahuan. Mohon ditransparankan potongannya untuk apa.',
    tanggal: '2026-05-12',
    status: 'Masuk',
    bukti: 1,
    upvote: 56,
    evidence: evidenceByReport['RPT-004'] ?? [],
  },
  {
    id: 'RPT-005',
    nama: 'Ibu Sri',
    anonim: false,
    kategori: 'MBG',
    lokasi: 'SD Negeri 03 Cibadak, Kabupaten Cibadak',
    judul: 'Menu bergizi berganti dengan mi instan',
    detail:
      'Awalnya anak-anak senang dapat ayam dan sayur. Minggu ke dua diganti mi instan dan telur. Katanya anggaran habis, padahal belum genap sebulan.',
    tanggal: '2026-06-20',
    status: 'Masuk',
    bukti: 3,
    upvote: 72,
    evidence: evidenceByReport['RPT-005'] ?? [],
  },
];

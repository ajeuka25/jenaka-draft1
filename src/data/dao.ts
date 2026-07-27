export interface DaoProposal {
  id: string;
  reportId: string;
  projectRef: string;
  title: string;
  description: string;
  stakePool: number;
  approvePct: number;
  disputePct: number;
  totalStakers: number;
  apyReward: number;
  slashingRisk: number;
  status: 'active' | 'passed' | 'disputed' | 'resolved';
  deadline: string;
}

export const daoProposals: DaoProposal[] = [
  {
    id: 'DAO-001',
    reportId: 'RPT-001',
    projectRef: 'PRJ-001',
    title: 'Verifikasi: MBG SD Negeri 01 Sukamaju',
    description:
      'Laporan warga menunjukkan porsi MBG hanya tahu tempe vs klaim LPJ daging & susu. Validator DAO memverifikasi temuan AI Vision.',
    stakePool: 24500,
    approvePct: 78,
    disputePct: 22,
    totalStakers: 14,
    apyReward: 18.5,
    slashingRisk: 12,
    status: 'active',
    deadline: '2 hari lagi',
  },
  {
    id: 'DAO-002',
    reportId: 'RPT-002',
    projectRef: 'PRJ-002',
    title: 'Dispute: Jalan Beton Sukagalih Retak',
    description:
      'Kontraktor menyangkal mark-up semen. Validator DAO melakukan audit independen material & cross-check harga pasar.',
    stakePool: 18700,
    approvePct: 61,
    disputePct: 39,
    totalStakers: 11,
    apyReward: 22.3,
    slashingRisk: 15,
    status: 'active',
    deadline: '4 jam lagi',
  },
  {
    id: 'DAO-003',
    reportId: 'RPT-003',
    projectRef: 'PRJ-003',
    title: 'Verifikasi: Renovasi Balai Desa Makmur',
    description:
      'Laporan warga mengkonfirmasi renovasi sesuai brosur. Consensus tercapai — bukti foto & on-chain verified.',
    stakePool: 9200,
    approvePct: 92,
    disputePct: 8,
    totalStakers: 7,
    apyReward: 8.2,
    slashingRisk: 5,
    status: 'passed',
    deadline: 'Selesai',
  },
];

export const STAKING_POOL_STATS = {
  totalStaked: 156400,
  totalValidators: 142,
  avgApy: 15.4,
  totalSlashed: 3200,
  tokenSymbol: 'KAWAL',
  tokenPrice: 0.42,
};

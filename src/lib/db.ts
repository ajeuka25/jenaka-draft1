import { supabase } from '@/lib/supabase';
import type {
  Project,
  RincianBarang,
} from '@/data/projects';
import type {
  CitizenReport,
  EvidenceItem,
  ReportCategory,
  ReportStatus,
} from '@/data/reports';
import type { DaoProposal } from '@/data/dao';
import type { SocialPost, SocialSource, SocialSentiment, SocialStatus } from '@/data/social';

// ── Row types (match DB columns) ──────────────────────────────

interface VendorRow {
  id: string;
  nama_vendor: string;
  umur_vendor: string;
  is_suspicious: boolean;
}

interface ProjectRow {
  id: string;
  nama_proyek: string;
  kategori: string;
  total_anggaran: number;
  lokasi: string;
  tanggal: string;
  vendor_id: string | null;
  skor_risiko: number;
  deskripsi_anomali_ai: string;
  koordinat_lat: number | null;
  koordinat_lng: number | null;
  laporan_warga: number;
}

interface ProjectItemRow {
  project_id: string;
  nama: string;
  jumlah: number;
  harga_lpj: number;
  harga_pasar: number;
}

interface ReportRow {
  id: string;
  nama: string;
  anonim: boolean;
  kategori: string;
  lokasi: string;
  judul: string;
  detail: string;
  tanggal: string;
  status: string;
  bukti: number;
  upvote: number;
  zk_verified: boolean;
  project_id: string | null;
}

interface EvidenceRow {
  id: string;
  report_id: string;
  type: string;
  title: string;
  description: string;
  image_url: string | null;
  location: string | null;
  tx_hash: string | null;
  evidence_timestamp: string;
}

interface DaoRow {
  id: string;
  report_id: string | null;
  project_ref: string | null;
  title: string;
  description: string;
  stake_pool: number;
  approve_pct: number;
  dispute_pct: number;
  total_stakers: number;
  apy_reward: number;
  slashing_risk: number;
  status: string;
  deadline: string;
}

interface SocialRow {
  id: string;
  source: string;
  handle: string;
  avatar: string;
  content: string;
  post_timestamp: string;
  reach: number;
  sentiment: string;
  status: string;
  linked_project: string | null;
}

// ── Mappers (DB row → app type) ───────────────────────────────

function mapProject(
  p: ProjectRow,
  items: ProjectItemRow[],
  vendors: VendorRow[],
): Project {
  const vendor = vendors.find((v) => v.id === p.vendor_id);
  const rincian: RincianBarang[] = items
    .filter((it) => it.project_id === p.id)
    .map((it) => ({
      nama: it.nama,
      jumlah: it.jumlah,
      hargaLPJ: it.harga_lpj,
      hargaPasar: it.harga_pasar,
    }));
  return {
    id: p.id,
    namaProyek: p.nama_proyek,
    kategori: p.kategori,
    totalAnggaran: p.total_anggaran,
    lokasi: p.lokasi,
    tanggal: p.tanggal,
    namaVendor: vendor?.nama_vendor ?? 'Tidak diketahui',
    umurVendor: vendor?.umur_vendor ?? '-',
    skorRisiko: p.skor_risiko,
    rincianBarang: rincian,
    deskripsiAnomaliAI: p.deskripsi_anomali_ai,
    koordinat: {
      lat: p.koordinat_lat ?? 0,
      lng: p.koordinat_lng ?? 0,
    },
    laporanWarga: p.laporan_warga,
  };
}

function mapEvidence(e: EvidenceRow): EvidenceItem {
  return {
    id: e.id,
    type: e.type as EvidenceItem['type'],
    title: e.title,
    description: e.description,
    image: e.image_url ?? undefined,
    location: e.location ?? undefined,
    txHash: e.tx_hash ?? undefined,
    timestamp: e.evidence_timestamp,
  };
}

function mapReport(r: ReportRow, evidence: EvidenceRow[]): CitizenReport {
  return {
    id: r.id,
    nama: r.nama,
    anonim: r.anonim,
    kategori: r.kategori as ReportCategory,
    lokasi: r.lokasi,
    judul: r.judul,
    detail: r.detail,
    tanggal: r.tanggal,
    status: r.status as ReportStatus,
    bukti: r.bukti,
    upvote: r.upvote,
    evidence: evidence
      .filter((e) => e.report_id === r.id)
      .map(mapEvidence),
    zkVerified: r.zk_verified,
  };
}

function mapDao(d: DaoRow): DaoProposal {
  return {
    id: d.id,
    reportId: d.report_id ?? '',
    projectRef: d.project_ref ?? '',
    title: d.title,
    description: d.description,
    stakePool: d.stake_pool,
    approvePct: d.approve_pct,
    disputePct: d.dispute_pct,
    totalStakers: d.total_stakers,
    apyReward: d.apy_reward,
    slashingRisk: d.slashing_risk,
    status: d.status as DaoProposal['status'],
    deadline: d.deadline,
  };
}

function mapSocial(s: SocialRow): SocialPost {
  return {
    id: s.id,
    source: s.source as SocialSource,
    handle: s.handle,
    avatar: s.avatar,
    content: s.content,
    timestamp: s.post_timestamp,
    reach: s.reach,
    sentiment: s.sentiment as SocialSentiment,
    status: s.status as SocialStatus,
    linkedProject: s.linked_project ?? undefined,
  };
}

// ── Public fetch functions ────────────────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  const [
    { data: projectRows, error: pErr },
    { data: itemRows, error: iErr },
    { data: vendorRows, error: vErr },
  ] = await Promise.all([
    supabase.from('projects').select('*'),
    supabase.from('project_items').select('*'),
    supabase.from('vendors').select('*'),
  ]);

  if (pErr) throw new Error(`Failed to load projects: ${pErr.message}`);
  if (iErr) throw new Error(`Failed to load project items: ${iErr.message}`);
  if (vErr) throw new Error(`Failed to load vendors: ${vErr.message}`);

  return (projectRows as ProjectRow[]).map((p) =>
    mapProject(p, itemRows as ProjectItemRow[], vendorRows as VendorRow[]),
  );
}

export async function fetchReports(): Promise<CitizenReport[]> {
  const [
    { data: reportRows, error: rErr },
    { data: evidenceRows, error: eErr },
  ] = await Promise.all([
    supabase.from('reports').select('*').order('tanggal', { ascending: false }),
    supabase.from('evidence').select('*'),
  ]);

  if (rErr) throw new Error(`Failed to load reports: ${rErr.message}`);
  if (eErr) throw new Error(`Failed to load evidence: ${eErr.message}`);

  return (reportRows as ReportRow[]).map((r) =>
    mapReport(r, evidenceRows as EvidenceRow[]),
  );
}

export async function fetchDaoProposals(): Promise<DaoProposal[]> {
  const { data, error } = await supabase
    .from('dao_proposals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load DAO proposals: ${error.message}`);
  return (data as DaoRow[]).map(mapDao);
}

export async function fetchSocialPosts(): Promise<SocialPost[]> {
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load social posts: ${error.message}`);
  return (data as SocialRow[]).map(mapSocial);
}

// ── Insert / update functions ─────────────────────────────────

export async function insertReport(
  report: Omit<CitizenReport, 'id' | 'evidence' | 'bukti' | 'upvote' | 'status' | 'tanggal'>,
): Promise<CitizenReport> {
  const newId = `RPT-${Date.now().toString().slice(-6)}`;
  const { data, error } = await supabase
    .from('reports')
    .insert({
      id: newId,
      nama: report.nama,
      anonim: report.anonim,
      kategori: report.kategori,
      lokasi: report.lokasi,
      judul: report.judul,
      detail: report.detail,
      tanggal: new Date().toISOString().slice(0, 10),
      status: 'Masuk',
      bukti: 0,
      upvote: 0,
      zk_verified: report.zkVerified ?? false,
      project_id: null,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to submit report: ${error.message}`);

  const row = data as ReportRow;
  return mapReport(row, []);
}

export async function upvoteReport(id: string, currentUpvote: number): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({ upvote: currentUpvote + 1 })
    .eq('id', id);

  if (error) throw new Error(`Failed to upvote: ${error.message}`);
}

export async function insertAuditLog(
  projectId: string,
  skorRisiko: number,
  deskripsiAnomali: string,
): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert({
    project_id: projectId,
    skor_risiko: skorRisiko,
    deskripsi_anomali: deskripsiAnomali,
    phase: 'done',
    ai_model: 'KawalDana-AI-v2',
  });

  if (error) throw new Error(`Failed to log audit: ${error.message}`);
}

export async function updateDaoProposal(
  id: string,
  updates: Partial<Pick<DaoProposal, 'stakePool' | 'approvePct' | 'disputePct' | 'totalStakers' | 'status'>>,
): Promise<void> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.stakePool !== undefined) dbUpdates.stake_pool = updates.stakePool;
  if (updates.approvePct !== undefined) dbUpdates.approve_pct = updates.approvePct;
  if (updates.disputePct !== undefined) dbUpdates.dispute_pct = updates.disputePct;
  if (updates.totalStakers !== undefined) dbUpdates.total_stakers = updates.totalStakers;
  if (updates.status !== undefined) dbUpdates.status = updates.status;

  const { error } = await supabase
    .from('dao_proposals')
    .update(dbUpdates)
    .eq('id', id);

  if (error) throw new Error(`Failed to update proposal: ${error.message}`);
}

export async function insertEvidence(
  reportId: string,
  evidence: Omit<EvidenceItem, 'id'>,
): Promise<void> {
  const newId = `EV-${Date.now().toString().slice(-8)}`;
  const { error } = await supabase.from('evidence').insert({
    id: newId,
    report_id: reportId,
    type: evidence.type,
    title: evidence.title,
    description: evidence.description,
    image_url: evidence.image ?? null,
    location: evidence.location ?? null,
    tx_hash: evidence.txHash ?? null,
    evidence_timestamp: evidence.timestamp,
  });

  if (error) throw new Error(`Failed to insert evidence: ${error.message}`);
}

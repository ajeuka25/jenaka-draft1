/*
# Create KawalDana AI Complete Database Schema

## Overview
Creates the full database schema for the KawalDana AI platform — a Web3 & AI
sentinel for government budget oversight. This migration creates 8 tables that
mirror the application's existing mock data models, seeds them with the current
seed data, and enables Row Level Security with public read/write policies
(single-tenant, no auth screen).

## New Tables

1. **vendors** — Vendor/contractor profiles flagged by AI for suspicious age or
   repeated anomalies.
   - `id` (text PK, e.g. "VND-001")
   - `nama_vendor` (text, not null)
   - `umur_vendor` (text, e.g. "3 hari", "4 tahun")
   - `is_suspicious` (boolean, default false)
   - `created_at` (timestamptz)

2. **projects** — Government projects being audited (MBG, infrastructure, etc.).
   - `id` (text PK, e.g. "PRJ-001")
   - `nama_proyek` (text, not null)
   - `kategori` (text)
   - `total_anggaran` (bigint, in rupiah)
   - `lokasi` (text)
   - `tanggal` (date)
   - `vendor_id` (text FK → vendors)
   - `skor_risiko` (integer, 0-100)
   - `deskripsi_anomali_ai` (text)
   - `koordinat_lat` (numeric)
   - `koordinat_lng` (numeric)
   - `laporan_warga` (integer, count of citizen reports)
   - `created_at` (timestamptz)

3. **project_items** — Line-item budget breakdown (rincian barang) for each project,
   used for LPJ vs market price comparison.
   - `id` (uuid PK)
   - `project_id` (text FK → projects, ON DELETE CASCADE)
   - `nama` (text, item name)
   - `jumlah` (integer, quantity)
   - `harga_lpj` (bigint, price in LPJ document)
   - `harga_pasar` (bigint, actual market price)

4. **reports** — Citizen whistleblower reports (laporan warga).
   - `id` (text PK, e.g. "RPT-001")
   - `nama` (text, reporter name or "Anonim")
   - `anonim` (boolean, default false)
   - `kategori` (text: MBG, Infrastruktur, Sosial, Pengadaan, Lainnya)
   - `lokasi` (text)
   - `judul` (text, report title)
   - `detail` (text, report body)
   - `tanggal` (date)
   - `status` (text: Masuk, Diverifikasi, Diteruskan)
   - `bukti` (integer, evidence count)
   - `upvote` (integer, community upvotes)
   - `zk_verified` (boolean, default false — ZK-Proof whistleblower flag)
   - `project_id` (text FK → projects, nullable)
   - `created_at` (timestamptz)

5. **evidence** — Evidence items attached to citizen reports (photos, GPS, on-chain).
   - `id` (text PK, e.g. "EV-001a")
   - `report_id` (text FK → reports, ON DELETE CASCADE)
   - `type` (text: photo, gps, onchain)
   - `title` (text)
   - `description` (text)
   - `image_url` (text, nullable)
   - `location` (text, nullable — GPS coordinates display)
   - `tx_hash` (text, nullable — blockchain tx hash)
   - `evidence_timestamp` (text — display-format timestamp)
   - `created_at` (timestamptz)

6. **audit_logs** — AI audit execution log for each project scan.
   - `id` (uuid PK)
   - `project_id` (text FK → projects, ON DELETE CASCADE)
   - `skor_risiko` (integer, AI risk score at audit time)
   - `deskripsi_anomali` (text, AI anomaly description)
   - `phase` (text: extracting, comparing, verifying, done)
   - `ai_model` (text, e.g. "KawalDana-AI-v2")
   - `created_at` (timestamptz)

7. **dao_proposals** — DAO validator consensus proposals for verifying reports.
   - `id` (text PK, e.g. "DAO-001")
   - `report_id` (text FK → reports)
   - `project_ref` (text FK → projects)
   - `title` (text)
   - `description` (text)
   - `stake_pool` (bigint, total KAWAL tokens staked)
   - `approve_pct` (integer, % setuju)
   - `dispute_pct` (integer, % sanggah)
   - `total_stakers` (integer)
   - `apy_reward` (numeric, e.g. 18.5)
   - `slashing_risk` (integer, %)
   - `status` (text: active, passed, disputed, resolved)
   - `deadline` (text, display format)
   - `created_at` (timestamptz)

8. **social_posts** — AI NLP-detected social media & news posts (radar feed).
   - `id` (text PK, e.g. "SOC-001")
   - `source` (text: Twitter/X, News Portal, TikTok, Instagram)
   - `handle` (text, e.g. "@WargaSukamaju")
   - `avatar` (text, initials)
   - `content` (text, post content)
   - `post_timestamp` (text, display format)
   - `reach` (integer, estimated reach)
   - `sentiment` (text: Sangat Negatif, Negatif, Indikasi Penggelembungan, Netral)
   - `status` (text: Auto-Flagged to Audit, Linked to PRJ-xxx, Monitoring)
   - `linked_project` (text FK → projects, nullable)
   - `created_at` (timestamptz)

## Security
- RLS enabled on ALL tables.
- Policies: `TO anon, authenticated` for all CRUD on all tables (single-tenant,
  no sign-in screen — data is intentionally public/shared).
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE).

## Important Notes
1. All ID columns use `text` to match the existing app's ID format (PRJ-001, RPT-001, etc.).
2. Monetary values use `bigint` to safely store rupiah amounts.
3. Seed data is inserted after table creation using `ON CONFLICT DO NOTHING` for idempotency.
4. Foreign keys use `ON DELETE CASCADE` for child tables (project_items, evidence, audit_logs).
5. This migration is safe to re-run — all statements use IF NOT EXISTS / ON CONFLICT.
*/

-- ============================================================
-- 1. VENDORS
-- ============================================================
CREATE TABLE IF NOT EXISTS vendors (
  id text PRIMARY KEY,
  nama_vendor text NOT NULL,
  umur_vendor text NOT NULL DEFAULT '',
  is_suspicious boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vendors" ON vendors;
CREATE POLICY "anon_select_vendors" ON vendors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vendors" ON vendors;
CREATE POLICY "anon_insert_vendors" ON vendors FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vendors" ON vendors;
CREATE POLICY "anon_update_vendors" ON vendors FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_vendors" ON vendors;
CREATE POLICY "anon_delete_vendors" ON vendors FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 2. PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  nama_proyek text NOT NULL,
  kategori text NOT NULL DEFAULT '',
  total_anggaran bigint NOT NULL DEFAULT 0,
  lokasi text NOT NULL DEFAULT '',
  tanggal date,
  vendor_id text REFERENCES vendors(id),
  skor_risiko integer NOT NULL DEFAULT 0,
  deskripsi_anomali_ai text NOT NULL DEFAULT '',
  koordinat_lat numeric(10,6),
  koordinat_lng numeric(10,6),
  laporan_warga integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_projects_vendor_id ON projects(vendor_id);
CREATE INDEX IF NOT EXISTS idx_projects_skor_risiko ON projects(skor_risiko DESC);

-- ============================================================
-- 3. PROJECT_ITEMS (rincian barang)
-- ============================================================
CREATE TABLE IF NOT EXISTS project_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  nama text NOT NULL,
  jumlah integer NOT NULL DEFAULT 0,
  harga_lpj bigint NOT NULL DEFAULT 0,
  harga_pasar bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE project_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_project_items" ON project_items;
CREATE POLICY "anon_select_project_items" ON project_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_project_items" ON project_items;
CREATE POLICY "anon_insert_project_items" ON project_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_project_items" ON project_items;
CREATE POLICY "anon_update_project_items" ON project_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_project_items" ON project_items;
CREATE POLICY "anon_delete_project_items" ON project_items FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_project_items_project_id ON project_items(project_id);

-- ============================================================
-- 4. REPORTS (laporan warga)
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id text PRIMARY KEY,
  nama text NOT NULL DEFAULT 'Anonim',
  anonim boolean NOT NULL DEFAULT false,
  kategori text NOT NULL DEFAULT 'Lainnya',
  lokasi text NOT NULL DEFAULT '',
  judul text NOT NULL,
  detail text NOT NULL DEFAULT '',
  tanggal date,
  status text NOT NULL DEFAULT 'Masuk',
  bukti integer NOT NULL DEFAULT 0,
  upvote integer NOT NULL DEFAULT 0,
  zk_verified boolean NOT NULL DEFAULT false,
  project_id text REFERENCES projects(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reports" ON reports;
CREATE POLICY "anon_select_reports" ON reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reports" ON reports;
CREATE POLICY "anon_update_reports" ON reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reports" ON reports;
CREATE POLICY "anon_delete_reports" ON reports FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_kategori ON reports(kategori);

-- ============================================================
-- 5. EVIDENCE (bukti laporan)
-- ============================================================
CREATE TABLE IF NOT EXISTS evidence (
  id text PRIMARY KEY,
  report_id text NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'photo',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  location text,
  tx_hash text,
  evidence_timestamp text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_evidence" ON evidence;
CREATE POLICY "anon_select_evidence" ON evidence FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_evidence" ON evidence;
CREATE POLICY "anon_insert_evidence" ON evidence FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_evidence" ON evidence;
CREATE POLICY "anon_update_evidence" ON evidence FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_evidence" ON evidence;
CREATE POLICY "anon_delete_evidence" ON evidence FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_evidence_report_id ON evidence(report_id);

-- ============================================================
-- 6. AUDIT_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skor_risiko integer NOT NULL DEFAULT 0,
  deskripsi_anomali text NOT NULL DEFAULT '',
  phase text NOT NULL DEFAULT 'done',
  ai_model text NOT NULL DEFAULT 'KawalDana-AI-v2',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit_logs" ON audit_logs;
CREATE POLICY "anon_select_audit_logs" ON audit_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit_logs" ON audit_logs;
CREATE POLICY "anon_insert_audit_logs" ON audit_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_audit_logs" ON audit_logs;
CREATE POLICY "anon_update_audit_logs" ON audit_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_audit_logs" ON audit_logs;
CREATE POLICY "anon_delete_audit_logs" ON audit_logs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id ON audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- 7. DAO_PROPOSALS
-- ============================================================
CREATE TABLE IF NOT EXISTS dao_proposals (
  id text PRIMARY KEY,
  report_id text REFERENCES reports(id),
  project_ref text REFERENCES projects(id),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  stake_pool bigint NOT NULL DEFAULT 0,
  approve_pct integer NOT NULL DEFAULT 0,
  dispute_pct integer NOT NULL DEFAULT 0,
  total_stakers integer NOT NULL DEFAULT 0,
  apy_reward numeric(6,2) NOT NULL DEFAULT 0,
  slashing_risk integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  deadline text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dao_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_dao_proposals" ON dao_proposals;
CREATE POLICY "anon_select_dao_proposals" ON dao_proposals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_dao_proposals" ON dao_proposals;
CREATE POLICY "anon_insert_dao_proposals" ON dao_proposals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_dao_proposals" ON dao_proposals;
CREATE POLICY "anon_update_dao_proposals" ON dao_proposals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_dao_proposals" ON dao_proposals;
CREATE POLICY "anon_delete_dao_proposals" ON dao_proposals FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_dao_proposals_status ON dao_proposals(status);
CREATE INDEX IF NOT EXISTS idx_dao_proposals_report_id ON dao_proposals(report_id);

-- ============================================================
-- 8. SOCIAL_POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS social_posts (
  id text PRIMARY KEY,
  source text NOT NULL DEFAULT 'Twitter/X',
  handle text NOT NULL DEFAULT '',
  avatar text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  post_timestamp text NOT NULL DEFAULT '',
  reach integer NOT NULL DEFAULT 0,
  sentiment text NOT NULL DEFAULT 'Netral',
  status text NOT NULL DEFAULT 'Monitoring',
  linked_project text REFERENCES projects(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_social_posts" ON social_posts;
CREATE POLICY "anon_select_social_posts" ON social_posts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_social_posts" ON social_posts;
CREATE POLICY "anon_insert_social_posts" ON social_posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_social_posts" ON social_posts;
CREATE POLICY "anon_update_social_posts" ON social_posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_social_posts" ON social_posts;
CREATE POLICY "anon_delete_social_posts" ON social_posts FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_social_posts_sentiment ON social_posts(sentiment);
CREATE INDEX IF NOT EXISTS idx_social_posts_linked_project ON social_posts(linked_project);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Vendors
INSERT INTO vendors (id, nama_vendor, umur_vendor, is_suspicious) VALUES
  ('VND-001', 'CV Nutrisi Maju Bersama', '3 hari', true),
  ('VND-002', 'CV Karya Beton Nusantara', '4 tahun', false),
  ('VND-003', 'CV Bangun Sejahtera', '8 tahun', false)
ON CONFLICT (id) DO NOTHING;

-- Projects
INSERT INTO projects (id, nama_proyek, kategori, total_anggaran, lokasi, tanggal, vendor_id, skor_risiko, deskripsi_anomali_ai, koordinat_lat, koordinat_lng, laporan_warga) VALUES
  ('PRJ-001', 'Program Makan Bergizi Gratis (MBG) SD Negeri 01 Sukamaju', 'Program Makan Bergizi', 15000000, 'SD Negeri 01 Sukamaju, Kabupaten Sukamaju', '2026-06-15', 'VND-001', 98, 'Terindikasi ketidaksesuaian serius antara LPJ dan realisasi. LPJ mencantumkan menu daging dan susu senilai Rp15.000/porsi, namun hasil pelaksanaan hanya berupa tahu tempe dengan estimasi nilai Rp5.000/porsi. Vendor juga baru berdiri selama 3 hari sehingga berisiko tinggi.', -6.1234, 107.5678, 47),
  ('PRJ-002', 'Pembangunan Jalan Beton Desa Sukagalih', 'Infrastruktur', 875000000, 'Desa Sukagalih, Kabupaten Sukagalih', '2026-05-28', 'VND-002', 95, 'Terindikasi mark-up harga material. Harga Semen Gresik dalam LPJ mencapai Rp160.000 per sak, jauh di atas harga acuan pasar daerah sebesar Rp65.000 per sak sehingga memerlukan audit lanjutan.', -7.2345, 108.9012, 23),
  ('PRJ-003', 'Renovasi Balai Desa Makmur', 'Renovasi Bangunan Publik', 285000000, 'Desa Makmur, Kabupaten Makmur', '2026-04-10', 'VND-003', 12, 'Tidak ditemukan indikasi penyimpangan yang signifikan. Harga barang masih berada dalam rentang harga pasar dan profil vendor dinilai wajar.', -6.9876, 106.5432, 2)
ON CONFLICT (id) DO NOTHING;

-- Project items (rincian barang)
INSERT INTO project_items (project_id, nama, jumlah, harga_lpj, harga_pasar) VALUES
  ('PRJ-001', 'Paket Makan Bergizi (Daging & Susu)', 1000, 15000, 15000),
  ('PRJ-001', 'Realisasi Menu (Tahu Tempe)', 1000, 15000, 5000),
  ('PRJ-002', 'Semen Gresik 50 kg', 1200, 160000, 65000),
  ('PRJ-002', 'Pasir Cor', 180, 340000, 330000),
  ('PRJ-002', 'Batu Split', 220, 390000, 385000),
  ('PRJ-003', 'Semen Portland 50 kg', 500, 68000, 67000),
  ('PRJ-003', 'Cat Tembok 25 kg', 60, 325000, 320000),
  ('PRJ-003', 'Keramik Lantai 60x60 cm', 250, 118000, 120000)
ON CONFLICT DO NOTHING;

-- Reports
INSERT INTO reports (id, nama, anonim, kategori, lokasi, judul, detail, tanggal, status, bukti, upvote, zk_verified, project_id) VALUES
  ('RPT-001', 'Ibu Yanti', false, 'MBG', 'SD Negeri 01 Sukamaju, Kabupaten Sukamaju', 'Anak hanya diberi tahu tempe, padahal LPJ daging & susu', 'Saya kira anak-anak akan menerima paket bergizi seperti di brosur (daging & susu). Faktanya selama 3 hari hanya nasi, tahu, dan tempe. Menu mewah hanya ada di kertas LPJ.', '2026-06-17', 'Diteruskan', 4, 128, false, 'PRJ-001'),
  ('RPT-002', 'Warga Sukagalih', true, 'Infrastruktur', 'Desa Sukagalih, Kabupaten Sukagalih', 'Jalan beton baru langsung retak di musim hujan pertama', 'Jalan yang dibangun Mei lalu sudah retak retak di beberapa titik. Belum genap 2 bulan. Curiga materialnya ditukar atau dibilang mahal padahal murah.', '2026-06-02', 'Diverifikasi', 6, 87, false, 'PRJ-002'),
  ('RPT-003', 'Pak Darmawan', false, 'Pengadaan', 'Desa Makmur, Kabupaten Makmur', 'Renovasi balai desa sesuai brosur, tidak ada keluhan', 'Renovasi balai desa selesai tepat waktu, material kelihatannya sama dengan yang di LPJ. Saya sudah cek sendiri, tidak ada yang janggal. Terima kasih.', '2026-04-28', 'Diverifikasi', 2, 34, false, 'PRJ-003'),
  ('RPT-004', 'Warga Makmur', true, 'Sosial', 'Desa Makmur, Kabupaten Makmur', 'Bantuan sosial BLT tebal di awal, tipis di akir', 'Pencairan BLT warga bulan pertama penuh, bulan kedua dan ketiga dikurangi tanpa pemberitahuan. Mohon ditransparankan potongannya untuk apa.', '2026-05-12', 'Masuk', 1, 56, false, NULL),
  ('RPT-005', 'Ibu Sri', false, 'MBG', 'SD Negeri 03 Cibadak, Kabupaten Cibadak', 'Menu bergizi berganti dengan mi instan', 'Awalnya anak-anak senang dapat ayam dan sayur. Minggu ke dua diganti mi instan dan telur. Katanya anggaran habis, padahal belum genap sebulan.', '2026-06-20', 'Masuk', 3, 72, false, NULL)
ON CONFLICT (id) DO NOTHING;

-- Evidence
INSERT INTO evidence (id, report_id, type, title, description, image_url, location, tx_hash, evidence_timestamp) VALUES
  ('EV-001a', 'RPT-001', 'photo', 'Foto Porsi MBG dari Warga', 'Foto langsung dari kotak makan anak. Terlihat hanya nasi, tahu, dan tempe — tidak ada daging atau susu sesuai klaim LPJ.', 'https://images.pexels.com/photos/36982092/pexels-photo-36982092.jpeg?auto=compress&cs=tinysrgb&w=600', NULL, NULL, '2026-06-17 11:32'),
  ('EV-001b', 'RPT-001', 'gps', 'Geotag GPS Lokasi', 'Titik koordinat dikonfirmasi di dalam area SD Negeri 01 Sukamaju.', NULL, 'SD Negeri 01 Sukamaju (-6.1234, 107.5678)', NULL, '2026-06-17 11:32'),
  ('EV-001c', 'RPT-001', 'onchain', 'Transaksi Bukti On-Chain', 'Hash evidence tercatat immutable di ledger testnet KawalDana.', NULL, NULL, '0x8f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a', '2026-06-17 14:05'),
  ('EV-002a', 'RPT-002', 'photo', 'Foto Retakan Jalan Beton', 'Retakan melintang pada jalan beton Desa Sukagalih, berusia kurang dari 2 bulan pasca-pembangunan.', 'https://images.pexels.com/photos/2590988/pexels-photo-2590988.jpeg?auto=compress&cs=tinysrgb&w=600', NULL, NULL, '2026-06-02 08:15'),
  ('EV-002b', 'RPT-002', 'gps', 'Geotag GPS Lokasi', 'Koordinat pengambilan foto di ruas jalan Desa Sukagalih.', NULL, 'Jalan Raya Sukagalih (-7.2345, 108.9012)', NULL, '2026-06-02 08:15'),
  ('EV-002c', 'RPT-002', 'onchain', 'Transaksi Bukti On-Chain', 'Hash evidence retakan jalan tercatat on-chain.', NULL, NULL, '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', '2026-06-02 10:20'),
  ('EV-003a', 'RPT-003', 'photo', 'Foto Renovasi Balai Desa', 'Hasil renovasi terlihat sesuai brosur — material dan finishing dalam kondisi baik.', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600', NULL, NULL, '2026-04-28 13:00'),
  ('EV-003b', 'RPT-003', 'onchain', 'Transaksi Bukti On-Chain', 'Verifikasi positif — tidak ada anomali terdeteksi.', NULL, NULL, '0x3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e', '2026-04-28 15:30'),
  ('EV-004a', 'RPT-004', 'onchain', 'Catatan Pencairan BLT', 'Bukti transfer BLT bulan 1 vs bulan 2-3, terdapat selisih.', NULL, NULL, '0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b', '2026-05-12 09:45'),
  ('EV-005a', 'RPT-005', 'photo', 'Foto Menu Mi Instan', 'Porsi berganti menjadi mi instan dan telur pada minggu kedua.', 'https://images.pexels.com/photos/8500165/pexels-photo-8500165.jpeg?auto=compress&cs=tinysrgb&w=600', NULL, NULL, '2026-06-20 12:00'),
  ('EV-005b', 'RPT-005', 'gps', 'Geotag GPS Lokasi', 'Lokasi dikonfirmasi di SD Negeri 03 Cibadak.', NULL, 'SD Negeri 03 Cibadak (-6.9876, 106.5432)', NULL, '2026-06-20 12:00')
ON CONFLICT (id) DO NOTHING;

-- DAO proposals
INSERT INTO dao_proposals (id, report_id, project_ref, title, description, stake_pool, approve_pct, dispute_pct, total_stakers, apy_reward, slashing_risk, status, deadline) VALUES
  ('DAO-001', 'RPT-001', 'PRJ-001', 'Verifikasi: MBG SD Negeri 01 Sukamaju', 'Laporan warga menunjukkan porsi MBG hanya tahu tempe vs klaim LPJ daging & susu. Validator DAO memverifikasi temuan AI Vision.', 24500, 78, 22, 14, 18.50, 12, 'active', '2 hari lagi'),
  ('DAO-002', 'RPT-002', 'PRJ-002', 'Dispute: Jalan Beton Sukagalih Retak', 'Kontraktor menyangkal mark-up semen. Validator DAO melakukan audit independen material & cross-check harga pasar.', 18700, 61, 39, 11, 22.30, 15, 'active', '4 jam lagi'),
  ('DAO-003', 'RPT-003', 'PRJ-003', 'Verifikasi: Renovasi Balai Desa Makmur', 'Laporan warga mengkonfirmasi renovasi sesuai brosur. Consensus tercapai — bukti foto & on-chain verified.', 9200, 92, 8, 7, 8.20, 5, 'passed', 'Selesai')
ON CONFLICT (id) DO NOTHING;

-- Social posts
INSERT INTO social_posts (id, source, handle, avatar, content, post_timestamp, reach, sentiment, status, linked_project) VALUES
  ('SOC-001', 'Twitter/X', '@WargaSukamaju', 'WS', 'Lauk MBG di SD 01 cuma tahu tempe basi! Mana dagingnya? Anak saya pulang lapar terus. @Kemendikbud @KPK_RI', '2 jam lalu', 12400, 'Sangat Negatif', 'Auto-Flagged to Audit', 'PRJ-001'),
  ('SOC-002', 'News Portal', 'DetikDesa', 'DD', 'Warga Pertanyakan Kualitas Jalan Beton Sukagalih yang Retak dalam 1 Bulan — Warga menduga material tidak sesuai standar LPJ.', '5 jam lalu', 8900, 'Indikasi Penggelembungan', 'Linked to PRJ-002', 'PRJ-002'),
  ('SOC-003', 'TikTok', '@anak_sukamaju', 'AS', 'Video viral: porsi makan MBG di sekolah vs foto di brosur LPJ. Beda jauh! #KorupsiMBG #KawalDana', '8 jam lalu', 45000, 'Sangat Negatif', 'Linked to PRJ-001', 'PRJ-001'),
  ('SOC-004', 'Instagram', '@mom_sukamaju', 'MS', 'Story 24 jam: ini cuma dapat nasi + tahu. Janjinya ayam dan susu. Malu sama anak sendiri jawab apa.', '30 menit lalu', 3200, 'Negatif', 'Auto-Flagged to Audit', 'PRJ-001'),
  ('SOC-005', 'Twitter/X', '@DesaSukagalih', 'DS', 'Jalan beton baru 3 minggu udah berlubang. Kontraktor katanya dari vendor 4 tahun, kok kerjanya begini? Audit dong!', '1 jam lalu', 6700, 'Indikasi Penggelembungan', 'Linked to PRJ-002', 'PRJ-002'),
  ('SOC-006', 'News Portal', 'TribunDesa', 'TD', 'Investigasi: Vendor MBG Sukamaju berdiri 3 hari sebelum menang tender. Ahli tender menyebut ini bendera merah.', '3 jam lalu', 21000, 'Sangat Negatif', 'Auto-Flagged to Audit', 'PRJ-001')
ON CONFLICT (id) DO NOTHING;

-- Audit logs (initial scan history)
INSERT INTO audit_logs (project_id, skor_risiko, deskripsi_anomali, phase, ai_model) VALUES
  ('PRJ-001', 98, 'Terindikasi ketidaksesuaian serius: LPJ daging & susu vs realisasi tahu tempe. Vendor 3 hari.', 'done', 'KawalDana-AI-v2'),
  ('PRJ-002', 95, 'Mark-up harga Semen Gresik: LPJ Rp160.000 vs pasar Rp65.000 per sak.', 'done', 'KawalDana-AI-v2'),
  ('PRJ-003', 12, 'Tidak ditemukan indikasi penyimpangan. Harga dalam rentang pasar.', 'done', 'KawalDana-AI-v2')
ON CONFLICT DO NOTHING;

/*
# Create profiles table (per-account state for connected wallets)

## Overview
Previously, KAWAL points and reward points shown after "Connect Wallet"
were hardcoded constants (SIM_KAWAL / SIM_BALANCE) applied to every
session, and were never persisted — so every visitor saw the same
numbers and lost them on refresh/disconnect, regardless of which real
wallet/account they connected with.

This migration adds a `profiles` table keyed by the connected wallet
address (real MetaMask address, or the address derived from a Web3Auth
social/passkey login) so each account genuinely has its own data that
survives reconnects.

## New Tables

1. **profiles** — one row per connected wallet address.
   - `wallet_address` (text PK, lowercased 0x… address)
   - `login_method` (text: 'wallet' | 'social' | 'passkey')
   - `kawal` (bigint, default 0) — KAWAL points balance for this account
   - `rewards` (bigint, default 0) — session/task reward points (TKW)
   - `created_at` (timestamptz)
   - `last_login_at` (timestamptz)

## Security
Same single-tenant, no-auth-screen model as the rest of this schema:
RLS is enabled with public (anon + authenticated) policies, matching
the existing tables. There is no server-side auth session in this app,
so access control for "which account is yours" is enforced by wallet
signature (MetaMask / Web3Auth) at the client, not by RLS.
*/

CREATE TABLE IF NOT EXISTS profiles (
  wallet_address text PRIMARY KEY,
  login_method text NOT NULL DEFAULT 'wallet',
  kawal bigint NOT NULL DEFAULT 0,
  rewards bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);
import type { IpfsMetadata } from '@/lib/web3';
import { generateIpfsCid } from '@/lib/web3';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT ?? '';
const PINATA_PIN_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

export const IS_IPFS_CONFIGURED = PINATA_JWT.length > 0;

interface PinataPinResponse {
  IpfsHash: string;
}

/**
 * Pin metadata evidence ke IPFS lewat Pinata dan kembalikan CID sungguhan.
 * Kalau VITE_PINATA_JWT belum diisi, otomatis fallback ke CID acak
 * (mode simulasi) supaya alur "Lock Evidence" tidak pernah gagal total
 * hanya karena IPFS belum dikonfigurasi.
 *
 * CATATAN KEAMANAN: JWT Pinata di sini dipanggil langsung dari browser.
 * Untuk demo/testnet ini cukup asalkan JWT dibuat dengan scope terbatas
 * (hanya izin `pinJSONToIPFS`, tanpa izin akun lain). Untuk production,
 * pindahkan pemanggilan ini ke backend/Edge Function agar JWT tidak
 * pernah terekspos ke klien.
 */
export async function pinMetadataToIpfs(metadata: IpfsMetadata): Promise<string> {
  if (!IS_IPFS_CONFIGURED) {
    return generateIpfsCid();
  }

  const res = await fetch(PINATA_PIN_JSON_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `kawaldana-evidence-${metadata.projectId}-${Date.now()}`,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Gagal pin ke IPFS (${res.status}): ${detail}`);
  }

  const data = (await res.json()) as PinataPinResponse;
  return data.IpfsHash;
}
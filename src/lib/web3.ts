export interface IpfsMetadata {
  timestamp: string;
  aiVisionScore: number;
  photoHash: string;
  geotagProof: string;
  reporterId: string;
  projectId: string;
  category: string;
  deviationPct: number;
  realValue: number;
  lpjValue: number;
}

export interface TxDetails {
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  gasPrice: string;
  contractAddress: string;
  status: 'success';
  from: string;
  to: string;
  cid: string;
  network: string;
}

const CID_CHARS = 'abcdefghijklmnopqrstuvwxyz234567';

export function generateIpfsCid(): string {
  let cid = 'bafybeic';
  for (let i = 0; i < 52; i++) {
    cid += CID_CHARS[Math.floor(Math.random() * CID_CHARS.length)];
  }
  return cid;
}

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * 16)];
  }
  return hash;
}

export function generateWalletAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * 16)];
  }
  return addr;
}

export function buildIpfsMetadata(
  projectId: string,
  category: string,
  aiScore: number,
  photoHash: string,
  geotag: string,
  deviationPct: number,
  realValue: number,
  lpjValue: number,
  reporterId: string = 'zk-anon',
): IpfsMetadata {
  return {
    timestamp: new Date().toISOString(),
    aiVisionScore: aiScore,
    photoHash,
    geotagProof: geotag,
    reporterId,
    projectId,
    category,
    deviationPct,
    realValue,
    lpjValue,
  };
}

export function simulateTx(cid: string, from: string): TxDetails {
  return {
    txHash: generateTxHash(),
    blockNumber: 48200000 + Math.floor(Math.random() * 100000),
    gasUsed: (21000 + Math.floor(Math.random() * 50000)).toLocaleString('en-US'),
    gasPrice: `${(0.5 + Math.random() * 2).toFixed(2)} Gwei`,
    contractAddress: '0xK4W4LD4n4A1c0ntr4ct000000000000000000abcd',
    status: 'success',
    from,
    to: '0xK4W4LD4n4A1c0ntr4ct000000000000000000abcd',
    cid,
    network: 'KawalDana Testnet (Chain ID: 8740)',
  };
}

export function shortenHash(hash: string, prefix = 10, suffix = 8): string {
  if (hash.length <= prefix + suffix) return hash;
  return `${hash.slice(0, prefix)}…${hash.slice(-suffix)}`;
}

export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const BLOCK_EXPLORER = 'https://testnet.kawaldana.xyz/tx/';

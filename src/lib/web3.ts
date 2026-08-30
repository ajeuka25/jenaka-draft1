import { BrowserProvider, Contract, JsonRpcProvider, type Eip1193Provider } from 'ethers';

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

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? '';
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 80002); // Polygon Amoy
export const RPC_URL = import.meta.env.VITE_RPC_URL ?? 'https://rpc-amoy.polygon.technology';
export const BLOCK_EXPLORER =
  import.meta.env.VITE_BLOCK_EXPLORER ?? 'https://amoy.polygonscan.com/tx/';
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

export const IS_ONCHAIN_CONFIGURED = CONTRACT_ADDRESS.length > 0;

const EVIDENCE_REGISTRY_ABI = [
  'function lockEvidence(string projectId, string ipfsCid) external',
  'function evidenceCount() external view returns (uint256)',
  'event EvidenceLocked(uint256 indexed id, string projectId, string ipfsCid, address indexed reporter, uint256 timestamp)',
];

export class WrongNetworkError extends Error {
  constructor(public expectedChainId: number, public actualChainId: number) {
    super(`Wallet berada di chain ${actualChainId}, harap pindah ke chain ${expectedChainId}.`);
    this.name = 'WrongNetworkError';
  }
}

function getInjectedProvider(): Eip1193Provider {
  if (!window.ethereum) {
    throw new Error('MetaMask (atau wallet EVM lain) tidak terdeteksi di browser ini.');
  }
  return window.ethereum;
}

export async function connectRealWallet(): Promise<string> {
  const provider = new BrowserProvider(getInjectedProvider());
  const accounts = await provider.send('eth_requestAccounts', []);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== CHAIN_ID) {
    await switchToConfiguredChain();
  }
  return accounts[0];
}

/**
 * Membaca saldo native token (POL) sungguhan dari RPC publik untuk address
 * yang connect — menggantikan angka SIM_BALANCE yang dulu di-hardcode sama
 * untuk semua orang. Dipakai untuk method 'wallet' maupun 'social'/'passkey'
 * (Web3Auth), karena keduanya sama-sama punya address di chain yang sama.
 */
export async function getNativeBalance(address: string): Promise<number> {
  try {
    const provider = new JsonRpcProvider(RPC_URL);
    const balanceWei = await provider.getBalance(address);
    return Number(balanceWei) / 1e18;
  } catch (err) {
    console.warn('[web3] gagal membaca saldo on-chain:', err);
    return 0;
  }
}

export async function switchToConfiguredChain(): Promise<void> {
  const ethereum = getInjectedProvider();
  const chainIdHex = `0x${CHAIN_ID.toString(16)}`;
  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdHex,
            chainName: 'Polygon Amoy Testnet',
            nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: [BLOCK_EXPLORER.replace(/\/tx\/?$/, '')],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export async function lockEvidenceOnChain(
  projectId: string,
  cid: string,
): Promise<TxDetails> {
  if (!IS_ONCHAIN_CONFIGURED) {
    throw new Error('VITE_CONTRACT_ADDRESS belum diisi — jalankan dalam mode simulasi.');
  }

  const provider = new BrowserProvider(getInjectedProvider());
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== CHAIN_ID) {
    throw new WrongNetworkError(CHAIN_ID, Number(network.chainId));
  }

  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, EVIDENCE_REGISTRY_ABI, signer);

  const tx = await contract.lockEvidence(projectId, cid);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    gasPrice: receipt.gasPrice
      ? `${(Number(receipt.gasPrice) / 1e9).toFixed(2)} Gwei`
      : 'n/a',
    contractAddress: CONTRACT_ADDRESS,
    status: 'success',
    from: await signer.getAddress(),
    to: CONTRACT_ADDRESS,
    cid,
    network: 'Polygon Amoy Testnet',
  };
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
    network: 'KawalDana Testnet (Simulasi)',
  };
}

export function shortenHash(hash: string, prefix = 10, suffix = 8): string {
  if (hash.length <= prefix + suffix) return hash;
  return `${hash.slice(0, prefix)}…${hash.slice(-suffix)}`;
}
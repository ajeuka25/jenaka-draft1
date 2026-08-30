/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Alamat contract EvidenceRegistry hasil deploy. Kosongkan untuk mode simulasi. */
  readonly VITE_CONTRACT_ADDRESS?: string;
  /** RPC URL testnet, mis. https://rpc-amoy.polygon.technology */
  readonly VITE_RPC_URL?: string;
  /** Chain ID testnet dalam desimal, mis. 80002 untuk Polygon Amoy */
  readonly VITE_CHAIN_ID?: string;
  /** Base URL block explorer testnet, mis. https://amoy.polygonscan.com/tx/ */
  readonly VITE_BLOCK_EXPLORER?: string;
  /** JWT Pinata untuk pin metadata evidence ke IPFS. Kosongkan untuk mode simulasi. */
  readonly VITE_PINATA_JWT?: string;
  /** Client ID Web3Auth untuk login social/passkey. Kosongkan untuk mode simulasi. */
  readonly VITE_WEB3AUTH_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ethereum?: import('ethers').Eip1193Provider & {
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
    removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  };
}
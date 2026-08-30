import { CHAIN_ID, RPC_URL, BLOCK_EXPLORER } from '@/lib/web3';

// File ini SENGAJA tidak meng-import apa pun dari '@web3auth/*' di top-level.
// Kode @web3auth sesungguhnya baru di-import dinamis di src/lib/web3auth.ts,
// hanya saat user klik connect.

export const WEB3AUTH_CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID ?? '';
export const IS_WEB3AUTH_CONFIGURED = WEB3AUTH_CLIENT_ID.length > 0;

export const AMOY_CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`;

export const AMOY_CHAIN_CONFIG = {
  chainId: AMOY_CHAIN_ID_HEX,
  rpcTarget: RPC_URL,
  displayName: 'Polygon Amoy Testnet',
  blockExplorerUrl: BLOCK_EXPLORER.replace(/\/tx\/?$/, ''),
  ticker: 'POL',
  tickerName: 'Polygon',
  logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
};
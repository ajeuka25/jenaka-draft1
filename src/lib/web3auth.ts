import type { Web3AuthNoModal } from '@web3auth/no-modal';
import {
  WEB3AUTH_CLIENT_ID,
  IS_WEB3AUTH_CONFIGURED,
  AMOY_CHAIN_ID_HEX,
  AMOY_CHAIN_CONFIG,
} from '@/web3authContext';

export { IS_WEB3AUTH_CONFIGURED };

let instancePromise: Promise<Web3AuthNoModal> | null = null;

async function getWeb3Auth(): Promise<Web3AuthNoModal> {
  if (!instancePromise) {
    instancePromise = (async () => {
      const { Web3AuthNoModal, WEB3AUTH_NETWORK, authConnector } =
        await import('@web3auth/no-modal');

      const web3auth = new Web3AuthNoModal({
        clientId: WEB3AUTH_CLIENT_ID,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        chains: [{ chainNamespace: 'eip155', ...AMOY_CHAIN_CONFIG }],
        defaultChainId: AMOY_CHAIN_ID_HEX,
        connectors: [authConnector()],
      });

      await web3auth.init();
      return web3auth;
    })();
  }
  return instancePromise;
}

export async function connectWeb3Auth(method: 'social' | 'passkey'): Promise<string> {
  if (!IS_WEB3AUTH_CONFIGURED) {
    throw new Error('VITE_WEB3AUTH_CLIENT_ID belum diisi di .env');
  }

  const { WALLET_CONNECTORS, AUTH_CONNECTION } = await import('@web3auth/no-modal');
  const web3auth = await getWeb3Auth();

  await web3auth.connectTo(WALLET_CONNECTORS.AUTH, {
    authConnection: method === 'passkey' ? AUTH_CONNECTION.PASSKEYS : AUTH_CONNECTION.GOOGLE,
  });

  const provider = web3auth.provider;
  if (!provider) throw new Error('Web3Auth gagal menyediakan provider.');

  const { BrowserProvider } = await import('ethers');
  const ethersProvider = new BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();
  return signer.getAddress();
}

export async function disconnectWeb3Auth(): Promise<void> {
  if (!instancePromise) return;
  const web3auth = await instancePromise;
  if (web3auth.connected) {
    await web3auth.logout();
  }
}
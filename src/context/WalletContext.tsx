import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { connectRealWallet, getNativeBalance } from '@/lib/web3';
import { connectWeb3Auth, disconnectWeb3Auth, IS_WEB3AUTH_CONFIGURED } from '@/lib/web3auth';
import { getOrCreateProfile, persistKawal, persistRewards } from '@/lib/profiles';

type LoginMethod = 'wallet' | 'social' | 'passkey';

type WalletState =
  | { connected: false }
  | {
      connected: true;
      address: string;
      ens: string;
      balance: number;
      kawal: number;
      method: LoginMethod;
      methodLabel: string;
      isReal: boolean;
    };

interface WalletContextValue {
  state: WalletState;
  connecting: boolean;
  rewards: number;
  connect: (method?: LoginMethod) => Promise<void>;
  disconnect: () => void;
  award: (amount: number) => void;
  awardKawal: (amount: number) => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const METHOD_LABELS: Record<LoginMethod, string> = {
  wallet: 'MetaMask Wallet',
  social: 'Social / Email (Web3Auth)',
  passkey: 'Passkey (Account Abstraction)',
};

function ensFromAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({ connected: false });
  const [connecting, setConnecting] = useState(false);
  const [rewards, setRewards] = useState(0);
  const addressRef = useRef<string | null>(null);

  useEffect(() => {
    addressRef.current = state.connected ? state.address : null;
  }, [state]);

  const disconnect = useCallback(() => {
    setState((s) => {
      if (s.connected && (s.method === 'social' || s.method === 'passkey')) {
        disconnectWeb3Auth().catch(() => {
          /* state lokal tetap direset walau disconnect remote gagal */
        });
      }
      return { connected: false };
    });
    setRewards(0);
  }, []);

  const connect = useCallback(
    async (method: LoginMethod = 'wallet') => {
      if (state.connected || connecting) return;
      setConnecting(true);

      try {
        let address: string;

        if (method === 'wallet') {
          address = await connectRealWallet();
        } else {
          if (!IS_WEB3AUTH_CONFIGURED) {
            throw new Error(
              'Login social/passkey belum dikonfigurasi: variabel VITE_WEB3AUTH_CLIENT_ID belum diisi di .env. Minta admin mengisi Client ID dari dashboard Web3Auth, atau connect memakai MetaMask.',
            );
          }
          address = await connectWeb3Auth(method);
        }

        // Setiap address yang connect punya profil sendiri di Supabase
        // (kawal points, dsb) — bukan lagi angka simulasi yang sama untuk
        // semua orang.
        const [profile, balance] = await Promise.all([
          getOrCreateProfile(address, method),
          getNativeBalance(address),
        ]);

        setState({
          connected: true,
          address,
          ens: ensFromAddress(address),
          balance,
          kawal: profile.kawal,
          method,
          methodLabel: METHOD_LABELS[method],
          isReal: true,
        });
        setRewards(profile.rewards);
      } finally {
        setConnecting(false);
      }
    },
    [state.connected, connecting],
  );

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum?.on) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState((s) =>
          s.connected && s.method === 'wallet'
            ? {
                ...s,
                address: accounts[0],
                ens: ensFromAddress(accounts[0]),
              }
            : s,
        );
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', () => window.location.reload());

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
    };
  }, [disconnect]);

  const award = useCallback((amount: number) => {
    setRewards((r) => {
      const next = r + amount;
      const address = addressRef.current;
      if (address) persistRewards(address, next).catch(() => {});
      return next;
    });
  }, []);

  const awardKawal = useCallback((amount: number) => {
    setState((s) => {
      if (!s.connected) return s;
      const nextKawal = s.kawal + amount;
      persistKawal(s.address, nextKawal).catch(() => {});
      return { ...s, kawal: nextKawal };
    });
  }, []);

  const value = useMemo(
    () => ({ state, connecting, rewards, connect, disconnect, award, awardKawal }),
    [state, connecting, rewards, connect, disconnect, award, awardKawal],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
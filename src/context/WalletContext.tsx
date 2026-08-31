import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { connectRealWallet } from '@/lib/web3';
import { connectWeb3Auth, disconnectWeb3Auth, IS_WEB3AUTH_CONFIGURED } from '@/lib/web3auth';

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

function randomAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
}

const SIM_BALANCE = 4.21;
const SIM_KAWAL = 1250;
const METHOD_LABELS: Record<LoginMethod, string> = {
  wallet: 'MetaMask Wallet',
  social: 'Social / Email (Web3Auth)',
  passkey: 'Passkey (Account Abstraction)',
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({ connected: false });
  const [connecting, setConnecting] = useState(false);
  const [rewards, setRewards] = useState(0);

  const disconnect = useCallback(() => {
    setState((s) => {
      if (s.connected && s.isReal && (s.method === 'social' || s.method === 'passkey')) {
        disconnectWeb3Auth().catch(() => {});
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
        if (method === 'wallet' && window.ethereum) {
          const address = await connectRealWallet();
          setState({
            connected: true,
            address,
            ens: `${address.slice(0, 6)}…${address.slice(-4)}`,
            balance: SIM_BALANCE,
            kawal: SIM_KAWAL,
            method,
            methodLabel: METHOD_LABELS[method],
            isReal: true,
          });
        } else if ((method === 'social' || method === 'passkey') && IS_WEB3AUTH_CONFIGURED) {
          const address = await connectWeb3Auth(method);
          setState({
            connected: true,
            address,
            ens: `${address.slice(0, 6)}…${address.slice(-4)}`,
            balance: SIM_BALANCE,
            kawal: SIM_KAWAL,
            method,
            methodLabel: METHOD_LABELS[method],
            isReal: true,
          });
        } else {
          await new Promise((r) => setTimeout(r, 1400));
          const address = randomAddress();
          setState({
            connected: true,
            address,
            ens: `${address.slice(0, 6)}…${address.slice(-4)}`,
            balance: SIM_BALANCE,
            kawal: SIM_KAWAL,
            method,
            methodLabel: METHOD_LABELS[method],
            isReal: false,
          });
        }
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
          s.connected && s.isReal && s.method === 'wallet'
            ? { ...s, address: accounts[0], ens: `${accounts[0].slice(0, 6)}…${accounts[0].slice(-4)}` }
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

  const award = useCallback((amount: number) => setRewards((r) => r + amount), []);
  const awardKawal = useCallback((amount: number) => {
    setState((s) => (s.connected ? { ...s, kawal: s.kawal + amount } : s));
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
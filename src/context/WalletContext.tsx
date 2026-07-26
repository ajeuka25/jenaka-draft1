import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type WalletState =
  | { connected: false }
  | { connected: true; address: string; ens: string; balance: number };

interface WalletContextValue {
  state: WalletState;
  connecting: boolean;
  rewards: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  award: (amount: number) => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

function randomAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
}

const SIM_BALANCE = 4.21;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({ connected: false });
  const [connecting, setConnecting] = useState(false);
  const [rewards, setRewards] = useState(0);

  const connect = useCallback(async () => {
    if (state.connected || connecting) return;
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1400));
    const address = randomAddress();
    const shortened = `${address.slice(0, 6)}…${address.slice(-4)}`;
    setState({ connected: true, address, ens: shortened, balance: SIM_BALANCE });
    setConnecting(false);
  }, [state.connected, connecting]);

  const disconnect = useCallback(() => {
    setState({ connected: false });
    setRewards(0);
  }, []);

  const award = useCallback((amount: number) => {
 setRewards((r) => r + amount);
  }, []);

  const value = useMemo(
    () => ({ state, connecting, rewards, connect, disconnect, award }),
    [state, connecting, rewards, connect, disconnect, award],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

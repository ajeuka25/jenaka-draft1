import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Link2 } from 'lucide-react';

type ToastType = 'success' | 'warning' | 'info' | 'web3';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextValue {
  push: (type: ToastType, title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_STYLE: Record<ToastType, { icon: typeof CheckCircle2; ring: string; accent: string; bg: string }> = {
  success: { icon: CheckCircle2, ring: 'ring-neon/40', accent: 'text-neon', bg: 'bg-neon/10' },
  warning: { icon: AlertTriangle, ring: 'ring-amber-400/40', accent: 'text-amber-400', bg: 'bg-amber-400/10' },
  info: { icon: Info, ring: 'ring-sky-400/40', accent: 'text-sky-400', bg: 'bg-sky-400/10' },
  web3: { icon: Link2, ring: 'ring-web3/40', accent: 'text-web3', bg: 'bg-web3/10' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, title: string, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, type, title, message }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-4 z-[80] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0">
        {toasts.map((t) => {
          const s = TYPE_STYLE[t.type];
          const Icon = s.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-white/10 bg-ink-800/95 px-4 py-3.5 shadow-2xl ring-1 ${s.ring} backdrop-blur animate-slide-in-right`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${s.bg} ${s.accent}`}>
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{t.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">{t.message}</p>
              </div>
              <button
                onClick={() => remove(t.id)}
                className="shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

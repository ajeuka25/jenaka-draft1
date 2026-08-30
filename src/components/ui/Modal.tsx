import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-2xl',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  // Dirender lewat portal langsung ke document.body agar posisi "fixed"
  // tidak terjebak oleh ancestor manapun yang punya filter/backdrop-blur/
  // transform (mis. <header className="... backdrop-blur-xl">), yang
  // menurut spesifikasi CSS membuat containing block baru untuk elemen
  // fixed di dalamnya dan menyebabkan modal terpotong / salah posisi.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} max-h-[85vh] overflow-y-auto rounded-3xl glass-strong shadow-2xl animate-fade-in-up`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-ink-900/80 px-5 py-4 backdrop-blur sm:px-6">
          <div className="flex items-start gap-3">
            {icon}
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
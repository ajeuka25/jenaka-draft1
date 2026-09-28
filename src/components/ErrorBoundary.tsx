import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: unknown): State {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : String(err),
    };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900 p-6">
        <div className="max-w-md rounded-2xl glass-strong p-8 text-center">
          <h2 className="font-display text-xl font-bold text-white">
            Terjadi kesalahan
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Aplikasi gagal dimuat. Silakan refresh halaman.
          </p>
          {this.state.message && (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-ink-900/60 p-3 text-left text-xs text-danger">
              {this.state.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-gradient-to-r from-neon to-emerald-500 px-5 py-2.5 text-sm font-semibold text-ink-900"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
}

import { lazy, Suspense, useState } from 'react';
import { WalletProvider } from '@/context/WalletContext';
import { ToastProvider } from '@/context/ToastContext';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import { DashboardView } from '@/components/views/DashboardView';
import { AuditView } from '@/components/views/AuditView';
import { ReportsView } from '@/components/views/ReportsView';
import { MbgView } from '@/components/views/MbgView';
import { DaoView } from '@/components/views/DaoView';
import { ProjectDetail } from '@/components/ProjectDetail';
import type { Project } from '@/data/projects';
import type { ViewKey } from '@/lib/nav';

const MapView = lazy(() =>
  import('@/components/views/MapView').then((m) => ({ default: m.MapView })),
);

function App() {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const navigate = (v: ViewKey) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ToastProvider>
      <WalletProvider>
        <div className="relative min-h-screen bg-ink-900 text-slate-200">
          <Header view={view} onNavigate={navigate} />

          <main>
            {view === 'dashboard' && (
              <>
                <Hero
                  onJumpToAudit={() => navigate('audit')}
                  onJumpToReports={() => navigate('reports')}
                  onJumpToMbg={() => navigate('mbg')}
                />
                <DashboardView onOpenProject={setActiveProject} />
              </>
            )}
            {view === 'audit' && <AuditView onOpenProject={setActiveProject} />}
            {view === 'mbg' && <MbgView />}
            {view === 'map' && (
              <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-400">Memuat peta…</div>}>
                <MapView />
              </Suspense>
            )}
            {view === 'reports' && <ReportsView />}
            {view === 'dao' && <DaoView />}
          </main>

          <ProjectDetail
            project={activeProject}
            onClose={() => setActiveProject(null)}
          />

          <Footer />
        </div>
      </WalletProvider>
    </ToastProvider>
  );
}

export default App;

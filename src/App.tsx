import { useState } from 'react';
import { WalletProvider } from '@/context/WalletContext';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import { DashboardView } from '@/components/views/DashboardView';
import { AuditView } from '@/components/views/AuditView';
import { ReportsView } from '@/components/views/ReportsView';
import { MbgView } from '@/components/views/MbgView';
import { ProjectDetail } from '@/components/ProjectDetail';
import type { Project } from '@/data/projects';
import type { ViewKey } from '@/lib/nav';

function App() {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const navigate = (v: ViewKey) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
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
              <DashboardView
                onOpenProject={setActiveProject}
              />
            </>
          )}
          {view === 'audit' && <AuditView onOpenProject={setActiveProject} />}
          {view === 'mbg' && <MbgView />}
          {view === 'reports' && <ReportsView />}
        </main>

        <ProjectDetail
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />

        <Footer />
      </div>
    </WalletProvider>
  );
}

export default App;

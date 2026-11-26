import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './sections/HeroSection';
import { OverviewSection } from './sections/OverviewSection';
import { MetricsSection } from './sections/MetricsSection';
import { AboutSection } from './sections/AboutSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { PortfolioSection } from './sections/PortfolioSection';
import { CaseStudiesSection } from './sections/CaseStudiesSection';
import { ProductThinkingSection } from './sections/ProductThinkingSection';
import { CapabilitiesSection } from './sections/CapabilitiesSection';
import { SkillsSection } from './sections/SkillsSection';
import { EducationSection } from './sections/EducationSection';
import { ContactSection } from './sections/ContactSection';
import { CaseStudyModal } from './components/CaseStudyModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LivePreviewEditOverlay } from './components/LivePreviewEditOverlay';
import { EditSectionKey } from './components/AdminEditInfoManager';
import { AdminEditProvider } from './context/AdminEditContext';
import { PortfolioBundle, Project } from './types';
import { fetchPortfolio } from './services/api';
import { Loader2 } from 'lucide-react';
import { useLenisSmoothScroll } from './hooks/useLenisSmoothScroll';

export const App: React.FC = () => {
  useLenisSmoothScroll();

  const [data, setData] = useState<PortfolioBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [isLiveEditMode, setIsLiveEditMode] = useState<boolean>(false);
  const [liveEditSection, setLiveEditSection] = useState<EditSectionKey>('profile');

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [adminName, setAdminName] = useState<string>(localStorage.getItem('admin_name') || 'Administrator');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchPortfolio();
      setData(res);
      setError(null);
    } catch (err: any) {
      console.error("API fetch error:", err);
      setError(err.message || "Failed to connect to FastAPI backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCaseStudy = (project: Project) => {
    setSelectedProject(project);
    setIsCaseStudyOpen(true);
  };

  const handleAdminSuccess = (token: string, name: string) => {
    setAdminToken(token);
    setAdminName(name);
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_name', name);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    setIsAdminDashboardOpen(false);
    setIsLiveEditMode(false);
  };

  const handleLaunchLivePreview = (section: EditSectionKey) => {
    setLiveEditSection(section);
    setIsAdminDashboardOpen(false);
    setIsLiveEditMode(true);
  };

  const handleOpenAdminTrigger = () => {
    if (adminToken) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-bg dark:bg-dark-bg flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-fg dark:bg-white text-bg dark:text-dark-bg font-mono font-bold text-sm flex items-center justify-center">
            SB
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted">
            <Loader2 className="w-4 h-4 animate-spin text-accent dark:text-dark-accent" />
            <span>Connecting to FastAPI Backend...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminEditProvider
      value={{
        isEditMode: Boolean(adminToken && isLiveEditMode),
        token: adminToken,
        data,
        onRefreshData: loadData,
      }}
    >
      <div className="min-h-screen bg-bg dark:bg-dark-bg text-fg dark:text-dark-fg flex flex-col font-sans">
      
      {/* Sticky Navigation */}
      <Navbar 
        onOpenAdmin={handleOpenAdminTrigger} 
        isAdminLoggedIn={!!adminToken} 
      />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection profile={data?.profile || null} />
        <OverviewSection profile={data?.profile || null} />
        {data?.metrics && <MetricsSection metrics={data.metrics} />}
        <AboutSection profile={data?.profile || null} />
        {data?.experiences && <ExperienceSection experiences={data.experiences} />}
        {data?.projects && (
          <PortfolioSection 
            projects={data.projects} 
            onOpenCaseStudy={handleOpenCaseStudy} 
          />
        )}
        {data?.projects && (
          <CaseStudiesSection 
            projects={data.projects} 
            onOpenCaseStudy={handleOpenCaseStudy} 
          />
        )}
        <ProductThinkingSection />
        <CapabilitiesSection />
        {data?.skills && <SkillsSection skills={data.skills} />}
        {data?.certifications && <EducationSection certifications={data.certifications} />}
        <ContactSection profile={data?.profile || null} />
      </main>

      {/* Footer */}
      <Footer 
        onOpenAdmin={handleOpenAdminTrigger} 
        isAdminLoggedIn={!!adminToken} 
      />

      {/* Case Study Modal */}
      <CaseStudyModal
        project={
          selectedProject
            ? data?.projects.find((p) => p.id === selectedProject.id) || selectedProject
            : null
        }
        isOpen={isCaseStudyOpen}
        onClose={() => setIsCaseStudyOpen(false)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminSuccess}
      />

      {/* Admin Dashboard Drawer */}
      {adminToken && (
        <AdminDashboard
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          token={adminToken}
          userName={adminName}
          onLogout={handleAdminLogout}
          projects={data?.projects || []}
          onRefreshData={loadData}
          profile={data?.profile || null}
          portfolioData={data}
          onLaunchLivePreview={handleLaunchLivePreview}
        />
      )}

      {/* Live Preview Edit Mode Bottom Bar (no floating pop-up drawer — edit directly on page) */}
      {adminToken && (
        <LivePreviewEditOverlay
          isOpen={isLiveEditMode}
          activeSection={liveEditSection}
          onSectionChange={setLiveEditSection}
          onReturnToDashboard={() => {
            setIsLiveEditMode(false);
            setIsAdminDashboardOpen(true);
          }}
          onExitLiveEdit={() => setIsLiveEditMode(false)}
        />
      )}

      </div>
    </AdminEditProvider>
  );
};


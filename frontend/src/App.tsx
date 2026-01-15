import React, { useState, useTransition } from 'react';
import { LayoutDashboard, Zap, PlayCircle, Trophy, User } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { XPProvider } from './_xp/xp-provider';
import { AccuracyProvider } from './_accuracy/accuracy-context';
import { LeaderboardProvider } from './context/LeaderboardContext';
const ChallengePage = React.lazy(() => import('./Pages/ChallengePage').then(m => ({ default: m.ChallengePage })));
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));
const SimulationsList = React.lazy(() => import('./components/simulations/SimulationsList'));
const SimulationView = React.lazy(() => import('./components/simulations/SimulationView'));
const AuditLobby = React.lazy(() => import('./components/simulations/AuditLobby.tsx').then(m => ({ default: m.AuditLobby })));
const TaxSimulation = React.lazy(() => import('./components/simulations/TaxSimulation'));
const CaseLawModuleLive = React.lazy(() => import('./components/caselaws/CaseLawModuleLive'));
const CaseLawExplorer = React.lazy(() => import('./components/caselaw/CaseLawExplorer'));
const CaseDetailView = React.lazy(() => import('./components/caselaw/CaseDetailView'));
const QuizArena = React.lazy(() => import('./components/quiz/QuizArena'));
const Leaderboard = React.lazy(() => import('./components/leaderboard/Leaderboard'));
const ProgressModule = React.lazy(() => import('./components/progress/ProgressModule'));
const ProfilePage = React.lazy(() => import('./components/profile/ProfilePage'));
const AdminPanel = React.lazy(() => import('./components/admin/AdminPanel'));
const Phase1Chat = React.lazy(() => import('./components/Phase1Chat.tsx'));
import LoginPage from './components/auth/LoginPage';
import OnboardingModal from './components/auth/OnboardingModal';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import BadgeAwardModal from './components/badges/BadgeAwardModal';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import LandingPage from './components/landing/LandingPage';
import { Suspense } from 'react';

const AppContent: React.FC = () => {
  const { showOnboarding, user, loading, pendingBadges, clearPendingBadges } = useAuth();
  const [activeTab, setActiveTab] = useState(window.location.pathname.toLowerCase().includes('/admin') ? 'admin' : 'dashboard');
  const [isPending, startTransition] = useTransition();
  const [currentSimulation, setCurrentSimulation] = useState<string | null>(null);
  const [currentChallengeId, setCurrentChallengeId] = useState<string | null>(null);
  const [currentCaseDetail, setCurrentCaseDetail] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }




  const handleStartSimulation = (caseId: string) => {
    startTransition(() => {
      setCurrentSimulation(caseId);
    });
  };

  const handleBackToSimulations = () => {
    startTransition(() => {
      setCurrentSimulation(null);
    });
  };

  const handleOpenCaseDetail = (caseId: string) => {
    startTransition(() => {
      setCurrentCaseDetail(caseId);
    });
  };

  const handleCloseCaseDetail = () => {
    startTransition(() => {
      setCurrentCaseDetail(null);
    });
  };

  const handleStartChallenge = (challengeId: string) => {
    startTransition(() => {
      setCurrentChallengeId(challengeId);
      setActiveTab('challenge-detail');
    });
  };

  const handleBackToChallenges = () => {
    startTransition(() => {
      setCurrentChallengeId(null);
      setActiveTab('quiz-arena');
    });
  };

  const renderContent = () => {
    // Show simulation view if one is active
    if (currentSimulation) {
      return (
        <SimulationView
          caseId={currentSimulation}
          onBack={handleBackToSimulations}
        />
      );
    }

    // Show admin panel
    // if (activeTab === 'admin' && user?.role === 'admin') {
    //   return <AdminPanel />;
    // }
    // Show admin panel
    if (activeTab === 'admin') {
      return <AdminPanel />;
    }

    const wrappedSetActiveTab = (tab: string) => startTransition(() => setActiveTab(tab));

    // Regular content based on active tab
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={wrappedSetActiveTab} />;
      case 'simulations':
        return <SimulationsList onStartSimulation={handleStartSimulation} />;
      case 'audit-arena':
        return <AuditLobby onStartAudit={handleStartSimulation} onBack={() => wrappedSetActiveTab('dashboard')} />;
      case 'caselaw-simulation':
        return <CaseLawModuleLive />;
      case 'caselaw-explorer':
        if (currentCaseDetail) {
          return <CaseDetailView caseId={currentCaseDetail} onBack={handleCloseCaseDetail} />;
        }
        return <CaseLawExplorer onOpenCase={handleOpenCaseDetail} />;
      case 'tax-simulation':
        return <TaxSimulation onBack={() => wrappedSetActiveTab('dashboard')} />;
      case 'tax-cases':
        return <div className="flex items-center justify-center min-h-[60vh]"><h2 className="text-2xl font-bold text-gray-900">Tax Cases Coming Soon</h2></div>;
      case 'quiz-arena':
        return <QuizArena onStartDrill={handleStartChallenge} onBack={() => wrappedSetActiveTab('dashboard')} />;
      case 'leaderboard':
        return <Leaderboard onBack={() => wrappedSetActiveTab('dashboard')} />;
      case 'community':
        return <Phase1Chat />;
      case 'socket-test':
        return <Phase1Chat />;
      case 'progress':
        return <ProgressModule />;
      case 'profile':
        return <ProfilePage onBack={() => wrappedSetActiveTab('dashboard')} />;
      case 'challenge-detail':
        return currentChallengeId ? (
          <ChallengePage
            id={currentChallengeId}
            onBack={handleBackToChallenges}
            onNext={(nextId: string) => startTransition(() => setCurrentChallengeId(nextId))}
          />
        ) : <Dashboard setActiveTab={wrappedSetActiveTab} />;
      default:
        return <Dashboard setActiveTab={wrappedSetActiveTab} />;
    }
  };

  return (
    // <ActivityTrackerProvider activeTab={activeTab}>
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 flex overflow-hidden">
      {/* Achievement Popups */}
      {pendingBadges && (
        <BadgeAwardModal
          badges={pendingBadges}
          onClose={clearPendingBadges}
        />
      )}

      {/* Show onboarding modal if needed */}
      {showOnboarding && <OnboardingModal />}

      {/* Show full simulation view or normal layout */}
      {currentSimulation ? (
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <div className="w-full h-full">
            {renderContent()}
          </div>
        </Suspense>
      ) : (
        <>
          {/* Desktop & Mobile Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => startTransition(() => setActiveTab(tab))}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => {
              const newState = !isSidebarCollapsed;
              setIsSidebarCollapsed(newState);
              localStorage.setItem('sidebar-collapsed', String(newState));
            }}
            isMobileOpen={isMobileMenuOpen}
            onMobileClose={() => setIsMobileMenuOpen(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <TopBar
              user={user}
              setActiveTab={(tab) => startTransition(() => setActiveTab(tab))}
              onMenuClick={() => setIsMobileMenuOpen(true)}
            />

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              }>
                <div className="min-h-full pb-20 lg:pb-6">
                  {renderContent()}
                </div>
              </Suspense>
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl">
              <div className="safe-area-inset-bottom">
                <div className="flex items-center justify-around px-2 py-3">
                  {[
                    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
                    { id: 'quiz-arena', icon: Zap, label: 'Quiz' },
                    { id: 'audit-arena', icon: PlayCircle, label: 'Learn' },
                    { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
                    { id: 'profile', icon: User, label: 'Profile' }
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => startTransition(() => setActiveTab(item.id))}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-w-0 flex-1 max-w-20 ${isActive
                          ? 'bg-gradient-to-t from-blue-100 to-indigo-100 text-blue-700 shadow-lg scale-105 transform'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95'
                          }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 transition-all duration-300 ${isActive ? 'scale-110' : ''
                          }`} />
                        <span className={`text-xs font-medium truncate w-full text-center transition-all duration-300 ${isActive ? 'font-semibold' : ''
                          }`}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PublicContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return <LoginPage />;
  }

  return <LandingPage onGetStarted={() => setShowLogin(true)} />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AccuracyProvider>
        <XPProvider>
          <LeaderboardProvider>
            <SignedOut>
              <PublicContent />
            </SignedOut>
            <SignedIn>
              {/* Note: We need a wrapper to access activeTab for ActivityTrackerProvider */}
              <AppWrapper />
            </SignedIn>
          </LeaderboardProvider>
        </XPProvider>
      </AccuracyProvider>
    </AuthProvider>
  );
};

const AppWrapper: React.FC = () => {
  // We need to move activeTab state here or pass it down
  // For simplicity since AppContent already has it, we'll wrap inside AppContent if possible
  // Actually, ActivityTracker needs to be high level. 
  // Let's modify AppContent instead.
  return <AppContent />;
}

export default App;
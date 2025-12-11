import React, { useState } from 'react';
import { LayoutDashboard, Zap, PlayCircle, Trophy, User } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { XPProvider } from './_xp/xp-provider';
import { AccuracyProvider } from './_accuracy/accuracy-context';
import { LeaderboardProvider } from './context/LeaderboardContext';
import LoginPage from './components/auth/LoginPage';
import OnboardingModal from './components/auth/OnboardingModal';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './components/dashboard/Dashboard';
import SimulationsList from './components/simulations/SimulationsList';
import SimulationView from './components/simulations/SimulationView';
import AuditArena from './components/simulations/AuditArena';
import TaxSimulation from './components/simulations/TaxSimulation';
import CaseLawModuleLive from './components/caselaws/CaseLawModuleLive';
import CaseLawExplorer from './components/caselaw/CaseLawExplorer';
import QuizArena from './components/quiz/QuizArena';
import Leaderboard from './components/leaderboard/Leaderboard';
import ProgressModule from './components/progress/ProgressModule';
import ProfilePage from './components/profile/ProfilePage';
import AdminPanel from './components/admin/AdminPanel';
import { SignedIn, SignedOut } from '@clerk/clerk-react'

const AppContent: React.FC = () => {
  const { showOnboarding, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(window.location.pathname === '/AdminPanel' ? 'admin' : 'dashboard');
  const [currentSimulation, setCurrentSimulation] = useState<string | null>(null);

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
    setCurrentSimulation(caseId);
  };

  const handleBackToSimulations = () => {
    setCurrentSimulation(null);
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
    if (window.location.pathname === '/AdminPanel' && activeTab === 'admin') {
      return <AdminPanel />;
    }

    // Regular content based on active tab
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'simulations':
        return <SimulationsList onStartSimulation={handleStartSimulation} />;
      case 'audit-arena':
        return <AuditArena />;
      case 'caselaw-simulation':
        return <CaseLawModuleLive />;
      case 'caselaw-explorer':
        return <CaseLawExplorer />;
      case 'tax-simulation':
        return <TaxSimulation />;
      case 'tax-cases':
        return <div className="flex items-center justify-center min-h-[60vh]"><h2 className="text-2xl font-bold text-gray-900">Tax Cases Coming Soon</h2></div>;
      case 'quiz-arena':
        return <QuizArena />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'progress':
        return <ProgressModule />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 flex overflow-hidden">
      {/* Show onboarding modal if needed */}
      {showOnboarding && <OnboardingModal />}

      {/* Show full simulation view or normal layout */}
      {currentSimulation ? (
        <div className="w-full h-full">
          {renderContent()}
        </div>
      ) : (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden lg:block h-full">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <TopBar user={user!} setActiveTab={setActiveTab} />

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="min-h-full pb-20 lg:pb-6">
                {renderContent()}
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
                      { id: 'simulations', icon: PlayCircle, label: 'Learn' },
                      { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
                      { id: 'profile', icon: User, label: 'Profile' }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
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
          </div>
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AccuracyProvider>
        <XPProvider>
          <LeaderboardProvider>
            <SignedOut>
              <LoginPage />
            </SignedOut>
            <SignedIn>
              <AppContent />
            </SignedIn>
          </LeaderboardProvider>
        </XPProvider>
      </AccuracyProvider>
    </AuthProvider>
  );
};

export default App;
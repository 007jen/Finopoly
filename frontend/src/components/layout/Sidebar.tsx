import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  Scale,
  Trophy,
  TrendingUp,
  LogOut,
  Zap,
  User,
  FileText,
  Calculator,
  Shield,
  ChevronDown,
  BookOpen,
  Target,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quiz-arena', label: 'Quiz Arena', icon: Zap },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Add admin panel for partners


  const modules = [
    {
      id: 'audit',
      name: 'Audit',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      options: [
        { id: 'audit-arena', label: 'Audit Simulations', icon: PlayCircle }
      ]
    },
    {
      id: 'tax',
      name: 'Tax',
      icon: Calculator,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      comingSoon: true,
      options: [
        { id: 'tax-simulation', label: 'Tax Simulation', icon: Calculator },
        { id: 'tax-cases', label: 'Tax Cases', icon: FileText }
      ]
    },
    {
      id: 'caselaw',
      name: 'Case Law',
      icon: Scale,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      comingSoon: true,
      options: [
        { id: 'caselaw-simulation', label: 'Case Law Simulation', icon: Scale },
        { id: 'caselaw-explorer', label: 'Case Law Explorer', icon: BookOpen }
      ]
    }
  ];

  const handleModuleClick = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module?.comingSoon) return;
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleMenuItemClick = (itemId: string) => {
    setActiveTab(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 flex flex-col shadow-2xl transform transition-transform duration-300 lg:transform-none h-full ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>

        {/* Brand Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Finopoly
              </h1>
              <p className="text-xs text-gray-500 font-medium">Master Finance Through Play</p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Content */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4">
            {/* Learning Modules Section */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Learning Modules</h3>
              <div className="space-y-3">
                {modules.map((module) => {
                  const Icon = module.icon;
                  const isExpanded = expandedModule === module.id;

                  return (
                    <div key={module.id}>
                      <button
                        onClick={() => handleModuleClick(module.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${(module as any).comingSoon
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
                          : isExpanded
                            ? `bg-gradient-to-r ${module.color} text-white shadow-xl transform scale-105`
                            : `text-gray-700 hover:bg-gradient-to-r ${module.color} hover:text-white hover:shadow-lg hover:scale-105`
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 transition-all duration-300 ${isExpanded ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'}`} />
                          <div className="flex flex-col items-start">
                            <span className="font-semibold text-base">{module.name}</span>
                            {(module as any).comingSoon && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full mt-0.5">
                                Coming Soon
                              </span>
                            )}
                          </div>
                        </div>
                        {!(module as any).comingSoon && (
                          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 ml-6 space-y-2 animate-in slide-in-from-top-2 duration-300">
                          {module.options.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                              <button
                                key={option.id}
                                onClick={() => {
                                  handleMenuItemClick(option.id);
                                  setExpandedModule(null);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 hover:scale-105 ${activeTab === option.id
                                  ? 'bg-white/20 text-white font-semibold shadow-lg backdrop-blur-sm'
                                  : 'text-gray-600 hover:bg-white/10 hover:text-gray-900 hover:shadow-md'
                                  }`}
                              >
                                <OptionIcon className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                                <span>{option.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Navigation */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Navigation</h3>
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleMenuItemClick(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-300 hover:scale-105 ${activeTab === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl transform scale-105'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-blue-50 hover:text-gray-900 hover:shadow-lg'
                          }`}
                      >
                        <Icon className={`w-5 h-5 transition-all duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'
                          }`} />
                        <span className="font-semibold">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
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
  Users,
  FileText,
  Calculator,
  Shield,
  ChevronDown,
  BookOpen,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse
}) => {
  const { logout } = useAuth();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quiz-arena', label: 'Quiz Arcade', icon: Zap },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'courses', label: 'Industry Insights', icon: PlayCircle },
    { id: 'community', label: 'Community', icon: Users },
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

    // If collapsed, expand when clicking a module
    if (isCollapsed) {
      onToggleCollapse();
    }

    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const handleMenuItemClick = (itemId: string) => {
    setActiveTab(itemId);
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-72';

  return (
    <>
      {/* Sidebar Container - Desktop Only now */}
      <div className={`hidden lg:flex flex-col fixed lg:static inset-y-0 left-0 z-50 ${sidebarWidth} bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl transition-all duration-300`}>

        {/* Brand Header */}
        <div
          className={`flex-shrink-0 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-300`}
        >
          <div className={`p-4 flex items-center ${isCollapsed ? 'flex-col gap-4 justify-center' : 'justify-between gap-3'}`}>
            <div
              onClick={() => handleMenuItemClick('dashboard')}
              className={`flex items-center gap-3 cursor-pointer group`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                <Shield className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none">
                    Finopoly
                  </h1>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">CA Excellence</p>
                </div>
              )}
            </div>

            {/* Hamburger Toggle (Desktop) */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 hover:bg-white/50 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <nav className="p-3">
            {/* Learning Modules Section */}
            <div className="mb-6">
              {!isCollapsed && <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-3">Learning Modules</h3>}
              <div className="space-y-1">
                {modules.map((module) => {
                  const Icon = module.icon;
                  const isExpanded = expandedModule === module.id && !isCollapsed;

                  return (
                    <div key={module.id} className="relative group">
                      <button
                        onClick={() => handleModuleClick(module.id)}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-xl transition-all duration-300 ${(module as any).comingSoon
                          ? 'opacity-60 cursor-not-allowed grayscale'
                          : isExpanded
                            ? `bg-blue-600 text-white shadow-lg`
                            : `text-gray-600 hover:bg-blue-50 hover:text-blue-600`
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${isExpanded ? 'scale-110' : ''}`} />
                          {!isCollapsed && (
                            <div className="flex flex-col items-start min-w-0">
                              <span className="font-bold text-sm truncate">{module.name}</span>
                              {(module as any).comingSoon && (
                                <span className="text-[8px] font-black uppercase tracking-tighter bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full mt-0.5">Coming Soon</span>
                              )}
                            </div>
                          )}
                        </div>
                        {!isCollapsed && !(module as any).comingSoon && (
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                          {module.options.map((option) => {
                            const OptionIcon = option.icon;
                            return (
                              <button
                                key={option.id}
                                onClick={() => handleMenuItemClick(option.id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === option.id
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                  }`}
                              >
                                <OptionIcon className="w-4 h-4" />
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
            <div>
              {!isCollapsed && <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-3">Quick Access</h3>}
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id} className="relative group">
                      <button
                        onClick={() => handleMenuItemClick(item.id)}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl text-left transition-all duration-300 ${isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                        {!isCollapsed && <span className="font-bold text-sm truncate">{item.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200/50 bg-gray-50/10`}>
          <button
            onClick={logout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group relative`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
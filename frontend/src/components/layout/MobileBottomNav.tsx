import React, { useState } from 'react';
import {
    LayoutDashboard,
    Zap,
    PlayCircle,
    Trophy,
    User,
    TrendingUp,
    Users,
    Grid,
    X
} from 'lucide-react';

interface MobileBottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const mainNavItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
        { id: 'quiz-arena', icon: Zap, label: 'Quiz' },
        { id: 'audit-arena', icon: PlayCircle, label: 'Learn' },
        { id: 'profile', icon: User, label: 'Profile' }
    ];

    const allMenuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'quiz-arena', icon: Zap, label: 'Quiz Arcade', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { id: 'audit-arena', icon: PlayCircle, label: 'Audit Arena', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'leaderboard', icon: Trophy, label: 'Leaderboard', color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'courses', icon: PlayCircle, label: 'Courses', color: 'text-rose-600', bg: 'bg-rose-50' },
        { id: 'community', icon: Users, label: 'Community', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'progress', icon: TrendingUp, label: 'Progress', color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'profile', icon: User, label: 'Profile', color: 'text-slate-600', bg: 'bg-slate-50' },
    ];

    const handleNavClick = (tabId: string) => {
        setActiveTab(tabId);
        setIsExpanded(false);
    };

    return (
        <>
            {/* Expanded Menu Overlay */}
            {isExpanded && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsExpanded(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 pb-24 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Menu</h3>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {allMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item.id)}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 ${isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${item.bg}`}>
                                            <Icon className={`w-6 h-6 ${item.color}`} />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
                <div className="bg-white/95 backdrop-blur-2xl border-t border-gray-200/50 shadow-2xl safe-area-inset-bottom">
                    <div className="flex items-center justify-between px-4 py-2">
                        {mainNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[4rem] active:scale-95 ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon
                                        className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-blue-600 fill-blue-600/20' : 'text-gray-400'
                                            }`}
                                    />
                                </button>
                            );
                        })}

                        {/* Menu Toggle Button */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 min-w-[4rem] active:scale-95 ${isExpanded ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'hover:bg-gray-50'
                                }`}
                        >
                            <Grid className={`w-6 h-6 transition-all duration-300 ${isExpanded ? 'text-white' : 'text-gray-400'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileBottomNav;

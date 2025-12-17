import React, { useState } from 'react';
import { Search, Trophy, Flame, Star, Settings, LogOut, ChevronDown, User as UserIcon, Bell } from 'lucide-react';
import { User as UserType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  user: UserType | null;
  setActiveTab: (tab: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, setActiveTab }) => {
  const { logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!user) return null;

  const handleProfileClick = () => {
    setActiveTab('profile');
    setIsProfileOpen(false);
  };

  return (
    <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 px-3 sm:px-4 lg:px-6 py-3 shadow-sm z-50 relative">
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Search (hidden on mobile, shown on tablet+) */}
        <div className="hidden md:flex items-center flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search simulations, case laws, topics..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Mobile: Just show XP */}
        <div className="flex md:hidden items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-lg border border-yellow-200/50">
          <Trophy className="w-4 h-4 text-yellow-600" />
          <span className="text-xs font-bold text-yellow-700"><span data-xp-display>0</span> XP</span>
        </div>

        {/* Right side - User info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">

          {/* Stats Group (Tablet+) */}
          <div className="hidden md:flex items-center gap-3">
            {/* XP Display */}
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-700" data-xp-display>0</span>
            </div>

            {/* Level Display */}
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">L{user?.currentLevel || 1}</span>
            </div>

            {/* Streak Display */}
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-red-600">{user?.dailyStreak || 0}</span>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden md:block mx-1"></div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors hidden sm:block">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-1 pr-1 py-1 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
            >
              <div className="hidden lg:block text-right">
                <p className="text-sm font-bold text-gray-900 leading-none">{user.name.split(' ')[0]}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">CA {user.role}</p>
              </div>

              <div className="relative">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate mb-2">{user?.email}</p>
                  <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                    {user?.role || 'Student'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-gray-400" /> View Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" /> Settings
                  </button>
                </div>

                <div className="border-t border-gray-50 py-1">
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TopBar;
import React, { useState, useEffect } from 'react';
import {
  Play,
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  Target,
  Zap,
  Star,
  ChevronRight
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useAccuracy } from '../../_accuracy/accuracy-context';

import { useAuth as useClerkAuth } from "@clerk/clerk-react";

import { XP_EVENT_NAME, XP_RESET_EVENT_NAME } from '../../_xp/xp-service';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user, refreshUser } = useAuth();
  const { getToken } = useClerkAuth();
  const { accuracy } = useAccuracy();

  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);

  const [lastActivity, setLastActivity] = React.useState<any>(null);

  const fetchData = React.useCallback(async () => {
    // 1. Fetch Weekly XP & Last Activity (Protected)
    try {
      const token = await getToken();
      if (token) {
        // Weekly XP
        // Use api.get but we need to pass Authorization header manually if api.ts doesn't handle Clerk token auto-magic (it doesn't).
        // But api.ts adds credentials: include.
        // Wait, does api.ts allow custom headers? Yes.


        // Last Activity (Timeline)
        const activities: any = await api.get("/api/profile/timeline", { headers: { Authorization: `Bearer ${token}` } });
        if (activities && activities.length > 0) {
          setLastActivity(activities[0]);
        }
      }
    } catch (e) {
      console.error("Dashboard data fetch failed", e);

    }

    // 2. Fetch Leaderboard (Public)
    try {
      const lbData: any = await api.get("/api/leaderboard");
      setLeaderboard(lbData.leaderboard || []);
    } catch (e) { console.error("Leaderboard fetch failed", e); }
  }, [getToken]);

  React.useEffect(() => {
    fetchData();

    // Listen for XP updates (e.g. from Vouching Racer)
    const handleXPUpdate = () => {
      // Add a small delay to ensure backend is updated
      setTimeout(fetchData, 500);
    };

    const handleXPReset = () => {

      setLastActivity(null);
      fetchData(); // Refetch to confirm
    }

    window.addEventListener(XP_EVENT_NAME, handleXPUpdate);
    window.addEventListener(XP_RESET_EVENT_NAME, handleXPReset);

    return () => {
      window.removeEventListener(XP_EVENT_NAME, handleXPUpdate);
      window.removeEventListener(XP_RESET_EVENT_NAME, handleXPReset);
    }
  }, [fetchData]);

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const getResumeAction = () => {
    const type = lastActivity?.type || '';
    if (type.includes('audit') || type.includes('tax')) return 'audit-arena';
    if (type.includes('quiz')) return 'quiz-arena';
    return 'audit-arena';
  }


  if (!user) return null;

  // Gamification State
  const [dailyGoals, setDailyGoals] = useState({
    streak: false,
    simulation: false,
    quiz: false
  });
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);


  // Fetch Daily Goals from Backend (Handles Auto-Checkin)
  useEffect(() => {
    let mounted = true;

    const fetchDailyGoals = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const response = await api.get(`/api/progress/goals?_t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }) as any;
        const data = response; // API wrapper returns parsed JSON directly
        // console.log("Daily Goals Data:", data); // Debug log

        if (mounted && data) {
          setDailyGoals(data.goals);
          if (data.meta?.streakUpdated) {
            refreshUser();
          }
          // Confetti removed per user request
        }
      } catch (err: any) {
        console.error("Failed to fetch daily goals", err);
      }
    };

    fetchDailyGoals();

    return () => { mounted = false; };
  }, [user, getToken, refreshUser]);

  /* Removed unused weeklyXP state and legacy fetch */

  // Fetch Weekly Goals
  useEffect(() => {
    const fetchWeekly = async () => {
      if (!user) return;
      try {
        const token = await getToken();
        const response = await api.get('/api/progress/weekly-goals', {
          headers: { 'Authorization': `Bearer ${token}` }
        }) as any;
        if (response && response.goals) {
          setWeeklyGoals(response.goals);
        }
      } catch (err) {
        console.error("Failed to fetch weekly goals", err);
      }
    };
    fetchWeekly();
  }, [user, getToken]);

  const getDynamicRecommendations = () => {
    const recs = [];
    const { streak, simulation, quiz } = dailyGoals;

    // GOAL 1: CHECK-IN
    recs.push({
      label: 'GOAL 1: CHECK-IN',
      title: 'Keep the Streak Alive',
      subtitle: `${user.dailyStreak} Day Streak 🔥`, // This will update after refreshUser()
      action: null,
      status: streak ? 'completed' : 'active',
      points: '+50 XP'
    });

    // GOAL 2: SIMULATION
    let simStatus = 'locked';
    if (streak) {
      simStatus = simulation ? 'completed' : 'active';
    }

    recs.push({
      label: 'GOAL 2: SIMULATION',
      title: 'Complete a Simulation',
      subtitle: 'Practice real-world auditing',
      action: simStatus === 'active' ? () => setActiveTab('audit-arena') : undefined,
      status: simStatus,
      points: '+150 XP'
    });

    // GOAL 3: QUIZ
    let quizStatus = 'locked';
    if (streak && simulation) {
      quizStatus = quiz ? 'completed' : 'active';
    }

    recs.push({
      label: 'GOAL 3: CHALLENGE',
      title: 'Take a Quick Quiz',
      subtitle: 'Boost your accuracy stats',
      action: quizStatus === 'active' ? () => setActiveTab('quiz-arena') : undefined,
      status: quizStatus,
      points: 'Double XP'
    });

    return recs;
  };

  const quickStats = [
    {
      label: 'Simulations Completed',
      value: user.completedSimulations,
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      label: 'Current Streak',
      value: `${user.dailyStreak} days`,
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50'
    },
    {
      label: 'Badges Earned',
      value: user.badges.length,
      icon: Award,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      label: 'Avg. Accuracy',
      value: `${accuracy}%`,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50'
    }
  ];

  const actionCards = [
    {
      title: 'Continue Ongoing Simulation',
      description: 'Fixed Assets Audit - ABC Pvt Ltd',
      progress: 65,
      action: () => setActiveTab('audit-arena'),
      icon: Play,
      color: 'from-blue-500 to-indigo-500',
      highlight: true
    },
    {
      title: 'Try New Challenge',
      description: 'Daily case law challenge available',
      action: () => alert("Coming Soon! Case Law challenges are currently in development."), // Feature Coming Soon
      icon: Zap,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'View Performance Report',
      description: 'Track your learning progress',
      action: () => setActiveTab('progress'),
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Explore Case Laws',
      description: 'Browse latest judgments and rulings',
      action: () => alert("Coming Soon! Case Law library is under construction."), // Feature Coming Soon
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8">
        {/* Welcome Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 whitespace-nowrap">
            Welcome, {user.name}! ✨
          </h1>
          <p className="text-gray-600 text-lg lg:text-xl">Ready to continue your learning journey?</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`bg-gradient-to-br ${stat.bgColor} p-6 lg:p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group`}>
                <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between">
                  <div className="text-center lg:text-left mb-4 lg:mb-0">
                    <div className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 leading-tight">
                      {stat.label.split(' ').map((word, i) => (
                        <span key={i} className="block">{word}</span>
                      ))}
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform">{stat.value}</p>
                  </div>
                  <div className={`w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid: Continue Learning + XP Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7">

          {/* Left Col: Continue Learning Section */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl lg:rounded-3xl p-[23px] lg:p-[30px] text-white shadow-2xl flex flex-col justify-between h-full">
            <div>
              <h2 className="text-[1.4rem] lg:text-[1.78rem] font-bold mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                {lastActivity ? 'Continue Learning' : 'Start Your Journey'}
              </h2>
              <p className="text-[1.05rem] lg:text-[1.18rem] opacity-95 mb-2">
                {lastActivity ? (lastActivity.title || lastActivity.label) : 'Learn Audit Basics: Simulation 101'}
              </p>
              <p className="text-[13px] lg:text-[15px] opacity-80 mb-5">
                {lastActivity ? `Last activity: ${getTimeAgo(lastActivity.date)}` : 'Ready to earn your first badge?'}
              </p>
              <div className="mb-5 lg:mb-0">
                <div className="flex items-center justify-between text-xs lg:text-sm mb-2.5">
                  <span className="font-medium">Progress</span>
                  <span className="font-bold">{lastActivity ? '' : '0%'}</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2.5 lg:h-3.5">
                  <div className="bg-white h-2.5 lg:h-3.5 rounded-full shadow-sm transition-all duration-500" style={{ width: lastActivity ? '100%' : '5%' }}></div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab(lastActivity ? getResumeAction() : 'audit-arena')}
              className="mt-5 w-full bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-bold text-base lg:text-lg hover:scale-105 shadow-lg"
            >
              <Play className="w-5 h-5 lg:w-6 lg:h-6" />
              {lastActivity ? 'Resume' : 'Start Now'}
            </button>
          </div>

          {/* Right Col: XP Balance Card (Moved from QuizArena) */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl lg:rounded-3xl p-[23px] lg:p-[30px] text-white shadow-xl flex flex-col justify-between h-full">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[1.3rem] lg:text-[1.78rem] font-bold mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">Your XP Balance</h2>
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-[30px] h-[30px] lg:w-[38px] lg:h-[38px] fill-white text-white" />
                  <span className="text-[1.3rem] lg:text-[2.40rem] font-bold">{user?.xp.toLocaleString()}</span>
                  <span className="text-lg lg:text-xl font-medium opacity-90 pt-1.5 lg:pt-2">XP</span>
                </div>
              </div>
              <div className="hidden sm:block p-2.5 bg-white/20 rounded-2xl rotate-3">
                <Zap className="w-[30px] h-[30px] lg:w-[38px] lg:h-[38px] text-white" />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[15px] lg:text-[17px] font-bold bg-white/20 px-3.5 py-1 rounded-lg">Level {user.level || 1}</span>
                <span className="text-xs lg:text-[13px] font-medium opacity-90">{(user.xp % 1000)} / 1000 XP to next</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/20 rounded-full h-3 lg:h-[15px] relative overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${(user.xp % 1000) / 10}%` }}
                />
              </div>

              <p className="mt-3.5 text-xs lg:text-[13px] opacity-90 text-center font-medium">Earn more XP by completing simulations & quizzes!</p>
            </div>
          </div>

        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {actionCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 ${card.highlight ? 'ring-2 ring-blue-200 shadow-blue-100/50' : ''
                  }`}
                onClick={card.action}
              >
                <div className="text-center">
                  <div className={`w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}>
                    <Icon className="w-8 lg:w-10 h-8 lg:h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-3 text-base lg:text-lg">{card.title}</h3>
                  <p className="text-gray-600 text-sm lg:text-base mb-4 leading-relaxed">{card.description}</p>
                  {card.progress && (
                    <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3 mb-4">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 lg:h-3 rounded-full transition-all duration-500"
                        style={{ width: `${card.progress}%` }}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 font-semibold group-hover:gap-2 transition-all">
                    <span>Get Started</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Column Layout for Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard Preview */}
          <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Top Performers This Week</h2>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {leaderboard.map((entry: any, index: number) => (
                <div key={entry.userId || index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                      entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                        'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                      }`}>
                      {entry.rank}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {(entry.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm lg:text-base truncate">{entry.name || 'Anonymous'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs lg:text-sm font-semibold text-gray-600">{(entry.xp || 0).toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">No leaderboard data available yet.</div>
              )}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-lg border border-white/50">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
            <div className="space-y-4">
              {user.badges.slice(-3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/50 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm lg:text-base truncate">{badge.name}</p>
                    <p className="text-xs lg:text-sm text-gray-600 line-clamp-2">{badge.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 flex-shrink-0">
                    {new Date(badge.earnedDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Activity Timeline */}
        <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-lg border border-white/50">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Today's Learning Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getDynamicRecommendations().map((item, index) => (
              <div key={index} className={`p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 ${item.status === 'completed' ? 'bg-green-50 border-green-200' :
                item.status === 'active' ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'active' ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-400'
                    }`}></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{item.label}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.subtitle}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`text-xs font-bold ${item.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                    {item.points}
                  </span>
                  {item.action && (
                    <button onClick={item.action} className="text-xs font-bold text-gray-900 hover:text-blue-700 flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all">
                      Go <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-lg border border-white/50">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Weekly Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weeklyGoals.map((goal, index) => {
              const rawProgress = (goal.current / goal.target) * 100;
              const progress = Math.min(rawProgress, 100);
              const isComp = goal.current >= goal.target;

              return (
                <div key={index} className={`p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border shadow-sm transition-all ${isComp ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <h3 className="font-bold text-gray-900 mb-3">{goal.label}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">{goal.current}/{goal.target} {goal.unit}</span>
                    <span className={`text-sm font-bold ${isComp ? 'text-green-600' : 'text-gray-900'}`}>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${isComp ? 'bg-green-500' :
                        goal.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                          goal.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            'bg-gradient-to-r from-orange-500 to-red-500'
                        }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
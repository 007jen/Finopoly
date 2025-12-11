import React from 'react';
import {
  Play,
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  Target,
  Users,
  Zap,
  Trophy,
  Star,
  ChevronRight,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccuracy } from '../../_accuracy/accuracy-context';
import { mockLeaderboard } from '../../data/mockData';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { accuracy } = useAccuracy();

  if (!user) return null;

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
      action: () => setActiveTab('simulations'),
      icon: Play,
      color: 'from-blue-500 to-indigo-500',
      highlight: true
    },
    {
      title: 'Try New Challenge',
      description: 'Daily case law challenge available',
      action: () => setActiveTab('caselaw-simulation'),
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
      action: () => setActiveTab('caselaw-explorer'),
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        {/* Welcome Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Welcome back, {user.name}! ✨
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
                    <p className="text-xs lg:text-sm font-semibold text-gray-600 mb-2">{stat.label}</p>
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

        {/* Continue Learning Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">Continue Learning</h2>
              <p className="text-lg lg:text-xl opacity-95 mb-2">Fixed Assets Audit - ABC Pvt Ltd</p>
              <p className="text-sm lg:text-base opacity-80 mb-6">Last activity: 2 hours ago</p>
              <div>
                <div className="flex items-center justify-between text-sm lg:text-base mb-3">
                  <span className="font-medium">Progress</span>
                  <span className="font-bold">65%</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-3 lg:h-4">
                  <div className="bg-white h-3 lg:h-4 rounded-full shadow-sm transition-all duration-500" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('simulations')}
              className="w-full lg:w-auto bg-white bg-opacity-20 hover:bg-opacity-30 px-8 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-bold text-lg hover:scale-105 shadow-lg"
            >
              <Play className="w-6 h-6" />
              Continue
            </button>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              {mockLeaderboard.slice(0, 3).map((entry, index) => (
                <div key={entry.user.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                      entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                        'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                      }`}>
                      {entry.rank}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {entry.user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm lg:text-base truncate">{entry.user.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs lg:text-sm font-semibold text-gray-600">{entry.user.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>
              ))}
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
            {[
              { time: '09:30 AM', activity: 'Completed Audit Quiz', points: '+150 XP', status: 'completed' },
              { time: '11:15 AM', activity: 'Started Tax Simulation', points: 'In Progress', status: 'active' },
              { time: '02:00 PM', activity: 'Case Law Challenge', points: '+200 XP', status: 'upcoming' },
            ].map((item, index) => (
              <div key={index} className={`p-4 lg:p-6 rounded-xl border-2 transition-all duration-300 ${item.status === 'completed' ? 'bg-green-50 border-green-200' :
                item.status === 'active' ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'active' ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-400'
                    }`}></div>
                  <span className="text-sm font-semibold text-gray-600">{item.time}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.activity}</h3>
                <p className={`text-sm font-semibold ${item.status === 'completed' ? 'text-green-600' :
                  item.status === 'active' ? 'text-blue-600' :
                    'text-gray-500'
                  }`}>
                  {item.points}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="bg-white/80 backdrop-blur-sm p-6 lg:p-8 rounded-2xl shadow-lg border border-white/50">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Weekly Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { goal: 'Complete 5 Simulations', current: 3, target: 5, color: 'blue' },
              { goal: 'Earn 1000 XP', current: 750, target: 1000, color: 'green' },
              { goal: 'Maintain 7-day Streak', current: 5, target: 7, color: 'orange' },
            ].map((goal, index) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <div key={index} className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">{goal.goal}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">{goal.current}/{goal.target}</span>
                    <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${goal.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
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
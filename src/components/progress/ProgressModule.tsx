import React from 'react';
import {
  TrendingUp,
  Target,
  Calendar,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { useXP } from '../../_xp/xp-context';
import { useAccuracy } from '../../_accuracy/accuracy-context';
import { RotateCcw } from 'lucide-react';

const ProgressModule: React.FC = () => {
  const { user } = useAuth();
  const { resetXP } = useXP();
  const { resetAccuracy } = useAccuracy();

  if (!user) return null;

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      resetXP();
      resetAccuracy();
    }
  };

  const weeklyData = [
    { day: 'Mon', xp: 120, streak: true },
    { day: 'Tue', xp: 200, streak: true },
    { day: 'Wed', xp: 150, streak: true },
    { day: 'Thu', xp: 300, streak: true },
    { day: 'Fri', xp: 180, streak: true },
    { day: 'Sat', xp: 0, streak: false },
    { day: 'Sun', xp: 250, streak: true },
  ];

  const monthlyStreak = Array.from({ length: 30 }, (_, i) => ({
    date: i + 1,
    active: Math.random() > 0.3,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{user.completedSimulations}</span>
          </div>
          <p className="text-gray-600 text-sm">Simulations Completed</p>
          <div className="mt-2 text-xs text-green-600">+5 this week</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Star className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900"><span data-xp-display>{user.xp.toLocaleString()}</span></span>
          </div>
          <p className="text-gray-600 text-sm">Total XP Earned</p>
          <div className="mt-2 text-xs text-green-600">+450 this week</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{user.dailyStreak}</span>
          </div>
          <p className="text-gray-600 text-sm">Day Streak</p>
          <div className="mt-2 text-xs text-orange-600">Keep it up!</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{user.badges.length}</span>
          </div>
          <p className="text-gray-600 text-sm">Badges Earned</p>
          <div className="mt-2 text-xs text-purple-600">3 available</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly XP Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Weekly XP Progress</h2>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>

          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm text-gray-600">{day.day}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(day.xp / 300) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-sm font-semibold text-gray-900 text-right">
                  {day.xp} XP
                </div>
                {day.streak && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900">1,200</span>
              <p className="text-gray-600 text-sm">Total XP this week</p>
            </div>
          </div>
        </div>

        {/* Learning Streak Calendar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Learning Streak</h2>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium p-2">
                {day}
              </div>
            ))}
            {monthlyStreak.map((day, index) => (
              <div
                key={index}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${day.active
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {day.date}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <div className="w-3 h-3 bg-green-800 rounded"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Subject-wise Accuracy */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Subject-wise Performance</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { subject: 'Audit', accuracy: user.accuracy.audit, color: 'blue' },
            { subject: 'Tax', accuracy: user.accuracy.tax, color: 'green' },
            { subject: 'Case Law', accuracy: user.accuracy.caselaw, color: 'purple' },
          ].map((item) => (
            <div key={item.subject} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={`rgb(${item.color === 'blue' ? '59 130 246' : item.color === 'green' ? '34 197 94' : '168 85 247'})`}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${item.accuracy * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">{item.accuracy}%</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900">{item.subject}</h3>
              <p className="text-sm text-gray-500">Accuracy Rate</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Achievements</h2>

        <div className="space-y-4">
          {user.badges.map((badge) => (
            <div key={badge.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Award className="w-10 h-10 text-yellow-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                <p className="text-gray-600 text-sm">{badge.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {new Date(badge.earnedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Danger Zone */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
        <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-900 font-medium">Reset Progress</p>
            <p className="text-sm text-gray-500">This will permanently delete your XP, badges, and accuracy stats.</p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressModule;
import React, { useState, useEffect } from 'react';
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { api } from '../../lib/api';

const ProgressModule: React.FC = () => {
  const { user } = useAuth();
  const { getToken } = useClerkAuth();

  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  const [weeklyXpData, setWeeklyXpData] = useState<any>(null);
  const [streakData, setStreakData] = useState<string[]>([]);
  const [subjectData, setSubjectData] = useState<any>(null);

  if (!user) return null;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchProgress = async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all 3 endpoints parallelly
        const [xpData, streakRes, subjectsRes] = await Promise.all([
          api.get<any>("/api/progress/weekly-xp", { headers }),
          api.get<any>("/api/progress/streak", { headers }),
          api.get<any>("/api/progress/subjects", { headers })
        ]);

        setWeeklyXpData(xpData);
        setStreakData(streakRes.activeDates || []); // API returns { activeDates: string[] }
        setSubjectData(subjectsRes);
        setLoading(false);

      } catch (err: any) {
        console.error("Fetch progress error", err);

        const isAuthError = err.message?.includes("Unauthorized") || err.message?.includes("401");
        // Stop retrying if unauthorized OR retries exceeded
        if (isAuthError) {
          // Maybe set error state? For now just stop loading.
          setLoading(false);
          return;
        }

        if (retryCount < MAX_RETRIES) {
          timeoutId = setTimeout(() => {
            setRetryCount((c: number) => c + 1);
          }, 1000);
        } else {
          // Failed after retries
          setLoading(false);
        }
      }
    };

    fetchProgress();

    return () => clearTimeout(timeoutId);
  }, [retryCount, getToken]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Loading Progress...</h3>
          <p className="text-gray-500">Syncing your stats</p>
        </div>
      </div>
    );
  }



  // Transform Weekly Data
  const weeklyData = [
    { day: 'Mon', xp: weeklyXpData?.dailyXp?.Mon || 0 },
    { day: 'Tue', xp: weeklyXpData?.dailyXp?.Tue || 0 },
    { day: 'Wed', xp: weeklyXpData?.dailyXp?.Wed || 0 },
    { day: 'Thu', xp: weeklyXpData?.dailyXp?.Thu || 0 },
    { day: 'Fri', xp: weeklyXpData?.dailyXp?.Fri || 0 },
    { day: 'Sat', xp: weeklyXpData?.dailyXp?.Sat || 0 },
    { day: 'Sun', xp: weeklyXpData?.dailyXp?.Sun || 0 },
  ].map(d => ({ ...d, streak: d.xp > 0 }));

  const totalWeeklyXp = weeklyXpData?.totalXp || 0;

  // Transform Streak Data
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1).getDay(); // 0=Sun, 6=Sat

  const monthlyStreak = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const year = currentYear;
    const monthStr = String(currentMonthIdx + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const active = streakData.some(d => d === dateStr);
    return { date: dayNum, active };
  });

  // Calculate padding for the calendar grid
  const calendarPadding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Use Subject Data
  const accuracyData = {
    audit: subjectData?.audit ?? user.accuracy.audit,
    tax: subjectData?.tax ?? user.accuracy.tax,
    caselaw: subjectData?.caseLaw ?? user.accuracy.caselaw
  };

  return (
    <div className="min-h-full relative overflow-hidden bg-[#fafbfc]">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-gradient-to-tl from-indigo-100/40 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-gradient-to-tr from-teal-50/30 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Your Progress</h1>
            <p className="text-gray-600 font-medium">Track your learning journey and achievements</p>
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
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900"><span data-xp-display>{user.xp.toLocaleString()}</span></span>
            </div>
            <p className="text-gray-600 text-sm">Total XP Earned</p>
            <div className="mt-2 text-xs text-green-600">+{totalWeeklyXp} this week</div>
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
              {(() => {
                const maxXP = Math.max(...weeklyData.map(d => d.xp), 100);
                return weeklyData.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm text-gray-600">{day.day}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                        style={{ width: `${(day.xp / maxXP) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm font-semibold text-gray-900 text-right">
                      {day.xp} XP
                    </div>
                    {day.streak && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                ));
              })()}
            </div>

            <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-400/50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalWeeklyXp.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Week Total</p>
                </div>
                <div className="border-x border-blue-400/80">
                  <p className="text-2xl font-bold text-gray-900">{Math.round(totalWeeklyXp / 7)}</p>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Daily Avg</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{weeklyData.filter(d => d.xp > 0).length}</p>
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Active Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Streak Calendar */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Learning Streak</h2>
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>

            <div className="hidden sm:block">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="text-center text-xs text-gray-500 font-medium p-2">
                    {day}
                  </div>
                ))}
                {calendarPadding.map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square" />
                ))}
                {monthlyStreak.map((day, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${day.active
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400'
                      }`}
                    title={day.active ? 'Active' : 'No activity'}
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

            {/* Mobile: Horizontal Scrollable Streak */}
            <div className="sm:hidden">
              <p className="text-xs text-gray-500 mb-3">Recent Activity (Scroll to see more)</p>
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {monthlyStreak.slice(-14).map((day, index) => ( // Show last 14 days
                  <div
                    key={index}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 ${day.active
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-white border-gray-100 text-gray-300'
                      }`}
                  >
                    {day.date}
                  </div>
                ))}
              </div>
              <div className="text-center text-sm font-medium text-gray-600">
                {user.dailyStreak} Day Streak 🔥
              </div>
            </div>
          </div>
        </div>

        {/* Subject-wise Accuracy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Subject-wise Performance</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { subject: 'Audit', accuracy: accuracyData.audit, color: 'blue' },
              { subject: 'Tax', accuracy: accuracyData.tax, color: 'green', locked: true },
              { subject: 'Case Law', accuracy: accuracyData.caselaw, color: 'purple', locked: true },
            ].map((item) => (
              <React.Fragment key={item.subject}>
                {/* Desktop: Donut Chart */}
                <div className="text-center hidden md:block">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {item.locked ? (
                      <div className="w-full h-full rounded-full border-4 border-gray-100 flex items-center justify-center bg-gray-50">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                    ) : (
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
                    )}
                    {!item.locked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">{item.accuracy}%</span>
                      </div>
                    )}
                  </div>
                  <h3 className={`font-semibold ${item.locked ? 'text-gray-400' : 'text-gray-900'}`}>{item.subject}</h3>
                  <p className="text-sm text-gray-500">{item.locked ? 'Coming Soon' : 'Accuracy Rate'}</p>
                </div>
                {/* Mobile: Linear Progress Bar */}
                <div id={item.subject + '-mobile'} className="md:hidden block w-full mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold ${item.locked ? 'text-gray-400' : 'text-gray-900'}`}>{item.subject}</span>
                    <span className={`font-bold ${item.locked ? 'text-gray-400' : 'text-gray-900'}`}>
                      {item.locked ? 'Locked' : `${item.accuracy}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.locked ? 'bg-gray-200' : (item.color === 'blue' ? 'bg-blue-500' : item.color === 'green' ? 'bg-green-500' : 'bg-purple-500')}`}
                      style={{ width: item.locked ? '100%' : `${item.accuracy}%` }}
                    />
                  </div>
                </div>
              </React.Fragment>
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
        {/* Danger Zone - Hidden Temporarily as per user request */}
        {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
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
      </div> */}
      </div>
    </div >
  );
};

export default ProgressModule;
import React, { useState, useEffect } from "react";
import { Medal, Crown, Star, Flame, Target, BookOpen } from "lucide-react";
import { db } from "../../lib/database";

// --- Types ---
interface Badges {
  id: string;
  name: string;
  icon: string;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  xp: number;
  badges: Badges[];
  streak: number;
  simulations: number;
  accuracy: number;
  avatar?: string;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const rawData: any[] = await db.getLeaderboard();

        // Normalize Data
        const normalized = rawData.map((d: any, index: number) => {
          return {
            rank: index + 1,
            id: d.userId || d.id,
            name: d.name || "Anonymous",
            xp: d.xp || 0,
            badges: d.badges || [],
            streak: d.streak || 0,
            simulations: d.simulations || 0,
            accuracy: d.accuracy || 0,
            avatar: d.avatar,
          };
        });

        if (mounted) {
          setUsers(normalized);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load leaderboard", err);
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6 lg:p-8 space-y-8 font-sans">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Global Leaderboard</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Top performers in the finance community.</p>
        </div>
      </div>

      {/* --- Podium Section (Top 3) - Compact Size --- */}
      {!loading && topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-8 md:mb-10 max-w-4xl mx-auto">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1">
            <PodiumCard user={topThree[1]} rank={2} color="bg-slate-300" iconColor="text-slate-400" />
          </div>

          {/* Rank 1 (Gold) - Center & Taller */}
          <div className="order-1 md:order-2 md:-mt-8 z-10 scale-110">
            <PodiumCard user={topThree[0]} rank={1} isWinner={true} color="bg-yellow-400" iconColor="text-yellow-500" />
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 md:order-3">
            <PodiumCard user={topThree[2]} rank={3} color="bg-orange-300" iconColor="text-orange-400" />
          </div>
        </div>
      )}

      {/* --- Loading State --- */}
      {loading && (
        <div className="text-center py-20 text-gray-400 animate-pulse">
          Loading global rankings...
        </div>
      )}

      {/* --- The List (Rank 4+) --- */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-7xl mx-auto">

          {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">#</th>
                  <th className="py-4 px-6 w-1/4">Learner</th>
                  <th className="py-4 px-6 text-center">Badges</th>
                  <th className="py-4 px-6 text-center">Accuracy</th>
                  <th className="py-4 px-6 text-center">Simulations</th>
                  <th className="py-4 px-6 text-center">Streak</th>
                  <th className="py-4 px-6 text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {restOfUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors group cursor-default"
                  >
                    <td className="py-3 px-6 text-center font-medium text-gray-400 group-hover:text-indigo-600">
                      {user.rank}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase border border-indigo-200">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full text-xs font-medium">
                        <Medal className="h-3 w-3" />
                        {user.badges.length}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="inline-flex items-center gap-1 text-gray-600 text-sm font-medium">
                        <Target className="h-3.5 w-3.5 text-blue-500" />
                        {user.accuracy}%
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="inline-flex items-center gap-1 text-gray-600 text-sm font-medium">
                        <BookOpen className="h-3.5 w-3.5 text-purple-500" />
                        {user.simulations}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="inline-flex items-center gap-1 text-gray-600 text-sm font-medium">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        {user.streak} days
                      </div>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <span className="font-bold text-gray-900">{user.xp.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-1">XP</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW (Visible only on Mobile) */}
          <div className="md:hidden divide-y divide-gray-50">
            {restOfUsers.map((user) => (
              <div key={user.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  {/* Left: Rank & User */}
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-gray-400 w-6 text-center">
                      #{user.rank}
                    </div>
                    <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase shadow-sm border border-indigo-100">
                      {user.name.charAt(0)}
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">{user.name}</div>
                  </div>

                  {/* Right: XP */}
                  <div className="text-right">
                    <span className="block font-bold text-gray-900 text-sm">{user.xp.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 font-medium">XP</span>
                  </div>
                </div>

                {/* Sub-stats row on mobile */}
                <div className="flex items-center justify-between pl-10 pr-2">
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                    <Medal className="w-3 h-3 text-orange-500" />
                    {user.badges.length} Badges
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    <Target className="w-3 h-3 text-blue-500" />
                    {user.accuracy}% Acc
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                    <Flame className="w-3 h-3 text-purple-500" />
                    {user.streak} Day Streak
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Podium Card (REFINED & SMALLER) ---
const PodiumCard = ({ user, rank, isWinner = false, color, iconColor }: { user?: LeaderboardUser; rank: number; isWinner?: boolean; color: string; iconColor: string }) => {
  if (!user) return <div className="hidden md:block h-full opacity-0"></div>;

  return (
    <div className={`relative flex flex-col items-center p-4 rounded-2xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300 ${isWinner ? 'ring-2 ring-indigo-50 shadow-indigo-100' : ''}`}>
      {/* Rank Badge for Mobile */}
      <div className="absolute top-3 left-3 text-[10px] font-bold text-gray-300 md:hidden">#{rank}</div>

      {/* Crown Icon for #1 */}
      {isWinner && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <Crown className="h-8 w-8 text-yellow-500 fill-yellow-400 animate-bounce" />
        </div>
      )}

      {/* Avatar Circle - Reduced Size */}
      <div className={`relative mb-3 ${isWinner ? 'h-16 w-16' : 'h-12 w-12'}`}>
        <div className={`absolute inset-0 rounded-full opacity-20 ${color}`}></div>
        <div className="absolute inset-0 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-lg font-bold text-gray-700 uppercase">
          {user.name.charAt(0)}
        </div>
        {/* Rank Badge */}
        <div className={`absolute -bottom-1.5 inset-x-0 mx-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm border-2 border-white ${isWinner ? 'bg-yellow-400' : rank === 2 ? 'bg-slate-400' : 'bg-orange-400'}`}>
          {rank}
        </div>
      </div>

      {/* Info - Compact Text */}
      <div className="text-center w-full">
        <h3 className={`font-bold text-gray-900 truncate px-2 ${isWinner ? 'text-sm' : 'text-xs'}`}>{user.name}</h3>

        {/* Stats Grid for Podium */}
        <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100/50">
          <div className="flex flex-col items-center">
            <span className="font-bold text-indigo-600">{user.accuracy}%</span>
            <span className="text-[9px] uppercase tracking-wide opacity-70">Acc</span>
          </div>
          <div className="flex flex-col items-center border-l border-gray-200 pl-1">
            <span className="font-bold text-orange-600">{user.badges.length}</span>
            <span className="text-[9px] uppercase tracking-wide opacity-70">Badges</span>
          </div>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
          <Star className={`h-3 w-3 ${iconColor} fill-current`} />
          <span className="font-bold text-gray-700 text-xs">{user.xp.toLocaleString()} XP</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

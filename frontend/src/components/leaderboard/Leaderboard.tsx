// src/components/leaderboard/Leaderboard.tsx
// Phase 1 Migration: Safe Leaderboard
// Uses the data-layer abstraction to fetch leaderboard data.
// Handles both Mock (Phase 1) and Real (Phase 2+) data shapes gracefully.

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Crown, TrendingUp, Award, ChevronDown } from 'lucide-react';
import { db } from '../../lib/database';


// Normalized Interface for View Layer
interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  avatarUrl?: string;
  badges?: any[];
  rank?: number;
}

// Mock Data for Rising Talents (Static UI Feature) -> REMOVED per requirements
const mockRisingTalents: any[] = [];

import { useXP } from '../../_xp/xp-context';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { xp: currentXp } = useXP(); // Decoupled from leaderboard fetch, used for display only
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // Fetch via safe DB wrapper which now hits /api/leaderboard
        const data: any[] = await db.getLeaderboard();

        // Normalize Data from Backend { rank, userId, name, xp, level }
        const normalized = data.map((d: any) => ({
          id: d.userId || d.id || 'unknown',
          username: d.name || d.username || 'Anonymous',
          xp: d.xp || 0,
          avatarUrl: '', // Backend doesn't send avatar yet
          badges: d.badges || [], // Now receiving badges from backend
          rank: d.rank
        }));

        if (mounted) {
          setLeaderboardData(normalized);
          setLoading(false);
        }
      } catch (err) {
        console.error('Leaderboard fetch failed', err);
        if (mounted) {
          setLeaderboardData([]);
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []); // Run ONCE on mount, do not depend on user/xp

  const topThree = leaderboardData.slice(0, 3);
  const rank1 = topThree[0];
  const rank2 = topThree[1];
  const rank3 = topThree[2];

  // Helper for UI demo
  const getSpecialty = (index: number) => {
    const specialties = ["Audit Master", "Tax Expert", "GST Specialist", "Law Wielder", "Compliance Pro"];
    return specialties[index % specialties.length];
  };

  const getBadgesCount = (index: number) => {
    return leaderboardData[index]?.badges?.length || 0;
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500 font-medium">Loading Leaderboard...</div>;
  }

  return (
    <div className="min-h-full bg-[#F8F9FA] p-4 lg:p-6 space-y-6 font-sans">

      {/* 1. Brand Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0052D4] via-[#4364F7] to-[#6FB1FC] p-6 lg:p-10 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-yellow-300 fill-current" />
              <h1 className="text-3xl font-bold tracking-tight">Global Leaderboard</h1>
            </div>
            <p className="text-blue-100 max-w-lg text-sm lg:text-base opacity-90">
              Compete with finance learners worldwide and climb to the top.
            </p>
          </div>

          {/* Your Rank Card */}
          {user && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[160px] text-center">
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Your XP</p>
              <div className="text-4xl font-extrabold text-white mb-1">{currentXp.toLocaleString()}</div>
              <div className="inline-block bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">
                Rank #{leaderboardData.findIndex(u => u.id === user.id) + 1 || '-'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Split Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Top Performers (Podium) - Span 2 */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-8">Top Performers</h2>

          <div className="flex justify-center items-end h-[300px] gap-4 md:gap-12 pb-4">

            {/* Rank 2 (Left) */}
            <div className="flex flex-col items-center group w-24 md:w-32">
              {rank2 ? (
                <>
                  <div className="relative mb-3">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-gray-600 font-bold overflow-hidden shadow-sm">
                      {rank2.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-2 inset-x-0 mx-auto w-6 h-6 bg-gray-500 text-white text-xs flex items-center justify-center rounded-full font-bold border-2 border-white">2</div>
                  </div>
                  <div className="text-center mb-2">
                    <div className="font-bold text-gray-800 text-sm truncate w-full">{rank2.username}</div>
                    <div className="text-xs text-blue-600 font-bold">{rank2.xp.toLocaleString()} XP</div>
                  </div>
                </>
              ) : <div className="h-16 w-16 opacity-0" />}
              <div className="w-full bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg h-[140px] opacity-80 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Rank 1 (Center) */}
            <div className="flex flex-col items-center group w-20 md:w-28 z-10">
              {rank1 ? (
                <>
                  <div className="relative mb-4">
                    <Crown className="absolute -top-8 left-0 right-0 mx-auto text-yellow-500 w-8 h-8 fill-yellow-400 animate-bounce" />
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-yellow-100 border-[3px] border-yellow-400 flex items-center justify-center text-yellow-700 font-bold overflow-hidden shadow-md">
                      {rank1.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-3 inset-x-0 mx-auto w-8 h-8 bg-yellow-500 text-white text-sm flex items-center justify-center rounded-full font-black border-2 border-white">1</div>
                  </div>
                  <div className="text-center mb-2">
                    <div className="font-bold text-gray-900 text-base truncate w-full">{rank1.username}</div>
                    <div className="text-sm text-blue-600 font-bold">{rank1.xp.toLocaleString()} XP</div>
                  </div>
                </>
              ) : <div className="h-24 w-24 opacity-0" />}
              <div className="w-full bg-gradient-to-t from-yellow-300 to-yellow-200 rounded-t-lg h-[180px] shadow-lg"></div>
            </div>

            {/* Rank 3 (Right) */}
            <div className="flex flex-col items-center group w-24 md:w-32">
              {rank3 ? (
                <>
                  <div className="relative mb-3">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center text-orange-600 font-bold overflow-hidden shadow-sm">
                      {rank3.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-2 inset-x-0 mx-auto w-6 h-6 bg-orange-500 text-white text-xs flex items-center justify-center rounded-full font-bold border-2 border-white">3</div>
                  </div>
                  <div className="text-center mb-2">
                    <div className="font-bold text-gray-800 text-sm truncate w-full">{rank3.username}</div>
                    <div className="text-xs text-blue-600 font-bold">{rank3.xp.toLocaleString()} XP</div>
                  </div>
                </>
              ) : <div className="h-16 w-16 opacity-0" />}
              <div className="w-full bg-gradient-to-t from-orange-300 to-orange-200 rounded-t-lg h-[110px] opacity-80 group-hover:opacity-100 transition-opacity"></div>
            </div>

          </div>
        </div>

        {/* Right: Rising Talents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">Rising Talents</h2>
          </div>

          <div className="space-y-6 flex-1">
            {mockRisingTalents.map((talent, i) => (
              <div key={i} className="flex items-start gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                <div className={`w-10 h-10 rounded-full ${talent.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                  {talent.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-sm">{talent.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{talent.xpChange} XP</span>
                    <span className="text-[10px] text-gray-400">Jumped {talent.rankJump} ranks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Global Leaderboard - Mobile Cards (< 640px) */}
      <div className="sm:hidden space-y-3">
        {leaderboardData.map((entry, index) => {
          const rank = index + 1;
          const isCurrentUser = user && (user.id === entry.id || user.name === entry.username);
          return (
            <div key={entry.id || index} className={`bg-white rounded-xl p-4 shadow-sm border ${isCurrentUser ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm ${rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                  rank === 2 ? 'bg-gray-100 text-gray-700' :
                    rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-600'
                  }`}>
                  #{rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{entry.username}</h3>
                    {isCurrentUser && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">YOU</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{entry.badges?.length || 0} Badges</span>
                    <span>•</span>
                    <span className="text-gray-400">{getSpecialty(index)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block font-bold text-blue-600">{entry.xp.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 font-medium">XP</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Global Leaderboard Table - Tablet/Desktop (> 640px) */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Global Leaderboard</h2>
          <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-blue-100 transition-colors">
            Top 100 <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                <th className="px-6 py-4 w-20 text-center">Rank</th>
                <th className="px-6 py-4">Learner</th>
                <th className="px-6 py-4 text-right">XP</th>
                <th className="px-6 py-4 text-center">Badges</th>
                <th className="px-6 py-4 text-right">Specialty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {leaderboardData.map((entry, index) => {
                const rank = index + 1;
                // Highlight logic: Match Clerk ID OR Match Name (for Mock Mode)
                const isCurrentUser = user && (user.id === entry.id || user.name === entry.username);

                // Rank Icon Logic
                let rankIcon = null;
                if (rank === 1) rankIcon = <Award className="w-5 h-5 text-yellow-500 fill-current" />;
                if (rank === 2) rankIcon = <Award className="w-5 h-5 text-gray-400 fill-current" />;
                if (rank === 3) rankIcon = <Award className="w-5 h-5 text-orange-400 fill-current" />;

                return (
                  <tr key={entry.id || index} className={`hover:bg-blue-50/30 transition-colors group ${isCurrentUser ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4 text-center font-bold text-gray-500">
                      {rankIcon ? <div className="flex justify-center">{rankIcon}</div> : `#${rank}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-gray-100 ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}`}>
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{entry.username}</div>
                          {isCurrentUser && <div className="text-[10px] text-blue-600 font-bold uppercase">You</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">
                      {entry.xp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-100">
                        {getBadgesCount(index)} badges
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 font-medium">
                      {getSpecialty(index)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Leaderboard;

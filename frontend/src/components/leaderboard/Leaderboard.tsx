import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, TrendingUp, Shield, Star, Search } from "lucide-react";
import { db } from "../../lib/database"; // Using existing DB abstraction

// --- Types ---
interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  xp: number;
  badges: number;
  specialty: string;
  avatar?: string;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch Data
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const rawData: any[] = await db.getLeaderboard();

        // Normalize Data
        const normalized = rawData.map((d: any, index: number) => {
          // Map preferredAreas to specialty or fallback
          const specialty = (d.preferredAreas && d.preferredAreas.length > 0)
            ? d.preferredAreas[0]
            : "Finance Rookie";

          return {
            rank: index + 1,
            id: d.userId || d.id,
            name: d.name || "Anonymous",
            xp: d.xp || 0,
            badges: d.badges ? d.badges.length : 0,
            specialty: specialty,
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

  // Filter Logic
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const topThree = filteredUsers.slice(0, 3);
  const restOfUsers = filteredUsers.slice(3);

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 font-sans">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Global Leaderboard</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Compete with finance learners worldwide.</p>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Find a learner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* --- Podium Section (Top 3) --- */}
      {!loading && topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-8 md:mb-12 min-h-[auto] md:min-h-[300px]">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1">
            <PodiumCard user={topThree[1]} rank={2} color="bg-slate-300" iconColor="text-slate-400" />
          </div>

          {/* Rank 1 (Gold) - Center & Taller */}
          <div className="order-1 md:order-2 md:-mt-16 z-10">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">#</th>
                  <th className="py-4 px-6">Learner</th>
                  <th className="py-4 px-6">Specialty</th>
                  <th className="py-4 px-6 text-center">Badges</th>
                  <th className="py-4 px-6 text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {restOfUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors group cursor-default"
                  >
                    <td className="py-4 px-6 text-center font-medium text-gray-400 group-hover:text-indigo-600">
                      {user.rank}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <Shield className="h-3 w-3" />
                        {user.specialty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center justify-center gap-1 text-gray-600">
                        <Medal className="h-4 w-4 text-orange-400" />
                        <span className="text-sm">{user.badges}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
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
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="text-sm font-bold text-gray-400 w-6 text-center">
                    #{user.rank}
                  </div>

                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm uppercase shadow-sm border border-indigo-100">
                    {user.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{user.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium border border-indigo-100">
                        {user.specialty}
                      </span>
                      <span className="flex items-center text-[10px] text-gray-500">
                        <Medal className="w-3 h-3 text-orange-400 mr-0.5" />
                        {user.badges}
                      </span>
                    </div>
                  </div>
                </div>

                {/* XP */}
                <div className="text-right">
                  <span className="block font-bold text-gray-900 text-sm">{user.xp.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 font-medium">XP</span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No learners found matching "{search}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Podium Card ---
const PodiumCard = ({ user, rank, isWinner = false, color, iconColor }: { user?: LeaderboardUser; rank: number; isWinner?: boolean; color: string; iconColor: string }) => {
  if (!user) return <div className="hidden md:block h-full opacity-0"></div>; // Hide empty placeholders on mobile

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-transform hover:-translate-y-1 duration-300 ${isWinner ? 'ring-4 ring-indigo-50 shadow-indigo-100' : ''}`}>
      <div className="absolute top-4 left-4 text-xs font-bold text-gray-300 md:hidden">#{rank}</div>

      {/* Crown Icon for #1 */}
      {isWinner && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <Crown className="h-10 w-10 text-yellow-400 fill-yellow-400 animate-bounce" />
        </div>
      )}

      {/* Avatar Circle */}
      <div className={`relative mb-4 ${isWinner ? 'h-24 w-24' : 'h-16 w-16'}`}>
        <div className={`absolute inset-0 rounded-full opacity-20 ${color}`}></div>
        <div className="absolute inset-0 rounded-full border-2 border-white shadow-sm bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-2xl font-bold text-gray-700 uppercase">
          {user.name.charAt(0)}
        </div>
        {/* Rank Badge (Desktop only or adjusted) */}
        <div className={`absolute -bottom-2 inset-x-0 mx-auto w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-sm border-2 border-white ${isWinner ? 'bg-yellow-400' : rank === 2 ? 'bg-slate-400' : 'bg-orange-400'}`}>
          {rank}
        </div>
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className={`font-bold text-gray-900 ${isWinner ? 'text-lg' : 'text-base'}`}>{user.name}</h3>
        <p className="text-xs text-indigo-600 font-medium mt-1 mb-3">{user.specialty}</p>

        <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
          <Star className={`h-4 w-4 ${iconColor} fill-current`} />
          <span className="font-bold text-gray-700 text-sm">{user.xp} XP</span>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

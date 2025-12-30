import { Target, Zap, Play } from "lucide-react";

interface User {
    id: string;
    name: string;
    xp: number;
    rank: number;
    avatar?: string;
}

export const RivalCard = ({
    currentUser,
    rival,
    setActiveTab
}: {
    currentUser: User;
    rival: User;
    setActiveTab?: (tab: string) => void
}) => {
    if (!rival) return null;

    const xpGap = rival.xp - currentUser.xp;
    const progressPercent = Math.min(100, (currentUser.xp / rival.xp) * 100);

    return (
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-white/50 shadow-sm relative overflow-hidden group transition-all h-[70px] flex items-center px-4 gap-6">
            {/* Motivational Label - Compact */}
            <div className="flex items-center gap-2 shrink-0 border-r border-gray-100 pr-6 h-full">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="hidden md:block">
                    <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest leading-none mb-0.5">Next Goal</div>
                    <div className="text-xs font-bold text-gray-900 leading-none">Rank #{rival.rank}</div>
                </div>
            </div>

            {/* Main Mission Text - Compact */}
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
                <span className="text-xs md:text-sm font-bold text-gray-800 whitespace-nowrap">
                    Overtake <span className="text-indigo-600">{rival.name}</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 rounded text-[10px] font-bold text-indigo-600 whitespace-nowrap border border-indigo-100/50">
                    {xpGap.toLocaleString()} XP to go
                </span>
            </div>

            {/* Progress Synergy - Ultra Compact */}
            <div className="hidden lg:flex items-center gap-4 w-64 shrink-0 px-4 border-l border-gray-100 h-full">
                <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                        <span>Synergy</span>
                        <span className="text-indigo-500">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-3.5 w-full bg-gray-100/50 rounded-full overflow-hidden p-0.5 border border-gray-100 shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
                <div className="p-1.5 bg-yellow-400/10 rounded-full shrink-0">
                    <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                </div>
            </div>

            {/* CTA Button - Compact */}
            <div className="shrink-0">
                <button
                    onClick={() => setActiveTab?.('audit-arena')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-[11px] shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                    <Play className="w-3 h-3 fill-white" />
                    Close Gap
                </button>
            </div>
        </div>
    );
};
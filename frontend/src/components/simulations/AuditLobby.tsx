import React, { useState, useEffect } from 'react';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { Clock, ArrowRight, Filter, ArrowLeft, FileText, Target, AlertTriangle, Award } from 'lucide-react';
import { api } from '../../lib/api';

interface AuditCaseCard {
    id: string;
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    companyName: string;
    xpReward: number;
    tags: string[];
    timeLimit?: number;
}

interface AuditLobbyProps {
    onStartAudit: (id: string) => void;
    onBack?: () => void;
}

export const AuditLobby: React.FC<AuditLobbyProps> = ({ onStartAudit, onBack }) => {
    const { getToken } = useClerkAuth();
    const [error, setError] = useState<string | null>(null);
    const [cases, setCases] = useState<AuditCaseCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');



    useEffect(() => {
        loadCatalog();
    }, []);

    const loadCatalog = async () => {
        try {
            const token = await getToken();
            const data = await api.get<AuditCaseCard[]>('/api/audit/catalog', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCases(data);
        } catch (err: any) {
            console.error("Failed to load catalog", err);
            setError(err.message || "Failed to load audit cases");
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'Advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredCases = filter === 'All'
        ? cases
        : cases.filter(c => c.difficulty === filter);

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-transparent">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:mb-12">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm text-gray-500 hover:text-gray-900 active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="text-left">
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Audit Simulations</h1>
                        <p className="text-gray-500 font-medium max-w-xl">Practice with real-world scenarios</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm w-full lg:w-auto">
                    <div className="p-2 bg-gray-100 rounded-xl text-gray-500">
                        <Filter className="w-4 h-4" />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="flex-1 bg-transparent border-none text-sm font-bold text-gray-700 outline-none cursor-pointer pr-8 py-1 lg:min-w-[150px]"
                    >
                        <option value="All">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Scenarios...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-red-100 shadow-sm">
                    <div className="text-red-500 mb-2">
                        <AlertTriangle className="w-10 h-10 mx-auto" />
                    </div>
                    <p className="font-bold text-gray-900">Unable to load catalog</p>
                    <p className="text-sm text-gray-500 mt-1">{error}</p>
                </div>
            ) : filteredCases.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-200 shadow-sm">
                    <Target className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-900 font-bold text-lg">No simulations found</p>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-8">
                    {filteredCases.map((c) => {
                        const iconColor = c.difficulty === 'Beginner' ? 'from-green-500 to-emerald-600' :
                            c.difficulty === 'Intermediate' ? 'from-amber-400 to-amber-500' :
                                'from-red-500 to-red-600';

                        return (
                            <div key={c.id} className="group bg-white rounded-[2rem] p-6 lg:p-7 border border-gray-200/60 shadow-lg hover:shadow-2xl hover:border-blue-200/50 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col items-center text-center hover:-translate-y-1">
                                {/* Difficulty & XP Badges */}
                                <div className="w-full flex justify-between items-start mb-6 z-10">
                                    <span className={`${getDifficultyColor(c.difficulty)} text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-sm border border-current/10`}>
                                        {c.difficulty}
                                    </span>
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                        <Award className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-gray-900 text-xs font-black">{c.xpReward} XP</span>
                                    </div>
                                </div>

                                {/* Prominent Icon */}
                                <div className={`w-20 h-20 bg-gradient-to-br ${iconColor} rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-gray-200 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                    <Target className="w-9 h-9 text-white" />
                                </div>

                                <div className="flex-1 w-full space-y-2 mb-6">
                                    <h3 className="text-lg lg:text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                        {c.companyName}
                                    </h3>
                                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-2">{c.title}</p>
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 px-2">
                                        {c.description}
                                    </p>
                                </div>

                                {/* Metadata Row */}
                                <div className="w-full flex items-center justify-center gap-4 py-4 border-t border-dashed border-gray-200 mb-2">
                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <Clock className="w-3.5 h-3.5" />
                                        {c.timeLimit ? Math.ceil(c.timeLimit / 60) : 5}m
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <FileText className="w-3.5 h-3.5" />
                                        2 Docs
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <Target className="w-3.5 h-3.5" />
                                        1 Task
                                    </div>
                                </div>

                                <button
                                    onClick={() => onStartAudit(c.id)}
                                    className="w-full bg-slate-50 border border-slate-200 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
                                >
                                    Start Simulation
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

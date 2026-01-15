import React, { useState, useEffect } from 'react';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { Clock, Users, ArrowRight, Filter, ArrowLeft, FileText, Target, Star } from 'lucide-react';
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
        <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div className="text-center lg:text-left">
                        <h1 className="text-2xl lg:text-4xl font-black text-gray-900 mb-3 tracking-tight">Audit Simulations</h1>
                        <p className="text-gray-600 text-base lg:text-xl">Practice with real-world audit scenarios</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
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
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-500 bg-white rounded-xl border border-red-200">
                    <p className="font-bold">Error loading cases:</p>
                    <p>{error}</p>
                </div>
            ) : filteredCases.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-200">
                    <p>No audit cases available for this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
                    {filteredCases.map((c) => {
                        const iconColor = c.difficulty === 'Beginner' ? 'from-green-500 to-green-600' :
                            c.difficulty === 'Intermediate' ? 'from-yellow-400 to-yellow-500' :
                                'from-red-500 to-red-600';

                        return (
                            <div key={c.id} className="group bg-white rounded-3xl p-[28px] border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col items-center text-center hover:-translate-y-2">
                                {/* Difficulty & XP Badges */}
                                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                                    <span className={`${getDifficultyColor(c.difficulty)} text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-current opacity-90`}>
                                        {c.difficulty}
                                    </span>
                                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-gray-700 text-xs font-black">{c.xpReward}</span>
                                    </div>
                                </div>

                                {/* Prominent Icon */}
                                <div className={`w-[71px] h-[71px] bg-gradient-to-br ${iconColor} rounded-2xl flex items-center justify-center mb-[21px] mt-[28px] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}>
                                    <Target className="w-[34px] h-[34px] text-white" />
                                </div>

                                <div className="space-y-2 mb-[28px] flex-1">
                                    <h3 className="text-[1.1rem] lg:text-[1.32rem] font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                        {c.companyName}
                                    </h3>
                                    <p className="text-gray-1000 font-bold text-[15px] lg:text-[1.02rem] mb-1">{c.title}</p>
                                    <p className="text-gray-500 text-[12.5px] lg:text-[14.5px] leading-relaxed line-clamp-2">
                                        {c.description}
                                    </p>
                                </div>

                                {/* Metadata Row */}
                                <div className="flex items-center justify-center gap-4.5 mb-[28px] text-[10.5px] lg:text-[12.5px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {c.timeLimit ? Math.ceil(c.timeLimit / 60) : 5}m
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-3 h-3" />
                                        2 Docs
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3 h-3" />
                                        1 Tasks
                                    </div>
                                </div>

                                <button
                                    onClick={() => onStartAudit(c.id)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white py-[14px] rounded-2xl font-black text-[11px] lg:text-[12.5px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:scale-[1.02]"
                                >
                                    Start Simulation
                                    <ArrowRight className="w-3 h-3" />
                                </button>

                                {/* Subtle background decoration */}
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Target className="w-32 h-32" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

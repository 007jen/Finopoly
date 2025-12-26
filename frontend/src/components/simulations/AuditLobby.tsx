import React, { useState, useEffect } from 'react';
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { Clock, Users, Award, ArrowRight, Filter } from 'lucide-react';
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
}

export const AuditLobby: React.FC<AuditLobbyProps> = ({ onStartAudit }) => {
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Audit Simulations</h1>
                    <p className="text-gray-600">Practice with real-world audit scenarios</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {filteredCases.map((c) => (
                        <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{c.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{c.companyName}</p>
                                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed line-clamp-2 h-10">{c.description}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(c.difficulty)}`}>
                                    {c.difficulty}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-6 mb-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {c.timeLimit ? Math.ceil(c.timeLimit / 60) : 5} mins
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    1 tasks
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    {c.xpReward} XP
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="text-sm text-gray-500">
                                    {/* Usually we have docs count, using static for now or can add to API */}
                                    2 documents provided
                                </div>
                                <button
                                    onClick={() => onStartAudit(c.id)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105 w-full sm:w-auto justify-center"
                                >
                                    Start Simulation
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

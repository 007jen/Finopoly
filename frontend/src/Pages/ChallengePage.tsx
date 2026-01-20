import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { ContextPanel } from '../components/Challenges/ContextPanel';
import { ActionPanel } from '../components/Challenges/ActionPanel';

export const ChallengePage = ({ id, onBack, onNext }: { id?: string, onBack?: () => void, onNext?: (nextId: string) => void }) => {
    // We favor the prop 'id' over useParams because App.tsx uses state-based navigation
    const { id: paramId } = useParams();
    const challengeId = id || paramId;

    const [challenge, setChallenge] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (challengeId) {
            loadChallenge();
        }
    }, [challengeId]);

    const loadChallenge = async () => {
        try {
            const data = await api.get(`/api/challenges/${challengeId}`);
            setChallenge(data);
        } catch (err) {
            console.error("Failed to load challenge", err);
        } finally {
            setLoading(false);
        }
    };

    // Callback when ActionPanel unlocks the video
    const handleUnlock = (videoUrl: string) => {
        setChallenge((prev: any) => ({
            ...prev,
            videoUrl, // Update the hidden URL
            userStatus: { ...prev.userStatus, unlocked: true }
        }));
    };

    if (loading) return <div className="p-10 text-center">Loading Data Drill...</div>;
    if (!challenge) return <div className="p-10 text-center text-red-500">Drill not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Minimal Sub-header with Back Button */}
            <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors font-medium text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back to Drills</span><span className="sm:hidden">Back</span>
                </button>
                <div className="text-[10px] sm:text-sm text-gray-400 font-black uppercase tracking-widest">Drill #{challengeId?.split('-').pop()}</div>
            </div>

            <div className="flex-1 p-4 lg:p-10 overflow-y-auto">
                <div className="max-w-4xl mx-auto flex flex-col gap-8">
                    {/* Top Section: Context & Chart */}
                    <div className="w-full">
                        <ContextPanel challenge={challenge} />
                    </div>

                    {/* Bottom Section: Analysis & Verification */}
                    <div className="w-full">
                        <ActionPanel challenge={challenge} onUpdate={handleUnlock} />
                    </div>

                    {/* Next Drill Footer */}
                    <div className="flex justify-end pt-10 border-t border-gray-100 mb-20">
                        {challenge.nextChallengeSlug ? (
                            <button
                                onClick={() => {
                                    if (onNext) {
                                        onNext(challenge.nextChallengeSlug);
                                    }
                                }}
                                className="flex items-center gap-2 font-black text-gray-400 hover:text-teal-600 transition-all group"
                            >
                                Next drill <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <div className="text-gray-300 text-xs font-bold uppercase tracking-widest">
                                End of Series
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

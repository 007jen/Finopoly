import { useState } from 'react';
import { useAccuracy } from '../../_accuracy/accuracy-context';
import { Lock, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api'; // Your API helper
import { xpService } from '../../_xp/xp-service';

interface ChallengeResponse {
    success: boolean;
    message: string;
    videoUrl?: string;
    xpAwarded?: number;
}

export const ActionPanel = ({ challenge, onUpdate }: any) => {
    const { incrementCorrect, incrementTotal } = useAccuracy();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const isUnlocked = challenge.userStatus?.unlocked;

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post<ChallengeResponse>(`/api/challenges/${challenge.id}/submit`, { answer: input });
            if (res.success) {
                setSuccessMsg(res.message);

                // ⚡ LIVE XP SYNC (Local Only)
                // We use localOnly: true because the backend verify endpoint already awarded XP to the DB.
                // This triggers the XP bar to slide upward instantly.
                xpService.increment(challenge.xpReward || 150, `Drill: ${challenge.title}`, true);

                onUpdate(res.videoUrl); // Pass the video URL back up to parent
                incrementCorrect(true); // 🎯 Accuracy Sync (Local Only)
            } else {
                setError(res.message); // "Incorrect, check your math"
                incrementTotal(true); // 🎯 Accuracy Sync (Local Only)
            }
        } catch (err) {
            setError("Failed to verify answer");
        } finally {
            setLoading(false);
        }
    };

    const handleSurrender = async () => {
        if (!window.confirm("Give up? You will see the solution but earn 0 XP.")) return;
        try {
            const res = await api.post<ChallengeResponse>(`/api/challenges/${challenge.id}/surrender`, {});
            onUpdate(res.videoUrl);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col gap-8 lg:gap-12 mt-8 lg:mt-12 mb-20">
            {/* 1. The Question Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6 lg:p-10 text-center">
                <h3 className="text-xl lg:text-2xl font-black text-gray-900 mb-4 lg:mb-6 tracking-tight">
                    Submit your solution
                </h3>
                <p className="text-gray-600 mb-6 lg:mb-8 max-w-lg mx-auto leading-relaxed text-sm lg:text-base">
                    {challenge.question}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto items-stretch">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isUnlocked}
                        placeholder="Answer..."
                        className="flex-1 min-w-0 border-2 border-gray-100 rounded-xl px-4 lg:px-6 py-3 lg:py-4 focus:border-teal-500 focus:ring-0 outline-none transition-all text-center text-base lg:text-lg font-bold disabled:bg-gray-50 bg-gray-50/30"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || isUnlocked || !input}
                        className={`px-6 lg:px-10 py-3 lg:py-4 rounded-xl font-black text-white transition-all transform active:scale-95 shadow-md ${isUnlocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900 hover:shadow-xl'
                            }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : isUnlocked ? 'Solved' : 'Submit'}
                    </button>
                </div>

                {/* Feedback Messages */}
                {error && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-red-600 font-bold bg-red-50 p-4 rounded-xl animate-shake">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}
                {(successMsg || isUnlocked) && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-teal-700 font-bold bg-teal-50 p-4 rounded-xl">
                        <CheckCircle className="w-5 h-5" />
                        {successMsg || "Verified! Tutorial unlocked below."}
                    </div>
                )}
            </div>

            {/* 2. The Video Reward */}
            <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">
                    Watch the solution video & tutorial
                </h3>
                <div className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all border-4 ${isUnlocked ? 'border-teal-500' : 'border-gray-100'}`}>
                    {isUnlocked && challenge.videoUrl ? (
                        <div className="aspect-video">
                            <iframe
                                src={challenge.videoUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center p-12 group">
                            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-teal-500/20 transition-all backdrop-blur-sm">
                                <Lock className="w-10 h-10 text-white/50 group-hover:text-teal-400" />
                            </div>
                            <button
                                onClick={handleSurrender}
                                className="flex items-center gap-3 bg-gradient-to-r from-teal-400 to-yellow-200 text-gray-950 px-8 py-3 rounded-full font-black hover:scale-105 transition-all shadow-lg"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                Watch solution video
                            </button>
                            <p className="mt-6 text-xs text-gray-500 uppercase tracking-widest font-bold">
                                Solve correctly to earn {challenge.xpReward} XP
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
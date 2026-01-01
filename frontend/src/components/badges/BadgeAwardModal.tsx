import React, { useEffect, useState } from 'react';
import { Award, Star, X, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedDate?: string;
}

interface BadgeAwardModalProps {
    badges: Badge[];
    onClose: () => void;
}

const BadgeAwardModal: React.FC<BadgeAwardModalProps> = ({ badges, onClose }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const badge = badges[currentIdx];

    useEffect(() => {
        setIsVisible(true);
        // Trigger a celebratory confetti burst for the badge
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, [currentIdx]);

    const handleNext = () => {
        if (currentIdx < badges.length - 1) {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIdx(currentIdx + 1);
            }, 300);
        } else {
            onClose();
        }
    };

    if (!badge) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transition-all duration-500 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                {/* Header Decoration */}
                <div className="h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-4 animate-bounce">
                        <Award className="w-12 h-12 text-white" />
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 pt-10 pb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-black uppercase tracking-widest mb-4">
                        <Star className="w-3 h-3 fill-current" />
                        Achievement Unlocked
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                        {badge.name}
                    </h2>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {badge.description}
                    </p>

                    <button
                        onClick={handleNext}
                        className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group shadow-lg active:scale-95"
                    >
                        <CheckCircle className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                        {currentIdx < badges.length - 1 ? 'Next Badge' : 'Keep Learning'}
                    </button>

                    {badges.length > 1 && (
                        <p className="mt-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
                            {currentIdx + 1} of {badges.length} Badges
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BadgeAwardModal;

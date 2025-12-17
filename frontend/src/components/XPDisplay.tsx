// src/components/XPDisplay.tsx
// Phase 1 Migration: Reactive XP Display
// Replaced DOM-based updates with React state from AuthContext.
// This ensures XP updates automatically when user state changes.

import React from 'react';
import { useAuth } from '../context/AuthContext';

const XPDisplay: React.FC = () => {
    const { user, loading } = useAuth();

    // Use safe fallback 0 if user is not fully loaded/auth'd yet
    const xp = user?.xp || 0;

    if (loading) {
        return (
            <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 shadow-lg opacity-70">
                <span className="text-yellow-400 mr-2 text-xl">⭐</span>
                <span className="text-white font-bold text-lg font-mono">...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 shadow-lg transition-transform hover:scale-105 duration-200">
            <span className="text-yellow-400 mr-2 text-xl">⭐</span>
            <span className="text-white font-bold text-lg font-mono">
                XP: <span className="text-yellow-200">{xp.toLocaleString()}</span>
            </span>
        </div>
    );
};

export default XPDisplay;


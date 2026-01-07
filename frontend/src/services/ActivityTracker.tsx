import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface ActivityTrackerContextType {
    activeSeconds: number;
    isDormant: boolean;
}

const ActivityTrackerContext = createContext<ActivityTrackerContextType | undefined>(undefined);

export const useActivityTracker = () => {
    const context = useContext(ActivityTrackerContext);
    if (!context) {
        throw new Error('useActivityTracker must be used within an ActivityTrackerProvider');
    }
    return context;
};

// Threshold for dormancy (2 minutes)
const DORMANCY_THRESHOLD = 2 * 60 * 1000;
// Sync interval (30 seconds for better precision and responsiveness)
const SYNC_INTERVAL = 30 * 1000;

interface ActivityTrackerProviderProps {
    children: React.ReactNode;
    activeTab: string;
}

export const ActivityTrackerProvider: React.FC<ActivityTrackerProviderProps> = ({ children, activeTab }) => {
    const { isAuthenticated } = useAuth();
    const [activeSeconds, setActiveSeconds] = useState(0);
    const [isDormant, setIsDormant] = useState(false);

    const lastInteractionRef = useRef<number>(Date.now());
    const lastCoordsRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pendingSecondsRef = useRef<number>(0);

    // Productive zones where tracking is active
    const PRODUCTIVE_ZONES = [
        'audit-arena',
        'tax-simulation',
        'quiz-arena',
        'caselaw-simulation',
        'caselaw-explorer',
        'community',
        'challenge-detail'
    ];

    const handleInteraction = (e: Event) => {
        if (e.type === 'mousemove') {
            const me = e as MouseEvent;
            if (me.clientX === lastCoordsRef.current.x && me.clientY === lastCoordsRef.current.y) {
                return; // Ignore ghost mousemove (often caused by UI animations moving under the cursor)
            }
            lastCoordsRef.current = { x: me.clientX, y: me.clientY };
        }

        lastInteractionRef.current = Date.now();
        if (isDormant) {
            setIsDormant(false);
            console.log('[ActivityTracker] Waking up...');
        }
    };

    /* 
    useEffect(() => {
        if (!isAuthenticated) return;

        const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => window.addEventListener(event, handleInteraction));

        // Per-second tick to accumulate time if not dormant and in productive zone
        timerRef.current = setInterval(() => {
            const now = Date.now();
            const timeSinceLastInteraction = now - lastInteractionRef.current;

            const isCurrentlyProductive = PRODUCTIVE_ZONES.includes(activeTab);
            const isCurrentlyDormant = timeSinceLastInteraction > DORMANCY_THRESHOLD;

            if (isCurrentlyDormant !== isDormant) {
                setIsDormant(isCurrentlyDormant);
                if (isCurrentlyDormant) console.log('[ActivityTracker] Going to sleep...');
            }

            if (!isCurrentlyDormant && isCurrentlyProductive) {
                pendingSecondsRef.current += 1;
                setActiveSeconds(prev => prev + 1);
            }
        }, 1000);

        // Sync to backend every sync interval
        syncTimerRef.current = setInterval(async () => {
            if (pendingSecondsRef.current > 0) {
                const secondsToSync = pendingSecondsRef.current;
                pendingSecondsRef.current = 0; // Reset early to avoid double counting

                try {
                    await api.post('/api/progress/activity', { seconds: secondsToSync });
                    console.log(`[ActivityTracker] Synced ${secondsToSync}s to backend`);
                } catch (err) {
                    console.error('[ActivityTracker] Failed to sync activity:', err);
                    pendingSecondsRef.current += secondsToSync; // Put it back to retry
                }
            }
        }, SYNC_INTERVAL);

        return () => {
            events.forEach(event => window.removeEventListener(event, handleInteraction));
            if (timerRef.current) clearInterval(timerRef.current);
            if (syncTimerRef.current) clearInterval(syncTimerRef.current);
        };
    }, [isAuthenticated, activeTab, isDormant]);
    */

    // Last-gasp sync on tab close
    /* 
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (pendingSecondsRef.current > 0) {
                // navigator.sendBeacon is better for unload events
                const data = JSON.stringify({ seconds: pendingSecondsRef.current });
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon('/api/progress/activity', blob);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);
    */

    return (
        <ActivityTrackerContext.Provider value={{ activeSeconds, isDormant }}>
            {children}
        </ActivityTrackerContext.Provider>
    );
};

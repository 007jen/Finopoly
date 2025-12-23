import React, { useReducer, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react'; // Import Clerk hook
import { XPContext } from './xp-context';
import { xpReducer, INITIAL_STATE } from './xp-reducer';
import { XP_EVENT_NAME, XP_RESET_EVENT_NAME, xpService } from './xp-service'; // Import xpService
import { startXPObserver, updateAllXPElements } from './xp-dom-binding';

const STORAGE_KEY = 'global_xp_v1';

export const XPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { getToken } = useAuth(); // Get getToken from Clerk

    // Initialize Global Service with Token Getter
    useEffect(() => {
        xpService.setTokenGetter(getToken);
    }, [getToken]);

    // 1. Initialize State
    const [state, dispatch] = useReducer(xpReducer, INITIAL_STATE, (initial) => {
        // ... existing initialization logic
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return { ...initial, ...parsed };
                }
            } catch (e) {
                console.error('Failed to load XP', e);
            }
        }
        return initial;
    });

    const stateRef = useRef(state);

    // Keep ref synced for the observer closure
    useEffect(() => {
        stateRef.current = state;
        // Update DOM whenever state changes
        updateAllXPElements(state);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // 2. Setup DOM Observer
    useEffect(() => {
        const observer = startXPObserver(() => stateRef.current);

        // Initial update
        updateAllXPElements(stateRef.current);

        return () => observer.disconnect();
    }, []);

    // 3. Listen for Service Events (xpService.increment and reset)
    useEffect(() => {
        const handleXPEvent = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            dispatch({
                type: 'INCREMENT_XP',
                payload: { amount: detail.amount, source: detail.source }
            });
        };

        const handleResetEvent = () => {
            dispatch({ type: 'RESET_XP' });
        };

        window.addEventListener(XP_EVENT_NAME, handleXPEvent);
        window.addEventListener(XP_RESET_EVENT_NAME, handleResetEvent);

        return () => {
            window.removeEventListener(XP_EVENT_NAME, handleXPEvent);
            window.removeEventListener(XP_RESET_EVENT_NAME, handleResetEvent);
        };
    }, []);

    // 4. Sync across tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    const remoteState = JSON.parse(e.newValue);
                    // We can just set the whole state
                    // Note: This might overwrite local pending changes if race condition, 
                    // but for XP usually last-write-wins is okay or we accept the specific update.
                    // We don't have a 'SET_STATE' action, but 'SET_XP' is close enough if we trust the level calc, 
                    // OR we can add a replacements action.
                    // Let's use SET_XP to ensure level integrity.
                    dispatch({ type: 'SET_XP', payload: { xp: remoteState.xp } });
                } catch (err) {
                    console.error('Storage sync error', err);
                }
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Context Values
    const addXP = (amount: number, source?: string) => {
        dispatch({ type: 'INCREMENT_XP', payload: { amount, source } });
    };

    const resetXP = () => {
        dispatch({ type: 'RESET_XP' });
    };

    return (
        <XPContext.Provider value={{ ...state, addXP, resetXP }}>
            {children}
        </XPContext.Provider>
    );
};

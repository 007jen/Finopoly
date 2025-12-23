import React, { useReducer, useEffect, useRef } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react'; // Rename Clerk hook
import { useAuth } from '../context/AuthContext'; // Import Custom Auth Context
import { XPContext } from './xp-context';
import { xpReducer, INITIAL_STATE } from './xp-reducer';
import { XP_EVENT_NAME, XP_RESET_EVENT_NAME, xpService } from './xp-service';
import { startXPObserver, updateAllXPElements } from './xp-dom-binding';

export const XPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { getToken } = useClerkAuth(); // Get getToken from Clerk
    const { user } = useAuth(); // Get rich user object from our context

    // Initialize Global Service with Token Getter
    useEffect(() => {
        xpService.setTokenGetter(getToken);
    }, [getToken]);

    // 1. Initialize State - START FRESH (No localStorage)
    // The state is effectively ephemeral and re-hydrated from AuthContext.
    const [state, dispatch] = useReducer(xpReducer, INITIAL_STATE);

    const stateRef = useRef(state);

    // Keep ref synced for the observer closure
    useEffect(() => {
        stateRef.current = state;
        // Update DOM whenever state changes
        updateAllXPElements(state);
        // data-xp-display attributes will be updated here.
    }, [state]);

    // 2. Setup DOM Observer
    useEffect(() => {
        const observer = startXPObserver(() => stateRef.current);
        updateAllXPElements(stateRef.current);
        return () => observer.disconnect();
    }, []);

    // 3. Listen for Service Events (xpService.increment and reset)
    // These events are usually fired by optimistic UI updates or quizzes.
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

    // 4. Sync with AuthContext user data (The Source of Truth)
    useEffect(() => {
        if (user) {
            // When user loads or updates (e.g. initial fetch or profile refresh),
            // update our local XP state to match.
            // This ensures we always start with the backend's persisted XP.
            dispatch({
                type: 'SET_XP',
                payload: { xp: user.xp || 0 }
            });
        } else {
            // If logged out, reset to 0
            dispatch({ type: 'RESET_XP' });
        }
    }, [user]);

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

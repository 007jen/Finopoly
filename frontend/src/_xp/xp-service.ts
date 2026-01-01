// Event names for XP updates
export const XP_EVENT_NAME = 'xp-update';
export const XP_RESET_EVENT_NAME = 'xp-reset';
export const ACHIEVEMENT_EVENT_NAME = 'achievement-unlocked';

import { api } from '../lib/api';

let getTokenFn: (() => Promise<string | null>) | null = null;

export const xpService = {
    setTokenGetter: (fn: () => Promise<string | null>) => {
        getTokenFn = fn;
    },

    /**
     * Increments the global XP.
     * Dispatches a custom event that the XPProvider listens to.
     * @param amount - Amount of XP to add
     * @param source - The source/reason for the XP (e.g., "Daily Login")
     * @param localOnly - If true, only updates the UI (optimistically) without calling the backend API.
     */
    increment: async (amount: number, source: string = 'Unknown', localOnly: boolean = false) => {
        // Log intent
        console.log(`[XP] Incrementing ${amount} XP from: ${source} (LocalOnly: ${localOnly})`);

        // API Call
        if (!localOnly) {
            if (getTokenFn) {
                try {
                    const token = await getTokenFn();
                    if (token) {
                        const res = await api.post<any>('/api/progress/xp', { amount, source }, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (res.newBadges && res.newBadges.length > 0) {
                            const achievementEvent = new CustomEvent(ACHIEVEMENT_EVENT_NAME, {
                                detail: { badges: res.newBadges }
                            });
                            window.dispatchEvent(achievementEvent);
                        }
                    } else {
                        console.warn('[XP] No token available for sync');
                    }
                } catch (err) {
                    console.error("[XP] Failed to sync with server:", err);
                }
            } else {
                console.warn('[XP] Token getter not initialized');
            }
        }

        // Dispatch event to window (Optimistic UI update)
        const event = new CustomEvent(XP_EVENT_NAME, {
            detail: { amount, source },
        });
        window.dispatchEvent(event);
    },

    /**
     * Resets the global XP to 0.
     * Useful for testing.
     */
    reset: () => {
        console.log(`[XP] Resetting XP...`);
        const event = new Event(XP_RESET_EVENT_NAME);
        window.dispatchEvent(event);
    }
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
    (window as any).xpService = xpService;
}

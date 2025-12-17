// Event names for XP updates
export const XP_EVENT_NAME = 'xp-update';
export const XP_RESET_EVENT_NAME = 'xp-reset';

export const xpService = {
    /**
     * Increments the global XP.
     * Dispatches a custom event that the XPProvider listens to.
     * @param amount - Amount of XP to add
     * @param source - The source/reason for the XP (e.g., "Daily Login")
     */
    increment: (amount: number, source: string = 'Unknown') => {
        // Log intent as requested
        console.log(`[XP] Incrementing ${amount} XP from: ${source}`);

        // Dispatch event to window
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

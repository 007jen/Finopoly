export interface XPState {
    xp: number;
    level: number;
    xpToNextLevel: number;
    lastSource?: string;
}

export type XPAction =
    | { type: 'INCREMENT_XP'; payload: { amount: number; source?: string } }
    | { type: 'SET_XP'; payload: { xp: number } }
    | { type: 'RESET_XP' };

export const INITIAL_STATE: XPState = {
    xp: 0,
    level: 1,
    xpToNextLevel: 100,
};

// Helper to calculate level details based on XP
// STRICT LINEAR LOGIC: 500 XP per level.
// This matches the backend ProfileService implementation.
const calculateLevelDetails = (totalXP: number) => {
    const XP_PER_LEVEL = 500;
    const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
    const nextLevelTotalXP = level * XP_PER_LEVEL;
    const xpToNextLevel = nextLevelTotalXP - totalXP;

    return {
        level,
        xpToNextLevel
    };
};

export const xpReducer = (state: XPState, action: XPAction): XPState => {
    let newState: XPState;

    switch (action.type) {
        case 'INCREMENT_XP': {
            const newTotalXP = state.xp + action.payload.amount;
            const details = calculateLevelDetails(newTotalXP);

            newState = {
                xp: newTotalXP,
                level: details.level,
                xpToNextLevel: details.xpToNextLevel,
                lastSource: action.payload.source,
            };
            break;
        }
        case 'SET_XP': {
            const details = calculateLevelDetails(action.payload.xp);
            newState = {
                xp: action.payload.xp,
                level: details.level,
                xpToNextLevel: details.xpToNextLevel,
            };
            break;
        }
        case 'RESET_XP': {
            newState = INITIAL_STATE;
            break;
        }
        default:
            return state;
    }

    return newState;
};

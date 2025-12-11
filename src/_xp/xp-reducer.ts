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

// Level thresholds calculation
// Level 1: 0 (Next: 100)
// Level 2: 100 (Next: 300) -> 200 gap
// Level 3: 300 (Next: 600) -> 300 gap
// Level 4: 600 (Next: 1000) -> 400 gap
// ... and so on (+200 increment per level is not quite matching the user's example sequence exactly, 
// let's infer the pattern:
// L1->L2: 100
// L2->L3: 200
// L3->L4: 300
// L4->L5: 400
// This matches the user's numbers: 0, 100, 300, 600, 1000.
// So the pattern is: XP required for next level increases by 100 each time.
const calculateLevelDetails = (totalXP: number) => {
    let level = 1;
    let currentLevelXP = 0;
    let xpForNextLevel = 100; // XP needed to go from L1 to L2

    // Iterate to find current level
    while (totalXP >= currentLevelXP + xpForNextLevel) {
        currentLevelXP += xpForNextLevel;
        level++;
        xpForNextLevel += 100; // Increment gap by 100 for each subsequent level
    }

    const xpProgressInLevel = totalXP - currentLevelXP;
    const xpNeededForNext = xpForNextLevel - xpProgressInLevel;

    return {
        level,
        xpToNextLevel: xpNeededForNext,
        currentLevelXP, // The total XP where this level started
        nextLevelThreshold: currentLevelXP + xpForNextLevel,
        progressPercent: (xpProgressInLevel / xpForNextLevel) * 100
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

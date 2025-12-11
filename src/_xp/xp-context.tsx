import { createContext, useContext } from 'react';
import { XPState } from './xp-reducer';

export interface XPContextType extends XPState {
    addXP: (amount: number, source?: string) => void;
    resetXP: () => void;
}

export const XPContext = createContext<XPContextType | undefined>(undefined);

export const useXP = () => {
    const context = useContext(XPContext);
    if (!context) {
        throw new Error('useXP must be used within an XPProvider');
    }
    return context;
};

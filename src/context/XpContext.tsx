import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the shape of the Context
interface XpContextType {
    xp: number;
    addXp: (amount: number) => void;
    resetXp: () => void;
}

// Create the context
const XpContext = createContext<XpContextType | undefined>(undefined);

// Provider Component
export const XpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize XP from localStorage or default to 0
    const [xp, setXp] = useState<number>(() => {
        try {
            const storedXp = localStorage.getItem('user_xp');
            return storedXp ? parseInt(storedXp, 10) : 0;
        } catch (error) {
            console.error("Failed to load XP from localStorage", error);
            return 0;
        }
    });

    // Sync XP to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('user_xp', xp.toString());
        } catch (error) {
            console.error("Failed to save XP to localStorage", error);
        }
    }, [xp]);

    // Function to add XP
    const addXp = (amount: number) => {
        setXp((prevXp) => prevXp + amount);
    };

    // Function to reset XP (useful for development/testing)
    const resetXp = () => {
        setXp(0);
    };

    return (
        <XpContext.Provider value={{ xp, addXp, resetXp }}>
            {children}
        </XpContext.Provider>
    );
};

// Custom Hook for easier usage
export const useXp = (): XpContextType => {
    const context = useContext(XpContext);
    if (!context) {
        throw new Error('useXp must be used within an XpProvider');
    }
    return context;
};

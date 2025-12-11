import React, { createContext, useContext, useEffect, useState } from "react";

interface AccuracyState {
    correctAnswers: number;
    totalAnswers: number;
    accuracy: number;
    incrementCorrect: () => void;
    incrementTotal: () => void;
    resetAccuracy: () => void;
}

const AccuracyContext = createContext<AccuracyState | undefined>(undefined);

import { useAuth } from "../context/AuthContext";

// ... existing imports

export const AccuracyProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const userId = user?.id || "guest";

    // Initialize state properly based on current user
    const [correctAnswers, setCorrect] = useState(0);
    const [totalAnswers, setTotal] = useState(0);

    // Effect to Load/Reset stats when User ID changes
    useEffect(() => {
        // If no user, reset to 0 (or load guest stats if desired, but 0 is safer for "new user" feel)
        if (!user) {
            setCorrect(0);
            setTotal(0);
            return;
        }

        try {
            const storedCorrect = localStorage.getItem(`accuracy_${userId}_correct`);
            const storedTotal = localStorage.getItem(`accuracy_${userId}_total`);

            setCorrect(storedCorrect ? Number(storedCorrect) : 0);
            setTotal(storedTotal ? Number(storedTotal) : 0);
        } catch (e) {
            console.error("Failed to load accuracy stats", e);
            setCorrect(0);
            setTotal(0);
        }
    }, [userId, user]); // Depend on userId

    // Effect to Save stats
    useEffect(() => {
        if (!user) return; // Don't save for unauthenticated (or save to guest if needed)

        try {
            localStorage.setItem(`accuracy_${userId}_correct`, String(correctAnswers));
            localStorage.setItem(`accuracy_${userId}_total`, String(totalAnswers));
        } catch (e) {
            console.error("Failed to save accuracy stats", e);
        }
    }, [correctAnswers, totalAnswers, userId, user]);

    // Auto compute accuracy
    const accuracy =
        totalAnswers === 0 ? 0 : Number(((correctAnswers / totalAnswers) * 100).toFixed(2));

    const incrementCorrect = () => {
        setCorrect((prev) => prev + 1);
        setTotal((prev) => prev + 1);
    };

    const incrementTotal = () => setTotal((prev) => prev + 1);

    const resetAccuracy = () => {
        setCorrect(0);
        setTotal(0);
        // Force immediate save to avoid race conditions with page reloads (e.g. from resetXP)
        if (user) {
            try {
                localStorage.setItem(`accuracy_${userId}_correct`, "0");
                localStorage.setItem(`accuracy_${userId}_total`, "0");
            } catch (e) {
                console.error("Failed to force reset accuracy stats", e);
            }
        }
    };

    return (
        <AccuracyContext.Provider
            value={{
                correctAnswers,
                totalAnswers,
                accuracy,
                incrementCorrect,
                incrementTotal,
                resetAccuracy,
            }}
        >
            {children}
        </AccuracyContext.Provider>
    );
};

export const useAccuracy = () => {
    const context = useContext(AccuracyContext);
    if (!context) throw new Error("useAccuracy must be used inside AccuracyProvider");
    return context;
};

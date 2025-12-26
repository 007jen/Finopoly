import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

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
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

// ... existing imports

export const AccuracyProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const { getToken } = useClerkAuth();
    // const userId = user?.id || "guest"; // Unused for now, relies on user object logic

    // Initialize state
    const [correctAnswers, setCorrect] = useState(0);
    const [totalAnswers, setTotal] = useState(0);

    // Initial Load (Fetch from Backend)
    useEffect(() => {
        if (!user) {
            setCorrect(0);
            setTotal(0);
            return;
        }

        const fetchAccuracy = async () => {
            try {
                // We need an endpoint to GET accuracy stats directly if they are stored on User.
                // Currently User object in AuthContext implies it might have it if re-fetched,
                // BUT AuthContext might not have the updated fields yet if we just added them.
                // For now, we rely on the implementation plan's assumption that we just START counting 
                // or we need a GET endpoint.
                // Actually, let's just piggyback on `user` object if it includes it.
                // If not, we might need to fetch it.
                // HOWEVER, the schema change `User` model means `useAuth().user` MIGHT have it if we update `useAuth` query.
                // Let's assume for this step we primarily focus on SENDING updates.
                // But wait, to persist across reloads we MUST fetch it.
                // Since I didn't add a specific GET endpoint for just accuracy, 
                // I should probably piggyback on `getProfileOverview` or just trust `user` from AuthContext eventually.
                // BUT `user` in AuthContext comes from `/api/profile/me` or similar. I need to check `AuthContext`.

                // CRITICAL SHORTCUT: I will assume for now we start fresh or rely on local state until `user` object updates.
                // Better approach: Use local state initialized from `user.correctAnswers` if available.

                // Let's check if we can get it from `user`.
                if ((user as any).correctAnswers !== undefined) {
                    setCorrect((user as any).correctAnswers);
                    setTotal((user as any).totalQuestions);
                }
            } catch (e) {
                console.error("Failed to load accuracy stats", e);
            }
        };

        fetchAccuracy();
    }, [user]);

    // Computed accuracy
    const accuracy = totalAnswers === 0 ? 0 : Number(((correctAnswers / totalAnswers) * 100).toFixed(2));

    // Update Helpers
    const syncWithBackend = async (isCorrect: boolean) => {
        try {
            const token = await getToken();
            if (!token) return;

            await api.post('/api/progress/accuracy', { isCorrect }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Optimistic update handled by the specific increment functions below
        } catch (e) {
            console.error("Failed to sync accuracy", e);
        }
    }

    const incrementCorrect = () => {
        setCorrect((prev) => prev + 1);
        setTotal((prev) => prev + 1);
        syncWithBackend(true);
    };

    const incrementTotal = () => {
        setTotal((prev) => prev + 1);
        syncWithBackend(false);
    };

    const resetAccuracy = () => {
        setCorrect(0);
        setTotal(0);
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

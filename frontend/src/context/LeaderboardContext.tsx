import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useXP } from '../_xp/xp-context';

// Define the UserStats interface
export interface UserStats {
    username: string;
    xp: number;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number; // Percentage (0-100)
}

// Define the context type
interface LeaderboardContextType {
    leaderboardData: UserStats[];
    updateUserStats: (username: string, xpEarned: number, correct: number, total: number) => void;
    currentUserStats: UserStats | undefined;
}

// Create the context
export const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

// Dummy data for initial population if localStorage is empty
const DUMMY_DATA: UserStats[] = [
    { username: "Aarav", xp: 1200, totalQuestions: 100, correctAnswers: 92, accuracy: 92 },
    { username: "Riya", xp: 840, totalQuestions: 80, correctAnswers: 68, accuracy: 85 },
    { username: "Kabir", xp: 620, totalQuestions: 50, correctAnswers: 35, accuracy: 70 }
];

const STORAGE_KEY = 'finopoly_leaderboard_v1';

export const LeaderboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [leaderboardData, setLeaderboardData] = useState<UserStats[]>([]);
    const { user } = useAuth();
    const { xp } = useXP();

    // Load initial data
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setLeaderboardData(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse leaderboard data", e);
                setLeaderboardData(DUMMY_DATA);
            }
        } else {
            setLeaderboardData(DUMMY_DATA);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DUMMY_DATA));
        }
    }, []);

    // Sync Logic: Keep Leaderboard XP in sync with Global XP for the current user
    useEffect(() => {
        if (!user?.name) return;

        setLeaderboardData(currentData => {
            // Find current user's entry
            const existingUserIndex = currentData.findIndex(u => u.username === user.name);
            let updatedData = [...currentData];

            if (existingUserIndex >= 0) {
                // Only update if XP mismatch to avoid infinite loops or redundant renders
                if (updatedData[existingUserIndex].xp !== xp) {
                    updatedData[existingUserIndex] = {
                        ...updatedData[existingUserIndex],
                        xp: xp // FORCE SYNC to Global XP
                    };
                } else {
                    return currentData; // No changes needed
                }
            } else {
                // Create new entry for current user if they don't exist yet
                updatedData.push({
                    username: user.name,
                    xp: xp,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    accuracy: 0
                });
            }

            // Re-sort: XP desc, then Accuracy desc
            updatedData.sort((a, b) => {
                if (b.xp !== a.xp) return b.xp - a.xp;
                return b.accuracy - a.accuracy;
            });

            // Persist updates
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
            return updatedData;
        });
    }, [xp, user?.name]); // Trigger whenever Global XP changes or User changes

    // Update stats for a user (mainly used for Accuracy now)
    const updateUserStats = (username: string, xpEarned: number, correct: number, total: number) => {
        setLeaderboardData(currentData => {
            const existingUserIndex = currentData.findIndex(u => u.username === username);
            let updatedData = [...currentData];

            if (existingUserIndex >= 0) {
                // Update existing user
                const userEntry = updatedData[existingUserIndex];
                const newTotal = userEntry.totalQuestions + total;
                const newCorrect = userEntry.correctAnswers + correct;

                updatedData[existingUserIndex] = {
                    ...userEntry,
                    // Note: We ADD xpEarned here, but the useEffect above will correct it to the absolute Global XP
                    // if there are discrepancies. However, adding it here makes the UI feel instant before the sync hook potentially fires.
                    // But since we are passing 0 from QuizArena, this is mostly safe.
                    xp: userEntry.xp + xpEarned,
                    totalQuestions: newTotal,
                    correctAnswers: newCorrect,
                    accuracy: newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0
                };
            } else {
                // Add new user
                const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
                updatedData.push({
                    username,
                    xp: xpEarned,
                    totalQuestions: total,
                    correctAnswers: correct,
                    accuracy
                });
            }

            // Sort
            updatedData.sort((a, b) => {
                if (b.xp !== a.xp) return b.xp - a.xp;
                return b.accuracy - a.accuracy;
            });

            // Persist
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
            return updatedData;
        });
    };

    const currentUserStats = leaderboardData.find(u => u.username === user?.name);

    return (
        <LeaderboardContext.Provider value={{ leaderboardData, updateUserStats, currentUserStats }}>
            {children}
        </LeaderboardContext.Provider>
    );
};

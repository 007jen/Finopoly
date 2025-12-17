// src/lib/data-layer.ts
// Phase 1: Stable data-layer wrapper for demo. UI should only import from here.
// This file returns mock data when a real backend is not available.
// Later phases: swap internals to call real APIs.

import type { User, Badge, CaseLaw } from '../types'; // adjust path if needed

// --- Mock defaults ---
// --- Mock defaults ---
const MOCK_USER: User = {
    id: 'guest_000',
    email: 'guest@finopoly.local',
    name: 'Guest User',
    avatar: '',
    role: 'Student',
    xp: 0,
    level: 'Beginner',
    currentLevel: 1,
    dailyStreak: 0,
    accuracy: {
        audit: 0,
        tax: 0,
        caselaw: 0,
    },
    completedSimulations: 0,
    preferredAreas: [],
    badges: [],
    joinedDate: new Date().toISOString(),
};

const MOCK_BADGES: Badge[] = [
    { id: 'b1', name: 'Welcome', description: 'Welcome badge', icon: '', earnedDate: new Date().toISOString() },
    { id: 'b2', name: 'First Steps', description: 'Complete first sim', icon: '', earnedDate: new Date().toISOString() },
];

const MOCK_LEADERBOARD = [
    { id: 'u1', fullName: 'Alice A', xp: 4120, avatarUrl: '' }, // Reduced from 4320
    { id: 'u2', fullName: 'Bob B', xp: 3000, avatarUrl: '' },   // Reduced from 3200
    { id: 'u3', fullName: 'Charlie C', xp: 2500, avatarUrl: '' }, // Reduced from 2700
    ...Array.from({ length: 7 }).map((_, i) => ({ id: `u_mock_${i}`, fullName: `User ${i + 4}`, xp: 1800 - i * 100, avatarUrl: '' })), // Reduced base from 2000
];

// --- Public API of data-layer ---
export async function getUserProfile(clerkUserId?: string) {
    // Phase1: prefer calling a backend if available; otherwise return mock
    try {
        // If you add a real API later, call it here:
        // const res = await fetch(`/api/user/profile?uid=${clerkUserId}`);
        // if (res.ok) return await res.json();

        // No backend configured -> return mock user
        return MOCK_USER;
    } catch (err) {
        console.warn('data-layer.getUserProfile: returning mock user due to error', err);
        return MOCK_USER;
    }
}

export async function getUserBadges(userId?: string) {
    try {
        // call real endpoint when ready
        return MOCK_BADGES;
    } catch (err) {
        console.warn('data-layer.getUserBadges: returning mock badges', err);
        return MOCK_BADGES;
    }
}

export async function getLeaderboard() {
    try {
        return MOCK_LEADERBOARD;
    } catch (err) {
        console.warn('data-layer.getLeaderboard: returning mock leaderboard', err);
        return MOCK_LEADERBOARD;
    }
}

// Export more functions as needed for Phase1
export async function submitActivity(data: any) {
    // Phase1: just log and return success
    console.log('data-layer.submitActivity (demo):', data);
    return { success: true, id: 'mock_activity_' + Date.now() };
}

// src/context/AuthContext.tsx
// Phase 1: Robust AuthContext with Safe Fallbacks
// This handles Clerk authentication and merges it with our Database profile data.
// It is designed to never crash even if the Database is offline (Mock Mode).

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as AppUserType } from '../types';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { db } from '../lib/database';
// Safe abstraction for data layer interaction if needed
import { getUserBadges } from '../lib/data-layer';

interface AuthContextType {
    user: AppUserType | null;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<AppUserType>) => Promise<void>;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    showOnboarding: boolean;
    completeOnboarding: (onboardingData: { role: string; level: string; preferredAreas: string[] }) => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// --- Helper to map Clerk + DB profile to App User with safe defaults ---
const mapClerkUserToUser = (clerkUser: any, dbProfile: any = null): AppUserType => {
    // Helper to extract reliable name from Clerk
    const getClerkName = () => {
        if (clerkUser?.fullName) return clerkUser.fullName;
        if (clerkUser?.firstName || clerkUser?.lastName) {
            return `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
        }
        return null;
    };

    const clerkName = getClerkName();
    const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress || '';
    const clerkAvatar = clerkUser?.imageUrl || '';

    // 1. If we have a DB profile, try to use it, but sanity check if it's a generic mock
    if (dbProfile) {
        // Detect if we acted on the generic "Guest" mock profile
        // Logic: ID matches 'guest_000' OR (Authenticated and ID mismatch)
        const isMockProfile = dbProfile.id === 'guest_000' || (clerkUser?.id && dbProfile.id !== clerkUser.id);

        // If it is a mock profile, we MUST override identity fields with Clerk data
        // so the user sees *their* name, not "Guest User"
        const resolvedName = (!isMockProfile && dbProfile.name) ? dbProfile.name : (clerkName || dbProfile.name || 'User');
        const resolvedAvatar = (!isMockProfile && dbProfile.avatar) ? dbProfile.avatar : (clerkAvatar || dbProfile.avatar || '');
        const resolvedId = isMockProfile ? (clerkUser?.id || dbProfile.id) : dbProfile.id;

        return {
            id: resolvedId,
            name: resolvedName,
            email: dbProfile.email || clerkEmail,
            avatar: resolvedAvatar,
            role: dbProfile.role || 'Student',
            level: dbProfile.level || 'Beginner',
            preferredAreas: dbProfile.preferred_areas || [],
            xp: typeof dbProfile.xp === 'number' ? dbProfile.xp : 0,
            currentLevel: typeof dbProfile.current_level === 'number' ? dbProfile.current_level : 1,
            dailyStreak: typeof dbProfile.daily_streak === 'number' ? dbProfile.daily_streak : 0,
            badges: [], // Filled later
            completedSimulations: dbProfile.completedSimulations || 0,
            accuracy: {
                audit: typeof dbProfile.audit_accuracy === 'number' ? dbProfile.audit_accuracy : 0,
                tax: typeof dbProfile.tax_accuracy === 'number' ? dbProfile.tax_accuracy : 0,
                caselaw: typeof dbProfile.caselaw_accuracy === 'number' ? dbProfile.caselaw_accuracy : 0,
            },
            joinedDate: dbProfile.created_at || new Date().toISOString(),
            correctAnswers: typeof dbProfile.correctAnswers === 'number' ? dbProfile.correctAnswers : 0,
            totalQuestions: typeof dbProfile.totalQuestions === 'number' ? dbProfile.totalQuestions : 0,
        } as AppUserType;
    }

    // 2. Fallback: No DB profile at all (New User or DB connection failed hard)
    // Construct a safe user object purely from Clerk data
    return {
        id: clerkUser?.id || 'guest_000',
        name: clerkName || clerkEmail.split('@')[0] || 'User',
        email: clerkEmail,
        avatar: clerkAvatar,
        role: (clerkUser?.publicMetadata?.role as any) || 'Student',
        level: 'Beginner',
        preferredAreas: [],
        xp: 0,
        currentLevel: 1,
        dailyStreak: 0,
        badges: [],
        completedSimulations: 0,
        accuracy: { audit: 0, tax: 0, caselaw: 0 },
        joinedDate: new Date().toISOString(),
        correctAnswers: 0,
        totalQuestions: 0,
    } as AppUserType;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user: clerkUser, isLoaded: userLoaded } = useUser();
    const { getToken } = useClerkAuth();
    const { signOut } = useClerk();

    const [user, setUser] = useState<AppUserType | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadProfile = React.useCallback(async () => {
        // Wait for Clerk to initialize
        if (!userLoaded) return;

        try {
            if (clerkUser) {
                // console.log('[Auth] Loading profile for:', clerkUser.id);

                let profile = null;
                let badges: any[] = [];

                // 1. Fetch Profile (Safe DB Call)
                try {
                    const token = await getToken();
                    // Call backend via db layer, passing token
                    profile = await db.getProfile(clerkUser.id, token);
                } catch (e) {
                    console.error('[Auth] Profile fetch error (should be caught by db layer):', e);
                    profile = null;
                }

                // 2. Fetch Badges (Safe DB Call)
                try {
                    // db.getUserBadges handles the internal Supabase vs Mock switch
                    const token = await getToken();
                    badges = await db.getUserBadges(clerkUser.id, token);
                } catch (e) {
                    // If db abstraction failed, try raw data-layer fallback
                    console.error('[Auth] Badge fetch error:', e);
                    badges = await getUserBadges(clerkUser.id).catch(() => []);
                }

                // 3. Map Data
                const mappedUser = mapClerkUserToUser(clerkUser, profile);

                // 4. Attach Badges with Safety Checks
                mappedUser.badges = (badges || []).map((ub: any) => {
                    const badgeData = ub?.badges ? ub.badges : ub;
                    return {
                        id: badgeData?.id || 'badge_err',
                        name: badgeData?.name || 'Unknown Badge',
                        description: badgeData?.description || '',
                        icon: badgeData?.icon || '',
                        earnedDate: ub?.earned_at || new Date().toISOString(),
                    };
                });

                // console.log("[AuthContext] MAPPED USER RESULT:", mappedUser); // DEBUG LOG
                // console.log("[AuthContext] Simulations Count:", mappedUser.completedSimulations); // DEBUG LOG

                setUser(mappedUser);
                // Trigger onboarding if needed, checking strict role logic
                if (!mappedUser.role || (mappedUser.role === 'Student' && !mappedUser.preferredAreas?.length)) {
                    // Logic to toggle onboarding if desired:
                    // setShowOnboarding(true);
                }
            } else {
                // Unauthenticated
                setUser(null);
            }
        } catch (err) {
            console.error('[Auth] Critical auth error:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [userLoaded, clerkUser, getToken]);

    // Initial Load
    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // --- Auth Actions ---

    const logout = async () => {
        try {
            await signOut();
            setUser(null);
        } catch (err) {
            console.warn('[Auth] Logout warning:', err);
            setUser(null);
        }
    };

    const updateUser = async (userData: Partial<AppUserType>) => {
        console.log('[Auth] updateUser (Phase 1 Stub):', userData);
        // Optimistic update
        setUser(prev => prev ? { ...prev, ...userData } : null);
    };

    const refreshUser = async () => {
        try {
            if (clerkUser && typeof clerkUser.reload === 'function') {
                await clerkUser.reload();
            }
            // THIS IS THE FIX: Fetch DB data too!
            await loadProfile();
        } catch (err) {
            console.warn('[Auth] refreshUser warning:', err);
        }
    };

    const completeOnboarding = async (onboardingData: { role: string; level: string; preferredAreas: string[] }) => {
        try {
            if (clerkUser) {
                await clerkUser.update({
                    unsafeMetadata: {
                        role: onboardingData.role,
                        level: onboardingData.level,
                        preferredAreas: onboardingData.preferredAreas,
                        onboardingCompleted: true
                    },
                });

                setUser(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        role: onboardingData.role as any,
                        level: onboardingData.level as any,
                        preferredAreas: onboardingData.preferredAreas
                    };
                });
                setShowOnboarding(false);
            }
        } catch (err) {
            console.error('[Auth] completeOnboarding failed:', err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                logout,
                updateUser,
                refreshUser,
                isAuthenticated: !!user,
                showOnboarding,
                completeOnboarding,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

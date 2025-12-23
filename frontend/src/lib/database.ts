// src/lib/database.ts
// Phase 1: Safe wrapper around supabase. Uses the real supabase client when configured,
// otherwise returns deterministic mock values to avoid runtime crashes during demo.

import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Mock / fallback data used when Supabase is not configured or calls fail.
 * Keep these deterministic so UI shows consistent values in demo.
 */
const MOCK_PROFILE = {
  id: 'guest_000',
  email: 'guest@finopoly.local',
  name: 'Guest User',
  avatar: '',
  role: 'Student',
  level: 'Beginner',
  preferred_areas: [],
  xp: 0,
  current_level: 1,
  daily_streak: 0,
  last_activity_date: null,
  completed_simulations: 0,
  audit_accuracy: 0,
  tax_accuracy: 0,
  caselaw_accuracy: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_BADGES: any[] = [
  {
    id: 'mb1',
    user_id: 'guest_000',
    badge_id: 'b1',
    earned_at: new Date().toISOString(),
    badges: { id: 'b1', name: 'Welcome', description: 'Welcome badge', icon: '', xp_requirement: 0 }
  },
];

const MOCK_LEADERBOARD = [
  { id: 'u1', username: 'Alice A', xp: 4320, weeklyXP: 4320 },
  { id: 'u2', username: 'Bob B', xp: 3200, weeklyXP: 3200 },
  { id: 'u3', username: 'Charlie C', xp: 2700, weeklyXP: 2700 },
  ...Array.from({ length: 7 }).map((_, i) => ({ id: `u_mock_${i}`, username: `User ${i + 4}`, xp: 2000 - i * 100, weeklyXP: 2000 - i * 100 })),
];

export const db = {
  // Read operations
  // Read operations
  async getProfile(userId: string, token?: string | null) {
    // Phase 2: If we have a token, prefer the Backend API
    if (token) {
      try {
        const res = await fetch('/api/profile/overview', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const backendData = await res.json();
          // Backend returns { xp, level, xpToNextLevel, joinedAt }
          // We need to map this to the 'Profile' shape expected by AuthContext (database schema shape)
          // AuthContext expects: { id, name, email, avatar, role, xp, level, daily_streak, ... }
          // The /api/profile/overview returns limited data. 
          // We might need to call a fuller endpoint or just merge with mock defaults for now?
          // Actually, /api/profile/overview returns: { xp, level, xpToNextLevel, joinedAt }.
          // It does NOT return badges yet (separate endpoint).
          // It does NOT return name/email (Clerk has that).
          // So we can return a hybrid object.

          return {
            ...MOCK_PROFILE,
            id: userId,
            name: null, // Force AuthContext to use Clerk Name
            email: null, // Force AuthContext to use Clerk Email
            avatar: null,
            xp: backendData.xp,
            current_level: backendData.level,
            created_at: backendData.joinedAt
          };
        }
      } catch (e) {
        console.warn("db.getProfile: Backend fetch failed", e);
      }
    }

    if (!isSupabaseConfigured) {
      console.warn('db.getProfile: Supabase not configured — returning mock profile.');
      return MOCK_PROFILE;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('db.getProfile: supabase error', error);
        return MOCK_PROFILE;
      }
      return data ?? MOCK_PROFILE;
    } catch (err) {
      console.error('db.getProfile: unexpected error', err);
      return MOCK_PROFILE;
    }
  },

  async createProfile(profile: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role?: 'Student' | 'Partner';
  }) {
    if (!isSupabaseConfigured) {
      console.warn('db.createProfile: Supabase not configured — returning input as created profile (demo).');
      return { ...profile, ...{ xp: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } };
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('db.createProfile error', err);
      return { ...profile, xp: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    }
  },

  async updateProfile(userId: string, updates: any) {
    if (!isSupabaseConfigured) {
      console.warn('db.updateProfile: Supabase not configured — returning merged mock profile.');
      return { ...MOCK_PROFILE, ...updates, id: userId, updated_at: new Date().toISOString() };
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('db.updateProfile error', err);
      return { ...MOCK_PROFILE, ...updates, id: userId, updated_at: new Date().toISOString() };
    }
  },

  // XP + activities
  async addXP(userId: string, xpAmount: number, activityType: string, activityId: string, score: number, answers: any) {
    if (!isSupabaseConfigured) {
      console.warn('db.addXP: Supabase not configured — simulating XP update (demo).');
      const newXP = (MOCK_PROFILE.xp || 0) + xpAmount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      const newStreak = (MOCK_PROFILE.daily_streak || 0) + 1;
      return { newXP, newLevel, newStreak };
    }

    try {
      const profile = await this.getProfile(userId);
      if (!profile) throw new Error('Profile not found');

      const newXP = (profile.xp || 0) + xpAmount;
      const newLevel = Math.floor(newXP / 1000) + 1;

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = profile.last_activity_date;
      let newStreak = profile.daily_streak || 0;

      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      await supabase
        .from('profiles')
        .update({
          xp: newXP,
          current_level: newLevel,
          daily_streak: newStreak,
          last_activity_date: today,
        })
        .eq('id', userId);

      await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_id: activityId,
          xp_earned: xpAmount,
          score,
          answers,
        });

      return { newXP, newLevel, newStreak };
    } catch (err) {
      console.error('db.addXP error', err);
      // Safe fallback
      return { newXP: (MOCK_PROFILE.xp || 0) + xpAmount, newLevel: Math.floor(((MOCK_PROFILE.xp || 0) + xpAmount) / 1000) + 1, newStreak: (MOCK_PROFILE.daily_streak || 0) + 1 };
    }
  },

  // Leaderboard
  async getLeaderboard(limit = 50) {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        // Backend returns { leaderboard: [...] }
        return data.leaderboard || [];
      }
    } catch (err) {
      console.warn('db.getLeaderboard: Backend fetch failed, falling back to mock/supabase', err);
    }

    if (!isSupabaseConfigured) {
      console.warn('db.getLeaderboard: Supabase not configured — returning mock leaderboard.');
      return MOCK_LEADERBOARD.slice(0, limit);
    }

    try {
      // Fallback to Supabase logic if API fails (or keep as deprecated path)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: activities, error: actError } = await supabase
        .from('user_activity')
        .select('user_id, xp_earned, completed_at')
        .gte('completed_at', oneWeekAgo.toISOString());

      if (actError) throw actError;

      const weeklyXP = (activities || []).reduce((acc: any, activity: any) => {
        acc[activity.user_id] = (acc[activity.user_id] || 0) + (activity.xp_earned || 0);
        return acc;
      }, {});

      const userIds = Object.keys(weeklyXP);
      if (userIds.length === 0) return MOCK_LEADERBOARD.slice(0, limit);

      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profError) throw profError;

      const leaderboard = (profiles || [])
        .map((profile: any) => ({
          ...profile,
          weeklyXP: weeklyXP[profile.id] || 0,
          username: profile.name || profile.email || 'User',
        }))
        .sort((a: any, b: any) => (b.weeklyXP || 0) - (a.weeklyXP || 0))
        .slice(0, limit);

      return leaderboard;
    } catch (err) {
      console.error('db.getLeaderboard error', err);
      return MOCK_LEADERBOARD.slice(0, limit);
    }
  },

  async getUserBadges(userId: string, token?: string | null) {
    if (token) {
      try {
        const res = await fetch('/api/profile/badges', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn("db.getUserBadges: Backend fetch failed", e);
      }
    }

    if (!isSupabaseConfigured) {
      console.warn('db.getUserBadges: Supabase not configured — returning mock badges.');
      return MOCK_BADGES;
    }
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('db.getUserBadges error', err);
      return MOCK_BADGES;
    }
  },

  async getAllBadges() {
    if (!isSupabaseConfigured) {
      console.warn('db.getAllBadges: Supabase not configured — returning mock badges catalog.');
      return MOCK_BADGES.map((u: any) => u.badges);
    }
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('xp_requirement', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('db.getAllBadges error', err);
      return MOCK_BADGES.map((u: any) => u.badges);
    }
  },

  // Content reads
  async getAuditCases(difficulty?: string) {
    if (!isSupabaseConfigured) {
      console.warn('db.getAuditCases: Supabase not configured — returning empty array.');
      return [];
    }
    try {
      let query = supabase.from('audit_cases').select('*').eq('is_active', true);
      if (difficulty) query = query.eq('difficulty', difficulty);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('db.getAuditCases error', err);
      return [];
    }
  },

  async getCaseLaws(difficulty?: string) {
    if (!isSupabaseConfigured) {
      console.warn('db.getCaseLaws: Supabase not configured — returning empty array.');
      return [];
    }
    try {
      let query = supabase.from('case_laws').select('*').eq('is_active', true);
      if (difficulty) query = query.eq('difficulty', difficulty);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('db.getCaseLaws error', err);
      return [];
    }
  },

  async getTaxSimulations(difficulty?: string) {
    if (!isSupabaseConfigured) {
      console.warn('db.getTaxSimulations: Supabase not configured — returning empty array.');
      return [];
    }
    try {
      let query = supabase.from('tax_simulations').select('*').eq('is_active', true);
      if (difficulty) query = query.eq('difficulty', difficulty);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('db.getTaxSimulations error', err);
      return [];
    }
  },

  // Create / update content (demo-safe)
  async createCaseLaw(caseLaw: any, userId: string) {
    if (!isSupabaseConfigured) {
      console.warn('db.createCaseLaw: Supabase not configured — simulating create (demo).');
      return { id: `mock_case_${Date.now()}`, ...caseLaw, created_by: userId, created_at: new Date().toISOString() };
    }
    try {
      const { data, error } = await supabase
        .from('case_laws')
        .insert({ ...caseLaw, created_by: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('db.createCaseLaw error', err);
      return { id: `mock_case_${Date.now()}`, ...caseLaw, created_by: userId, created_at: new Date().toISOString() };
    }
  },

  async createAuditCase(auditCase: any, userId: string) {
    if (!isSupabaseConfigured) {
      console.warn('db.createAuditCase: Supabase not configured — simulating create (demo).');
      return { id: `mock_audit_${Date.now()}`, ...auditCase, created_by: userId, created_at: new Date().toISOString() };
    }
    try {
      const { data, error } = await supabase
        .from('audit_cases')
        .insert({ ...auditCase, created_by: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('db.createAuditCase error', err);
      return { id: `mock_audit_${Date.now()}`, ...auditCase, created_by: userId, created_at: new Date().toISOString() };
    }
  },

  async createTaxSimulation(taxSim: any, userId: string) {
    if (!isSupabaseConfigured) {
      console.warn('db.createTaxSimulation: Supabase not configured — simulating create (demo).');
      return { id: `mock_tax_${Date.now()}`, ...taxSim, created_by: userId, created_at: new Date().toISOString() };
    }
    try {
      const { data, error } = await supabase
        .from('tax_simulations')
        .insert({ ...taxSim, created_by: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('db.createTaxSimulation error', err);
      return { id: `mock_tax_${Date.now()}`, ...taxSim, created_by: userId, created_at: new Date().toISOString() };
    }
  },

  async updateCaseLaw(id: string, updates: any) {
    if (!isSupabaseConfigured) {
      console.warn('db.updateCaseLaw: Supabase not configured — returning simulated update (demo).');
      return { id, ...updates, updated_at: new Date().toISOString() };
    }
    try {
      const { data, error } = await supabase
        .from('case_laws')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('db.updateCaseLaw error', err);
      return { id, ...updates, updated_at: new Date().toISOString() };
    }
  },

  async deleteCaseLaw(id: string) {
    if (!isSupabaseConfigured) {
      console.warn('db.deleteCaseLaw: Supabase not configured — simulated soft-delete (demo).');
      return;
    }
    try {
      const { error } = await supabase
        .from('case_laws')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('db.deleteCaseLaw error', err);
    }
  },

  async getUserActivity(userId: string, limit = 20) {
    if (!isSupabaseConfigured) {
      console.warn('db.getUserActivity: Supabase not configured — returning empty array.');
      return [];
    }
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('db.getUserActivity error', err);
      return [];
    }
  },

  async updateAccuracy(userId: string, activityType: 'audit' | 'tax' | 'caselaw', newScore: number) {
    if (!isSupabaseConfigured) {
      console.warn('db.updateAccuracy: Supabase not configured — skipping (demo).');
      return;
    }
    try {
      const activities = await this.getUserActivity(userId, 100);
      const relevantActivities = activities.filter((a: any) => a.activity_type === activityType);

      if (relevantActivities.length === 0) return;

      const avgScore = relevantActivities.reduce((sum: number, a: any) => sum + a.score, 0) / relevantActivities.length;

      const updateField = activityType === 'audit' ? 'audit_accuracy' :
        activityType === 'tax' ? 'tax_accuracy' : 'caselaw_accuracy';

      await supabase
        .from('profiles')
        .update({ [updateField]: avgScore })
        .eq('id', userId);
    } catch (err) {
      console.error('db.updateAccuracy error', err);
    }
  },
};


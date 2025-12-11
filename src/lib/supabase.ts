import { createClient } from '@supabase/supabase-js';

// --- Configuration Check ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.length > 0 &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 0;

// --- Mock Client ---
// This client is used when Supabase is not configured to prevent runtime crashes.
// It returns safe, empty/null responses that the app can handle gracefully.
const mockSupabaseClient = {
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }), // getProfile
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        order: () => Promise.resolve({ data: [], error: null }), // getLeaderboard
        then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb)
      }),
      order: () => Promise.resolve({ data: [], error: null }),
      then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb)
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => Promise.resolve({ data: null, error: null })
      })
    }),
    upsert: () => ({
      select: () => Promise.resolve({ data: null, error: null })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: null })
    })
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signInWithOAuth: () => Promise.resolve({ error: { message: 'Supabase Auth Disabled (Mock Mode)' } }),
    signOut: () => Promise.resolve({ error: null })
  }
} as any;

// --- Export Client ---
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabaseClient;

// Helper log for debugging environment issues
if (!isSupabaseConfigured) {
  console.warn('[Supabase] Missing environment variables. Using MOCK client. Real DB calls will return null/empty.');
} else {
  console.log('[Supabase] Client configured and ready.');
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar: string;
          role: 'Student' | 'Partner';
          level: 'Beginner' | 'Intermediate' | 'Pro';
          preferred_areas: string[];
          xp: number;
          current_level: number;
          daily_streak: number;
          last_activity_date: string | null;
          completed_simulations: number;
          audit_accuracy: number;
          tax_accuracy: number;
          caselaw_accuracy: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar?: string;
          role?: 'Student' | 'Partner';
          level?: 'Beginner' | 'Intermediate' | 'Pro';
          preferred_areas?: string[];
          xp?: number;
          current_level?: number;
          daily_streak?: number;
          last_activity_date?: string | null;
          completed_simulations?: number;
          audit_accuracy?: number;
          tax_accuracy?: number;
          caselaw_accuracy?: number;
        };
        Update: {
          email?: string;
          name?: string;
          avatar?: string;
          role?: 'Student' | 'Partner';
          level?: 'Beginner' | 'Intermediate' | 'Pro';
          preferred_areas?: string[];
          xp?: number;
          current_level?: number;
          daily_streak?: number;
          last_activity_date?: string | null;
          completed_simulations?: number;
          audit_accuracy?: number;
          tax_accuracy?: number;
          caselaw_accuracy?: number;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          xp_requirement: number;
          created_at: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
      };
      audit_cases: {
        Row: {
          id: string;
          title: string;
          company: string;
          difficulty: 'Beginner' | 'Intermediate' | 'Pro';
          description: string;
          xp_reward: number;
          time_limit: number | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      case_laws: {
        Row: {
          id: string;
          title: string;
          facts: string;
          question: string;
          options: string[];
          correct_answer: string;
          explanation: string;
          category: string;
          difficulty: 'Beginner' | 'Intermediate' | 'Pro';
          xp_reward: number;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      tax_simulations: {
        Row: {
          id: string;
          title: string;
          description: string;
          difficulty: 'Beginner' | 'Intermediate' | 'Pro';
          scenario: string;
          client_data: any;
          questions: any[];
          xp_reward: number;
          time_limit: number | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      user_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_type: 'audit' | 'tax' | 'caselaw' | 'quiz';
          activity_id: string;
          xp_earned: number;
          score: number;
          time_taken: number | null;
          answers: any;
          completed_at: string;
        };
        Insert: {
          user_id: string;
          activity_type: 'audit' | 'tax' | 'caselaw' | 'quiz';
          activity_id: string;
          xp_earned: number;
          score: number;
          time_taken?: number | null;
          answers: any;
        };
      };
    };
  };
};

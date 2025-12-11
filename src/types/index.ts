export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Student' | 'Partner' | 'admin';
  level: 'Beginner' | 'Intermediate' | 'Pro';
  preferredAreas: string[];
  xp: number;
  currentLevel: number;
  dailyStreak: number;
  badges: Badge[];
  completedSimulations: number;
  accuracy: {
    audit: number;
    tax: number;
    caselaw: number;
  };
  joinedDate: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string;
}

export interface AuditCase {
  id: string;
  title: string;
  company: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Pro';
  description: string;
  documents: Document[];
  tasks: Task[];
  xpReward: number;
  timeLimit?: number;
}

export interface Document {
  id: string;
  name: string;
  type: 'trial-balance' | 'invoice' | 'notes' | 'report';
  url: string;
  preview?: string;
}

export interface Task {
  id: string;
  type: 'mcq' | 'descriptive' | 'checkbox' | 'upload';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  hint: string;
  points: number;
}

export interface CaseLaw {
  id: string;
  title: string;
  facts: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Pro';
  xpReward: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  weeklyXP: number;
  weeklyStreak: number;
}
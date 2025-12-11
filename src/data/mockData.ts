import { User, Badge, AuditCase, CaseLaw, LeaderboardEntry } from '../types';

export const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Audit Rookie',
    description: 'Complete your first audit simulation',
    icon: 'Award',
    earnedDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Streak Master',
    description: 'Maintain a 7-day learning streak',
    icon: 'Flame',
    earnedDate: '2024-01-20'
  },
  {
    id: '3',
    name: 'Case Law Pro',
    description: 'Score 90%+ in case law simulations',
    icon: 'Scale',
    earnedDate: '2024-01-25'
  }
];

export const mockUser: User = {
  id: '1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@email.com',
  avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  role: 'Student',
  level: 'Intermediate',
  preferredAreas: ['Audit', 'Tax'],
  xp: 2450,
  currentLevel: 5,
  dailyStreak: 12,
  badges: mockBadges,
  completedSimulations: 28,
  accuracy: {
    audit: 85,
    tax: 78,
    caselaw: 92
  },
  joinedDate: '2024-01-01'
};

export const mockAuditCases: AuditCase[] = [
  {
    id: '1',
    title: 'Fixed Assets Audit - ABC Pvt Ltd',
    company: 'ABC Private Limited',
    difficulty: 'Intermediate',
    description: 'Review and audit the fixed assets of a mid-sized manufacturing company',
    documents: [
      {
        id: '1',
        name: 'Trial Balance FY 2023-24',
        type: 'trial-balance',
        url: '#',
        preview: 'Trial balance showing fixed assets worth ₹2.5 Cr'
      },
      {
        id: '2',
        name: 'Fixed Asset Register',
        type: 'report',
        url: '#',
        preview: 'Detailed asset register with acquisition dates'
      },
      {
        id: '3',
        name: 'Purchase Invoices Q4',
        type: 'invoice',
        url: '#',
        preview: '15 invoices for machinery purchases'
      },
      {
        id: '4',
        name: 'Partner Notes',
        type: 'notes',
        url: '#',
        preview: 'Key observations and areas of concern'
      }
    ],
    tasks: [
      {
        id: '1',
        type: 'mcq',
        question: 'Which audit assertion is most relevant when verifying fixed asset additions?',
        options: ['Existence', 'Completeness', 'Accuracy', 'Occurrence'],
        correctAnswer: 'Occurrence',
        hint: 'Consider what we need to verify about new purchases',
        points: 50
      },
      {
        id: '2',
        type: 'descriptive',
        question: 'Identify 3 key control weaknesses from the purchase invoices and suggest remedial measures.',
        hint: 'Look for authorization, documentation, and segregation of duties',
        points: 100
      },
      {
        id: '3',
        type: 'checkbox',
        question: 'Select all procedures you would perform for fixed asset verification:',
        options: [
          'Physical verification',
          'Vouching of additions',
          'Depreciation calculation review',
          'Insurance coverage verification',
          'Title deed verification'
        ],
        correctAnswer: ['Physical verification', 'Vouching of additions', 'Depreciation calculation review', 'Title deed verification'],
        hint: 'Consider comprehensive audit procedures',
        points: 75
      }
    ],
    xpReward: 300,
    timeLimit: 45
  },
  {
    id: '2',
    title: 'Inventory Audit - XYZ Retail Ltd',
    company: 'XYZ Retail Limited',
    difficulty: 'Beginner',
    description: 'Audit inventory valuation and count procedures for a retail business',
    documents: [
      {
        id: '1',
        name: 'Inventory Aging Report',
        type: 'report',
        url: '#',
        preview: 'Stock aging analysis showing slow-moving items'
      },
      {
        id: '2',
        name: 'Physical Count Sheets',
        type: 'report',
        url: '#',
        preview: 'Physical verification records'
      }
    ],
    tasks: [
      {
        id: '1',
        type: 'mcq',
        question: 'What is the primary assertion being tested during inventory count?',
        options: ['Existence', 'Valuation', 'Rights', 'Presentation'],
        correctAnswer: 'Existence',
        hint: 'Think about what physical counting primarily establishes',
        points: 40
      }
    ],
    xpReward: 200,
    timeLimit: 30
  }
];

export const mockCaseLaws: CaseLaw[] = [
  {
    id: '1',
    title: 'CIT vs. Hindustan Coca Cola Beverages',
    facts: 'The assessee company claimed deduction under Section 80IA for profits from industrial undertaking. The AO denied the claim stating that bottling of soft drinks does not constitute manufacturing.',
    question: 'What would be the likely outcome based on established precedents?',
    options: [
      'Deduction allowed - bottling constitutes manufacturing',
      'Deduction denied - bottling is not manufacturing',
      'Partial deduction based on value addition',
      'Matter remanded back to AO for fresh consideration'
    ],
    correctAnswer: 'Deduction allowed - bottling constitutes manufacturing',
    explanation: 'The Supreme Court has consistently held that bottling of beverages involves manufacturing process as it brings into existence a new product with distinctive name, character and use.',
    category: 'Income Tax',
    difficulty: 'Intermediate',
    xpReward: 150
  },
  {
    id: '2',
    title: 'Godrej & Boyce vs. State of Maharashtra',
    facts: 'The company received show cause notice for non-payment of VAT on inter-state stock transfers. The company argued that no sale took place as goods were transferred to their own branch.',
    question: 'What is the correct legal position?',
    options: [
      'VAT applicable on all stock transfers',
      'No VAT as no sale occurred',
      'CST applicable instead of VAT',
      'Depends on the nature of goods'
    ],
    correctAnswer: 'No VAT as no sale occurred',
    explanation: 'Stock transfers between branches of the same legal entity do not constitute sale and hence VAT is not applicable. However, CST may apply on inter-state transfers.',
    category: 'Indirect Tax',
    difficulty: 'Beginner',
    xpReward: 100
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user: {
      ...mockUser,
      name: 'Priya Patel',
      xp: 3200,
      currentLevel: 7,
      dailyStreak: 18
    },
    weeklyXP: 450,
    weeklyStreak: 7
  },
  {
    rank: 2,
    user: {
      ...mockUser,
      name: 'Arjun Kumar',
      xp: 2850,
      currentLevel: 6,
      dailyStreak: 15
    },
    weeklyXP: 380,
    weeklyStreak: 6
  },
  {
    rank: 3,
    user: mockUser,
    weeklyXP: 320,
    weeklyStreak: 5
  },
  {
    rank: 4,
    user: {
      ...mockUser,
      name: 'Sneha Gupta',
      xp: 2200,
      currentLevel: 5,
      dailyStreak: 8
    },
    weeklyXP: 290,
    weeklyStreak: 4
  },
  {
    rank: 5,
    user: {
      ...mockUser,
      name: 'Vikram Singh',
      xp: 2100,
      currentLevel: 4,
      dailyStreak: 22
    },
    weeklyXP: 275,
    weeklyStreak: 7
  }
];
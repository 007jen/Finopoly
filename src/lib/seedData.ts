import { db } from './database';

export const seedCaseLaws = async (userId: string) => {
  const caseLaws = [
    {
      title: 'Revenue Recognition Principles',
      facts: 'ABC Ltd. delivers goods worth ₹5,00,000 to a customer on March 28, 2024. The customer has a 30-day inspection period with the right to return the goods. Payment terms are net 30 days after acceptance.',
      question: 'When should ABC Ltd. recognize the revenue from this transaction?',
      options: ['At delivery on March 28', 'After 30-day inspection period', 'When customer accepts goods', 'When payment is received'],
      correct_answer: 'When customer accepts goods',
      explanation: 'Under Ind AS 115, revenue should be recognized when control transfers to the customer. With an acceptance clause, control transfers when the customer formally accepts the goods, not at delivery or cash receipt.',
      category: 'Revenue Recognition',
      difficulty: 'Intermediate',
      xp_reward: 100
    },
    {
      title: 'Audit Assertion - Completeness',
      facts: 'An auditor is reviewing the financial statements of XYZ Ltd. and needs to verify that all transactions that occurred during the period have been recorded in the books of accounts.',
      question: 'Which assertion is the auditor primarily testing?',
      options: ['Existence', 'Completeness', 'Valuation', 'Rights and Obligations'],
      correct_answer: 'Completeness',
      explanation: 'The completeness assertion ensures that all transactions and accounts that should be presented in the financial statements are so included. It addresses the risk of omission.',
      category: 'Audit Fundamentals',
      difficulty: 'Beginner',
      xp_reward: 50
    },
    {
      title: 'Lease Classification under Ind AS 116',
      facts: 'DEF Company enters into a 10-year lease for equipment. Annual lease payments are ₹2,00,000. The equipment has an estimated useful life of 12 years and a fair value of ₹18,00,000. The implicit rate is 8%.',
      question: 'How should this lease be classified?',
      options: ['Operating lease', 'Finance lease', 'Short-term lease', 'Not a lease'],
      correct_answer: 'Finance lease',
      explanation: 'Under Ind AS 116, a lease is classified as a finance lease if it transfers substantially all risks and rewards. A 10-year term for a 12-year useful life (83% of economic life) indicates a finance lease.',
      category: 'Accounting Standards',
      difficulty: 'Pro',
      xp_reward: 150
    },
    {
      title: 'Internal Control Assessment',
      facts: 'During an audit, you discover that the person responsible for recording cash receipts also reconciles the bank statements monthly without any supervisory review.',
      question: 'What internal control deficiency exists?',
      options: ['Lack of authorization', 'Inadequate segregation of duties', 'Poor documentation', 'Absence of physical controls'],
      correct_answer: 'Inadequate segregation of duties',
      explanation: 'Segregation of duties requires that no single individual should have control over all phases of a transaction. Recording cash and reconciling statements should be separated to prevent and detect errors or fraud.',
      category: 'Internal Controls',
      difficulty: 'Intermediate',
      xp_reward: 100
    },
    {
      title: 'Going Concern Evaluation',
      facts: 'GHI Ltd. has suffered recurring losses for the past three years, has defaulted on loan payments, and key customers have moved to competitors. However, management believes they will continue operations.',
      question: 'What should the auditor consider regarding going concern?',
      options: ['Accept management assurance', 'Issue unmodified opinion', 'Evaluate going concern assumption', 'Ignore financial indicators'],
      correct_answer: 'Evaluate going concern assumption',
      explanation: 'Recurring losses, loan defaults, and loss of key customers are indicators of going concern issues. The auditor must evaluate whether the going concern assumption is appropriate and consider disclosure requirements.',
      category: 'Audit Standards',
      difficulty: 'Pro',
      xp_reward: 150
    }
  ];

  try {
    for (const caseLaw of caseLaws) {
      await db.createCaseLaw(caseLaw);
    }
    console.log('Case laws seeded successfully');
  } catch (error) {
    console.error('Error seeding case laws:', error);
  }
};

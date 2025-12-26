
export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SCENARIO';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Pro';
export type Category = 'Audit' | 'Tax' | 'Law';

export interface QuizQuestion {
    id: string;
    category: Category;
    type: QuestionType;
    difficulty: Difficulty;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    scenario?: string; // For Case Stimulation
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
    // =================================================================
    // AUDIT - MCQs
    // =================================================================
    {
        id: "aud-mcq-1",
        category: "Audit",
        type: "MCQ",
        difficulty: "Beginner",
        question: "What is the primary objective of an independent financial audit?",
        options: ["To detect all fraud", "To prepare financial statements", "To express an opinion on fair presentation", "To guarantee future viability"],
        correctAnswer: "To express an opinion on fair presentation",
        explanation: "The primary goal is to provide reasonable assurance that financial statements are free from material misstatement."
    },
    {
        id: "aud-mcq-2",
        category: "Audit",
        type: "MCQ",
        difficulty: "Beginner",
        question: "Which of the following is NOT a type of audit opinion?",
        options: ["Unqualified", "Qualified", "Adverse", "Certified"],
        correctAnswer: "Certified",
        explanation: "Standard opinions are Unqualified, Qualified, Adverse, and Disclaimer. 'Certified' is not a standard audit opinion."
    },
    {
        id: "aud-mcq-3",
        category: "Audit",
        type: "MCQ",
        difficulty: "Intermediate",
        question: "Materiality in auditing is primarily a matter of:",
        options: ["Professional judgment", "SEC/SEBI regulations", "Fixed percentage of assets", "Client preference"],
        correctAnswer: "Professional judgment",
        explanation: "Materiality is based on the auditor's professional judgment regarding what would influence the economic decisions of users."
    },
    {
        id: "aud-mcq-4",
        category: "Audit",
        type: "MCQ",
        difficulty: "Intermediate",
        question: "Vouching is primarily used to test for:",
        options: ["Completeness", "Existence/Occurrence", "Classification", "Disclosure"],
        correctAnswer: "Existence/Occurrence",
        explanation: "Vouching goes from the ledger to the source document to verify that the transaction actually occurred (Existence)."
    },
    {
        id: "aud-mcq-5",
        category: "Audit",
        type: "MCQ",
        difficulty: "Pro",
        question: "Which standard deals with 'Quality Control' for an audit of financial statements?",
        options: ["ISA 200", "ISA 220", "ISA 315", "ISA 500"],
        correctAnswer: "ISA 220",
        explanation: "ISA 220 deals with Quality Control for an Audit of Financial Statements."
    },

    // =================================================================
    // AUDIT - TRUE/FALSE
    // =================================================================
    {
        id: "aud-tf-1",
        category: "Audit",
        type: "TRUE_FALSE",
        difficulty: "Beginner",
        question: "Internal auditors are responsible for issuing the final audit opinion on public financial statements.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "External auditors (independent CPAs/CAs) issue the final opinion on public financial statements, not internal auditors."
    },
    {
        id: "aud-tf-2",
        category: "Audit",
        type: "TRUE_FALSE",
        difficulty: "Intermediate",
        question: "Substantive procedures are designed to detect material misstatements at the assertion level.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Substantive procedures (tests of details and analytics) are specifically meant to detect misstatements."
    },
    {
        id: "aud-tf-3",
        category: "Audit",
        type: "TRUE_FALSE",
        difficulty: "Pro",
        question: "If an auditor is unable to obtain sufficient appropriate audit evidence, they must issue an Adverse Opinion.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "If unable to obtain evidence (scope limitation), the auditor typically issues a 'Disclaimer of Opinion', not necessarily Adverse."
    },

    // =================================================================
    // AUDIT - SCENARIOS
    // =================================================================
    {
        id: "aud-scn-1",
        category: "Audit",
        type: "SCENARIO",
        difficulty: "Intermediate",
        scenario: "You are auditing a manufacturing firm. You notice that the inventory turnover ratio has dropped significantly from 6.5 to 3.2 this year. Management claims this is due to 'strategic stockpiling' for a new product launch, but warehouse records show mostly old SKUs.",
        question: "What is the primary audit risk here?",
        options: ["Understatement of Liability", "Overstatement of Inventory (Obsolescence)", "Overstatement of Revenue", "Understatement of Cash"],
        correctAnswer: "Overstatement of Inventory (Obsolescence)",
        explanation: "A dropping turnover ratio with old SKUs suggests the inventory might be obsolete and should be written down, meaning it is currently overstated."
    },
    {
        id: "aud-scn-2",
        category: "Audit",
        type: "SCENARIO",
        difficulty: "Pro",
        scenario: "During the year-end cut-off test, you find that goods shipped on March 31st (FOB Destination) were recorded as sales on March 31st. The goods arrived at the customer's location on April 2nd.",
        question: "Is the revenue recognition correct?",
        options: ["Yes, verify shipping documents", "No, reverse sale and record in April", "Yes, if the customer agreed", "No, record as consignment"],
        correctAnswer: "No, reverse sale and record in April",
        explanation: "FOB Destination means title transfers upon delivery. Since delivery happened in April, revenue belongs in the next fiscal year."
    },

    // =================================================================
    // TAX - MCQs
    // =================================================================
    {
        id: "tax-mcq-1",
        category: "Tax",
        type: "MCQ",
        difficulty: "Beginner",
        question: "Which of the following is a Direct Tax?",
        options: ["GST", "Income Tax", "Customs Duty", "VAT"],
        correctAnswer: "Income Tax",
        explanation: "Income Tax is levied directly on the income of a person/entity. GST, Customs, and VAT are indirect taxes."
    },
    {
        id: "tax-mcq-2",
        category: "Tax",
        type: "MCQ",
        difficulty: "Intermediate",
        question: "Under GST, what is the 'Input Tax Credit'?",
        options: ["Tax paid on income", "Credit for tax paid on purchases", "Refund of export duty", "Subsidy from government"],
        correctAnswer: "Credit for tax paid on purchases",
        explanation: "ITC allows businesses to reduce their output tax liability by the amount of tax already paid on inputs."
    },
    {
        id: "tax-mcq-3",
        category: "Tax",
        type: "MCQ",
        difficulty: "Pro",
        question: "What is the consequence of failing to deduct TDS (Tax Deducted at Source) under Section 40(a)(ia)?",
        options: ["50% penalty", "Disallowance of 30% of the expenditure", "Imprisonment", "No consequence if paid later"],
        correctAnswer: "Disallowance of 30% of the expenditure",
        explanation: "Failure to deduct TDS results in 30% of the relevant expense being disallowed for tax deduction purposes."
    },

    // =================================================================
    // TAX - TRUE/FALSE
    // =================================================================
    {
        id: "tax-tf-1",
        category: "Tax",
        type: "TRUE_FALSE",
        difficulty: "Beginner",
        question: "All individuals must file an income tax return regardless of their income level.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "Individuals earning below the basic exemption limit are generally not required to file a return."
    },
    {
        id: "tax-tf-2",
        category: "Tax",
        type: "TRUE_FALSE",
        difficulty: "Intermediate",
        question: "Long-term capital gains (LTCG) on equity shares exceeding Rs. 1 Lakh are taxable at 10%.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Under current laws (Sec 112A), LTCG on listed equity above 1L is taxed at 10% without indexation."
    },

    // =================================================================
    // TAX - SCENARIOS
    // =================================================================
    {
        id: "tax-scn-1",
        category: "Tax",
        type: "SCENARIO",
        difficulty: "Intermediate",
        scenario: "Mr. Sharma pays a monthly house rent of ₹25,000. He also receives HRA from his employer. He lives in his own house in the same city but claims he pays rent to his wife.",
        question: "Can he claim HRA exemption?",
        options: ["Yes, if wife declares income", "No, this is a sham transaction", "Yes, up to 10%", "No, unless he lives separately"],
        correctAnswer: "No, this is a sham transaction",
        explanation: "Paying rent to a spouse while living together in a generic 'own house' scenario is often scrutinized as a colorable device to evade tax unless strictly documented and genuine."
    },

    // =================================================================
    // LAW - MCQs
    // =================================================================
    {
        id: "law-mcq-1",
        category: "Law",
        type: "MCQ",
        difficulty: "Beginner",
        question: "A contract without consideration is:",
        options: ["Valid", "Void", "Voidable", "Illegal"],
        correctAnswer: "Void",
        explanation: "General rule: 'Nudum Pactum' - an agreement without consideration is void (Sec 25 of Indian Contract Act)."
    },
    {
        id: "law-mcq-2",
        category: "Law",
        type: "MCQ",
        difficulty: "Intermediate",
        question: "Which document defines the constitution and scope of a company's powers?",
        options: ["Articles of Association", "Memorandum of Association", "Prospectus", "Share Certificate"],
        correctAnswer: "Memorandum of Association",
        explanation: "The MOA is the charter of the company that defines its authorized capital and scope of operations."
    },

    // =================================================================
    // LAW - TRUE/FALSE
    // =================================================================
    {
        id: "law-tf-1",
        category: "Law",
        type: "TRUE_FALSE",
        difficulty: "Beginner",
        question: "A minor can never be a partner in a partnership firm.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "A minor can be admitted to the 'benefits' of partnership with the consent of all partners."
    },

    // =================================================================
    // LAW - SCENARIOS
    // =================================================================
    {
        id: "law-scn-1",
        category: "Law",
        type: "SCENARIO",
        difficulty: "Intermediate",
        scenario: "X offers to sell his car to Y for ₹1 Lakh. Y says he will buy it for ₹80,000. X refuses. Y later says 'Okay, I will buy for ₹1 Lakh'.",
        question: "Is there a binding contract?",
        options: ["Yes, X's original offer stands", "No, Y's counter-offer killed original offer", "Yes, silence means acceptance", "No, price was too low"],
        correctAnswer: "No, Y's counter-offer killed original offer",
        explanation: "A counter-offer (80k) acts as a rejection of the original offer. The original offer no longer exists to be accepted."
    }
];

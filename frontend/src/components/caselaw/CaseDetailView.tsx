
import React, { useState } from 'react';
import { ArrowLeft, Calendar, FileText, CheckCircle, Send, Clock, Shield, Scale, MapPin } from 'lucide-react';

interface CaseDetailProps {
    caseId: string;
    onBack: () => void;
}

// Extended Mock Data for Demo
const CASE_DETAILS: Record<string, any> = {
    '1': {
        id: '1',
        title: 'CIT vs. Hindustan Coca Cola Beverages',
        category: 'Tax',
        judgmentDate: '25 Aug 2007',
        court: 'Supreme Court of India',
        difficulty: 'Intermediate',
        xpReward: 150,
        readTime: '8 min',
        summary: 'Supreme Court ruling on manufacturing deduction under Section 80IA for bottling operations.',
        timeline: [
            { year: '1998', event: 'Assessee claimed deduction u/s 80IA for bottling unit' },
            { year: '2000', event: 'Assessing Officer (AO) disallowed claim stating bottling is not manufacturing' },
            { year: '2002', event: 'CIT(A) ruled in favor of Assessee' },
            { year: '2005', event: 'High Court upheld CIT(A) decision' },
            { year: '2007', event: 'Supreme Court dismissed Revenue appeal, confirming bottling as manufacturing' }
        ],
        keyIssues: [
            'Whether the process of bottling beverage from concentrate constitutes "manufacturing"?',
            'Interpretation of Section 80IA regarding industrial undertakings.',
            'Distinction between "processing" and "manufacturing" in income tax law.'
        ],
        explanation: `
      ### Fact of the Case
      The respondent company was engaged in the business of manufacturing and sale of soft drinks. It claimed deduction under Section 80IA of the Income Tax Act, 1961, treating its bottling units as industrial undertakings engaged in manufacturing. The Assessing Officer denied the deduction, arguing that the process of essentially mixing concentrate with water and carbon dioxide did not amount to "manufacturing".

      ### Supreme Court's Analysis
      The Court observed the detailed process involved: water treatment, syrup preparation, mixing, carbonation, and bottling. The final product (carbonated beverage) was distinct in name, character, and use from the raw materials (concentrate, sugar, water).

      ### Judgment
      The Supreme Court held that the process amounted to "manufacture" because a new and distinct commodity was brought into existence. Therefore, the assessee was entitled to the deduction under Section 80IA.
      
      ### Significance
      This judgment settled the long-standing dispute regarding the manufacturing status of bottling plants, providing relief to the beverage industry.
    `
    },
    '2': {
        id: '2',
        title: 'Godrej & Boyce vs. State of Maharashtra',
        category: 'Tax',
        judgmentDate: '30 Oct 2008',
        court: 'Bombay High Court',
        difficulty: 'Beginner',
        xpReward: 100,
        readTime: '5 min',
        summary: 'VAT applicability on inter-state stock transfers between company branches.',
        timeline: [
            { year: '2004', event: 'Company transferred goods to branches in other states' },
            { year: '2005', event: 'Tax authorities demanded VAT, treating stock transfers as sales' },
            { year: '2008', event: 'High Court ruled that F-Form supported stock transfers are not sales' }
        ],
        keyIssues: [
            'Documentation requirements for Stock Transfers (Form F).',
            'Burden of proof on the dealer to prove movement of goods was not a sale.',
            'Constitutional validity of VAT on inter-state movements.'
        ],
        explanation: `
      ### Background
      Godrej & Boyce Mfg. Co. Ltd. transferred goods from its manufacturing unit in Maharashtra to its branches in other states. The Sales Tax authorities sought to levy tax, arguing these were inter-state sales disguised as stock transfers.

      ### Legal Provision
      Under the Central Sales Tax Act, stock transfers are not taxable if supported by Form F declarations.

      ### Verdict
      The High Court affirmed that once the dealer produces valid Form F declarations and proves that the goods were received by the branch for stock, the burden is discharged. The movement of goods cannot be taxed as a sale absent evidence to the contrary.
    `
    },
    '3': {
        id: '3',
        title: 'SEBI vs. Sahara India Real Estate Corp',
        category: 'Corporate Law',
        judgmentDate: '31 Aug 2012',
        court: 'Supreme Court of India',
        difficulty: 'Pro',
        xpReward: 250,
        readTime: '12 min',
        summary: 'Landmark judgment on public deposits and OFCD issuance regulations.',
        timeline: [
            { year: '2008', event: 'Sahara filed DRHP with SEBI for IPO' },
            { year: '2009', event: 'SEBI received complaint regarding OFCD issuance' },
            { year: '2011', event: 'SEBI ordered refund of money to investors' },
            { year: '2012', event: 'Supreme Court upheld SEBI order' },
            { year: '2014', event: 'Subrata Roy jailed for non-compliance' }
        ],
        keyIssues: [
            'Definition of "Public Issue" under Companies Act.',
            'SEBI\'s jurisdiction over unlisted companies issuing securities to >49 persons.',
            'Concept of Optionally Fully Convertible Debentures (OFCDs).'
        ],
        explanation: `
      ### The Scheme
      Sahara India Real Estate Corp issued Optionally Fully Convertible Debentures (OFCDs) to millions of investors, collecting over ₹24,000 crores. They claimed these were "private placements" and thus outside SEBI's jurisdiction.

      ### The Issue
      Under Section 67(3) of the Companies Act, 1956, any offer to 50 or more persons is deemed a public offer. Sahara had offered to millions.

      ### The Judgment
      The Supreme Court ruled brilliantly that Sahara utilized a loophole to bypass public scrutiny. By offering to millions, it was constructively a public issue. SEBI has jurisdiction to protect public interest even for unlisted companies in such cases. Use of the "private placement" route was a colorable device.
    `
    },
    '4': {
        id: '4',
        title: 'RBI vs. Vijaya Bank',
        category: 'Audit',
        judgmentDate: '15 Mar 2005',
        court: 'Supreme Court',
        difficulty: 'Intermediate',
        xpReward: 180,
        readTime: '10 min',
        summary: 'Banking regulations and audit requirements for loan provisioning',
        timeline: [
            { year: '2000', event: 'RBI Inspection flagged under-provisioning' },
            { year: '2002', event: 'Bank disputed provisioning norms for certain NPA accounts' },
            { year: '2005', event: 'Supreme Court clarified Prudential Norms applicability' }
        ],
        keyIssues: [
            'Income Recognition and Asset Classification (IRAC) norms.',
            'Auditor\'s duty to verify NPA classification.',
            'Overrides of Statutory Audit by RBI Inspection.'
        ],
        explanation: `
        This case dealt with the conflict between a Bank's statutory auditors and the RBI's inspection report. The Supreme Court emphasized that RBI guidelines on Prudential Norms are mandatory. An auditor cannot deviate from the objective criteria for NPA classification (90 days overdue) based on subjective satisfaction of realizability.
      `
    },
    '5': {
        id: '5',
        title: 'ICAI vs. Price Waterhouse',
        category: 'Audit',
        judgmentDate: '10 Jan 2018',
        court: 'Supreme Court / SEBI',
        difficulty: 'Pro',
        xpReward: 300,
        readTime: '15 min',
        summary: 'Professional ethics and independence requirements for auditors',
        timeline: [
            { year: '2009', event: 'Satyam Scam breaks out' },
            { year: '2010', event: 'ICAI initiates disciplinary proceedings against PW partners' },
            { year: '2018', event: 'SEBI bans PW from listing audits for 2 years' }
        ],
        keyIssues: [
            'Auditor Independence.',
            'Professional Misconduct under CA Act, 1949.',
            'Liability of Firm vs Liability of Partners.'
        ],
        explanation: `
        Following the Satyam scandal, questions arose about the role of statutory auditors. The key takeaway was that auditors must maintain professional skepticism. Blind reliance on management representations constitutes professional misconduct. The case highlighted that an audit firm can be held vicariously liable for the negligence of its partners in certain regulatory contexts (SEBI), though the CA Act primarily punishes individuals.
      `
    },
    '6': {
        id: '6',
        title: 'MCA vs. Satyam Computer Services',
        category: 'Audit',
        judgmentDate: '09 Jan 2009',
        court: 'CLB / NCLT',
        difficulty: 'Pro',
        xpReward: 350,
        readTime: '18 min',
        summary: 'Corporate governance failures and auditor responsibilities',
        timeline: [
            { year: '2008', event: 'Failed attempt to acquire Maytas' },
            { year: 'Jan 2009', event: 'Ramalinga Raju confesses to accounting fraud' },
            { year: 'Jan 2009', event: 'Government appoints new board' },
            { year: 'April 2009', event: 'Tech Mahindra acquires Satyam' }
        ],
        keyIssues: [
            'Falsification of Bank Balances.',
            'Breakdown of Audit Committee oversight.',
            'Role of Independent Directors.'
        ],
        explanation: `
        The Satyam case is known as India's Enron. The Chairman confessed to inflating cash balances by ₹7,000 crores. This case drastically changed Indian Corporate Law, leading to the Companies Act, 2013, which introduced class action suits, rotation of auditors, and stricter penalties for fraud. It serves as the ultimate case study for audit failure.
      `
    }
};

const CaseDetailView: React.FC<CaseDetailProps> = ({ caseId, onBack }) => {
    const [solution, setSolution] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const caseData = CASE_DETAILS[caseId];

    // Fallback if case not found
    if (!caseData) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-xl font-bold text-gray-800">Case not found.</h2>
                <button onClick={onBack} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
                    Go Back
                </button>
            </div>
        );
    }

    const handleSolutionSubmit = () => {
        if (!solution.trim()) return;
        setSubmitted(true);
        // Logic: In a real app, this would POST to backend.
        // Here, we just acknowledge receipt conceptually.
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in pb-20">

            {/* Navigation */}
            <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
            >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Explorer
            </button>

            {/* HEADER SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                {caseData.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border
                         ${caseData.difficulty === 'Pro' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                {caseData.difficulty}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                            {caseData.title}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <span>Judgment: {caseData.judgmentDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Scale className="w-5 h-5 text-gray-400" />
                                <span>{caseData.court}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" />
                                <span>{caseData.readTime} read</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-[120px]">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Shield className="w-5 h-5 text-yellow-500" />
                            <span className="font-bold text-gray-500 text-sm">REWARD</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{caseData.xpReward}</div>
                        <div className="text-xs text-gray-500 font-medium">XP POINTS</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: TIMELINE & ISSUES */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Timeline */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Case Timeline
                        </h3>
                        <div className="relative border-l-2 border-blue-100 ml-3 space-y-6 pl-6 py-2">
                            {caseData.timeline.map((item: any, idx: number) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                                    <span className="text-xs font-bold text-blue-600 block mb-1">{item.year}</span>
                                    <p className="text-sm text-gray-700 leading-snug">{item.event}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Issues */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-600" />
                            Key Issues
                        </h3>
                        <ul className="space-y-3">
                            {caseData.keyIssues.map((issue: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
                                    {issue}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* RIGHT COLUMN: EXPLANATION & SUBMISSION */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Detailed Explanation */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                            <FileText className="w-6 h-6 text-indigo-600" />
                            Detailed Explanation
                        </h3>
                        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {caseData.explanation}
                        </div>
                    </div>

                    {/* Solution Submission - CONCEPTUAL */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Your Interpretation
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            How would you apply this judgment in a real audit scenario? Write your key takeaways.
                        </p>

                        {!submitted ? (
                            <div className="space-y-4">
                                <textarea
                                    value={solution}
                                    onChange={(e) => setSolution(e.target.value)}
                                    placeholder="Write your analysis here..."
                                    className="w-full h-32 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 text-sm"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSolutionSubmit}
                                        disabled={!solution.trim()}
                                        className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Submit Analysis
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg p-6 border border-green-100 flex items-center gap-4 animate-fade-in-up">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-green-800">Interpretation Recorded</h4>
                                    <p className="text-sm text-green-700 mt-1">
                                        Great job! Your analysis has been saved to your learning log. (Conceptual)
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-xs text-indigo-600 font-medium mt-2 hover:underline"
                                    >
                                        Edit Response
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CaseDetailView;

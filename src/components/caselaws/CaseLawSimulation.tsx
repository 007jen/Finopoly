import React, { useState } from 'react';
import { 
  Scale, 
  Clock, 
  Award, 
  CheckCircle, 
  XCircle,
  BookOpen,
  Gavel,
  FileText,
  Lightbulb,
  Target
} from 'lucide-react';

const CaseLawSimulation: React.FC = () => {
  const [currentCase, setCurrentCase] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const caseLawScenarios = [
    {
      id: '1',
      title: 'Corporate Tax Deduction Dispute',
      category: 'Income Tax',
      difficulty: 'Intermediate',
      facts: `
        XYZ Ltd., a manufacturing company, claimed deduction of ₹50 lakhs under Section 80IA 
        for profits from industrial undertaking. The company operates a bottling plant for soft drinks. 
        The Assessing Officer denied the claim stating that bottling of beverages does not constitute 
        'manufacturing' as defined under the Income Tax Act.
        
        The company argued that the bottling process involves mixing of concentrate with water, 
        carbonation, and packaging, which creates a new product with distinctive characteristics.
      `,
      question: 'Based on established legal precedents, what would be the most likely outcome?',
      options: [
        'Deduction allowed - bottling constitutes manufacturing as it creates a new product',
        'Deduction denied - bottling is merely packaging and not manufacturing',
        'Partial deduction based on value addition percentage',
        'Matter to be decided based on specific facts of each case'
      ],
      correctAnswer: 'Deduction allowed - bottling constitutes manufacturing as it creates a new product',
      explanation: `
        The Supreme Court in CIT vs. Hindustan Coca Cola Beverages has consistently held that 
        bottling of beverages constitutes manufacturing. The process involves bringing into existence 
        a new product with distinctive name, character, and use. The mixing of concentrate with water, 
        carbonation, and bottling creates a commercially different product from the raw materials.
      `,
      legalReferences: [
        'CIT vs. Hindustan Coca Cola Beverages (SC)',
        'Section 80IA of Income Tax Act, 1961',
        'Manufacturing vs. Processing distinction'
      ],
      xpReward: 200
    },
    {
      id: '2',
      title: 'VAT on Inter-State Stock Transfer',
      category: 'Indirect Tax',
      difficulty: 'Beginner',
      facts: `
        ABC Enterprises has manufacturing units in Maharashtra and sales offices in Gujarat. 
        The company regularly transfers finished goods from the manufacturing unit to the sales office 
        for local distribution. The Maharashtra VAT department issued a show cause notice demanding 
        VAT on these inter-state stock transfers.
        
        The company contends that these are stock transfers between branches of the same legal entity 
        and no sale has taken place, hence VAT should not be applicable.
      `,
      question: 'What is the correct legal position regarding VAT on inter-state stock transfers?',
      options: [
        'VAT is applicable on all inter-state stock transfers',
        'No VAT as no sale has occurred between independent parties',
        'CST is applicable instead of VAT on inter-state transfers',
        'VAT applicable only if goods are sold within 6 months'
      ],
      correctAnswer: 'No VAT as no sale has occurred between independent parties',
      explanation: `
        Stock transfers between branches of the same legal entity do not constitute 'sale' 
        as there is no transfer of property from one person to another. VAT is levied on 'sale' 
        of goods, and without a sale, VAT cannot be imposed. However, CST may apply on 
        inter-state movement of goods for certain categories.
      `,
      legalReferences: [
        'Godrej & Boyce vs. State of Maharashtra',
        'Definition of Sale under VAT Acts',
        'Central Sales Tax Act provisions'
      ],
      xpReward: 150
    }
  ];

  const currentCaseData = caseLawScenarios[currentCase];

  const handleSubmitAnswer = () => {
    setShowResult(true);
    if (selectedAnswer === currentCaseData.correctAnswer) {
      setScore(score + currentCaseData.xpReward);
    }
  };

  const handleNextCase = () => {
    if (currentCase < caseLawScenarios.length - 1) {
      setCurrentCase(currentCase + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      // Reset to first case
      setCurrentCase(0);
      setSelectedAnswer('');
      setShowResult(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'from-green-500 to-emerald-500';
      case 'Intermediate': return 'from-yellow-500 to-orange-500';
      case 'Pro': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const isCorrect = selectedAnswer === currentCaseData.correctAnswer;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-purple-50/30 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Case Law Simulation</h1>
        <p className="text-gray-600 text-lg">Scenario-based learning for tax and corporate law</p>
      </div>

      {/* Case Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentCaseData.title}</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getDifficultyColor(currentCaseData.difficulty)}`}>
                  {currentCaseData.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {currentCaseData.category}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span>Case {currentCase + 1} of {caseLawScenarios.length}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
              <Award className="w-4 h-4" />
              <span>{currentCaseData.xpReward} XP</span>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCase + 1) / caseLawScenarios.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Case Facts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Case Facts</h3>
                <p className="text-gray-600">Review the following scenario carefully</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">{currentCaseData.facts}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Question</h3>
                <p className="text-gray-600">Choose the most appropriate legal interpretation</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200/50 mb-6">
              <p className="text-gray-800 font-medium text-lg">{currentCaseData.question}</p>
            </div>

            <div className="space-y-4 mb-8">
              {currentCaseData.options.map((option, index) => (
                <label 
                  key={index} 
                  className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedAnswer === option
                      ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100/50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                  } ${
                    showResult && option === currentCaseData.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : showResult && selectedAnswer === option && option !== currentCaseData.correctAnswer
                      ? 'border-red-500 bg-red-50'
                      : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="case-answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={showResult}
                    className="mt-1 text-purple-600 scale-125"
                  />
                  <span className="text-gray-700 font-medium leading-relaxed flex-1">{option}</span>
                  {showResult && option === currentCaseData.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {showResult && selectedAnswer === option && option !== currentCaseData.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </label>
              ))}
            </div>

            {showResult && (
              <div className={`rounded-xl p-6 mb-6 ${
                isCorrect
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
              }`}>
                <div className="flex items-start gap-4">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 mt-1" />
                  )}
                  <div>
                    <h4 className={`font-bold text-lg mb-3 ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {isCorrect ? 'Correct! Excellent legal reasoning! 🎉' : 'Incorrect. Let\'s learn from this!'}
                    </h4>
                    
                    {isCorrect && (
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-700">+{currentCaseData.xpReward} XP earned!</span>
                      </div>
                    )}
                    
                    <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                      <div className="flex items-start gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                        <h5 className="font-semibold text-gray-900">Legal Explanation</h5>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{currentCaseData.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Total Score: {score} XP
              </div>
              
              {!showResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Gavel className="w-4 h-4" />
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextCase}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Next Case
                  <Scale className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Legal References
            </h3>
            <div className="space-y-3">
              {currentCaseData.legalReferences.map((ref, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200/50">
                  <p className="text-purple-800 text-sm font-medium">{ref}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <h3 className="font-bold text-gray-900 mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cases Completed</span>
                <span className="font-bold text-gray-900">{currentCase + 1}/{caseLawScenarios.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total XP Earned</span>
                <span className="font-bold text-purple-600">{score} XP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-bold text-green-600">
                  {currentCase > 0 ? Math.round((score / (currentCase * 200)) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold mb-2">💡 Study Tip</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Focus on the legal principles and precedents. Consider the facts carefully 
              and apply established legal doctrines to reach the correct conclusion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseLawSimulation;
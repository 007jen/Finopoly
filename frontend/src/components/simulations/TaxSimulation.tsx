import React, { useState } from 'react';
import {
  Calculator,
  Download,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Award,
  Clock,
  Target,
  BookOpen,
  Lightbulb,
  Play,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface TaxSimulationProps {
  onBack?: () => void;
}

const TaxSimulation: React.FC<TaxSimulationProps> = ({ onBack }) => {
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showResult, setShowResult] = useState(false);

  const taxSimulations = [
    {
      id: 'tax-computation',
      title: 'Tax Computation Exercise',
      description: 'Calculate taxable income and tax liability using provided financial data',
      difficulty: 'Intermediate',
      xpReward: 300,
      timeLimit: 45,
      type: 'excel-based',
      caseFacts: `
        ABC Private Limited is a manufacturing company with the following financial details for FY 2023-24:
        
        • Gross Total Income: ₹25,00,000
        • Business Income: ₹20,00,000
        • Capital Gains (Long-term): ₹3,00,000
        • Income from Other Sources: ₹2,00,000
        • Deductions under Chapter VI-A: ₹1,50,000
        • Advance Tax Paid: ₹2,00,000
        • TDS Deducted: ₹50,000
        
        Additional Information:
        • The company is eligible for deduction under Section 80IC
        • Depreciation as per IT Act: ₹1,20,000
        • Brought forward losses: ₹80,000
      `,
      documents: [
        { name: 'P&L Statement', type: 'PDF', size: '2.4 MB' },
        { name: 'Balance Sheet', type: 'PDF', size: '1.8 MB' },
        { name: 'Tax Computation Template', type: 'Excel', size: '245 KB' }
      ]
    },
    {
      id: 'tax-case-study',
      title: 'Corporate Tax Planning Scenario',
      description: 'Analyze complex tax scenarios and provide strategic recommendations',
      difficulty: 'Pro',
      xpReward: 400,
      timeLimit: 60,
      type: 'step-by-step',
      caseFacts: `
        XYZ Corporation is planning a business restructuring and needs tax advice on:
        
        1. Transfer of assets between group companies
        2. Merger and acquisition tax implications
        3. Optimal tax structure for new subsidiary
        4. International taxation considerations
        
        Current Structure:
        • Parent Company: XYZ Corp (India)
        • Subsidiary 1: ABC Ltd (India) - 100% owned
        • Subsidiary 2: DEF Inc (Singapore) - 75% owned
        • Proposed acquisition: GHI Ltd (India)
      `,
      steps: [
        {
          id: 'asset-transfer',
          title: 'Asset Transfer Analysis',
          question: 'What are the tax implications of transferring assets worth ₹10 crores from XYZ Corp to ABC Ltd?',
          options: [
            'No tax implications as both are group companies',
            'Capital gains tax applicable on fair market value',
            'Transfer at book value with no immediate tax impact',
            'Depends on the nature of assets being transferred'
          ],
          correctAnswer: 'Depends on the nature of assets being transferred',
          explanation: 'Asset transfer taxation depends on whether assets are capital or revenue in nature, and specific provisions under Income Tax Act.'
        },
        {
          id: 'merger-implications',
          title: 'Merger Tax Planning',
          question: 'For the proposed acquisition of GHI Ltd, which tax structure would be most beneficial?',
          options: [
            'Asset purchase to avoid hidden liabilities',
            'Share purchase for continuity of tax benefits',
            'Merger under Section 2(1B) for tax neutrality',
            'Slump sale for simplified tax treatment'
          ],
          correctAnswer: 'Merger under Section 2(1B) for tax neutrality',
          explanation: 'Merger under Section 2(1B) provides tax neutrality and allows carry forward of losses and unabsorbed depreciation.'
        }
      ]
    }
  ];

  const handleSimulationSelect = (simulationId: string) => {
    setActiveSimulation(simulationId);
    setCurrentStep(0);
    setAnswers({});
    setShowResult(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleStepAnswer = (stepId: string, answer: string) => {
    setAnswers({ ...answers, [stepId]: answer });
  };

  const handleSubmitStep = () => {
    setShowResult(true);
    setTimeout(() => {
      const simulation = taxSimulations.find(s => s.id === activeSimulation);
      if (simulation && simulation.type === 'step-by-step' && currentStep < simulation.steps!.length - 1) {
        setCurrentStep(currentStep + 1);
        setShowResult(false);
      }
    }, 2000);
  };

  const downloadTemplate = () => {
    // In a real app, this would download an actual Excel template
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Tax_Computation_Template.xlsx';
    link.click();
  };

  if (!activeSimulation) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-green-50/30 min-h-screen">
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/50 rounded-full transition-colors text-gray-400 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Simulation Hub</h1>
            <p className="text-gray-600 text-lg">Master tax computation and planning through practical exercises</p>
          </div>
        </div>

        {/* Simulation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {taxSimulations.map((simulation) => (
            <div
              key={simulation.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 group cursor-pointer"
              onClick={() => handleSimulationSelect(simulation.id)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${simulation.difficulty === 'Intermediate' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}>
                  {simulation.difficulty}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                {simulation.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{simulation.description}</p>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{simulation.timeLimit} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">{simulation.xpReward} XP</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {simulation.type === 'excel-based' ? 'Excel-based Exercise' : 'Step-by-step Analysis'}
                </div>
                <div className="flex items-center gap-2 text-green-600 group-hover:gap-3 transition-all font-semibold">
                  <Play className="w-4 h-4" />
                  Start Simulation
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 text-center">
            <Calculator className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <div className="text-2xl font-bold text-gray-900 mb-2">12</div>
            <p className="text-gray-600">Tax Simulations</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 text-center">
            <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <div className="text-2xl font-bold text-gray-900 mb-2">85%</div>
            <p className="text-gray-600">Average Score</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 text-center">
            <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <div className="text-2xl font-bold text-gray-900 mb-2">2,450</div>
            <p className="text-gray-600">XP Available</p>
          </div>
        </div>
      </div>
    );
  }

  const currentSimulation = taxSimulations.find(s => s.id === activeSimulation)!;

  if (currentSimulation.type === 'excel-based') {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-green-50/30 min-h-screen">
        <div className="mb-8">
          <button
            onClick={() => setActiveSimulation(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
          >
            ← Back to Simulations
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentSimulation.title}</h1>
          <p className="text-gray-600 text-lg">{currentSimulation.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Case Facts */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Case Facts</h3>
                  <p className="text-gray-600">Review the financial information carefully</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
                <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {currentSimulation.caseFacts}
                </pre>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Supporting Documents</h3>
              <div className="space-y-4">
                {currentSimulation.documents?.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workspace */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tax Computation Workspace</h3>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Calculator className="w-6 h-6 text-green-600" />
                    <h4 className="font-bold text-green-900">Download Excel Template</h4>
                  </div>
                  <p className="text-green-800 mb-4">
                    Use our pre-formatted Excel template to compute the tax liability step by step.
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload your completed Excel file</p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2 font-semibold"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </label>
                </div>

                {uploadedFile && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">File Uploaded Successfully</p>
                        <p className="text-sm text-green-700">{uploadedFile.name}</p>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl">
                      <Target className="w-4 h-4" />
                      Submit for Evaluation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step-by-step simulation
  const currentStepData = currentSimulation.steps![currentStep];
  const isCorrect = answers[currentStepData.id] === currentStepData.correctAnswer;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-green-50/30 min-h-screen">
      <div className="mb-8">
        <button
          onClick={() => setActiveSimulation(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
        >
          ← Back to Simulations
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentSimulation.title}</h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-600">Step {currentStep + 1} of {currentSimulation.steps!.length}</p>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / currentSimulation.steps!.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentStepData.title}</h2>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200/50">
              <p className="text-gray-800 text-lg leading-relaxed">{currentStepData.question}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {currentStepData.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${answers[currentStepData.id] === option
                  ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100/50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                  } ${showResult && option === currentStepData.correctAnswer
                    ? 'border-green-500 bg-green-50'
                    : showResult && answers[currentStepData.id] === option && option !== currentStepData.correctAnswer
                      ? 'border-red-500 bg-red-50'
                      : ''
                  }`}
              >
                <input
                  type="radio"
                  name={`step-${currentStepData.id}`}
                  value={option}
                  checked={answers[currentStepData.id] === option}
                  onChange={(e) => handleStepAnswer(currentStepData.id, e.target.value)}
                  disabled={showResult}
                  className="mt-1 text-green-600 scale-125"
                />
                <span className="text-gray-700 font-medium leading-relaxed flex-1">{option}</span>
                {showResult && option === currentStepData.correctAnswer && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {showResult && answers[currentStepData.id] === option && option !== currentStepData.correctAnswer && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </label>
            ))}
          </div>

          {showResult && (
            <div className={`rounded-xl p-6 mb-6 ${isCorrect
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
                  <h4 className={`font-bold text-lg mb-3 ${isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                    {isCorrect ? 'Excellent! Correct Answer! 🎉' : 'Incorrect. Let\'s learn from this!'}
                  </h4>

                  {isCorrect && (
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-700">+{Math.floor(currentSimulation.xpReward / currentSimulation.steps!.length)} XP earned!</span>
                    </div>
                  )}

                  <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                    <div className="flex items-start gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                      <h5 className="font-semibold text-gray-900">Explanation</h5>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{currentStepData.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Progress: {currentStep + 1}/{currentSimulation.steps!.length} steps
            </div>

            {!showResult ? (
              <button
                onClick={handleSubmitStep}
                disabled={!answers[currentStepData.id]}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Target className="w-4 h-4" />
                Submit Answer
              </button>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">
                  {currentStep < currentSimulation.steps!.length - 1 ? 'Next step in 2 seconds...' : 'Simulation completed!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxSimulation;
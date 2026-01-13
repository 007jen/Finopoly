import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  Clock,
  Target,
  Award,
  ArrowRight,
  Play,
  BookOpen,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

const AuditArena: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const auditSteps = [
    {
      id: 'planning',
      title: 'Audit Planning',
      description: 'Review client information and plan audit approach',
      icon: Target,
      color: 'from-blue-500 to-indigo-500',
      tasks: [
        'Analyze client business and industry',
        'Assess audit risks and materiality',
        'Plan audit procedures'
      ]
    },
    {
      id: 'vouching',
      title: 'Vouching & Verification',
      description: 'Examine supporting documents and verify transactions',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      tasks: [
        'Vouch sales transactions',
        'Verify purchase invoices',
        'Check bank reconciliations'
      ]
    },
    {
      id: 'verification',
      title: 'Asset Verification',
      description: 'Verify existence and valuation of assets',
      icon: CheckCircle,
      color: 'from-purple-500 to-violet-500',
      tasks: [
        'Physical verification of inventory',
        'Confirm receivables',
        'Verify fixed assets'
      ]
    },
    {
      id: 'reporting',
      title: 'Audit Reporting',
      description: 'Prepare audit findings and draft report',
      icon: BookOpen,
      color: 'from-orange-500 to-red-500',
      tasks: [
        'Document audit findings',
        'Prepare management letter',
        'Draft audit opinion'
      ]
    }
  ];

  const currentStepData = auditSteps[currentStep];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles([...uploadedFiles, ...fileNames]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < auditSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tracking-tight">Audit Simulation Arena</h1>
        <p className="text-gray-500 font-medium text-sm sm:text-lg">Immersive workspace for practical audit training</p>
      </div>

      {/* Progress Steps - Scrollable on Mobile */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-5 sm:p-6 mb-6 sm:mb-8 shadow-xl border border-white/50 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Audit Process</h2>
          <div className="text-xs sm:text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-wider">
            Step {currentStep + 1} / {auditSteps.length}
          </div>
        </div>

        <div className="overflow-x-auto pb-4 -mb-4">
          <div className="flex items-center min-w-max px-2">
            {auditSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${isActive
                    ? `bg-gradient-to-r ${step.color} shadow-lg scale-110 ring-4 ring-white`
                    : isCompleted
                      ? 'bg-emerald-500 shadow-md ring-2 ring-emerald-100'
                      : 'bg-gray-100 text-gray-300'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </div>
                  {index < auditSteps.length - 1 && (
                    <div className={`w-12 sm:w-16 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-100'
                      }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Panel - Instructions & Tasks */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 sm:p-8 shadow-xl border border-white/50">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-lg shrink-0`}>
                <currentStepData.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tight">{currentStepData.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">{currentStepData.description}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 sm:p-6 border border-blue-100/50">
              <h4 className="font-black text-blue-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Target className="w-4 h-4" />
                Key Tasks
              </h4>
              <ul className="space-y-3">
                {currentStepData.tasks.map((task, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-white text-[10px] font-black">{index + 1}</span>
                    </div>
                    <span className="text-gray-700 font-bold text-sm">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 sm:p-8 shadow-xl border border-white/50">
            <h3 className="text-lg font-black text-gray-900 mb-4 tracking-tight">Document Upload</h3>

            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 sm:p-8 text-center hover:border-blue-500 hover:bg-blue-50/5 transition-all group cursor-pointer relative">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="file-upload"
              />
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-gray-500 text-sm mb-4 font-medium">Upload Tally backup or Financial Statements</p>
              <span className="inline-block bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm group-hover:border-blue-200 group-hover:text-blue-700 transition-all">
                Choose Files
              </span>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-6 animate-in slide-in-from-bottom-2">
                <h4 className="font-bold text-gray-900 text-sm mb-3">Uploaded Files:</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="p-1.5 bg-white rounded-lg">
                        <FileText className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-emerald-800 text-sm font-bold truncate">{file}</span>
                      <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Workspace */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 sm:p-8 shadow-xl border border-white/50">
            <h3 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Assignment Workspace</h3>

            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-5 sm:p-6 border border-gray-100 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-bl-[4rem] opacity-50 -mr-4 -mt-4"></div>
              <div className="flex items-center gap-3 mb-3 relative">
                <div className="p-2 bg-white rounded-lg shadow-sm text-orange-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="font-black text-gray-900 uppercase tracking-wide text-xs">Current Mission</h4>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm font-medium mb-4 relative z-10">
                Review the uploaded financial statements for ABC Manufacturing Ltd.
                Identify potential audit risks and plan your audit approach for the current year.
              </p>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider relative z-10">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>45m</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Award className="w-3.5 h-3.5" />
                  <span>300 XP</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Your Analysis & Findings
                </label>
                <textarea
                  value={answers[currentStepData.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [currentStepData.id]: e.target.value })}
                  placeholder="Document your findings, observations, and planned procedures..."
                  className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 text-sm font-medium outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/50">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h5 className="font-black text-amber-800 text-xs uppercase tracking-wider mb-1">Pro Tip</h5>
                    <p className="text-amber-700/80 text-xs font-bold leading-relaxed">
                      Focus on materiality thresholds and risk assessment. Consider industry-specific factors
                      that might affect your audit approach.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95">
              <CheckCircle className="w-4 h-4" />
              Submit Step
            </button>

            {currentStep < auditSteps.length - 1 && (
              <button
                onClick={handleNextStep}
                className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-4 rounded-2xl hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 flex items-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditArena;
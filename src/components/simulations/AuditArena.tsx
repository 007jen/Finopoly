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
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Simulation Arena</h1>
        <p className="text-gray-600 text-lg">Immersive workspace for practical audit training</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Audit Process</h2>
          <div className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {auditSteps.length}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {auditSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${isActive
                    ? `bg-gradient-to-r ${step.color} shadow-lg scale-110`
                    : isCompleted
                      ? 'bg-green-500 shadow-md'
                      : 'bg-gray-200'
                  }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  )}
                </div>
                {index < auditSteps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Instructions & Tasks */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-r ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <currentStepData.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h3>
                <p className="text-gray-600 leading-relaxed">{currentStepData.description}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50">
              <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Key Tasks
              </h4>
              <ul className="space-y-3">
                {currentStepData.tasks.map((task, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-800 font-medium">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Document Upload</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload Tally backup, Financial Statements, or supporting documents</p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2 font-semibold"
              >
                <Upload className="w-4 h-4" />
                Choose Files
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Uploaded Files:</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-green-800 text-sm font-medium">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Workspace */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Assignment Workspace</h3>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h4 className="font-bold text-gray-900">Current Assignment</h4>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Review the uploaded financial statements for ABC Manufacturing Ltd.
                Identify potential audit risks and plan your audit approach for the current year.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>45 minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>300 XP</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Analysis & Findings
                </label>
                <textarea
                  value={answers[currentStepData.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [currentStepData.id]: e.target.value })}
                  placeholder="Document your findings, observations, and planned procedures..."
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-yellow-800 mb-1">Pro Tip</h5>
                    <p className="text-yellow-700 text-sm">
                      Focus on materiality thresholds and risk assessment. Consider industry-specific factors
                      that might affect your audit approach.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl">
              <CheckCircle className="w-5 h-5" />
              Submit Step
            </button>

            {currentStep < auditSteps.length - 1 && (
              <button
                onClick={handleNextStep}
                className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 font-semibold"
              >
                Next Step
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
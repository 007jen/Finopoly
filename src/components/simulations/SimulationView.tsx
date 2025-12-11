import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  MessageSquare,
  Send,
  Award,
  Target,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { mockAuditCases } from '../../data/mockData';
import { AuditCase, Task } from '../../types';

interface SimulationViewProps {
  caseId: string;
  onBack: () => void;
}

const SimulationView: React.FC<SimulationViewProps> = ({ caseId, onBack }) => {
  const auditCase = mockAuditCases.find(c => c.id === caseId);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState(auditCase?.documents[0]);

  if (!auditCase) {
    return <div>Case not found</div>;
  }

  const currentTask = auditCase.tasks[currentTaskIndex];

  const handleAnswerChange = (taskId: string, answer: any) => {
    setAnswers({ ...answers, [taskId]: answer });
  };

  const handleSubmitTask = (task: Task) => {
    setCompletedTasks(new Set([...completedTasks, task.id]));
    setShowFeedback(task.id);

    // Auto-move to next task after 2 seconds
    setTimeout(() => {
      setShowFeedback(null);
      if (currentTaskIndex < auditCase.tasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
      }
    }, 2000);
  };

  const renderTask = (task: Task) => {
    const userAnswer = answers[task.id];
    const isCompleted = completedTasks.has(task.id);
    const isShowingFeedback = showFeedback === task.id;

    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/50 p-8 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Task {currentTaskIndex + 1} of {auditCase.tasks.length}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Target className="w-4 h-4" />
                <span>Audit Assertion Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <Award className="w-4 h-4" />
                <span>{task.points} points</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Progress</div>
            <div className="w-24 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentTaskIndex + 1) / auditCase.tasks.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200/50">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Question</h4>
              <p className="text-gray-800 leading-relaxed text-lg">{task.question}</p>
            </div>
          </div>
        </div>

        {task.type === 'mcq' && (
          <div className="space-y-4 mb-8">
            {task.options?.map((option, index) => (
              <label key={index} className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${userAnswer === option
                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100/50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                }`}>
                <input
                  type="radio"
                  name={`task-${task.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswerChange(task.id, e.target.value)}
                  className="mt-1 text-blue-600 scale-125"
                />
                <span className="text-gray-700 font-medium leading-relaxed">{option}</span>
              </label>
            ))}
          </div>
        )}

        {task.type === 'checkbox' && (
          <div className="space-y-4 mb-8">
            {task.options?.map((option, index) => (
              <label key={index} className={`flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${userAnswer?.includes(option)
                ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100/50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                }`}>
                <input
                  type="checkbox"
                  value={option}
                  checked={userAnswer?.includes(option) || false}
                  onChange={(e) => {
                    const currentAnswers = userAnswer || [];
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a: string) => a !== option);
                    handleAnswerChange(task.id, newAnswers);
                  }}
                  className="mt-1 text-blue-600 scale-125"
                />
                <span className="text-gray-700 font-medium leading-relaxed">{option}</span>
              </label>
            ))}
          </div>
        )}

        {task.type === 'descriptive' && (
          <div className="mb-8">
            <textarea
              value={userAnswer || ''}
              onChange={(e) => handleAnswerChange(task.id, e.target.value)}
              placeholder="Type your detailed answer here..."
              className="w-full h-40 p-6 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium leading-relaxed"
            />
          </div>
        )}

        {isShowingFeedback && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <p className="font-bold text-green-800 text-lg mb-2">Excellent work! 🎉</p>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">+{task.points} XP earned!</span>
                </div>
                <div className="bg-white/80 rounded-lg p-4 border border-green-200/50">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-green-600 mt-0.5" />
                    <p className="text-green-700 font-medium">{task.hint}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all">
            <MessageSquare className="w-4 h-4" />
            Ask Mentor
          </button>

          {!isCompleted && (
            <button
              onClick={() => handleSubmitTask(task)}
              disabled={!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Send className="w-4 h-4" />
              Submit Response
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200/50 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Simulations
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{auditCase.title}</h1>
              <p className="text-gray-600 font-medium">{auditCase.company}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="font-bold text-orange-700">32:45</span>
            </div>
            <div className="text-sm font-medium text-gray-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
              Progress: {completedTasks.size}/{auditCase.tasks.length} tasks
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Panel - Documents */}
        <div className="w-full lg:w-1/4 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 p-4 shadow-xl overflow-y-auto max-h-[30vh] lg:max-h-full">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Case Documents</h2>

          <div className="space-y-3 mb-6">
            {auditCase.documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocument(doc)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${selectedDocument?.id === doc.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 text-xs mb-0.5">{doc.name}</p>
                    <p className="text-gray-500 text-[10px] leading-relaxed line-clamp-2">{doc.preview}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedDocument && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm">{selectedDocument.name}</h3>
                <button className="text-blue-600 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 transition-all">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 h-48 flex items-center justify-center border border-gray-200">
                <div className="text-center text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium text-xs">Document Preview</p>
                  <p className="text-[10px] mt-1 leading-relaxed px-2">{selectedDocument.preview}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Tasks */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
          <div className="max-w-4xl mx-auto">
            {renderTask(currentTask)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationView;
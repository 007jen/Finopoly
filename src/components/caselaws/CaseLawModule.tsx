import React, { useState } from 'react';
import { 
  Scale, 
  Clock, 
  Award, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  BookOpen,
  Calendar
} from 'lucide-react';
import { mockCaseLaws } from '../../data/mockData';
import { CaseLaw } from '../../types';

const CaseLawModule: React.FC = () => {
  const [currentCase, setCurrentCase] = useState<CaseLaw>(mockCaseLaws[0]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);

  const handleSubmitAnswer = () => {
    setShowResult(true);
    if (selectedAnswer === currentCase.correctAnswer) {
      setDailyChallengeCompleted(true);
    }
  };

  const handleNextCase = () => {
    const nextIndex = mockCaseLaws.findIndex(c => c.id === currentCase.id) + 1;
    if (nextIndex < mockCaseLaws.length) {
      setCurrentCase(mockCaseLaws[nextIndex]);
    } else {
      setCurrentCase(mockCaseLaws[0]);
    }
    setSelectedAnswer('');
    setShowResult(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Pro': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Case Law Simulations</h1>
        <p className="text-gray-600">Learn from landmark judgments and legal precedents</p>
      </div>

      {/* Daily Challenge Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-semibold">Daily Challenge</h2>
              <p className="opacity-90">Complete today's case law challenge for bonus XP</p>
            </div>
          </div>
          <div className="text-right">
            {dailyChallengeCompleted ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">Completed!</span>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">+200 XP</div>
                <div className="text-sm opacity-90">Bonus reward</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentCase.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentCase.difficulty)}`}>
                    {currentCase.difficulty}
                  </span>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {currentCase.category}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {currentCase.xpReward} XP
                  </div>
                </div>
              </div>
              <Scale className="w-8 h-8 text-blue-600" />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Case Facts:</h3>
                <p className="text-gray-700 leading-relaxed">{currentCase.facts}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Question:</h3>
                <p className="text-gray-700 mb-4">{currentCase.question}</p>

                <div className="space-y-3">
                  {currentCase.options.map((option, index) => (
                    <label 
                      key={index} 
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAnswer === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } ${
                        showResult && option === currentCase.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : showResult && selectedAnswer === option && option !== currentCase.correctAnswer
                          ? 'border-red-500 bg-red-50'
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="caselaw-answer"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        disabled={showResult}
                        className="mt-1"
                      />
                      <span className="text-gray-700 flex-1">{option}</span>
                      {showResult && option === currentCase.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {showResult && selectedAnswer === option && option !== currentCase.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {showResult && (
            <div className={`rounded-xl p-6 ${
              selectedAnswer === currentCase.correctAnswer
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {selectedAnswer === currentCase.correctAnswer ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 mt-1" />
                )}
                <div>
                  <h3 className={`font-semibold mb-2 ${
                    selectedAnswer === currentCase.correctAnswer ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {selectedAnswer === currentCase.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className="text-gray-700 mb-3">{currentCase.explanation}</p>
                  {selectedAnswer === currentCase.correctAnswer && (
                    <div className="text-sm text-green-700">
                      🎉 You earned {currentCase.xpReward} XP!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Try Another Case
            </button>
            
            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextCase}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Case
              </button>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Tips</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Read the facts carefully</li>
              <li>• Consider legal precedents</li>
              <li>• Think about the core legal principle</li>
              <li>• Eliminate obviously wrong options</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {['Income Tax', 'Indirect Tax', 'Corporate Law', 'Audit & Assurance'].map((category) => (
                <button
                  key={category}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cases Completed</span>
                <span className="font-semibold">23</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Accuracy Rate</span>
                <span className="font-semibold text-green-600">92%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Streak</span>
                <span className="font-semibold text-orange-600">5 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseLawModule;
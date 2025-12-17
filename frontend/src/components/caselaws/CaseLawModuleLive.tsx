import React, { useState, useEffect } from 'react';
import {
  Scale,
  Award,
  CheckCircle,
  XCircle,
  BookOpen,
  Calendar,
  Sparkles,
  Clock
} from 'lucide-react';
import { db } from '../../lib/database';
import { useActivity } from '../../hooks/useActivity';
import { useAuth } from '../../context/AuthContext';
import Timer from '../common/Timer';

const CaseLawModuleLive: React.FC = () => {
  const { user } = useAuth();
  const { completeActivity, loading: submitting } = useActivity();
  const [caseLaws, setCaseLaws] = useState<any[]>([]);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    loadCaseLaws();
  }, [user]);

  const loadCaseLaws = async () => {
    setLoading(true);
    try {
      const data = await db.getCaseLaws(user?.level);
      setCaseLaws(data);
    } catch (error) {
      console.error('Error loading case laws:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentCase = caseLaws[currentCaseIndex];

  const handleSubmitAnswer = async () => {
    if (!currentCase || !selectedAnswer) return;

    setShowResult(true);
    const isCorrect = selectedAnswer === currentCase.correct_answer;
    const score = isCorrect ? 100 : 0;
    const xpEarned = isCorrect ? currentCase.xp_reward : Math.floor(currentCase.xp_reward * 0.3);

    if (isCorrect) {
      setEarnedXP(xpEarned);
      setShowXPAnimation(true);
      setTimeout(() => setShowXPAnimation(false), 3000);
    }

    try {
      await completeActivity(
        'caselaw',
        currentCase.id,
        score,
        xpEarned,
        { selected: selectedAnswer, correct: currentCase.correct_answer }
      );
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNextCase = () => {
    if (currentCaseIndex < caseLaws.length - 1) {
      setCurrentCaseIndex(currentCaseIndex + 1);
    } else {
      setCurrentCaseIndex(0);
    }
    setSelectedAnswer('');
    setShowResult(false);
    setTimerKey(prev => prev + 1);
  };

  const handleTimeUp = () => {
    if (!showResult) {
      alert('Time is up! Please submit your answer.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Pro': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (caseLaws.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <Scale className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Case Laws Available</h2>
          <p className="text-gray-600">Check back soon for new case law challenges!</p>
        </div>
      </div>
    );
  }

  if (!currentCase) return null;

  const isCorrect = showResult && selectedAnswer === currentCase.correct_answer;
  const options = currentCase.options;

  return (
    <div className="p-3 sm:p-4 md:p-6 relative">
      {showXPAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 sm:px-8 py-4 sm:py-6 rounded-2xl shadow-2xl transform animate-bounce">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="text-2xl sm:text-3xl font-bold">+{earnedXP} XP</span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Case Law Simulations</h1>
        <p className="text-sm sm:text-base text-gray-600">Learn from landmark judgments</p>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Case {currentCaseIndex + 1} of {caseLaws.length}</h2>
              <p className="text-sm opacity-90 hidden sm:block">Complete cases to earn XP</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xl sm:text-2xl font-bold">+{currentCase.xp_reward} XP</div>
            <div className="text-xs sm:text-sm opacity-90">Reward</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-3">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{currentCase.title}</h2>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentCase.difficulty)}`}>
                    {currentCase.difficulty}
                  </span>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">{currentCase.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {currentCase.xp_reward} XP
                  </div>
                </div>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-xl px-3 py-2 self-end sm:self-start">
                <Timer
                  key={timerKey}
                  initialSeconds={15 * 60}
                  onTimeUp={handleTimeUp}
                  autoStart={true}
                />
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Facts of the Case</h3>
              <p className="text-gray-700 leading-relaxed">{currentCase.facts}</p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Question</h3>
              <p className="text-gray-800">{currentCase.question}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select your answer:</h3>
              {options.map((option: string, index: number) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = showResult && option === currentCase.correct_answer;
                const isWrongSelection = showResult && isSelected && option !== currentCase.correct_answer;

                return (
                  <button
                    key={index}
                    onClick={() => !showResult && setSelectedAnswer(option)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isCorrectOption
                        ? 'border-green-500 bg-green-50'
                        : isWrongSelection
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{option}</span>
                      {isCorrectOption && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {isWrongSelection && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className={`mt-6 p-6 rounded-xl border-l-4 ${
                isCorrect ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'
              }`}>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-green-900">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="text-red-900">Incorrect</span>
                    </>
                  )}
                </h3>
                <p className="text-gray-700 leading-relaxed">{currentCase.explanation}</p>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              {!showResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || submitting}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                >
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              ) : (
                <button
                  onClick={handleNextCase}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                >
                  Next Case
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Cases Completed</span>
                  <span className="font-semibold text-gray-900">{currentCaseIndex} / {caseLaws.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(currentCaseIndex / caseLaws.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total XP Available</span>
                <span className="font-bold text-blue-600">{caseLaws.reduce((sum, c) => sum + c.xp_reward, 0)} XP</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
            <Scale className="w-12 h-12 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Legal Tip</h3>
            <p className="text-sm opacity-90">
              Always read the facts carefully and identify the key legal principles before selecting your answer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseLawModuleLive;

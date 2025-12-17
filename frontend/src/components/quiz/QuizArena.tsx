import React, { useState } from 'react';
import {
  Zap,
  Clock,
  Trophy,
  Star,
  Play,
  Target,
  Brain,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { xpService } from '../../_xp/xp-service';
import { useAccuracy } from '../../_accuracy/accuracy-context';
import { useLeaderboard } from '../../hooks/useLeaderboard';

const QuizArena: React.FC = () => {
  const { user } = useAuth();
  const { updateUserStats } = useLeaderboard();
  const { incrementCorrect, incrementTotal } = useAccuracy();
  const [selectedMode, setSelectedMode] = useState<'mcq' | 'truefalse' | 'simulation' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [score, setScore] = useState(0);

  const quizModes = [
    {
      id: 'mcq',
      title: 'Multiple Choice',
      description: 'Test your knowledge with MCQ questions',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      questions: 15,
      timeLimit: 20,
      xpReward: 1500 // 100 per question
    },
    {
      id: 'truefalse',
      title: 'True/False',
      description: 'Quick-fire true or false questions',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      questions: 20,
      timeLimit: 15,
      xpReward: 1000 // 50 per question
    },
    {
      id: 'simulation',
      title: 'Case Simulation',
      description: 'Real-world scenario-based questions',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      questions: 10,
      timeLimit: 30,
      xpReward: 1500 // 150 per question
    }
  ];

  const sampleQuestions = {
    mcq: [
      {
        question: "Which of the following is NOT a fundamental audit assertion?",
        options: ["Existence", "Completeness", "Accuracy", "Profitability"],
        correct: "Profitability",
        explanation: "Profitability is not a fundamental audit assertion. The basic assertions are existence, completeness, accuracy, valuation, rights & obligations, and presentation."
      },
      {
        question: "Under which section of the Companies Act 2013 is audit committee mandatory?",
        options: ["Section 177", "Section 178", "Section 179", "Section 180"],
        correct: "Section 177",
        explanation: "Section 177 of the Companies Act 2013 mandates the constitution of audit committee for certain classes of companies."
      }
    ],
    truefalse: [
      {
        question: "An auditor can accept gifts from the client without affecting independence.",
        options: ["True", "False"],
        correct: "False",
        explanation: "Accepting gifts from clients can compromise auditor independence and is generally prohibited under professional ethics."
      }
    ],
    simulation: [
      {
        question: "You are auditing a manufacturing company and notice significant inventory write-offs in Q4. The management claims it's due to obsolescence. What should be your primary concern?",
        options: [
          "Verify the physical existence of written-off inventory",
          "Check if write-offs are properly authorized and documented",
          "Assess the reasonableness of obsolescence claims",
          "All of the above"
        ],
        correct: "All of the above",
        explanation: "In this scenario, all aspects need to be verified - physical existence, proper authorization, and reasonableness of obsolescence claims."
      }
    ]
  };

  const handleModeSelect = (mode: 'mcq' | 'truefalse' | 'simulation') => {
    setSelectedMode(mode);
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setShowResult(false);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    const questions = selectedMode ? sampleQuestions[selectedMode] : [];
    const currentQ = questions[currentQuestion];

    if (selectedAnswer === currentQ?.correct) {
      setScore(score + 1);

      // Award XP based on mode
      let xpEarned = 0;
      if (selectedMode === 'mcq') {
        xpEarned = 100;
        xpService.increment(100, `Quiz: MCQ Correct Answer`);
      } else if (selectedMode === 'truefalse') {
        xpEarned = 50;
        xpService.increment(50, `Quiz: T/F Correct Answer`);
      } else if (selectedMode === 'simulation') {
        xpEarned = 150;
        xpService.increment(150, `Quiz: Simulation Correct Answer`);
      }

      // Update Leaderboard Stats (1 correct answer, 1 total question attempt)
      // Note: We pass 0 for XP here because LeaderboardContext now auto-syncs XP from the Global XP system.
      // We only need this call to update the Accuracy stats (correct/total).
      if (user?.name) { // Simple user check
        updateUserStats(user.name, 0, 1, 1);
      }
      incrementCorrect(); // Update global accuracy
    } else {
      // Incorrect answer: 0 XP, 0 correct, 1 total
      if (user?.name) {
        updateUserStats(user.name, 0, 0, 1);
      }
      incrementTotal(); // Update global accuracy
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
        setShowResult(false);
      } else {
        // Quiz completed
        setQuizStarted(false);
        setSelectedMode(null);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setSelectedMode(null);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setShowResult(false);
  };

  if (quizStarted && selectedMode) {
    const questions = sampleQuestions[selectedMode];
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ?.correct;

    return (
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30">
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          {/* Quiz Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {quizModes.find(m => m.id === selectedMode)?.title} Quiz
                </h1>
                <p className="text-gray-600 text-lg">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">15:30</span>
                </div>
                <div className="text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-xl">
                  Score: <span className="font-bold">{score}/{questions.length}</span>
                </div>
                <button
                  onClick={resetQuiz}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 lg:p-10">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-8">
              {currentQ?.question}
            </h2>

            <div className="space-y-4 mb-8">
              {currentQ?.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-4 p-5 lg:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${selectedAnswer === option
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md'
                    } ${showResult && option === currentQ.correct
                      ? 'border-green-500 bg-green-50'
                      : showResult && selectedAnswer === option && option !== currentQ.correct
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                >
                  <input
                    type="radio"
                    name="quiz-answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    disabled={showResult}
                    className="text-blue-600 scale-125"
                  />
                  <span className="flex-1 font-medium text-gray-800">{option}</span>
                  {showResult && option === currentQ.correct && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {showResult && selectedAnswer === option && option !== currentQ.correct && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </label>
              ))}
            </div>

            {showResult && (
              <div className={`rounded-xl p-6 lg:p-8 mb-8 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                }`}>
                <div className="flex items-start gap-4">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 mt-1" />
                  )}
                  <div>
                    <p className={`font-bold text-lg mb-3 ${isCorrect ? 'text-green-800' : 'text-red-800'
                      }`}>
                      {isCorrect ? 'Correct! 🎉' : 'Incorrect'}
                    </p>
                    <p className="text-gray-700 leading-relaxed">{currentQ?.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Progress: {currentQuestion + 1}/{questions.length}
              </div>

              {!showResult ? (
                <button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Submit Answer
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 font-medium">
                    {currentQuestion < questions.length - 1 ? 'Next question in 2 seconds...' : 'Quiz completed!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Quiz Arena</h1>
          <p className="text-gray-600 text-lg lg:text-xl">Challenge yourself with different quiz formats</p>
        </div>

        {/* XP Display */}
        {/* XP Display */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 lg:p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Your XP Balance</h2>
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-8 h-8" />
                <span className="text-3xl lg:text-4xl font-bold" data-xp-display>{user?.xp.toLocaleString()}</span>
                <span className="text-xl font-medium opacity-90 ml-1">XP</span>
                <span className="ml-auto text-lg font-bold bg-white/20 px-3 py-1 rounded-lg">Level <span data-level-display>1</span></span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-black/20 rounded-full h-4 relative overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                  data-xp-progress
                  style={{ width: '0%' }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm font-medium opacity-90">
                <span>Current Level Progress</span>
                <span><span data-xp-next>100</span> XP to next level</span>
              </div>
            </div>

            <div className="text-center lg:ml-8 hidden lg:block">
              <Zap className="w-16 h-16 mb-3 mx-auto" />
              <p className="text-lg opacity-90 font-semibold max-w-[200px]">Earn more XP by completing quizzes!</p>

              {/* Testing ONLY */}
              <button
                onClick={() => xpService.reset()}
                className="mt-2 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white/50 hover:text-white transition-colors"
                title="Reset XP to 0 (Testing)"
              >
                Reset XP
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Mode Selection */}
        {!selectedMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {quizModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <div
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id as any)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/50 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
                >
                  <div className="text-center">
                    <div className={`w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-br ${mode.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}>
                      <Icon className="w-8 lg:w-10 h-8 lg:h-10 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">{mode.title}</h3>
                    <p className="text-gray-600 text-sm lg:text-base mb-6 leading-relaxed">{mode.description}</p>

                    <div className="space-y-3 text-sm lg:text-base text-gray-500 mb-6">
                      <div className="flex items-center justify-center gap-2">
                        <Target className="w-4 h-4" />
                        <span className="font-medium">{mode.questions} questions</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{mode.timeLimit} minutes</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-yellow-600">{mode.xpReward} XP reward</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 lg:p-10 text-center">
              <div className="mb-8">
                {(() => {
                  const mode = quizModes.find(m => m.id === selectedMode);
                  const Icon = mode?.icon || Target;
                  return (
                    <div className={`w-20 lg:w-24 h-20 lg:h-24 bg-gradient-to-br ${mode?.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                      <Icon className="w-10 lg:w-12 h-10 lg:h-12 text-white" />
                    </div>
                  );
                })()}
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {quizModes.find(m => m.id === selectedMode)?.title} Quiz
                </h2>
                <p className="text-gray-600 text-lg">
                  {quizModes.find(m => m.id === selectedMode)?.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="text-center">
                  <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-900 text-xl">
                    {quizModes.find(m => m.id === selectedMode)?.questions}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Questions</div>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-900 text-xl">
                    {quizModes.find(m => m.id === selectedMode)?.timeLimit}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Minutes</div>
                </div>
                <div className="text-center">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-900 text-xl">
                    {quizModes.find(m => m.id === selectedMode)?.xpReward}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">XP Reward</div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 justify-center">
                <button
                  onClick={() => setSelectedMode(null)}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold"
                >
                  Back to Modes
                </button>
                <button
                  onClick={startQuiz}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-3 font-bold hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Play className="w-5 h-5" />
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Scores */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Recent Quiz Scores</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { mode: 'Multiple Choice', score: '14/15', xp: 200, date: '2 hours ago', accuracy: 93 },
              { mode: 'True/False', score: '18/20', xp: 150, date: '1 day ago', accuracy: 90 },
              { mode: 'Case Simulation', score: '8/10', xp: 300, date: '2 days ago', accuracy: 80 },
              { mode: 'Tax Quiz', score: '12/15', xp: 180, date: '3 days ago', accuracy: 80 },
            ].map((quiz, index) => (
              <div key={index} className="flex items-center justify-between p-4 lg:p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base lg:text-lg truncate">{quiz.mode}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-600">Score: <span className="font-semibold">{quiz.score}</span></p>
                    <p className="text-sm text-gray-600">Accuracy: <span className="font-semibold">{quiz.accuracy}%</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-600 mb-1">
                    <Star className="w-4 h-4" />
                    <span className="font-bold">+{quiz.xp} XP</span>
                  </div>
                  <p className="text-xs text-gray-500">{quiz.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizArena;
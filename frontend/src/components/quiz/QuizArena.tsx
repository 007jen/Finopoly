import React, { useState } from 'react';
import {
  Clock,
  Star,
  Play,
  Target,
  Brain,
  CheckCircle,
  XCircle,
  RotateCcw,
  Calculator,
  Lock,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
// import { xpService } from '../../_xp/xp-service';
import { useAccuracy } from '../../_accuracy/accuracy-context';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { QUIZ_QUESTIONS, QuizQuestion } from '../../data/quizQuestions';
import { api } from '../../lib/api';

interface AnalystDrill {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  xpReward: number;
  isSolved: boolean;
  isUnlocked: boolean;
}

interface QuizArenaProps {
  onStartDrill?: (id: string) => void;
  onBack?: () => void;
}

const QuizArena: React.FC<QuizArenaProps> = ({ onStartDrill, onBack }) => {
  const { user, refreshUser } = useAuth();
  const { updateUserStats } = useLeaderboard();
  const { incrementCorrect, incrementTotal } = useAccuracy();
  const [selectedMode, setSelectedMode] = useState<'mcq' | 'truefalse' | 'simulation' | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [drills, setDrills] = useState<AnalystDrill[]>([]);
  const [loadingDrills, setLoadingDrills] = useState(true);

  React.useEffect(() => {
    const fetchDrills = async () => {
      try {
        const data = await api.get('/api/challenges') as AnalystDrill[];
        setDrills(data);
      } catch (error) {
        console.error('Failed to fetch drills:', error);
      } finally {
        setLoadingDrills(false);
      }
    };
    fetchDrills();
  }, []);

  const getDifficultyStyle = (difficulty: string) => {
    const diff = difficulty.toUpperCase();
    switch (diff) {
      case 'JUNIOR':
        return 'bg-teal-50 text-teal-600';
      case 'SENIOR':
        return 'bg-orange-50 text-orange-600';
      case 'PARTNER':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

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



  const handleModeSelect = (mode: 'mcq' | 'truefalse' | 'simulation') => {
    setSelectedMode(mode);
  };

  const startQuiz = () => {
    // Filter questions based on selected mode
    let typeFilter = '';
    if (selectedMode === 'mcq') typeFilter = 'MCQ';
    else if (selectedMode === 'truefalse') typeFilter = 'TRUE_FALSE';
    else if (selectedMode === 'simulation') typeFilter = 'SCENARIO';

    const filtered = QUIZ_QUESTIONS.filter(q => q.type === typeFilter);
    // Shuffle and pick 10 (or less if not enough)
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 10);

    setQuestions(shuffled);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setTimeLeft(30);
    setShowResult(false);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameOver] = useState(false);

  React.useEffect(() => {
    if (!quizStarted || showResult || isGameOver) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, showResult, isGameOver]);

  const handleTimeout = () => {
    // Treat timeout as incorrect answer
    if (user?.name) {
      updateUserStats(user.name, 0, 0, 1);
    }
    incrementTotal();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
    setShowResult(true);

    setTimeout(async () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
        setTimeLeft(30);
        setShowResult(false);
      } else {
        // Quiz Finished on Timeout
        try {
          const xpPerQ = selectedMode === 'mcq' ? 100 : selectedMode === 'truefalse' ? 50 : 150;
          const totalXp = score * xpPerQ;

          await api.post('/api/activity', {
            type: 'quiz',
            referenceId: `quiz-${selectedMode}-${Date.now()}`,
            score: (score / questions.length) * 100,
            correctIncrement: score,
            totalIncrement: questions.length,
            xpEarned: totalXp
          });
          refreshUser();
        } catch (error) {
          console.error("Failed to log quiz activity:", error);
        }
        setQuizStarted(false);
        setSelectedMode(null);
      }
    }, 2000);
  };

  const submitAnswer = () => {
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === (currentQ as any)?.correctAnswer;

    if (isCorrect) {
      setScore(s => s + 1);
      if (user?.name) {
        updateUserStats(user.name, 0, 1, 1);
      }
      incrementCorrect();
    } else {
      if (user?.name) {
        updateUserStats(user.name, 0, 0, 1);
      }
      incrementTotal();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }

    setShowResult(true);

    setTimeout(async () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
        setTimeLeft(30);
        setShowResult(false);
      } else {
        // Quiz Finished
        try {
          const finalScore = score + (isCorrect ? 1 : 0);
          const xpPerQ = selectedMode === 'mcq' ? 100 : selectedMode === 'truefalse' ? 50 : 150;
          const totalXp = finalScore * xpPerQ;

          console.log(`[QUIZ-DEBUG] Logging quiz activity. Mode: ${selectedMode}, Final Score: ${finalScore}, Total XP: ${totalXp}`);

          const res = await api.post('/api/activity', {
            type: 'quiz',
            referenceId: `quiz-${selectedMode}-${Date.now()}`,
            score: Math.round((finalScore / questions.length) * 100),
            correctIncrement: finalScore,
            totalIncrement: questions.length,
            xpEarned: totalXp
          });

          console.log("[QUIZ-DEBUG] Activity logged successfully:", res);
          refreshUser();
        } catch (error: any) {
          console.error("[QUIZ-DEBUG] FAILED to log quiz activity:", error);
        }
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

  if (quizStarted && selectedMode && questions.length > 0) {
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ?.correctAnswer;

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
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${timeLeft < 10 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-bold font-mono">{timeLeft}s</span>
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
          <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 lg:p-10 ${isShaking ? 'animate-shake border-red-300' : ''} ${showResult && selectedAnswer === currentQ?.correctAnswer ? 'animate-pop border-green-300' : ''}`}>
            {currentQ?.scenario && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-gray-700 italic">
                "{currentQ.scenario}"
              </div>
            )}
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
                    } ${showResult && option === currentQ.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : showResult && selectedAnswer === option && option !== currentQ.correctAnswer
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
                  {showResult && option === currentQ.correctAnswer && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {showResult && selectedAnswer === option && option !== currentQ.correctAnswer && (
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
        <div className="relative flex flex-col items-center justify-center py-4">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 p-2 hover:bg-white/50 rounded-full transition-colors text-gray-400 hover:text-gray-900 z-10"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className="text-center w-full">
            <h1 className="text-2xl lg:text-4xl font-black text-gray-900 mb-1 lg:mb-3 tracking-tight drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]">Quiz Arcade</h1>
            <p className="text-gray-600 text-[12px] lg:text-xl">Challenge yourself with different quiz formats</p>
          </div>
        </div>

        {/* Drill Cockpit Section */}
        {!selectedMode && (
          <div className="mt-12 lg:mt-16 space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-teal-100 rounded-2xl text-teal-600 shadow-sm">
                <Brain className="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]">Drill Cockpit</h2>
                <p className="text-gray-500 text-[10px] lg:text-sm uppercase font-black tracking-[0.2em] opacity-60">Real-world analyst challenges</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingDrills ? (
                // Skeleton Loader
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
                ))
              ) : drills.length > 0 ? (
                drills.map((drill) => {
                  const DrillIcon = drill.difficulty.toUpperCase() === 'JUNIOR' ? Calculator : Brain;
                  const drillColor = drill.difficulty.toUpperCase() === 'JUNIOR' ? 'from-teal-500 to-teal-600' :
                    drill.difficulty.toUpperCase() === 'SENIOR' ? 'from-orange-500 to-orange-600' :
                      'from-purple-500 to-purple-600';

                  return (
                    <div
                      key={drill.id}
                      onClick={() => onStartDrill?.(drill.slug)}
                      className="group bg-white rounded-3xl p-8 border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col items-center text-center hover:-translate-y-2"
                    >
                      {/* Difficulty & XP Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                        <span className={`${getDifficultyStyle(drill.difficulty)} text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-current opacity-90`}>
                          {drill.difficulty}
                        </span>
                        <div className="flex items-center gap-1 bg-gray-50/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-gray-700 text-xs font-black">{drill.xpReward}</span>
                        </div>
                      </div>

                      {/* Prominent Icon */}
                      <div className={`w-20 h-20 bg-gradient-to-br ${drillColor} rounded-2xl flex items-center justify-center mb-6 mt-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl relative`}>
                        <DrillIcon className="w-10 h-10 text-white" />
                        {drill.isSolved && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-8 flex-1">
                        <h3 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">
                          {drill.title}
                        </h3>
                        <p className="text-gray-500 text-sm lg:text-base leading-relaxed line-clamp-2">
                          {drill.description}
                        </p>
                      </div>

                      <div className={`w-full py-4 rounded-xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 ${drill.isSolved
                        ? 'bg-green-50 border-green-200 text-green-600'
                        : 'bg-gray-50 border-gray-100 text-gray-900 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:scale-[1.02]'
                        }`}>
                        {drill.isSolved ? 'Drill Solved' : 'Start Drill'}
                        {!drill.isSolved && <Zap className="w-4 h-4" />}
                      </div>

                      {/* Subtle watermark */}
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DrillIcon className="w-32 h-32" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">No Active Drills</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6">
                    Our analysts are heads-down preparing new visual case studies for you.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Next Drills Drop Every Monday
                    </span>
                  </div>
                </div>
              )}

              {/* Locked Drill Placeholder (Always show one for future hype) */}
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center opacity-60">
                <div className="p-3 bg-gray-100 rounded-full mb-3">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-400">Drill #{drills.length + 1} Incoming</h3>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">Locked</p>
              </div>
            </div>
          </div>
        )}

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
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">{mode.title}</h3>
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

      </div>
    </div>
  );
};

export default QuizArena;
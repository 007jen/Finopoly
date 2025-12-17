import React from 'react';
import {
  User,
  Star,
  Award,
  Calendar,
  TrendingUp,
  BookOpen,
  Target,
  Clock,
  Trophy,
  Edit,
  Download,
  Share2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccuracy } from '../../_accuracy/accuracy-context';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { accuracy } = useAccuracy();

  if (!user) return null;

  const journeyMilestones = [
    {
      date: '2024-01-01',
      title: 'Joined Finopoly',
      description: 'Started your learning journey',
      icon: User,
      color: 'from-blue-500 to-blue-600'
    },
    {
      date: '2024-01-15',
      title: 'First Badge Earned',
      description: 'Earned "Audit Rookie" badge',
      icon: Award,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      date: '2024-01-20',
      title: 'Streak Master',
      description: 'Achieved 7-day learning streak',
      icon: Calendar,
      color: 'from-orange-500 to-red-500'
    },
    {
      date: '2024-01-25',
      title: 'Case Law Pro',
      description: 'Scored 90%+ in case law simulations',
      icon: Trophy,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const recentQuizScores = [
    { quiz: 'Audit Fundamentals', score: 85, maxScore: 100, date: '2024-01-28' },
    { quiz: 'Tax Compliance', score: 92, maxScore: 100, date: '2024-01-26' },
    { quiz: 'Case Law Analysis', score: 78, maxScore: 100, date: '2024-01-24' },
    { quiz: 'Financial Reporting', score: 88, maxScore: 100, date: '2024-01-22' },
  ];

  const savedCaseLaws = [
    { title: 'CIT vs. Hindustan Coca Cola Beverages', category: 'Tax', savedDate: '2024-01-27' },
    { title: 'SEBI vs. Sahara India Real Estate Corp', category: 'Corporate Law', savedDate: '2024-01-25' },
    { title: 'ICAI vs. Price Waterhouse', category: 'Audit', savedDate: '2024-01-23' },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">My Profile</h1>
          <p className="text-gray-600 text-lg lg:text-xl">Track your learning progress and achievements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8 text-center mb-8">
              <div className="relative mb-6">
                <div className="w-24 lg:w-32 h-24 lg:h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <User className="w-12 lg:w-16 h-12 lg:h-16 text-white" />
                </div>
                <button className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50 shadow-lg">
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-6 text-lg">{user.role} • Level <span data-level-display>{user.level}</span></p>

              <div className="flex items-center justify-center gap-3 mb-6">
                <Star className="w-6 h-6 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900"><span data-xp-display>{user.xp.toLocaleString()}</span> XP</span>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-2">Level <span data-level-display>{user.currentLevel}</span></p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full" data-xp-progress style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2"><span data-xp-next>350</span> XP to next level</p>
              </div>

              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105">
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-bold">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600 font-medium">Simulations</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{user.completedSimulations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-600 font-medium">Badges</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{user.badges.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-gray-600 font-medium">Streak</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{user.dailyStreak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600 font-medium">Avg. Accuracy</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">
                    {accuracy}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Badges Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Badges Earned</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {user.badges.map((badge) => (
                  <div key={badge.id} className="text-center p-4 lg:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <Award className="w-10 lg:w-12 h-10 lg:h-12 text-yellow-600 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-900 text-sm lg:text-base mb-2 truncate">{badge.name}</h4>
                    <p className="text-xs lg:text-sm text-gray-600 line-clamp-2 mb-3">{badge.description}</p>
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Your Learning Journey</h3>
              <div className="space-y-6">
                {journeyMilestones.map((milestone, index) => {
                  const Icon = milestone.icon;
                  return (
                    <div key={index} className="flex items-start gap-6">
                      <div className={`w-12 lg:w-14 h-12 lg:h-14 bg-gradient-to-br ${milestone.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="w-6 lg:w-7 h-6 lg:h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                          <h4 className="font-bold text-gray-900 text-base lg:text-lg">{milestone.title}</h4>
                          <span className="text-sm text-gray-500 font-medium">
                            {new Date(milestone.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">{milestone.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Quiz Scores */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Recent Quiz Scores</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recentQuizScores.map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 lg:p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-base truncate">{quiz.quiz}</h4>
                      <p className="text-sm text-gray-500 font-medium">
                        {new Date(quiz.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-lg">
                        {quiz.score}/{quiz.maxScore}
                      </div>
                      <div className={`text-sm font-bold ${quiz.score >= 90 ? 'text-green-600' :
                        quiz.score >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {Math.round((quiz.score / quiz.maxScore) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Case Laws */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 lg:p-8">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Saved Case Laws</h3>
              <div className="space-y-4">
                {savedCaseLaws.map((caselaw, index) => (
                  <div key={index} className="flex items-center justify-between p-4 lg:p-5 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <BookOpen className="w-6 h-6 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm lg:text-base truncate">{caselaw.title}</h4>
                        <p className="text-xs lg:text-sm text-gray-500 font-medium">{caselaw.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs lg:text-sm text-gray-500 font-medium">
                        Saved {new Date(caselaw.savedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
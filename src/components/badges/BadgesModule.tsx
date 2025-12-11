import React from 'react';
import { Award, Lock, Star, Flame, Target, Trophy, Shield, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BadgesModule: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const allBadges = [
    // Earned badges
    ...user.badges.map(badge => ({ ...badge, earned: true })),
    // Available badges
    {
      id: '4',
      name: 'Perfect Score',
      description: 'Score 100% in any simulation',
      icon: 'Star',
      earnedDate: '',
      earned: false,
      requirement: 'Score 100% in a simulation',
      progress: 85
    },
    {
      id: '5',
      name: 'Speed Demon',
      description: 'Complete a simulation in record time',
      icon: 'Zap',
      earnedDate: '',
      earned: false,
      requirement: 'Complete any simulation under 20 minutes',
      progress: 60
    },
    {
      id: '6',
      name: 'Knowledge Vault',
      description: 'Complete 50 case law challenges',
      icon: 'Shield',
      earnedDate: '',
      earned: false,
      requirement: 'Complete 50 case law challenges',
      progress: 23
    },
    {
      id: '7',
      name: 'Champion',
      description: 'Reach the top 10 on leaderboard',
      icon: 'Trophy',
      earnedDate: '',
      earned: false,
      requirement: 'Reach top 10 on weekly leaderboard',
      progress: 0
    },
    {
      id: '8',
      name: 'Consistency King',
      description: 'Maintain 30-day learning streak',
      icon: 'Target',
      earnedDate: '',
      earned: false,
      requirement: 'Maintain 30-day learning streak',
      progress: 40
    }
  ];

  const getIcon = (iconName: string, className: string = "w-8 h-8") => {
    const icons: { [key: string]: React.ReactNode } = {
      Award: <Award className={className} />,
      Flame: <Flame className={className} />,
      Scale: <Award className={className} />,
      Star: <Star className={className} />,
      Zap: <Zap className={className} />,
      Shield: <Shield className={className} />,
      Trophy: <Trophy className={className} />,
      Target: <Target className={className} />,
    };
    return icons[iconName] || <Award className={className} />;
  };

  const getBadgeColor = (earned: boolean) => {
    return earned 
      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
      : 'bg-gray-300';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Badges & Achievements</h1>
        <p className="text-gray-600">Collect badges as you progress through your learning journey</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Award className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900 mb-1">{user.badges.length}</div>
          <p className="text-gray-600">Badges Earned</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Star className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900 mb-1">{allBadges.length - user.badges.length}</div>
          <p className="text-gray-600">Available Badges</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
          <Trophy className="w-12 h-12 text-purple-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {Math.round((user.badges.length / allBadges.length) * 100)}%
          </div>
          <p className="text-gray-600">Collection Complete</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allBadges.map((badge) => (
          <div 
            key={badge.id} 
            className={`bg-white rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
              badge.earned ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center ${getBadgeColor(badge.earned)}`}
              >
                {badge.earned ? (
                  getIcon(badge.icon, "w-8 h-8 text-white")
                ) : (
                  <Lock className="w-8 h-8 text-gray-500" />
                )}
              </div>
              
              {badge.earned && (
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">EARNED</div>
                  <div className="text-xs text-gray-500">
                    {new Date(badge.earnedDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            <h3 className={`font-semibold mb-2 ${badge.earned ? 'text-gray-900' : 'text-gray-600'}`}>
              {badge.name}
            </h3>
            
            <p className={`text-sm mb-4 ${badge.earned ? 'text-gray-700' : 'text-gray-500'}`}>
              {badge.description}
            </p>

            {!badge.earned && 'requirement' in badge && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{badge.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{badge.requirement}</p>
              </div>
            )}

            {badge.earned && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Award className="w-4 h-4" />
                <span>Achievement unlocked!</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Next Badge Spotlight */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-1">Next Badge: Perfect Score</h3>
            <p className="opacity-90 mb-2">You're 15% away from earning this badge!</p>
            <p className="text-sm opacity-75">Score 100% in any simulation to unlock</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgesModule;
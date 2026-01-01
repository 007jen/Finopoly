import React from 'react';
import { Award, Lock, Star, Flame, Target, Trophy, Shield, Zap, ThumbsUp, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpRequirement: number;
}

interface BadgeWithStatus extends Badge {
  earned: boolean;
  earnedDate: string;
}

const BadgesModule: React.FC = () => {
  const { user } = useAuth();
  const [dbBadges, setDbBadges] = React.useState<Badge[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await api.get<Badge[]>('/api/badges');
        setDbBadges(data);
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  if (!user || loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Merge logic: For every badge in DB, check if user has it
  const allBadges: BadgeWithStatus[] = dbBadges.map(dbBadge => {
    const earnedBadge = (user.badges as any[]).find(ub => ub.name === dbBadge.name);
    return {
      ...dbBadge,
      earned: !!earnedBadge,
      earnedDate: earnedBadge?.earnedAt || earnedBadge?.earnedDate || '',
    };
  });

  const getIcon = (iconName: string, className: string = "w-8 h-8") => {
    const icons: { [key: string]: React.ReactNode } = {
      'award': <Award className={className} />,
      'flame': <Flame className={className} />,
      'star': <Star className={className} />,
      'zap': <Zap className={className} />,
      'shield': <Shield className={className} />,
      'trophy': <Trophy className={className} />,
      'target': <Target className={className} />,
      'thumbs-up': <ThumbsUp className={className} />,
      'book-open': <BookOpen className={className} />,
    };
    return icons[iconName.toLowerCase()] || <Award className={className} />;
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
            className={`bg-white rounded-xl p-6 border-2 transition-all hover:shadow-lg ${badge.earned ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
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

            {!badge.earned && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Requirement</span>
                  <span className="font-bold">{badge.xpRequirement} XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (user.xp / badge.xpRequirement) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Earn XP to unlock this achievement</p>
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
      {(() => {
        const nextBadge = allBadges.find(b => !b.earned);
        if (!nextBadge) return null;

        const progress = Math.min(100, (user.xp / nextBadge.xpRequirement) * 100);

        return (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {getIcon(nextBadge.icon, "w-8 h-8")}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">Next Milestone: {nextBadge.name}</h3>
                <p className="opacity-90 mb-2">You're at {Math.round(progress)}% of this goal!</p>
                <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm opacity-75">Reach {nextBadge.xpRequirement} XP to unlock</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default BadgesModule;
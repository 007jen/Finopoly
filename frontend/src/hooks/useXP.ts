import { useAuth } from '../context/AuthContext';
import { db } from '../lib/database';

export const useXP = () => {
  const { user, updateUser } = useAuth();

  const awardXP = async (
    xpAmount: number,
    activityType: 'audit' | 'tax' | 'caselaw' | 'quiz',
    activityId: string,
    score: number,
    answers: any
  ) => {
    if (!user) return;

    try {
      const { newXP, newLevel, newStreak } = await db.addXP(
        user.id,
        xpAmount,
        activityType,
        activityId,
        score,
        answers
      );

      await updateUser({
        xp: newXP,
        currentLevel: newLevel,
        dailyStreak: newStreak,
      });

      await db.updateAccuracy(user.id, activityType, score);

      return { newXP, newLevel, newStreak };
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw error;
    }
  };

  return { awardXP };
};

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/database';

export const useActivity = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const completeActivity = async (
    activityType: 'audit' | 'tax' | 'caselaw' | 'quiz',
    activityId: string,
    score: number,
    xpEarned: number,
    answers: any
  ) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const result = await db.addXP(
        user.id,
        xpEarned,
        activityType,
        activityId,
        score,
        answers
      );

      await db.updateAccuracy(user.id, activityType, score);

      await refreshUser();

      return result;
    } catch (error) {
      console.error('Error completing activity:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { completeActivity, loading };
};

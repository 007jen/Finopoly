import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  initialSeconds: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
  showAlert?: boolean;
}

const Timer: React.FC<TimerProps> = ({
  initialSeconds,
  onTimeUp,
  autoStart = true,
  showAlert = true
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            setIsActive(false);
            if (onTimeUp && !hasAlerted) {
              setHasAlerted(true);
              onTimeUp();
            }
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, onTimeUp, hasAlerted]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = () => {
    const percentageLeft = (seconds / initialSeconds) * 100;
    if (percentageLeft <= 10) return 'text-red-600 animate-pulse';
    if (percentageLeft <= 25) return 'text-orange-600';
    return 'text-gray-700';
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className={`w-5 h-5 ${getColorClass()}`} />
      <span className={`font-mono font-bold text-lg ${getColorClass()}`}>
        {formatTime(seconds)}
      </span>
      {showAlert && seconds === 0 && (
        <span className="text-red-600 text-sm font-semibold ml-2">Time's Up!</span>
      )}
    </div>
  );
};

export default Timer;

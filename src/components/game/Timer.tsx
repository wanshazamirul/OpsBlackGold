'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimerProps {
  timeRemaining: number; // seconds
  totalTime: number; // seconds
  isPaused?: boolean;
}

/**
 * Timer - Countdown timer with color-coded urgency
 *
 * Features:
 * - Circular progress or countdown display
 * - Color transitions: Green (>50%), Yellow (20-50%), Red (<20%)
 * - Flashing animation when critical (<30 seconds)
 * - Pause support
 */
export const Timer: React.FC<TimerProps> = ({
  timeRemaining,
  totalTime,
  isPaused = false,
}) => {
  // Calculate percentage
  const percentage = (timeRemaining / totalTime) * 100;

  // Determine color based on time remaining
  const getColor = () => {
    if (percentage > 50) return 'text-green-400';
    if (percentage > 20) return 'text-amber-400';
    return 'text-red-400';
  };

  // Determine border color
  const getBorderColor = () => {
    if (percentage > 50) return 'border-green-500';
    if (percentage > 20) return 'border-amber-500';
    return 'border-red-500';
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if critical (flashing)
  const isCritical = timeRemaining <= 30 && timeRemaining > 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Timer Display */}
      <div
        className={`
          flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2
          border-2 ${getBorderColor()}
          bg-black/40
          font-mono text-base sm:text-lg font-bold
          ${getColor()}
          ${isCritical && !isPaused ? 'animate-pulse' : ''}
        `}
      >
        <Clock size={16} className="sm:w-[18px]" />
        <span className="tabular-nums">
          {isPaused ? 'PAUSED' : formatTime(timeRemaining)}
        </span>
      </div>

      {/* Progress Bar (optional visual indicator) */}
      <div className="hidden sm:block w-24 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <motion.div
          className={`h-full ${
            percentage > 50
              ? 'bg-green-500'
              : percentage > 20
              ? 'bg-amber-500'
              : 'bg-red-500'
          }`}
          initial={{ width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

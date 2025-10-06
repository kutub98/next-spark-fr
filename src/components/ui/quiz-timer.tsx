"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface QuizTimerProps {
  duration: number; // in minutes
  onTimeUp?: () => void;
  onWarning?: () => void;
  className?: string;
  showIcon?: boolean;
  showProgress?: boolean;
}

const QuizTimer: React.FC<QuizTimerProps> = ({
  duration,
  onTimeUp,
  onWarning,
  className = "",
  showIcon = true,
  showProgress = true,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert to seconds
  const [warningShown, setWarningShown] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const getTimeColor = useCallback(
    (seconds: number) => {
      const totalSeconds = duration * 60;
      const percentage = (seconds / totalSeconds) * 100;

      if (percentage <= 10) return "text-red-600 bg-red-100";
      if (percentage <= 25) return "text-orange-600 bg-orange-100";
      if (percentage <= 50) return "text-yellow-600 bg-yellow-100";
      return "text-green-600 bg-green-100";
    },
    [duration]
  );

  const getProgressPercentage = useCallback(
    (seconds: number) => {
      const totalSeconds = duration * 60;
      return ((totalSeconds - seconds) / totalSeconds) * 100;
    },
    [duration]
  );

  const getStatusIcon = useCallback(
    (seconds: number) => {
      const totalSeconds = duration * 60;
      const percentage = (seconds / totalSeconds) * 100;

      if (percentage <= 10) return <AlertTriangle className="h-4 w-4" />;
      if (percentage <= 25) return <Clock className="h-4 w-4" />;
      return <CheckCircle className="h-4 w-4" />;
    },
    [duration]
  );

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp?.();
      return;
    }

    // Show warning when 5 minutes remaining
    if (timeRemaining <= 300 && !warningShown) {
      onWarning?.();
      setWarningShown(true);
    }

    const timer = setTimeout(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining, onTimeUp, onWarning, warningShown]);

  const timeColor = getTimeColor(timeRemaining);
  const progressPercentage = getProgressPercentage(timeRemaining);
  const statusIcon = getStatusIcon(timeRemaining);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && <div className="flex items-center">{statusIcon}</div>}

      <Badge className={`${timeColor} font-mono text-lg px-3 py-1`}>
        {formatTime(timeRemaining)}
      </Badge>

      {showProgress && (
        <div className="flex-1 min-w-[100px]">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeRemaining <= 300
                  ? "bg-red-500"
                  : timeRemaining <= 600
                  ? "bg-orange-500"
                  : timeRemaining <= 900
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTimer;

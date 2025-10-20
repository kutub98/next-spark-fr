"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface RewardPointsProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const RewardPoints: React.FC<RewardPointsProps> = ({
  className = "",
  showLabel = true,
  size = "md",
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    // Calculate total points from user's participations
    // This would typically come from an API call or Redux state
    if (user && "rewardPoints" in user) {
      setTotalPoints((user as { rewardPoints?: number }).rewardPoints || 0);
    }
  }, [user]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "lg":
        return "h-6 w-6";
      default:
        return "h-5 w-5";
    }
  };

  const getPointsLevel = (points: number) => {
    if (points >= 1000)
      return {
        level: "Master",
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      };
    if (points >= 500)
      return {
        level: "Expert",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      };
    if (points >= 200)
      return {
        level: "Advanced",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (points >= 100)
      return {
        level: "Intermediate",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    return {
      level: "Beginner",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    };
  };

  const level = getPointsLevel(totalPoints);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <Star className={`${getIconSize()} text-yellow-500`} />
        <span className={`font-semibold text-yellow-600 ${getSizeClasses()}`}>
          {totalPoints.toLocaleString()}
        </span>
      </div>

      {showLabel && (
        <Badge className={`${level.bgColor} ${level.color} text-xs`}>
          {level.level}
        </Badge>
      )}
    </div>
  );
};

export default RewardPoints;

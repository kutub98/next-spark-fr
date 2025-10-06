import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  FileText,
  HelpCircle,
  Users,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Event } from "@/redux/features/eventSlice";
import { Quiz } from "@/redux/features/quizSlice";
import { IQuestion } from "@/redux/features/questionSlice";
import { IParticipation } from "@/redux/features/participationSlice";

interface StatsTabProps {
  events: Event[];
  quizzes: Quiz[];
  questions: IQuestion[];
  participations: IParticipation[];
}

const StatsTab: React.FC<StatsTabProps> = ({
  events,
  quizzes,
  questions,
  participations,
}) => {
  // Calculate statistics
  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.isActive !== false).length;
  const upcomingEvents = events.filter(
    (e) => new Date(e.startDate) > new Date()
  ).length;
  const ongoingEvents = events.filter((e) => {
    const now = new Date();
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    return now >= start && now <= end;
  }).length;

  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter((q) => q.isActive !== false).length;
  const totalQuestions = questions.length;
  const totalParticipations = participations.length;

  const completedParticipations = participations.filter(
    (p) => p.status === "completed"
  ).length;
  const failedParticipations = participations.filter(
    (p) => p.status === "failed"
  ).length;
  const pendingParticipations = participations.filter(
    (p) => p.status === "pending"
  ).length;

  const averageScore =
    completedParticipations > 0
      ? participations
          .filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + p.totalScore, 0) / completedParticipations
      : 0;

  const totalMarks = quizzes.reduce(
    (sum, quiz) => sum + (quiz.totalMarks || 0),
    0
  );
  const averagePercentage =
    totalMarks > 0 ? (averageScore / totalMarks) * 100 : 0;

  // Quiz participation distribution
  const quizParticipationCount = quizzes
    .map((quiz) => ({
      quizId: quiz._id,
      title: quiz.title,
      count: participations.filter((p) => p.quizId === quiz._id).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Recent participations (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentParticipations = participations.filter(
    (p) => new Date(p.createdAt) >= sevenDaysAgo
  ).length;

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    color = "default",
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: { value: number; isPositive: boolean };
    color?: "default" | "success" | "warning" | "danger";
  }) => {
    const colorClasses = {
      default: "text-blue-600",
      success: "text-green-600",
      warning: "text-yellow-600",
      danger: "text-red-600",
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div
              className={`flex items-center text-xs ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend.value}% from last week
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={totalEvents}
          description={`${activeEvents} active, ${upcomingEvents} upcoming`}
          icon={Calendar}
          color="default"
        />
        <StatCard
          title="Total Quizzes"
          value={totalQuizzes}
          description={`${activeQuizzes} active quizzes`}
          icon={FileText}
          color="success"
        />
        <StatCard
          title="Total Questions"
          value={totalQuestions}
          description="Across all quizzes"
          icon={HelpCircle}
          color="warning"
        />
        <StatCard
          title="Total Participants"
          value={totalParticipations}
          description={`${recentParticipations} this week`}
          icon={Users}
          color="default"
        />
      </div>

      {/* Participation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed"
          value={completedParticipations}
          description={`${
            totalParticipations > 0
              ? ((completedParticipations / totalParticipations) * 100).toFixed(
                  1
                )
              : 0
          }% completion rate`}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Failed"
          value={failedParticipations}
          description={`${
            totalParticipations > 0
              ? ((failedParticipations / totalParticipations) * 100).toFixed(1)
              : 0
          }% failure rate`}
          icon={XCircle}
          color="danger"
        />
        <StatCard
          title="Pending"
          value={pendingParticipations}
          description="Awaiting completion"
          icon={AlertCircle}
          color="warning"
        />
        <StatCard
          title="Average Score"
          value={`${averagePercentage.toFixed(1)}%`}
          description={`${averageScore.toFixed(
            1
          )} out of ${totalMarks} total marks`}
          icon={Award}
          color="default"
        />
      </div>

      {/* Event Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Status Overview
          </CardTitle>
          <CardDescription>Current status of all events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Upcoming</Badge>
              <span className="text-2xl font-bold">{upcomingEvents}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Ongoing</Badge>
              <span className="text-2xl font-bold">{ongoingEvents}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Completed</Badge>
              <span className="text-2xl font-bold">
                {totalEvents - upcomingEvents - ongoingEvents}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Participation Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quiz Participation Distribution
          </CardTitle>
          <CardDescription>
            Most popular quizzes by participation count
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quizParticipationCount.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No participation data available
            </div>
          ) : (
            <div className="space-y-3">
              {quizParticipationCount.slice(0, 5).map((quiz, index) => (
                <div
                  key={quiz.quizId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{quiz.title}</div>
                      <div className="text-sm text-gray-500">
                        {quiz.count} participant{quiz.count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{quiz.count}</div>
                    <div className="text-xs text-gray-500">
                      {totalParticipations > 0
                        ? ((quiz.count / totalParticipations) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Activity summary for the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">New Participations</h4>
              <div className="text-3xl font-bold text-green-600">
                {recentParticipations}
              </div>
              <p className="text-sm text-gray-500">in the last 7 days</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Average Daily Participation</h4>
              <div className="text-3xl font-bold text-blue-600">
                {(recentParticipations / 7).toFixed(1)}
              </div>
              <p className="text-sm text-gray-500">participations per day</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsTab;

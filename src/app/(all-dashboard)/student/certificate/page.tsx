"use client";

import { api } from "@/data/api";
import { RootState } from "@/store/store";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Participation {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    totalQuestions: number;
    totalMarks: number;
  };
  obtainedMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  rank: number;
  createdAt: string;
  status: string;
  user: {
    _id: string;
    fullNameEnglish: string;
  };
}

const CertificatePage = () => {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${api}/participations`);
        const data = await response.json();

        if (data?.success && Array.isArray(data.data)) {
          const userParticipations = data.data.filter(
            (item: Participation) => item.user._id === user?._id
          );
          setParticipations(userParticipations);
        }
      } catch (error) {
        console.error("Error fetching participation data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchData();
  }, [user]);

  const stats = useMemo(() => {
    if (participations.length === 0) return { total: 0, completed: 0, avg: 0 };

    const total = participations.length;
    const completed = participations.filter(
      (p) => p.status === "completed"
    ).length;
    const avg =
      participations.reduce((acc, p) => acc + p.obtainedMarks, 0) /
      participations.length;

    return { total, completed, avg: avg.toFixed(1) };
  }, [participations]);

  // Prepare data for chart
  const chartData = useMemo(() => {
    return participations.map((p) => ({
      name: p.quiz.title,
      score: p.obtainedMarks,
      total: p.quiz.totalMarks,
    }));
  }, [participations]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (participations.length === 0)
    return (
      <div className="text-center mt-20 text-gray-500">
        No participation records found.
      </div>
    );

  return (
    <div className=" max-w-7xl mx-auto space-y-8">
      {/* Dashboard Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Card className="flex flex-col gap-0 items-center justify-center text-center p-2 hover:shadow-lg transition-shadow duration-300">
          <CardTitle className="text-lg font-semibold">Total Quizzes</CardTitle>
          <p className="text-2xl font-bold ">{stats.total}</p>
        </Card>

        <Card className="flex flex-col gap-0 items-center justify-center text-center p-2 hover:shadow-lg transition-shadow duration-300">
          <CardTitle className="text-lg font-semibold">Completed</CardTitle>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </Card>

        <Card className="col-span-2 gap-0 md:col-span-1 flex flex-col items-center justify-center text-center p-2 hover:shadow-lg transition-shadow duration-300">
          <CardTitle className="text-lg font-semibold">Average Score</CardTitle>
          <p className="text-2xl font-bold">{stats.avg}%</p>
        </Card>
      </div>

      {/* Participation Cards */}
      <div className="grid gap-6">
        {participations.map((p) => {
          const scorePercent = (p.obtainedMarks / p.quiz.totalMarks) * 100 || 0;

          return (
            <Card
              key={p._id}
              className="hover:scale-102 transition-transform duration-300 border"
            >
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg md:text-xl font-semibold">
                        {p.quiz.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 flex items-center gap-2">
                        {new Date(p.createdAt).toLocaleDateString()} |{" "}
                        {p.status === "completed" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="font-medium">{p.status}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {/* Animated Score Progress */}
                    <div>
                      <p className="font-medium mb-2">Score Progress</p>
                      <Progress
                        value={scorePercent}
                        className={`h-4 rounded-full transition-all duration-700 ease-out ${
                          scorePercent >= 70
                            ? "bg-green-500"
                            : scorePercent >= 40
                            ? "bg-yellow-400"
                            : "bg-red-500"
                        }`}
                      />
                      <p className="text-sm mt-1">
                        {p.obtainedMarks} / {p.quiz.totalMarks} (
                        {scorePercent.toFixed(0)}%)
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Correct</p>
                        <p>{p.correctAnswers}</p>
                      </div>
                      <div>
                        <p className="font-medium">Wrong</p>
                        <p>{p.wrongAnswers}</p>
                      </div>
                      <div>
                        <p className="font-medium">Rank</p>
                        <p>{p.rank}</p>
                      </div>
                      <div>
                        <p className="font-medium">Questions</p>
                        <p>{p.quiz.totalQuestions}</p>
                      </div>
                    </div>

                    {/* Download Certificate */}
                    {p.status === "completed" && (
                      <div className="flex justify-end">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() =>
                            alert(`Download certificate for ${p.quiz.title}`)
                          }
                        >
                          Download Certificate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Performance Chart */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Quiz Performance</CardTitle>
          <CardDescription>Visual overview of your quiz scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificatePage;

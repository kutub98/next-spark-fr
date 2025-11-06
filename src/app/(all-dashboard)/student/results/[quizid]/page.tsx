"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store/store";
import { getQuizById } from "@/redux/features/quizSlice";
import { fetchQuestionsByQuizId } from "@/redux/features/questionSlice";
import {
  getParticipationById,
  IParticipation,
} from "@/redux/features/participationSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Award,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

const StudentResultView = () => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const router = useRouter();
  const participationId = params.quizid as string;

  const { selectedQuiz, loading: quizLoading } = useSelector(
    (state: RootState) => state.quizzes
  );
  const { questions, loading: questionsLoading } = useSelector(
    (state: RootState) => state.questions
  );
  const { loading: participationLoading } = useSelector(
    (state: RootState) => state.participations
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [participation, setParticipation] = useState<IParticipation | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const loadResultData = useCallback(async () => {
    try {
      setLoading(true);
      const participationData = await dispatch(
        getParticipationById(participationId)
      ).unwrap();
      setParticipation(participationData);

      if (participationData?.quiz?._id) {
        await Promise.all([
          dispatch(getQuizById(participationData.quiz._id)),
          dispatch(fetchQuestionsByQuizId(participationData.quiz._id)),
        ]);
      }
    } catch (error) {
      console.error("Error loading result data:", error);
      toast.error("Failed to load result data");
    } finally {
      setLoading(false);
    }
  }, [dispatch, participationId]);

  useEffect(() => {
    if (participationId) loadResultData();
  }, [participationId, loadResultData]);

  const getStatusBadge = (status: string) => {
    const baseClass =
      "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "completed":
        return (
          <Badge className={`${baseClass} bg-green-100 text-green-800`}>
            <CheckCircle className="h-4 w-4" /> Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge className={`${baseClass} bg-red-100 text-red-800`}>
            <XCircle className="h-4 w-4" /> Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge className={`${baseClass} bg-yellow-100 text-yellow-800`}>
            <Clock className="h-4 w-4" /> Under Review
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPerformanceLevel = (
    score: number,
    totalMarks: number | undefined,
    passingMarks: number | undefined
  ) => {
    const validTotal = totalMarks || 0;
    const validPass = passingMarks || 0;
    const percentage = (score / validTotal) * 100;
    const passPercent = (validPass / validTotal) * 100;

    if (percentage >= 90)
      return {
        level: "Excellent",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (percentage >= 80)
      return {
        level: "Very Good",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      };
    if (percentage >= 70)
      return {
        level: "Good",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    if (percentage >= passPercent)
      return {
        level: "Passed",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    return { level: "Failed", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const getRewardPoints = (score: number, totalMarks?: number) => {
    const validTotal = totalMarks && totalMarks > 0 ? totalMarks : 1;
    const percentage = (score / validTotal) * 100;
    if (percentage >= 90) return 100;
    if (percentage >= 80) return 80;
    if (percentage >= 70) return 60;
    if (percentage >= 50) return 40;
    return 20;
  };

  if (loading || quizLoading || questionsLoading || participationLoading)
    return (
      <div className="container mx-auto py-8 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!selectedQuiz || !participation)
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Result Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The quiz result you&apos;re looking for doesn&apos;t exist or
          hasn&apos;t been evaluated yet.
        </p>
        <Button onClick={() => router.push("/student/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );

  const performance = getPerformanceLevel(
    participation.totalScore,
    selectedQuiz.totalMarks,
    selectedQuiz.passingMarks
  );
  const rewardPoints = getRewardPoints(
    participation.totalScore,
    selectedQuiz.totalMarks
  );

  const totalScore = participation.answers.reduce(
    (acc, answer) => acc + (answer.marksObtained ?? 0),
    0
  );
  const totalMarks = selectedQuiz?.totalMarks ?? 1;
  const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
  const hasPassed = totalScore >= (selectedQuiz?.passingMarks ?? 0);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Result Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Quiz Result
            </h1>
            <p className="text-gray-600 text-lg">{selectedQuiz.title}</p>
          </div>
          {getStatusBadge(participation.status)}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5  -mt-2 text-blue-500" />
            <div className="">
              <p className="text-sm font-medium">Submitted</p>
              <p className="text-sm">
                {new Date(participation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5  -mt-2 text-orange-500" />
            <div className="">
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm">{selectedQuiz.duration} minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5  -mt-2 text-green-500" />
            <div className="">
              <p className="text-sm font-medium">Questions</p>
              <p className="text-sm">{questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 -mt-2 text-purple-500" />
            <div className="">
              <p className="text-sm font-medium">Student</p>
              <p className="text-sm">
                {user?.fullNameEnglish || user?.fullNameBangla || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {totalScore} / {totalMarks}
            </CardTitle>
            <CardDescription>Total Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Progress
                value={percentage}
                className="h-3 mb-2 rounded-full bg-gray-200"
              />
              <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {selectedQuiz.passingMarks}
            </CardTitle>
            <CardDescription>Passing Marks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${performance.bgColor} ${performance.color} transition-transform transform hover:scale-105`}
              >
                {hasPassed ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1" />
                )}
                {hasPassed ? "Passed" : "Failed"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold flex items-center justify-center text-yellow-600">
              <Star className="h-6 w-6 mr-1" /> {rewardPoints}
            </CardTitle>
            <CardDescription>Reward Points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 transition-transform transform hover:scale-105">
                <Award className="h-4 w-4 mr-1" /> {performance.level}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question-wise Results */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl">Question-wise Results</CardTitle>
          <CardDescription>Detailed breakdown of your answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => {
            const answer = participation.answers.find(
              (a) => a.question === question._id
            );
            const isCorrect = answer?.isCorrect || false;
            const marksObtained = answer?.marksObtained || 0;

            return (
              <div
                key={question._id}
                className={`border rounded-lg p-4 transition-transform transform hover:scale-[1.02] hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Question {index + 1} ({question.questionType})
                    </h4>
                    <p className="text-gray-700 mb-3">{question.text}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{question.marks} marks</Badge>
                    <Badge variant="outline">{question.difficulty}</Badge>
                    <div
                      className={`flex items-center px-2 py-1 rounded-full text-sm ${
                        isCorrect
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {marksObtained} / {question.marks}
                    </div>
                  </div>
                </div>

                {Array.isArray(question.uploadedImages) &&
                  question.uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {question.uploadedImages.map((image, idx) => (
                        <Image
                          key={idx}
                          src={`/api/images/${image.filename}`}
                          alt={`Question image ${idx + 1}`}
                          width={200}
                          height={128}
                          className="w-full h-32 object-cover rounded border hover:scale-105 transition-transform"
                        />
                      ))}
                    </div>
                  )}

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Your Answer:
                    </p>
                    <div className="bg-gray-50 p-3 rounded border">
                      {answer?.selectedOption || "No answer provided"}
                    </div>
                  </div>

                  {question.questionType === "MCQ" &&
                    question.correctAnswer && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Correct Answer:
                        </p>
                        <div className="bg-green-50 p-3 rounded border">
                          {question.correctAnswer}
                        </div>
                      </div>
                    )}

                  {question.explanation && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Explanation:
                      </p>
                      <div className="bg-blue-50 p-3 rounded border">
                        {question.explanation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Correct Answers:</span>
                  <span className="font-medium">
                    {participation.answers.filter((a) => a.isCorrect).length} /{" "}
                    {questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium">
                    {(
                      (participation.answers.filter((a) => a.isCorrect).length /
                        questions.length) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Score:</span>
                  <span className="font-medium">
                    {totalScore} / {totalMarks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Performance:</span>
                  <span className={`font-medium ${performance.color}`}>
                    {performance.level}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Rewards</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Earned:</span>
                  <span className="font-medium text-yellow-600">
                    {rewardPoints} points
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`font-medium ${performance.color}`}>
                    {hasPassed ? "Passed" : "Failed"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/student/dashboard")}
        >
          Back to Dashboard
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            Print Result
          </Button>
          <Button
            onClick={() =>
              router.push(`/student/events/${selectedQuiz.eventId}`)
            }
          >
            View Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentResultView;

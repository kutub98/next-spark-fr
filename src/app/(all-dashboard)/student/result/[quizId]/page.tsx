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
  const quizId = params.quizId as string;

  const { selectedQuiz, loading: quizLoading } = useSelector(
    (state: RootState) => state.quizzes
  );
  const { questions, loading: questionsLoading } = useSelector(
    (state: RootState) => state.questions
  );
  const { participations, loading: participationLoading } = useSelector(
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
      await Promise.all([
        dispatch(getQuizById(quizId)),
        dispatch(fetchQuestionsByQuizId(quizId)),
      ]);

      // Find participation for this quiz
      const userParticipation = participations.find((p) => p.quizId === quizId);
      if (userParticipation) {
        setParticipation(userParticipation);
      } else {
        // Try to fetch participation by ID if not found
        try {
          const result = await dispatch(getParticipationById(quizId)).unwrap();
          setParticipation(result);
        } catch (error) {
          console.error("Error fetching participation:", error);
        }
      }
    } catch {
      toast.error("Failed to load result data");
    } finally {
      setLoading(false);
    }
  }, [dispatch, quizId, participations]);

  useEffect(() => {
    if (quizId) {
      loadResultData();
    }
  }, [quizId, loadResultData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Under Review
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPerformanceLevel = (
    score: number,
    totalMarks: number,
    passingMarks: number
  ) => {
    const percentage = (score / totalMarks) * 100;
    const passingPercentage = (passingMarks / totalMarks) * 100;

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
    if (percentage >= passingPercentage)
      return {
        level: "Passed",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    return { level: "Failed", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const getRewardPoints = (score: number, totalMarks: number) => {
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 90) return 100;
    if (percentage >= 80) return 80;
    if (percentage >= 70) return 60;
    if (percentage >= 50) return 40;
    return 20;
  };

  if (loading || quizLoading || questionsLoading || participationLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!selectedQuiz || !participation) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
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
      </div>
    );
  }

  const performance = getPerformanceLevel(
    participation.totalScore,
    selectedQuiz.totalMarks,
    selectedQuiz.passingMarks
  );
  const rewardPoints = getRewardPoints(
    participation.totalScore,
    selectedQuiz.totalMarks
  );
  const percentage = (participation.totalScore / selectedQuiz.totalMarks) * 100;

  return (
    <div className="container mx-auto py-8">
      {/* Result Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quiz Result
            </h1>
            <p className="text-gray-600 text-lg">{selectedQuiz.title}</p>
          </div>
          {getStatusBadge(participation.status)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <div>
              <p className="text-sm font-medium">Submitted</p>
              <p className="text-sm">
                {new Date(participation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm">{selectedQuiz.duration} minutes</p>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <BookOpen className="h-5 w-5 mr-2" />
            <div>
              <p className="text-sm font-medium">Questions</p>
              <p className="text-sm">{questions.length}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <User className="h-5 w-5 mr-2" />
            <div>
              <p className="text-sm font-medium">Student</p>
              <p className="text-sm">
                {user?.fullNameEnglish || user?.fullNameBangla || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {participation.totalScore} / {selectedQuiz.totalMarks}
            </CardTitle>
            <CardDescription>Total Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Progress value={percentage} className="h-3 mb-2" />
              <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {selectedQuiz.passingMarks}
            </CardTitle>
            <CardDescription>Passing Marks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${performance.bgColor} ${performance.color}`}
              >
                {participation.totalScore >= selectedQuiz.passingMarks ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1" />
                )}
                {participation.totalScore >= selectedQuiz.passingMarks
                  ? "Passed"
                  : "Failed"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
              <Star className="h-6 w-6 mr-1" />
              {rewardPoints}
            </CardTitle>
            <CardDescription>Reward Points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Award className="h-4 w-4 mr-1" />
                {performance.level}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Question-wise Results</CardTitle>
          <CardDescription>Detailed breakdown of your answers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const answer = participation.answers.find(
                (a) => a.questionId === question._id
              );
              const isCorrect = answer?.isCorrect || false;
              const marksObtained = answer?.marksObtained || 0;

              return (
                <div key={question._id} className="border rounded-lg p-4">
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

                  {/* Question Image */}
                  {question.uploadedImages &&
                    question.uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {question.uploadedImages.map((image, imgIndex) => (
                          <Image
                            key={imgIndex}
                            src={`/api/images/${image.filename}`}
                            alt={`Question image ${imgIndex + 1}`}
                            width={200}
                            height={128}
                            className="w-full h-32 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}

                  {/* Answer Section */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Your Answer:
                      </p>
                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-gray-900">
                          {answer?.selectedOption || "No answer provided"}
                        </p>
                      </div>
                    </div>

                    {question.questionType === "MCQ" &&
                      question.correctAnswer && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Correct Answer:
                          </p>
                          <div className="bg-green-50 p-3 rounded border">
                            <p className="text-green-900">
                              {question.correctAnswer}
                            </p>
                          </div>
                        </div>
                      )}

                    {question.explanation && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Explanation:
                        </p>
                        <div className="bg-blue-50 p-3 rounded border">
                          <p className="text-blue-900">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="mb-8">
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
                    {participation.totalScore} / {selectedQuiz.totalMarks}
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
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${performance.color}`}>
                    {participation.totalScore >= selectedQuiz.passingMarks
                      ? "Passed"
                      : "Failed"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/student/dashboard")}
        >
          Back to Dashboard
        </Button>

        <div className="flex items-center space-x-2">
          <Button onClick={() => window.print()} variant="outline">
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

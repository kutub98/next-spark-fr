"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store/store";
import { getEventById } from "@/redux/features/eventSlice";
import { getQuizzesByEventId } from "@/redux/features/quizSlice";
import {
  checkParticipation,
  createParticipation,
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
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const StudentEventView = () => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { selectedEvent, loading: eventLoading } = useSelector(
    (state: RootState) => state.events
  );
  const { quizzes, loading: quizzesLoading } = useSelector(
    (state: RootState) => state.quizzes
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [participationStatus, setParticipationStatus] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEventData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        dispatch(getEventById(eventId)),
        dispatch(getQuizzesByEventId(eventId)),
      ]);
    } catch {
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizzes.length > 0 && user?._id) {
      checkAllParticipations();
    }
  }, [quizzes, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAllParticipations = async () => {
    try {
      const participationChecks = quizzes.map((quiz) =>
        dispatch(
          checkParticipation({
            studentId: user?._id || "",
            quizId: quiz._id,
          })
        )
      );

      const results = await Promise.all(participationChecks);
      const statusMap: Record<string, string> = {};

      results.forEach((result, index) => {
        if (result.payload?.exists) {
          statusMap[quizzes[index]._id] = result.payload.status || "pending";
        } else {
          statusMap[quizzes[index]._id] = "not-started";
        }
      });

      setParticipationStatus(statusMap);
    } catch {
      console.error("Error checking participations");
    }
  };

  const getEventStatus = () => {
    if (!selectedEvent) return "unknown";
    const now = new Date();
    const startDate = new Date(selectedEvent.startDate);
    const endDate = new Date(selectedEvent.endDate);

    if (now < startDate) return "upcoming";
    if (now > endDate) return "ended";
    return "live";
  };

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-green-100 text-green-800">Live</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case "ended":
        return <Badge className="bg-gray-100 text-gray-800">Ended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getParticipationBadge = (status: string) => {
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
            <AlertCircle className="h-3 w-3" />
            Under Review
          </Badge>
        );
      case "not-started":
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleStartQuiz = async (quizId: string) => {
    if (!user?._id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      // Check if participation already exists
      const checkResult = await dispatch(
        checkParticipation({
          studentId: user._id,
          quizId,
        })
      ).unwrap();

      if (checkResult.exists) {
        toast.error("You have already participated in this quiz");
        return;
      }

      // Create new participation
      await dispatch(
        createParticipation({
          studentId: user._id,
          quizId,
          answers: [],
          totalScore: 0,
          status: "pending",
        })
      ).unwrap();

      // Navigate to quiz page
      router.push(`/student/quiz/${quizId}`);
    } catch {
      toast.error("Failed to start quiz");
    }
  };

  const getQuizButtonText = (status: string) => {
    switch (status) {
      case "completed":
        return "View Result";
      case "failed":
        return "View Result";
      case "pending":
        return "Under Review";
      case "not-started":
        return "Start Quiz";
      default:
        return "Start Quiz";
    }
  };

  const getQuizButtonAction = (quizId: string, status: string) => {
    if (status === "completed" || status === "failed") {
      return () => router.push(`/student/result/${quizId}`);
    } else if (status === "not-started") {
      return () => handleStartQuiz(quizId);
    }
    return () => {};
  };

  if (loading || eventLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The event you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button onClick={() => router.push("/student/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const eventStatus = getEventStatus();

  return (
    <div className="container mx-auto py-8">
      {/* Event Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedEvent.title}
            </h1>
            <p className="text-gray-600 text-lg">{selectedEvent.description}</p>
          </div>
          {getEventStatusBadge(eventStatus)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <div>
              <p className="text-sm font-medium">Start Date</p>
              <p className="text-sm">
                {new Date(selectedEvent.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <div>
              <p className="text-sm font-medium">End Date</p>
              <p className="text-sm">
                {new Date(selectedEvent.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <BookOpen className="h-5 w-5 mr-2" />
            <div>
              <p className="text-sm font-medium">Available Quizzes</p>
              <p className="text-sm">{quizzes.length} quizzes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Quizzes
        </h2>

        {quizzesLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Quizzes Available
            </h3>
            <p className="text-gray-600">
              This event doesn&apos;t have any quizzes yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const status = participationStatus[quiz._id] || "not-started";
              const isDisabled =
                eventStatus === "ended" || status === "pending";

              return (
                <Card
                  key={quiz._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {quiz.instructions ||
                            "Complete this quiz to test your knowledge"}
                        </CardDescription>
                      </div>
                      {getParticipationBadge(status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{quiz.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span>{quiz.totalMarks} total marks</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Passing: {quiz.passingMarks} marks</span>
                      </div>
                      <div className="pt-2">
                        <Button
                          className="w-full"
                          disabled={isDisabled}
                          onClick={getQuizButtonAction(quiz._id, status)}
                        >
                          {getQuizButtonText(status)}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Status Message */}
      {eventStatus === "ended" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-gray-400 mr-2" />
            <p className="text-gray-600">
              This event has ended. You can no longer participate in quizzes.
            </p>
          </div>
        </div>
      )}

      {eventStatus === "upcoming" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-400 mr-2" />
            <p className="text-blue-600">
              This event hasn&apos;t started yet. Check back on the start date.
            </p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8">
        <Button
          variant="outline"
          onClick={() => router.push("/student/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default StudentEventView;

"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  fetchQuestionsByQuizId,
  IQuestion,
} from "@/redux/features/questionSlice";
import {
  createParticipation,
  IAnswer,
  checkParticipation,
} from "@/redux/features/participationSlice";
import { addParticipant } from "@/redux/features/eventSlice";
import { AppDispatch, RootState } from "@/store/store";
import {
  selectIsAuthenticated,
  selectCurrentUser,
  fetchUserProfile,
} from "@/redux/features/auth/authSlice";
import { api } from "@/data/api";

interface ParticipateQuizProps {
  quizId: string;
  quizTitle: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  eventId?: string;
}

// Quiz state management with useReducer
interface QuizState {
  quizStarted: boolean;
  quizCompleted: boolean;
  answers: IAnswer[];
  currentQuestionIndex: number;
  timeLeft: number;
}

type QuizAction =
  | { type: "START_QUIZ"; payload: { answers: IAnswer[] } }
  | { type: "COMPLETE_QUIZ" }
  | {
      type: "UPDATE_ANSWER";
      payload: {
        questionId: string;
        selectedOption: string;
        isCorrect: boolean;
        marksObtained: number;
      };
    }
  | { type: "NEXT_QUESTION" }
  | { type: "PREV_QUESTION" }
  | { type: "UPDATE_TIME"; payload: number }
  | { type: "RESET_QUIZ"; payload: { duration: number } };

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case "START_QUIZ":
      return {
        ...state,
        quizStarted: true,
        quizCompleted: false,
        answers: action.payload.answers,
        currentQuestionIndex: 0,
      };
    case "COMPLETE_QUIZ":
      return {
        ...state,
        quizCompleted: true,
      };
    case "UPDATE_ANSWER":
      return {
        ...state,
        answers: state.answers.map((answer) =>
          answer.question === action.payload.questionId
            ? {
                ...answer,
                selectedOption: action.payload.selectedOption,
                isCorrect: action.payload.isCorrect,
                marksObtained: action.payload.marksObtained,
              }
            : answer
        ),
      };
    case "NEXT_QUESTION":
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    case "PREV_QUESTION":
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex - 1,
      };
    case "UPDATE_TIME":
      return {
        ...state,
        timeLeft: action.payload,
      };
    case "RESET_QUIZ":
      return {
        quizStarted: false,
        quizCompleted: false,
        answers: [],
        currentQuestionIndex: 0,
        timeLeft: action.payload.duration * 60,
      };
    default:
      return state;
  }
};

export default function ParticipateQuiz({
  quizId,
  quizTitle,
  duration,
  totalMarks,
  passingMarks,
  eventId,
}: ParticipateQuizProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [participationStatus, setParticipationStatus] = useState<
    "completed" | "failed" | "pending" | null
  >(null);
  const [isCheckingParticipation, setIsCheckingParticipation] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [answerImages, setAnswerImages] = useState<Record<string, File[]>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");
  const MAX_IMAGES = 5;

  // Use useReducer for quiz state management
  const [quizState, dispatchQuiz] = useReducer(quizReducer, {
    quizStarted: false,
    quizCompleted: false,
    answers: [],
    currentQuestionIndex: 0,
    timeLeft: duration * 60,
  });

  // Destructure quiz state
  const {
    quizStarted,
    quizCompleted,
    answers,
    currentQuestionIndex,
    timeLeft,
  } = quizState;

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { questions, loading: questionsLoading } = useSelector(
    (state: RootState) => state.questions
  );
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  const isAuthInitialized = useSelector(
    (state: RootState) => state.auth.isAuthInitialized
  );

  // Memoize quiz questions
  const quizQuestions = useMemo(() => questions || [], [questions]);

  // Reset isFetchingProfile when user data is available
  useEffect(() => {
    if (isFetchingProfile && currentUser && currentUser._id) {
      setIsFetchingProfile(false);
    }
  }, [isFetchingProfile, currentUser]);

  // Check if user has already participated in this quiz

  useEffect(() => {
    const checkParticipationStatus = async () => {
      if (isAuthenticated && currentUser && quizId) {
        const userId = currentUser._id;
        if (!userId) return;

        setIsCheckingParticipation(true);
        try {
          const { data } = await dispatch(
            checkParticipation({ studentId: userId, quizId })
          ).unwrap();

          console.log(data, "Participation check data");

          if (data?.hasParticipated) {
            setHasParticipated(true);
            setParticipationStatus(data.status); // 'completed' | 'pending' | 'failed'
          } else {
            setHasParticipated(false);
            setParticipationStatus(null);
          }
        } catch (error) {
          console.error("Failed to check participation:", error);
          setHasParticipated(false);
          setParticipationStatus(null);
        } finally {
          setIsCheckingParticipation(false);
        }
      } else {
        setHasParticipated(false);
        setParticipationStatus(null);
      }
    };

    checkParticipationStatus();
  }, [isAuthenticated, currentUser, quizId, dispatch]);

  // Fetch questions for this specific quiz when the modal opens
  useEffect(() => {
    if (open && quizId) {
      dispatch(fetchQuestionsByQuizId(quizId));
    }
  }, [dispatch, open, quizId]);

  const calculateScore = useCallback(() => {
    return answers.reduce((total, answer) => total + answer.marksObtained, 0);
  }, [answers]);

  // const handleSubmitQuiz = useCallback(async () => {
  //   if (isSubmitting) return;

  //   const userId = currentUser?._id;

  //   if (!currentUser || !currentUser._id) {
  //     toast.error("User information not available. Please log in again.");
  //     router.push("/auth");
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   const totalScore = calculateScore();

  //   try {
  //     const created = await dispatch(
  //       createParticipation({
  //         studentId: userId!,
  //         quizId,
  //         answers,
  //         totalScore,
  //         status: "pending",
  //       })
  //     ).unwrap();

  //     if (created && created._id) {
  //       const participationId = created._id as string;
  //       const uploads: Promise<Response>[] = [];
  //       answers.forEach((ans) => {
  //         const q = quizQuestions.find(
  //           (qq: IQuestion) => qq._id === ans.question
  //         );
  //         if (!q) return;
  //         if (
  //           (q.questionType === "Short" || q.questionType === "Written") &&
  //           answerImages[ans.question]?.length
  //         ) {
  //           const form = new FormData();
  //           answerImages[ans.question].forEach((file) =>
  //             form.append("images", file)
  //           );
  //           form.append("questionId", ans.question);
  //           form.append("selectedOption", ans.selectedOption || "");
  //           form.append("participantAnswer", ans.selectedOption || "");
  //           form.append("isCorrect", String(ans.isCorrect ?? false));
  //           form.append("marksObtained", String(ans.marksObtained ?? 0));

  //           uploads.push(
  //             fetch(`${api}/participations/${participationId}/submit-answer`, {
  //               method: "POST",
  //               headers: {
  //                 // "Content-Type": "multipart/form-data",
  //                 Authorization: `Bearer ${
  //                   localStorage.getItem("token") || ""
  //                 }`,
  //               },
  //               body: form,
  //             })
  //           );
  //         }
  //       });
  //       if (uploads.length) {
  //         await Promise.all(uploads);
  //       }
  //     }

  //     dispatchQuiz({ type: "COMPLETE_QUIZ" });
  //     setHasParticipated(true);
  //     setParticipationStatus("pending");
  //     setShowConfirmation(false);
  //     toast.success(
  //       "Quiz submitted successfully! Your result is pending admin review."
  //     );
  //   } catch (error: unknown) {
  //     console.error("Quiz submission error:", error);
  //     toast.error(
  //       (error as Error).message || "Failed to submit quiz. Please try again."
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }, [
  //   isSubmitting,
  //   currentUser,
  //   router,
  //   dispatch,
  //   quizId,
  //   answers,
  //   calculateScore,
  //   answerImages,
  //   quizQuestions,
  // ]);

  const handleSubmitQuiz = useCallback(async () => {
    if (isSubmitting) return;

    const userId = currentUser?._id;
    if (!currentUser || !userId) {
      toast.error("User information not available. Please log in again.");
      router.push("/auth");
      return;
    }

    setIsSubmitting(true);
    const totalScore = calculateScore();

    try {
      const created = await dispatch(
        createParticipation({
          studentId: userId,
          quizId,
          answers,
          totalScore,
          status: "pending",
        })
      ).unwrap();

      if (created && created._id) {
        const participationId = created._id as string;
        const uploads: Promise<Response>[] = [];

        for (const ans of answers) {
          const q = quizQuestions.find(
            (qq: IQuestion) => qq._id === ans.question
          );
          if (!q) continue;

          // Only upload files for written or short questions
          if (
            (q.questionType === "Short" || q.questionType === "Written") &&
            answerImages[ans.question]?.length
          ) {
            const form = new FormData();
            answerImages[ans.question].forEach((file) =>
              form.append("images", file)
            );
            form.append("questionId", ans.question);
            form.append("selectedOption", ans.selectedOption || "");
            form.append("participantAnswer", ans.participantAnswer || "");
            form.append("isCorrect", String(ans.isCorrect ?? false));
            form.append("marksObtained", String(ans.marksObtained ?? 0));

            uploads.push(
              fetch(`${api}/participations/${participationId}/submit-answer`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${
                    localStorage.getItem("token") || ""
                  }`,
                },
                body: form,
              })
            );
          }
        }

        if (uploads.length) {
          await Promise.all(uploads);
        }
      }

      dispatchQuiz({ type: "COMPLETE_QUIZ" });
      setHasParticipated(true);
      setParticipationStatus("pending");
      setShowConfirmation(false);
      toast.success(
        "Quiz submitted successfully! Your result is pending admin review."
      );
    } catch (error) {
      console.error("Quiz submission error:", error);
      toast.error(
        (error as Error).message || "Failed to submit quiz. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    currentUser,
    router,
    dispatch,
    quizId,
    answers,
    calculateScore,
    answerImages,
    quizQuestions,
  ]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    toast.error("Time is up! Submitting your quiz now.");
    handleSubmitQuiz();
  }, [handleSubmitQuiz]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (open && quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setTimeout(() => {
        dispatchQuiz({ type: "UPDATE_TIME", payload: timeLeft - 1 });
      }, 1000);
    } else if (timeLeft === 0 && !quizCompleted) {
      handleTimeUp();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [open, quizStarted, quizCompleted, timeLeft, handleTimeUp]);

  const handleOpen = async () => {
    if (isFetchingProfile) {
      return;
    }

    if (!isAuthInitialized) {
      toast.error("Please wait while we verify your authentication...");
      return;
    }

    const hasToken = localStorage.getItem("token");
    if (!hasToken) {
      toast.error("Please login to participate in the quiz");
      router.push("/auth");
      return;
    }

    if (hasToken && (!currentUser || !currentUser._id)) {
      setIsFetchingProfile(true);
      try {
        await dispatch(fetchUserProfile()).unwrap();
        toast.info("Please try again. User data is being refreshed.");
        return;
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast.error("User information not available. Please log in again.");
        router.push("/auth");
        return;
      } finally {
        setIsFetchingProfile(false);
      }
    }

    if (!currentUser || !currentUser._id) {
      toast.error("User information not available. Please log in again.");
      router.push("/auth");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Authentication error. Please log in again.");
      router.push("/auth");
      return;
    }

    if (currentUser.role !== "student") {
      toast.error("Only students can participate in quizzes");
      return;
    }

    if (hasParticipated) {
      toast.error(
        `You have already ${participationStatus} this quiz. You cannot retake it.`
      );
      return;
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetQuizState();
    setShowConfirmation(false);
  };

  const startQuiz = async () => {
    let initialAnswers: IAnswer[] = [];
    try {
      if (quizQuestions && quizQuestions.length > 0) {
        initialAnswers = quizQuestions.map((question) => ({
          question: question._id, // ✅ use `question` not `questionId`
          selectedOption: "",
          isCorrect: false,
          marksObtained: 0,
          participantAnswer: "", // optional, can be empty
          participantImages: [], // optional
        }));
      } else {
        initialAnswers = [];
      }
    } catch (error) {
      console.error("Failed to initialize answers:", error);
      initialAnswers = [];
    }

    if (eventId && currentUser?._id) {
      try {
        await dispatch(
          addParticipant({
            eventId,
            userId: currentUser._id,
          })
        ).unwrap();
      } catch (error: unknown) {
        console.log("Add participant error:", error);
        console.log("Continuing with quiz regardless of participant status");
      }
    }

    dispatchQuiz({
      type: "START_QUIZ",
      payload: { answers: initialAnswers },
    });
  };

  const handleAnswerChange = (questionId: string, selectedOption: string) => {
    const question = quizQuestions.find((q: IQuestion) => q._id === questionId);
    if (!question) return;

    const isCorrect = selectedOption === question.correctAnswer;
    const marksObtained = isCorrect ? question.marks : 0;

    dispatchQuiz({
      type: "UPDATE_ANSWER",
      payload: { questionId, selectedOption, isCorrect, marksObtained },
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      dispatchQuiz({ type: "NEXT_QUESTION" });
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      dispatchQuiz({ type: "PREV_QUESTION" });
    }
  };

  const resetQuizState = () => {
    dispatchQuiz({ type: "RESET_QUIZ", payload: { duration } });
    setIsSubmitting(false);
    setShowConfirmation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleRemoveImage = (questionId: string, index: number) => {
    setAnswerImages((prev) => {
      const files = [...(prev[questionId] || [])];
      files.splice(index, 1);
      return { ...prev, [questionId]: files };
    });
  };

  const handleConfirmAction = () => {
    setShowConfirmation(false);
    handleSubmitQuiz();
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress =
    quizQuestions.length > 0
      ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100
      : 0;

  return (
    <>
      {hasParticipated ? (
        <div className="space-y-2">
          <Button
            onClick={handleOpen}
            className="w-full"
            disabled={
              isCheckingParticipation || !isAuthInitialized || isFetchingProfile
            }
          >
            {!isAuthInitialized ? (
              "Loading..."
            ) : isCheckingParticipation ? (
              "Checking..."
            ) : isFetchingProfile ? (
              "Fetching Profile..."
            ) : participationStatus === "completed" ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Quiz Completed
              </>
            ) : participationStatus === "pending" ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Result Pending
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Quiz Failed
              </>
            )}
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full bg-[#232323] text-white border-0"
          >
            <Link href={`/student/quiz/${quizId}`}>View Results</Link>
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleOpen}
          className="w-full"
          disabled={
            isCheckingParticipation || !isAuthInitialized || isFetchingProfile
          }
        >
          {!isAuthInitialized
            ? "Loading..."
            : isCheckingParticipation
            ? "Checking..."
            : isFetchingProfile
            ? "Fetching Profile..."
            : !isAuthenticated || !currentUser || !currentUser._id
            ? "Login to Take Quiz"
            : "Take Quiz"}
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className={`${
            quizStarted
              ? "!max-w-full h-screen w-screen m-0 rounded-none"
              : "max-w-4xl h-[90vh]"
          } flex flex-col`}
        >
          {showConfirmation && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Warning</h3>
                <p className="text-gray-600 mb-4">{violationMessage}</p>
                <p className="text-gray-600 mb-4">
                  Do you want to submit the quiz now?
                </p>
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelAction}
                    disabled={isSubmitting}
                  >
                    Continue Quiz
                  </Button>
                  <Button
                    onClick={handleConfirmAction}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/80 text-white"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {questionsLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <div className="ml-4">Loading questions...</div>
            </div>
          ) : quizQuestions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No questions available
                </h3>
                <p className="text-gray-500">
                  This quiz doesn&apos;t have any questions yet.
                </p>
              </div>
              <Button
                onClick={() => {
                  setOpen(false);
                  resetQuizState();
                }}
              >
                Close
              </Button>
            </div>
          ) : !quizStarted ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Quiz Instructions</h2>
                <p className="text-gray-600">
                  Please read the instructions carefully before starting the
                  quiz.
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-around gap-3 w-full">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Quiz Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Questions:</span>
                      <span>{quizQuestions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Marks:</span>
                      <span>{totalMarks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passing Marks:</span>
                      <span>{passingMarks}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 p-4 rounded-lg max-w-md">
                  <h3 className="font-medium text-blue-800">
                    Important Instructions
                  </h3>
                  <ul className="mt-2 text-sm text-primary/80 space-y-1">
                    <li>• Do not switch tabs or open new tabs/windows</li>
                    <li>• Do not press back/forward buttons</li>
                    <li>• Do not copy, cut, or paste content</li>
                    <li>
                      • Do not use keyboard shortcuts (e.g., Ctrl+T, Ctrl+C)
                    </li>
                    <li>• Do not reload or close the browser</li>
                    <li>• Any violation will prompt quiz submission</li>
                    <li>• You cannot retake this quiz if you fail</li>
                  </ul>
                </div>
              </div>

              <Button onClick={startQuiz} size="lg">
                Start Quiz
              </Button>
            </div>
          ) : quizCompleted ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <h2 className="text-2xl font-bold flex items-center">
                {participationStatus === "completed" ? (
                  <>
                    <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                    Quiz Completed
                  </>
                ) : participationStatus === "pending" ? (
                  <>
                    <Clock className="mr-2 h-6 w-6 text-yellow-600" />
                    Result Pending
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-6 w-6 text-red-600" />
                    Quiz Failed
                  </>
                )}
              </h2>

              {participationStatus === "pending" && (
                <div className="w-full max-w-md bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-900">
                  <h3 className="font-semibold mb-2">
                    Your result is under review
                  </h3>
                  <ul className="list-disc ml-5 text-sm space-y-1">
                    <li>
                      Our admin will review your written/short answers and
                      images.
                    </li>
                    <li>
                      You can check the status from your dashboard once the
                      review is complete.
                    </li>
                    <li>
                      Please do not retake this quiz while the result is
                      pending.
                    </li>
                    <li>
                      Keep notifications on to be informed when the review is
                      done.
                    </li>
                  </ul>
                </div>
              )}

              <Button
                onClick={() => {
                  setOpen(false);
                  resetQuizState();
                }}
              >
                Close
              </Button>
            </div>
          ) : (
            <div className="flex flex-col min-h-screen bg-gray-50 -mt-10">
              <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden mb-4 sticky top-0 z-10">
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-5 flex flex-col items-center">
                  <h1 className="text-2xl sm:text-3xl font-bold uppercase text-center">
                    {quizTitle || "Untitled Quiz"}
                  </h1>
                  <div className="flex flex-wrap justify-center gap-3 mt-3">
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white px-3 py-1 flex items-center gap-1"
                    >
                      <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white px-3 py-1"
                    >
                      {currentQuestionIndex + 1} / {quizQuestions.length}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-5 space-y-2 text-gray-700 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>⏳ Duration:</span>
                    <span className="font-medium">{duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📝 Total Questions:</span>
                    <span className="font-medium">{quizQuestions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🎯 Total Marks:</span>
                    <span className="font-medium">{totalMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✅ Passing Marks:</span>
                    <span className="font-medium">{passingMarks}</span>
                  </div>
                </CardContent>
                <Progress value={progress} className="h-2 rounded-b-2xl" />
              </div>

              <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      Question {currentQuestionIndex + 1}:{" "}
                      <span className="font-normal text-gray-800">
                        {currentQuestion?.text}
                      </span>
                    </h2>
                    <div className="flex justify-between text-sm sm:text-base text-gray-500">
                      <span>Marks: {currentQuestion?.marks}</span>
                      <span>Difficulty: {currentQuestion?.difficulty}</span>
                    </div>
                  </div>

                  {currentQuestion?.questionType === "MCQ" ? (
                    <RadioGroup
                      value={
                        answers.find((a) => a.question === currentQuestion?._id)
                          ?.selectedOption || ""
                      }
                      onValueChange={(value) =>
                        handleAnswerChange(currentQuestion?._id || "", value)
                      }
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentQuestion?.options?.map((option, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-xl px-4 py-3 transition cursor-pointer"
                          >
                            <RadioGroupItem
                              value={option}
                              id={`option-${idx}`}
                            />
                            <Label
                              htmlFor={`option-${idx}`}
                              className="cursor-pointer text-gray-800"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <div className="space-y-4">
                      <Label className="text-sm sm:text-base font-medium text-gray-700">
                        Your Answer
                      </Label>
                      <Textarea
                        rows={4}
                        placeholder={
                          currentQuestion?.questionType === "Short"
                            ? "Write your short answer..."
                            : "Write your essay answer..."
                        }
                        onChange={(e) =>
                          handleAnswerChange(
                            currentQuestion?._id || "",
                            e.target.value
                          )
                        }
                        value={
                          answers.find(
                            (a) => a.question === currentQuestion?._id
                          )?.selectedOption || ""
                        }
                        className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl p-2 sm:p-3 w-full"
                      />

                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base text-gray-700">
                          Attach Images (optional)
                        </Label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center transition-colors duration-200">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <p className="text-sm text-gray-500 mt-1">
                            Drag & drop or click to upload (Max {MAX_IMAGES})
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const files = e.target.files
                                ? Array.from(e.target.files)
                                : [];
                              const qid = currentQuestion?._id || "";
                              setAnswerImages((prev) => {
                                const existing = prev[qid] || [];
                                return {
                                  ...prev,
                                  [qid]: [...existing, ...files].slice(
                                    0,
                                    MAX_IMAGES
                                  ),
                                };
                              });
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 overflow-hidden">
                          {(answerImages[currentQuestion?._id || ""] || []).map(
                            (file, idx) => (
                              <div
                                key={idx}
                                className="relative overflow-hidden border rounded-xl p-2 bg-gray-50 flex flex-col items-center text-xs"
                              >
                                <div className="w-full overflow-hidden h-10 sm:h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                  <ImageIcon className="h-6 w-6" />
                                </div>
                                <span className="truncate mt-1 text-center">
                                  {file.name || `Image ${idx + 1}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveImage(
                                      currentQuestion?._id || "",
                                      idx
                                    )
                                  }
                                  className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full hover:bg-gray-100"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )
                          )}
                          {!answerImages[currentQuestion?._id || ""]
                            ?.length && (
                            <p className="text-xs text-gray-400 col-span-full text-center">
                              No images selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between p-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                  <Button
                    variant="outline"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    ← Previous
                  </Button>
                  {currentQuestionIndex === quizQuestions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/80 text-white"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Quiz"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="bg-primary hover:bg-primary/80 text-white"
                    >
                      Next →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

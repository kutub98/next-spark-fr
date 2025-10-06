"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store/store";
import { getQuizById } from "@/redux/features/quizSlice";
import { fetchQuestionsByQuizId } from "@/redux/features/questionSlice";
import { updateParticipation } from "@/redux/features/participationSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Trophy,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { IQuestion } from "@/redux/features/questionSlice";
import { IAnswer } from "@/redux/features/participationSlice";

const StudentQuizTaking = () => {
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

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, IAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Record<string, File[]>>(
    {}
  );

  useEffect(() => {
    if (quizId) {
      loadQuizData();
    }
  }, [quizId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadQuizData = async () => {
    try {
      await Promise.all([
        dispatch(getQuizById(quizId)),
        dispatch(fetchQuestionsByQuizId(quizId)),
      ]);
    } catch {
      toast.error("Failed to load quiz data");
    }
  };

  useEffect(() => {
    if (selectedQuiz) {
      setTimeRemaining(selectedQuiz.duration * 60); // Convert minutes to seconds
    }
  }, [selectedQuiz]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && Object.keys(answers).length > 0) {
      handleSubmitQuiz();
    }
  }, [timeRemaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    const question = questions.find((q) => q._id === questionId);
    if (!question) return;

    const isCorrect =
      question.questionType === "MCQ"
        ? answer === question.correctAnswer
        : false; // For Short and Written, admin will evaluate

    const marksObtained = isCorrect ? question.marks : 0;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOption: answer,
        isCorrect,
        marksObtained,
      },
    }));
  };

  const handleImageUpload = (questionId: string, files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    setUploadedImages((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), ...fileArray],
    }));
  };

  const removeImage = (questionId: string, index: number) => {
    setUploadedImages((prev) => ({
      ...prev,
      [questionId]: prev[questionId]?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);

      const answersArray = Object.values(answers);
      const totalScore = answersArray.reduce(
        (sum, answer) => sum + answer.marksObtained,
        0
      );

      await dispatch(
        updateParticipation({
          id: quizId, // This should be the participation ID, not quiz ID
          data: {
            answers: answersArray,
            totalScore,
            status: "completed",
          },
        })
      ).unwrap();

      toast.success("Quiz submitted successfully!");
      router.push(`/student/result/${quizId}`);
    } catch {
      toast.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMCQQuestion = (question: IQuestion) => {
    return (
      <div className="space-y-4">
        <RadioGroup
          value={answers[question._id]?.selectedOption || ""}
          onValueChange={(value) => handleAnswerChange(question._id, value)}
        >
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${question._id}-${index}`} />
              <Label
                htmlFor={`${question._id}-${index}`}
                className="flex-1 cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  };

  const renderShortQuestion = (question: IQuestion) => {
    return (
      <div className="space-y-4">
        <Textarea
          placeholder="Enter your answer here..."
          value={answers[question._id]?.selectedOption || ""}
          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
          rows={4}
          className="w-full"
        />

        {/* Image Upload for Short Questions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Upload Images (Optional)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(question._id, e.target.files)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                document.getElementById(`image-upload-${question._id}`)?.click()
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>

          {/* Display uploaded images */}
          {uploadedImages[question._id] &&
            uploadedImages[question._id].length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {uploadedImages[question._id].map((file, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      width={200}
                      height={80}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(question._id, index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    );
  };

  const renderWrittenQuestion = (question: IQuestion) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Word Limit: {question.wordLimit || "No limit"}</span>
          <span>Time Limit: {question.timeLimit || "No limit"} minutes</span>
        </div>

        <Textarea
          placeholder="Enter your detailed answer here..."
          value={answers[question._id]?.selectedOption || ""}
          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
          rows={8}
          className="w-full"
        />

        {/* Image Upload for Written Questions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Upload Supporting Images (Optional)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(question._id, e.target.files)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                document.getElementById(`image-upload-${question._id}`)?.click()
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>

          {/* Display uploaded images */}
          {uploadedImages[question._id] &&
            uploadedImages[question._id].length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {uploadedImages[question._id].map((file, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      width={200}
                      height={80}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(question._id, index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    );
  };

  const renderQuestion = (question: IQuestion) => {
    switch (question.questionType) {
      case "MCQ":
        return renderMCQQuestion(question);
      case "Short":
        return renderShortQuestion(question);
      case "Written":
        return renderWrittenQuestion(question);
      default:
        return <div>Unknown question type</div>;
    }
  };

  if (quizLoading || questionsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!selectedQuiz || questions.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quiz Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The quiz you&apos;re looking for doesn&apos;t exist or has no
            questions.
          </p>
          <Button onClick={() => router.push("/student/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto py-8">
      {/* Quiz Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {selectedQuiz.title}
            </h1>
            <p className="text-gray-600 mt-2">{selectedQuiz.instructions}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-2xl font-bold text-red-600 mb-2">
              <Clock className="h-6 w-6 mr-2" />
              {formatTime(timeRemaining)}
            </div>
            <Badge variant="outline">{selectedQuiz.duration} minutes</Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center text-gray-600">
            <Trophy className="h-5 w-5 mr-2" />
            <div>
              <p className="text-sm font-medium">Total Marks</p>
              <p className="text-sm">{selectedQuiz.totalMarks}</p>
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
            <CheckCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="text-sm font-medium">Passing Marks</p>
              <p className="text-sm">{selectedQuiz.passingMarks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              Question {currentQuestionIndex + 1}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{currentQuestion.questionType}</Badge>
              <Badge variant="outline">{currentQuestion.marks} marks</Badge>
              <Badge variant="outline">{currentQuestion.difficulty}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg text-gray-900">{currentQuestion.text}</p>

            {/* Question Image */}
            {currentQuestion.uploadedImages &&
              currentQuestion.uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.uploadedImages.map((image, index) => (
                    <Image
                      key={index}
                      src={`/api/images/${image.filename}`}
                      alt={`Question image ${index + 1}`}
                      width={200}
                      height={192}
                      className="w-full h-48 object-cover rounded border"
                    />
                  ))}
                </div>
              )}

            {renderQuestion(currentQuestion)}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() =>
            setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
          }
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {Object.keys(answers).length} of {questions.length} answered
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentQuestionIndex(
                  Math.min(questions.length - 1, currentQuestionIndex + 1)
                )
              }
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Time Warning */}
      {timeRemaining <= 300 && timeRemaining > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-yellow-800">
              Warning: Only {formatTime(timeRemaining)} remaining!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuizTaking;

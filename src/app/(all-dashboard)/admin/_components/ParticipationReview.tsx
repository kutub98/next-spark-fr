"use client";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateParticipation } from "@/redux/features/participationSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Star,
  Edit,
  Save,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { IQuestion } from "@/redux/features/questionSlice";
import { IParticipation, IAnswer } from "@/redux/features/participationSlice";

interface ParticipationReviewProps {
  participation: IParticipation;
  questions: IQuestion[];
  onClose: () => void;
  onUpdate: () => void;
}

const ParticipationReview: React.FC<ParticipationReviewProps> = ({
  participation,
  questions,
  onClose,
  onUpdate,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState<Record<string, IAnswer>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallFeedback, setOverallFeedback] = useState("");

  useEffect(() => {
    // Initialize edited answers with current answers
    const answersMap: Record<string, IAnswer> = {};
    participation.answers.forEach((answer) => {
      answersMap[answer.questionId] = { ...answer };
    });
    setEditedAnswers(answersMap);
  }, [participation]);

  const handleAnswerEdit = (
    questionId: string,
    field: keyof IAnswer,
    value: string | number | boolean
  ) => {
    setEditedAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
  };

  const handleSubmitReview = async () => {
    try {
      setIsSubmitting(true);

      const updatedAnswers = Object.values(editedAnswers);
      const totalScore = updatedAnswers.reduce(
        (sum, answer) => sum + answer.marksObtained,
        0
      );

      await dispatch(
        updateParticipation({
          id: participation._id,
          data: {
            answers: updatedAnswers,
            totalScore,
            status:
              totalScore >= 50 // Default passing marks, should be fetched from quiz
                ? "completed"
                : "failed",
          },
        })
      ).unwrap();

      toast.success("Participation reviewed successfully!");
      onUpdate();
      onClose();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const renderMCQReview = (question: IQuestion, answer: IAnswer) => {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-600 mb-2 block">
            Student&apos;s Answer:
          </Label>
          <div className="bg-gray-50 p-3 rounded border">
            <p className="text-gray-900">{answer.selectedOption}</p>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600 mb-2 block">
            Correct Answer:
          </Label>
          <div className="bg-green-50 p-3 rounded border">
            <p className="text-green-900">{question.correctAnswer}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor={`correct-${question._id}`}
              className="text-sm font-medium"
            >
              Is Correct
            </Label>
            <RadioGroup
              value={answer.isCorrect ? "true" : "false"}
              onValueChange={(value) =>
                handleAnswerEdit(question._id, "isCorrect", value === "true")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="true"
                  id={`correct-${question._id}-true`}
                />
                <Label htmlFor={`correct-${question._id}-true`}>Correct</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="false"
                  id={`correct-${question._id}-false`}
                />
                <Label htmlFor={`correct-${question._id}-false`}>
                  Incorrect
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label
              htmlFor={`marks-${question._id}`}
              className="text-sm font-medium"
            >
              Marks Obtained
            </Label>
            <Input
              id={`marks-${question._id}`}
              type="number"
              min="0"
              max={question.marks}
              value={answer.marksObtained}
              onChange={(e) =>
                handleAnswerEdit(
                  question._id,
                  "marksObtained",
                  Number(e.target.value)
                )
              }
              className="mt-1"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderShortReview = (question: IQuestion, answer: IAnswer) => {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-600 mb-2 block">
            Student&apos;s Answer:
          </Label>
          <div className="bg-gray-50 p-3 rounded border">
            <p className="text-gray-900 whitespace-pre-wrap">
              {answer.selectedOption}
            </p>
          </div>
        </div>

        {question.correctAnswer && (
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">
              Expected Answer:
            </Label>
            <div className="bg-blue-50 p-3 rounded border">
              <p className="text-blue-900">{question.correctAnswer}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor={`correct-${question._id}`}
              className="text-sm font-medium"
            >
              Is Correct
            </Label>
            <RadioGroup
              value={answer.isCorrect ? "true" : "false"}
              onValueChange={(value) =>
                handleAnswerEdit(question._id, "isCorrect", value === "true")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="true"
                  id={`correct-${question._id}-true`}
                />
                <Label htmlFor={`correct-${question._id}-true`}>Correct</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="false"
                  id={`correct-${question._id}-false`}
                />
                <Label htmlFor={`correct-${question._id}-false`}>
                  Incorrect
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label
              htmlFor={`marks-${question._id}`}
              className="text-sm font-medium"
            >
              Marks Obtained
            </Label>
            <Input
              id={`marks-${question._id}`}
              type="number"
              min="0"
              max={question.marks}
              value={answer.marksObtained}
              onChange={(e) =>
                handleAnswerEdit(
                  question._id,
                  "marksObtained",
                  Number(e.target.value)
                )
              }
              className="mt-1"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderWrittenReview = (question: IQuestion, answer: IAnswer) => {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-600 mb-2 block">
            Student&apos;s Answer:
          </Label>
          <div className="bg-gray-50 p-3 rounded border">
            <p className="text-gray-900 whitespace-pre-wrap">
              {answer.selectedOption}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor={`correct-${question._id}`}
              className="text-sm font-medium"
            >
              Is Correct
            </Label>
            <RadioGroup
              value={answer.isCorrect ? "true" : "false"}
              onValueChange={(value) =>
                handleAnswerEdit(question._id, "isCorrect", value === "true")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="true"
                  id={`correct-${question._id}-true`}
                />
                <Label htmlFor={`correct-${question._id}-true`}>Correct</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="false"
                  id={`correct-${question._id}-false`}
                />
                <Label htmlFor={`correct-${question._id}-false`}>
                  Incorrect
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label
              htmlFor={`marks-${question._id}`}
              className="text-sm font-medium"
            >
              Marks Obtained
            </Label>
            <Input
              id={`marks-${question._id}`}
              type="number"
              min="0"
              max={question.marks}
              value={answer.marksObtained}
              onChange={(e) =>
                handleAnswerEdit(
                  question._id,
                  "marksObtained",
                  Number(e.target.value)
                )
              }
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor={`feedback-${question._id}`}
            className="text-sm font-medium"
          >
            Feedback (Optional)
          </Label>
          <Textarea
            id={`feedback-${question._id}`}
            placeholder="Provide feedback for this answer..."
            rows={3}
            className="mt-1"
          />
        </div>
      </div>
    );
  };

  const renderQuestionReview = (question: IQuestion) => {
    const answer = editedAnswers[question._id];
    if (!answer) return null;

    switch (question.questionType) {
      case "MCQ":
        return renderMCQReview(question, answer);
      case "Short":
        return renderShortReview(question, answer);
      case "Written":
        return renderWrittenReview(question, answer);
      default:
        return <div>Unknown question type</div>;
    }
  };

  const totalScore = Object.values(editedAnswers).reduce(
    (sum, answer) => sum + answer.marksObtained,
    0
  );
  const maxScore = questions.reduce((sum, question) => sum + question.marks, 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Review Participation</span>
            <div className="flex items-center space-x-2">
              {getStatusBadge(participation.status)}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <Eye className="h-4 w-4 mr-2" />
                ) : (
                  <Edit className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "View" : "Edit"}
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Review and evaluate student&apos;s quiz participation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Student</p>
                    <p className="text-sm">
                      {typeof participation.studentId === "string"
                        ? "Unknown Student"
                        : participation.studentId.fullNameEnglish ||
                          participation.studentId.fullNameBangla ||
                          "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-sm">
                      {new Date(participation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="h-5 w-5 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Current Score</p>
                    <p className="text-sm font-bold">
                      {totalScore} / {maxScore}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Question Reviews</h3>
            {questions.map((question, index) => {
              const answer = editedAnswers[question._id];
              if (!answer) return null;

              return (
                <Card key={question._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Question {index + 1} ({question.questionType})
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {question.text}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{question.marks} marks</Badge>
                        <Badge variant="outline">{question.difficulty}</Badge>
                        {isEditing && (
                          <div
                            className={`flex items-center px-2 py-1 rounded-full text-sm ${
                              answer.isCorrect
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {answer.isCorrect ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {answer.marksObtained} / {question.marks}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      renderQuestionReview(question)
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600 mb-2 block">
                            Student&apos;s Answer:
                          </Label>
                          <div className="bg-gray-50 p-3 rounded border">
                            <p className="text-gray-900 whitespace-pre-wrap">
                              {answer.selectedOption}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                              Correct: {answer.isCorrect ? "Yes" : "No"}
                            </span>
                            <span className="text-sm text-gray-600">
                              Marks: {answer.marksObtained} / {question.marks}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Overall Feedback */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Provide overall feedback for this participation..."
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {isEditing && (
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipationReview;

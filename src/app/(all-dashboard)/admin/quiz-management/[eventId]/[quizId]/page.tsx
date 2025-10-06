"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/redux/features/eventSlice";
import { getQuizById } from "@/redux/features/quizSlice";
import {
  fetchQuestionsByQuizId,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkDeleteQuestions,
  importQuestions,
  IQuestion,
} from "@/redux/features/questionSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppDispatch, RootState } from "@/store/store";
import {
  Loader2,
  Plus,
  ArrowLeft,
  FileText,
  Star,
  Edit,
  Trash2,
} from "lucide-react";
import QuestionImportDialog from "../../../_components/QuestionImportDialog";

const QuizDetailPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const quizId = params.quizId as string;

  const { selectedEvent, loading: eventLoading } = useSelector(
    (state: RootState) => state.events
  );
  const { selectedQuiz, loading: quizLoading } = useSelector(
    (state: RootState) => state.quizzes
  );
  const { questions, loading: questionsLoading } = useSelector(
    (state: RootState) => state.questions
  );

  const [newQuestion, setNewQuestion] = useState<Partial<IQuestion>>({
    quizId: quizId,
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    difficulty: "medium",
    questionType: "MCQ",
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editQuestion, setEditQuestion] = useState<IQuestion | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  useEffect(() => {
    if (eventId) {
      dispatch(getEventById(eventId));
    }
    if (quizId) {
      dispatch(getQuizById(quizId));
      dispatch(fetchQuestionsByQuizId(quizId));
    }
  }, [dispatch, eventId, quizId]);

  const handleCreateQuestion = async () => {
    if (!newQuestion.text || !newQuestion.marks) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      newQuestion.questionType === "MCQ" &&
      (!newQuestion.options || newQuestion.options.length < 2)
    ) {
      toast.error("MCQ questions must have at least 2 options");
      return;
    }

    try {
      setIsCreating(true);
      console.log("Creating question:", newQuestion);
      await dispatch(createQuestion(newQuestion)).unwrap();
      toast.success("Question created successfully");
      setNewQuestion({
        quizId: quizId,
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1,
        difficulty: "medium",
        questionType: "MCQ",
      });
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Create question error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      let errorMessage = "Failed to create question";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const currentOptions = [...(newQuestion.options || [])];
    const updatedOptions = [...currentOptions];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      console.log("Deleting question:", questionId);
      await dispatch(deleteQuestion(questionId)).unwrap();
      toast.success("Question deleted successfully");
      // Refresh questions after deletion
      dispatch(fetchQuestionsByQuizId(quizId));
    } catch (error) {
      console.error("Delete question error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      let errorMessage = "Failed to delete question";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editQuestion) return;

    try {
      setIsCreating(true);
      await dispatch(
        updateQuestion({
          id: editQuestion._id,
          data: editQuestion,
        })
      ).unwrap();
      toast.success("Question updated successfully");
      setEditQuestion(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update question";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map((q) => q._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return;

    try {
      const questionIds = Array.from(selectedQuestions);
      await dispatch(bulkDeleteQuestions(questionIds)).unwrap();
      toast.success(`${questionIds.length} questions deleted successfully`);
      setSelectedQuestions(new Set());
      setBulkDeleteMode(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete questions";
      toast.error(errorMessage);
    }
  };

  const handleImportQuestions = async (questions: Partial<IQuestion>[]) => {
    try {
      setIsImporting(true);
      console.log("Importing questions:", questions);
      console.log(
        "Questions data structure:",
        JSON.stringify(questions, null, 2)
      );

      // Validate questions before sending
      const validationErrors: string[] = [];
      questions.forEach((q, index) => {
        if (!q.quizId)
          validationErrors.push(`Question ${index + 1}: Missing quizId`);
        if (!q.text)
          validationErrors.push(`Question ${index + 1}: Missing text`);
        if (!q.questionType)
          validationErrors.push(`Question ${index + 1}: Missing questionType`);
        if (!q.marks || q.marks < 1)
          validationErrors.push(`Question ${index + 1}: Invalid marks`);
        if (!q.difficulty)
          validationErrors.push(`Question ${index + 1}: Missing difficulty`);

        if (q.questionType === "MCQ") {
          if (!q.options || q.options.length < 2) {
            validationErrors.push(
              `Question ${index + 1}: MCQ needs at least 2 options`
            );
          }
          if (!q.correctAnswer) {
            validationErrors.push(
              `Question ${index + 1}: MCQ needs correct answer`
            );
          }
          if (
            q.options &&
            q.correctAnswer &&
            !q.options.includes(q.correctAnswer)
          ) {
            validationErrors.push(
              `Question ${index + 1}: Correct answer must be one of the options`
            );
          }
        } else if (q.questionType === "Written") {
          if (!q.correctAnswer) {
            validationErrors.push(
              `Question ${index + 1}: Written questions need expected answer`
            );
          }
        }
        // Short questions don't require correctAnswer (optional)
      });

      if (validationErrors.length > 0) {
        toast.error(`Validation errors: ${validationErrors.join(", ")}`);
        return;
      }

      await dispatch(importQuestions(questions)).unwrap();
      toast.success(`${questions.length} questions imported successfully`);
    } catch (error: unknown) {
      console.error("Import error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      let errorMessage = "Failed to import questions";

      // Handle different error formats
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      } else if (error && typeof error === "object" && "error" in error) {
        const errorObj = error as { error?: { message?: string } };
        if (errorObj.error?.message) {
          errorMessage = errorObj.error.message;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Show detailed error in console for debugging
      console.error("Final error message:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const getQuestionTypeBadge = (type: string) => {
    switch (type) {
      case "MCQ":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-800">
            MCQ
          </Badge>
        );
      case "Short":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-800">
            Short
          </Badge>
        );
      case "Written":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-800">
            Written
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-800">
            Easy
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
            Medium
          </Badge>
        );
      case "hard":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-800">
            Hard
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (eventLoading || quizLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!selectedEvent || !selectedQuiz) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Event or Quiz not found
        </h3>
        <p className="text-gray-500 mb-4">
          The event or quiz you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{selectedQuiz.title}</h1>
            <p className="text-gray-600">
              {selectedEvent.title} • {selectedQuiz.duration} minutes
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <QuestionImportDialog
            quizzes={[selectedQuiz]}
            onImportQuestions={handleImportQuestions}
            isImporting={isImporting}
          />
          {questions.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setBulkDeleteMode(!bulkDeleteMode)}
              className={bulkDeleteMode ? "bg-red-50 text-red-700" : ""}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {bulkDeleteMode ? "Cancel Bulk Delete" : "Bulk Delete"}
            </Button>
          )}
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div>
            <strong>Total Marks:</strong> {selectedQuiz.totalMarks}
          </div>
          <div>
            <strong>Passing Marks:</strong> {selectedQuiz.passingMarks}
          </div>
          <div>
            <strong>Questions:</strong> {questions.length}
          </div>
        </div>
      </div>

      {/* Bulk Delete Controls */}
      {bulkDeleteMode && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-800">
                Delete {selectedQuestions.size} Selected Questions?
              </h4>
              <p className="text-sm text-red-600 mt-1">
                This action cannot be undone. The selected questions will be
                permanently deleted.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                size="sm"
                disabled={selectedQuestions.size === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedQuestions.size} Questions
              </Button>
              <Button
                onClick={() => {
                  setBulkDeleteMode(false);
                  setSelectedQuestions(new Set());
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {questionsLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No questions found
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first question for this quiz.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bulkDeleteMode && (
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Select Questions to Delete
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                    disabled={questions.length === 0}
                  >
                    {selectedQuestions.size === questions.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                  <span className="text-sm text-gray-600">
                    {selectedQuestions.size} of {questions.length} selected
                  </span>
                </div>
              </div>
            </div>
          )}

          {questions.map((question, index) => (
            <Card
              key={question._id}
              className={
                bulkDeleteMode && selectedQuestions.has(question._id)
                  ? "bg-blue-50 border-blue-200"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {bulkDeleteMode && (
                        <input
                          type="checkbox"
                          checked={selectedQuestions.has(question._id)}
                          onChange={() => handleSelectQuestion(question._id)}
                          className="rounded"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-500">
                        Question {index + 1}
                      </span>
                      {getQuestionTypeBadge(question.questionType)}
                      {getDifficultyBadge(question.difficulty)}
                    </div>
                    <CardTitle className="text-lg">{question.text}</CardTitle>
                  </div>
                  {!bulkDeleteMode && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{question.marks} marks</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteQuestion(question._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {bulkDeleteMode && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{question.marks} marks</Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {question.questionType === "MCQ" && question.options && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Options:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded border ${
                            option === question.correctAnswer
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span className="text-sm">{option}</span>
                            {option === question.correctAnswer && (
                              <Star className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {question.questionType === "Short" &&
                  question.correctAnswer && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Expected Answer:</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {question.correctAnswer}
                      </p>
                    </div>
                  )}
                {question.questionType === "Written" && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {question.wordLimit && (
                        <div>
                          <strong>Word Limit:</strong> {question.wordLimit}
                        </div>
                      )}
                      {question.timeLimit && (
                        <div>
                          <strong>Time Limit:</strong> {question.timeLimit}{" "}
                          minutes
                        </div>
                      )}
                    </div>
                    {question.correctAnswer && (
                      <div>
                        <h4 className="font-medium text-sm">
                          Expected Answer:
                        </h4>
                        <p className="text-sm bg-gray-50 p-2 rounded">
                          {question.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Question Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Question</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new question for this quiz.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="questionType">Question Type *</Label>
              <Select
                value={newQuestion.questionType || ""}
                onValueChange={(value) =>
                  setNewQuestion({
                    ...newQuestion,
                    questionType: value as "MCQ" | "Short" | "Written",
                    options: value === "MCQ" ? ["", "", "", ""] : undefined,
                    correctAnswer: value === "Written" ? undefined : "",
                    wordLimit: value === "Written" ? 50 : undefined,
                    timeLimit: value === "Written" ? 30 : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">MCQ (Multiple Choice)</SelectItem>
                  <SelectItem value="Short">Short Answer</SelectItem>
                  <SelectItem value="Written">Written (Essay)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                value={newQuestion.text || ""}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, text: e.target.value })
                }
                placeholder="Enter your question"
                rows={3}
                required
              />
            </div>

            {/* MCQ Options */}
            {newQuestion.questionType === "MCQ" && (
              <div className="grid gap-2">
                <Label>Options *</Label>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={newQuestion.options?.[index] || ""}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        required
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={
                          newQuestion.correctAnswer ===
                          newQuestion.options?.[index]
                        }
                        onChange={() =>
                          setNewQuestion({
                            ...newQuestion,
                            correctAnswer: newQuestion.options?.[index] || "",
                          })
                        }
                        className="rounded"
                        required
                      />
                      <Label className="text-sm">Correct</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correct Answer for Short questions */}
            {newQuestion.questionType === "Short" && (
              <div className="grid gap-2">
                <Label htmlFor="correctAnswer">
                  Expected Answer (Optional)
                </Label>
                <Textarea
                  id="correctAnswer"
                  value={newQuestion.correctAnswer || ""}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      correctAnswer: e.target.value,
                    })
                  }
                  placeholder="Enter the expected short answer (optional)"
                  rows={2}
                />
              </div>
            )}

            {/* Written question specific fields */}
            {newQuestion.questionType === "Written" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="wordLimit">Word Limit</Label>
                  <Input
                    id="wordLimit"
                    type="number"
                    min="50"
                    value={newQuestion.wordLimit || 50}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        wordLimit: Number(e.target.value),
                      })
                    }
                    placeholder="Minimum word count"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={newQuestion.timeLimit || 30}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        timeLimit: Number(e.target.value),
                      })
                    }
                    placeholder="Time in minutes"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="questionMarks">Marks *</Label>
                <Input
                  id="questionMarks"
                  type="number"
                  min="1"
                  value={newQuestion.marks || 0}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      marks: Number(e.target.value),
                    })
                  }
                  placeholder="Marks"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="questionDifficulty">Difficulty</Label>
                <Select
                  value={newQuestion.difficulty || ""}
                  onValueChange={(value) =>
                    setNewQuestion({
                      ...newQuestion,
                      difficulty: value as "easy" | "medium" | "hard",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateQuestion} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={!!editQuestion} onOpenChange={() => setEditQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the question details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editQuestionText">Question Text *</Label>
              <Textarea
                id="editQuestionText"
                value={editQuestion?.text || ""}
                onChange={(e) =>
                  setEditQuestion({
                    ...editQuestion!,
                    text: e.target.value,
                  })
                }
                placeholder="Enter your question"
                rows={3}
                required
              />
            </div>

            {editQuestion?.questionType === "MCQ" && editQuestion.options && (
              <div className="grid gap-2">
                <Label>Options *</Label>
                <div className="space-y-2">
                  {editQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const updatedOptions = [...editQuestion.options!];
                          updatedOptions[index] = e.target.value;
                          setEditQuestion({
                            ...editQuestion,
                            options: updatedOptions,
                          });
                        }}
                        required
                      />
                      <input
                        type="radio"
                        name="editCorrectAnswer"
                        checked={editQuestion.correctAnswer === option}
                        onChange={() =>
                          setEditQuestion({
                            ...editQuestion,
                            correctAnswer: option,
                          })
                        }
                        className="rounded"
                      />
                      <Label className="text-sm">Correct</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(editQuestion?.questionType === "Short" ||
              editQuestion?.questionType === "Written") && (
              <div className="grid gap-2">
                <Label htmlFor="editCorrectAnswer">
                  Expected Answer
                  {editQuestion?.questionType === "Short" && " (Optional)"}
                </Label>
                <Textarea
                  id="editCorrectAnswer"
                  value={editQuestion?.correctAnswer || ""}
                  onChange={(e) =>
                    setEditQuestion({
                      ...editQuestion!,
                      correctAnswer: e.target.value,
                    })
                  }
                  placeholder={
                    editQuestion?.questionType === "Short"
                      ? "Enter expected answer (optional)"
                      : "Enter expected answer"
                  }
                  rows={2}
                />
              </div>
            )}

            {editQuestion?.questionType === "Written" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editWordLimit">Word Limit</Label>
                  <Input
                    id="editWordLimit"
                    type="number"
                    min="10"
                    value={editQuestion?.wordLimit || 50}
                    onChange={(e) =>
                      setEditQuestion({
                        ...editQuestion!,
                        wordLimit: Number(e.target.value),
                      })
                    }
                    placeholder="Minimum word count"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editTimeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="editTimeLimit"
                    type="number"
                    min="1"
                    value={editQuestion?.timeLimit || 30}
                    onChange={(e) =>
                      setEditQuestion({
                        ...editQuestion!,
                        timeLimit: Number(e.target.value),
                      })
                    }
                    placeholder="Time in minutes"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editQuestionMarks">Marks *</Label>
                <Input
                  id="editQuestionMarks"
                  type="number"
                  min="1"
                  value={editQuestion?.marks || 0}
                  onChange={(e) =>
                    setEditQuestion({
                      ...editQuestion!,
                      marks: Number(e.target.value),
                    })
                  }
                  placeholder="Marks"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editQuestionDifficulty">Difficulty</Label>
                <Select
                  value={editQuestion?.difficulty || ""}
                  onValueChange={(value) =>
                    setEditQuestion({
                      ...editQuestion!,
                      difficulty: value as "easy" | "medium" | "hard",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditQuestion(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateQuestion} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizDetailPage;

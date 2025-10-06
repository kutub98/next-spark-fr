import React, { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Plus,
  FileText,
  Upload,
  X,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IQuestion, IQuestionFile } from "@/redux/features/questionSlice";
import { Quiz } from "@/redux/features/quizSlice";
import QuestionImportDialog from "./QuestionImportDialog";

interface QuestionsTabProps {
  quizzes: Quiz[];
  questions: IQuestion[];
  questionsLoading: boolean;
  newQuestion: Partial<IQuestion>;
  setNewQuestion: React.Dispatch<React.SetStateAction<Partial<IQuestion>>>;
  handleCreateQuestion: () => void;
  handleOptionChange: (index: number, value: string) => void;
  setEditItem: React.Dispatch<
    React.SetStateAction<{ type: string; data: Record<string, unknown> } | null>
  >;
  setDeleteDialog: React.Dispatch<
    React.SetStateAction<{ type: string; id: string } | null>
  >;
  handleBulkDeleteQuestions?: (questionIds: string[]) => void;
  handleImageUpload?: (files: FileList) => void;
  uploadedImages?: IQuestionFile[];
  removeUploadedImage?: (index: number) => void;
  handleImportQuestions?: (questions: Partial<IQuestion>[]) => void;
  isImporting?: boolean;
}

const QuestionsTab: React.FC<QuestionsTabProps> = ({
  quizzes,
  questions,
  questionsLoading,
  newQuestion,
  setNewQuestion,
  handleCreateQuestion,
  handleOptionChange,
  setEditItem,
  setDeleteDialog,
  handleBulkDeleteQuestions,
  handleImageUpload,
  uploadedImages = [],
  removeUploadedImage,
  handleImportQuestions,
  isImporting = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  // Helper functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (handleImageUpload) {
        handleImageUpload(files);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    if (removeUploadedImage) {
      removeUploadedImage(index);
    }
  };

  // Bulk delete functions
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

  const handleBulkDelete = () => {
    if (selectedQuestions.size === 0 || !handleBulkDeleteQuestions) return;

    const questionIds = Array.from(selectedQuestions);
    handleBulkDeleteQuestions(questionIds);
    setSelectedQuestions(new Set());
    setBulkDeleteMode(false);
  };

  const handleCancelBulkDelete = () => {
    setBulkDeleteMode(false);
    setSelectedQuestions(new Set());
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Questions Management</CardTitle>
          <CardDescription>Create and manage quiz questions</CardDescription>
        </div>
        <div className="flex space-x-2">
          {handleImportQuestions && (
            <QuestionImportDialog
              quizzes={quizzes}
              onImportQuestions={handleImportQuestions}
              isImporting={isImporting}
            />
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={quizzes.length === 0}>
                <Plus className="mr-2 h-4 w-4" /> New Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Question</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new question.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="questionQuiz">Quiz *</Label>
                  <Select
                    value={
                      typeof newQuestion.quizId === "string"
                        ? newQuestion.quizId
                        : ""
                    }
                    onValueChange={(value) =>
                      setNewQuestion({ ...newQuestion, quizId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes
                        .filter((q) => q.isActive !== false)
                        .map((quiz) => (
                          <SelectItem key={quiz._id} value={quiz._id}>
                            {quiz.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="questionType">Question Type *</Label>
                  <Select
                    value={newQuestion.questionType || ""}
                    onValueChange={(value) =>
                      setNewQuestion({
                        ...newQuestion,
                        questionType: value as "MCQ" | "Short" | "Written",
                        // Reset fields when changing type
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
                {/* MCQ Options - Only show for MCQ questions */}
                {newQuestion.questionType === "MCQ" && (
                  <div className="grid gap-2">
                    <Label>Options *</Label>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
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
                                correctAnswer:
                                  newQuestion.options?.[index] || "",
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
                    <Label htmlFor="correctAnswer">Expected Answer *</Label>
                    <Textarea
                      id="correctAnswer"
                      value={newQuestion.correctAnswer || ""}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          correctAnswer: e.target.value,
                        })
                      }
                      placeholder="Enter the expected short answer"
                      rows={2}
                      required
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

                {/* Image Upload for Short and Written questions */}
                {(newQuestion.questionType === "Short" ||
                  newQuestion.questionType === "Written") && (
                  <div className="grid gap-2">
                    <Label>Question Images (Optional)</Label>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Images</span>
                        </Button>
                        <span className="text-sm text-gray-500">
                          Max 5 images, 10MB each
                        </span>
                      </div>

                      {/* Display uploaded images */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {uploadedImages.map((image, index) => (
                            <div
                              key={index}
                              className="relative border rounded-lg p-2"
                            >
                              <div className="flex items-center space-x-2">
                                <ImageIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm truncate flex-1">
                                  {image.originalName}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveImage(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {(image.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                <Button
                  onClick={handleCreateQuestion}
                  disabled={questionsLoading}
                >
                  {questionsLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Question
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
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
            <p className="text-gray-500">
              Create your first question to get started.
            </p>
            {quizzes.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                You need to create a quiz first before creating questions.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bulk Delete Controls */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Questions Management
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                    disabled={questions.length === 0}
                  >
                    {selectedQuestions.size === questions.length ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Select All
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setBulkDeleteMode(true)}
                    disabled={selectedQuestions.size === 0}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedQuestions.size})
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Delete Confirmation */}
            {bulkDeleteMode && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-800">
                      Delete {selectedQuestions.size} Selected Questions?
                    </h4>
                    <p className="text-sm text-red-600 mt-1">
                      This action cannot be undone. The selected questions will
                      be permanently deleted.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleBulkDelete}
                      variant="destructive"
                      size="sm"
                      disabled={questionsLoading}
                    >
                      {questionsLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete {selectedQuestions.size} Questions
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelBulkDelete}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedQuestions.size === questions.length &&
                          questions.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => {
                    const isSelected = selectedQuestions.has(question._id);
                    return (
                      <TableRow
                        key={question._id}
                        className={isSelected ? "bg-blue-50" : ""}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectQuestion(question._id)}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-md truncate">
                          <div className="space-y-1">
                            <div>{question.text}</div>
                            {question.uploadedImages &&
                              question.uploadedImages.length > 0 && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <ImageIcon className="h-3 w-3" />
                                  <span>
                                    {question.uploadedImages.length} image(s)
                                  </span>
                                </div>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getQuestionTypeBadge(question.questionType)}
                        </TableCell>
                        <TableCell>
                          {typeof question.quizId === "object" &&
                          question.quizId !== null ? (
                            <Badge variant="outline">
                              {question.quizId.title}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Unknown Quiz</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {getDifficultyBadge(question.difficulty)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{question.marks}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setEditItem({
                                  type: "question",
                                  data: question,
                                })
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDeleteDialog({
                                  type: "question",
                                  id: question._id,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionsTab;

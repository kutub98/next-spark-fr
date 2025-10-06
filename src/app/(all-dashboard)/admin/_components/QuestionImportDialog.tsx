import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import { IQuestion } from "@/redux/features/questionSlice";
import { Quiz } from "@/redux/features/quizSlice";
import { GeminiOCRService, ExtractedQuestion } from "@/lib/ocr/gemini-ocr";

interface QuestionImportDialogProps {
  quizzes: Quiz[];
  onImportQuestions: (questions: Partial<IQuestion>[]) => void;
  isImporting: boolean;
}

const QuestionImportDialog: React.FC<QuestionImportDialogProps> = ({
  quizzes,
  onImportQuestions,
  isImporting,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [questionType, setQuestionType] = useState<
    "MCQ" | "Short" | "Written" | "Mixed"
  >("Mixed");
  const [extractedQuestions, setExtractedQuestions] = useState<
    ExtractedQuestion[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [editedQuestion, setEditedQuestion] =
    useState<ExtractedQuestion | null>(null);
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [useRangeSelection, setUseRangeSelection] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setErrors([]);
      setProcessingStatus("");
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) {
      setErrors(["Please select files to process"]);
      return;
    }

    setIsProcessing(true);
    setErrors([]);
    setProcessingStatus("Starting file processing...");

    try {
      console.log("Starting file processing...", selectedFiles.length, "files");

      // Process files one by one to avoid overwhelming the API
      const allQuestions: ExtractedQuestion[] = [];
      const allErrors: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        console.log(
          `Processing file ${i + 1}/${selectedFiles.length}:`,
          file.name
        );

        setProcessingStatus(
          `Processing file ${i + 1}/${selectedFiles.length}: ${file.name}`
        );

        try {
          const result = await GeminiOCRService.processFile(file);

          if (result.success && result.questions.length > 0) {
            allQuestions.push(...result.questions);
            console.log(
              `Extracted ${result.questions.length} questions from ${file.name}`
            );
            setProcessingStatus(
              `Successfully extracted ${result.questions.length} questions from ${file.name}`
            );
          } else {
            setProcessingStatus(`No questions found in ${file.name}`);
          }

          if (result.errors.length > 0) {
            allErrors.push(
              ...result.errors.map((err) => `${file.name}: ${err}`)
            );
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          const errorMessage =
            fileError instanceof Error ? fileError.message : "Unknown error";
          allErrors.push(`${file.name}: ${errorMessage}`);
          setProcessingStatus(`Error processing ${file.name}: ${errorMessage}`);
        }

        // Add a small delay between files to prevent rate limiting
        if (i < selectedFiles.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (allQuestions.length > 0) {
        // Filter questions by type if not Mixed
        let filteredQuestions = allQuestions;
        if (questionType !== "Mixed") {
          filteredQuestions = allQuestions.filter(
            (q) => q.type === questionType
          );
        }

        setExtractedQuestions(filteredQuestions);
        setErrors(allErrors);

        console.log(
          `Successfully extracted ${filteredQuestions.length} questions`
        );
        setProcessingStatus(
          `Successfully extracted ${filteredQuestions.length} questions from ${selectedFiles.length} file(s)`
        );

        // Show range selector if questions were extracted
        if (filteredQuestions.length > 0) {
          setRangeEnd(filteredQuestions.length);
          setShowRangeSelector(true);
        }
      } else {
        // Check if any files were processed successfully but no questions found
        const hasNoQuestionsError = allErrors.some((error) =>
          error.includes("No questions found")
        );

        if (hasNoQuestionsError) {
          setExtractedQuestions([]);
          setErrors(allErrors);
          setProcessingStatus("No questions found in uploaded files");
        } else {
          setErrors(
            allErrors.length > 0
              ? allErrors
              : ["No questions could be extracted from the files"]
          );
          setProcessingStatus("Error processing files - see details below");
        }
      }
    } catch (error) {
      console.error("Error in handleProcessFiles:", error);
      setErrors([
        error instanceof Error ? error.message : "Failed to process files",
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestion(index);
    setEditedQuestion({ ...extractedQuestions[index] });
  };

  const handleSaveEdit = () => {
    if (editingQuestion !== null && editedQuestion) {
      const updatedQuestions = [...extractedQuestions];
      updatedQuestions[editingQuestion] = editedQuestion;
      setExtractedQuestions(updatedQuestions);
      setEditingQuestion(null);
      setEditedQuestion(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditedQuestion(null);
  };

  const handleDeleteQuestion = (index: number) => {
    setExtractedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImportQuestions = () => {
    if (extractedQuestions.length === 0) return;

    // Get questions based on range selection
    let questionsToProcess = extractedQuestions;
    if (useRangeSelection && showRangeSelector) {
      const start = Math.max(1, rangeStart) - 1; // Convert to 0-based index
      const end = Math.min(extractedQuestions.length, rangeEnd);
      questionsToProcess = extractedQuestions.slice(start, end);
    }

    const questionsToImport: Partial<IQuestion>[] = questionsToProcess.map(
      (q) => {
        const baseQuestion = {
          quizId: quizzes[0]?._id || "",
          text: q.text,
          questionType: q.type,
          marks: q.marks,
          difficulty: q.difficulty,
          explanation: "", // Add explanation field
        };

        // Add type-specific fields
        if (q.type === "MCQ") {
          const options = q.options || [];
          const correctAnswer =
            q.correctAnswer || (options.length > 0 ? options[0] : "");

          return {
            ...baseQuestion,
            options: options,
            correctAnswer: correctAnswer,
          };
        } else if (q.type === "Short") {
          return {
            ...baseQuestion,
            correctAnswer: q.correctAnswer || "", // Optional for Short questions
            uploadedImages: [], // Add empty images array
            participantImages: [], // Add empty participant images array
          };
        } else if (q.type === "Written") {
          return {
            ...baseQuestion,
            correctAnswer: q.correctAnswer || "Expected answer not provided",
            wordLimit: Math.max(q.wordLimit || 50, 10), // Ensure minimum 10 words
            timeLimit: Math.max(q.timeLimit || 30, 1), // Ensure minimum 1 minute
            uploadedImages: [], // Add empty images array
            participantImages: [], // Add empty participant images array
          };
        }

        return baseQuestion;
      }
    );

    console.log("Questions to import:", questionsToImport);
    onImportQuestions(questionsToImport);
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setQuestionType("Mixed");
    setExtractedQuestions([]);
    setErrors([]);
    setEditingQuestion(null);
    setEditedQuestion(null);
    setProcessingStatus("");
    setIsProcessing(false);
    setShowRangeSelector(false);
    setRangeStart(1);
    setRangeEnd(1);
    setUseRangeSelection(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={quizzes.length === 0}>
          <Upload className="mr-2 h-4 w-4" />
          Import Questions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Questions from Files</DialogTitle>
          <DialogDescription>
            Upload PDF, DOC, or image files to automatically extract questions
            using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="questionType">Question Type Filter</Label>
              <Select
                value={questionType}
                onValueChange={(value) =>
                  setQuestionType(
                    value as "MCQ" | "Short" | "Written" | "Mixed"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mixed">All Types (Mixed)</SelectItem>
                  <SelectItem value="MCQ">MCQ Only</SelectItem>
                  <SelectItem value="Short">Short Answer Only</SelectItem>
                  <SelectItem value="Written">Essay Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload Files</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Files
                    </Button>
                    <p className="mt-2 text-sm text-gray-500">
                      PDF, DOC, DOCX, Images, or Text files (Max 50MB each)
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({selectedFiles.length})</Label>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file)}
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleProcessFiles}
              disabled={selectedFiles.length === 0 || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Files...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Extract Questions
                </>
              )}
            </Button>

            {isProcessing && processingStatus && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {processingStatus}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <Label className="text-red-600">Errors</Label>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm text-red-600"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Questions Found Message */}
          {extractedQuestions.length === 0 &&
            errors.some((error) => error.includes("No questions found")) && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No Questions Found
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    The AI was unable to detect any questions in the uploaded
                    files. Please check if the files contain questions or try
                    with different files.
                  </p>
                </div>
              </div>
            )}

          {/* Range Selection */}
          {showRangeSelector && extractedQuestions.length > 0 && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-800">
                  Select Question Range
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="useRange"
                    checked={useRangeSelection}
                    onChange={(e) => setUseRangeSelection(e.target.checked)}
                    className="rounded"
                  />
                  <label
                    htmlFor="useRange"
                    className="text-sm font-medium text-blue-700"
                  >
                    Use Range Selection
                  </label>
                </div>
              </div>

              {useRangeSelection && (
                <div className="space-y-3">
                  <div className="text-sm text-blue-700">
                    Total Questions: {extractedQuestions.length}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label
                        htmlFor="rangeStart"
                        className="text-sm font-medium"
                      >
                        From:
                      </Label>
                      <Input
                        id="rangeStart"
                        type="number"
                        min="1"
                        max={extractedQuestions.length}
                        value={rangeStart}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          setRangeStart(
                            Math.max(
                              1,
                              Math.min(value, extractedQuestions.length)
                            )
                          );
                        }}
                        className="w-20"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="rangeEnd" className="text-sm font-medium">
                        To:
                      </Label>
                      <Input
                        id="rangeEnd"
                        type="number"
                        min="1"
                        max={extractedQuestions.length}
                        value={rangeEnd}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          setRangeEnd(
                            Math.max(
                              1,
                              Math.min(value, extractedQuestions.length)
                            )
                          );
                        }}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-blue-600">
                    Selected Range: {rangeStart} - {rangeEnd}(
                    {Math.max(0, rangeEnd - rangeStart + 1)} questions)
                  </div>
                  {rangeStart > rangeEnd && (
                    <div className="text-sm text-red-600">
                      ⚠️ Start range cannot be greater than end range
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Extracted Questions */}
          {extractedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">
                  Extracted Questions ({extractedQuestions.length})
                </Label>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleImportQuestions}
                    disabled={
                      isImporting ||
                      (useRangeSelection && rangeStart > rangeEnd)
                    }
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Import{" "}
                        {useRangeSelection && showRangeSelector
                          ? `${Math.max(0, rangeEnd - rangeStart + 1)} Selected`
                          : "All"}{" "}
                        Questions
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {extractedQuestions.map((question, index) => {
                  const isInRange =
                    useRangeSelection && showRangeSelector
                      ? index >= rangeStart - 1 && index < rangeEnd
                      : true;

                  return (
                    <Card key={index} className={isInRange ? "" : "opacity-50"}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-medium flex items-center">
                              Question {index + 1}
                              {useRangeSelection && showRangeSelector && (
                                <span
                                  className={`ml-2 px-2 py-1 text-xs rounded ${
                                    isInRange
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {isInRange ? "Selected" : "Not Selected"}
                                </span>
                              )}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              {getQuestionTypeBadge(question.type)}
                              {getDifficultyBadge(question.difficulty)}
                              <Badge variant="secondary">
                                {question.marks} marks
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {editingQuestion === index ? (
                          <div className="space-y-4">
                            <div>
                              <Label>Question Text</Label>
                              <Textarea
                                value={editedQuestion?.text || ""}
                                onChange={(e) =>
                                  setEditedQuestion({
                                    ...editedQuestion!,
                                    text: e.target.value,
                                  })
                                }
                                rows={3}
                              />
                            </div>

                            {editedQuestion?.type === "MCQ" && (
                              <div>
                                <Label>Options</Label>
                                <div className="space-y-2">
                                  {editedQuestion.options?.map(
                                    (option, optIndex) => (
                                      <div
                                        key={optIndex}
                                        className="flex items-center space-x-2"
                                      >
                                        <Input
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [
                                              ...(editedQuestion.options || []),
                                            ];
                                            newOptions[optIndex] =
                                              e.target.value;
                                            setEditedQuestion({
                                              ...editedQuestion,
                                              options: newOptions,
                                            });
                                          }}
                                          placeholder={`Option ${optIndex + 1}`}
                                        />
                                        <input
                                          type="radio"
                                          name="correctAnswer"
                                          checked={
                                            editedQuestion.correctAnswer ===
                                            option
                                          }
                                          onChange={() =>
                                            setEditedQuestion({
                                              ...editedQuestion,
                                              correctAnswer: option,
                                            })
                                          }
                                        />
                                        <Label className="text-sm">
                                          Correct
                                        </Label>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {(editedQuestion?.type === "Short" ||
                              editedQuestion?.type === "Written") && (
                              <div>
                                <Label>
                                  Expected Answer
                                  {editedQuestion?.type === "Short" &&
                                    " (Optional)"}
                                </Label>
                                <Textarea
                                  value={editedQuestion?.correctAnswer || ""}
                                  onChange={(e) =>
                                    setEditedQuestion({
                                      ...editedQuestion!,
                                      correctAnswer: e.target.value,
                                    })
                                  }
                                  placeholder={
                                    editedQuestion?.type === "Short"
                                      ? "Enter expected answer (optional)"
                                      : "Enter expected answer"
                                  }
                                  rows={2}
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Marks</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={editedQuestion?.marks || 1}
                                  onChange={(e) =>
                                    setEditedQuestion({
                                      ...editedQuestion!,
                                      marks: Number(e.target.value),
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Difficulty</Label>
                                <Select
                                  value={editedQuestion?.difficulty || "medium"}
                                  onValueChange={(value) =>
                                    setEditedQuestion({
                                      ...editedQuestion!,
                                      difficulty: value as
                                        | "easy"
                                        | "medium"
                                        | "hard",
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {editedQuestion?.type === "Written" && (
                                <div>
                                  <Label>Word Limit</Label>
                                  <Input
                                    type="number"
                                    min="50"
                                    value={editedQuestion?.wordLimit || 50}
                                    onChange={(e) =>
                                      setEditedQuestion({
                                        ...editedQuestion!,
                                        wordLimit: Number(e.target.value),
                                      })
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              <Button onClick={handleSaveEdit} size="sm">
                                Save
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm">{question.text}</p>

                            {question.type === "MCQ" && question.options && (
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-500">
                                  Options:
                                </Label>
                                <div className="space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`text-xs p-2 rounded ${
                                        option === question.correctAnswer
                                          ? "bg-green-50 text-green-800 border border-green-200"
                                          : "bg-gray-50"
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIndex)}.{" "}
                                      {option}
                                      {option === question.correctAnswer && (
                                        <span className="ml-2 text-green-600">
                                          ✓
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(question.type === "Short" ||
                              question.type === "Written") && (
                              <div className="space-y-1">
                                <Label className="text-xs text-gray-500">
                                  Expected Answer:
                                  {question.type === "Short" && " (Optional)"}
                                </Label>
                                {question.correctAnswer ? (
                                  <p className="text-xs bg-gray-50 p-2 rounded">
                                    {question.correctAnswer}
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">
                                    {question.type === "Short"
                                      ? "No expected answer provided (optional)"
                                      : "No expected answer provided"}
                                  </p>
                                )}
                              </div>
                            )}

                            {question.type === "Written" && (
                              <div className="flex space-x-4 text-xs text-gray-500">
                                <span>Word Limit: {question.wordLimit}</span>
                                <span>
                                  Time Limit: {question.timeLimit} min
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionImportDialog;

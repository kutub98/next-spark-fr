"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  Event,
} from "@/redux/features/eventSlice";
import {
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  Quiz,
} from "@/redux/features/quizSlice";
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkDeleteQuestions,
  importQuestions,
  IQuestion,
} from "@/redux/features/questionSlice";
import {
  fetchParticipations,
  updateParticipation,
  deleteParticipation,
  IParticipation,
} from "@/redux/features/participationSlice";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppDispatch, RootState } from "@/store/store";
import EventsTab from "../_components/EventsTab";
import QuizzesTab from "../_components/QuizzesTab";
import QuestionsTab from "../_components/QuestionsTab";
import ParticipantsTab from "../_components/ParticipantsTab";
import StatsTab from "../_components/StatsTab";
import { Loader2 } from "lucide-react";

const AdminQuizManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading: eventsLoading } = useSelector(
    (state: RootState) => state.events
  );
  const { quizzes, loading: quizzesLoading } = useSelector(
    (state: RootState) => state.quizzes
  );
  const { questions, loading: questionsLoading } = useSelector(
    (state: RootState) => state.questions
  );
  const [isImporting, setIsImporting] = useState(false);
  const { participations, loading: participationsLoading } = useSelector(
    (state: RootState) => state.participations
  );

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const [newQuiz, setNewQuiz] = useState<Partial<Quiz>>({
    title: "",
    eventId: "",
    duration: 30,
    totalMarks: 0,
    passingMarks: 0,
    instructions: "",
    isActive: true,
  });

  const [newQuestion, setNewQuestion] = useState<Partial<IQuestion>>({
    quizId: "",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    difficulty: "medium",
  });

  const [activeTab, setActiveTab] = useState("events");
  const [editItem, setEditItem] = useState<{
    type: string;
    data: Record<string, unknown>;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    type: string;
    id: string;
  } | null>(null);

  // Participants tab state
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedParticipation, setSelectedParticipation] =
    useState<IParticipation | null>(null);

  useEffect(() => {
    loadAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllData = async () => {
    try {
      await Promise.all([
        dispatch(getEvents()),
        dispatch(getQuizzes()),
        dispatch(fetchQuestions()),
        dispatch(fetchParticipations()),
      ]);
    } catch {
      toast.error("Failed to load data");
    }
  };

  const handleCreateEvent = async () => {
    try {
      await dispatch(createEvent(newEvent)).unwrap();
      toast.success("Event created successfully");
      setNewEvent({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        isActive: true,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create event";
      toast.error(errorMessage);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      await dispatch(createQuiz(newQuiz)).unwrap();
      toast.success("Quiz created successfully");
      setNewQuiz({
        title: "",
        eventId: "",
        duration: 30,
        totalMarks: 0,
        passingMarks: 0,
        instructions: "",
        isActive: true,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create quiz";
      toast.error(errorMessage);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      await dispatch(createQuestion(newQuestion)).unwrap();
      toast.success("Question created successfully");
      setNewQuestion({
        quizId: "",
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1,
        difficulty: "medium",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create question";
      toast.error(errorMessage);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editItem) return;
    try {
      const eventData = editItem.data as unknown as Event;
      await dispatch(
        updateEvent({ id: eventData._id, data: eventData })
      ).unwrap();
      toast.success("Event updated successfully");
      setEditItem(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update event";
      toast.error(errorMessage);
    }
  };

  const handleUpdateQuiz = async () => {
    if (!editItem) return;
    try {
      const quizData = editItem.data as unknown as Quiz;
      await dispatch(updateQuiz({ id: quizData._id, data: quizData })).unwrap();
      toast.success("Quiz updated successfully");
      setEditItem(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update quiz";
      toast.error(errorMessage);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editItem) return;
    try {
      const questionData = editItem.data as unknown as IQuestion;
      await dispatch(
        updateQuestion({ id: questionData._id, data: questionData })
      ).unwrap();
      toast.success("Question updated successfully");
      setEditItem(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update question";
      toast.error(errorMessage);
    }
  };

  // Helper functions to cast editItem.data to appropriate types
  const getEventData = () => editItem?.data as Event;
  const getQuizData = () => editItem?.data as Quiz;
  const getQuestionData = () => editItem?.data as IQuestion;

  const handleDeleteEvent = async (id: string) => {
    try {
      await dispatch(deleteEvent(id)).unwrap();
      toast.success("Event deleted successfully");
      setDeleteDialog(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete event";
      toast.error(errorMessage);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      await dispatch(deleteQuiz(id)).unwrap();
      toast.success("Quiz deleted successfully");
      setDeleteDialog(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete quiz";
      toast.error(errorMessage);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await dispatch(deleteQuestion(id)).unwrap();
      toast.success("Question deleted successfully");
      setDeleteDialog(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete question";
      toast.error(errorMessage);
    }
  };

  const handleBulkDeleteQuestions = async (questionIds: string[]) => {
    try {
      await dispatch(bulkDeleteQuestions(questionIds)).unwrap();
      toast.success(`${questionIds.length} questions deleted successfully`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete questions";
      toast.error(errorMessage);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    // Create a new array to avoid mutating state directly
    const currentOptions = [...(newQuestion.options || [])];
    const updatedOptions = [...currentOptions];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Participation management functions
  const handleViewParticipationDetails = (participation: IParticipation) => {
    setSelectedParticipation(participation);
  };

  const handleUpdateParticipation = async (
    id: string,
    data: Partial<IParticipation>
  ) => {
    try {
      await dispatch(updateParticipation({ id, data })).unwrap();
      toast.success("Participation updated successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update participation";
      toast.error(errorMessage);
    }
  };

  const handleDeleteParticipation = async (id: string) => {
    try {
      await dispatch(deleteParticipation(id)).unwrap();
      toast.success("Participation deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete participation";
      toast.error(errorMessage);
    }
  };

  const handleImportQuestions = async (questions: Partial<IQuestion>[]) => {
    try {
      setIsImporting(true);
      console.log("Importing questions:", questions);

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
        }
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

  const handleExportResults = () => {
    // Create CSV data
    const csvData = participations.map((participation) => {
      const quiz = quizzes.find((q) => q._id === participation.quizId);
      const event = events.find((e) => e._id === quiz?.eventId);

      // Handle studentId as either string or object
      const studentInfo =
        typeof participation.studentId === "string"
          ? {
              id: participation.studentId,
              name: "Unknown Student",
              contact: "N/A",
            }
          : {
              id: participation.studentId._id,
              name:
                participation.studentId.fullNameEnglish ||
                participation.studentId.fullNameBangla ||
                "Unknown Student",
              contact: participation.studentId.contact || "N/A",
            };

      return {
        "Student ID": studentInfo.id,
        "Student Name": studentInfo.name,
        Contact: studentInfo.contact,
        Quiz: quiz?.title || "Unknown",
        Event: event?.title || "Unknown",
        Score: participation.totalScore,
        Status: participation.status,
        Submitted: new Date(participation.createdAt).toLocaleString(),
      };
    });

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map((header) => `"${row[header as keyof typeof row]}"`)
          .join(",")
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-results-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Results exported successfully");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Quiz Management Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={loadAllData} variant="outline">
            <Loader2 className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="events" className="flex items-center gap-2">
            Events
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            Questions
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            Participants
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events">
          <EventsTab
            events={events}
            quizzes={quizzes}
            eventsLoading={eventsLoading}
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            handleCreateEvent={handleCreateEvent}
            setEditItem={setEditItem}
            setDeleteDialog={setDeleteDialog}
          />
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes">
          <QuizzesTab
            events={events}
            quizzes={quizzes}
            questions={questions}
            quizzesLoading={quizzesLoading}
            newQuiz={newQuiz}
            setNewQuiz={setNewQuiz}
            handleCreateQuiz={handleCreateQuiz}
            setEditItem={setEditItem}
            setDeleteDialog={setDeleteDialog}
          />
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <QuestionsTab
            quizzes={quizzes}
            questions={questions}
            questionsLoading={questionsLoading}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
            handleCreateQuestion={handleCreateQuestion}
            handleOptionChange={handleOptionChange}
            setEditItem={setEditItem}
            setDeleteDialog={setDeleteDialog}
            handleBulkDeleteQuestions={handleBulkDeleteQuestions}
            handleImportQuestions={handleImportQuestions}
            isImporting={isImporting}
          />
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants">
          <ParticipantsTab
            participations={participations}
            events={events}
            quizzes={quizzes}
            participationsLoading={participationsLoading}
            selectedQuiz={selectedQuiz}
            setSelectedQuiz={setSelectedQuiz}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onExportResults={handleExportResults}
            onDeleteParticipation={handleDeleteParticipation}
            onRefreshData={loadAllData}
          />
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <StatsTab
            events={events}
            quizzes={quizzes}
            questions={questions}
            participations={participations}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editItem?.type === "event" && "Edit Event"}
              {editItem?.type === "quiz" && "Edit Quiz"}
              {editItem?.type === "question" && "Edit Question"}
            </DialogTitle>
            <DialogDescription>
              Make changes to the {editItem?.type} information below.
            </DialogDescription>
          </DialogHeader>

          {editItem?.type === "event" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editEventTitle">Event Title</Label>
                <Input
                  id="editEventTitle"
                  value={getEventData()?.title || ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      data: { ...editItem.data, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEventDescription">Description</Label>
                <Textarea
                  id="editEventDescription"
                  value={getEventData()?.description || ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      data: { ...editItem.data, description: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editStartDate">Start Date</Label>
                  <Input
                    id="editStartDate"
                    type="datetime-local"
                    value={getEventData()?.startDate || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        data: { ...editItem.data, startDate: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editEndDate">End Date</Label>
                  <Input
                    id="editEndDate"
                    type="datetime-local"
                    value={getEventData()?.endDate || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        data: { ...editItem.data, endDate: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editEventActive"
                  checked={getEventData()?.isActive !== false}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      data: { ...editItem.data, isActive: e.target.checked },
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="editEventActive" className="text-sm">
                  Active Event
                </Label>
              </div>
            </div>
          )}

          {editItem?.type === "quiz" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editQuizTitle">Quiz Title</Label>
                <Input
                  id="editQuizTitle"
                  value={getQuizData()?.title || ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      data: { ...editItem.data, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editQuizEvent">Event</Label>
                <Select
                  value={(() => {
                    const eventId = getQuizData()?.eventId;
                    return typeof eventId === "string" ? eventId : "";
                  })()}
                  onValueChange={(value) =>
                    setEditItem({
                      ...editItem,
                      data: { ...editItem.data, eventId: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event._id} value={event._id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editQuizDuration">Duration (minutes)</Label>
                  <Input
                    id="editQuizDuration"
                    type="number"
                    min="1"
                    value={getQuizData()?.duration || 0}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        data: {
                          ...editItem.data,
                          duration: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editPassingMarks">Passing Marks</Label>
                  <Input
                    id="editPassingMarks"
                    type="number"
                    min="0"
                    value={getQuizData()?.passingMarks || 0}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        data: {
                          ...editItem.data,
                          passingMarks: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editQuizInstructions">Instructions</Label>
                <Textarea
                  id="editQuizInstructions"
                  value={getQuizData()?.instructions || ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      data: { ...editItem.data, instructions: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editQuizActive"
                  checked={getQuizData()?.isActive !== false}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      data: { ...editItem.data, isActive: e.target.checked },
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="editQuizActive" className="text-sm">
                  Active Quiz
                </Label>
              </div>
            </div>
          )}

          {editItem?.type === "question" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editQuestionQuiz">Quiz</Label>
                <Select
                  value={(() => {
                    const quizId = getQuestionData()?.quizId;
                    return typeof quizId === "string" ? quizId : "";
                  })()}
                  onValueChange={(value) =>
                    setEditItem({
                      ...editItem,
                      data: { ...editItem.data, quizId: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((quiz) => (
                      <SelectItem key={quiz._id} value={quiz._id}>
                        {quiz.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editQuestionText">Question Text</Label>
                <Textarea
                  id="editQuestionText"
                  value={getQuestionData()?.text || ""}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      data: { ...editItem.data, text: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {getQuestionData()?.options?.map(
                    (option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            // Create a new array to avoid mutating state directly
                            const currentOptions = [
                              ...(getQuestionData()?.options || []),
                            ];
                            const updatedOptions = [...currentOptions];
                            updatedOptions[index] = e.target.value;
                            setEditItem({
                              ...editItem,
                              data: {
                                ...editItem.data,
                                options: updatedOptions,
                              },
                            });
                          }}
                        />
                        <input
                          type="radio"
                          name="editCorrectAnswer"
                          checked={getQuestionData()?.correctAnswer === option}
                          onChange={() =>
                            setEditItem({
                              ...editItem,
                              data: { ...editItem.data, correctAnswer: option },
                            })
                          }
                          className="rounded"
                        />
                        <Label className="text-sm">Correct</Label>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editQuestionMarks">Marks</Label>
                  <Input
                    id="editQuestionMarks"
                    type="number"
                    min="1"
                    value={getQuestionData()?.marks || 0}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        data: {
                          ...editItem.data,
                          marks: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editQuestionDifficulty">Difficulty</Label>
                  <Select
                    value={getQuestionData()?.difficulty || "medium"}
                    onValueChange={(value) =>
                      setEditItem({
                        ...editItem,
                        data: { ...editItem.data, difficulty: value },
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
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editItem?.type === "event") handleUpdateEvent();
                else if (editItem?.type === "quiz") handleUpdateQuiz();
                else if (editItem?.type === "question") handleUpdateQuestion();
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteDialog?.type}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteDialog?.type === "event")
                  handleDeleteEvent(deleteDialog.id);
                else if (deleteDialog?.type === "quiz")
                  handleDeleteQuiz(deleteDialog.id);
                else if (deleteDialog?.type === "question")
                  handleDeleteQuestion(deleteDialog.id);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Participation Details Dialog */}
      <Dialog
        open={!!selectedParticipation}
        onOpenChange={() => setSelectedParticipation(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Participation Details</DialogTitle>
            <DialogDescription>
              Detailed view of quiz participation and answers
            </DialogDescription>
          </DialogHeader>

          {selectedParticipation && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <div className="text-sm text-gray-600">
                    {typeof selectedParticipation.studentId === "string" ? (
                      <div>
                        <div className="font-semibold">Unknown Student</div>
                        <div className="text-xs text-gray-500">
                          ID: {selectedParticipation.studentId}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-semibold">
                          {selectedParticipation.studentId.fullNameEnglish ||
                            selectedParticipation.studentId.fullNameBangla ||
                            "Unknown Student"}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {selectedParticipation.studentId._id}
                        </div>
                        <div className="text-xs text-gray-500">
                          Contact:{" "}
                          {selectedParticipation.studentId.contact || "N/A"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-gray-600">
                    {selectedParticipation.status}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Score</Label>
                  <p className="text-sm text-gray-600">
                    {selectedParticipation.totalScore}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted At</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedParticipation.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Answers
                </Label>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedParticipation.answers.map((answer, index) => {
                    const question = questions.find(
                      (q) => q._id === answer.questionId
                    );
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">
                            Question {index + 1}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                answer.isCorrect
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {answer.isCorrect ? "Correct" : "Incorrect"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {answer.marksObtained} marks
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {question?.text || "Question not found"}
                        </p>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">
                            Selected Answer:
                          </p>
                          <p className="text-sm bg-gray-50 p-2 rounded">
                            {answer.selectedOption}
                          </p>
                        </div>
                        {question?.correctAnswer && (
                          <div className="space-y-1 mt-2">
                            <p className="text-xs text-gray-500">
                              Correct Answer:
                            </p>
                            <p className="text-sm bg-green-50 p-2 rounded">
                              {question.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedParticipation(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuizManagement;

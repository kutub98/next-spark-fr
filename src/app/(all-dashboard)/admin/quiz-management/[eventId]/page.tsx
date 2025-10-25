"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/redux/features/eventSlice";
import {
  getQuizzesByEventId,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  Quiz,
} from "@/redux/features/quizSlice";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppDispatch, RootState } from "@/store/store";
import {
  Loader2,
  Plus,
  Clock,
  FileText,
  ArrowLeft,
  ArrowRight,
  Edit,
  Trash2,
  Calendar,
  Hash,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

const EventDetailPage = () => {
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

  const [newQuiz, setNewQuiz] = useState<Partial<Quiz>>({
    title: "",
    eventId: eventId,
    duration: 30,
    instructions: "",
    isActive: true,
    totalQuestions: 1,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (eventId) {
      dispatch(getEventById(eventId));
      dispatch(getQuizzesByEventId(eventId));
    }
  }, [dispatch, eventId]);

  const handleCreateQuiz = async () => {
    if (
      !newQuiz.title ||
      !newQuiz.duration ||
      !newQuiz.totalQuestions ||
      !newQuiz.startTime ||
      !newQuiz.endTime
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsCreating(true);
      await dispatch(createQuiz(newQuiz)).unwrap();
      toast.success("Quiz created successfully");

      // Refresh the quiz list
      await dispatch(getQuizzesByEventId(eventId));

      setNewQuiz({
        title: "",
        eventId: eventId,
        duration: 30,
        instructions: "",
        isActive: true,
        totalQuestions: 1,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setCreateDialogOpen(false);
    } catch (error) {
      // console.error("Create quiz error:", error);

      let errorMessage = "Failed to create quiz";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz({ ...quiz });
    setEditDialogOpen(true);
  };

  const handleUpdateQuiz = async () => {
    if (
      !editingQuiz?.title ||
      !editingQuiz?.duration ||
      !editingQuiz?.totalQuestions ||
      !editingQuiz?.startTime ||
      !editingQuiz?.endTime
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsUpdating(true);

      // Clean the data before sending
      const updateData = {
        title: editingQuiz.title,
        duration: editingQuiz.duration,
        totalMarks: editingQuiz.totalMarks,
        passingMarks: editingQuiz.passingMarks,
        totalQuestions: editingQuiz.totalQuestions,
        startTime: editingQuiz.startTime,
        endTime: editingQuiz.endTime,
        instructions: editingQuiz.instructions,
        isActive: editingQuiz.isActive,
      };

      await dispatch(
        updateQuiz({ id: editingQuiz._id, data: updateData })
      ).unwrap();

      toast.success("Quiz updated successfully");

      // Refresh the quiz list
      await dispatch(getQuizzesByEventId(eventId));

      setEditDialogOpen(false);
      setEditingQuiz(null);
    } catch (error) {
      // console.error("Update quiz error:", error);

      let errorMessage = "Failed to update quiz";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteQuiz(quizToDelete._id)).unwrap();
      toast.success("Quiz deleted successfully");

      // Refresh the quiz list
      await dispatch(getQuizzesByEventId(eventId));

      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (error) {
      // console.error("Delete quiz error:", error);

      let errorMessage = "Failed to delete quiz";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  if (eventLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Event not found
        </h3>
        <p className="text-gray-500 mb-4">
          The event you&apos;re looking for doesn&apos;t exist.
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
            <h1 className="text-3xl font-bold">{selectedEvent.title}</h1>
            <p className="text-gray-600">{selectedEvent.description}</p>
          </div>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Quiz
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div>
            <strong>Start:</strong>{" "}
            {new Date(selectedEvent.startDate).toLocaleString()}
          </div>
          <div>
            <strong>End:</strong>{" "}
            {new Date(selectedEvent.endDate).toLocaleString()}
          </div>
          <div>
            <strong>Status:</strong> {selectedEvent.status}
          </div>
        </div>
      </div>

      {quizzesLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No quizzes found
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first quiz for this event.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      {quiz.isActive === true ? (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {quiz.instructions || "No instructions"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditQuiz(quiz);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuiz(quiz);
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{quiz.duration} minutes</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{quiz.totalQuestions || 0} questions</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Total Marks:</span>
                      <Badge variant="secondary" className="ml-1">
                        {typeof quiz.totalMarks === "number"
                          ? quiz.totalMarks
                          : "Not set"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Passing:</span>
                      <Badge variant="outline" className="ml-1">
                        {typeof quiz.passingMarks === "number"
                          ? quiz.passingMarks
                          : "Not set"}
                      </Badge>
                    </div>
                  </div>

                  {quiz.startTime && (
                    <div className="flex items-start text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">Start:</span>
                        <span className="text-xs">
                          {formatDateTime(quiz.startTime)}
                        </span>
                      </div>
                    </div>
                  )}

                  {quiz.endTime && (
                    <div className="flex items-start text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">End:</span>
                        <span className="text-xs">
                          {formatDateTime(quiz.endTime)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Link
                      href={`/admin/quiz-management/${eventId}/${quiz._id}`}
                    >
                      <Button variant="outline" className="w-full">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Manage Quiz
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Quiz Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new quiz for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quizTitle">Quiz Title *</Label>
              <Input
                id="quizTitle"
                value={newQuiz.title || ""}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, title: e.target.value })
                }
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quizDuration">Duration (minutes) *</Label>
                <Input
                  id="quizDuration"
                  type="number"
                  min="1"
                  value={newQuiz.duration || ""}
                  onChange={(e) =>
                    setNewQuiz({
                      ...newQuiz,
                      duration: Number(e.target.value),
                    })
                  }
                  placeholder="Duration"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalQuestions">Total Questions *</Label>
                <Input
                  id="totalQuestions"
                  type="number"
                  min="1"
                  value={
                    typeof newQuiz.totalQuestions === "number"
                      ? newQuiz.totalQuestions
                      : ""
                  }
                  onChange={(e) =>
                    setNewQuiz({
                      ...newQuiz,
                      totalQuestions: Number(e.target.value),
                    })
                  }
                  placeholder="Total questions"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min="0"
                  value={newQuiz.totalMarks ?? ""}
                  onChange={(e) =>
                    setNewQuiz({
                      ...newQuiz,
                      totalMarks: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Total marks"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="passingMarks">Passing Marks</Label>
                <Input
                  id="passingMarks"
                  type="number"
                  min="0"
                  value={newQuiz.passingMarks ?? ""}
                  onChange={(e) =>
                    setNewQuiz({
                      ...newQuiz,
                      passingMarks: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Passing marks"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={
                    newQuiz.startTime && typeof newQuiz.startTime === "string"
                      ? new Date(newQuiz.startTime).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setNewQuiz({
                      ...newQuiz,
                      startTime: new Date(e.target.value).toISOString(),
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={
                    newQuiz.endTime && typeof newQuiz.endTime === "string"
                      ? new Date(newQuiz.endTime).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setNewQuiz({
                      ...newQuiz,
                      endTime: new Date(e.target.value).toISOString(),
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quizInstructions">Instructions</Label>
              <Textarea
                id="quizInstructions"
                value={newQuiz.instructions || ""}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, instructions: e.target.value })
                }
                placeholder="Quiz instructions (optional)"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="quizActive"
                checked={newQuiz.isActive === true}
                onChange={(e) =>
                  setNewQuiz({ ...newQuiz, isActive: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="quizActive" className="text-sm">
                Active Quiz
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateQuiz} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quiz Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
            <DialogDescription>Update the quiz details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editQuizTitle">Quiz Title *</Label>
              <Input
                id="editQuizTitle"
                value={editingQuiz?.title || ""}
                onChange={(e) =>
                  setEditingQuiz({ ...editingQuiz!, title: e.target.value })
                }
                placeholder="Enter quiz title"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editQuizDuration">Duration (minutes) *</Label>
                <Input
                  id="editQuizDuration"
                  type="number"
                  min="1"
                  value={editingQuiz?.duration ?? ""}
                  onChange={(e) =>
                    setEditingQuiz({
                      ...editingQuiz!,
                      duration: Number(e.target.value),
                    })
                  }
                  placeholder="Duration"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editTotalQuestions">Total Questions *</Label>
                <Input
                  id="editTotalQuestions"
                  type="number"
                  min="1"
                  value={
                    typeof editingQuiz?.totalQuestions === "number"
                      ? editingQuiz.totalQuestions
                      : ""
                  }
                  onChange={(e) =>
                    setEditingQuiz({
                      ...editingQuiz!,
                      totalQuestions: Number(e.target.value),
                    })
                  }
                  placeholder="Total questions"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editTotalMarks">Total Marks</Label>
                <Input
                  id="editTotalMarks"
                  type="number"
                  min="0"
                  value={editingQuiz?.totalMarks ?? ""}
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setEditingQuiz({
                      ...editingQuiz!,
                      totalMarks: value,
                    });
                  }}
                  placeholder="Total marks"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editPassingMarks">Passing Marks</Label>
                <Input
                  id="editPassingMarks"
                  type="number"
                  min="0"
                  value={editingQuiz?.passingMarks ?? ""}
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    setEditingQuiz({
                      ...editingQuiz!,
                      passingMarks: value,
                    });
                  }}
                  placeholder="Passing marks"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editStartTime">Start Time *</Label>
                <Input
                  id="editStartTime"
                  type="datetime-local"
                  value={
                    editingQuiz?.startTime &&
                    typeof editingQuiz.startTime === "string"
                      ? new Date(editingQuiz.startTime)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingQuiz({
                      ...editingQuiz!,
                      startTime: new Date(e.target.value).toISOString(),
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEndTime">End Time *</Label>
                <Input
                  id="editEndTime"
                  type="datetime-local"
                  value={
                    editingQuiz?.endTime &&
                    typeof editingQuiz.endTime === "string"
                      ? new Date(editingQuiz.endTime).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setEditingQuiz({
                      ...editingQuiz!,
                      endTime: new Date(e.target.value).toISOString(),
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editQuizInstructions">Instructions</Label>
              <Textarea
                id="editQuizInstructions"
                value={editingQuiz?.instructions || ""}
                onChange={(e) =>
                  setEditingQuiz({
                    ...editingQuiz!,
                    instructions: e.target.value,
                  })
                }
                placeholder="Quiz instructions (optional)"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editQuizActive"
                checked={editingQuiz?.isActive === true}
                onChange={(e) =>
                  setEditingQuiz({
                    ...editingQuiz!,
                    isActive: e.target.checked,
                  })
                }
                className="rounded"
              />
              <Label htmlFor="editQuizActive" className="text-sm">
                Active Quiz
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateQuiz} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Quiz Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{quizToDelete?.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteQuiz}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailPage;

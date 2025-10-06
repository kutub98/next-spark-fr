import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Edit, Trash2, Plus, FileText } from "lucide-react";
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
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Event } from "@/redux/features/eventSlice";
import { Quiz } from "@/redux/features/quizSlice";
import { IQuestion } from "@/redux/features/questionSlice";

interface QuizzesTabProps {
  events: Event[];
  quizzes: Quiz[];
  questions: IQuestion[];
  quizzesLoading: boolean;
  newQuiz: Partial<Quiz>;
  setNewQuiz: React.Dispatch<React.SetStateAction<Partial<Quiz>>>;
  handleCreateQuiz: () => void;
  setEditItem: React.Dispatch<
    React.SetStateAction<{ type: string; data: Record<string, unknown> } | null>
  >;
  setDeleteDialog: React.Dispatch<
    React.SetStateAction<{ type: string; id: string } | null>
  >;
}

const QuizzesTab: React.FC<QuizzesTabProps> = ({
  events,
  quizzes,
  questions,
  quizzesLoading,
  newQuiz,
  setNewQuiz,
  handleCreateQuiz,
  setEditItem,
  setDeleteDialog,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Quizzes Management</CardTitle>
          <CardDescription>Create and manage quizzes</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={events.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> New Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new quiz.
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
              <div className="grid gap-2">
                <Label htmlFor="quizEvent">Event *</Label>
                <Select
                  value={
                    typeof newQuiz.eventId === "string" ? newQuiz.eventId : ""
                  }
                  onValueChange={(value) =>
                    setNewQuiz({ ...newQuiz, eventId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events
                      .filter((e) => e.isActive !== false)
                      .map((event) => (
                        <SelectItem key={event._id} value={event._id}>
                          {event.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quizDuration">Duration (minutes) *</Label>
                  <Input
                    id="quizDuration"
                    type="number"
                    min="1"
                    value={newQuiz.duration || 0}
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
                  <Label htmlFor="passingMarks">Passing Marks</Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    min="0"
                    value={newQuiz.passingMarks || 0}
                    onChange={(e) =>
                      setNewQuiz({
                        ...newQuiz,
                        passingMarks: Number(e.target.value),
                      })
                    }
                    placeholder="Passing marks"
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
                  placeholder="Quiz instructions"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="quizActive"
                  checked={newQuiz.isActive !== false}
                  onChange={(e) =>
                    setNewQuiz({ ...newQuiz, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="quizActive" className="text-sm">
                  Active Quiz
                </Label>
              </div>
              <Button onClick={handleCreateQuiz} disabled={quizzesLoading}>
                {quizzesLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Quiz
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
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
            <p className="text-gray-500">
              Create your first quiz to get started.
            </p>
            {events.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                You need to create an event first before creating quizzes.
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => {
                  const quizQuestions = questions.filter(
                    (q) => q.quizId === quiz._id
                  );

                  return (
                    <TableRow key={quiz._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{quiz.title}</span>
                          {!quiz.isActive && (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {typeof quiz.eventId === "object" &&
                        quiz.eventId !== null ? (
                          <Badge variant="outline">{quiz.eventId.title}</Badge>
                        ) : (
                          <Badge variant="secondary">Unknown Event</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{quiz.duration} min</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{quiz.totalMarks}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {quizQuestions.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setEditItem({ type: "quiz", data: quiz })
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteDialog({ type: "quiz", id: quiz._id })
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
        )}
      </CardContent>
    </Card>
  );
};

export default QuizzesTab;

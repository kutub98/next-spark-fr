// D:\PersonalClientWork\quiz-contest\quiz-contest-fr\src\app\dashboard\appearance\quiz-data\page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  getEvents,
  createEvent,
  Event as IEvent,
} from "@/redux/features/eventSlice";
import {
  getQuizzes,
  createQuiz,
  Quiz as IQuiz,
} from "@/redux/features/quizSlice";
import {
  fetchQuestions,
  createQuestion,
  IQuestion,
} from "@/redux/features/questionSlice";
import { fetchParticipations } from "@/redux/features/participationSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Eye, Trash2, Edit } from "lucide-react";

const AdminDashboard = () => {
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
  const { participations, loading: participationsLoading } = useSelector(
    (state: RootState) => state.participations
  );

  const [newEvent, setNewEvent] = useState<Partial<IEvent>>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [newQuiz, setNewQuiz] = useState<Partial<IQuiz>>({
    title: "",
    eventId: "",
    duration: 0,
    totalMarks: 0,
  });
  const [newQuestion, setNewQuestion] = useState<Partial<IQuestion>>({
    quizId: "",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
  });
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        dispatch(getEvents()),
        dispatch(getQuizzes()),
        dispatch(fetchQuestions()),
        dispatch(fetchParticipations()),
      ]);
    } catch (error) {
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
      });
    } catch (error: unknown) {
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
        duration: 0,
        totalMarks: 0,
      });
    } catch (error: unknown) {
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
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create question";
      toast.error(errorMessage);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...(newQuestion.options || [])];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Quiz Management Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="participations">Participations</TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Events</CardTitle>
                <CardDescription>Manage all quiz events</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new quiz event.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, title: e.target.value })
                        }
                        placeholder="Event title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            description: e.target.value,
                          })
                        }
                        placeholder="Event description"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={newEvent.startDate}
                        onChange={(e) =>
                          setNewEvent({
                            ...newEvent,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={newEvent.endDate}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, endDate: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      onClick={handleCreateEvent}
                      disabled={eventsLoading}
                    >
                      {eventsLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event._id}>
                        <TableCell className="font-medium">
                          {event.title}
                        </TableCell>
                        <TableCell>
                          {new Date(event.startDate).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(event.endDate).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quizzes Tab */}
        <TabsContent value="quizzes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quizzes</CardTitle>
                <CardDescription>Manage all quizzes</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Quiz</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new quiz.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="quizTitle">Title</Label>
                      <Input
                        id="quizTitle"
                        value={newQuiz.title}
                        onChange={(e) =>
                          setNewQuiz({ ...newQuiz, title: e.target.value })
                        }
                        placeholder="Quiz title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="event">Event</Label>
                      <Select
                        value={
                          typeof newQuiz.eventId === "string"
                            ? newQuiz.eventId
                            : ""
                        }
                        onValueChange={(value) =>
                          setNewQuiz({ ...newQuiz, eventId: value })
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
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newQuiz.duration}
                        onChange={(e) =>
                          setNewQuiz({
                            ...newQuiz,
                            duration: Number(e.target.value),
                          })
                        }
                        placeholder="Quiz duration in minutes"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="totalMarks">Total Marks</Label>
                      <Input
                        id="totalMarks"
                        type="number"
                        value={newQuiz.totalMarks}
                        onChange={(e) =>
                          setNewQuiz({
                            ...newQuiz,
                            totalMarks: Number(e.target.value),
                          })
                        }
                        placeholder="Total marks"
                      />
                    </div>
                    <Button
                      onClick={handleCreateQuiz}
                      disabled={quizzesLoading}
                    >
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
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizzes.map((quiz) => {
                      const event = events.find((e) => e._id === quiz.eventId);
                      return (
                        <TableRow key={quiz._id}>
                          <TableCell className="font-medium">
                            {quiz.title}
                          </TableCell>
                          <TableCell>
                            {event?.title || "Unknown Event"}
                          </TableCell>
                          <TableCell>{quiz.duration} minutes</TableCell>
                          <TableCell>{quiz.totalMarks}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Manage all quiz questions</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
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
                      <Label htmlFor="quiz">Quiz</Label>
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
                          {quizzes.map((quiz) => (
                            <SelectItem key={quiz._id} value={quiz._id}>
                              {quiz.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="questionText">Question Text</Label>
                      <Textarea
                        id="questionText"
                        value={newQuestion.text}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            text: e.target.value,
                          })
                        }
                        placeholder="Enter your question"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Options</Label>
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
                          />
                          <Label>Correct</Label>
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="marks">Marks</Label>
                      <Input
                        id="marks"
                        type="number"
                        value={newQuestion.marks}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            marks: Number(e.target.value),
                          })
                        }
                        placeholder="Marks for this question"
                      />
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
            </CardHeader>
            <CardContent>
              {questionsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Quiz</TableHead>
                      <TableHead>Correct Answer</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question) => {
                      const quiz = quizzes.find(
                        (q) => q._id === question.quizId
                      );
                      return (
                        <TableRow key={question._id}>
                          <TableCell className="font-medium max-w-md truncate">
                            {question.text}
                          </TableCell>
                          <TableCell>{quiz?.title || "Unknown Quiz"}</TableCell>
                          <TableCell>{question.correctAnswer}</TableCell>
                          <TableCell>{question.marks}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participations Tab */}
        <TabsContent value="participations">
          <Card>
            <CardHeader>
              <CardTitle>Participations</CardTitle>
              <CardDescription>View all quiz participations</CardDescription>
            </CardHeader>
            <CardContent>
              {participationsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Quiz</TableHead>
                      <TableHead>Total Score</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participations.map((participation) => {
                      const quiz = quizzes.find(
                        (q) => q._id === participation.quizId
                      );
                      return (
                        <TableRow key={participation._id}>
                          <TableCell className="font-medium">
                            {typeof participation.studentId === "string"
                              ? participation.studentId
                              : participation.studentId?.fullNameEnglish ||
                                "Unknown Student"}
                          </TableCell>
                          <TableCell>{quiz?.title || "Unknown Quiz"}</TableCell>
                          <TableCell>{participation.totalScore}</TableCell>
                          <TableCell>
                            {new Date(participation.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

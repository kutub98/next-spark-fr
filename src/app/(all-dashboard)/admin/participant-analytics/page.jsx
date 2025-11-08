"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Download, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { getQuizzes } from "@/redux/features/quizSlice";
import {
  fetchParticipations,
  getParticipationsByQuiz,
  updateParticipation,
} from "@/redux/features/participationSlice";
import { fetchQuestionsByQuizId } from "@/redux/features/questionSlice";
import { AppDispatch } from "@/store/store";

const ParticipantAnalytics = () => {
  const dispatch = useDispatch();

  const { quizzes, loading: quizzesLoading } = useSelector(
    (state) => state.quizzes
  );
  const { participations, loading: participationsLoading } = useSelector(
    (state) => state.participations
  );
  const { questions, loading: questionsLoading } = useSelector(
    (state) => state.questions
  );

  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [reviewOpen, setReviewOpen] = useState(false);
  const [editedParticipation, setEditedParticipation] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(getQuizzes());
    dispatch(fetchParticipations());
  }, [dispatch]);

  useEffect(() => {
    if (selectedQuizId) {
      dispatch(getParticipationsByQuiz(selectedQuizId));
      dispatch(fetchQuestionsByQuizId(selectedQuizId));
    }
  }, [selectedQuizId, dispatch]);

  const selectedQuiz = useMemo(
    () => quizzes.find((q) => q._id === selectedQuizId),
    [quizzes, selectedQuizId]
  );

  const filteredParticipations = useMemo(() => {
    return participations
      .filter((p) => {
        if (!selectedQuizId) return true;
        return p.quiz?._id === selectedQuizId;
      })
      .filter((p) =>
        statusFilter === "all" ? true : p.status === statusFilter
      )
      .filter((p) => {
        const user = p.user || {};
        const name = user.fullNameEnglish || user.fullNameBangla || "Unknown";
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.contact || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
  }, [participations, selectedQuizId, statusFilter, searchTerm]);

  const computeRewardPoints = (score, totalMarks) => {
    if (!totalMarks || totalMarks <= 0) return 0;
    const pct = (score / totalMarks) * 100;
    if (pct >= 90) return 100;
    if (pct >= 75) return 70;
    if (pct >= 50) return 40;
    return 10;
  };

  const openReview = (participation) => {
    // ✅ Merge each answer with full question data
    const mergedAnswers = participation.answers.map((ans) => {
      const fullQuestion = questions.find((q) => q._id === ans.question) || {};
      return {
        ...ans,
        question: fullQuestion,
      };
    });
    setEditedParticipation({ ...participation, answers: mergedAnswers });
    setReviewOpen(true);
  };

  const updateAnswerField = (index, field, value) => {
    if (!editedParticipation) return;
    const updated = { ...editedParticipation };
    const answers = [...updated.answers];
    const current = { ...answers[index] };

    if (field === "marksObtained") {
      const val = Number(value);
      current.marksObtained = Number.isFinite(val) && val >= 0 ? val : 0;
    } else if (field === "isCorrect") {
      current.isCorrect = !!value;
    }

    answers[index] = current;
    updated.answers = answers;
    updated.obtainedMarks = answers.reduce(
      (sum, a) => sum + (a.marksObtained || 0),
      0
    );

    if (selectedQuiz) {
      updated.status =
        updated.obtainedMarks >= (selectedQuiz.passingMarks || 0)
          ? "completed"
          : "failed";
    }

    setEditedParticipation(updated);
  };

  const handleSaveMarking = async () => {
    if (!editedParticipation) return;
    try {
      setIsSaving(true);
      await dispatch(
        updateParticipation({
          id: editedParticipation._id,
          data: {
            answers: editedParticipation.answers,
            obtainedMarks: editedParticipation.obtainedMarks,
            status: editedParticipation.status,
          },
        })
      ).unwrap();
      toast.success("Marks updated successfully");
      setReviewOpen(false);
      setEditedParticipation(null);
    } catch (e) {
      toast.error(e?.message || "Failed to update marks");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const rows = filteredParticipations.map((p) => {
      const user = p.user || {};
      const quiz = p.quiz || {};
      const totalMarks = quiz.totalMarks || 0;
      const reward = computeRewardPoints(p.obtainedMarks, totalMarks);
      return {
        "Student Name":
          user.fullNameEnglish || user.fullNameBangla || "Unknown",
        Contact: user.contact || "",
        Quiz: quiz.title || "Unknown",
        "Total Marks": totalMarks,
        "Obtained Marks": p.obtainedMarks,
        Status: p.status,
        Reward: reward,
        Submitted: new Date(p.createdAt).toLocaleString(),
      };
    });
    if (rows.length === 0) return toast.info("No data to export");
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => `"${r[h]}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participant-analytics-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported CSV successfully");
  };

  const handleRefresh = () => {
    if (selectedQuizId) {
      dispatch(getParticipationsByQuiz(selectedQuizId));
      dispatch(fetchQuestionsByQuizId(selectedQuizId));
    } else {
      dispatch(fetchParticipations());
    }
  };

  const loading = quizzesLoading || participationsLoading || questionsLoading;

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Participant Analytics</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Label>Filter by Quiz</Label>
          <Select
            value={selectedQuizId || "all"}
            onValueChange={(value) =>
              setSelectedQuizId(value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All quizzes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All quizzes</SelectItem>
              {quizzes.map((q) => (
                <SelectItem key={q._id} value={q._id}>
                  {q.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Filter by Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label>Search Student</Label>
          <Input
            placeholder="Search by name or contact"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredParticipations.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No participations found
          </h3>
          <p className="text-gray-600">Try changing filters or refresh.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipations.map((p) => {
                const user = p.user || {};
                const quiz = p.quiz || {};
                const totalMarks = quiz.totalMarks || 0;
                const reward = computeRewardPoints(p.obtainedMarks, totalMarks);
                const passed = p.obtainedMarks >= (quiz.passingMarks || 0);
                return (
                  <TableRow key={p._id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.fullNameEnglish ||
                          user.fullNameBangla ||
                          "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.contact}
                      </div>
                    </TableCell>
                    <TableCell>{quiz.title || "Unknown"}</TableCell>
                    <TableCell>
                      {p.obtainedMarks} / {p.totalMarks}
                    </TableCell>
                    <TableCell>
                      <Badge variant={passed ? "default" : "destructive"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-100 text-purple-800">
                        {reward} pts
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(p.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReview(p)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Link
                        href={`/admin/participant-analytics/${p._id}`}
                        className="inline-flex items-center px-3 py-1.5 border rounded-md text-sm"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review Modal */}
      <Dialog open={reviewOpen} onOpenChange={() => setReviewOpen(false)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review & Custom Marking</DialogTitle>
            <DialogDescription>
              Adjust marks and correctness. Total and status will auto-update.
            </DialogDescription>
          </DialogHeader>

          {editedParticipation && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Top Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-xs text-gray-500">Student</Label>
                  <div className="text-sm font-medium">
                    {editedParticipation.user?.fullNameEnglish ||
                      editedParticipation.user?.fullNameBangla ||
                      "Unknown"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Quiz</Label>
                  <div className="text-sm">
                    {editedParticipation.quiz?.title || "Unknown"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Total Score</Label>
                  <div className="text-sm font-semibold">
                    {editedParticipation.obtainedMarks} /{" "}
                    {editedParticipation?.totalMarks || 0}
                  </div>
                </div>
              </div>

              {/* Questions */}
              {editedParticipation.answers.map((ans, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Question</div>
                      <div className="text-sm font-medium">
                        {ans.question?.text || "—"}
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        Selected Answer
                      </div>
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        {ans.answer || "—"}
                      </div>
                    </div>
                    <div className="w-64">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Marks Obtained</Label>
                          <Input
                            type="number"
                            min="0"
                            value={ans.marksObtained}
                            onChange={(e) =>
                              updateAnswerField(
                                idx,
                                "marksObtained",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={ans.isCorrect}
                              onChange={(e) =>
                                updateAnswerField(
                                  idx,
                                  "isCorrect",
                                  e.target.checked
                                )
                              }
                              className="rounded"
                            />
                            <Label className="text-xs">Correct</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMarking} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantAnalytics;

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
import { Loader2, RefreshCw, Download } from "lucide-react";
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
  const typedDispatch = useDispatch();

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
    // Load quizzes and participations
    typedDispatch(getQuizzes());
    typedDispatch(fetchParticipations());
  }, [typedDispatch]);

  useEffect(() => {
    if (selectedQuizId) {
      typedDispatch(getParticipationsByQuiz(selectedQuizId));
      typedDispatch(fetchQuestionsByQuizId(selectedQuizId));
    }
  }, [selectedQuizId, typedDispatch]);

  const selectedQuiz = useMemo(
    () => quizzes.find((q) => q._id === selectedQuizId),
    [quizzes, selectedQuizId]
  );

  const filteredParticipations = useMemo(() => {
    return participations
      .filter((p) => {
        if (!selectedQuizId) return true;
        const pid = typeof p.quizId === "string" ? p.quizId : p.quizId?._id;
        return pid === selectedQuizId;
      })
      .filter((p) =>
        statusFilter === "all" ? true : p.status === statusFilter
      )
      .filter((p) => {
        const student =
          typeof p.studentId === "string"
            ? { fullNameEnglish: p.studentId, contact: "" }
            : p.studentId;
        const name =
          student?.fullNameEnglish || student?.fullNameBangla || "Unknown";
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student?.contact || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
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

  const getQuestionText = (questionId) => {
    const q = questions.find((qq) => qq._id === questionId);
    return q?.text || "—";
  };

  const openReview = (participation) => {
    setEditedParticipation(JSON.parse(JSON.stringify(participation)));
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
    updated.totalScore = answers.reduce(
      (sum, a) => sum + (a.marksObtained || 0),
      0
    );
    // Also set status based on passing marks if quiz selected
    if (selectedQuiz) {
      updated.status =
        updated.totalScore >= (selectedQuiz.passingMarks || 0)
          ? "completed"
          : "failed";
    }
    setEditedParticipation(updated);
  };

  const handleSaveMarking = async () => {
    if (!editedParticipation) return;
    try {
      setIsSaving(true);
      await typedDispatch(
        updateParticipation({
          id: editedParticipation._id,
          data: {
            answers: editedParticipation.answers,
            totalScore: editedParticipation.totalScore,
            status: editedParticipation.status,
          },
        })
      ).unwrap();
      toast.success("Marks updated successfully");
      setReviewOpen(false);
      setEditedParticipation(null);
    } catch (e) {
      const msg = e?.message || "Failed to update marks";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const rows = filteredParticipations.map((p) => {
      const student =
        typeof p.studentId === "string"
          ? { id: p.studentId, name: "Unknown", contact: "" }
          : {
              id: p.studentId._id,
              name:
                p.studentId.fullNameEnglish ||
                p.studentId.fullNameBangla ||
                "Unknown",
              contact: p.studentId.contact || "",
            };
      const pid = typeof p.quizId === "string" ? p.quizId : p.quizId?._id;
      const quiz = quizzes.find((q) => q._id === pid);
      const totalMarks = quiz?.totalMarks || 0;
      const reward = computeRewardPoints(p.totalScore, totalMarks);
      return {
        "Student ID": student.id,
        "Student Name": student.name,
        Contact: student.contact,
        Quiz: quiz?.title || "Unknown",
        "Total Marks": totalMarks,
        Score: p.totalScore,
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
      typedDispatch(getParticipationsByQuiz(selectedQuizId));
      typedDispatch(fetchQuestionsByQuizId(selectedQuizId));
    } else {
      typedDispatch(fetchParticipations());
    }
  };

  const loading = quizzesLoading || participationsLoading || questionsLoading;

  return (
    <div className="container mx-auto py-6">
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
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Under Review</SelectItem>
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
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipations.map((p) => {
                const student =
                  typeof p.studentId === "string"
                    ? { name: "Unknown", contact: "" }
                    : {
                        name:
                          p.studentId.fullNameEnglish ||
                          p.studentId.fullNameBangla ||
                          "Unknown",
                        contact: p.studentId.contact || "",
                      };
                const pQuizId =
                  typeof p.quizId === "string" ? p.quizId : p.quizId?._id;
                const quiz = quizzes.find((q) => q._id === pQuizId);
                const passingMarks = quiz?.passingMarks || 0;
                const isRowForSelectedQuiz = selectedQuizId
                  ? pQuizId === selectedQuizId
                  : false;
                const marksFromQuestions = isRowForSelectedQuiz
                  ? (questions || []).reduce((sum, q) => {
                      const qQuizId =
                        typeof q.quizId === "string" ? q.quizId : q.quizId?._id;
                      return qQuizId === pQuizId ? sum + (q.marks || 0) : sum;
                    }, 0)
                  : 0;
                const totalAvailable =
                  marksFromQuestions && marksFromQuestions > 0
                    ? marksFromQuestions
                    : quiz?.totalMarks || 0;
                const reward = computeRewardPoints(
                  p.totalScore,
                  totalAvailable
                );
                const passed = p.totalScore >= (quiz?.passingMarks || 0);
                return (
                  <TableRow key={p._id}>
                    <TableCell>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-gray-500">
                        {student.contact}
                      </div>
                    </TableCell>
                    <TableCell>{quiz?.title || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{p.totalScore}</span>/{" "}
                        {passingMarks}
                      </div>
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
                    <TableCell className="text-right">
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

      {/* Review & Custom Marking Dialog */}
      <Dialog open={reviewOpen} onOpenChange={() => setReviewOpen(false)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Answers & Custom Marking</DialogTitle>
            <DialogDescription>
              Adjust marks and correctness. Status and total will auto-update.
            </DialogDescription>
          </DialogHeader>

          {editedParticipation && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-xs text-gray-500">Student</Label>
                  <div className="text-sm font-medium">
                    {typeof editedParticipation.studentId === "string"
                      ? editedParticipation.studentId
                      : editedParticipation.studentId.fullNameEnglish ||
                        editedParticipation.studentId.fullNameBangla ||
                        "Unknown"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Quiz</Label>
                  <div className="text-sm">
                    {selectedQuiz?.title || "Unknown"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Total Score</Label>
                  <div className="text-sm font-semibold">
                    {editedParticipation.totalScore} /{" "}
                    {selectedQuiz?.totalMarks || 0}
                  </div>
                </div>
              </div>

              {editedParticipation.answers.map((ans, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Question</div>
                      <div className="text-sm font-medium">
                        {getQuestionText(ans.questionId)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Selected Answer
                      </div>
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        {ans.selectedOption || "—"}
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

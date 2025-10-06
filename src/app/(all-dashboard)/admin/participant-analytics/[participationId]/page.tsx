"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  TableFooter,
} from "@/components/ui/table";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  getParticipationById,
  updateParticipation,
  type IParticipation,
  type IAnswer,
} from "@/redux/features/participationSlice";
import {
  fetchQuestionsByQuizId,
  type IQuestion,
} from "@/redux/features/questionSlice";
import type { RootState, AppDispatch } from "@/store/store";
import { api } from "@/data/api";

const ParticipationDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { participations, loading: partLoading } = useSelector(
    (s: RootState) => s.participations
  );
  const { questions, loading: qLoading } = useSelector(
    (s: RootState) => s.questions
  );

  const [isSaving, setIsSaving] = useState(false);
  const fileBaseUrl = useMemo(() => api.replace(/\/api\/v1$/, ""), []);

  const participation = useMemo(
    () =>
      participations.find(
        (p: IParticipation) => p._id === (params.participationId as string)
      ),
    [participations, params.participationId]
  );

  useEffect(() => {
    if (params.participationId) {
      dispatch(getParticipationById(params.participationId as string));
    }
  }, [dispatch, params.participationId]);

  useEffect(() => {
    if (!participation) return;
    type ParticipationMaybePopulated = Omit<IParticipation, "quizId"> & {
      quizId: string | { _id: string };
    };
    const p = participation as ParticipationMaybePopulated;
    const quizId = typeof p.quizId === "string" ? p.quizId : p.quizId._id;
    if (quizId) {
      dispatch(fetchQuestionsByQuizId(quizId));
    }
  }, [dispatch, participation]);

  const [editable, setEditable] = useState<IParticipation | null>(null);
  useEffect(() => {
    if (participation) {
      setEditable(JSON.parse(JSON.stringify(participation)));
    }
  }, [participation]);

  const getQuizTitle = () => {
    if (!editable) return "Unknown";
    const q = editable.quizId as unknown as string | { title?: string };
    return typeof q === "string" ? q : q?.title || "Unknown";
  };

  const getQuestionText = (questionId: string) => {
    const q = questions.find((qq: IQuestion) => qq._id === questionId);
    return q?.text || "—";
  };

  const getQuestionType = (questionId: string) => {
    const q = questions.find((qq: IQuestion) => qq._id === questionId);
    return q?.questionType || "";
  };

  const getQuestionMarks = (questionId: string) => {
    const q = questions.find((qq: IQuestion) => qq._id === questionId);
    return q?.marks ?? 0;
  };

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);

  const currentAnswer = useMemo(() => {
    if (!editable || reviewIndex === null) return null;
    return editable.answers[reviewIndex] ?? null;
  }, [editable, reviewIndex]);

  const currentQuestion = useMemo(() => {
    if (!currentAnswer) return null;
    return (
      questions.find((q: IQuestion) => q._id === currentAnswer.questionId) ||
      null
    );
  }, [currentAnswer, questions]);

  const openReview = (idx: number) => {
    setReviewIndex(idx);
    setIsReviewOpen(true);
  };

  const closeReview = () => {
    setIsReviewOpen(false);
    setReviewIndex(null);
  };

  const goPrev = () => {
    setReviewIndex((prev) => {
      if (prev === null) return prev;
      return prev > 0 ? prev - 1 : prev;
    });
  };

  const goNext = () => {
    setReviewIndex((prev) => {
      if (prev === null) return prev;
      const lastIndex = (editable?.answers?.length || 1) - 1;
      return prev < lastIndex ? prev + 1 : prev;
    });
  };

  const updateAnswerField = (
    index: number,
    field: "marksObtained" | "isCorrect",
    value: number | boolean
  ) => {
    if (!editable) return;
    const updated = { ...editable };
    const answers = [...updated.answers];
    const current = { ...answers[index] };
    if (field === "marksObtained") {
      const val = Number(value);
      current.marksObtained = Number.isFinite(val) && val >= 0 ? val : 0;
    } else if (field === "isCorrect") {
      current.isCorrect = Boolean(value);
    }
    answers[index] = current;
    updated.answers = answers;
    updated.totalScore = answers.reduce(
      (sum: number, a: IAnswer) => sum + (a.marksObtained || 0),
      0
    );
    setEditable(updated);
  };

  const handleSave = async () => {
    if (!editable) return;
    try {
      setIsSaving(true);
      await dispatch(
        updateParticipation({
          id: editable._id,
          data: {
            answers: editable.answers,
            totalScore: editable.totalScore,
          },
        })
      ).unwrap();
      toast.success("Participation updated");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const loading = partLoading || qLoading || !editable;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Participation Details</h1>
        </div>
        <div>
          <Button onClick={handleSave} disabled={isSaving || loading}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border">
            <div>
              <Label className="text-xs text-gray-500">Student</Label>
              <div className="text-sm font-medium">
                {typeof editable.studentId === "string"
                  ? editable.studentId
                  : editable.studentId.fullNameEnglish ||
                    editable.studentId.fullNameBangla ||
                    "Unknown"}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Quiz</Label>
              <div className="text-sm">{getQuizTitle()}</div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Total Score</Label>
              <div className="text-sm font-semibold">{editable.totalScore}</div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editable.answers.map((ans, idx: number) => {
                  const qType = getQuestionType(ans.questionId);
                  const displayText = (ans.participantAnswer ||
                    ans.selectedOption ||
                    "") as string;
                  const isLong = displayText.length > 20;
                  const shortText = isLong
                    ? `${displayText.slice(0, 20)}…`
                    : displayText;
                  return (
                    <TableRow key={idx}>
                      <TableCell className="max-w-md">
                        <div className="text-sm">
                          {getQuestionText(ans.questionId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{qType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs bg-gray-50 p-2 rounded break-words max-w-xs">
                          {shortText || "—"}
                        </div>
                        {isLong && (
                          <div className="mt-1">
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto"
                              onClick={() => openReview(idx)}
                            >
                              ...Read More
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Participant images if backend stores them under participantImages */}
                        {Array.isArray(ans.participantImages) &&
                        ans.participantImages.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            {ans.participantImages.map(
                              (img: string, i: number) => (
                                <a
                                  key={i}
                                  href={`${fileBaseUrl}${img}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="h-12 w-12 border rounded overflow-hidden"
                                  title={`image-${i + 1}`}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={`${fileBaseUrl}${img}`}
                                    alt="img"
                                    className="h-full w-full object-cover"
                                  />
                                </a>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ans.marksObtained ?? 0} /{" "}
                          {getQuestionMarks(ans.questionId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReview(idx)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="font-semibold">
                    {editable.totalScore}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <Dialog
            open={isReviewOpen}
            onOpenChange={(open) => {
              if (!open) closeReview();
              else setIsReviewOpen(open);
            }}
          >
            <DialogContent className="!max-w-5xl">
              <DialogHeader>
                <DialogTitle>
                  Review Answer
                  {typeof reviewIndex === "number" && editable?.answers?.length
                    ? ` (${reviewIndex + 1} / ${editable.answers.length})`
                    : ""}
                </DialogTitle>
                <DialogDescription>
                  View full response, images and assign marks.
                </DialogDescription>
              </DialogHeader>

              {currentAnswer && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">
                          Question
                        </Label>
                        <div className="text-sm font-medium max-w-2xl">
                          {getQuestionText(currentAnswer.questionId)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {currentQuestion?.questionType || ""}
                        </Badge>
                        <Badge>Marks: {currentQuestion?.marks ?? 0}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border space-y-2">
                      <Label className="text-xs text-gray-500">
                        Participant Answer
                      </Label>
                      {currentQuestion?.questionType === "MCQ" ? (
                        <div className="space-y-1 text-sm">
                          <div>
                            Selected: {currentAnswer.selectedOption || "—"}
                          </div>
                          {currentQuestion?.correctAnswer && (
                            <div className="text-gray-500">
                              Correct: {currentQuestion.correctAnswer}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap break-words bg-gray-50 p-2 rounded min-h-12 max-h-[200px] overflow-y-auto">
                          {currentAnswer.participantAnswer ||
                            currentAnswer.selectedOption ||
                            "—"}
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-lg border space-y-2">
                      <Label className="text-xs text-gray-500">
                        Participant Images
                      </Label>
                      {Array.isArray(currentAnswer.participantImages) &&
                      currentAnswer.participantImages.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {currentAnswer.participantImages.map(
                            (img: string, i: number) => (
                              <a
                                key={i}
                                href={`${fileBaseUrl}${img}`}
                                target="_blank"
                                rel="noreferrer"
                                className="h-16 w-16 border rounded overflow-hidden"
                                title={`image-${i + 1}`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={`${fileBaseUrl}${img}`}
                                  alt="img"
                                  className="h-full w-full object-cover"
                                />
                              </a>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!currentAnswer.isCorrect}
                        onChange={(e) =>
                          updateAnswerField(
                            reviewIndex as number,
                            "isCorrect",
                            e.target.checked
                          )
                        }
                        className="rounded"
                        id="review-correct"
                      />
                      <Label htmlFor="review-correct">Mark Correct</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="min-w-[60px]">Marks</Label>
                      <Input
                        type="number"
                        min="0"
                        max={getQuestionMarks(currentAnswer.questionId)}
                        value={currentAnswer.marksObtained}
                        onChange={(e) => {
                          const max = getQuestionMarks(
                            currentAnswer.questionId
                          );
                          let val = Number(e.target.value);
                          if (!Number.isFinite(val)) val = 0;
                          val = Math.max(0, Math.min(val, max));
                          updateAnswerField(
                            reviewIndex as number,
                            "marksObtained",
                            val
                          );
                        }}
                        className="w-28"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          updateAnswerField(
                            reviewIndex as number,
                            "marksObtained",
                            getQuestionMarks(currentAnswer.questionId)
                          )
                        }
                      >
                        Full marks
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateAnswerField(
                            reviewIndex as number,
                            "marksObtained",
                            0
                          )
                        }
                      >
                        Zero
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={goPrev}
                    disabled={(reviewIndex ?? 0) <= 0}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goNext}
                    disabled={
                      reviewIndex === null ||
                      (editable?.answers?.length || 0) === 0 ||
                      reviewIndex >= (editable?.answers?.length || 1) - 1
                    }
                  >
                    Next
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={closeReview}>
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default ParticipationDetailPage;

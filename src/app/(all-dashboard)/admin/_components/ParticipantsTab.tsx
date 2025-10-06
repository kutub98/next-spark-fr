"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { IParticipation } from "@/redux/features/participationSlice";
import { Event } from "@/redux/features/eventSlice";
import { Quiz } from "@/redux/features/quizSlice";
import ParticipationReview from "./ParticipationReview";

interface ParticipantsTabProps {
  participations: IParticipation[];
  events: Event[];
  quizzes: Quiz[];
  participationsLoading: boolean;
  selectedQuiz: string;
  setSelectedQuiz: (quizId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onExportResults: () => void;
  onDeleteParticipation: (id: string) => void;
  onRefreshData: () => void;
}

const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
  participations,
  events,
  quizzes,
  participationsLoading,
  selectedQuiz,
  setSelectedQuiz,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onExportResults,
  onDeleteParticipation,
  onRefreshData,
}) => {
  const [selectedParticipation, setSelectedParticipation] =
    useState<IParticipation | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    id: string;
    studentName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredParticipations = participations.filter((participation) => {
    const quiz = quizzes.find((q) => q._id === participation.quizId);
    const event = events.find((e) => e._id === quiz?.eventId);

    const matchesQuiz =
      !selectedQuiz ||
      selectedQuiz === "all" ||
      participation.quizId === selectedQuiz;
    const matchesStatus =
      !statusFilter ||
      statusFilter === "all" ||
      participation.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      (typeof participation.studentId === "string"
        ? participation.studentId
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : participation.studentId.fullNameEnglish
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          participation.studentId.fullNameBangla
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          participation.studentId.contact
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
      quiz?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event?.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesQuiz && matchesStatus && matchesSearch;
  });

  const handleDeleteParticipation = async (id: string) => {
    try {
      setIsDeleting(true);
      await onDeleteParticipation(id);
      setDeleteDialog(null);
    } catch {
      toast.error("Failed to delete participation");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Under Review
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStudentName = (participation: IParticipation) => {
    if (typeof participation.studentId === "string") {
      return "Unknown Student";
    }
    return (
      participation.studentId.fullNameEnglish ||
      participation.studentId.fullNameBangla ||
      "Unknown Student"
    );
  };

  const getStudentContact = (participation: IParticipation) => {
    if (typeof participation.studentId === "string") {
      return "N/A";
    }
    return participation.studentId.contact || "N/A";
  };

  const getQuizTitle = (participation: IParticipation) => {
    const quiz = quizzes.find((q) => q._id === participation.quizId);
    return quiz?.title || "Unknown Quiz";
  };

  const getEventTitle = (participation: IParticipation) => {
    const quiz = quizzes.find((q) => q._id === participation.quizId);
    const event = events.find((e) => e._id === quiz?.eventId);
    return event?.title || "Unknown Event";
  };

  const getPassingMarks = (participation: IParticipation) => {
    const quiz = quizzes.find((q) => q._id === participation.quizId);
    return quiz?.passingMarks || 0;
  };

  const getTotalMarks = (participation: IParticipation) => {
    const quiz = quizzes.find((q) => q._id === participation.quizId);
    return quiz?.totalMarks || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Participant Management</h2>
          <p className="text-gray-600">Review and manage quiz participations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={onRefreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onExportResults} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by quiz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quizzes</SelectItem>
            {quizzes.map((quiz) => (
              <SelectItem key={quiz._id} value={quiz._id}>
                {quiz.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Under Review</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {filteredParticipations.length} results
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {participations.filter((p) => p.status === "completed").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {participations.filter((p) => p.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {participations.filter((p) => p.status === "failed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Participations</CardTitle>
          <CardDescription>
            Manage and review student quiz participations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participationsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredParticipations.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Participations Found
              </h3>
              <p className="text-gray-600">
                No participations match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipations.map((participation) => {
                    const passingMarks = getPassingMarks(participation);
                    const totalMarks = getTotalMarks(participation);
                    const isPassed = participation.totalScore >= passingMarks;

                    return (
                      <TableRow key={participation._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {getStudentName(participation)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getStudentContact(participation)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {getQuizTitle(participation)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {getEventTitle(participation)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {participation.totalScore} / {totalMarks}
                            </span>
                            <Badge
                              variant={isPassed ? "default" : "destructive"}
                            >
                              {isPassed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(participation.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {new Date(
                              participation.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedParticipation(participation)
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({
                                  id: participation._id,
                                  studentName: getStudentName(participation),
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
          )}
        </CardContent>
      </Card>

      {/* Participation Review Dialog */}
      {selectedParticipation && (
        <ParticipationReview
          participation={selectedParticipation}
          questions={[]} // This should be passed from parent or fetched
          onClose={() => setSelectedParticipation(null)}
          onUpdate={() => {
            onRefreshData();
            setSelectedParticipation(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Participation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the participation for{" "}
              {deleteDialog?.studentName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteDialog && handleDeleteParticipation(deleteDialog.id)
              }
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantsTab;



/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { AppDispatch } from "@/store/store";
import { getQuizzes } from "@/redux/features/quizSlice";
import { fetchParticipations } from "@/redux/features/participationSlice";
import { api } from "@/data/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trophy, Download } from "lucide-react";
import CertificateModal from "../_components/certificateModal";

// ✅ Helper function to export CSV
const exportToCSV = (data: any[], filename = "leaderboard.csv") => {
  if (!data.length) return;

  const headers = ["Rank", "Participant", "Marks", "Score %", "Status"];
  const rows = data.map((entry, index) => {
    const rank = index + 1;
    const name = entry.user?.fullNameEnglish || "Unknown";
    const marks = `${entry.obtainedMarks} / ${entry.quiz?.totalMarks}`;
    const score = (
      (entry.obtainedMarks / entry.quiz?.totalMarks) *
      100
    ).toFixed(2);
    const status =
      entry.obtainedMarks >= entry.quiz?.passingMarks ? "Passed" : "Failed";

    return [rank, name, marks, score, status];
  });

  const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.click();
};

const LeaderBoard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [quiz, setQuiz] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openCertificateModal, setOpenCertificateModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);

  const handleCertificateClick = (entry: any) => {
    setSelectedParticipant(entry);
    setOpenCertificateModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizData = await dispatch(getQuizzes()).unwrap();
        await dispatch(fetchParticipations()).unwrap();
        setQuiz(quizData);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (selectedQuizId) {
        try {
          const response = await fetch(
            `${api}/participations/quiz/${selectedQuizId}/leaderboard`
          );
          const data = await response.json();
          setLeaderboard(data.data);
        } catch (error) {
          console.error("Error fetching leaderboard:", error);
        }
      }
    };
    fetchLeaderboard();
  }, [selectedQuizId]);

  const handleQuizChange = (quizId: string) => {
    setSelectedQuizId(quizId);
  };

  // ✅ Filter leaderboard by name
  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.user?.fullNameEnglish
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 p-0 sm:px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <Trophy className="sm:w-10 w-6 h-6 sm:h-10 text-indigo-500" />
            <h1 className="sm:text-4xl text-2xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Leaderboard
            </h1>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Select onValueChange={handleQuizChange}>
              <SelectTrigger className="md:w-64 w-full">
                <SelectValue placeholder="Select a quiz" />
              </SelectTrigger>
              <SelectContent>
                {quiz.map((q: any) => (
                  <SelectItem key={q._id} value={q._id}>
                    {q.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export Button */}
            {filteredLeaderboard.length > 0 && (
              <Button
                onClick={() => exportToCSV(filteredLeaderboard)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={18} /> Export
              </Button>
            )}
          </div>
        </motion.div>

        {/* Search Input */}
        {selectedQuizId && leaderboard.length > 0 && (
          <div className="flex justify-end">
            <Input
              type="text"
              placeholder="Search by name..."
              className="max-w-sm border-indigo-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Leaderboard Card */}
        <Card className="shadow-xl px-0 py-4 backdrop-blur-md bg-white/80 border border-gray-100">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-indigo-700">
              {selectedQuizId
                ? "Top Performers"
                : "Select a quiz to view leaderboard"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {filteredLeaderboard.length > 0 ? (
              <div className="overflow-x-auto py-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-indigo-100">
                      <TableHead className="font-semibold">Rank</TableHead>
                      <TableHead className="font-semibold">
                        Participant
                      </TableHead>
                      <TableHead className="font-semibold">Marks</TableHead>
                      <TableHead className="font-semibold">Score %</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">
                        Certificate
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaderboard.map((entry, index) => {
                      const rankIcon =
                        index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : `#${index + 1}`;

                      const passed =
                        entry.obtainedMarks >= entry.quiz?.passingMarks;

                      return (
                        <motion.tr
                          key={entry._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-indigo-50 transition-all"
                        >
                          <TableCell className="font-semibold text-indigo-600">
                            {rankIcon}
                          </TableCell>
                          <TableCell className="font-medium">
                            {entry.user?.fullNameEnglish || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {entry.obtainedMarks} / {entry.quiz?.totalMarks}
                          </TableCell>
                          <TableCell>
                            {(
                              (entry.obtainedMarks / entry.quiz?.totalMarks) *
                              100
                            ).toFixed(2)}{" "}
                            %
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={passed ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {passed ? "Passed" : "Failed"}
                            </Badge>
                          </TableCell>

                          <TableCell className="flex items-center gap-2">
                            {/* <Badge
                              variant={passed ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {passed ? "Passed" : "Failed"}
                            </Badge> */}

                            {
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCertificateClick(entry)}
                              >
                                Certificate
                              </Button>
                            }
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {selectedQuizId
                  ? "No leaderboard data available for this quiz."
                  : "Please select a quiz to display results."}
              </div>
            )}
          </CardContent>
        </Card>
        <CertificateModal
          open={openCertificateModal}
          onOpenChange={setOpenCertificateModal}
          participant={selectedParticipant}
          // ranking={leaderboard.findIndex(
          //   (p) => p._id === selectedParticipant?._id
          // ) + 1}
        />
      </div>
    </div>
  );
};

export default LeaderBoard;

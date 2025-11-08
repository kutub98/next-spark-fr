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
import { Trophy, Download, Loader2 } from "lucide-react";
import CertificateModal from "../_components/certificateModal";
import jsPDF from "jspdf";

// ✅ Helper: Export leaderboard to CSV
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
  link.href = url;
  link.download = filename;
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
  const [certificate, setCertificate] = useState<any[]>([]);

  // 🆕 loading states for downloads
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<"image" | "pdf" | null>(
    null
  );

  const handleCertificateClick = (entry: any) => {
    setSelectedParticipant(entry);
    setOpenCertificateModal(true);
  };

  // ✅ Fetch certificates
  const fetchCertificate = async () => {
    try {
      const response = await fetch(`${api}/certificates`);
      const data = await response.json();
      const certArray = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setCertificate(certArray);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setCertificate([]);
    }
  };

  useEffect(() => {
    fetchCertificate();
  }, []);

  // ✅ Fetch quizzes
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

  // ✅ Fetch leaderboard for selected quiz
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedQuizId) return;
      try {
        const response = await fetch(
          `${api}/participations/quiz/${selectedQuizId}/leaderboard`
        );
        const data = await response.json();
        setLeaderboard(data.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, [selectedQuizId]);

  // ✅ Quiz change
  const handleQuizChange = (quizId: string) => setSelectedQuizId(quizId);

  // ✅ Filter leaderboard by name
  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.user?.fullNameEnglish
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // 🆕 Download Image
  const handleDownloadImage = async (
    url: string,
    filename: string,
    id: string
  ) => {
    setDownloadingId(id);
    setDownloadType("image");
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.png`;
      link.click();
    } catch (err) {
      console.error("Image download error:", err);
    } finally {
      setDownloadingId(null);
      setDownloadType(null);
    }
  };

  // 🆕 Download PDF
  const handleDownloadPDF = async (
    url: string,
    filename: string,
    id: string
  ) => {
    setDownloadingId(id);
    setDownloadType("pdf");
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        const pdf = new jsPDF("l", "mm", "a4");
        const width = pdf.internal.pageSize.getWidth();
        const height = (img.height * width) / img.width;
        pdf.addImage(img, "PNG", 0, 0, width, height);
        pdf.save(`${filename}.pdf`);
        setDownloadingId(null);
        setDownloadType(null);
      };
    } catch (err) {
      console.error("PDF download error:", err);
      setDownloadingId(null);
      setDownloadType(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-3 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-2"
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

        {/* Table */}
        <Card className="shadow-xl py-4 backdrop-blur-md bg-white/80 border border-gray-100">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-semibold text-indigo-700">
              {selectedQuizId
                ? `${
                    quiz.find((q: any) => q._id === selectedQuizId)?.title || ""
                  } — Top Performers`
                : "Select a quiz to view leaderboard"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {filteredLeaderboard.length > 0 ? (
              <div className="overflow-x-auto py-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-indigo-100">
                      <TableHead>Rank</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Score %</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Certificate</TableHead>
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
                      const passed = entry.obtainedMarks >= entry.totalMarks;

                      // Find matching certificate
                      const matchedCert = Array.isArray(certificate)
                        ? certificate.find((cert: any) => {
                            const certParticipationId =
                              cert.participation?._id?.toString();
                            const entryId = entry?._id?.toString();
                            return certParticipationId === entryId;
                          })
                        : null;

                      const isDownloading = downloadingId === entry._id;

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
                          <TableCell>{entry.user?.fullNameEnglish}</TableCell>
                          <TableCell>
                            {entry.obtainedMarks} / {entry?.totalMarks}
                          </TableCell>
                          <TableCell>
                            {(
                              (entry.obtainedMarks / entry?.totalMarks) *
                              100
                            ).toFixed(2)}
                            %
                          </TableCell>
                          <TableCell>
                            <Badge variant={passed ? "default" : "destructive"}>
                              {passed ? "Passed" : "Failed"}
                            </Badge>
                          </TableCell>

                          <TableCell className="flex items-center gap-2">
                            {matchedCert ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isDownloading}
                                  onClick={() =>
                                    handleDownloadImage(
                                      matchedCert.imageUrl,
                                      entry.user?.fullNameEnglish ||
                                        "certificate",
                                      entry._id
                                    )
                                  }
                                >
                                  {isDownloading && downloadType === "image" ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4 mr-1" />
                                  )}
                                  Image
                                </Button>

                                <Button
                                  size="sm"
                                  className="bg-blue-600 text-white hover:bg-blue-700"
                                  disabled={isDownloading}
                                  onClick={() =>
                                    handleDownloadPDF(
                                      matchedCert.imageUrl,
                                      entry.user?.fullNameEnglish ||
                                        "certificate",
                                      entry._id
                                    )
                                  }
                                >
                                  {isDownloading && downloadType === "pdf" ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4 mr-1" />
                                  )}
                                  PDF
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCertificateClick(entry)}
                              >
                                Generate Certificate
                              </Button>
                            )}
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
                  ? "No leaderboard data for this quiz."
                  : "Please select a quiz."}
              </div>
            )}
          </CardContent>
        </Card>

        <CertificateModal
          open={openCertificateModal}
          onOpenChange={(open: any) => {
            setOpenCertificateModal(open);
            if (!open) fetchCertificate(); // ✅ refresh after certificate generation
          }}
          participant={selectedParticipant}
        />
      </div>
    </div>
  );
};

export default LeaderBoard;

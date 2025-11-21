/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/store/store";
import { getAllUsers } from "@/redux/features/usersSlice";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Loader2, Award, Download } from "lucide-react";
import jsPDF from "jspdf";

import CertificateModal from "../_components/certificateModal";
import { api } from "@/data/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getQuizzes } from "@/redux/features/quizSlice";
import { fetchParticipations } from "@/redux/features/participationSlice";
import { Input } from "@/components/ui/input";

// ---------------------
// Types
// ---------------------
interface User {
  _id: string;
  fullNameEnglish: string;
  role: "recognition" | "volunteer" | string;
}

interface Certificate {
  _id: string;
  imageUrl: string;
  user: {
    _id: string;
  };
  eventId?: string; // <-- ADD THIS
  participation?: string; // optional for quiz certificates
  role?: string; // volunteer / recognition
}

export default function RecognitionVolunteerPage() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux
  const { users } = useSelector((state: RootState) => state.users);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any[]>([]);
  // Local State
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<"image" | "pdf" | null>(
    null
  );

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const fetchCertificates = async () => {
    try {
      const res = await fetch(`${api}/certificates`);
      const data = await res.json();

      let certList: Certificate[] = [];

      if (Array.isArray(data?.data)) certList = data.data;
      else if (Array.isArray(data)) certList = data;

      setCertificates(certList);
    } catch (err) {
      console.error("Certificate fetch error:", err);
      setCertificates([]);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const recognitionUsers = useMemo(
    () => users.filter((u) => u.role === "recognition"),
    [users]
  );

  const volunteerUsers = useMemo(
    () => users.filter((u) => u.role === "volunteer"),
    [users]
  );

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

  // --- On quiz change ---
  const handleQuizChange = (quizId: string) => setSelectedQuizId(quizId);

  const downloadImage = async (url: string, filename: string, id: string) => {
    setDownloadingId(id);
    setDownloadType("image");

    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.png`;
      link.click();
    } finally {
      setDownloadingId(null);
      setDownloadType(null);
    }
  };

  // CSV Export
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

  const downloadPDF = async (url: string, filename: string, id: string) => {
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

  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.user?.fullNameEnglish
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const renderUserRow = (user: User, index: number) => {
    // Match certificate ONLY for selected quiz/event
    const cert = certificates.find(
      (c) =>
        c.user?._id === user._id && String(c.eventId) === String(selectedQuizId)
    );

    const isDownloading = downloadingId === user._id;

    return (
      <motion.tr
        key={user._id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="hover:bg-indigo-50 transition-all"
      >
        <TableCell>{user.fullNameEnglish}</TableCell>
        <TableCell>
          <Badge className="capitalize">{user.role}</Badge>
        </TableCell>

        <TableCell>
          {cert ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isDownloading}
                onClick={() =>
                  downloadImage(cert.imageUrl, user.fullNameEnglish, user._id)
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
                className="bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={isDownloading}
                onClick={() =>
                  downloadPDF(cert.imageUrl, user.fullNameEnglish, user._id)
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
              onClick={() => {
                setSelectedUser(user);
                setOpenModal(true);
              }}
            >
              Generate Certificate
            </Button>
          )}
        </TableCell>
      </motion.tr>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-6">
      <motion.div
        className="flex flex-col md:flex-row items-center justify-between gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Award className="w-10 h-10 text-purple-600" />
          <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-purple-700">
            Recognition & Volunteer Certificates
          </h1>
        </motion.div>

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

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title */}

        {/* Recognition */}
        <Card className="shadow-lg bg-white/90 border border-purple-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-purple-700">
              Recognition Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-100">
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Certificate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recognitionUsers.length ? (
                  recognitionUsers.map((u, i) => renderUserRow(u, i))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      No recognition users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Volunteer */}
        <Card className="shadow-lg bg-white/90 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-700">
              Volunteer Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Certificate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {volunteerUsers.length ? (
                  volunteerUsers.map((u, i) => renderUserRow(u, i))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      No volunteer users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Certificate Modal */}
        <CertificateModal
          open={openModal}
          onOpenChange={(open: any) => {
            setOpenModal(open);
            if (!open) fetchCertificates();
          }}
          user={selectedUser}
          type={selectedUser?.role}
        />
      </div>
    </div>
  );
}

"use client";

import { api } from "@/data/api";
import { RootState } from "@/store/store";
import { useEffect, useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Download, Eye } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import Image from "next/image";

interface Participation {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    totalQuestions: number;
    totalMarks: number;
  };
  obtainedMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  rank: number;
  createdAt: string;
  status: string;
  user: {
    _id: string;
    fullNameEnglish: string;
  };
}

interface Certificate {
  _id: string;
  imageUrl: string;
  rank: string;
  marks: number;
  totalMarks: number;
  user: {
    _id: string;
    fullNameEnglish: string;
  };
  createdAt: string;
}

const CertificatePage = () => {
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const certificateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch participations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${api}/participations`);
        const data = await response.json();

        if (data?.success && Array.isArray(data.data)) {
          const userParticipations = data.data.filter(
            (item: Participation) => item.user._id === user?._id
          );
          setParticipations(userParticipations);
        }
      } catch (error) {
        console.error("Error fetching participation data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchData();
  }, [user]);

  // Fetch user certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch(`${api}/certificates/user/${user?._id}`);
        const data = await res.json();
        setCertificates(data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      }
    };

    if (user?._id) fetchCertificates();
  }, [user]);

  // Stats summary
  const stats = useMemo(() => {
    if (participations.length === 0) return { total: 0, completed: 0, avg: 0 };

    const total = participations.length;
    const completed = participations.filter(
      (p) => p.status === "completed"
    ).length;
    const avg =
      participations.reduce((acc, p) => acc + p.obtainedMarks, 0) /
      participations.length;

    return { total, completed, avg: avg.toFixed(1) };
  }, [participations]);

  // Chart data
  const chartData = useMemo(() => {
    return participations.map((p) => ({
      name: p.quiz.title,
      score: p.obtainedMarks,
      total: p.quiz.totalMarks,
    }));
  }, [participations]);

  // Download as Image
  const handleDownloadImage = async (id: string) => {
    const element = certificateRefs.current[id];
    if (!element) return;

    try {
      const dataUrl = await toPng(element);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `certificate-${id}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  // Download as PDF
  const handleDownloadPDF = async (id: string) => {
    const element = certificateRefs.current[id];
    if (!element) return;

    try {
      const dataUrl = await toPng(element);
      const pdf = new jsPDF("landscape", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      pdf.save(`certificate-${id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Card className="flex flex-col items-center justify-center text-center p-3">
          <CardTitle>Total Quizzes</CardTitle>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center p-3">
          <CardTitle>Completed</CardTitle>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </Card>
        <Card className="col-span-2 md:col-span-1 flex flex-col items-center justify-center text-center p-3">
          <CardTitle>Average Score</CardTitle>
          <p className="text-2xl font-bold">{stats.avg}%</p>
        </Card>
      </div>

      {/* My Certificates */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mt-6">🎓 My Certificates</h2>
        {certificates.length === 0 ? (
          <p className="text-gray-500 text-center">No certificates found.</p>
        ) : (
          <Card className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {certificates.map((cert) => (
              <Card key={cert._id} className="p-2 w-full text-center">
                {/* Capture-only section */}
                <div
                  ref={(el) => {
                    certificateRefs.current[cert._id] = el;
                  }}
                  className="capture-area"
                >
                  <Image
                    src={cert.imageUrl}
                    width={400}
                    height={200}
                    alt="Certificate"
                    className="rounded-lg shadow-sm"
                  />
                </div>
                <CardContent>
                  <p className="font-semibold mt-2">
                    {cert.user.fullNameEnglish}
                  </p>
                  <p className="text-sm text-gray-500">
                    Rank: {cert.rank} | Marks: {cert.marks}/{cert.totalMarks}
                  </p>
                </CardContent>

                {/* Buttons not captured */}
                <div className="flex justify-center gap-2 html2canvas-ignore">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadImage(cert._id)}
                  >
                    <Download className="w-4 h-4 " /> Image
                  </Button>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => handleDownloadPDF(cert._id)}
                  >
                    <Download className="w-4 h-4" /> PDF
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedCert(cert)}
                  >
                    <Eye className="w-4 h-4" /> View
                  </Button>
                </div>
              </Card>
            ))}
          </Card>
        )}
      </div>

      {/* View Certificate Modal */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Certificate of {selectedCert?.user.fullNameEnglish}
            </DialogTitle>
          </DialogHeader>
          {selectedCert && (
            <>
              <div
                ref={(el) => {
                  certificateRefs.current[selectedCert._id] = el;
                }}
                className="flex flex-col items-center space-y-4"
              >
                <Image
                  src={selectedCert.imageUrl}
                  width={800}
                  height={600}
                  alt="Certificate"
                  className="rounded-lg shadow-md"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadImage(selectedCert._id)}
                >
                  <Download className="w-4 h-4 mr-1" /> Image
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => handleDownloadPDF(selectedCert._id)}
                >
                  <Download className="w-4 h-4 mr-1" /> PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Performance</CardTitle>
          <CardDescription>Overview of your quiz scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" />
              <Line type="monotone" dataKey="total" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificatePage;

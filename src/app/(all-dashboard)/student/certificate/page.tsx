// "use client";

// import { api } from "@/data/api";
// import { RootState } from "@/store/store";
// import { useEffect, useState, useMemo, useRef } from "react";
// import { useSelector } from "react-redux";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from "recharts";
// import { Download, Eye } from "lucide-react";
// import { toPng } from "html-to-image";
// import jsPDF from "jspdf";
// import Image from "next/image";

// interface Participation {
//   _id: string;
//   quiz: {
//     _id: string;
//     title: string;
//     totalQuestions: number;
//     totalMarks: number;
//   };
//   obtainedMarks: number;
//   correctAnswers: number;
//   wrongAnswers: number;
//   rank: number;
//   createdAt: string;
//   status: string;
//   user: {
//     _id: string;
//     fullNameEnglish: string;
//   };
// }

// interface Certificate {
//   _id: string;
//   imageUrl: string;
//   rank: string;
//   participation: {
//     quiz: {
//       _id: string;
//       title: string;
//     };
//     _id: string;
//     title: string;
//   };
//   marks: number;
//   totalMarks: number;
//   user: {
//     _id: string;
//     fullNameEnglish: string;
//   };
//   createdAt: string;
// }

// const CertificatePage = () => {
//   const [participations, setParticipations] = useState<Participation[]>([]);
//   const [certificates, setCertificates] = useState<Certificate[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
//   const certificateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

//   const { user } = useSelector((state: RootState) => state.auth);

//   // ✅ Fetch participations
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${api}/participations`);
//         const data = await response.json();

//         if (data?.success && Array.isArray(data.data)) {
//           const userParticipations = data.data.filter(
//             (item: Participation) => item.user._id === user?._id
//           );
//           setParticipations(userParticipations);
//         }
//       } catch (error) {
//         console.error("Error fetching participation data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user?._id) fetchData();
//   }, [user]);

//   // ✅ Fetch user certificates
//   useEffect(() => {
//     const fetchCertificates = async () => {
//       try {
//         const res = await fetch(`${api}/certificates/user/${user?._id}`);
//         const data = await res.json();

//         if (data?.success && Array.isArray(data.data)) {
//           setCertificates(data.data);
//         } else if (Array.isArray(data)) {
//           setCertificates(data);
//         } else {
//           setCertificates([]);
//         }
//       } catch (error) {
//         console.error("Error fetching certificates:", error);
//         setCertificates([]);
//       }
//     };

//     if (user?._id) fetchCertificates();
//   }, [user]);

//   // ✅ Stats summary
//   const stats = useMemo(() => {
//     if (participations.length === 0) return { total: 0, completed: 0, avg: 0 };

//     const total = participations.length;
//     const completed = participations.filter(
//       (p) => p.status === "completed"
//     ).length;
//     const avg =
//       participations.reduce((acc, p) => acc + p.obtainedMarks, 0) /
//       participations.length;

//     return { total, completed, avg: avg.toFixed(1) };
//   }, [participations]);

//   // ✅ Chart data
//   const chartData = useMemo(() => {
//     return participations.map((p) => ({
//       name: p.quiz.title,
//       score: p.obtainedMarks,
//       total: p.quiz.totalMarks,
//     }));
//   }, [participations]);

//   // ✅ Download Image
//   const handleDownloadImage = async (id: string) => {
//     const element = certificateRefs.current[id];
//     if (!element) return;

//     try {
//       const dataUrl = await toPng(element);
//       const link = document.createElement("a");
//       link.href = dataUrl;
//       link.download = `certificate-${id}.png`;
//       link.click();
//     } catch (error) {
//       console.error("Error generating image:", error);
//     }
//   };

//   // ✅ Download PDF
//   const handleDownloadPDF = async (id: string) => {
//     const element = certificateRefs.current[id];
//     if (!element) return;

//     try {
//       const dataUrl = await toPng(element);
//       const pdf = new jsPDF("landscape", "mm", "a4");
//       const width = pdf.internal.pageSize.getWidth();
//       const height = pdf.internal.pageSize.getHeight();
//       pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
//       pdf.save(`certificate-${id}.pdf`);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     }
//   };

//   if (loading) return <div className="text-center mt-20">Loading...</div>;

//   return (
//     <div className="max-w-7xl mx-auto space-y-8 p-4">
//       {/* ✅ Summary */}
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//         <Card className="flex flex-col items-center justify-center text-center p-4">
//           <CardTitle>Total Quizzes</CardTitle>
//           <p className="text-2xl font-bold">{stats.total}</p>
//         </Card>
//         <Card className="flex flex-col items-center justify-center text-center p-4">
//           <CardTitle>Completed</CardTitle>
//           <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
//         </Card>
//         <Card className="flex flex-col items-center justify-center text-center p-4">
//           <CardTitle>Average Score</CardTitle>
//           <p className="text-2xl font-bold">{stats.avg}%</p>
//         </Card>
//       </div>

//       {/* ✅ My Certificates Grid */}
//       <div className="space-y-4">
//         <h2 className="text-xl font-semibold mt-6">🎓 My Certificates</h2>

//         {certificates.length === 0 ? (
//           <div className="text-gray-500 text-center py-8 border rounded-lg">
//             No certificates available yet.
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {certificates.map((cert) => (
//               <Card
//                 key={cert._id}
//                 className="flex flex-col justify-between p-3 text-center"
//               >
//                 <div
//                   ref={(el) => {
//                     certificateRefs.current[cert._id] = el;
//                   }}
//                 >
//                   <Image
//                     src={cert.imageUrl}
//                     width={400}
//                     height={200}
//                     alt="Certificate"
//                     className="rounded-lg shadow-sm w-full h-auto object-cover"
//                   />
//                 </div>

//                 <CardContent className="pt-3">
//                   <p className="text-sm text-gray-500">
//                     Issued on: {new Date(cert.createdAt).toLocaleDateString()}
//                   </p>
//                   <p className="font-semibold mt-1">
//                     {cert.user.fullNameEnglish}
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Quiz: {cert.participation.quiz.title}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     Rank: {cert.rank} | Marks: {cert.marks}/{cert.totalMarks}
//                   </p>
//                 </CardContent>

//                 <div className="flex justify-center gap-2 pb-3">
//                   <Button
//                     variant="outline"
//                     onClick={() => handleDownloadImage(cert._id)}
//                   >
//                     <Download className="w-4 h-4 mr-1" /> Image
//                   </Button>
//                   <Button
//                     className="bg-blue-600 text-white hover:bg-blue-700"
//                     onClick={() => handleDownloadPDF(cert._id)}
//                   >
//                     <Download className="w-4 h-4 mr-1" /> PDF
//                   </Button>
//                   <Button
//                     variant="secondary"
//                     onClick={() => setSelectedCert(cert)}
//                   >
//                     <Eye className="w-4 h-4 mr-1" /> View
//                   </Button>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ✅ View Certificate Modal */}
//       <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
//         <DialogContent className="max-w-3xl">
//           <DialogHeader>
//             <DialogTitle className="text-lg">
//               Certificate of {selectedCert?.user.fullNameEnglish}
//             </DialogTitle>
//           </DialogHeader>

//           {selectedCert && (
//             <>
//               <div
//                 ref={(el) => {
//                   certificateRefs.current[selectedCert._id] = el;
//                 }}
//                 className="flex flex-col items-center space-y-4"
//               >
//                 <Image
//                   src={selectedCert.imageUrl}
//                   width={800}
//                   height={600}
//                   alt="Certificate"
//                   className="rounded-lg shadow-md"
//                 />
//               </div>

//               <div className="flex justify-center gap-4 mt-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => handleDownloadImage(selectedCert._id)}
//                 >
//                   <Download className="w-4 h-4 mr-1" /> Image
//                 </Button>
//                 <Button
//                   className="bg-blue-600 text-white hover:bg-blue-700"
//                   onClick={() => handleDownloadPDF(selectedCert._id)}
//                 >
//                   <Download className="w-4 h-4 mr-1" /> PDF
//                 </Button>
//               </div>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* ✅ Performance Chart */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Quiz Performance</CardTitle>
//           <CardDescription>Overview of your quiz scores</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Line type="monotone" dataKey="score" stroke="#3b82f6" />
//               <Line type="monotone" dataKey="total" stroke="#10b981" />
//             </LineChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default CertificatePage;

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
import { Download, Eye, Loader2 } from "lucide-react"; // 🆕 Loader icon
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
  participation: {
    quiz: {
      _id: string;
      title: string;
    };
    _id: string;
    title: string;
  };
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<"image" | "pdf" | null>(
    null
  );
  const certificateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { user } = useSelector((state: RootState) => state.auth);

  // ✅ Fetch participations
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

  // ✅ Fetch user certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch(`${api}/certificates/user/${user?._id}`);
        const data = await res.json();

        if (data?.success && Array.isArray(data.data)) {
          setCertificates(data.data);
        } else if (Array.isArray(data)) {
          setCertificates(data);
        } else {
          setCertificates([]);
        }
      } catch (error) {
        console.error("Error fetching certificates:", error);
        setCertificates([]);
      }
    };

    if (user?._id) fetchCertificates();
  }, [user]);

  // ✅ Stats summary
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

  // ✅ Chart data
  const chartData = useMemo(() => {
    return participations.map((p) => ({
      name: p.quiz.title,
      score: p.obtainedMarks,
      total: p.quiz.totalMarks,
    }));
  }, [participations]);

  // ✅ Download Image
  const handleDownloadImage = async (id: string) => {
    const element = certificateRefs.current[id];
    if (!element) return;

    setDownloadingId(id);
    setDownloadType("image");

    try {
      const dataUrl = await toPng(element);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `certificate-${id}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setDownloadingId(null);
      setDownloadType(null);
    }
  };

  // ✅ Download PDF
  const handleDownloadPDF = async (id: string) => {
    const element = certificateRefs.current[id];
    if (!element) return;

    setDownloadingId(id);
    setDownloadType("pdf");

    try {
      const dataUrl = await toPng(element);
      const pdf = new jsPDF("landscape", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      pdf.save(`certificate-${id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadingId(null);
      setDownloadType(null);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* ✅ Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center justify-center text-center p-4">
          <CardTitle>Total Quizzes</CardTitle>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center p-4">
          <CardTitle>Completed</CardTitle>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center p-4">
          <CardTitle>Average Score</CardTitle>
          <p className="text-2xl font-bold">{stats.avg}%</p>
        </Card>
      </div>

      {/* ✅ My Certificates Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mt-6">🎓 My Certificates</h2>

        {certificates.length === 0 ? (
          <div className="text-gray-500 text-center py-8 border rounded-lg">
            No certificates available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => {
              const isLoading =
                downloadingId === cert._id && downloadType !== null;

              return (
                <Card
                  key={cert._id}
                  className="flex flex-col justify-between p-3 text-center"
                >
                  <div
                    ref={(el) => {
                      certificateRefs.current[cert._id] = el;
                    }}
                  >
                    <Image
                      src={cert.imageUrl}
                      width={400}
                      height={200}
                      alt="Certificate"
                      className="rounded-lg shadow-sm w-full h-auto object-cover"
                    />
                  </div>

                  <CardContent className="pt-3">
                    <p className="text-sm text-gray-500">
                      Issued on: {new Date(cert.createdAt).toLocaleDateString()}
                    </p>
                    <p className="font-semibold mt-1">
                      {cert.user.fullNameEnglish}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quiz: {cert.participation?.quiz?.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rank: {cert.rank} | Marks: {cert.marks}/{cert.totalMarks}
                    </p>
                  </CardContent>

                  <div className="flex justify-center gap-2 pb-3">
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadImage(cert._id)}
                      disabled={isLoading}
                    >
                      {isLoading && downloadType === "image" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-1" />
                      )}
                      Image
                    </Button>

                    <Button
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => handleDownloadPDF(cert._id)}
                      disabled={isLoading}
                    >
                      {isLoading && downloadType === "pdf" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-1" />
                      )}
                      PDF
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => setSelectedCert(cert)}
                      disabled={isLoading}
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ View Certificate Modal */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-3xl ">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Certificate of {selectedCert?.user.fullNameEnglish}
            </DialogTitle>
          </DialogHeader>

          {selectedCert && (
            <div className="flex flex-row gap-2 items-center">
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

              <div className="flex justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadImage(selectedCert._id)}
                  disabled={downloadingId === selectedCert._id}
                >
                  {downloadingId === selectedCert._id &&
                  downloadType === "image" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-1" />
                  )}
                  Image
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => handleDownloadPDF(selectedCert._id)}
                  disabled={downloadingId === selectedCert._id}
                >
                  {downloadingId === selectedCert._id &&
                  downloadType === "pdf" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-1" />
                  )}
                  PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ✅ Performance Chart */}
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

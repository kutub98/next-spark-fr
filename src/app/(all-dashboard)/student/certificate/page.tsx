"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

// -------------------------
// Dummy Event Data
// -------------------------
type StudentEvent = {
  id: string;
  eventName: string;
  date: string;
  status: "Participated" | "Not Participated";
};

const studentEvents: StudentEvent[] = [
  {
    id: "1",
    eventName: "Hackathon 2025",
    date: "2025-06-10",
    status: "Participated",
  },
  {
    id: "2",
    eventName: "AI Workshop",
    date: "2025-07-05",
    status: "Participated",
  },
  {
    id: "3",
    eventName: "Design Sprint",
    date: "2025-08-12",
    status: "Not Participated",
  },
  {
    id: "4",
    eventName: "Innovation Challenge",
    date: "2025-09-20",
    status: "Participated",
  },
];

// -------------------------
// Main Component
// -------------------------
export default function CertificatePage() {
  const studentName = "Farhad Hosen";
  const certRef = useRef<HTMLDivElement>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const generateCertificateImage = async (event: StudentEvent) => {
    if (!certRef.current) return null;

    // Inject dynamic content
    certRef.current.querySelector("#cert-name")!.textContent = studentName;
    certRef.current.querySelector("#cert-event")!.textContent = event.eventName;
    certRef.current.querySelector("#cert-date")!.textContent = new Date(
      event.date
    ).toLocaleDateString();

    // Generate high-resolution canvas
    const canvas = await html2canvas(certRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });
    return canvas.toDataURL("image/png");
  };

  const handlePreview = async (event: StudentEvent) => {
    const imgData = await generateCertificateImage(event);
    if (imgData) setPreviewImg(imgData);
  };

  const handleDownload = (type: "pdf" | "image") => {
    if (!previewImg) return;

    if (type === "pdf") {
      const pdf = new jsPDF("l", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      pdf.addImage(previewImg, "PNG", 0, 0, width, height);
      pdf.save(`certificate-${studentName}.pdf`);
    } else {
      const a = document.createElement("a");
      a.href = previewImg;
      a.download = `certificate-${studentName}.png`;
      a.click();
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-2">
        🎓 Certificate Generator
      </h1>
      <p className="text-gray-600 mb-6">
        Click a button to preview or download a certificate for a completed
        event.
      </p>

      {/* Event Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.eventName}</TableCell>
                <TableCell>
                  {new Date(event.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      event.status === "Participated"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {event.status}
                  </span>
                </TableCell>
                <TableCell>
                  {event.status === "Participated" ? (
                    <Button
                      variant="secondary"
                      onClick={() => handlePreview(event)}
                    >
                      Preview
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Hidden Certificate Layout */}
      <div
        ref={certRef}
        className="hidden fixed top-0 left-0 w-[1200px] h-[850px] text-center"
        style={{
          backgroundImage: "url('/certificate-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#333333",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "4rem",
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <div
            style={{
              position: "absolute",
              top: "3rem",
              left: "3rem",
              backgroundColor: "#facc15",
              color: "#5b21b6",
              fontWeight: 700,
              padding: "0.5rem 1.5rem",
              borderRadius: "9999px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            4th AWARD
          </div>

          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1f2937" }}>
            CERTIFICATE <span style={{ color: "#7e22ce" }}>OF ACHIEVEMENT</span>
          </h1>
          <p style={{ color: "#4b5563", fontWeight: 500, marginTop: "0.5rem" }}>
            THIS IS PROUDLY PRESENTED TO
          </p>

          <h2
            id="cert-name"
            style={{
              fontSize: "3rem",
              fontWeight: 600,
              color: "#7e22ce",
              fontStyle: "italic",
              marginTop: "1rem",
            }}
          >
            [Student Name]
          </h2>

          <p
            style={{
              color: "#374151",
              marginTop: "1.5rem",
              fontSize: "1.1rem",
              maxWidth: "700px",
            }}
          >
            for successfully participating in
          </p>

          <h3
            id="cert-event"
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#1f2937",
              marginTop: "0.5rem",
            }}
          >
            [Event Name]
          </h3>

          <p style={{ color: "#4b5563", marginTop: "1rem" }}>
            Presented on <span id="cert-date">[Date]</span>
          </p>

          {/* Signatures */}
          <div
            style={{
              position: "absolute",
              bottom: "4rem",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-around",
              fontSize: "0.9rem",
              color: "#374151",
            }}
          >
            <div>
              <hr
                style={{
                  border: "none",
                  borderTop: "2px solid #9ca3af",
                  width: "8rem",
                  margin: "0 auto 0.25rem",
                }}
              />
              <p>Organizer Signature</p>
            </div>
            <div>
              <hr
                style={{
                  border: "none",
                  borderTop: "2px solid #9ca3af",
                  width: "8rem",
                  margin: "0 auto 0.25rem",
                }}
              />
              <p>Authority Signature</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewImg && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-5xl w-full relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <button
                className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 rounded-full p-2"
                onClick={() => setPreviewImg(null)}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="p-6 flex flex-col items-center gap-4">
                <h2 className="text-xl font-semibold text-purple-700">
                  Certificate Preview
                </h2>
                <div className="border rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={previewImg}
                    alt="Certificate Preview"
                    width={1000}
                    height={700}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => handleDownload("image")}>
                    <Download className="h-4 w-4 mr-2" /> Download Image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload("pdf")}
                  >
                    <Download className="h-4 w-4 mr-2" /> Download PDF
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

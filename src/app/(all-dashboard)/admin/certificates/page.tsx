/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Redux
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch } from "@/store/store";

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
import { getAllUsers } from "@/redux/features/usersSlice";

export default function RecognitionVolunteerPage() {
  const dispatch = useDispatch<AppDispatch>();

  // Redux users
  const { users } = useSelector((state: any) => state.users);

  const [recognitionUsers, setRecognitionUsers] = useState<any[]>([]);
  const [volunteerUsers, setVolunteerUsers] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  const [openCertificateModal, setOpenCertificateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<"image" | "pdf" | null>(
    null
  );

  /** -----------------------------
   *   FETCH USERS FROM REDUX
   * ----------------------------- */
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  /** -----------------------------
   *   FILTER USERS BY ROLE
   * ----------------------------- */
  useEffect(() => {
    if (users?.length > 0) {
      setRecognitionUsers(users.filter((u: any) => u.role === "recognition"));
      setVolunteerUsers(users.filter((u: any) => u.role === "volunteer"));
    }
  }, [users]);

  /** -----------------------------
   *   FETCH CERTIFICATES
   * ----------------------------- */
  const fetchCertificates = async () => {
    try {
      const res = await fetch(`${api}/certificates`);
      const data = await res.json();

      const certArray = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setCertificates(certArray);
    } catch (err) {
      console.error("Certificate fetch error:", err);
      setCertificates([]);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  /** -----------------------------
   *   HANDLE CERTIFICATE MODAL
   * ----------------------------- */
  const handleCertificateOpen = (user: any) => {
    setSelectedUser(user);
    setOpenCertificateModal(true);
  };

  /** -----------------------------
   *   DOWNLOAD FUNCTIONS
   * ----------------------------- */
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

  /** -----------------------------
   *   RENDER TABLE ROWS
   * ----------------------------- */
  const renderUserRow = (user: any, index: number) => {
    const cert = certificates.find(
      (c) => c?.user?._id?.toString() === user._id.toString()
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
              onClick={() => handleCertificateOpen(user)}
            >
              Generate Certificate
            </Button>
          )}
        </TableCell>
      </motion.tr>
    );
  };

  console.log(users, "users");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
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

        {/* Recognition Users */}
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
                {recognitionUsers.length > 0 ? (
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

        {/* Volunteer Users */}
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
                {volunteerUsers.length > 0 ? (
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
          open={openCertificateModal}
          onOpenChange={(open: any) => {
            setOpenCertificateModal(open);
            if (!open) fetchCertificates(); // refresh after certificate saved
          }}
          participant={selectedUser}
          roleBased={true}
        />
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import React from "react";
import { toast } from "sonner";
import { api } from "@/data/api";

export default function CertificateModal({
  open,
  onOpenChange,
  participant,
}: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [signatures, setSignatures] = React.useState([
    { name: "", signature: "", designation: "" },
    { name: "", signature: "", designation: "" },
  ]);
  const [sponsored, setSponsored] = React.useState([
    { name: "", signature: "" },
  ]);
  const [organized, setOrganized] = React.useState([{ name: "", origin: "" }]);

  console.log("Participant in modal:", participant);

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getOrdinalWord = (n: number): string => {
    if (n <= 0) return "";

    const ones = [
      "",
      "FIRST",
      "SECOND",
      "THIRD",
      "FOURTH",
      "FIFTH",
      "SIXTH",
      "SEVENTH",
      "EIGHTH",
      "NINTH",
      "TENTH",
      "ELEVENTH",
      "TWELFTH",
      "THIRTEENTH",
      "FOURTEENTH",
      "FIFTEENTH",
      "SIXTEENTH",
      "SEVENTEENTH",
      "EIGHTEENTH",
      "NINETEENTH",
    ];

    const tens = [
      "",
      "",
      "TWENTY",
      "THIRTY",
      "FORTY",
      "FIFTY",
      "SIXTY",
      "SEVENTY",
      "EIGHTY",
      "NINETY",
    ];

    const hundreds = [
      "",
      "ONE HUNDRED",
      "TWO HUNDRED",
      "THREE HUNDRED",
      "FOUR HUNDRED",
      "FIVE HUNDRED",
      "SIX HUNDRED",
      "SEVEN HUNDRED",
      "EIGHT HUNDRED",
      "NINE HUNDRED",
    ];

    if (n < 20) return ones[n];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return one === 0 ? tens[ten] : `${tens[ten]}-${ones[one]}`;
    }

    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      if (remainder === 0) return hundreds[hundred];
      return `${hundreds[hundred]} ${getOrdinalWord(remainder)}`;
    }

    return `${n}TH`;
  };

  const capture = async () => {
    if (!ref.current) return null;
    return await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
  };

  // const downloadPDF = async () => {
  //   const url = await capture();
  //   if (!url) return;

  //   const pdf = new jsPDF("l", "mm", "a4");
  //   const img = new window.Image();
  //   img.src = url;
  //   img.onload = () => {
  //     const w = pdf.internal.pageSize.getWidth();
  //     const h = (img.height * w) / img.width;
  //     pdf.addImage(url, "PNG", 0, 0, w, h);
  //     pdf.save(`${participant?.user?.fullNameEnglish}.pdf`);
  //   };
  // };

  const downloadPDF = async () => {
    const url = await capture();
    if (!url) return;

    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      const pdfWidth = 297; // landscape A4 width in mm
      const pdfHeight = (img.height * pdfWidth) / img.width; // maintain aspect ratio

      // Create PDF with dynamic height
      const pdf = new jsPDF("l", "mm", [pdfWidth, pdfHeight]);

      pdf.addImage(url, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${participant?.user?.fullNameEnglish}.pdf`);
    };
  };

  const uploadImgBB = async () => {
    const url = await capture();
    if (!url) return;

    const base64 = url.split(",")[1];

    // 1️⃣ Upload to Imgbb
    const fd = new FormData();
    fd.append("image", base64);
    fd.append("key", "4c7e773ceec6622d7f2c91c17d0e0b71");

    try {
      const res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();

      if (!json.success) {
        toast.error("ImgBB Upload failed");
        return;
      }

      const imageUrl = json.data.url;
      toast.success("ImgBB Upload successful");

      // 2️⃣ Save to your database
      const dbRes = await fetch(`http://localhost:5000/api/certificates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          userId: participant.user._id,
          participationId: participant.quiz._id,
          rank: participant.rank,
          marks: participant.obtainedMarks,
          totalMarks: participant.quiz.totalMarks,
          signatures,
        }),
      });

      const dbJson = await dbRes.json();

      if (dbRes.ok) {
        toast.success("Certificate saved in DB!");
        console.log("Saved certificate:", dbJson.certificate);
      } else {
        console.error(dbJson);
        toast.error("Failed to save certificate in DB");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-indigo-700">
            Generate Certificate
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6">
          {/* LEFT */}
          <div className="w-full md:w-2/5 space-y-4">
            {signatures.map((s, i) => (
              <div key={i} className="p-4 border rounded bg-indigo-50">
                <Label>Signature {i + 1}</Label>
                <Input
                  placeholder="Name"
                  value={s.name}
                  onChange={(e) => {
                    const u = [...signatures];
                    u[i].name = e.target.value;
                    setSignatures(u);
                  }}
                />
                <Input
                  placeholder="Signature"
                  value={s.signature}
                  onChange={(e) => {
                    const u = [...signatures];
                    u[i].signature = e.target.value;
                    setSignatures(u);
                  }}
                />
                <Input
                  placeholder="Designation"
                  value={s.designation}
                  onChange={(e) => {
                    const u = [...signatures];
                    u[i].designation = e.target.value;
                    setSignatures(u);
                  }}
                />
              </div>
            ))}
            {sponsored.map((s, i) => (
              <div key={i} className="p-4 border rounded bg-indigo-50">
                <Label>Sponsored By {i + 1}</Label>

                <Input
                  placeholder="Name"
                  value={s.name}
                  onChange={(e) => {
                    const u = [...sponsored];
                    u[i].name = e.target.value;
                    setSponsored(u);
                  }}
                />
              </div>
            ))}
            {organized.map((s, i) => (
              <div key={i} className="p-4 border rounded bg-indigo-50">
                <Label>Organized By {i + 1}</Label>

                <Input
                  placeholder="Name"
                  value={s.name}
                  onChange={(e) => {
                    const u = [...organized];
                    u[i].name = e.target.value;
                    setOrganized(u);
                  }}
                />
              </div>
            ))}
            <Button className="w-full" onClick={downloadPDF}>
              Download PDF
            </Button>
          </div>

          {/* RIGHT - PREVIEW */}
          <div ref={ref} className="relative">
            <Image
              src="/certificate-placed.png"
              width={1000}
              height={700}
              alt="bg"
            />
            <div className="absolute top-[10%] left-[8.6%] text-4xl text-white font-bold">
              {getOrdinal(participant?.rank)}
            </div>
            <div
              className="absolute top-[46%] left-1/2 -translate-x-1/2 text-6xl font-bold"
              style={{ color: "#9c4e98" }}
            >
              {participant?.user?.fullNameEnglish}
            </div>
            {signatures.map((s, i) => {
              const pos = [
                { b: "10%", l: "8.6%" },
                { b: "10.5%", r: "8%" },
                { b: "10.5%", l: "44%" },
              ][i];
              return (
                <div
                  key={i}
                  className="absolute flex flex-col items-center"
                  style={{
                    bottom: pos?.b,
                    left: pos?.l,
                    right: pos?.r,
                    color: "#413a41ce",
                  }}
                >
                  <span className="text-2xl font-signature">
                    {s.signature || "Signature"}
                  </span>
                  <div className="w-2/3 h-[2px] bg-gray-400"></div>
                  <span className="text-xs">{s.name || "Name"}</span>
                  <span className="text-xs">
                    {s.designation || "Designation"}
                  </span>
                </div>
              );
            })}

            <div className="absolute bottom-[29%] w-6/8 left-1/2 -translate-x-1/2 text-center">
              <h1>
                For outstanding performance and achieving the{" "}
                <span className="font-bold">
                  {getOrdinal(participant?.rank)}
                </span>{" "}
                in the{" "}
                <span className="font-bold capitalize">
                  {participant?.quiz?.title}
                </span>
                . Your achievement is a reflection of your hard work and
                dedication. Congratulations and best wishes! — Organized by{" "}
                {organized.map((s, i) => (
                  <span key={i} className="text-lg font-bold capitalize">
                    {s.name || "Name"}
                    {i !== organized.length - 1 && ", "}
                  </span>
                ))}{" "}
                & sponsored by{" "}
                {sponsored.map((s, i) => (
                  <span key={i} className="text-lg font-bold capitalize">
                    {s.name || "Name"}
                    {i !== sponsored.length - 1 && ", "}
                  </span>
                ))}
              </h1>
            </div>

            <div
              className="absolute bottom-[16%] left-[44%]"
              style={{ color: "#413a41ce" }}
            >
              {new Date().toLocaleDateString("en-GB")}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={uploadImgBB} className="bg-green-600">
            Generate Certificate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

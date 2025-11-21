// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useRef, useState } from "react";
// import Image from "next/image";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { toPng } from "html-to-image";
// import jsPDF from "jspdf";
// import React from "react";
// import { toast } from "sonner";
// import { api } from "@/data/api";
// import { Loader2 } from "lucide-react";

// export default function CertificateModal({
//   user,
//   quizName,
//   open,
//   onOpenChange,
//   participant,
// }: any) {
//   const ref = useRef<HTMLDivElement>(null);
//   const [loading, setLoading] = useState(false);

//   console.log("user", user, "quizname", quizName, "participant", participant);

//   const [signatures, setSignatures] = useState([
//     { name: "", signature: "", designation: "" },
//     { name: "", signature: "", designation: "" },
//   ]);
// const [sponsored, setSponsored] = useState([{ name: "", signature: "" }]);
// const [organized, setOrganized] = useState([{ name: "", origin: "" }]);

//   const getOrdinal = (n: number) => {
//     const s = ["th", "st", "nd", "rd"],
//       v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
//   };

//   const getOrdinalWord = (n: number): string => {
//     if (n <= 0) return "";
//     const ones = [
//       "",
//       "FIRST",
//       "SECOND",
//       "THIRD",
//       "FOURTH",
//       "FIFTH",
//       "SIXTH",
//       "SEVENTH",
//       "EIGHTH",
//       "NINTH",
//       "TENTH",
//       "ELEVENTH",
//       "TWELFTH",
//       "THIRTEENTH",
//       "FOURTEENTH",
//       "FIFTEENTH",
//       "SIXTEENTH",
//       "SEVENTEENTH",
//       "EIGHTEENTH",
//       "NINETEENTH",
//     ];
//     const tens = [
//       "",
//       "",
//       "TWENTY",
//       "THIRTY",
//       "FORTY",
//       "FIFTY",
//       "SIXTY",
//       "SEVENTY",
//       "EIGHTY",
//       "NINETY",
//     ];
//     const hundreds = [
//       "",
//       "ONE HUNDRED",
//       "TWO HUNDRED",
//       "THREE HUNDRED",
//       "FOUR HUNDRED",
//       "FIVE HUNDRED",
//       "SIX HUNDRED",
//       "SEVEN HUNDRED",
//       "EIGHT HUNDRED",
//       "NINE HUNDRED",
//     ];
//     if (n < 20) return ones[n];
//     if (n < 100) {
//       const ten = Math.floor(n / 10);
//       const one = n % 10;
//       return one === 0 ? tens[ten] : `${tens[ten]}-${ones[one]}`;
//     }
//     if (n < 1000) {
//       const hundred = Math.floor(n / 100);
//       const remainder = n % 100;
//       if (remainder === 0) return hundreds[hundred];
//       return `${hundreds[hundred]} ${getOrdinalWord(remainder)}`;
//     }
//     return `${n}TH`;
//   };

//   const capture = async () => {
//     if (!ref.current) return null;
//     return await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
//   };

//   const downloadPDF = async () => {
//     const url = await capture();
//     if (!url) return;

//     const img = new window.Image();
//     img.src = url;
//     img.onload = () => {
//       const pdfWidth = 297; // A4 landscape width
//       const pdfHeight = (img.height * pdfWidth) / img.width;
//       const pdf = new jsPDF("l", "mm", [pdfWidth, pdfHeight]);
//       pdf.addImage(url, "PNG", 0, 0, pdfWidth, pdfHeight);
//       pdf.save(`${participant?.user?.fullNameEnglish}.pdf`);
//     };
//   };

//   const uploadImgBB = async () => {
//     setLoading(true);
//     try {
//       const url = await capture();
//       if (!url) {
//         toast.error("Failed to capture image");
//         return;
//       }

//       const base64 = url.split(",")[1];

//       // Upload to Imgbb
//       const fd = new FormData();
//       fd.append("image", base64);
//       fd.append("key", "4c7e773ceec6622d7f2c91c17d0e0b71");

//       const res = await fetch("https://api.imgbb.com/1/upload", {
//         method: "POST",
//         body: fd,
//       });
//       const json = await res.json();

//       if (!json.success) {
//         toast.error("ImgBB upload failed");
//         return;
//       }

//       const imageUrl = json.data.url;
//       toast.success("Image uploaded successfully");

//       // Save to database
//       // const dbRes = await fetch(`${api}/certificates`, {
//       //   method: "POST",
//       //   headers: { "Content-Type": "application/json" },
//       //   body: JSON.stringify({
//       //     imageUrl,
//       //     userId: participant.user._id,
//       //     participationId: participant._id,
//       //     rank: participant.rank,
//       //     marks: participant.obtainedMarks,
//       //     totalMarks: participant.quiz.totalMarks,
//       //     signatures,
//       //   }),
//       // });

//       // Save to database
//       const payload: any = {
//         imageUrl,
//         userId: participant.user._id,
//         signatures,
//       };

//       // If quiz participant
//       if (participant?._id && participant?.quiz) {
//         payload.participationId = participant._id;
//         payload.rank = participant.rank;
//         payload.marks = participant.obtainedMarks;
//         payload.totalMarks = participant.quiz.totalMarks || null;
//       }
//       // If volunteer or recognition
//       else if (user?.role) {
//         payload.role = user.role; // "volunteer" | "recognition" | "representative"
//       }

//       const dbRes = await fetch(`${api}/certificates`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const dbJson = await dbRes.json();
//       console.log(dbJson, "dbJson");

//       if (dbRes.ok) {
//         toast.success("Certificate saved successfully!");
//         onOpenChange(false); // ✅ Close modal
//       } else {
//         console.error(dbJson);
//         toast.error("Failed to save certificate in DB");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Upload failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getDynamicClass = () => {
//     if (participant) {
//       // For ranking certificates
//       return {
//         font: "text-4xl",
//         top: "top-[10%]",
//         left: "left-[8.6%]",
//       };
//     }

//     // For volunteers
//     if (user?.role === "volunteer") {
//       return {
//         font: "text-lg",
//         top: "top-[12%]",
//         left: "left-[7.4%]",
//       };
//     }

//     // For recognition users (Honored)
//     return {
//       font: "text-[20px] text-gray-100 font-bold",
//       top: "top-[12%]",
//       left: "left-[7.5%]",
//     };
//   };

//   const position = getDynamicClass();

// const getCertificateText = () => {
//   const eventName = participant
//     ? participant?.quiz?.title
//     : quizName || "Event";

//   const platformNames = organized.map((o) => o.name).join(", ") || "Platform";
//   const sponsorNames = sponsored.map((s) => s.name).join(", ") || "Sponsor";

//   // 1) QUIZ PARTICIPANT (ranking)
//   if (participant) {
//     return (
//       <>
//         For outstanding performance and achieving the{" "}
//         <span className="font-bold">{getOrdinal(participant?.rank)}</span> in
//         the <span className="font-bold capitalize">{eventName}</span>. Your
//         achievement is a reflection of your hard work and dedication.
//         Congratulations and best wishes! — Organized by{" "}
//         <span className="font-bold capitalize">{platformNames}</span> &
//         sponsored by{" "}
//         <span className="font-bold capitalize">{sponsorNames}</span>.
//       </>
//     );
//   }

//   // 2) VOLUNTEER
//   if (user?.role === "volunteer") {
//     return (
//       <>
//         For participation, achievement, and positive contribution in the{" "}
//         <span className="font-bold capitalize">{eventName}</span>. We wish
//         continued success and appreciation for your dedication.
//       </>
//     );
//   }

//   // 3) RECOGNITION (Honored)
//   return (
//     <>
//       In recognition of valuable contribution and dedication as a{" "}
//       <span className="font-bold capitalize">
//         {user?.role || "Representative"}
//       </span>{" "}
//       in the <span className="font-bold capitalize">{eventName}</span>{" "}
//       organized by{" "}
//       <span className="font-bold capitalize">{platformNames}</span>. Your
//       effort and support are sincerely appreciated.
//     </>
//   );
// };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-7xl h-screen overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-semibold text-indigo-700">
//             Generate Certificate
//           </DialogTitle>
//         </DialogHeader>

//         <div className="flex flex-col md:flex-row gap-6">
//           {/* LEFT */}
//           <div className="w-full md:w-2/5 space-y-4">
//             {signatures.map((s, i) => (
//               <div key={i} className="p-4 border rounded bg-indigo-50">
//                 <Label>Signature {i + 1}</Label>
//                 <Input
//                   placeholder="Name"
//                   value={s.name}
//                   onChange={(e) => {
//                     const u = [...signatures];
//                     u[i].name = e.target.value;
//                     setSignatures(u);
//                   }}
//                 />
//                 <Input
//                   placeholder="Signature"
//                   value={s.signature}
//                   onChange={(e) => {
//                     const u = [...signatures];
//                     u[i].signature = e.target.value;
//                     setSignatures(u);
//                   }}
//                 />
//                 <Input
//                   placeholder="Designation"
//                   value={s.designation}
//                   onChange={(e) => {
//                     const u = [...signatures];
//                     u[i].designation = e.target.value;
//                     setSignatures(u);
//                   }}
//                 />
//               </div>
//             ))}

// {sponsored.map((s, i) => (
//   <div key={i} className="p-4 border rounded bg-indigo-50">
//     <Label>Sponsored By {i + 1}</Label>
//     <Input
//       placeholder="Name"
//       value={s.name}
//       onChange={(e) => {
//         const u = [...sponsored];
//         u[i].name = e.target.value;
//         setSponsored(u);
//       }}
//     />
//   </div>
// ))}

// {organized.map((s, i) => (
//   <div key={i} className="p-4 border rounded bg-indigo-50">
//     <Label>Organized By {i + 1}</Label>
//     <Input
//       placeholder="Name"
//       value={s.name}
//       onChange={(e) => {
//         const u = [...organized];
//         u[i].name = e.target.value;
//         setOrganized(u);
//       }}
//     />
//   </div>
// ))}

//             <Button className="w-full" onClick={downloadPDF}>
//               Download PDF
//             </Button>
//           </div>

//           {/* RIGHT - PREVIEW */}
//           <div ref={ref} className="relative">
//             <Image
//               src="/certificate-placed.png"
//               width={1000}
//               height={700}
//               alt="bg"
//             />

// <div
//   className={`absolute text-white font-bold ${position.top} ${position.left} ${position.font}`}
// >
//   {participant
//     ? getOrdinal(participant?.rank)
//     : user?.role === "volunteer"
//     ? "Volunteer"
//     : "Honored"}
// </div>

// <div
//   className="absolute top-[45%] left-1/2 -translate-x-1/2 text-6xl font-bold"
//   style={{ color: "#9c4e98" }}
// >
//   {participant
//     ? participant?.user?.fullNameEnglish
//     : user?.fullNameEnglish}
// </div>
// {signatures.map((s, i) => {
//   const pos = [
//     { b: "10%", l: "8.6%" },
//     { b: "10.5%", r: "8%" },
//     { b: "10.5%", l: "44%" },
//   ][i];
//   return (
//     <div
//       key={i}
//       className="absolute flex flex-col items-center"
//       style={{
//         bottom: pos?.b,
//         left: pos?.l,
//         right: pos?.r,
//         color: "#413a41ce",
//       }}
//     >
//       <span className="text-2xl font-signature">
//         {s.signature || "Signature"}
//       </span>
//       <div className="w-2/3 h-[2px] bg-gray-400"></div>
//       <span className="text-xs">{s.name || "Name"}</span>
//       <span className="text-xs">
//         {s.designation || "Designation"}
//       </span>
//     </div>
//   );
// })}

// {/* <div className="absolute bottom-[29%] w-6/8 left-1/2 -translate-x-1/2 text-center">
//   <h1>
//     For outstanding performance and achieving the{" "}
//     <span className="font-bold">
//       {getOrdinal(participant?.rank)}
//     </span>{" "}
//     in the{" "}
//     <span className="font-bold capitalize">
//       {participant ? participant?.quiz?.title : quizName}
//     </span>
//     . Your achievement is a reflection of your hard work and
//     dedication. Congratulations and best wishes! — Organized by{" "}
//     {organized.map((s, i) => (
//       <span key={i} className="text-lg font-bold capitalize">
//         {s.name || "Name"}
//         {i !== organized.length - 1 && ", "}
//       </span>
//     ))}{" "}
//     & sponsored by{" "}
//     {sponsored.map((s, i) => (
//       <span key={i} className="text-lg font-bold capitalize">
//         {s.name || "Name"}
//         {i !== sponsored.length - 1 && ", "}
//       </span>
//     ))}
//   </h1>
// </div> */}

// <div className="absolute bottom-[26%] w-6/8 left-1/2 -translate-x-1/2 text-center">
//   <h1 className="text-lg leading-relaxed">
//     {getCertificateText()}
//   </h1>
// </div>

//             <div
//               className="absolute bottom-[16%] left-[44%]"
//               style={{ color: "#413a41ce" }}
//             >
//               {new Date().toLocaleDateString("en-GB")}
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end mt-4">
//           <Button
//             onClick={uploadImgBB}
//             className="bg-green-600"
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
//               </>
//             ) : (
//               "Generate Certificate"
//             )}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
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
import { toast } from "sonner";
import { api } from "@/data/api";
import { Loader2 } from "lucide-react";

export default function CertificateModal({
  user,
  quizName,
  open,
  onOpenChange,
  participant,
  quizId,
}: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const [signatures, setSignatures] = useState([
    { name: "", signature: "", designation: "" },
    { name: "", signature: "", designation: "" },
  ]);

  console.log("quizId", quizId);
  console.log("user", user);
  console.log("participant", participant);

  const [sponsored, setSponsored] = useState([{ name: "" }]);
  const [organized, setOrganized] = useState([{ name: "" }]);

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const capture = async () => {
    if (!ref.current) return null;
    return await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
  };

  const downloadPDF = async () => {
    const url = await capture();
    if (!url) return;

    const fileName = participant
      ? participant?.user?.fullNameEnglish
      : user?.fullNameEnglish || "certificate";

    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      const pdfWidth = 297;
      const pdfHeight = (img.height * pdfWidth) / img.width;
      const pdf = new jsPDF("l", "mm", [pdfWidth, pdfHeight]);
      pdf.addImage(url, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
    };
  };

  const uploadImgBB = async () => {
    setLoading(true);
    try {
      console.log("[CertificateModal] Starting certificate generation...");

      // 1️⃣ Capture certificate as PNG
      const url = await capture();
      if (!url) {
        toast.error("Failed to capture certificate image.");
        setLoading(false);
        return;
      }

      // 2️⃣ Upload to Imgbb
      const base64 = url.split(",")[1];
      const fd = new FormData();
      fd.append("image", base64);
      fd.append("key", "4c7e773ceec6622d7f2c91c17d0e0b71"); // move to backend later

      console.log("[CertificateModal] Uploading to Imgbb...");
      const res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();

      if (!json?.success) {
        console.error("[CertificateModal] Imgbb failed:", json);
        toast.error("Image upload failed");
        setLoading(false);
        return;
      }

      const imageUrl = json.data.url;
      console.log("[CertificateModal] Image uploaded:", imageUrl);

      // 3️⃣ Build payload for backend
      const userId =
        participant?.user?._id ?? user?._id ?? user?.id ?? (user as any)?.uuid;
      const name =
        participant?.user?.fullNameEnglish ??
        user?.fullNameEnglish ??
        "Recipient";

      const payload: any = {
        imageUrl,
        userId,
        name,
        signatures,
      };

      const userRole = user?.role;

      // ⭐ CASE 1: QUIZ PARTICIPANT
      if (participant?._id) {
        payload.participationId = participant._id;

        if (participant.quiz) {
          payload.rank = participant.rank ?? null;
          payload.marks = participant.obtainedMarks ?? null;
          payload.totalMarks = participant.quiz?.totalMarks ?? null;
          payload.eventId = participant.quiz._id; // attach quiz/event ID for reference
        }
      }

      if (["volunteer", "recognition", "representative"].includes(userRole)) {
        payload.role = userRole;
        if (quizId) {
          payload.eventId = quizId;
        }
      }

      console.log("[CertificateModal] Payload to backend:", payload);

      // 4️⃣ Send to backend
      const dbRes = await fetch(`${api}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dbJson = await dbRes.json();
      console.log("[CertificateModal] Backend response:", dbRes.status, dbJson);

      if (dbRes.ok) {
        toast.success(
          `${payload.role ?? "Quiz"} certificate saved successfully!`
        );
        onOpenChange(false); // Close modal
      } else {
        toast.error(dbJson?.message || "Failed to save certificate");
      }
    } catch (err) {
      console.error("[CertificateModal] Unexpected error:", err);
      toast.error("Certificate generation failed");
    } finally {
      setLoading(false);
    }
  };

  /** Dynamic text position */
  const getDynamicClass = () => {
    if (participant) {
      return { font: "text-4xl", top: "top-[10%]", left: "left-[8.6%]" };
    }

    if (user?.role === "volunteer") {
      return { font: "text-lg", top: "top-[12%]", left: "left-[7.4%]" };
    }

    return {
      font: "text-[20px] text-gray-100 font-bold",
      top: "top-[12%]",
      left: "left-[7.5%]",
    };
  };

  const position = getDynamicClass();

  const getCertificateText = () => {
    const eventName = participant
      ? participant?.quiz?.title
      : quizName || "Event";

    const platformNames = organized.map((o) => o.name).join(", ") || "Platform";
    const sponsorNames = sponsored.map((s) => s.name).join(", ") || "Sponsor";

    // 1) QUIZ PARTICIPANT (ranking)
    if (participant) {
      return (
        <>
          For outstanding performance and achieving the{" "}
          <span className="font-bold">{getOrdinal(participant?.rank)}</span> in
          the <span className="font-bold capitalize">{eventName}</span>. Your
          achievement is a reflection of your hard work and dedication.
          Congratulations and best wishes! — Organized by{" "}
          <span className="font-bold capitalize">{platformNames}</span> &
          sponsored by{" "}
          <span className="font-bold capitalize">{sponsorNames}</span>.
        </>
      );
    }

    // 2) VOLUNTEER
    if (user?.role === "volunteer") {
      return (
        <>
          For participation, achievement, and positive contribution in the{" "}
          <span className="font-bold capitalize">{eventName}</span>. We wish
          continued success and appreciation for your dedication.
        </>
      );
    }

    // 3) RECOGNITION (Honored)
    return (
      <>
        In recognition of valuable contribution and dedication as a{" "}
        <span className="font-bold capitalize">
          {user?.role || "Representative"}
        </span>{" "}
        in the <span className="font-bold capitalize">{eventName}</span>{" "}
        organized by{" "}
        <span className="font-bold capitalize">{platformNames}</span>. Your
        effort and support are sincerely appreciated.
      </>
    );
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

            <div
              className={`absolute text-white font-bold ${position.top} ${position.left} ${position.font}`}
            >
              {participant
                ? getOrdinal(participant?.rank)
                : user?.role === "volunteer"
                ? "Volunteer"
                : "Honored"}
            </div>

            <div
              className="absolute top-[45%] left-1/2 -translate-x-1/2 text-5xl font-bold"
              style={{ color: "#9c4e98" }}
            >
              {participant
                ? participant?.user?.fullNameEnglish
                : user?.fullNameEnglish || "Recipient"}
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

            <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 text-center w-6/8">
              <h1 className="text-lg leading-relaxed">
                {getCertificateText()}
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
          <Button
            onClick={uploadImgBB}
            className="bg-green-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Certificate"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

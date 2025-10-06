// src/app/unauthorized/page.tsx
"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--brand-primary)", opacity: 0.95 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          অননুমোদিত প্রবেশ
        </h1>
        <p className="text-gray-600 mb-6">
          দুঃখিত, এই পেজে অ্যাক্সেস করার জন্য আপনার প্রয়োজনীয় অনুমতি নেই।
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => router.back()}
            className="w-full"
            style={{ backgroundImage: "var(--brand-gradient)" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            পিছনে যান
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            হোমপেজে যান
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

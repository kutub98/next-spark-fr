"use client";

import { motion } from "framer-motion";
import { Suspense } from "react";
import Banner from "../components/banner";
import Gift from "../components/gift";
import QuizSection from "../components/quizSection";
import QuizTimelineAndInstructions from "../components/QuizTimelineAndInstructions";
import FaqSection from "../components/FaqItem";
import JudgeSection from "../components/JudgeSection";
import EventSection from "../components/EventSection";

// Loading component for better UX
const SectionSkeleton = () => (
  <div className="w-full h-96 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-2xl" />
);

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen"
    >
      <Suspense fallback={<SectionSkeleton />}>
        <Banner />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <Gift />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <QuizSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <JudgeSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <EventSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <QuizTimelineAndInstructions />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FaqSection />
      </Suspense>
    </motion.main>
  );
}

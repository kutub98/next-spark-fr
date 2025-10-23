

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Users, Trophy, Star } from "lucide-react";
import RulesSection from "./RulesSection";
import { api } from "@/data/api";

interface QuizInfo {
  title: string;
  description: string;
}

interface CompetitionDetails {
  title: string;
  description: string;
  icon: string;
}

interface Rules {
  title: string;
  items: string[];
}

interface QuizData {
  quizInfo: QuizInfo;
  competitionDetails: CompetitionDetails;
  rules: Rules;
}

export default function QuizSection() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const res = await fetch(
          `${api}/quiz-data`
        );
        const json = await res.json();

        if (json.success && json.data.length > 0) {
          setQuizData(json.data[0]);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  if (loading) {
    return (
      <motion.section
        className="py-20 bg-gradient-to-br from-slate-50 to-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-3xl animate-pulse"></div>
            <div className="h-96 bg-gray-200 rounded-3xl animate-pulse"></div>
          </div>
        </div>
      </motion.section>
    );
  }

  if (!quizData) {
    return (
      <motion.section
        className="py-20 bg-gradient-to-br from-slate-50 to-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-12">
            <p className="text-lg text-red-500">কুইজ ডেটা পাওয়া যায়নি।</p>
          </div>
        </div>
      </motion.section>
    );
  }

  const { quizInfo, competitionDetails, rules } = quizData;

  return (
    <motion.section
      className="py-20 bg-gradient-to-br from-slate-50 via-white to-orange-50 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-yellow-50/30"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f25b29' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Quiz Intro */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-orange-500 bg-clip-text text-transparent">
              {quizInfo.title}
            </h2>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div
              className="text-lg md:text-xl text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: quizInfo.description }}
            />
          </motion.div>
        </motion.div>

        {/* Competition Details */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {/* Image Section */}
          <motion.div
            className="relative group"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div
              className="relative w-full h-80 lg:h-96 bg-cover bg-center rounded-3xl shadow-2xl"
              style={{
                backgroundImage: `url(${competitionDetails.icon})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl border border-white/20 flex flex-col justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {competitionDetails.title}
              </h3>
            </div>

            <div
              className="text-gray-700 text-lg leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: competitionDetails.description,
              }}
            />

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">১০ মিনিট</span>
              </div>
              <div className="flex items-center gap-2 text-orange-600">
                <Users className="w-5 h-5" />
                <span className="font-semibold">১৫ জন বিজয়ী</span>
              </div>
              <div className="flex items-center gap-2 text-orange-600">
                <Star className="w-5 h-5" />
                <span className="font-semibold">২০টি প্রশ্ন</span>
              </div>
              <div className="flex items-center gap-2 text-orange-600">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">৩০,০০০ টাকা</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Rules Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <RulesSection title={rules.title} rules={rules.items} />
        </motion.div>
      </div>
    </motion.section>
  );
}

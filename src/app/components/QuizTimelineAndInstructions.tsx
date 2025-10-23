"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, FileText } from "lucide-react";
import { api } from "@/data/api";

interface SectionProps {
  title: string;
  points: string[];
  bgColor?: string; // will store actual color code from API
  textColor?: string; // will store actual color code from API
}

function InfoBlock({
  title,
  points,
  bgColor = "#ffffff",
  textColor = "#1f2937",
  icon: Icon,
}: SectionProps & { icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <motion.div
      className="rounded-3xl shadow-xl p-8 md:p-10 w-full border border-white/20 backdrop-blur-sm"
      style={{ backgroundColor: bgColor, color: textColor }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {Icon && (
          <div
            className="p-3 rounded-full"
            style={{
              background: `linear-gradient(to right, #f97316, #ea580c)`,
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <h3 className="text-2xl md:text-3xl font-bold">{title}</h3>
      </motion.div>

      <motion.ul
        className="space-y-4 text-base leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {points.map((point, idx) => (
          <motion.li
            key={idx}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1, duration: 0.5 }}
          >
            <div
              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              style={{ backgroundColor: textColor }}
            />
            <span>{point}</span>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

export default function QuizTimelineAndInstructions() {
  const [timeline, setTimeline] = useState<SectionProps | null>(null);
  const [instructions, setInstructions] = useState<SectionProps | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${api}/time-instruction`);
        const json = await res.json();
        console.log("Fetched time & instructions:", json);

        if (json.success && json.data) {
          const data = json.data; // just use the object

          const timelineData: SectionProps = {
            title: data.timeline.title,
            points: data.timeline.points,
            bgColor: data.timeline.bgColor,
            textColor: data.timeline.textColor,
          };

          const instructionsData: SectionProps = {
            title: data.instructions.title,
            points: data.instructions.points,
            bgColor: data.instructions.bgColor,
            textColor: data.instructions.textColor,
          };

          setTimeline(timelineData);
          setInstructions(instructionsData);
        }
      } catch (err) {
        console.error("Failed to fetch time & instructions:", err);
      }
    };

    fetchData();
  }, []);

  if (!timeline || !instructions) {
    return (
      <motion.section
        className="py-20 bg-gradient-to-br from-gray-50 to-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="bg-gray-200 rounded-3xl p-8 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-3xl p-8 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50 relative overflow-hidden"
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

      <div className="relative max-w-6xl mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <InfoBlock {...timeline} icon={Clock} />
          <InfoBlock {...instructions} icon={FileText} />
        </motion.div>
      </div>
    </motion.section>
  );
}

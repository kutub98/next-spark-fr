// // components/QuizTimelineAndInstructions.tsx

// interface SectionProps {
//   title: string;
//   points: string[];
//   bgColor?: string;
//   textColor?: string;
// }

// function InfoBlock({
//   title,
//   points,
//   bgColor = "bg-white",
//   textColor = "text-gray-800",
// }: SectionProps) {
//   return (
//     <div className={`rounded-2xl shadow-lg p-6 md:p-8 w-full ${bgColor}`}>
//       <h3 className={`text-2xl font-bold mb-4 ${textColor}`}>{title}</h3>
//       <ul
//         className={`list-disc list-inside space-y-3 text-base leading-relaxed ${textColor}`}
//       >
//         {points.map((point, idx) => (
//           <li key={idx}>{point}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default function QuizTimelineAndInstructions() {
//   const primaryColor = "#f25b29"; // Your primary brand color

//   const timeline = {
//     title: "সময়",
//     points: [
//       "নিবন্ধন চলবে: ২৫ অক্টোবর থেকে ১৪ নভেম্বর ২০২৪ পর্যন্ত",
//       "মহড়া কুইজ: ২ ও ৩ নভেম্বর ২০২৪, সন্ধ্যা ৭টা থেকে ৭টা ১০ মিনিট",
//       "মূল পর্বের কুইজ: ৫ থেকে ১৪ নভেম্বর ২০২৪, প্রতিদিন সন্ধ্যা ৭টা থেকে ৭টা ১০ মিনিট",
//     ],
//     bgColor: "bg-[#f25b29]",
//     textColor: "text-white",
//   };

//   const instructions = {
//     title: "অংশগ্রহণের পদ্ধতি",
//     points: [
//       "নিবন্ধন লিংকে ক্লিক করলে নিবন্ধন ফরম আসবে। সেখানে জাতীয় পরিচয়পত্র/ জন্মসনদ অনুসারে নিজের দরকারি সব তথ্য দিয়ে ও নিজের পছন্দমতো পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) দিয়ে সাবমিট করতে হবে। এ সময় কুইজের নিয়মাবলি মেনে চলার অঙ্গীকার ব্যক্ত করতে হবে।",
//       "সাবমিট করার পর একটি লিংক আপনার ই-মেইলে যাবে। সেই লিংকে ক্লিক করে নিবন্ধন সম্পন্ন করতে হবে।",
//       "নিবন্ধনের সময় অংশগ্রহণকারীর নাম অবশ্যই বাংলায় দিতে হবে।",
//       "মূল কুইজ পর্ব শুরুর আগে সবার প্রস্তুতি নেওয়ার জন্য দুই দিন মহড়া কুইজ অনুষ্ঠিত হবে।",
//       "মূল কুইজ পর্বে একইভাবে হোমপেজের ‘কুইজ শুরু করুন’ বাটনে ক্লিক করে কুইজে অংশ নিতে হবে।",
//       "নিবন্ধনের তথ্য প্রথম আলো সংরক্ষণ করবে।",
//     ],
//     bgColor: "bg-white",
//     textColor: "text-[#f25b29]",
//   };

//   return (
//     <section className="bg-[#f9f9f9] py-16 px-4">
//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
//         <InfoBlock {...timeline} />
//         <InfoBlock {...instructions} />
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, FileText } from "lucide-react";
import { api } from "@/data/api";

interface SectionProps {
  title: string;
  points: string[];
  bgColor?: string;
  textColor?: string;
}

function InfoBlock({
  title,
  points,
  bgColor = "bg-white",
  textColor = "text-gray-800",
  icon: Icon,
}: SectionProps & { icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <motion.div
      className={`rounded-3xl shadow-xl p-8 md:p-10 w-full ${bgColor} border border-white/20 backdrop-blur-sm`}
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
          <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <h3 className={`text-2xl md:text-3xl font-bold ${textColor}`}>
          {title}
        </h3>
      </motion.div>

      <motion.ul
        className={`space-y-4 text-base leading-relaxed ${textColor}`}
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
              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                textColor === "text-white" ? "bg-white" : "bg-orange-500"
              }`}
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
        const res = await fetch(
          `${api}/time-instruction`
        );
        const json = await res.json();

        if (json.success && json.data.length > 0) {
          const data = json.data[0];
          const timelineData: SectionProps = {
            title: data.timeline.title,
            points: data.timeline.points,
            bgColor: `bg-[${data.timeline.bgColor}]`,
            textColor: `text-[${data.timeline.textColor}]`,
          };
          const instructionsData: SectionProps = {
            title: data.instructions.title,
            points: data.instructions.points,
            bgColor: `bg-[${data.instructions.bgColor}]`,
            textColor: `text-[${data.instructions.textColor}]`,
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

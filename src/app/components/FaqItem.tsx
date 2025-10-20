// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// interface FaqItem {
//   question: string;
//   answer: string;
// }

// const faqData: FaqItem[] = [
//   {
//     question: "স্মার্ট ভিলেজর পাঠক কুইজে কীভাবে অংশ নিতে হবে?",
//     answer:
//       "স্মার্ট ভিলেজর পাঠক কুইজে অংশ নেওয়ার জন্য https://smartvillagebd.com/ ঠিকানায় গিয়ে নিবন্ধন সম্পন্ন করতে হবে।",
//   },
//   {
//     question: "নিবন্ধন এবং কুইজে অংশগ্রহণের জন্য কী ডিভাইস লাগবে?",
//     answer:
//       "ইন্টারনেট-সংবলিত একটি ডিজিটাল ডিভাইস দিয়ে স্মার্ট ভিলেজর পাঠক কুইজে অংশগ্রহণ করা যাবে, যেখানে ওয়েব ব্রাউজ করার ব্যবস্থা আছে। যেমন স্মার্টফোন, ল্যাপটপ, ডেস্কটপ কম্পিউটার।",
//   },
//   {
//     question: "নিবন্ধন কত তারিখ?",
//     answer:
//       "নিবন্ধন পর্ব সারা দেশে একযোগে শুরু হয়েছে এবং এটি ১৪ নভেম্বর ২০২৪ তারিখ সর্বশেষ কুইজের আগপর্যন্ত চলবে। নিবন্ধন লিংক: https://smartvillagebd.com/",
//   },
//   {
//     question: "কীভাবে নিবন্ধন করব?",
//     answer:
//       "সাইটে গিয়ে স্মার্ট ভিলেজর পাঠক কুইজে নিবন্ধনের জন্য নিবন্ধন বাটনে ক্লিক করতে হবে।\nনির্ধারিত জায়গায় এনআইডি/ জন্মসনদ অনুসারে আপনার তথ্য দিয়ে এবং নিজের পছন্দমতো পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) দিয়ে সাবমিট করতে হবে। এ সময় কুইজের নিয়মাবলি মেনে চলার অঙ্গীকার ব্যক্ত করে সাবমিট অপশনে ক্লিক করতে হবে।\nক্লিক করার পর অ্যাকাউন্ট ভেরিফাই করার জন্য আপনার ই–মেইলে একটি লিংক যাবে। ওই লিংকে ক্লিক করে ভেরিফাই করতে হবে।\nঅ্যাকাউন্ট ভেরিফাই করা ছাড়া আপনি লগইন করতে পারবেন না এবং স্মার্ট ভিলেজর পাঠক কুইজে অংশ নিতে পারবেন না।",
//   },
//   {
//     question: "ভেরিফাই করার জন্য নির্ধারিত ই–মেইল না পেলে কী করব?",
//     answer: "আপনার ই–মেইলের স্প্যাম হোল্ডারটি চেক করবেন।",
//   },
//   {
//     question: "ই–মেইল এবং ফোন নম্বর কি আবশ্যক?",
//     answer: "নিবন্ধন করার জন্য ই–মেইল এবং ফোন নম্বর আবশ্যক।",
//   },
//   {
//     question: "পাসওয়ার্ড ভুলে গেলে কী করব?",
//     answer:
//       "লগইন পেজে গিয়ে 'পাসওয়ার্ড ভুলে গেছেন?' অপশনে ক্লিক করে পাসওয়ার্ড রিসেট করতে পারবেন।",
//   },
//   {
//     question: "অনলাইনে মহড়া কুইজ কত তারিখ অনুষ্ঠিত হবে?",
//     answer:
//       "তারিখ: ২ ও ৩ নভেম্বর ২০২৪\nসময়: সন্ধ্যা ৭টা থেকে ৭টা ১০ মিনিট পর্যন্ত",
//   },
//   {
//     question: "কুইজ কবে অনুষ্ঠিত হবে?",
//     answer:
//       "তারিখ: ৫ নভেম্বর থেকে ১৪ নভেম্বর ২০২৪ পর্যন্ত (১০ দিন)\nসময়: সন্ধ্যা ৭টা থেকে ৭টা ১০ মিনিট পর্যন্ত।",
//   },
//   {
//     question: "কীভাবে বিজয়ী নির্ধারণ করা হবে?",
//     answer:
//       "প্রতিদিন সবচেয়ে কম সময়ে সবচেয়ে বেশিসংখ্যক প্রশ্নের সঠিক উত্তরদাতা ১৫ জনকে বিজয়ী ঘোষণা করা হবে। কুইজ শেষ হওয়ার পর ফলাফল অনলাইনে প্রকাশিত হবে।",
//   },
//   {
//     question: "পুরস্কার কী থাকবে?",
//     answer:
//       "প্রতিদিন জনপ্রতি ২,০০০ টাকা করে ১৫ জন বিজয়ী পাবেন মোট (২,০০০ × ১৫) = ৩০,০০০ টাকার গিফট চেক। ১০ দিনে মোট ৩,০০,০০০ টাকার গিফট চেক থাকবে।",
//   },
//   {
//     question: "ফলাফল কোথায় পাব?",
//     answer:
//       "প্রতিদিনের কুইজ শেষ হওয়ার ২০ মিনিট পর (https://smartvillagebd.com/) এই লিংকে ফলাফল বাটনে ক্লিক করে বিজয়ী ১৫ জনের নাম দেখতে পারবেন।",
//   },
// ];

// export default function FaqSection() {
//   const [openIndex, setOpenIndex] = useState<number | null>(null);

//   const toggle = (idx: number) => {
//     setOpenIndex(openIndex === idx ? null : idx);
//   };

//   return (
//     <section className="bg-white py-12 px-4">
//       <div className="max-w-5xl mx-auto">
//         <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
//           জিজ্ঞাসা
//         </h2>
//         <div className="space-y-4">
//           {faqData.map((item, idx) => (
//             <div
//               key={idx}
//               className="border border-gray-200 rounded-md shadow-sm overflow-hidden"
//             >
//               <button
//                 onClick={() => toggle(idx)}
//                 className="w-full text-left px-5 py-4 bg-[#f9f9f9] hover:bg-[#f0f0f0] text-lg font-medium text-gray-800 flex justify-between items-center"
//                 aria-expanded={openIndex === idx}
//                 aria-controls={`faq-answer-${idx}`}
//                 id={`faq-question-${idx}`}
//                 type="button"
//               >
//                 {item.question}
//                 <span className="text-2xl select-none">
//                   {openIndex === idx ? "−" : "+"}
//                 </span>
//               </button>
//               <AnimatePresence initial={false}>
//                 {openIndex === idx && (
//                   <motion.div
//                     key="content"
//                     id={`faq-answer-${idx}`}
//                     role="region"
//                     aria-labelledby={`faq-question-${idx}`}
//                     initial="collapsed"
//                     animate="open"
//                     exit="collapsed"
//                     variants={{
//                       open: { opacity: 1, height: "auto", marginTop: 8 },
//                       collapsed: { opacity: 0, height: 0, marginTop: 0 },
//                     }}
//                     transition={{ duration: 0.25, ease: "easeInOut" }}
//                     className="px-5 pb-5 text-gray-700 text-base whitespace-pre-line overflow-hidden"
//                   >
//                     {item.answer}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { api } from "@/data/api";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqSection() {
  const [faqData, setFaqData] = useState<FaqItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const res = await fetch(
          `${api}/faq`
        );
        const json = await res.json();

        if (json.success && json.data.length > 0) {
          setFaqData(json.data[0].faq); // get the 'faq' array inside first item
        }
      } catch (err) {
        console.error("Error fetching FAQ:", err);
      }
    };

    fetchFaq();
  }, []);

  return (
    <motion.section
      className="py-20 bg-gradient-to-br from-white via-gray-50 to-orange-50 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-yellow-50/30"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f25b29' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-orange-500 bg-clip-text text-transparent">
              জিজ্ঞাসা
            </h2>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            আপনার প্রশ্নের উত্তর খুঁজে নিন
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {faqData.length === 0 ? (
            <motion.div
              className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6 animate-pulse"></div>
              <p className="text-lg text-gray-500">Loading FAQs...</p>
            </motion.div>
          ) : (
            faqData.map((item, idx) => (
              <motion.div
                key={idx}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -2 }}
              >
                <motion.button
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-6 py-5 bg-gradient-to-r from-gray-50 to-white hover:from-orange-50 hover:to-orange-100 text-lg font-semibold text-gray-800 flex justify-between items-center transition-all duration-300 group"
                  aria-expanded={openIndex === idx}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="pr-4">{item.question}</span>
                  <motion.span
                    className="text-2xl select-none text-orange-500 group-hover:text-orange-600 transition-colors"
                    animate={{ rotate: openIndex === idx ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    +
                  </motion.span>
                </motion.button>

                <AnimatePresence initial={false}>
                  {openIndex === idx && (
                    <motion.div
                      key="content"
                      id={`faq-answer-${idx}`}
                      role="region"
                      aria-labelledby={`faq-question-${idx}`}
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: {
                          opacity: 1,
                          height: "auto",
                          marginTop: 0,
                          paddingTop: 16,
                          paddingBottom: 24,
                        },
                        collapsed: {
                          opacity: 0,
                          height: 0,
                          marginTop: 0,
                          paddingTop: 0,
                          paddingBottom: 0,
                        },
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="px-6 text-gray-700 text-base leading-relaxed overflow-hidden bg-gradient-to-b from-white to-gray-50"
                    >
                      {item.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}

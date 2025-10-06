

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

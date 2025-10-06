// "use client";

// import React from "react";

// const giftData = {
//   img: "/Asset/prducts/bg-orange-.jpg", // ensure this path is correct
//   amount: 300000,
//   dailyGift: 2000,
//   dayLength: 10,
// };

// const Gift = () => {
//   return (
//     <div
//       className="w-full bg-cover bg-center py-20 px-4"
//       style={{ backgroundImage: `url(${giftData.img})` }}
//     >
//       <div className="max-w-3xl mx-auto bg-white bg-opacity-90 rounded-2xl shadow-xl p-8 text-center space-y-4">
//         <h2 className="text-2xl font-bold text-orange-500">পুরস্কার</h2>

//         <p className="text-4xl font-extrabold text-gray-800">
//           {giftData.amount.toLocaleString()}
//         </p>

//         <p className="text-lg text-gray-600">
//           প্রতিদিন{" "}
//           <span className="font-semibold text-orange-600">
//             {giftData.dailyGift}
//           </span>{" "}
//           করে{" "}
//           <span className="font-semibold text-orange-600">
//             {giftData.dayLength} দিন
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Gift;

"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Gift as GiftIcon, Calendar, Users } from "lucide-react";
import { api } from "@/data/api";

interface GiftType {
  img: string;
  amount: number;
  dailyGift: number;
  dayLength: number;
}
interface status {
  status: "pending" | "delete" | "approved";
}

const Gift = () => {
  const [giftData, setGiftData] = useState<GiftType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGiftData = async () => {
      try {
        const response = await axios.get(
          `${api}/offers`
        );

        if (response.data.success && response.data.data.length > 0) {
          const approvedOffer = response.data.data.find(
            (offer: status) => offer.status === "approved"
          );

          if (approvedOffer) {
            setGiftData({
              img: approvedOffer.img,
              amount: approvedOffer.amount,
              dailyGift: approvedOffer.dailyGift,
              dayLength: approvedOffer.dayLength,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching gift data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGiftData();
  }, []);

  if (loading) {
    return (
      <motion.section
        className="w-full py-20 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl p-12 text-center animate-pulse">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </motion.section>
    );
  }

  if (!giftData) {
    return (
      <motion.section
        className="w-full py-20 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-12">
            <p className="text-lg text-red-500">কোনো পুরস্কার পাওয়া যায়নি।</p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="relative w-full py-20 px-4 overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${giftData.img})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-orange-900/80 via-orange-800/70 to-orange-900/80" />

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-orange-400/20 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center space-y-8 border border-white/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full">
              <GiftIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              পুরস্কার
            </h2>
          </motion.div>

          {/* Amount */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-4"
          >
            <p className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-2">
              ৳{giftData.amount.toLocaleString()}
            </p>

            <div className="flex items-center justify-center gap-8 text-lg text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-orange-600">
                  {giftData.dayLength} দিন
                </span>
              </div>

              <div className="w-px h-6 bg-gray-300"></div>

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-orange-600">
                  প্রতিদিন ৳{giftData.dailyGift}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            className="flex justify-center gap-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-orange-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Gift;

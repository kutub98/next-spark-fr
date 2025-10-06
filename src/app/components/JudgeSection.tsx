// // "use client";

// // import Image from "next/image";
// // import { motion } from "framer-motion";

// // interface Judge {
// //   name: string;
// //   title: string;
// //   image: string;
// // }

// // const judges: Judge[] = [
// //   {
// //     name: "মো. সাইফুল ইসলাম",
// //     title: "সিনিয়র সাংবাদিক, স্মার্ট ভিলেজ",
// //     image: "/Asset/Judge/saiful.jpg",
// //   },
// //   {
// //     name: "সাবরিনা আহমেদ",
// //     title: "ডেপুটি এডিটর, স্মার্ট ভিলেজ",
// //     image: "/Asset/Judge/saiful.jpg",
// //   },
// //   {
// //     name: "রাফিদ হাসান",
// //     title: "প্রোগ্রাম কো-অর্ডিনেটর, স্মার্ট ভিলেজ",
// //     image: "/Asset/Judge/saiful.jpg",
// //   },
// // ];

// // export default function JudgeSection() {
// //   return (
// //     <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-100 py-20 px-4">
// //       <div className="max-w-6xl mx-auto text-center">
// //         <motion.h2
// //           initial={{ opacity: 0, y: -20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.6 }}
// //           className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4"
// //         >
// //           বিচারক প্যানেল
// //         </motion.h2>

// //         <motion.p
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           transition={{ delay: 0.2, duration: 0.6 }}
// //           className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-12"
// //         >
// //           এই কুইজ প্রতিযোগিতার বিচারক হিসেবে আছেন অভিজ্ঞ সাংবাদিক এবং সংগঠকগণ,
// //           যাঁরা নিরপেক্ষ ও স্বচ্ছ প্রক্রিয়ায় বিজয়ী নির্বাচন করবেন।
// //         </motion.p>

// //         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
// //           {judges.map((judge, index) => (
// //             <motion.div
// //               key={index}
// //               initial={{ opacity: 0, y: 30 }}
// //               whileInView={{ opacity: 1, y: 0 }}
// //               transition={{ delay: index * 0.1, duration: 0.5 }}
// //               viewport={{ once: true }}
// //               className="group bg-white rounded-2xl shadow-md hover:shadow-xl transform transition-all duration-300 hover:-translate-y-2 p-6 border border-orange-100"
// //             >
// //               <div className="relative w-28 h-28 mx-auto mb-4">
// //                 <Image
// //                   src={judge.image}
// //                   alt={judge.name}
// //                   fill
// //                   className="object-cover rounded-full border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
// //                 />
// //               </div>
// //               <h3 className="text-xl font-semibold text-gray-800 group-hover:text-orange-500 transition">
// //                 {judge.name}
// //               </h3>
// //               <p className="text-sm text-gray-500 mt-1">{judge.title}</p>
// //             </motion.div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Decorative line */}
// //       <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-lg" />
// //     </section>
// //   );
// // }

// "use client";

// import Image from "next/image";
// import { motion } from "framer-motion";

// interface Judge {
//   name: string;
//   title: string;
//   image: string;
// }

// export interface JudgeData {
//   panel: string;
//   description: string;
//   members: Judge[];
// }

// const judgesData: JudgeData = {
//   panel: "বিচারক প্যানেল",
//   description: `এই কুইজ প্রতিযোগিতার বিচারক হিসেবে আছেন অভিজ্ঞ সাংবাদিক এবং সংগঠকগণ,
// যাঁরা নিরপেক্ষ ও স্বচ্ছ প্রক্রিয়ায় বিজয়ী নির্বাচন করবেন।`,
//   members: [
//     {
//       name: "মো. সাইফুল ইসলাম",
//       title: "সিনিয়র সাংবাদিক, স্মার্ট ভিলেজ",
//       image: "/Asset/Judge/saiful.jpg",
//     },
//     {
//       name: "সাবরিনা আহমেদ",
//       title: "ডেপুটি এডিটর, স্মার্ট ভিলেজ",
//       image: "/Asset/Judge/sabrina.jpg",
//     },
//     {
//       name: "রাফিদ হাসান",
//       title: "প্রোগ্রাম কো-অর্ডিনেটর, স্মার্ট ভিলেজ",
//       image: "/Asset/Judge/rafid.jpg",
//     },
//   ],
// };

// export default function JudgeSection() {
//   return (
//     <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-100 py-20 px-4">
//       <div className="max-w-6xl mx-auto text-center">
//         <motion.h2
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4"
//         >
//           {judgesData.panel}
//         </motion.h2>

//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2, duration: 0.6 }}
//           className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-12"
//         >
//           {judgesData.description}
//         </motion.p>

//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
//           {judgesData.members.map((judge, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1, duration: 0.5 }}
//               viewport={{ once: true }}
//               className="group bg-white rounded-2xl shadow-md hover:shadow-xl transform transition-all duration-300 hover:-translate-y-2 p-6 border border-orange-100"
//             >
//               <div className="relative w-28 h-28 mx-auto mb-4">
//                 <Image
//                   src={judge.image}
//                   alt={judge.name}
//                   fill
//                   className="object-cover rounded-full border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
//                 />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-800 group-hover:text-orange-500 transition">
//                 {judge.name}
//               </h3>
//               <p className="text-sm text-gray-500 mt-1">{judge.title}</p>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Decorative line */}
//       <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-lg" />
//     </section>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { api } from "@/data/api";

interface Judge {
  name: string;
  designation: string; // API uses "designation" not "title"
  image: string;
}

interface JudgePanel {
  panel: string;
  description: string;
  members: Judge[];
}

export default function JudgeSection() {
  const [data, setData] = useState<JudgePanel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const res = await fetch(`${api}/judge`);
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setData(json.data[0]); // Show first judge panel (you can loop if multiple)
        }
      } catch (error) {
        console.error("Failed to fetch judges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJudges();
  }, []);

  if (loading) {
    return (
      <motion.section
        className="py-20 bg-gradient-to-br from-orange-50 via-white to-orange-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-12 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 shadow-lg animate-pulse"
              >
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  if (!data) {
    return (
      <motion.section
        className="py-20 bg-gradient-to-br from-orange-50 via-white to-orange-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-12">
            <p className="text-lg text-red-500">No judge data found.</p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="relative bg-gradient-to-br from-orange-50 via-white to-orange-100 py-20 px-4 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-yellow-50/50"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f25b29' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-orange-500 bg-clip-text text-transparent">
              {data.panel}
            </h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            {data.description}
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {data.members.map((judge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-white/20"
            >
              <motion.div
                className="relative w-32 h-32 mx-auto mb-6"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <Image
                  src={judge.image}
                  alt={judge.name}
                  fill
                  className="relative object-cover rounded-full border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
              </motion.div>

              <motion.h3
                className="text-xl font-bold text-gray-800 group-hover:text-orange-500 transition-colors duration-300 mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              >
                {judge.name}
              </motion.h3>

              <motion.p
                className="text-sm text-gray-600 font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
              >
                {judge.designation}
              </motion.p>

              {/* Decorative line */}
              <motion.div
                className="w-16 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mx-auto mt-4"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-t-lg" />
    </motion.section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import { Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Sponsor {
  _id: string;
  name: string;
  about: string;
  sponsoredImage?: string;
  premium?: boolean;
}

export default function SponsoredSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data: Sponsor[] = await getSponsors();
      setSponsors(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-10">
            Our Sponsors
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-items-center">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
          </div>
        </div>
      </section>
    );
  }

  if (sponsors.length === 0) {
    return (
      <section className="py-16 bg-gray-50 text-center">
        <Box size={64} className="mx-auto text-gray-300 mb-6" />
        <p className="text-xl text-gray-400 italic">No sponsors available.</p>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto text-center px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-gray-900 mb-12"
        >
          Sponsored By
        </motion.h2>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10 justify-items-center"
        >
          {sponsors.map((sponsor, i) => (
            <motion.div
              key={sponsor._id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{
                scale: 1.05,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="group relative flex flex-col items-center text-center space-y-3"
            >
              <div
                className={cn(
                  "relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-100 shadow-md transition-all duration-300",
                  sponsor.premium
                    ? "ring-4 ring-yellow-400 ring-offset-2"
                    : "ring-2 ring-gray-200"
                )}
              >
                {sponsor.sponsoredImage ? (
                  <Image
                    src={`http://localhost:5000/${sponsor.sponsoredImage.replace(
                      /\\/g,
                      "/"
                    )}`}
                    alt={sponsor.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <Box size={36} />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">
                  {sponsor.name}
                </h3>
                {sponsor.premium && (
                  <span className="text-xs font-medium text-yellow-600 block">
                    Premium Partner
                  </span>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-[-4rem] left-1/2 transform -translate-x-1/2 bg-white shadow-lg border rounded-lg p-3 w-48 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-all pointer-events-none"
              >
                {sponsor.about}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

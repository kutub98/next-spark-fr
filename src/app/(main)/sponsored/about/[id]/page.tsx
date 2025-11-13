import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";
// import { motion } from "framer-motion";
import { getSponsorById } from "@/app/(all-dashboard)/admin/sponsored-by/actions";
import { api } from "@/data/api";

interface Sponsor {
  _id: string;
  name: string;
  about: string;
  sponsoredImage?: string;
  website?: string;
  premium?: boolean;
}

// ✅ Fix: params is a Promise
export default async function SponsorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Await params before use
  const { id } = await params;
  const sponsor = await getSponsorById(id);

  if (!sponsor) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/sponsored" passHref>
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={18} /> Back to Sponsors
            </Button>
          </Link>
        </div>

        <div
          // initial={{ opacity: 0, y: 20 }}
          // animate={{ opacity: 1, y: 0 }}
          // transition={{ duration: 0.4 }}
          className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row"
        >
          <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
            {sponsor.sponsoredImage ? (
              <Image
                src={`${api}/${sponsor.sponsoredImage.replace(/\\/g, "/")}`}
                alt={sponsor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                <Globe size={48} />
              </div>
            )}
          </div>

          <div className="flex-1 p-8 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {sponsor.name}
              </h1>
              {sponsor.premium && (
                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Premium Partner
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
              {sponsor.about}
            </p>

            {sponsor.website && (
              <Link
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="flex items-center gap-2">
                  <Globe size={18} />
                  Visit Website
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

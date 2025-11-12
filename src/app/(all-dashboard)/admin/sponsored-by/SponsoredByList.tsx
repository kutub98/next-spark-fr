"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getSponsors, deleteSponsor } from "./actions";
import SponsoredByForm from "./SponsoredByForm";
import { toast } from "sonner";
import Image from "next/image";
import { Box, Trash2 } from "lucide-react";
import { api } from "@/data/api";

interface Sponsor {
  _id: string;
  name: string;
  about: string;
  sponsoredImage?: string;
  premium?: boolean;
}

export default function SponsoredByList() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
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

  const handleDelete = async (id: string) => {
    setDeletingId(null);
    // Optimistic update
    setSponsors((prev) => prev.filter((s) => s._id !== id));
    try {
      await deleteSponsor(id);
      toast.success("Sponsor deleted successfully!");
    } catch {
      toast.error("Failed to delete sponsor.");
      loadData(); // rollback if failed
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-extrabold text-gray-900">Sponsored By</h2>
        <SponsoredByForm onSuccess={loadData} />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-60 bg-gray-100 animate-pulse rounded-xl"
              />
            ))}
        </div>
      ) : sponsors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28">
          <Box size={64} className="text-gray-300 mb-6" />
          <p className="text-xl text-gray-400 italic">No sponsors available.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          <AnimatePresence>
            {sponsors.map((sponsor) => (
              <motion.div
                key={sponsor._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0px 12px 24px rgba(0,0,0,0.15)",
                }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="relative w-full h-44 sm:h-52 md:h-56 bg-gray-100">
                  {sponsor.sponsoredImage ? (
                    <Image
                      src={`${api}/${sponsor.sponsoredImage.replace(
                        /\\/g,
                        "/"
                      )}`}
                      alt={sponsor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <Box size={48} />
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sponsor.name}
                    </h3>
                    {sponsor.premium && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 flex-1 line-clamp-3">
                    {sponsor.about}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <SponsoredByForm sponsor={sponsor} onSuccess={loadData} />
                    <Button
                      variant="destructive"
                      size="sm"
                      aria-label={`Delete sponsor ${sponsor.name}`}
                      className="flex items-center gap-1"
                      onClick={() => setDeletingId(sponsor._id)}
                    >
                      <Trash2 size={16} /> Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Modal */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sponsor? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { toast } from "sonner";
import { getOffer, type Offer, deleteOffer } from "../../../../lib/api/Offer";
import UpdateOfferDialog from "./_components/update";
import Image from "next/image";
import CreateOfferDialog from "./_components/create";

export default function OfferList() {
  const [offer, setOffer] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getOffer();
      setOffer(res.data);
    } catch (error) {
      console.error("Failed to fetch offer", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(offer, "offer");

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this banner?"
    );
    if (!confirmDelete) return;

    try {
      await deleteOffer(id);
      toast.success("Banner deleted successfully.");
      setOffer((prev) => prev.filter((b) => b._id !== id));
    } catch (error) {
      console.error("Failed to delete banner", error);
      toast.error("Failed to delete banner.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Offer</h2>
        <CreateOfferDialog onChange={fetchData} length={offer.length} />
      </div>

      {loading ? (
        <p className="text-gray-600">Loading offer...</p>
      ) : offer.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-gray-50">
          <p className="text-gray-500 mb-4 bg-orange-600">No offer found.</p>
          <Button
            onClick={() => router.push("/dashboard/appearance/offer/create")}
          >
            Create a offer
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offer.map((banner) => (
            <div
              key={banner._id}
              className="rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all bg-white"
            >
              <Image
                src={banner.img}
                alt={"offerImg"}
                height={300}
                width={300}
                className="h-48 w-full object-cover"
              />
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold">{banner?.amount}</h3>
                <p className="text-sm text-gray-600">{banner?.dailyGift}</p>

                <p className="text-xs text-gray-400">
                  Status: {banner?.dayLength}
                </p>

                <div className="flex justify-end gap-2 mt-2">
                  <UpdateOfferDialog banner={banner} onChange={fetchData} />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(banner._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

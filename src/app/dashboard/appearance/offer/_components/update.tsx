"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUploader } from "@/app/dashboard/_components/image-upload";
import type { Offer } from "@/lib/api/Offer";
import { updateOffer } from "../../../../../lib/api/Offer";
type OfferFormValues = {
  amount: number;
  dailyGift: number;
  dayLength: number;
  status: "approved" | "pending" | "delete";
  image: string;
};

type UpdateBannerDialogProps = {
  banner: Offer;
  onChange: () => Promise<void>;
};

export default function UpdateOfferDialog({
  banner,
  onChange,
}: UpdateBannerDialogProps) {
  const [open, setOpen] = useState(false);

  const methods = useForm<OfferFormValues>({
    defaultValues: {
      amount: banner.amount || 0,
      dailyGift: banner.dailyGift || 0,
      dayLength: banner.dayLength || 0,
      status: banner.status || "approved",
      image: banner.img || "",
    },
  });

  const onSubmit = async (data: OfferFormValues) => {
    try {
      const payload: Offer = {
        ...banner,
        amount: Number(data.amount),
        dailyGift: Number(data.dailyGift),
        dayLength: Number(data.dayLength),
        status: data?.status,
        img: data.image,
      };

      const res = await updateOffer(banner._id, payload);
      if (res.success === true) {
        await onChange?.();
        toast.success("Offer updated successfully!");
        setOpen(false);
      }
    } catch (error) {
      toast.error("Update failed");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-5xl mx-auto "
        style={{ width: "90vw", maxWidth: "50rem" }}
      >
        <DialogTitle className="text-xl font-semibold text-gray-800 mb-2">
          Edit Offer
        </DialogTitle>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
          >
            {/* Left Column: Text Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <Input
                  {...methods.register("amount")}
                  placeholder="Enter Amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day Length
                </label>
                <Input
                  {...methods.register("dayLength")}
                  placeholder="Enter Day length"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Gift
                </label>
                <Input
                  {...methods.register("dailyGift")}
                  placeholder="Enter Daily Gift"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...methods.register("status")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
            </div>

            {/* Right Column: Image Uploader */}
            <div className="space-y-2">
              <ImageUploader name="image" />
            </div>

            {/* Submit Button Full Width */}
            <div className="md:col-span-2 flex justify-end ">
              <Button type="submit" className="w-full md:w-auto bg-orange-600">
                Update Banner
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

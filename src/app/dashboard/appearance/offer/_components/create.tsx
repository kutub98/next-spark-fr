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
import { toast } from "sonner";
import { useState } from "react";
import { ImageUploader } from "@/app/dashboard/_components/image-upload";
import { createOffer } from "@/lib/api/Offer";
import type { Offer } from "@/lib/api/Offer";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const offerFormSchema = z.object({
  amount: z.number().min(1, "Amount is required"),
  dailyGift: z.number().min(1, "Daily gift is required"),
  dayLength: z.number().min(1, "Day length is required"),
  status: z.enum(["approved", "pending", "delete"]),
  image: z.string().url("Must be a valid image URL"),
});

type OfferFormValues = z.infer<typeof offerFormSchema>;

type CreateOfferDialogProps = {
  length: number;
  onChange: () => Promise<void>;
};

export default function CreateOfferDialog({
  length,
  onChange,
}: CreateOfferDialogProps) {
  const [open, setOpen] = useState(false);

  const methods = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      amount: 0,
      dailyGift: 0,
      dayLength: 0,
      status: "approved",
      image: "",
    },
  });

  const onSubmit = async (data: OfferFormValues) => {
    try {
      const payload: Offer = {
        _id: "", 
        img: data.image,
        amount: Number(data.amount),
        dailyGift: Number(data.dailyGift),
        dayLength: Number(data.dayLength),
        status: data.status,
        __v: 0,
      };

      const res = await createOffer(payload);

      if (res.success) {
        await onChange?.();
        toast.success("Offer created successfully!");
        setOpen(false);
        methods.reset();
      }
    } catch (error) {
      toast.error("Creation failed");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={length === 1}
          variant="outline"
          className={length === 1 ? " cursor-none" : "text-white bg-orange-600"}
          title={length === 1 ? "Can't add" : undefined}
        >
          Create Offer
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-5xl mx-auto"
        style={{ width: "90vw", maxWidth: "50rem" }}
      >
        <DialogTitle className="text-xl font-semibold text-gray-800 mb-2">
          Create Offer
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
                  {...methods.register("amount", { valueAsNumber: true })}
                  placeholder="Enter Amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day Length
                </label>
                <Input
                  {...methods.register("dayLength", { valueAsNumber: true })}
                  placeholder="Enter Day Length"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Gift
                </label>
                <Input
                  {...methods.register("dailyGift", { valueAsNumber: true })}
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
                  <option value="delete">Deleted</option>
                </select>
              </div>
            </div>

            {/* Right Column: Image Uploader */}
            <div className="space-y-2">
              <ImageUploader name="image" />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="w-full md:w-auto bg-orange-600">
                Create Offer
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

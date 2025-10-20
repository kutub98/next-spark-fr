

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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { updateBanner, type BannerPayload } from "@/lib/api/banner";
import { Banner } from "@/types/Banner";
import { toast } from "sonner";
import { ImageUploader } from "@/app/dashboard/_components/image-upload";

type UpdateBannerDialogProps = {
  banner: Banner;
  onChange: () => Promise<void>;
};

export default function UpdateBannerDialog({
  banner,
  onChange,
}: UpdateBannerDialogProps) {
  const [open, setOpen] = useState(false);

  const methods = useForm({
    defaultValues: {
      title: banner.title || "",
      description: banner.description || "",
      buttonText: banner.buttonText || "",
      status: banner.status || "active",
      image: banner.image || "",
    },
  });

  const onSubmit = async (data: BannerPayload) => {
    try {
      await updateBanner(banner._id, data);
      toast.success("Banner updated successfully!");
      await onChange();
      setOpen(false);
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
          Edit Banner
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
                  Title
                </label>
                <Input
                  {...methods.register("title")}
                  placeholder="Enter banner title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  {...methods.register("description")}
                  placeholder="Enter banner description"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Text
                </label>
                <Input
                  {...methods.register("buttonText")}
                  placeholder="Enter button text"
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

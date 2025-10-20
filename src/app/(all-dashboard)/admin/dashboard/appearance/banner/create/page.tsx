"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  bannerSchema,
  createBanner,
  type BannerPayload,
} from "@/lib/api/banner";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/app/dashboard/_components/image-upload";

const BannerForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<BannerPayload>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      buttonText: "",
      status: "approved",
    },
  });

  const onSubmit = async (data: BannerPayload) => {
    setLoading(true);
    try {
      const response = await createBanner(data);
      if (response.success) {
        toast.success(response.message || "Banner created");
        form.reset();
        router.push("/dashboard/appearance/banner");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl px-8 py-12 sm:px-10 sm:py-14 md:px-16 md:py-16 lg:grid lg:grid-cols-2 gap-12"
      >
        {/* Left - Form Fields */}
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-bold text-gray-800">
                  Title
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Banner title"
                    {...field}
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xl font-bold text-gray-800">
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Short banner text"
                    {...field}
                    rows={4}
                    className="border border-gray-300 rounded-lg px-4 py-3 resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm mt-1" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="buttonText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-bold text-gray-800">
                    Button Text
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Click Me"
                      {...field}
                      className="border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-bold text-gray-800">
                    Status
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border border-gray-300 rounded-lg px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 transition">
                        <SelectValue placeholder="Select status" />{" "}

                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-50 bg-white border border-gray-200 rounded-md shadow-md">
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage className="text-red-500 text-sm mt-1" />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-6 w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg px-6 py-3 transition-transform transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Create Banner"}
          </Button>
        </div>

        {/* Right - Image Upload Section */}
        <div className="flex flex-col items-center justify-center text-center space-y-6 p-4 sm:p-6 lg:p-8 border rounded-2xl bg-gray-50 shadow-inner">
          <h3 className="text-2xl font-bold text-orange-600">
            Upload Banner Image
          </h3>
          <ImageUploader name="image" label="Choose Image" />
        </div>
      </form>
    </Form>
  );
};

export default BannerForm;

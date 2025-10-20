"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

type Props = {
  name: string;
  label?: string;
};

const IMGBB_API_KEY = "4c7e773ceec6622d7f2c91c17d0e0b71"; // 🔐 Replace with your real key

export const ImageUploader = ({ name, label = "Upload Image" }: Props) => {
  const { control, setValue, watch } = useFormContext();
  const imageUrl = watch(name);
  const [preview, setPreview] = useState<string | null>(imageUrl || null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data?.success && data.data?.url) {
        const uploadedUrl = data.data.url;
        setValue(name, uploadedUrl, { shouldValidate: true });
        toast.success("Image uploaded!");
        setPreview(uploadedUrl);
      } else {
        console.error("Upload failed:", data);
        alert("Image upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during image upload.");
    }

    setUploading(false);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ fieldState }) => (
        <div className="space-y-2 w-full">
          <label className="block text-sm font-medium">{label}</label>

          {preview && (
            <div className="relative w-full h-32 rounded border overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />

          {uploading && (
            <Button variant="ghost" size="sm" disabled>
              <UploadCloud className="w-4 h-4 mr-2" /> Uploading...
            </Button>
          )}

          {fieldState.error && (
            <p className="text-sm text-red-500">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
};

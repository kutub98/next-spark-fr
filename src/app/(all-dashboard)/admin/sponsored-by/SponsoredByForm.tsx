/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSponsor, updateSponsor } from "./actions";
import { toast } from "sonner";

export default function SponsoredByForm({
  onSuccess,
  sponsor,
}: {
  onSuccess: () => void;
  sponsor?: any;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: sponsor?.name || "",
    about: sponsor?.about || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use FormData to send file
      const data = new FormData();
      data.append("name", formData.name);
      data.append("about", formData.about);
      if (imageFile) data.append("sponsoredImage", imageFile);

      if (sponsor?._id) {
        await updateSponsor(sponsor._id, data);
        toast.success("Sponsored updated Successfully");
      } else {
        await createSponsor(data);
        toast.success("Sponsored Created Successfully");
      }

      onSuccess();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {sponsor ? (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        ) : (
          <Button>Create Sponsor</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {sponsor ? "Edit Sponsor" : "Create Sponsor"}
          </DialogTitle>
        </DialogHeader>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>About</Label>
            <Textarea
              value={formData.about}
              onChange={(e) =>
                setFormData({ ...formData, about: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            {sponsor?.image && !imageFile && (
              <img
                src={`/${sponsor.image}`}
                alt={sponsor.name}
                className="mt-2 w-32 h-32 object-cover"
              />
            )}
            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover"
              />
            )}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}

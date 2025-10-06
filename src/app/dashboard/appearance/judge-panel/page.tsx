"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageUploader } from "../../_components/image-upload";
import { api } from "@/data/api";
import { Plus, Trash2 } from "lucide-react";

// ✅ Zod Schema
const judgeSchema = z.object({
  panel: z.string().min(1, "Panel name is required"),
  description: z.string().min(1, "Description is required"),
  members: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        designation: z.string().min(1, "Designation is required"),
        image: z.string().url("Valid image URL required"),
      })
    )
    .min(1, "At least one member is required"),
});
export type JudgeFormValues = z.infer<typeof judgeSchema>;

export default function JudgeForm() {
  const [existingId, setExistingId] = useState<string | null>(null);

  const methods = useForm({
    resolver: zodResolver(judgeSchema),
    defaultValues: {
      panel: "",
      description: "",
      members: [{ name: "", designation: "", image: "" }],
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { isSubmitting },
  } = methods;

  // ✅ useFieldArray for dynamic members
  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });

  // ✅ Fetch existing judge data
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${api}/judge`);
      const data = await res.json();
      if (data?.data?.length) {
        const judge = data.data[0];
        setExistingId(judge._id);
        reset(judge);
      }
    };
    fetchData();
  }, [reset]);

  // ✅ Submit
  const onSubmit = async (formData: JudgeFormValues) => {
    const url = existingId ? `${api}/judge/${existingId}` : `${api}/judge`;
    const method = existingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.success) {
      toast.success(
        existingId ? "Updated successfully" : "Created successfully"
      );
      if (!existingId) setExistingId(data.data._id);
    } else {
      toast.error("Something went wrong");
    }
  };

  // ✅ Delete
  const handleDelete = async () => {
    if (!existingId) return;
    const res = await fetch(`${api}/judge/${existingId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Deleted successfully");
      setExistingId(null);
      reset();
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-7xl mx-auto p-6 space-y-6 border rounded-xl shadow bg-white"
      >
        {/* Panel */}
        <div>
          <label className="font-semibold block mb-1">Panel Title</label>
          <Input {...register("panel")} placeholder="বিচারক প্যানেল" />
        </div>

        {/* Description */}
        <div>
          <label className="font-semibold block mb-1">Description</label>
          <Input {...register("description")} placeholder="প্যানেল বর্ণনা" />
        </div>

        {/* Members */}
        <div className="space-y-4 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative  border p-4 rounded-md bg-gray-50 space-y-2"
            >
              <div className="flex flex-col gap-2 justify-center text-center">
                <ImageUploader name={`members.${index}.image`} />
                <Input
                  {...register(`members.${index}.name`)}
                  placeholder="Name"
                />
                <Input
                  {...register(`members.${index}.designation`)}
                  placeholder="Designation"
                />
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute top-2 right-2 text-red-500"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {/* Add Member */}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ name: "", designation: "", image: "" })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {existingId ? "Update" : "Create"}
          </Button>
          {existingId && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

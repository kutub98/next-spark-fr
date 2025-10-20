

"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { api } from "@/data/api";

const apiUrl = `${api}/time-instruction`;

// Schema update: points is now array of objects
const sectionSchema = z.object({
  title: z.string().min(1, "Required"),
  points: z.array(z.object({ value: z.string().min(1, "Required") })),
  bgColor: z.string().min(1, "Required"),
  textColor: z.string().min(1, "Required"),
});

const formSchema = z.object({
  timeline: sectionSchema,
  instructions: sectionSchema,
});

type FormData = z.infer<typeof formSchema>;

export default function QuizDataForm() {
  const [existingId, setExistingId] = useState<string | null>(null);

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeline: {
        title: "",
        points: [{ value: "" }],
        bgColor: "#ffffff",
        textColor: "#000000",
      },
      instructions: {
        title: "",
        points: [{ value: "" }],
        bgColor: "#ffffff",
        textColor: "#000000",
      },
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { isSubmitting },
  } = methods;

  const timelinePoints = useFieldArray({ control, name: "timeline.points" });
  const instructionPoints = useFieldArray({
    control,
    name: "instructions.points",
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(apiUrl);
      const data = await res.json();
      if (data?.data?.length === 1) {
        const existing = data.data[0];

        // Convert string[] to { value: string }[] if needed
        const transformed = {
          ...existing,
          timeline: {
            ...existing.timeline,
            points: existing.timeline.points.map((p: string) => ({ value: p })),
          },
          instructions: {
            ...existing.instructions,
            points: existing.instructions.points.map((p: string) => ({
              value: p,
            })),
          },
        };

        setExistingId(existing._id);
        reset(transformed);
      }
    };
    fetchData();
  }, [reset]);

  const onSubmit = async (formData: FormData) => {
    const url = existingId ? `${apiUrl}/${existingId}` : apiUrl;
    const method = existingId ? "PATCH" : "POST";

    // Convert points array to string[] before sending
    const preparedData = {
      ...formData,
      timeline: {
        ...formData.timeline,
        points: formData.timeline.points.map((p) => p.value),
      },
      instructions: {
        ...formData.instructions,
        points: formData.instructions.points.map((p) => p.value),
      },
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preparedData),
    });

    const result = await res.json();

    if (result?.success) {
      toast.success(
        existingId ? "Updated successfully" : "Created successfully"
      );
      if (!existingId) setExistingId(result.data._id);
    } else {
      toast.error("Operation failed");
      console.error("Error:", result);
    }
  };

  const handleDelete = async () => {
    if (!existingId) return;
    const res = await fetch(`${apiUrl}/${existingId}`, { method: "DELETE" });
    const result = await res.json();
    if (result?.success) {
      toast.success("Deleted successfully");
      setExistingId(null);
      reset({
        timeline: {
          title: "",
          points: [{ value: "" }],
          bgColor: "#ffffff",
          textColor: "#000000",
        },
        instructions: {
          title: "",
          points: [{ value: "" }],
          bgColor: "#ffffff",
          textColor: "#000000",
        },
      });
    } else {
      toast.error("Delete failed");
      console.error("Delete error:", result);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 w-full mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 space-y-3">
          {/* Timeline Section */}
          <div className="border p-4 rounded-md space-y-3">
            <h2 className="text-lg font-semibold mb-2">Timeline</h2>
            <div>
              <Label>Title</Label>
              <Input {...register("timeline.title")} />
            </div>
            <div className="flex gap-4">
              <div>
                <Label>Background Color</Label>
                <Input type="color" {...register("timeline.bgColor")} />
              </div>
              <div>
                <Label>Text Color</Label>
                <Input type="color" {...register("timeline.textColor")} />
              </div>
            </div>
            <div>
              <Label>Points</Label>
              {timelinePoints.fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 my-1">
                  <Input {...register(`timeline.points.${index}.value`)} />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => timelinePoints.remove(index)}
                    disabled={timelinePoints.fields.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => timelinePoints.append({ value: "" })}
              >
                Add Point
              </Button>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="border p-4 rounded-md space-y-3">
            <h2 className="text-lg font-semibold mb-2">Instructions</h2>
            <div>
              <Label>Title</Label>
              <Input {...register("instructions.title")} />
            </div>
            <div className="flex gap-4">
              <div>
                <Label>Background Color</Label>
                <Input type="color" {...register("instructions.bgColor")} />
              </div>
              <div>
                <Label>Text Color</Label>
                <Input type="color" {...register("instructions.textColor")} />
              </div>
            </div>
            <div>
              <Label>Points</Label>
              {instructionPoints.fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 my-1">
                  <Input {...register(`instructions.points.${index}.value`)} />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => instructionPoints.remove(index)}
                    disabled={instructionPoints.fields.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => instructionPoints.append({ value: "" })}
              >
                Add Point
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          {!existingId ? (
            <Button type="submit" disabled={isSubmitting}>
              Create
            </Button>
          ) : (
            <>
              <Button type="submit" disabled={isSubmitting}>
                Update
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

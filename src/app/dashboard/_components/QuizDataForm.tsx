"use client";

import { useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
  FieldArrayPath,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CustomEditor from "./Editor";
import { ImageUploader } from "./image-upload";
import { Plus, X } from "lucide-react";
import { api } from "@/data/api";

// Validation Schema
const formSchema = z.object({
  quizInfo: z.object({
    title: z.string().min(1, "Quiz title is required"),
    description: z.string().min(1, "Quiz description is required"),
  }),
  competitionDetails: z.object({
    title: z.string().min(1, "Competition title is required"),
    description: z.string().min(1, "Competition description is required"),
    icon: z.string().url("Must be a valid image URL").optional(),
  }),
  rules: z.object({
    title: z.string().min(1, "Rules title is required"),
    items: z
      .array(z.string().min(1, "Rule cannot be empty"))
      .min(1, "At least one rule is required"),
  }),
});

type IQuizData = z.infer<typeof formSchema>;

export default function QuizForm() {
  const [dataId, setDataId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const methods = useForm<IQuizData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quizInfo: { title: "", description: "" },
      competitionDetails: { title: "", description: "", icon: "" },
      rules: { title: "", items: [""] },
    },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray<IQuizData>({
    control,
    name: "rules.items" as FieldArrayPath<IQuizData>,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${api}/quiz-data`);
        const json = await res.json();
        if (res.ok && Array.isArray(json.data) && json.data.length > 0) {
          const obj = json.data[0];
          setDataId(obj._id);
          reset({
            quizInfo: {
              title: obj.quizInfo.title,
              description: obj.quizInfo.description,
            },
            competitionDetails: {
              title: obj.competitionDetails.title,
              description: obj.competitionDetails.description,
              icon: obj.competitionDetails.icon,
            },
            rules: {
              title: obj.rules.title,
              items: obj.rules.items.length ? obj.rules.items : [""],
            },
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load existing data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [reset]);

  const onCreate = async (data: IQuizData) => {
    try {
      const res = await fetch(`${api}/quizData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || "Created successfully");
        setDataId(json.data?._id ?? null);
        reset(data);
      } else {
        toast.error(json.message || "Creation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Creation error");
    }
  };

  const onUpdate = async (data: IQuizData) => {
    if (!dataId) return;
    try {
      const res = await fetch(`${api}/quizData/${dataId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Updated successfully");
        reset(data);
      } else {
        toast.error(json.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Update error");
    }
  };

  const onDelete = async () => {
    if (!dataId) return;
    try {
      const res = await fetch(`${api}/quizData/${dataId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Deleted successfully");
        setDataId(null);
        reset({
          quizInfo: { title: "", description: "" },
          competitionDetails: { title: "", description: "", icon: "" },
          rules: { title: "", items: [""] },
        });
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete error");
    }
  };

  if (loading)
    return (
      <p className="text-center py-10 text-muted-foreground">Loading...</p>
    );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(dataId ? onUpdate : onCreate)}
        className="max-w-4xl mx-auto px-4 sm:px-8 py-10 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-10"
        noValidate
      >
        {/* Section: Quiz Info */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
            Quiz Info
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <Label htmlFor="quizInfo.title">Title</Label>
              <Input
                id="quizInfo.title"
                placeholder="Enter quiz title"
                {...register("quizInfo.title")}
              />
              {errors.quizInfo?.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.quizInfo.title.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="quizInfo.description">Description</Label>
              <CustomEditor
                value={watch("quizInfo.description")}
                onChange={(val) =>
                  setValue("quizInfo.description", val, {
                    shouldValidate: true,
                  })
                }
                placeholder="Enter quiz description"
              />
              {errors.quizInfo?.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.quizInfo.description.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section: Competition Details */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
            Competition Details
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-4">
              <Label htmlFor="competitionDetails.title">Title</Label>
              <Input
                id="competitionDetails.title"
                placeholder="Enter competition title"
                {...register("competitionDetails.title")}
              />
              {errors.competitionDetails?.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.competitionDetails.title.message}
                </p>
              )}

              <Label htmlFor="competitionDetails.description">
                Description
              </Label>
              <CustomEditor
                value={watch("competitionDetails.description")}
                onChange={(val) =>
                  setValue("competitionDetails.description", val, {
                    shouldValidate: true,
                  })
                }
                placeholder="Enter competition description"
              />
              {errors.competitionDetails?.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.competitionDetails.description.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-1">
              <ImageUploader
                name="competitionDetails.icon"
                label="Competition Icon"
              />
              {errors.competitionDetails?.icon && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.competitionDetails.icon.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section: Rules */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
            Rules
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rules.title">Rules Title</Label>
              <Input
                id="rules.title"
                placeholder="Enter rules title"
                {...register("rules.title")}
              />
              {errors.rules?.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.rules.title.message}
                </p>
              )}
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <Textarea
                  {...register(`rules.items.${index}` as const)}
                  placeholder={`Rule #${index + 1}`}
                  className="flex-1"
                />
                <div className="flex items-start gap-4">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                    className="mt-1"
                  >
                    <X /> Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={() => append("")} variant="outline">
              <Plus /> Add Rule
            </Button>

            {Array.isArray(errors.rules?.items) &&
              errors.rules.items.map(
                (error, idx) =>
                  error && (
                    <p key={idx} className="text-sm text-red-600">
                      Rule {idx + 1}: {error.message}
                    </p>
                  )
              )}
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-4 pt-4 border-t mt-6">
          {!dataId ? (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Quiz"}
            </Button>
          ) : (
            <>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Quiz"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                Delete Quiz
              </Button>
            </>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

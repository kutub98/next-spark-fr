"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, X } from "lucide-react";
import CustomEditor from "../_components/custom-editor";
import { ImageUploader } from "@/app/dashboard/_components/image-upload"; // Adjust the import path as needed

// Schema
const questionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  solutionType: z.enum(["text", "image"]).refine((val) => val !== undefined, {
    message: "Solution type is required",
  }),
  solutionText: z.string().optional(),
  solutionImage: z.string().optional(),
});

const quizSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function QuizForm() {
  const [collapsedQuestions, setCollapsedQuestions] = React.useState<string[]>(
    []
  );

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      questions: [
        {
          title: "",
          solutionType: "text",
          solutionText: "",
          solutionImage: "",
        },
      ],
    },
    mode: "onChange", // Real-time validation
  });

  const { control, handleSubmit, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = async (data: QuizFormValues) => {
    try {
      console.log("Quiz Data:", data);
      toast.success("Quiz saved successfully!", { duration: 3000 });
    } catch {
      toast.error("Failed to save quiz. Please try again.");
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quiz Builder</h1>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence>
            {fields.map((field, index) => {
              const solutionType = watch(`questions.${index}.solutionType`) as
                | "text"
                | "image";
              const isCollapsed = collapsedQuestions.includes(field.id);

              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-4 border border-gray-200 rounded-lg">
                    <CardHeader className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-700">
                        Question {index + 1}
                      </h2>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => toggleCollapse(field.id)}
                        >
                          {isCollapsed ? (
                            <Plus className="h-4 w-4" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {!isCollapsed && (
                      <CardContent className="space-y-6">
                        {/* Title */}
                        <FormField
                          control={control}
                          name={`questions.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-600">
                                Title *
                              </FormLabel>
                              <FormControl>
                                <CustomEditor
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  placeholder="Enter question text"
                                  height="auto"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Solution Type */}
                        <FormField
                          control={control}
                          name={`questions.${index}.solutionType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-600">
                                Solution Type *
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  value={field.value}
                                  onValueChange={(val: "text" | "image") => {
                                    setValue(
                                      `questions.${index}.solutionType`,
                                      val
                                    );
                                    if (val === "image")
                                      setValue(
                                        `questions.${index}.solutionText`,
                                        ""
                                      );
                                    else
                                      setValue(
                                        `questions.${index}.solutionImage`,
                                        ""
                                      );
                                  }}
                                  className="flex space-x-4"
                                >
                                  <div className="flex items-center">
                                    <RadioGroupItem value="text" />
                                    <span className="ml-2">Text</span>
                                  </div>
                                  <div className="flex items-center">
                                    <RadioGroupItem value="image" />
                                    <span className="ml-2">Image</span>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Solution Text */}
                        {solutionType === "text" && (
                          <FormField
                            control={control}
                            name={`questions.${index}.solutionText`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-600">
                                  Solution Text *
                                </FormLabel>
                                <FormControl>
                                  <CustomEditor
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    placeholder="Enter solution text"
                                    height="auto"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        {/* Solution Image */}
                        {solutionType === "image" && (
                          <FormField
                            control={control}
                            name={`questions.${index}.solutionImage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-600">
                                  Solution Image
                                </FormLabel>
                                <FormControl>
                                  <ImageUploader
                                    name={`questions.${index}.solutionImage`}
                                    label="Upload Solution Image"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  title: "",
                  solutionType: "text",
                  solutionText: "",
                  solutionImage: "",
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Saving..." : "Save Quiz"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

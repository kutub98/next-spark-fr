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
import { Minus, Plus, X } from "lucide-react";
import CustomEditor from "../_components/custom-editor";
import { Input } from "@/components/ui/input";

// Schema
const questionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  passage: z.string().min(1, "Passage is required"),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1, "Question text is required"),
        marks: z.number().min(1, "Marks must be at least 1").optional(),
      })
    )
    .min(1, "At least one question is required for each passage"),
});

const quizSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "At least one passage with questions is required"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function WrittenQuizForm() {
  const [collapsedQuestions, setCollapsedQuestions] = React.useState<string[]>(
    []
  );

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      questions: [
        {
          title: "",
          passage: "",
          questions: [{ questionText: "", marks: 0 }],
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
      console.log("Written Quiz Data:", data);
      toast.success("Written quiz saved successfully!", { duration: 3000 });
    } catch {
      toast.error("Failed to save quiz. Please try again.");
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const appendQuestion = (passageIndex: number) => {
    setValue(`questions.${passageIndex}.questions`, [
      ...watch(`questions.${passageIndex}.questions`),
      { questionText: "", marks: 0 },
    ]);
  };

  const removeQuestion = (passageIndex: number, questionIndex: number) => {
    const currentQuestions = watch(`questions.${passageIndex}.questions`);
    if (currentQuestions.length > 1) {
      const updatedQuestions = currentQuestions.filter(
        (_, idx) => idx !== questionIndex
      );
      setValue(`questions.${passageIndex}.questions`, updatedQuestions);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Written Quiz Builder
      </h1>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence>
            {fields.map((field, passageIndex) => {
              const isCollapsed = collapsedQuestions.includes(field.id);
              const passageQuestions = watch(
                `questions.${passageIndex}.questions`
              );

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
                        Passage {passageIndex + 1}
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
                          onClick={() => remove(passageIndex)}
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
                          name={`questions.${passageIndex}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-600">
                                Title *
                              </FormLabel>
                              <FormControl>
                                <CustomEditor
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  placeholder="Enter passage title"
                                  height="auto"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Passage */}
                        <FormField
                          control={control}
                          name={`questions.${passageIndex}.passage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-600">
                                Passage *
                              </FormLabel>
                              <FormControl>
                                <CustomEditor
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  placeholder="Enter passage text"
                                  height="auto"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Questions */}
                        {passageQuestions.map((question, questionIndex) => (
                          <div
                            key={questionIndex}
                            className="border p-4 rounded-md"
                          >
                            <FormField
                              control={control}
                              name={`questions.${passageIndex}.questions.${questionIndex}.questionText`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex justify-between items-center">
                                    <FormLabel className="text-gray-600">
                                      Question {questionIndex + 1} *
                                    </FormLabel>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        removeQuestion(
                                          passageIndex,
                                          questionIndex
                                        )
                                      }
                                      disabled={passageQuestions.length <= 1}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <FormControl>
                                    <CustomEditor
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      placeholder={`Enter question ${
                                        questionIndex + 1
                                      } text`}
                                      height="auto"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {/* Marks */}
                            <FormField
                              control={control}
                              name={`questions.${passageIndex}.questions.${questionIndex}.marks`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-600">
                                    Marks
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                      placeholder="Enter marks (optional)"
                                      className="w-full"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => appendQuestion(passageIndex)}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
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
                  passage: "",
                  questions: [{ questionText: "", marks: 0 }],
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Passage
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Saving..." : "Save Written Quiz"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, Eye, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomEditor from "../_components/custom-editor";

// Schema
const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least two options are required"),
  correctAnswer: z.string().min(1, "Select a correct answer"),
  solution: z.string().min(1, "Solution is required"),
});

const quizSchema = z.object({
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function QuizForm() {
  const [previewMode, setPreviewMode] = React.useState(false);
  const [collapsedQuestions, setCollapsedQuestions] = React.useState<string[]>(
    []
  );

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      questions: [
        {
          questionText: "",
          options: ["", ""],
          correctAnswer: "",
          solution: "",
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quiz Builder</h1>
        <Button
          variant="outline"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          {previewMode ? "Edit Mode" : "Preview Mode"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence>
            {fields.map((field, index) => {
              const options = watch(`questions.${index}.options`);
              const correctAnswer = watch(`questions.${index}.correctAnswer`);
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
                    {!isCollapsed && !previewMode && (
                      <CardContent
                        className="space-y-6"
                        style={{ minHeight: "0", padding: "0" }}
                      >
                        {/* Question */}
                        <FormField
                          control={control}
                          name={`questions.${index}.questionText`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-600">
                                Question *
                              </FormLabel>
                              <FormControl>
                                <CustomEditor
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Enter question text"
                                  height="auto"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Options */}
                        <FormItem>
                          <FormLabel className="text-gray-600">
                            Options *
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              value={correctAnswer}
                              onValueChange={(val) =>
                                setValue(
                                  `questions.${index}.correctAnswer`,
                                  val
                                )
                              }
                              className="space-y-2"
                            >
                              {options.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-md"
                                >
                                  <RadioGroupItem
                                    value={opt}
                                    className="text-orange-600 border-orange-600"
                                  />
                                  <Input
                                    value={opt}
                                    onChange={(e) => {
                                      const newOptions = [...options];
                                      newOptions[optIdx] = e.target.value;
                                      setValue(
                                        `questions.${index}.options`,
                                        newOptions
                                      );
                                    }}
                                    placeholder={`Option ${optIdx + 1}`}
                                    className="flex-1"
                                  />
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => {
                                            const newOptions = options.filter(
                                              (_, i) => i !== optIdx
                                            );
                                            setValue(
                                              `questions.${index}.options`,
                                              newOptions
                                            );
                                            if (correctAnswer === opt) {
                                              setValue(
                                                `questions.${index}.correctAnswer`,
                                                ""
                                              );
                                            }
                                          }}
                                          disabled={options.length <= 2}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {options.length <= 2
                                          ? "At least two options are required"
                                          : "Remove this option"}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  setValue(`questions.${index}.options`, [
                                    ...options,
                                    "",
                                  ])
                                }
                                className="mt-2"
                              >
                                Add Option
                              </Button>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>

                        {/* Solution */}
                        <FormField
                          control={control}
                          name={`questions.${index}.solution`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-600">
                                Solution *
                              </FormLabel>
                              <FormControl>
                                <CustomEditor
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Enter solution explanation"
                                  height="auto"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    )}
                    {previewMode && (
                      <CardContent className="space-y-4">
                        <div
                          className="text-gray-700"
                          dangerouslySetInnerHTML={{
                            __html: watch(`questions.${index}.questionText`),
                          }}
                        />
                        <RadioGroup disabled>
                          {options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className="flex items-center gap-2"
                            >
                              <RadioGroupItem
                                value={opt}
                                checked={correctAnswer === opt}
                              />
                              <span>{opt || `Option ${optIdx + 1}`}</span>
                              {correctAnswer === opt && (
                                <span className="text-green-600 ml-2">
                                  (Correct)
                                </span>
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                        <div
                          className="text-gray-600 italic"
                          dangerouslySetInnerHTML={{
                            __html: watch(`questions.${index}.solution`),
                          }}
                        />
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
                  questionText: "",
                  options: ["", ""],
                  correctAnswer: "",
                  solution: "",
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

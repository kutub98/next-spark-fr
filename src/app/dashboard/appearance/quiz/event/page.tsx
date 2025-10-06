/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import CustomEditor from "../_components/custom-editor";

// Normalize date to minutes
const normalizeDateToMinutes = (date: Date) => {
  const d = new Date(date);
  d.setSeconds(0, 0);
  return d;
};

// Schema
const eventSchema = z
  .object({
    event_name: z.string().min(1, "Event name is required"),
    total_question: z.number().min(1, "Total questions must be at least 1"),
    duration: z.object({
      hours: z.number().min(0).optional(),
      minutes: z.number().min(0).optional(),
      seconds: z.number().min(0).optional(),
    }),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    time_for: z.object({
      hours: z.number().min(0).optional(),
      minutes: z.number().min(0).optional(),
      seconds: z.number().min(0).optional(),
      short: z.number().min(1).optional(),
      written: z.number().min(1).optional(),
      mcq: z.number().min(1).optional(),
    }),
  })
  .refine(
    (data) => {
      const now = normalizeDateToMinutes(new Date());
      const start = normalizeDateToMinutes(new Date(data.start_time));
      return start.getTime() >= now.getTime();
    },
    {
      message: "Start time cannot be in the past",
      path: ["start_time"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      return end.getTime() > start.getTime();
    },
    {
      message: "End time must be later than start time",
      path: ["end_time"],
    }
  );

type EventFormValues = z.infer<typeof eventSchema>;

export default function EventForm() {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      event_name: "",
      total_question: 0,
      duration: { hours: 0, minutes: 0, seconds: 0 },
      start_time: new Date().toISOString(),
      end_time: "",
      time_for: {
        hours: 0,
        minutes: 0,
        seconds: 0,
        short: 0,
        written: 0,
        mcq: 0,
      },
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, errors, isValid },
  } = form;

  const onSubmit = async (data: EventFormValues) => {
    try {
      console.log("Event Data:", data);
      toast.success("✅ Event saved successfully!", { duration: 3000 });
    } catch {
      toast.error("❌ Failed to save event. Please try again.");
    }
  };

  // Calculate end time dynamically
  const startTime = watch("start_time");
  const timeForHours = watch("time_for.hours") || 0;
  const timeForMinutes = watch("time_for.minutes") || 0;
  const timeForSeconds = watch("time_for.seconds") || 0;

  React.useEffect(() => {
    if (startTime) {
      const startDate = new Date(startTime);
      const totalMs =
        timeForHours * 3600000 + timeForMinutes * 60000 + timeForSeconds * 1000;
      const endDate = new Date(startDate.getTime() + totalMs);
      const now = normalizeDateToMinutes(new Date());
      if (endDate.getTime() > now.getTime()) {
        setValue("end_time", endDate.toISOString());
      }
    }
  }, [startTime, timeForHours, timeForMinutes, timeForSeconds, setValue]);

  const toLocalInputValue = (date: string) =>
    date ? new Date(date).toISOString().slice(0, 16) : "";

  const nowLocal = normalizeDateToMinutes(new Date())
    .toISOString()
    .slice(0, 16);
  const startTimeValue = watch("start_time");
  const minEndTime = startTimeValue
    ? normalizeDateToMinutes(new Date(startTimeValue))
        .toISOString()
        .slice(0, 16)
    : nowLocal;

  const isFormDisabled =
    !!errors.start_time || !!errors.end_time || isSubmitting;

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          🎯 Event Builder
        </h1>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* General Info */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <FormField
                  control={control}
                  name="event_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name *</FormLabel>
                      <FormControl>
                        <CustomEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Enter event name"
                          height="auto"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="total_question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Questions *</FormLabel>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              placeholder="e.g. 50"
                              className="rounded-lg"
                            />
                          </FormControl>
                        </TooltipTrigger>
                        <TooltipContent>
                          Total number of questions in the event
                        </TooltipContent>
                      </Tooltip>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["hours", "minutes", "seconds"].map((unit) => (
                    <FormField
                      key={unit}
                      control={control}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      name={`duration.${unit}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Duration{" "}
                            {unit.charAt(0).toUpperCase() + unit.slice(1)}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              placeholder={unit}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timing Details */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Timing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time *</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={toLocalInputValue(field.value)}
                          onChange={(e) => field.onChange(e.target.value)}
                          min={nowLocal}
                          className="rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time *</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={toLocalInputValue(field.value)}
                          onChange={(e) => field.onChange(e.target.value)}
                          min={minEndTime}
                          className="rounded-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Time Allocation */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Time Allocations
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["hours", "minutes", "seconds"].map((unit) => (
                    <FormField
                      key={unit}
                      control={control}
                      name={`time_for.${unit}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total {unit}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              placeholder={unit}
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "short", label: "Short Question (sec)" },
                    { name: "written", label: "Written Question (sec)" },
                    { name: "mcq", label: "MCQ (sec)" },
                  ].map(({ name, label }) => (
                    <FormField
                      key={name}
                      control={control}
                      name={`time_for.${name}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              placeholder="0"
                              className="rounded-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-2"
                disabled={!isValid || isSubmitting || isFormDisabled}
              >
                {isSubmitting && <Loader2 className="animate-spin w-5 h-5" />}
                {isSubmitting ? "Saving..." : "Save Event"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </TooltipProvider>
  );
}

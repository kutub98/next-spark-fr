"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { api } from "@/data/api";

const faqSchema = z.object({
  faq: z.array(
    z.object({
      question: z.string().min(1, "Question is required"),
      answer: z.string().min(1, "Answer is required"),
    })
  ),
  status: z.enum(["approved", "pending"]),
});

type FaqFormValues = z.infer<typeof faqSchema>;

const defaultValues: FaqFormValues = {
  faq: [{ question: "", answer: "" }],
  status: "pending",
};

export default function FaqForm() {
  const [faqId, setFaqId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faq",
  });

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const res = await axios.get(`${api}/faq/`);
        const data = res.data?.data?.[0];

        if (data) {
          setFaqId(data._id);
          form.reset({
            faq: data.faq,
            status: data.status,
          });
        }
      } catch (err) {
        console.error("Failed to fetch FAQ", err);
      }
    };

    fetchFaq();
  }, [form]);

  const onSubmit = async (values: FaqFormValues) => {
    try {
      setIsLoading(true);

      if (faqId) {
        await axios.patch(`${api}/faq/${faqId}`, values);
        toast.success("FAQ updated");
      } else {
        await axios.post(`${api}/faq/`, values);
        toast.success("FAQ created");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!faqId) return;
    try {
      setIsLoading(true);
      await axios.delete(`${api}/faq/${faqId}`);
      toast.success("FAQ deleted");
      setFaqId(null);
      form.reset(defaultValues);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    } finally {
      setIsLoading(false);
    }
  };

  const lastFaq = form.watch("faq")?.[fields.length - 1];

  return (
    // <Form {...form}>
    //   <form
    //     onSubmit={form.handleSubmit(onSubmit)}
    //     className="space-y-6 max-w-6xl mx-auto p-6 bg-white shadow-md rounded-md"
    //   >
    //     <h2 className="text-2xl font-bold text-gray-800 mb-4">Manage FAQ</h2>

    //     {fields.map((field, index) => (
    //       <div
    //         key={field.id}
    //         className="space-y-4 bg-gray-50 border border-gray-200 p-5 rounded-md shadow-sm relative"
    //       >
    //         <div className="absolute top-2 right-2 text-sm text-gray-500">
    //           Q{index + 1}
    //         </div>

    //         <FormField
    //           control={form.control}
    //           name={`faq.${index}.question`}
    //           render={({ field }) => (
    //             <FormItem>
    //               <FormLabel className="font-medium">Question</FormLabel>
    //               <FormControl>
    //                 <Input
    //                   placeholder="Enter the question"
    //                   {...field}
    //                   className="rounded-md"
    //                 />
    //               </FormControl>
    //               <FormMessage />
    //             </FormItem>
    //           )}
    //         />

    //         <FormField
    //           control={form.control}
    //           name={`faq.${index}.answer`}
    //           render={({ field }) => (
    //             <FormItem>
    //               <FormLabel className="font-medium">Answer</FormLabel>
    //               <FormControl>
    //                 <Input
    //                   placeholder="Enter the answer"
    //                   {...field}
    //                   className="rounded-md"
    //                 />
    //               </FormControl>
    //               <FormMessage />
    //             </FormItem>
    //           )}
    //         />

    //         {fields.length > 1 && (
    //           <div className="flex justify-end">
    //             <Button
    //               type="button"
    //               variant="ghost"
    //               onClick={() => remove(index)}
    //               className="text-red-500 hover:text-red-600"
    //             >
    //               Remove
    //             </Button>
    //           </div>
    //         )}
    //       </div>
    //     ))}

    //     <div className="flex justify-start">
    //       <Button
    //         type="button"
    //         variant="outline"
    //         onClick={() => append({ question: "", answer: "" })}
    //         disabled={!lastFaq?.question || !lastFaq?.answer}
    //       >
    //         Add FAQ
    //       </Button>
    //     </div>

    //     <FormField
    //       control={form.control}
    //       name="status"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormLabel className="font-medium">Status</FormLabel>
    //           <FormControl>
    //             <Select onValueChange={field.onChange} value={field.value}>
    //               <SelectTrigger className="w-full">
    //                 <SelectValue placeholder="Select status" />
    //               </SelectTrigger>
    //               <SelectContent>
    //                 <SelectItem value="pending">Pending</SelectItem>
    //                 <SelectItem value="approved">Approved</SelectItem>
    //               </SelectContent>
    //             </Select>
    //           </FormControl>
    //           <FormMessage />
    //         </FormItem>
    //       )}
    //     />

    //     <div className="flex flex-wrap gap-4">
    //       {!faqId && (
    //         <Button type="submit" disabled={isLoading}>
    //           Create
    //         </Button>
    //       )}
    //       {faqId && (
    //         <>
    //           <Button type="submit" disabled={isLoading}>
    //             Update
    //           </Button>
    //           <Button
    //             type="button"
    //             variant="destructive"
    //             onClick={handleDelete}
    //             disabled={isLoading}
    //           >
    //             Delete
    //           </Button>
    //         </>
    //       )}
    //     </div>
    //   </form>
    // </Form>

    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto px-6 py-8 space-y-8 bg-white border border-gray-100 rounded-2xl shadow-md transition-all duration-300"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-gray-900">Manage FAQ</h1>
          <p className="text-sm text-gray-500">
            Easily manage questions and answers for your users.
          </p>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative p-6 rounded-xl border border-gray-200 bg-gray-50 hover:shadow-md transition-shadow duration-300"
          >
            <div className="absolute top-3 right-4">
              <span className="inline-block text-xs font-semibold text-white bg-orange-600 px-2 py-0.5 rounded-full shadow">
                Q{index + 1}
              </span>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name={`faq.${index}.question`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Question
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Type your question here"
                        className="text-sm px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 transition duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`faq.${index}.answer`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Answer
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Provide the answer"
                        className="text-sm px-4 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 transition duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {fields.length > 1 && (
              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        ))}

        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ question: "", answer: "" })}
            disabled={!lastFaq?.question || !lastFaq?.answer}
            className="rounded-md border-dashed border-gray-300 hover:border-orange-400 hover:text-orange-600 transition-all"
          >
            + Add Another Question
          </Button>
        </div>

        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Status
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full text-sm border-gray-300 focus:ring-2 focus:ring-orange-500 transition duration-200">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {!faqId && (
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white transition-all rounded-md"
            >
              Create
            </Button>
          )}
          {faqId && (
            <>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white transition-all rounded-md"
              >
                Update
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
                className="transition-all rounded-md"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}

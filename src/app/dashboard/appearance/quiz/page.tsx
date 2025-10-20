"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

export default function QuestionBuilderPage() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSelect = (type: "mcq" | "short" | "written") => {
    setOpen(false);
    router.push(`/dashboard/appearance/quiz/${type}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-3xl font-bold">Question Builder</h1>
        <p className="text-muted-foreground">
          Create, manage, and organize MCQ, short, or written questions for your
          exams.
        </p>

        {/* Open Modal Button */}
        <Button onClick={() => setOpen(true)} size="lg" className="gap-2">
          <PlusCircle className="h-5 w-5" />
          Add Question
        </Button>
      </div>

      {/* Modal for Question Type */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Question Type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSelect("mcq")}
            >
              Multiple Choice Question (MCQ)
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSelect("short")}
            >
              Short Question
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSelect("written")}
            >
              Written Question
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

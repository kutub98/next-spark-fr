"use client";
import React, { useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { IQuestion } from "@/redux/features/questionSlice";
import Image from "next/image";

interface QuestionProps {
  question: IQuestion;
  answer?: string;
  onAnswerChange: (answer: string) => void;
  onImageUpload?: (files: File[]) => void;
  uploadedImages?: File[];
  isReadOnly?: boolean;
  showCorrectAnswer?: boolean;
  isCorrect?: boolean;
  marksObtained?: number;
}

export const MCQQuestion: React.FC<QuestionProps> = ({
  question,
  answer,
  onAnswerChange,
  isReadOnly = false,
  showCorrectAnswer = false,
  isCorrect = false,
  marksObtained = 0,
}) => {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={answer || ""}
        onValueChange={onAnswerChange}
        disabled={isReadOnly}
      >
        {question.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option}
              id={`${question._id}-${index}`}
              disabled={isReadOnly}
            />
            <Label
              htmlFor={`${question._id}-${index}`}
              className={`flex-1 cursor-pointer ${
                isReadOnly ? "cursor-default" : ""
              } ${
                showCorrectAnswer && option === question.correctAnswer
                  ? "text-green-700 font-semibold"
                  : ""
              } ${
                showCorrectAnswer &&
                answer === option &&
                option !== question.correctAnswer
                  ? "text-red-700 font-semibold"
                  : ""
              }`}
            >
              {option}
            </Label>
            {showCorrectAnswer && option === question.correctAnswer && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
        ))}
      </RadioGroup>

      {isReadOnly && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {isCorrect ? "Correct" : "Incorrect"}
          </span>
          <span className="font-semibold">
            {marksObtained} / {question.marks} marks
          </span>
        </div>
      )}
    </div>
  );
};

export const ShortQuestion: React.FC<QuestionProps> = ({
  question,
  answer,
  onAnswerChange,
  onImageUpload,
  uploadedImages = [],
  isReadOnly = false,
  showCorrectAnswer = false,
  isCorrect = false,
  marksObtained = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (files: FileList | null) => {
    if (files && onImageUpload) {
      onImageUpload(Array.from(files));
    }
  };

  const removeImage = (index: number) => {
    if (onImageUpload) {
      const newImages = uploadedImages.filter((_, i) => i !== index);
      onImageUpload(newImages);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter your answer here..."
        value={answer || ""}
        onChange={(e) => onAnswerChange(e.target.value)}
        rows={4}
        className="w-full"
        readOnly={isReadOnly}
      />

      {!isReadOnly && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Upload Images (Optional)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {uploadedImages.map((file, index) => (
            <div key={index} className="relative">
              <Image
                src={URL.createObjectURL(file)}
                alt={`Upload ${index + 1}`}
                width={200}
                height={80}
                className="w-full h-20 object-cover rounded border"
              />
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCorrectAnswer && question.correctAnswer && (
        <div className="bg-green-50 p-3 rounded border">
          <Label className="text-sm font-medium text-green-800">
            Correct Answer:
          </Label>
          <p className="text-green-700 mt-1">{question.correctAnswer}</p>
        </div>
      )}

      {isReadOnly && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {isCorrect ? "Correct" : "Incorrect"}
          </span>
          <span className="font-semibold">
            {marksObtained} / {question.marks} marks
          </span>
        </div>
      )}
    </div>
  );
};

export const WrittenQuestion: React.FC<QuestionProps> = ({
  question,
  answer,
  onAnswerChange,
  onImageUpload,
  uploadedImages = [],
  isReadOnly = false,
  showCorrectAnswer = false,
  isCorrect = false,
  marksObtained = 0,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (files: FileList | null) => {
    if (files && onImageUpload) {
      onImageUpload(Array.from(files));
    }
  };

  const removeImage = (index: number) => {
    if (onImageUpload) {
      const newImages = uploadedImages.filter((_, i) => i !== index);
      onImageUpload(newImages);
    }
  };

  const wordCount = answer
    ? answer.split(/\s+/).filter((word) => word.length > 0).length
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Word Limit: {question.wordLimit || "No limit"}</span>
        <span>Time Limit: {question.timeLimit || "No limit"} minutes</span>
      </div>

      <Textarea
        placeholder="Enter your detailed answer here..."
        value={answer || ""}
        onChange={(e) => onAnswerChange(e.target.value)}
        rows={8}
        className="w-full"
        readOnly={isReadOnly}
      />

      {!isReadOnly && question.wordLimit && (
        <div className="text-sm text-gray-600">
          Word count: {wordCount} / {question.wordLimit}
          {wordCount > question.wordLimit && (
            <span className="text-red-600 ml-2">(Exceeds limit)</span>
          )}
        </div>
      )}

      {!isReadOnly && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Upload Supporting Images (Optional)
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {uploadedImages.map((file, index) => (
            <div key={index} className="relative">
              <Image
                src={URL.createObjectURL(file)}
                alt={`Upload ${index + 1}`}
                width={200}
                height={80}
                className="w-full h-20 object-cover rounded border"
              />
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {isReadOnly && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {isCorrect ? "Correct" : "Incorrect"}
          </span>
          <span className="font-semibold">
            {marksObtained} / {question.marks} marks
          </span>
        </div>
      )}
    </div>
  );
};

export const QuestionTypeIcon: React.FC<{
  type: string;
  className?: string;
}> = ({ type, className = "h-4 w-4" }) => {
  switch (type) {
    case "MCQ":
      return <CheckCircle className={className} />;
    case "Short":
      return <FileText className={className} />;
    case "Written":
      return <FileText className={className} />;
    default:
      return <FileText className={className} />;
  }
};

export const QuestionTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "MCQ":
        return "bg-blue-100 text-blue-800";
      case "Short":
        return "bg-green-100 text-green-800";
      case "Written":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return <Badge className={getTypeColor(type)}>{type}</Badge>;
};

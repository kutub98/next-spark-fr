"use client";

import React, { useState, useEffect, useRef } from "react";

interface Question {
  id: string;
  type: "mcq" | "short" | "written";
  questionText: string;
  options?: string[];
  correctAnswer: string;
  timeLimitSeconds: number;
  marks: number;
}

const questions: Question[] = [
  {
    id: "q1",
    type: "mcq",
    questionText: "What is the capital of Bangladesh?",
    options: ["Dhaka", "Chittagong", "Khulna", "Sylhet"],
    correctAnswer: "Dhaka",
    timeLimitSeconds: 20,
    marks: 2,
  },
  {
    id: "q2",
    type: "short",
    questionText: "Name the largest planet in our solar system.",
    correctAnswer: "Jupiter",
    timeLimitSeconds: 30,
    marks: 3,
  },
  {
    id: "q3",
    type: "written",
    questionText: "Explain the water cycle briefly.",
    correctAnswer: "",
    timeLimitSeconds: 60,
    marks: 5,
  },
];

// Format seconds to mm:ss
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function QuizPage() {
  const initialQuizTime = questions.reduce(
    (acc, q) => acc + q.timeLimitSeconds,
    0
  );
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionTimeLeft, setQuestionTimeLeft] = useState(
    questions[0].timeLimitSeconds
  );
  const [quizTimeLeft, setQuizTimeLeft] = useState(initialQuizTime);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const quizTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isSubmitted) {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
      return;
    }

    // Question timer countdown
    questionTimerRef.current = setInterval(() => {
      setQuestionTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(questionTimerRef.current!);
          nextQuestion();
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    // Quiz timer countdown
    quizTimerRef.current = setInterval(() => {
      setQuizTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(quizTimerRef.current!);
          setIsSubmitted(true);
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, [currentQuestionIdx, isSubmitted, nextQuestion]);

  function nextQuestion() {
    if (currentQuestionIdx < questions.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setQuestionTimeLeft(questions[nextIdx].timeLimitSeconds);
    } else {
      setIsSubmitted(true);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    }
  }

  function handleAnswerChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const value = e.target.value;
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIdx].id]: value,
    }));
  }

  function handleOptionSelect(option: string) {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIdx].id]: option,
    }));
  }

  function calculateScore() {
    let score = 0;
    questions.forEach((q) => {
      const ans = answers[q.id]?.trim().toLowerCase() || "";
      if (q.type === "mcq" || q.type === "short") {
        if (ans === q.correctAnswer.toLowerCase()) score += q.marks;
      }
      // For written type, scoring can be manual or skipped here
    });
    return score;
  }

  if (isSubmitted) {
    const totalMarks = questions.reduce((a, q) => a + q.marks, 0);
    const score = calculateScore();

    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md mt-24">
        <h1 className="text-3xl font-bold mb-4 text-center">ফলাফল</h1>
        <p className="text-lg mb-6 text-center">
          আপনি পেয়েছেন:{" "}
          <span className="font-semibold text-green-600">{score}</span> /{" "}
          {totalMarks} মার্কস
        </p>

        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="border rounded p-4">
              <h3 className="font-semibold mb-2">{q.questionText}</h3>
              <p>
                আপনার উত্তর:{" "}
                <span className="text-blue-600">
                  {answers[q.id] || <em>উত্তর দেয়া হয়নি</em>}
                </span>
              </p>
              {q.type !== "written" && (
                <p>
                  সঠিক উত্তর:{" "}
                  <span className="text-green-700">{q.correctAnswer}</span>
                </p>
              )}
              <p>
                প্রাপ্ত মার্কস:{" "}
                {q.type !== "written" &&
                  (answers[q.id]?.trim().toLowerCase() ===
                  q.correctAnswer.toLowerCase()
                    ? q.marks
                    : 0)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md mt-24">
      <div>
        <h1 className="text-2xl font-bold mb-4 text-center">স্মার্ট ভিলেজ</h1>
        <h2 className="text-lg text-center text-gray-700 mb-2">
          মোট সময়:{" "}
          <span className="font-semibold">{formatTime(initialQuizTime)}</span>
        </h2>
      </div>
      <div className="flex justify-between mb-4">
        <div>মোট সময় বাকি: {formatTime(quizTimeLeft)}</div>
        <div>প্রশ্ন সময় বাকি: {formatTime(questionTimeLeft)}</div>
      </div>

      <h2 className="text-xl font-bold mb-4">
        প্রশ্ন {currentQuestionIdx + 1} / {questions.length}
      </h2>

      <p className="mb-6 text-lg font-medium">{currentQ.questionText}</p>

      {currentQ.type === "mcq" && currentQ.options && (
        <div className="space-y-2 mb-6">
          {currentQ.options.map((opt) => (
            <label
              key={opt}
              className={`block p-3 border rounded cursor-pointer
                ${
                  answers[currentQ.id] === opt
                    ? "bg-[#f25b29] text-white border-[#f25b29]"
                    : "bg-white text-gray-800 border-gray-300"
                } 
                transition-all duration-200 ease-in-out`}
            >
              <input
                type="radio"
                name={currentQ.id}
                value={opt}
                checked={answers[currentQ.id] === opt}
                onChange={() => handleOptionSelect(opt)}
                className="mr-3"
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {(currentQ.type === "short" || currentQ.type === "written") && (
        <textarea
          rows={currentQ.type === "short" ? 2 : 5}
          placeholder="আপনার উত্তর এখানে লিখুন..."
          value={answers[currentQ.id] || ""}
          onChange={handleAnswerChange}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#f25b29] resize-none"
        />
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {
            if (currentQuestionIdx > 0) {
              setCurrentQuestionIdx(currentQuestionIdx - 1);
              setQuestionTimeLeft(
                questions[currentQuestionIdx - 1].timeLimitSeconds
              );
            }
          }}
          disabled={currentQuestionIdx === 0}
          className="px-4 py-2 rounded border border-gray-400 disabled:opacity-50"
        >
          আগের প্রশ্ন
        </button>

        {currentQuestionIdx < questions.length - 1 ? (
          <button
            onClick={nextQuestion}
            className="px-4 py-2 rounded bg-[#f25b29] text-white hover:bg-[#e5531f]"
          >
            পরের প্রশ্ন
          </button>
        ) : (
          <button
            onClick={() => setIsSubmitted(true)}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            জমা দিন
          </button>
        )}
      </div>
    </div>
  );
}

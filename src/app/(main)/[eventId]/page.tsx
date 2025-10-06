"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  BookOpen,
  Calendar,
  Trophy,
  Star,
  ArrowLeft,
} from "lucide-react";
import { getEventById } from "@/redux/features/eventSlice";
import { getQuizzesByEventId } from "@/redux/features/quizSlice";
import { AppDispatch, RootState } from "@/store/store";
import ParticipateQuiz from "@/app/components/shared/ParticipateQuiz";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";

export default function QuizzesBasedOnEvent() {
  const params = useParams();
  const eventId = params.eventId as string;

  const dispatch = useDispatch<AppDispatch>();

  const {
    selectedEvent: event,
    loading: eventLoading,
    error: eventError,
  } = useSelector((state: RootState) => state.events);
  const {
    quizzes,
    loading: quizzesLoading,
    error: quizzesError,
  } = useSelector((state: RootState) => state.quizzes);

  useEffect(() => {
    if (eventId) {
      dispatch(getEventById(eventId));
      dispatch(getQuizzesByEventId(eventId));
    }
  }, [dispatch, eventId]);

  if (eventLoading || quizzesLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F06122] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-[#232323] mb-2">
            Loading Event...
          </h3>
          <p className="text-gray-500">
            Please wait while we fetch the details
          </p>
        </div>
      </div>
    );
  }

  if (eventError || quizzesError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-[#232323] mb-3">
            Error Loading Event
          </h2>
          <p className="text-gray-600 mb-4">{eventError || quizzesError}</p>

          <Button
            onClick={() => {
              dispatch(getEventById(eventId));
              dispatch(getQuizzesByEventId(eventId));
            }}
            className="w-full bg-[#232323] text-white hover:bg-[#F06122] transition-colors"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>

          <h2 className="text-xl font-bold text-[#232323] mb-3">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The event you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>

          <Link href="/" className="block">
            <Button className="w-full bg-[#232323] text-white hover:bg-[#F06122] transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Event Header */}
        <motion.div
          className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#F06122] rounded-full flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#232323]">
                  {event.title}
                </h1>
              </div>
              <p className="text-gray-600 mb-3">{event.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(event.startDate), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(new Date(event.startDate), "h:mm a")} -{" "}
                    {format(new Date(event.endDate), "h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{event.participants?.length || 0} Participants</span>
                </div>
              </div>
            </div>

            <div className="bg-[#232323] text-white px-4 py-2 rounded-lg text-sm font-medium">
              Live Event
            </div>
          </div>
        </motion.div>

        {/* Quizzes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#232323] mb-2">
              Available Quizzes
            </h2>
            <p className="text-gray-600">Choose a quiz to start your journey</p>
          </div>

          {quizzes.length === 0 ? (
            <motion.div
              className="text-center py-12 bg-white border border-gray-200 rounded-lg shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#232323] mb-2">
                No Quizzes Available
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There are no quizzes for this event yet. Check back later.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="h-full border border-gray-200 bg-white hover:border-[#F06122]/30 hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden py-0">
                    {/* Header */}
                    <div className="bg-[#232323] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-[#F06122] rounded flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white line-clamp-1 mb-1">
                        {quiz.title}
                      </h3>
                      {quiz.instructions && (
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {quiz.instructions}
                        </p>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Duration */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F06122]/10 rounded flex items-center justify-center">
                            <Clock className="w-4 h-4 text-[#F06122]" />
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-[#232323]">
                              {quiz.duration} Minutes
                            </span>
                            <div className="text-gray-500">Time limit</div>
                          </div>
                        </div>

                        {/* Total Marks */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                            <Star className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-[#232323]">
                              {quiz.totalMarks} Total Marks
                            </span>
                            <div className="text-gray-500">Maximum score</div>
                          </div>
                        </div>

                        {/* Passing Marks */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-[#232323]">
                              {quiz.passingMarks} Passing Marks
                            </span>
                            <div className="text-gray-500">
                              Required to pass
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Participate Button */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <ParticipateQuiz
                          quizId={quiz._id}
                          quizTitle={quiz.title}
                          duration={quiz.duration}
                          totalMarks={quiz.totalMarks}
                          passingMarks={quiz.passingMarks}
                          eventId={eventId}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

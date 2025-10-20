"use client";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEvents } from "@/redux/features/eventSlice";
import { AppDispatch, RootState } from "@/store/store";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function EventSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch]);

  const latestEvents = useMemo(() => {
    return [...events]
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
      .slice(0, 3);
  }, [events]);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-100 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-0 animate-pulse"
              >
                <div className="h-40 bg-gray-100 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <p className="text-red-600">Error loading events: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F06122] rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#232323]">Latest Events</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the latest quiz contests and compete with participants
            worldwide
          </p>
        </motion.div>

        {latestEvents.length === 0 ? (
          <motion.div
            className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#232323] mb-2">
              No Events Available
            </h3>
            <p className="text-gray-600">Check back later for new events!</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {latestEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/${event._id}`} className="group block">
                    <Card className="h-full border border-gray-200 bg-white hover:border-[#F06122]/30 hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden py-0">
                      {/* Header with accent color */}
                      <div className="relative h-32 bg-[#232323]">
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-[#F06122] hover:bg-[#E0551A] text-white px-3 py-1 text-xs font-medium border-0">
                            <div className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-pulse" />
                            Live Now
                          </Badge>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-semibold text-white line-clamp-1 mb-1">
                            {event.title}
                          </h3>
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {event.description ||
                              "Join this exciting quiz contest!"}
                          </p>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Date and Time */}
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#F06122]/10 rounded flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-[#F06122]" />
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-[#232323]">
                                {format(
                                  new Date(event.startDate),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                              <div className="text-gray-500">
                                {format(new Date(event.startDate), "h:mm a")} -{" "}
                                {format(new Date(event.endDate), "h:mm a")}
                              </div>
                            </div>
                          </div>

                          {/* Participants */}
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                              <Users className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-[#232323]">
                                {event.participants.length} Participants
                              </span>
                              <div className="text-gray-500">
                                Currently active
                              </div>
                            </div>
                          </div>

                          {/* Quizzes */}
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                              <Trophy className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-[#232323]">
                                {event.quizzes.length} Quiz
                                {event.quizzes.length !== 1 ? "zes" : ""}
                              </span>
                              <div className="text-gray-500">
                                Available to play
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      {/* Footer Button */}
                      <div className="px-4 pb-4">
                        <motion.div
                          className="w-full bg-[#232323] text-white py-2.5 px-4 rounded-lg font-medium text-sm text-center hover:bg-[#F06122] transition-colors duration-300 group-hover:shadow-md"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Join Contest
                        </motion.div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* View All Button */}
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link href="/events">
                <motion.button
                  className="inline-flex items-center gap-2 bg-[#F06122] hover:bg-[#E0551A] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Events
                  <Clock className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

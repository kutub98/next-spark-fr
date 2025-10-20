"use client";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEvents } from "@/redux/features/eventSlice";
import { AppDispatch, RootState } from "@/store/store";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Trophy,
  Clock,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import { motion } from "framer-motion";

export default function AllEventsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error } = useSelector(
    (state: RootState) => state.events
  );

  useEffect(() => {
    dispatch(getEvents());
  }, [dispatch]);

  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [events]);

  const getEventStatus = (event: { startDate: string; endDate: string }) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) return "upcoming";
    if (now > endDate) return "completed";
    return "ongoing";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Upcoming
          </Badge>
        );
      case "ongoing":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Live Now
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-0 animate-pulse"
              >
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <p className="text-red-600">Error loading events: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#232323]">All Events</h1>
              <p className="text-gray-600 mt-1">
                Discover all quiz contests and competitions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Events Grid */}
        {sortedEvents.length === 0 ? (
          <motion.div
            className="text-center p-12 bg-white border border-gray-200 rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-[#232323] mb-3">
              No Events Available
            </h3>
            <p className="text-gray-600 mb-6">
              Check back later for new events!
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {sortedEvents.map((event, index) => {
              const status = getEventStatus(event);
              const isLive = status === "ongoing";

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/${event._id}`} className="group block">
                    <Card className="h-full border border-gray-200 bg-white hover:border-[#F06122]/30 hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden p-0">
                      {/* Header with status */}
                      <div
                        className={`relative h-32 ${
                          isLive ? "bg-[#232323]" : "bg-gray-800"
                        }`}
                      >
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(status)}
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
                                {event.participants?.length || 0} Participants
                              </span>
                              <div className="text-gray-500">
                                {status === "ongoing"
                                  ? "Currently active"
                                  : status === "upcoming"
                                  ? "Will start soon"
                                  : "Event ended"}
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
                                {event.quizzes?.length || 0} Quiz
                                {(event.quizzes?.length || 0) !== 1
                                  ? "zes"
                                  : ""}
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
                          className={`w-full text-white py-2.5 px-4 rounded-lg font-medium text-sm text-center transition-colors duration-300 group-hover:shadow-md ${
                            isLive
                              ? "bg-[#232323] hover:bg-[#F06122]"
                              : status === "upcoming"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-gray-600 hover:bg-gray-700"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {status === "ongoing"
                            ? "Join Contest"
                            : status === "upcoming"
                            ? "View Details"
                            : "View Results"}
                        </motion.div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

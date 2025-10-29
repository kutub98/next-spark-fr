"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchParticipations } from "@/redux/features/participationSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Trophy, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import RewardPoints from "@/components/ui/reward-points";

const StudentDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { participations, loading } = useSelector(
    (state: RootState) => state.participations
  );

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      await dispatch(fetchParticipations());
    } catch {
      toast.error("Failed to load participation data");
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadData();
    }
  }, [loadData, isAuthenticated, authLoading]);

  // ✅ Badge based on status
  const getParticipationBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">সম্পূর্ণ</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">ব্যর্থ</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">পর্যালোচনাধীন</Badge>
        );
      default:
        return <Badge variant="outline">অজানা</Badge>;
    }
  };

  // ✅ Filter only the logged-in user's participations
  const userParticipations = participations.filter(
    (p) => p.user?._id === user?._id
  );

  // ✅ Filtering based on search + status
  const filteredParticipations = userParticipations.filter((p) => {
    const quizTitle = p.quiz?.title || "";
    const matchesSearch =
      searchTerm === "" ||
      quizTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">ড্যাশবোর্ড</h1>
          <p className="text-gray-600">
            আপনার কুইজ অংশগ্রহণের সামগ্রিক অবস্থা দেখুন
          </p>
        </div>
        <RewardPoints size="lg" />
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="কুইজ খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="অবস্থা অনুযায়ী ফিল্টার" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব ফলাফল</SelectItem>
            <SelectItem value="completed">সম্পূর্ণ</SelectItem>
            <SelectItem value="failed">ব্যর্থ</SelectItem>
            <SelectItem value="pending">পর্যালোচনাধীন</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Participations Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">লোড হচ্ছে...</div>
      ) : filteredParticipations.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            কোনো কুইজ ফলাফল পাওয়া যায়নি
          </h3>
          <p className="text-gray-500">আপনি এখনও কোনো কুইজে অংশগ্রহণ করেননি।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredParticipations.map((p) => (
            <Card key={p._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">
                      {p.quiz?.title || "অজানা কুইজ"}
                    </CardTitle>
                    <CardDescription className="mt-1 text-gray-500">
                      মোট প্রশ্ন: {p.quiz?.totalQuestions || 0} | সময়:{" "}
                      {p.quiz?.duration || 0} মিনিট
                    </CardDescription>
                  </div>
                  {getParticipationBadge(p.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                    <span>
                      স্কোর: {p.obtainedMarks} / {p.totalMarks}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span>
                      জমা: {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Link href={`/student/result/${p._id}`}>
                      <Button size="sm" className="w-full">
                        বিস্তারিত ফলাফল দেখুন
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

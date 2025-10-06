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
import { Calendar, Trophy, Search, Award, Target } from "lucide-react";
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

const StudentResults = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { participations } = useSelector(
    (state: RootState) => state.participations
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      await dispatch(fetchParticipations());
    } catch {
      toast.error("Failed to load data");
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const filteredParticipations = participations.filter((participation) => {
    const quizTitle =
      typeof participation.quizId === "object"
        ? participation.quizId.title
        : participation.quizId;

    const matchesSearch =
      searchTerm === "" ||
      quizTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || participation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalParticipations = participations.length;
  const completedParticipations = participations.filter(
    (p) => p.status === "completed"
  ).length;
  const totalScore = participations.reduce((sum, p) => sum + p.totalScore, 0);
  const averageScore =
    totalParticipations > 0 ? (totalScore / totalParticipations).toFixed(1) : 0;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">কুইজ ফলাফল</h1>
          <p className="text-gray-600">
            আপনার কুইজ অংশগ্রহণের ফলাফল এবং স্কোর দেখুন
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <RewardPoints size="lg" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  মোট অংশগ্রহণ
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalParticipations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">সম্পূর্ণ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedParticipations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">গড় স্কোর</p>
                <p className="text-2xl font-bold text-gray-900">
                  {averageScore}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">মোট স্কোর</p>
                <p className="text-2xl font-bold text-gray-900">{totalScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="কুইজ ফলাফল খুঁজুন..."
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

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParticipations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              কোনো কুইজ ফলাফল পাওয়া যায়নি
            </h3>
            <p className="text-gray-500">
              আপনি এখনও কোনো কুইজে অংশগ্রহণ করেননি।
            </p>
          </div>
        ) : (
          filteredParticipations.map((participation) => (
            <Card
              key={participation._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {typeof participation.quizId === "object"
                        ? participation.quizId.title
                        : `কুইজ ID: ${participation.quizId}`}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {typeof participation.quizId === "object"
                        ? `সময়: ${participation.quizId.duration} মিনিট`
                        : "কুইজ ফলাফল"}
                    </CardDescription>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">
                        স্কোর: {participation.totalScore}
                      </span>
                      <span className="text-sm text-gray-500">
                        জমা:{" "}
                        {new Date(participation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getParticipationBadge(participation.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>
                      স্কোর: {participation.totalScore}
                      {typeof participation.quizId === "object"
                        ? ` / ${participation.quizId.totalMarks}`
                        : ""}
                    </span>
                  </div>
                  {typeof participation.quizId === "object" && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>সময়: {participation.quizId.duration} মিনিট</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      জমা দেওয়া:{" "}
                      {new Date(participation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/student/result/${
                        typeof participation.quizId === "object"
                          ? participation.quizId._id
                          : participation.quizId
                      }`}
                    >
                      <Button size="sm" className="w-full">
                        বিস্তারিত ফলাফল দেখুন
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentResults;

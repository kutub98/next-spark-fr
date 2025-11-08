/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  Calendar,
  PieChart as PieIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppDispatch } from "@/store/store";
import {
  getAllUsers,
  selectAllUsers,
  selectUsersError,
  selectUsersLoading,
} from "@/redux/features/usersSlice";
import { api } from "@/data/api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  format,
  subDays,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectAllUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);

  const [totalQuizzes, setTotalQuizzes] = useState<number>(0);
  const [totalParticipations, setTotalParticipations] = useState<number>(0);
  const [averageParticipation, setAverageParticipation] =
    useState<string>("0%");

  // 📊 Chart & Filter states
  const [filter, setFilter] = useState<string>("day");
  const [customDate, setCustomDate] = useState<string>("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  // 1️⃣ Load all users
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // 2️⃣ Fetch quizzes + participations after users loaded
  useEffect(() => {
    if (users.length > 0) {
      fetchDashboardData();
    }
  }, [users]);

  // 🧩 Fetch data
  const fetchDashboardData = async () => {
    try {
      const [quizRes, participationRes] = await Promise.all([
        fetch(`${api}/quizzes`),
        fetch(`${api}/participations`),
      ]);

      const quizData = await quizRes.json();
      const participationData = await participationRes.json();

      const quizzesCount = quizData?.data?.length || 0;
      const participations = participationData?.data || [];

      // Total participation records
      const participationCount = participations.length;
      setTotalQuizzes(quizzesCount);
      setTotalParticipations(participationCount);

      // ✅ Unique user participants
      const uniqueUserIds = new Set(
        participations
          .filter((p: any) => p.user && p.user._id)
          .map((p: any) => p.user._id)
      );
      const uniqueParticipants = uniqueUserIds.size;

      // ✅ Calculate average participation
      const usersCount = users.length;
      const avgParticipation =
        usersCount > 0
          ? ((uniqueParticipants / usersCount) * 100).toFixed(1)
          : "0";
      setAverageParticipation(`${avgParticipation}%`);

      // Build charts
      generateChartData(users, quizData.data, participationData.data);
      generatePieData(usersCount, quizzesCount, uniqueParticipants);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  // 🔍 Filter helpers
  const filterDataByRange = (data: any[], dateField: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (customDate) {
      const selected = new Date(customDate);
      startDate = startOfDay(selected);
      endDate = endOfDay(selected);
    } else {
      switch (filter) {
        case "day":
          startDate = subDays(now, 1);
          break;
        case "week":
          startDate = subDays(now, 7);
          break;
        case "month":
          startDate = subDays(now, 30);
          break;
        case "year":
          startDate = subDays(now, 365);
          break;
        default:
          startDate = subDays(now, 1);
      }
    }

    return data.filter((item) => {
      const created = parseISO(item.createdAt);
      return isAfter(created, startDate) && isBefore(created, endDate);
    });
  };

  // 🧮 Generate line chart data
  const generateChartData = (
    allUsers: any[],
    allQuizzes: any[],
    allParticipations: any[]
  ) => {
    const filteredUsers = filterDataByRange(allUsers, "createdAt");
    const filteredQuizzes = filterDataByRange(allQuizzes, "createdAt");
    const filteredParticipations = filterDataByRange(
      allParticipations,
      "createdAt"
    );

    const days = Array.from({ length: 7 }, (_, i) =>
      format(subDays(new Date(), i), "yyyy-MM-dd")
    ).reverse();

    const chart = days.map((day) => ({
      date: day,
      registrations: filteredUsers.filter((u) => u.createdAt.startsWith(day))
        .length,
      participations: filteredParticipations.filter((p) =>
        p.createdAt.startsWith(day)
      ).length,
      quizzes: filteredQuizzes.filter((q) => q.createdAt.startsWith(day))
        .length,
    }));

    setChartData(chart);
  };

  // 🥧 Generate pie chart data
  const generatePieData = (
    totalUsers: number,
    totalQuizzes: number,
    activeParticipants: number
  ) => {
    const inactiveUsers = totalUsers - activeParticipants;

    const pie = [
      { name: "অংশগ্রহণকারী", value: activeParticipants, color: "#36A2EB" },
      { name: "অক্রিয় ব্যবহারকারী", value: inactiveUsers, color: "#FF6384" },
      { name: "মোট কুইজ", value: totalQuizzes, color: "#FFCE56" },
    ];

    setPieData(pie);
  };

  // 🧠 Stats displayed on dashboard
  const stats = [
    {
      label: "মোট ব্যবহারকারী",
      value: loading ? "..." : users.length.toString(),
      icon: Users,
      color: "[color:var(--brand-primary)]",
    },
    {
      label: "মোট কুইজ",
      value: totalQuizzes.toString(),
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      label: "মোট অংশগ্রহণ",
      value: totalParticipations.toString(),
      icon: TrendingUp,
      color: "text-amber-600",
    },
    {
      label: "গড় অংশগ্রহণ",
      value: averageParticipation,
      icon: BarChart3,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl p-6 text-white"
        style={{ backgroundImage: "var(--brand-gradient)" }}
      >
        <h1 className="text-2xl font-bold mb-2">এডমিন ড্যাশবোর্ড</h1>
        <p
          style={{
            color: "color-mix(in oklab, white 80%, var(--brand-secondary))",
          }}
        >
          সিস্টেম পরিসংখ্যান এবং ব্যবস্থাপনা
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>দ্রুত কাজ</CardTitle>
            <CardDescription>সিস্টেম ব্যবস্থাপনা</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "নতুন কুইজ তৈরি",
                "ব্যবহারকারী তালিকা",
                "রিপোর্ট জেনারেট",
                "সেটিংস",
              ].map((action) => (
                <button
                  key={action}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সিস্টেম স্ট্যাটাস</CardTitle>
            <CardDescription>বর্তমান সিস্টেম অবস্থা</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  label: "সার্ভার অবস্থা",
                  status: "সক্রিয়",
                  color: "text-green-600",
                },
                {
                  label: "ডাটাবেস",
                  status: "সক্রিয়",
                  color: "text-green-600",
                },
                {
                  label: "ব্যাকআপ",
                  status: "২৪ ঘন্টা আগে",
                  color: "text-amber-600",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm">{item.label}</span>
                  <span className={`text-sm font-medium ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 📊 Analytics Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8"
      >
        <Card>
          <CardHeader className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>অ্যাক্টিভিটি অ্যানালিটিক্স</CardTitle>
              <CardDescription>রেজিস্ট্রেশন, কুইজ ও অংশগ্রহণ</CardDescription>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 items-center">
              {[
                { key: "day", label: "আজ" },
                { key: "week", label: "সপ্তাহ" },
                { key: "month", label: "মাস" },
                { key: "year", label: "বছর" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setFilter(f.key);
                    setCustomDate("");
                  }}
                  className={`px-3 py-1 rounded-md text-sm border ${
                    filter === f.key
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}

              {/* Custom Date Picker */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setFilter("");
                  }}
                  className="border rounded-md px-2 py-1 text-sm"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="registrations"
                    stroke="#8884d8"
                    name="রেজিস্ট্রেশন"
                  />
                  <Line
                    type="monotone"
                    dataKey="quizzes"
                    stroke="#82ca9d"
                    name="নতুন কুইজ"
                  />
                  <Line
                    type="monotone"
                    dataKey="participations"
                    stroke="#ffc658"
                    name="অংশগ্রহণ"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 🥧 Pie Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-600" />
              <CardTitle>অংশগ্রহণের তুলনামূলক চার্ট</CardTitle>
            </div>
            <CardDescription>মোট ব্যবহারকারী, অংশগ্রহণ ও কুইজ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    dataKey="value"
                    label={(props: any) => {
                      const name = props.name ?? props.payload?.name ?? "";
                      const percent =
                        props.percent ?? props.payload?.percent ?? 0;
                      return `${name} ${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

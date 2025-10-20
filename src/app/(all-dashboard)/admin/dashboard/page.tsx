"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, BarChart3, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboard() {
  const stats = [
    {
      label: "মোট ব্যবহারকারী",
      value: "1,234",
      icon: Users,
      color: "[color:var(--brand-primary)]",
    },
    { label: "মোট কুইজ", value: "45", icon: BookOpen, color: "text-green-600" },
    {
      label: "সক্রিয় ব্যবহারকারী",
      value: "892",
      icon: TrendingUp,
      color: "text-amber-600",
    },
    {
      label: "গড় অংশগ্রহণ",
      value: "72%",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
}

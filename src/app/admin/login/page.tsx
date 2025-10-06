// src/app/admin/login/page.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield, Lock, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginUser } from "@/redux/features/auth/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated as admin
  if (isAuthenticated && user?.role === "admin") {
    router.push("/admin/dashboard");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // For admin login, we'll use email as username
      const result = await dispatch(
        loginUser({
          contact: credentials.username,
          password: credentials.password,
        })
      ).unwrap();

      // Verify the user has admin role
      if (result.user.role !== "admin") {
        toast.error("শুধুমাত্র অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করা যাবে");
        return;
      }

      toast.success("অ্যাডমিন লগইন সফল হয়েছে!");
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "লগইন ব্যর্থ হয়েছে";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black py-[50px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-t-8 border-red-600 bg-gray-800/90 backdrop-blur-md rounded-2xl overflow-hidden">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mx-auto w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-3"
            >
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white">
              অ্যাডমিন লগইন
            </CardTitle>
            <CardDescription className="text-gray-300 mt-2">
              শুধুমাত্র অ্যাডমিন অ্যাকাউন্ট দিয়ে লগইন করুন
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  ইমেইল
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Shield size={18} />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="email"
                    placeholder="admin@example.com"
                    value={credentials.username}
                    onChange={handleInputChange}
                    className="pl-10 text-lg h-12 rounded-xl bg-gray-700/50 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  পাসওয়ার্ড
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="পাসওয়ার্ড লিখুন"
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 text-lg h-12 rounded-xl bg-gray-700/50 border-gray-600 text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-lg py-3 h-12 rounded-xl shadow-md"
                disabled={
                  !credentials.username || !credentials.password || isLoading
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    প্রক্রিয়া চলছে...
                  </>
                ) : (
                  "লগইন করুন"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth"
                className="text-sm text-red-400 hover:text-red-300 hover:underline"
              >
                শিক্ষার্থী লগইন পেজে ফিরে যান
              </Link>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-sm text-gray-400 bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm"
        >
          <p className="font-medium">নিরাপত্তা সতর্কতা</p>
          <p className="mt-1">
            এই পেজটি শুধুমাত্র অ্যাডমিনিস্ট্রেটরদের জন্য। অননুমোদিত প্রবেশ
            নিষিদ্ধ।
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Calendar,
  ChevronLeft,
  Loader2,
  ArrowRight,
  School,
  Hash,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  loginUser,
  registerUser,
  checkUserExists,
  logoutUser,
} from "@/redux/features/auth/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { toast } from "sonner";

export default function AuthPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error, isAuthenticated, user, userCheckLoading } =
    useSelector((state: RootState) => state.auth);

  const [step, setStep] = useState(1);
  const [contactType, setContactType] = useState<"phone" | "email">("phone");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    fullNameBangla: "",
    fullNameEnglish: "",
    age: "",
    grade: "",
    institutionName: "",
    institutionAddress: "",
    rollId: "",
    address: "",
    bloodGroup: "",
    parentContact: "",
    interests: [] as string[],
    futureGoals: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const dashboardPath =
        user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
      router.push(dashboardPath);
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContact(e.target.value);
    setIsExistingUser(null);
  };

  const checkUserExistence = async () => {
    try {
      const result = await dispatch(
        checkUserExists({ contact, contactType })
      ).unwrap();
      setIsExistingUser(result.exists);
      setStep(2);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "ব্যবহারকারী খুঁজে পেতে সমস্যা হয়েছে";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (step === 1) {
        await checkUserExistence();
      } else if (step === 2 && isExistingUser) {
        const result = await dispatch(
          loginUser({ contact, password })
        ).unwrap();

        if (result.user.role !== "student") {
          toast.error("শুধুমাত্র শিক্ষার্থী অ্যাকাউন্ট দিয়ে লগইন করা যাবে");
          await dispatch(logoutUser());
          return;
        }

        toast.success("লগইন সফল হয়েছে!");
        router.push("/student/dashboard");
      } else if (step === 2 && !isExistingUser) {
        const result = await dispatch(
          registerUser({
            ...formData,
            age: Number(formData.age),
            contact,
            contactType,
            password,
          })
        ).unwrap();
        toast.success("নিবন্ধন সফল হয়েছে!");
        router.push("/student/dashboard");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "একটি ত্রুটি ঘটেছে";
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#F06122]" />
          <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full !max-w-xl"
      >
        <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden">
          <CardHeader className="text-center pb-0">
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20  rounded-xl flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={500}
                  height={500}
                  className="object-contain"
                />
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-[#232323]">
              {step === 1
                ? "আপনার অ্যাকাউন্টে প্রবেশ করুন"
                : isExistingUser
                ? "লগইন করুন"
                : "নতুন অ্যাকাউন্ট তৈরি করুন"}
            </CardTitle>

            <CardDescription className="text-gray-600 mt-2">
              {step === 1
                ? "লগইন অথবা রেজিস্ট্রেশন করুন"
                : isExistingUser
                ? "আপনার পাসওয়ার্ড লিখুন"
                : "আপনার তথ্য পূরণ করুন"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-6">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label className="text-gray-700 mb-3 block font-medium">
                        যোগাযোগের মাধ্যম নির্বাচন করুন
                      </Label>
                      <Tabs
                        value={contactType}
                        onValueChange={(value) =>
                          setContactType(value as "phone" | "email")
                        }
                      >
                        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                          <TabsTrigger
                            value="phone"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#232323] rounded-md"
                          >
                            <Phone size={16} /> ফোন
                          </TabsTrigger>
                          <TabsTrigger
                            value="email"
                            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#232323] rounded-md"
                          >
                            <Mail size={16} /> ইমেইল
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="phone" className="mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-700">
                              মোবাইল নম্বর
                            </Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                <Phone size={18} />
                              </div>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="০১৭১২-৩৪৫৬৭৮"
                                value={contact}
                                onChange={handleContactChange}
                                className="pl-10 h-11 rounded-lg border-gray-300"
                                required
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="email" className="mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700">
                              ইমেইল ঠিকানা
                            </Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                <Mail size={18} />
                              </div>
                              <Input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                value={contact}
                                onChange={handleContactChange}
                                className="pl-10 h-11 rounded-lg border-gray-300"
                                required
                              />
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-lg bg-[#232323] hover:bg-[#F06122] text-white transition-colors"
                      disabled={!contact || userCheckLoading}
                    >
                      {userCheckLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          যাচাই করা হচ্ছে...
                        </>
                      ) : (
                        <>
                          পরবর্তী ধাপ
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}

                {step === 2 && isExistingUser && (
                  <motion.div
                    key="step2-login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-4">
                      <div className="bg-gray-100 rounded-lg p-3 inline-flex items-center gap-2">
                        <User className="w-4 h-4 text-[#F06122]" />
                        <span className="text-gray-700 font-medium">
                          {contactType === "phone"
                            ? `ফোন: ${contact}`
                            : `ইমেইল: ${contact}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleBack}
                        className="mt-2 text-sm text-[#F06122] hover:underline flex items-center justify-center mx-auto"
                      >
                        <ChevronLeft size={16} /> পরিবর্তন করুন
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">
                        পাসওয়ার্ড
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <Lock size={18} />
                        </div>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="পাসওয়ার্ড লিখুন"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-11 rounded-lg border-gray-300"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <a
                        href="#"
                        className="text-sm text-[#F06122] hover:underline"
                      >
                        পাসওয়ার্ড ভুলে গেছেন?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-lg bg-[#232323] hover:bg-[#F06122] text-white transition-colors"
                      disabled={!password || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          লগইন হচ্ছে...
                        </>
                      ) : (
                        "লগইন করুন"
                      )}
                    </Button>
                  </motion.div>
                )}

                {step === 2 && !isExistingUser && (
                  <motion.div
                    key="step2-register"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-4">
                      <div className="bg-gray-100 rounded-lg p-3 inline-flex items-center gap-2">
                        <User className="w-4 h-4 text-[#F06122]" />
                        <span className="text-gray-700 font-medium">
                          {contactType === "phone"
                            ? `ফোন: ${contact}`
                            : `ইমেইল: ${contact}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleBack}
                        className="mt-2 text-sm text-[#F06122] hover:underline flex items-center justify-center mx-auto"
                      >
                        <ChevronLeft size={16} /> পরিবর্তন করুন
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="fullNameBangla"
                          className="text-gray-700"
                        >
                          নাম (বাংলা)
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <User size={16} />
                          </div>
                          <Input
                            id="fullNameBangla"
                            placeholder="আপনার নাম"
                            value={formData.fullNameBangla}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullNameBangla: e.target.value,
                              })
                            }
                            className="pl-10 h-10 rounded-lg border-gray-300"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="fullNameEnglish"
                          className="text-gray-700"
                        >
                          নাম (English)
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <User size={16} />
                          </div>
                          <Input
                            id="fullNameEnglish"
                            placeholder="Your name"
                            value={formData.fullNameEnglish}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                fullNameEnglish: e.target.value,
                              })
                            }
                            className="pl-10 h-10 rounded-lg border-gray-300"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-gray-700">
                          বয়স
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <Calendar size={16} />
                          </div>
                          <Input
                            id="age"
                            type="number"
                            placeholder="বয়স"
                            value={formData.age}
                            onChange={(e) =>
                              setFormData({ ...formData, age: e.target.value })
                            }
                            className="pl-10 h-10 rounded-lg border-gray-300"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="grade" className="text-gray-700">
                          শ্রেণি / বর্ষ
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setFormData({ ...formData, grade: value })
                          }
                        >
                          <SelectTrigger className="h-10 rounded-lg w-full border-gray-300">
                            <SelectValue placeholder="শ্রেণি নির্বাচন" />
                          </SelectTrigger>
                          <SelectContent>
                            {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                              <SelectItem key={grade} value={grade.toString()}>
                                {grade}ষ্ঠ শ্রেণি
                              </SelectItem>
                            ))}
                            <SelectItem value="college-1">
                              কলেজ ১ম বর্ষ
                            </SelectItem>
                            <SelectItem value="college-2">
                              কলেজ ২য় বর্ষ
                            </SelectItem>
                            <SelectItem value="college-3">
                              কলেজ ৩য় বর্ষ
                            </SelectItem>
                            <SelectItem value="university-1">
                              বিশ্ববিদ্যালয় ১ম বর্ষ
                            </SelectItem>
                            <SelectItem value="university-2">
                              বিশ্ববিদ্যালয় ২য় বর্ষ
                            </SelectItem>
                            <SelectItem value="university-3">
                              বিশ্ববিদ্যালয় ৩য় বর্ষ
                            </SelectItem>
                            <SelectItem value="university-4">
                              বিশ্ববিদ্যালয় ৪র্থ বর্ষ
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="institutionName"
                          className="text-gray-700"
                        >
                          শিক্ষাপ্রতিষ্ঠানের নাম
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <School size={16} />
                          </div>
                          <Input
                            id="institutionName"
                            placeholder="আপনার শিক্ষাপ্রতিষ্ঠানের নাম"
                            value={formData.institutionName || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                institutionName: e.target.value,
                              })
                            }
                            className="pl-10 h-10 rounded-lg border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="institutionAddress"
                          className="text-gray-700"
                        >
                          শিক্ষাপ্রতিষ্ঠানের ঠিকানা
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <MapPin size={16} />
                          </div>
                          <Input
                            id="institutionAddress"
                            placeholder="শিক্ষাপ্রতিষ্ঠানের ঠিকানা (সংক্ষেপে)"
                            value={formData.institutionAddress || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                institutionAddress: e.target.value,
                              })
                            }
                            className="pl-10 h-10 rounded-lg border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rollId" className="text-gray-700">
                          রোল/আইডি নম্বর
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            <Hash size={16} />
                          </div>
                          <Input
                            id="rollId"
                            placeholder="রোল/আইডি নম্বর (যদি থাকে)"
                            value={formData.rollId || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                rollId: e.target.value,
                              })
                            }
                            className="pl-10 h-10 rounded-lg border-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-700">
                        ঠিকানা
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <MapPin size={16} />
                        </div>
                        <Input
                          id="address"
                          placeholder="গ্রাম/পাড়া, উপজেলা, জেলা"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          className="pl-10 h-10 rounded-lg border-gray-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">
                        আগ্রহের বিষয় (ঐচ্ছিক)
                      </Label>
                      <MultiSelect
                        options={[
                          { label: "গণিত", value: "গণিত" },
                          { label: "বিজ্ঞান", value: "বিজ্ঞান" },
                          { label: "ইতিহাস", value: "ইতিহাস" },
                          { label: "বাংলা", value: "বাংলা" },
                          { label: "ইংরেজি", value: "ইংরেজি" },
                          { label: "সাধারণ জ্ঞান", value: "সাধারণ জ্ঞান" },
                          { label: "ভূগোল", value: "ভূগোল" },
                          { label: "অর্থনীতি", value: "অর্থনীতি" },
                          { label: "রাজনীতি", value: "রাজনীতি" },
                          { label: "সাহিত্য", value: "সাহিত্য" },
                          { label: "দর্শন", value: "দর্শন" },
                          { label: "মনোবিজ্ঞান", value: "মনোবিজ্ঞান" },
                        ]}
                        selected={formData.interests}
                        onChange={(selected) =>
                          setFormData({ ...formData, interests: selected })
                        }
                        placeholder="আপনার আগ্রহের বিষয় নির্বাচন করুন"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">
                        পাসওয়ার্ড
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <Lock size={16} />
                        </div>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="পাসওয়ার্ড লিখুন"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-10 rounded-lg border-gray-300"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-lg bg-[#232323] hover:bg-[#F06122] text-white transition-colors"
                      disabled={
                        !formData.fullNameBangla ||
                        !formData.fullNameEnglish ||
                        !formData.age ||
                        !formData.grade ||
                        !formData.address ||
                        isLoading
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          নিবন্ধন হচ্ছে...
                        </>
                      ) : (
                        "নিবন্ধন করুন"
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-sm text-gray-600 bg-white p-4 rounded-lg border"
        >
          <p className="font-medium">তথ্য সুরক্ষা নিশ্চিত</p>
          <p className="mt-1 text-xs">
            আপনার তথ্য শুধুমাত্র কুইজ প্রতিযোগিতা ও শিক্ষার্থী উন্নয়নের কাজে
            ব্যবহৃত হবে
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, store } from "@/store/store";
import {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
} from "@/redux/features/auth/authSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Save,
  Edit,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";

// Extended User interface to include all fields used in profileData
interface User {
  id: string;
  fullNameBangla: string;
  fullNameEnglish: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  union?: string;
  postOffice?: string;
  upazila?: string;
  district?: string;
  address?: string;
  grade?: string;
  institutionName?: string;
  institutionAddress?: string;
  rollId?: string;
  contact: string;
  parentContact?: string;
  bloodGroup?: string;
  specialNeeds?: string;
  hasSmartphone?: boolean;
  internetUsage?: "always" | "sometimes" | "never";
  interests?: string[];
  preferredSubjects?: string[];
  futureGoals?: string;
  profileImage?: string;
  role: "student" | "admin";
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, isAuthInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.profileImage || null
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [profileData, setProfileData] = useState<Partial<User>>({
    fullNameBangla: user?.fullNameBangla || "",
    fullNameEnglish: user?.fullNameEnglish || "",
    fatherName: user?.fatherName || "",
    motherName: user?.motherName || "",
    dateOfBirth: user?.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : "",
    age: user?.age || 0,
    gender: user?.gender || "",
    union: user?.union || "",
    postOffice: user?.postOffice || "",
    upazila: user?.upazila || "",
    district: user?.district || "",
    address: user?.address || "",
    grade: user?.grade || "",
    institutionName: user?.institutionName || "",
    institutionAddress: user?.institutionAddress || "",
    rollId: user?.rollId || "",
    contact: user?.contact || "",
    parentContact: user?.parentContact || "",
    bloodGroup: user?.bloodGroup || "",
    specialNeeds: user?.specialNeeds || "",
    hasSmartphone: user?.hasSmartphone || false,
    internetUsage: user?.internetUsage || "never",
    interests: user?.interests || [],
    preferredSubjects: user?.preferredSubjects || [],
    futureGoals: user?.futureGoals || "",
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const state = store.getState() as RootState;
    if (!state.auth.user || !state.auth.isAuthInitialized) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullNameBangla: user.fullNameBangla || "",
        fullNameEnglish: user.fullNameEnglish || "",
        fatherName: user.fatherName || "",
        motherName: user.motherName || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        age: user.age || 0,
        gender: user.gender || "",
        union: user.union || "",
        postOffice: user.postOffice || "",
        upazila: user.upazila || "",
        district: user.district || "",
        address: user.address || "",
        grade: user.grade || "",
        institutionName: user.institutionName || "",
        institutionAddress: user.institutionAddress || "",
        rollId: user.rollId || "",
        contact: user.contact || "",
        parentContact: user.parentContact || "",
        bloodGroup: user.bloodGroup || "",
        specialNeeds: user.specialNeeds || "",
        hasSmartphone: user.hasSmartphone || false,
        internetUsage: user.internetUsage || "never",
        interests: user.interests || [],
        preferredSubjects: user.preferredSubjects || [],
        futureGoals: user.futureGoals || "",
      });
      setImagePreview(user.profileImage || null);
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Helper to append only non-empty values
      const appendIfValid = (key: string, value: unknown) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
          } else {
            formData.append(key, value.toString());
          }
        }
      };

      // Append profile fields, skipping empties for optionals
      Object.entries(profileData).forEach(([key, value]) => {
        if (key === "dateOfBirth" && value) {
          // Ensure valid date string
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            formData.append(key, date.toISOString().split("T")[0]); // Send YYYY-MM-DD
          }
        } else {
          appendIfValid(key, value);
        }
      });

      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      await dispatch(updateUserProfile(formData)).unwrap();
      toast.success("প্রোফাইল সফলভাবে আপডেট করা হয়েছে");
      setIsEditing(false);
      setSelectedImage(null);
      dispatch(fetchUserProfile()); // Refresh
    } catch (error: unknown) {
      console.error("Update error:", error); // Log for debugging
      const errorMessage =
        error instanceof Error
          ? error.message
          : "প্রোফাইল আপডেট করতে সমস্যা হয়েছে";
      toast.error(errorMessage);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("নতুন পাসওয়ার্ডগুলি মেলে না");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();
      toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে");
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে";
      toast.error(errorMessage);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("অবশ্যই একটি ছবি ফাইল নির্বাচন করুন");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("ছবির আকার ৫ MB এর বেশি হতে পারে না");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(user?.profileImage || null);
  };

  const toggleInterest = (interest: string) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...(prev.interests || []), interest],
    }));
  };

  const toggleSubject = (subject: string) => {
    setProfileData((prev) => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects?.includes(subject)
        ? prev.preferredSubjects.filter((s) => s !== subject)
        : [...(prev.preferredSubjects || []), subject],
    }));
  };

  const interestOptions = [
    "গণিত",
    "বিজ্ঞান",
    "ইতিহাস",
    "বাংলা",
    "ইংরেজি",
    "সাধারণ জ্ঞান",
    "ভূগোল",
    "কম্পিউটার",
    "শিল্প",
    "সংগীত",
    "ক্রীড়া",
    "বই পড়া",
  ];

  const subjectOptions = [
    "গণিত",
    "বিজ্ঞান",
    "ইতিহাস",
    "বাংলা",
    "ইংরেজি",
    "ভূগোল",
    "কম্পিউটার",
    "শিল্প",
    "সংগীত",
    "শারীরিক শিক্ষা",
  ];

  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        কোনো ব্যবহারকারী তথ্য পাওয়া যায়নি।
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">প্রোফাইল ব্যবস্থাপনা</h1>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                বাতিল
              </Button>
              <Button onClick={handleProfileUpdate} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> সংরক্ষণ
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> সম্পাদনা
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="profile">প্রোফাইল তথ্য</TabsTrigger>
          <TabsTrigger value="security">সুরক্ষা</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>প্রোফাইল ওভারভিউ</CardTitle>
                <CardDescription>আপনার ব্যক্তিগত তথ্য</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-blue-600" />
                      )}
                    </div>
                    {isEditing && (
                      <div className="absolute bottom-0 right-0 flex space-x-1">
                        <Label
                          htmlFor="profileImage"
                          className="cursor-pointer"
                        >
                          <div className="bg-blue-600 text-white p-1 rounded-full">
                            <Upload className="w-4 h-4" />
                          </div>
                          <Input
                            id="profileImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </Label>
                        {imagePreview && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={removeImage}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {user.fullNameEnglish}
                    </h3>
                    <p className="text-gray-600">{user.fullNameBangla}</p>
                    <Badge variant="secondary" className="mt-2">
                      {user.role === "student" ? "শিক্ষার্থী" : "এডমিন"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{user.contact}</span>
                  </div>
                  {user.parentContact && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>অভিভাবক: {user.parentContact}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="line-clamp-1">{user.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
                <CardDescription>
                  {isEditing ? "আপনার তথ্য আপডেট করুন" : "আপনার ব্যক্তিগত তথ্য"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">ব্যক্তিগত তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullNameBangla">নাম (বাংলায়)</Label>
                        <Input
                          id="fullNameBangla"
                          value={profileData.fullNameBangla || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              fullNameBangla: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullNameEnglish">নাম (ইংরেজিতে)</Label>
                        <Input
                          id="fullNameEnglish"
                          value={profileData.fullNameEnglish || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              fullNameEnglish: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>
                    {/* ... (rest of the form fields remain the same, with optional chaining where needed) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="fatherName">পিতার নাম</Label>
                        <Input
                          id="fatherName"
                          value={profileData.fatherName || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              fatherName: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="motherName">মাতার নাম</Label>
                        <Input
                          id="motherName"
                          value={profileData.motherName || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              motherName: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">জন্ম তারিখ</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dateOfBirth || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              dateOfBirth: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">বয়স</Label>
                        <Input
                          id="age"
                          type="number"
                          value={profileData.age || 0}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              age: Number(e.target.value),
                            })
                          }
                          disabled={!isEditing}
                          min="5"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="gender">লিঙ্গ</Label>
                      <Select
                        value={profileData.gender || ""}
                        onValueChange={(value) =>
                          setProfileData({ ...profileData, gender: value })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="লিঙ্গ নির্বাচন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">পুরুষ</SelectItem>
                          <SelectItem value="female">নারী</SelectItem>
                          <SelectItem value="other">অন্যান্য</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">ঠিকানা তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="union">ইউনিয়ন</Label>
                        <Input
                          id="union"
                          value={profileData.union || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              union: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postOffice">ডাকঘর</Label>
                        <Input
                          id="postOffice"
                          value={profileData.postOffice || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              postOffice: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="upazila">উপজেলা</Label>
                        <Input
                          id="upazila"
                          value={profileData.upazila || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              upazila: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">জেলা</Label>
                        <Input
                          id="district"
                          value={profileData.district || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              district: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="address">সম্পূর্ণ ঠিকানা</Label>
                      <Textarea
                        id="address"
                        value={profileData.address || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            address: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        rows={2}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">শিক্ষাগত তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grade">শ্রেণি / বর্ষ</Label>
                        <Select
                          value={profileData.grade || ""}
                          onValueChange={(value) =>
                            setProfileData({ ...profileData, grade: value })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="শ্রেণি নির্বাচন" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6">৬ষ্ঠ শ্রেণি</SelectItem>
                            <SelectItem value="7">৭ম শ্রেণি</SelectItem>
                            <SelectItem value="8">৮ম শ্রেণি</SelectItem>
                            <SelectItem value="9">৯ম শ্রেণি</SelectItem>
                            <SelectItem value="10">১০ম শ্রেণি</SelectItem>
                            <SelectItem value="11">১১শ শ্রেণি</SelectItem>
                            <SelectItem value="12">১২শ শ্রেণি</SelectItem>
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
                        <Label htmlFor="institutionName">
                          শিক্ষাপ্রতিষ্ঠানের নাম
                        </Label>
                        <Input
                          id="institutionName"
                          value={profileData.institutionName || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              institutionName: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="আপনার শিক্ষাপ্রতিষ্ঠানের নাম"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="institutionAddress">
                          শিক্ষাপ্রতিষ্ঠানের ঠিকানা
                        </Label>
                        <Input
                          id="institutionAddress"
                          value={profileData.institutionAddress || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              institutionAddress: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="শিক্ষাপ্রতিষ্ঠানের ঠিকানা (সংক্ষেপে)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rollId">রোল/আইডি নম্বর</Label>
                        <Input
                          id="rollId"
                          value={profileData.rollId || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              rollId: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="রোল/আইডি নম্বর (যদি থাকে)"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">যোগাযোগ তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact">যোগাযোগ নম্বর/ইমেইল</Label>
                        <Input
                          id="contact"
                          value={profileData.contact || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              contact: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentContact">
                          অভিভাবকের যোগাযোগ নম্বর
                        </Label>
                        <Input
                          id="parentContact"
                          value={profileData.parentContact || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              parentContact: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="০১৭XXXXXXXX"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">স্বাস্থ্য তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bloodGroup">রক্তের গ্রুপ</Label>
                        <Select
                          value={profileData.bloodGroup || ""}
                          onValueChange={(value) =>
                            setProfileData({
                              ...profileData,
                              bloodGroup: value,
                            })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="রক্তের গ্রুপ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialNeeds">
                          বিশেষ প্রয়োজনীয়তা
                        </Label>
                        <Input
                          id="specialNeeds"
                          value={profileData.specialNeeds || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              specialNeeds: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="যদি থাকে"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">ডিজিটাল সক্ষমতা</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hasSmartphone" className="flex-1">
                          স্মার্টফোন আছে?
                        </Label>
                        <Switch
                          id="hasSmartphone"
                          checked={profileData.hasSmartphone || false}
                          onCheckedChange={(checked) =>
                            setProfileData({
                              ...profileData,
                              hasSmartphone: checked,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="internetUsage">ইন্টারনেট ব্যবহার</Label>
                        <Select
                          value={profileData.internetUsage || "never"}
                          onValueChange={(
                            value: "always" | "sometimes" | "never"
                          ) =>
                            setProfileData({
                              ...profileData,
                              internetUsage: value,
                            })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="ইন্টারনেট ব্যবহারের হার" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="always">নিয়মিত</SelectItem>
                            <SelectItem value="sometimes">মাঝে মাঝে</SelectItem>
                            <SelectItem value="never">কখনো না</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">আগ্রহ ও দক্ষতা</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">আগ্রহের বিষয়</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {interestOptions.map((interest) => (
                            <button
                              key={interest}
                              type="button"
                              onClick={() =>
                                isEditing && toggleInterest(interest)
                              }
                              className={`p-2 rounded-lg text-sm transition-all ${
                                profileData.interests?.includes(interest)
                                  ? "bg-blue-100 border border-blue-300 text-blue-700"
                                  : "bg-gray-100 border border-transparent text-gray-700 hover:bg-gray-200"
                              } ${
                                !isEditing ? "cursor-default" : "cursor-pointer"
                              }`}
                            >
                              {interest}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block">পছন্দের বিষয়</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {subjectOptions.map((subject) => (
                            <button
                              key={subject}
                              type="button"
                              onClick={() =>
                                isEditing && toggleSubject(subject)
                              }
                              className={`p-2 rounded-lg text-sm transition-all ${
                                profileData.preferredSubjects?.includes(subject)
                                  ? "bg-green-100 border border-green-300 text-green-700"
                                  : "bg-gray-100 border border-transparent text-gray-700 hover:bg-gray-200"
                              } ${
                                !isEditing ? "cursor-default" : "cursor-pointer"
                              }`}
                            >
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">ভবিষ্যত লক্ষ্য</h3>
                    <div className="space-y-2">
                      <Label htmlFor="futureGoals">
                        আমি বড় হয়ে কি হতে চাই
                      </Label>
                      <Textarea
                        id="futureGoals"
                        value={profileData.futureGoals || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            futureGoals: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        rows={3}
                        placeholder="আপনার ভবিষ্যত লক্ষ্য বা পরিকল্পনা লিখুন..."
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>সুরক্ষা সেটিংস</CardTitle>
              <CardDescription>
                আপনার অ্যাকাউন্ট সুরক্ষা ব্যবস্থাপনা
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isChangingPassword ? (
                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-4 max-w-md"
                >
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">বর্তমান পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-3 text-gray-500"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-gray-500"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      নতুন পাসওয়ার্ড নিশ্চিত করুন
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-gray-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      পাসওয়ার্ড পরিবর্তন
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsChangingPassword(false)}
                    >
                      বাতিল
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      পাসওয়ার্ড সুরক্ষা
                    </h4>
                    <p className="text-sm text-blue-700">
                      নিয়মিত আপনার পাসওয়ার্ড পরিবর্তন করে আপনার অ্যাকাউন্ট
                      সুরক্ষিত রাখুন।
                    </p>
                  </div>
                  <Button onClick={() => setIsChangingPassword(true)}>
                    পাসওয়ার্ড পরিবর্তন
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;

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
  Shield,
  Settings,
  Key,
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
  isSuperAdmin?: boolean;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AdminProfilePage = () => {
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

  // Load user profile on component mount
  useEffect(() => {
    if (user && !isLoading) {
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
  }, [user, isLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();

      // Add all profile data
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item) => formData.append(key, item));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add image if selected
      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      await dispatch(updateUserProfile(formData)).unwrap();
      toast.success("প্রোফাইল সফলভাবে আপডেট করা হয়েছে");
      setIsEditing(false);
      setSelectedImage(null);
    } catch (error) {
      toast.error("প্রোফাইল আপডেট করতে সমস্যা হয়েছে");
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("নতুন পাসওয়ার্ড মিলছে না");
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (error) {
      toast.error("পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে");
    }
  };

  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const interestOptions = [
    "গণিত",
    "বিজ্ঞান",
    "ইতিহাস",
    "বাংলা",
    "ইংরেজি",
    "সাধারণ জ্ঞান",
    "ভূগোল",
    "অর্থনীতি",
    "রাজনীতি",
    "সাহিত্য",
    "দর্শন",
    "মনোবিজ্ঞান",
  ];

  if (isLoading && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#F06122]" />
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">ব্যবহারকারী পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">প্রোফাইল</h1>
          <p className="text-gray-600">
            আপনার প্রোফাইল তথ্য দেখুন এবং সম্পাদনা করুন
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {(user as { isSuperAdmin?: boolean }).isSuperAdmin
              ? "সুপার এডমিন"
              : "এডমিন"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            প্রোফাইল
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            সেটিংস
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            নিরাপত্তা
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
                  <CardDescription>
                    আপনার ব্যক্তিগত তথ্য দেখুন এবং সম্পাদনা করুন
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? "বাতিল" : "সম্পাদনা"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-[#F06122] text-white rounded-full p-2 cursor-pointer hover:bg-[#F06122]/90">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {user.fullNameBangla}
                  </h3>
                  <p className="text-gray-600">{user.fullNameEnglish}</p>
                  <Badge variant="secondary" className="mt-2">
                    {user.role === "admin" ? "এডমিন" : "শিক্ষার্থী"}
                  </Badge>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="font-semibold mb-4">মৌলিক তথ্য</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullNameBangla">নাম (বাংলা)</Label>
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
                      placeholder="আপনার বাংলা নাম"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullNameEnglish">নাম (English)</Label>
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
                      placeholder="আপনার ইংরেজি নাম"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">বয়স</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          age: parseInt(e.target.value) || 0,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="বয়স"
                    />
                  </div>
                  <div className="space-y-2">
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
                        <SelectItem value="female">মহিলা</SelectItem>
                        <SelectItem value="other">অন্যান্য</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="font-semibold mb-4">যোগাযোগ তথ্য</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact">যোগাযোগ নম্বর</Label>
                    <Input
                      id="contact"
                      value={profileData.contact || ""}
                      disabled
                      placeholder="যোগাযোগ নম্বর"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentContact">অভিভাবকের যোগাযোগ</Label>
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
                      placeholder="অভিভাবকের যোগাযোগ নম্বর"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">ঠিকানা</Label>
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
                      placeholder="পূর্ণ ঠিকানা"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    বাতিল
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-[#F06122] hover:bg-[#F06122]/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    সংরক্ষণ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>সেটিংস</CardTitle>
              <CardDescription>
                আপনার অ্যাকাউন্ট সেটিংস পরিচালনা করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">স্মার্টফোন আছে</h4>
                  <p className="text-sm text-gray-600">
                    আপনার কাছে স্মার্টফোন আছে কিনা
                  </p>
                </div>
                <Switch
                  checked={profileData.hasSmartphone || false}
                  onCheckedChange={(checked) =>
                    setProfileData({ ...profileData, hasSmartphone: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internetUsage">ইন্টারনেট ব্যবহার</Label>
                <Select
                  value={profileData.internetUsage || "never"}
                  onValueChange={(value: "always" | "sometimes" | "never") =>
                    setProfileData({ ...profileData, internetUsage: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ইন্টারনেট ব্যবহারের পরিমাণ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">সবসময়</SelectItem>
                    <SelectItem value="sometimes">কখনো কখনো</SelectItem>
                    <SelectItem value="never">কখনোই না</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
                  <CardDescription>
                    আপনার অ্যাকাউন্টের নিরাপত্তার জন্য পাসওয়ার্ড পরিবর্তন করুন
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  variant={isChangingPassword ? "outline" : "default"}
                >
                  {isChangingPassword ? "বাতিল" : "পাসওয়ার্ড পরিবর্তন"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isChangingPassword ? (
                <div className="space-y-4">
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
                        placeholder="বর্তমান পাসওয়ার্ড"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
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
                        placeholder="নতুন পাসওয়ার্ড"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      পাসওয়ার্ড নিশ্চিত করুন
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
                        placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button
                      onClick={() => setIsChangingPassword(false)}
                      variant="outline"
                    >
                      বাতিল
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      className="bg-[#F06122] hover:bg-[#F06122]/90"
                    >
                      পাসওয়ার্ড পরিবর্তন
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    আপনার অ্যাকাউন্টের নিরাপত্তার জন্য নিয়মিত পাসওয়ার্ড
                    পরিবর্তন করুন
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProfilePage;

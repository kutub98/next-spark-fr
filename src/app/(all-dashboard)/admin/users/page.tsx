"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Users,
  UserCheck,
  Filter,
  RefreshCw,
  Download,
  MessageSquare,
} from "lucide-react";
import { UserCard } from "@/components/admin/UserCard";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import { BulkMessagingDialog } from "@/components/admin/BulkMessagingDialog";
import {
  getAllUsers,
  selectAllUsers,
  selectUsersLoading,
  selectUsersError,
  clearSelectedUserDetails,
  AdminUser,
} from "@/redux/features/usersSlice";

const UsersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectAllUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkMessageOpen, setBulkMessageOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<"all" | "student" | "admin">(
    "all"
  );

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullNameEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullNameBangla.includes(searchTerm) ||
      user.contact.includes(searchTerm);

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const handleViewDetails = (user: AdminUser) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
      dispatch(clearSelectedUserDetails());
    }
  };

  const handleRefresh = () => {
    dispatch(getAllUsers());
  };

  const getStats = () => {
    const totalUsers = users.length;
    const studentCount = users.filter((user) => user.role === "student").length;
    const adminCount = users.filter((user) => user.role === "admin").length;
    const activeCount = users.filter(
      (user) => user.isActive === undefined || user.isActive !== false
    ).length;

    return { totalUsers, studentCount, adminCount, activeCount };
  };

  const stats = getStats();

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-red-600">
              <p className="text-lg">ত্রুটি: {error}</p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="ml-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                পুনরায় চেষ্টা করুন
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ব্যবহারকারী ব্যবস্থাপনা
          </h1>
          <p className="text-gray-600 mt-1">
            সকল নিবন্ধিত ব্যবহারকারীদের তালিকা ও বিস্তারিত তথ্য
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            রিফ্রেশ
          </Button>
          <Button
            variant="outline"
            onClick={() => setBulkMessageOpen(true)}
            className="flex items-center gap-2 text-[#F06122] border-[#F06122]/30 hover:bg-[#F06122]/10"
          >
            <MessageSquare className="h-4 w-4" />
            গণ বার্তা
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            এক্সপোর্ট
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  মোট ব্যবহারকারী
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#F06122]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">শিক্ষার্থী</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.studentCount}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">অ্যাডমিন</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.adminCount}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">সক্রিয়</p>
                <p className="text-2xl font-bold text-[#F06122]">
                  {stats.activeCount}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-[#F06122]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="নাম, ফোন নম্বর বা ইমেইল দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex gap-2">
                <Button
                  variant={filterRole === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole("all")}
                >
                  সকল
                </Button>
                <Button
                  variant={filterRole === "student" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole("student")}
                >
                  শিক্ষার্থী
                </Button>
                <Button
                  variant={filterRole === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRole("admin")}
                >
                  অ্যাডমিন
                </Button>
              </div>
            </div>
          </div>

          {searchTerm && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">
                &quot;{searchTerm}&quot; এর জন্য {filteredUsers.length} টি ফলাফল
                পাওয়া গেছে
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="text-[#F06122] hover:text-[#F06122]/80"
              >
                ক্লিয়ার
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F06122] mx-auto mb-4"></div>
            <p className="text-gray-600">
              ব্যবহারকারীদের তথ্য লোড করা হচ্ছে...
            </p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              কোনো ব্যবহারকারী পাওয়া যায়নি
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "আপনার অনুসন্ধান অনুযায়ী কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি।"
                : "এখনো কোনো ব্যবহারকারী নিবন্ধিত হননি।"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* User Details Dialog */}
      <UserDetailsDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />

      {/* Bulk Messaging Dialog */}
      <BulkMessagingDialog
        users={filteredUsers}
        open={bulkMessageOpen}
        onOpenChange={setBulkMessageOpen}
      />
    </div>
  );
};

export default UsersPage;

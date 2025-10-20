"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  Eye,
} from "lucide-react";
import { AdminUser } from "@/redux/features/usersSlice";

interface UserCardProps {
  user: AdminUser;
  onViewDetails: (user: AdminUser) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onViewDetails }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getContactIcon = () => {
    return user.contactType === "email" ? (
      <Mail className="h-4 w-4" />
    ) : (
      <Phone className="h-4 w-4" />
    );
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#F06122]/60">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profileImage} alt={user.fullNameEnglish} />
              <AvatarFallback className="bg-[#F06122]/10 text-[#F06122] font-semibold">
                {getInitials(user.fullNameEnglish)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {user.fullNameEnglish}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                {user.fullNameBangla}
              </p>
              <Badge
                variant={user.role === "admin" ? "destructive" : "secondary"}
                className="mt-1"
              >
                {user.role === "admin" ? "অ্যাডমিন" : "শিক্ষার্থী"}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(user)}
            className="flex items-center gap-2 hover:bg-[#F06122]/10"
          >
            <Eye className="h-4 w-4" />
            বিস্তারিত
          </Button>
        </div>

        <div className="space-y-3">
          {/* Contact Information */}
          <div className="flex items-center space-x-3 text-sm">
            {getContactIcon()}
            <span className="text-gray-700">{user.contact}</span>
            <Badge variant="outline" className="text-xs">
              {user.contactType === "email" ? "ইমেইল" : "ফোন"}
            </Badge>
          </div>

          {/* Age and Grade */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>বয়স: {user.age} বছর</span>
            </div>
            {user.grade && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <GraduationCap className="h-4 w-4" />
                <span>শ্রেণি: {user.grade}</span>
              </div>
            )}
          </div>

          {/* Location */}
          {user.district && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {user.upazila && `${user.upazila}, `}
                {user.district}
              </span>
            </div>
          )}

          {/* Institution */}
          {user.institutionName && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">প্রতিষ্ঠান:</span>{" "}
              {user.institutionName}
            </div>
          )}

          {/* Join Date */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-gray-500">
              যোগদান: {formatDate(user.createdAt)}
            </span>
            {user.isActive !== undefined && (
              <Badge
                variant={user.isActive ? "default" : "destructive"}
                className="text-xs"
              >
                {user.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

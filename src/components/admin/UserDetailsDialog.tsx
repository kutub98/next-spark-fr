"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  Trophy,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import {
  AdminUser,
  UserDetails,
  UserParticipation,
} from "@/redux/features/usersSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  getUserDetails,
  selectSelectedUserDetails,
  selectDetailsLoading,
} from "@/redux/features/usersSlice";

interface UserDetailsDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const userDetails = useSelector(selectSelectedUserDetails);
  const loading = useSelector(selectDetailsLoading);

  useEffect(() => {
    if (user && open) {
      dispatch(getUserDetails(user._id));
    }
  }, [user, open, dispatch]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: { label: "সম্পন্ন", variant: "default" as const },
      failed: { label: "অকৃতকার্য", variant: "destructive" as const },
      pending: { label: "অপেক্ষমান", variant: "secondary" as const },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "outline" as const,
      }
    );
  };

  const getEventStatusBadge = (status: string) => {
    const statusMap = {
      upcoming: { label: "আসন্ন", variant: "secondary" as const },
      ongoing: { label: "চলমান", variant: "default" as const },
      completed: { label: "সমাপ্ত", variant: "outline" as const },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "outline" as const,
      }
    );
  };

  const handleContactClick = (contact: string, contactType: string) => {
    if (contactType === "phone") {
      // WhatsApp link
      const whatsappUrl = `https://wa.me/88${contact.replace(/[^0-9]/g, "")}`;
      window.open(whatsappUrl, "_blank");
    } else if (contactType === "email") {
      // Email link
      window.open(`mailto:${contact}`, "_blank");
    }
  };

  const handlePhoneCall = (contact: string) => {
    window.open(`tel:${contact}`, "_blank");
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            শিক্ষার্থীর বিস্তারিত তথ্য
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[80vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F06122]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Profile Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={user.profileImage}
                        alt={user.fullNameEnglish}
                      />
                      <AvatarFallback className="bg-[#F06122]/10 text-[#F06122] font-bold text-lg">
                        {getInitials(user.fullNameEnglish)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {user.fullNameEnglish}
                          </h2>
                          <p className="text-lg text-gray-600 font-medium">
                            {user.fullNameBangla}
                          </p>
                        </div>
                        <Badge
                          variant={
                            user.role === "admin" ? "destructive" : "secondary"
                          }
                          className="text-sm"
                        >
                          {user.role === "admin" ? "অ্যাডমিন" : "শিক্ষার্থী"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">বয়স: {user.age} বছর</span>
                        </div>
                        {user.grade && (
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              শ্রেণি: {user.grade}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    যোগাযোগের তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {user.contactType === "email" ? (
                        <Mail className="h-5 w-5 text-[#F06122]" />
                      ) : (
                        <Phone className="h-5 w-5 text-green-600" />
                      )}
                      <span className="font-medium">{user.contact}</span>
                      <Badge variant="outline">
                        {user.contactType === "email" ? "ইমেইল" : "ফোন"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {user.contactType === "phone" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleContactClick(user.contact, user.contactType)
                            }
                            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePhoneCall(user.contact)}
                            className="flex items-center gap-2 bg-[#F06122]/10 hover:bg-[#F06122]/20 text-[#F06122] border-[#F06122]/30"
                          >
                            <Phone className="h-4 w-4" />
                            কল করুন
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {user.contactType === "email" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleContactClick(user.contact, user.contactType)
                          }
                          className="flex items-center gap-2 bg-[#F06122]/10 hover:bg-[#F06122]/20 text-[#F06122] border-[#F06122]/30"
                        >
                          <Mail className="h-4 w-4" />
                          ইমেইল পাঠান
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {user.parentContact && (
                    <div className="flex items-center space-x-3 pt-2 border-t">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        অভিভাবকের নম্বর: {user.parentContact}
                      </span>
                    </div>
                  )}

                  {user.whatsappNumber &&
                    user.whatsappNumber !== user.contact && (
                      <div className="flex items-center space-x-3 pt-2 border-t">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          WhatsApp নম্বর: {user.whatsappNumber}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const whatsappUrl = `https://wa.me/88${user.whatsappNumber?.replace(
                              /[^0-9]/g,
                              ""
                            )}`;
                            window.open(whatsappUrl, "_blank");
                          }}
                          className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs px-2 py-1 h-auto"
                        >
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Address Information */}
              {(user.address || user.district) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      ঠিকানা
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {user.address && (
                        <p className="text-sm">{user.address}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {user.union && <span>{user.union}</span>}
                        {user.postOffice && <span>• {user.postOffice}</span>}
                        {user.upazila && <span>• {user.upazila}</span>}
                        {user.district && <span>• {user.district}</span>}
                        {user.division && <span>• {user.division}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Educational Information */}
              {user.institutionName && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      শিক্ষা প্রতিষ্ঠান
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">{user.institutionName}</p>
                    {user.institutionAddress && (
                      <p className="text-sm text-gray-600">
                        {user.institutionAddress}
                      </p>
                    )}
                    {user.rollId && (
                      <p className="text-sm">রোল নম্বর: {user.rollId}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Participation History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    অংশগ্রহণের ইতিহাস
                    {userDetails?.participations && (
                      <Badge variant="outline" className="ml-2">
                        {userDetails.participations.length} টি অংশগ্রহণ
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userDetails?.participations &&
                  userDetails.participations.length > 0 ? (
                    <div className="space-y-4">
                      {userDetails.participations.map(
                        (participation: UserParticipation) => (
                          <Card
                            key={participation._id}
                            className="border-l-4 border-l-[#F06122]/60"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-lg">
                                    {participation.event?.title ||
                                      "Unknown Event"}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    কুইজ:{" "}
                                    {participation.quiz?.title ||
                                      "Unknown Quiz"}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge
                                    {...getStatusBadge(participation.status)}
                                  >
                                    {getStatusBadge(participation.status).label}
                                  </Badge>
                                  {participation.event?.status && (
                                    <Badge
                                      className="text-xs"
                                      {...getEventStatusBadge(
                                        participation.event.status
                                      )}
                                    >
                                      {
                                        getEventStatusBadge(
                                          participation.event.status
                                        ).label
                                      }
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-[#F06122]" />
                                  <span className="text-sm">
                                    স্কোর: {participation.totalScore}
                                    {participation.quiz?.totalMarks && (
                                      <span className="text-gray-500">
                                        /{participation.quiz.totalMarks}
                                      </span>
                                    )}
                                  </span>
                                </div>
                                {participation.quiz?.passingMarks && (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">
                                      পাস মার্ক:{" "}
                                      {participation.quiz.passingMarks}
                                    </span>
                                  </div>
                                )}
                                {participation.quiz?.duration && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm">
                                      সময়: {participation.quiz.duration} মিনিট
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  {participation.status === "completed" ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  <span className="text-sm">
                                    {participation.status === "completed"
                                      ? participation.totalScore >=
                                        (participation.quiz?.passingMarks || 0)
                                        ? "উত্তীর্ণ"
                                        : "অনুত্তীর্ণ"
                                      : "অসম্পূর্ণ"}
                                  </span>
                                </div>
                              </div>

                              <div className="text-xs text-gray-500 border-t pt-2">
                                অংশগ্রহণের তারিখ:{" "}
                                {formatDateTime(participation.createdAt)}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>এখনো কোনো কুইজে অংশগ্রহণ করেননি</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              {(user.interests?.length ||
                user.preferredSubjects?.length ||
                user.futureGoals) && (
                <Card>
                  <CardHeader>
                    <CardTitle>অতিরিক্ত তথ্য</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {user.interests && user.interests.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">আগ্রহের বিষয়:</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.interests.map((interest, index) => (
                            <Badge key={index} variant="outline">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.preferredSubjects &&
                      user.preferredSubjects.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">পছন্দের বিষয়:</h4>
                          <div className="flex flex-wrap gap-2">
                            {user.preferredSubjects.map((subject, index) => (
                              <Badge key={index} variant="secondary">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    {user.futureGoals && (
                      <div>
                        <h4 className="font-medium mb-2">ভবিষ্যৎ লক্ষ্য:</h4>
                        <p className="text-sm text-gray-700">
                          {user.futureGoals}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

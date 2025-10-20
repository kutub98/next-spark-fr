"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Send,
  Users,
  Phone,
  Mail,
  MessageCircle,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AdminUser } from "@/redux/features/usersSlice";
import { toast } from "sonner";

interface BulkMessagingDialogProps {
  users: AdminUser[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type MessageType = "sms" | "whatsapp";

interface SelectedUser extends AdminUser {
  canReceiveSMS: boolean;
  canReceiveWhatsApp: boolean;
}

export const BulkMessagingDialog: React.FC<BulkMessagingDialogProps> = ({
  users,
  open,
  onOpenChange,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<MessageType>("whatsapp");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Process users to determine messaging capabilities
  const processedUsers: SelectedUser[] = users.map((user) => ({
    ...user,
    canReceiveSMS: user.contactType === "phone" || !!user.whatsappNumber,
    canReceiveWhatsApp: !!user.whatsappNumber || user.contactType === "phone",
  }));

  // Filter users based on message type
  const availableUsers = processedUsers.filter((user) => {
    if (messageType === "sms") return user.canReceiveSMS;
    if (messageType === "whatsapp") return user.canReceiveWhatsApp;
    return false;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getContactNumber = (user: AdminUser) => {
    if (messageType === "whatsapp") {
      return (
        user.whatsappNumber ||
        (user.contactType === "phone" ? user.contact : null)
      );
    }
    if (messageType === "sms") {
      return user.contactType === "phone" ? user.contact : user.whatsappNumber;
    }
    return null;
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === availableUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(availableUsers.map((user) => user._id));
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("অনুগ্রহ করে একটি বার্তা লিখুন");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("অনুগ্রহ করে কমপক্ষে একজন ব্যবহারকারী নির্বাচন করুন");
      return;
    }

    setSending(true);

    try {
      // Console log for now - will be replaced with actual API call later
      const selectedUsersData = availableUsers.filter((user) =>
        selectedUsers.includes(user._id)
      );

      console.log("=== গণ বার্তা প্রেরণ ===");
      console.log("বার্তার ধরন:", messageType === "sms" ? "SMS" : "WhatsApp");
      console.log("বার্তা:", message.trim());
      console.log("নির্বাচিত ব্যবহারকারী সংখ্যা:", selectedUsers.length);
      console.log(
        "নির্বাচিত ব্যবহারকারীরা:",
        selectedUsersData.map((user) => ({
          নাম: user.fullNameEnglish,
          বাংলা_নাম: user.fullNameBangla,
          যোগাযোগ: getContactNumber(user),
          ব্যবহারকারী_আইডি: user._id,
        }))
      );
      console.log("========================");

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(
        `${selectedUsers.length} জন ব্যবহারকারীর কাছে ${
          messageType === "sms" ? "SMS" : "WhatsApp"
        } বার্তা পাঠানো হয়েছে (Console এ দেখুন)`
      );

      // Reset form
      setMessage("");
      setSelectedUsers([]);
      onOpenChange(false);
    } catch (error) {
      toast.error("বার্তা পাঠাতে সমস্যা হয়েছে");
      console.error("Bulk message error:", error);
    } finally {
      setSending(false);
    }
  };

  // Function for sending bulk messages
  const sendBulkMessage = async ({
    userIds,
    message,
    messageType,
    users,
  }: {
    userIds: string[];
    message: string;
    messageType: MessageType;
    users: SelectedUser[];
  }) => {
    try {
      // Get auth token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Make API call to backend
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/v1/messaging/bulk-send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userIds,
            message,
            messageType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send bulk message");
      }

      const result = await response.json();
      console.log("Bulk message sent successfully:", result);

      return result;
    } catch (error) {
      console.error("Bulk message error:", error);
      throw error;
    }
  };

  const selectedUsersData = availableUsers.filter((user) =>
    selectedUsers.includes(user._id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <MessageSquare className="h-6 w-6 text-[#F06122]" />
            গণ বার্তা প্রেরণ
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
          {/* Message Type and Composition */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">বার্তার ধরন</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant={messageType === "whatsapp" ? "default" : "outline"}
                    onClick={() => {
                      setMessageType("whatsapp");
                      setSelectedUsers([]);
                    }}
                    className="flex-1 flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant={messageType === "sms" ? "default" : "outline"}
                    onClick={() => {
                      setMessageType("sms");
                      setSelectedUsers([]);
                    }}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    SMS
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  {messageType === "whatsapp"
                    ? "WhatsApp নম্বর বা ফোন নম্বর আছে এমন ব্যবহারকারীদের কাছে পাঠানো হবে"
                    : "ফোন নম্বর আছে এমন ব্যবহারকারীদের কাছে SMS পাঠানো হবে"}
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">বার্তা লিখুন</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="এখানে আপনার বার্তা লিখুন..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{message.length} অক্ষর</span>
                  {messageType === "sms" && (
                    <span>
                      {Math.ceil(message.length / 160)} SMS
                      {message.length > 160 && " (মাল্টি-পার্ট)"}
                    </span>
                  )}
                </div>
                {/* Debug Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("Debug: Button clicked!");
                    console.log("Message:", message);
                    console.log("Selected users:", selectedUsers.length);
                    console.log("Message type:", messageType);
                  }}
                  className="w-full text-xs"
                >
                  🔍 Debug: Console Log Test
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* User Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    ব্যবহারকারী নির্বাচন
                    <Badge variant="outline">
                      {availableUsers.length} জন উপলব্ধ
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      disabled={availableUsers.length === 0}
                    >
                      {selectedUsers.length === availableUsers.length
                        ? "সব বাতিল"
                        : "সব নির্বাচন"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {availableUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>
                      {messageType === "whatsapp"
                        ? "WhatsApp বার্তা পাঠানোর জন্য কোনো ব্যবহারকারী পাওয়া যায়নি"
                        : "SMS পাঠানোর জন্য কোনো ব্যবহারকারী পাওয়া যায়নি"}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {availableUsers.map((user) => {
                        const isSelected = selectedUsers.includes(user._id);
                        const contactNumber = getContactNumber(user);

                        return (
                          <div
                            key={user._id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[#F06122]/10 border-[#F06122]/30"
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => handleUserToggle(user._id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleUserToggle(user._id)}
                            />
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={user.profileImage}
                                alt={user.fullNameEnglish}
                              />
                              <AvatarFallback className="bg-[#F06122]/10 text-[#F06122] font-semibold text-sm">
                                {getInitials(user.fullNameEnglish)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {user.fullNameEnglish}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {user.fullNameBangla}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {messageType === "whatsapp" ? (
                                  <MessageCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Phone className="h-3 w-3 text-blue-600" />
                                )}
                                <span className="text-xs text-gray-500">
                                  {contactNumber}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-[#F06122]" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Send Button - Always Visible */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedUsers.length > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#F06122]" />
                    <span className="font-medium">
                      {selectedUsers.length} জন নির্বাচিত
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {selectedUsersData.slice(0, 5).map((user) => (
                      <Avatar
                        key={user._id}
                        className="h-8 w-8 border-2 border-white"
                      >
                        <AvatarImage
                          src={user.profileImage}
                          alt={user.fullNameEnglish}
                        />
                        <AvatarFallback className="bg-[#F06122]/10 text-[#F06122] text-xs">
                          {getInitials(user.fullNameEnglish)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {selectedUsers.length > 5 && (
                      <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          +{selectedUsers.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    কোনো ব্যবহারকারী নির্বাচিত নয়
                  </span>
                </div>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={
                sending || !message.trim() || selectedUsers.length === 0
              }
              className="flex items-center gap-2 bg-[#F06122] hover:bg-[#F06122]/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sending ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

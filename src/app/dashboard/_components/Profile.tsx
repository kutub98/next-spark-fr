"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectCurrentUser } from "@/redux/features/auth/authSlice";
import { AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProfileDropdown() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector(selectCurrentUser);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("লগআউট সফল হয়েছে");
      router.push("/auth");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "লগআউট করতে সমস্যা হয়েছে";
      toast.error(errorMessage);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full p-0 w-9 h-9">
          <Avatar className="w-9 h-9">
            <AvatarImage src="/avatar.jpg" alt="User" />
            <AvatarFallback>
              {user?.fullNameEnglish?.charAt(0) ||
                user?.fullNameBangla?.charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-semibold">{user?.fullNameEnglish}</span>
            <span className="text-xs text-gray-500">{user?.contact}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
          <User className="w-4 h-4 mr-2" /> প্রোফাইল
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
          <Settings className="w-4 h-4 mr-2" /> সেটিংস
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-500 focus:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" /> লগআউট
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

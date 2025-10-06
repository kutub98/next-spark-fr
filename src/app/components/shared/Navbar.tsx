"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Home,
  BookOpen,
  Trophy,
  HelpCircle,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser, initializeAuth } from "@/redux/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import { store } from "@/store/store";
import { RootState, AppDispatch } from "@/store/store";

const navLinks = [
  { label: "হোম", href: "/", icon: Home },
  { label: "নিয়মবলি", href: "/rules", icon: BookOpen },
  { label: "ফলাফল", href: "/result", icon: Trophy },
  { label: "জিঙ্গাসা", href: "/ask-question", icon: HelpCircle },
];

export default function Navbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const user = useSelector(selectCurrentUser);
  const rolePath = user?.role === "admin" ? "admin" : "student";

  // পেজ লোডের সময় অথেনটিকেশন চেক করা
  useEffect(() => {
    store.dispatch(initializeAuth()).then((result) => {
      console.log("Navbar Initialize Auth Result:", result);
    });
  }, [dispatch]);

  // ব্যবহারকারীর তথ্য কনসোল লগ করা
  useEffect(() => {
    console.log("Navbar User Info:", user);
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("লগআউট সফল হয়েছে");
      setProfileOpen(false);
      router.push("/");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "লগআউট করতে সমস্যা হয়েছে";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <header className="border-b bg-white/95 backdrop-blur-md shadow-sm fixed top-0 w-full z-50">
        <div className="container max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={500}
              height={500}
              className="h-[70px] w-full object-contain"
            />
          </Link>

          <nav className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1 text-gray-700 hover:text-[color:var(--brand-primary)] font-medium transition-colors px-3 py-2 rounded-lg hover:bg-[color:var(--brand-primary)]/10"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-full hover:bg-transparent"
                  onClick={() => setProfileOpen(!isProfileOpen)}
                >
                  <div className="w-[50px] h-[50px] border-2 border-[color:var(--brand-primary)] rounded-full overflow-hidden bg-[image:var(--brand-gradient)] flex items-center justify-center text-white font-medium text-sm">
                    {user?.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.fullNameEnglish?.charAt(0) ||
                      user?.fullNameBangla?.charAt(0) ||
                      "U"
                    )}
                  </div>
                  <span className="text-gray-700 font-medium text-[16px]">
                    {user?.fullNameBangla || user?.fullNameEnglish || "User"}
                  </span>
                </Button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.fullNameEnglish}
                      </p>
                      <p className="text-xs text-gray-500">{user?.contact}</p>
                    </div>

                    <Link
                      href={`/${rolePath}/dashboard`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[color:var(--brand-primary)]/10 hover:text-[color:var(--brand-primary)]"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      ড্যাশবোর্ড
                    </Link>

                    <Link
                      href={`/${rolePath}/profile`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[color:var(--brand-primary)]/10 hover:text-[color:var(--brand-primary)]"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      প্রোফাইল
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4" />
                      লগআউট
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth">
                <Button className="px-6 py-2 rounded-xl bg-[color:var(--brand-primary)] hover:opacity-90 text-white shadow-md transition-all">
                  লগইন / রেজিস্টার
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated && (
              <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-medium text-sm mr-2">
                {user?.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.fullNameEnglish?.charAt(0) ||
                  user?.fullNameBangla?.charAt(0) ||
                  "U"
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(true)}
              aria-label="Open mobile menu"
              className="text-gray-700 hover:text-[color:var(--brand-primary)] hover:bg-[color:var(--brand-primary)]/10"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-[1054] bg-black/30 backdrop-blur-sm h-screen transition-opacity duration-300 ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden={!isMenuOpen}
        >
          <aside
            className={`w-80 bg-white h-full p-6 flex flex-col gap-6 shadow-lg rounded-r-xl transform transition-transform duration-300
              ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-4">
              <Link
                href="/"
                className="flex items-center"
                onClick={() => setMenuOpen(false)}
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={500}
                  height={500}
                  className="h-[70px] w-full object-contain"
                />
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isAuthenticated && (
              <div className="px-4 py-3 bg-[color:var(--brand-primary)]/10 rounded-lg mb-4">
                <p className="font-medium text-gray-900">
                  {user?.fullNameEnglish}
                </p>
                <p className="text-sm text-gray-600">{user?.contact}</p>
              </div>
            )}

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 text-gray-700 hover:text-[color:var(--brand-primary)] font-medium transition p-3 rounded-lg hover:bg-[color:var(--brand-primary)]/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href={`/${rolePath}/dashboard`}
                    className="flex items-center gap-3 text-gray-700 hover:text-[color:var(--brand-primary)] font-medium transition p-3 rounded-lg hover:bg-[color:var(--brand-primary)]/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    ড্যাশবোর্ড
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-red-600 hover:text-red-700 font-medium transition p-3 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    লগআউট
                  </button>
                </div>
              ) : (
                <Link href="/auth" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full bg-[color:var(--brand-primary)] hover:opacity-90 text-white shadow-md">
                    লগইন / রেজিস্টার
                  </Button>
                </Link>
              )}
            </div>
          </aside>
        </div>
      </header>

      <div className="h-16"></div>
    </>
  );
}

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, initializeAuth } from "@/redux/features/auth/authSlice";
import {
  LayoutDashboard,
  User,
  BookOpen,
  Trophy,
  LogOut,
  Menu,
  X,
  BarChart3,
  Users,
  FileText,
  Home,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/store/store";
import Link from "next/link";

const sidebarItems = {
  student: [
    { label: "ড্যাশবোর্ড", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "কুইজ", href: "/student/quiz", icon: BookOpen },
    { label: "ফলাফল", href: "/student/results", icon: Trophy },
    { label: "প্রোফাইল", href: "/student/profile", icon: User },
  ],
  admin: [
    { label: "ড্যাশবোর্ড", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "ব্যবহারকারী", href: "/admin/users", icon: Users },
    { label: "কুইজ পরিচালনা", href: "/admin/quiz-management", icon: BookOpen },
    {
      label: "পরিসংখ্যান",
      href: "/admin/participant-analytics",
      icon: BarChart3,
    },
    { label: "রিপোর্ট", href: "/admin/reports", icon: FileText },
    { label: "প্রোফাইল", href: "/admin/profile", icon: User },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize auth on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          await dispatch(initializeAuth()).unwrap();
        }
      } catch {
        console.log("Auth initialization failed");
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [dispatch]);

  // Handle authentication and authorization
  useEffect(() => {
    if (isCheckingAuth) return;
    if (!isAuthenticated || !user) {
      router.replace("/auth");
      return;
    }
    const isAdminPath = pathname.startsWith("/admin");
    const isStudentPath = pathname.startsWith("/student");
    if (isAdminPath && user.role !== "admin") {
      toast.error("Admin access required");
      router.replace("/student/dashboard");
    } else if (isStudentPath && user.role !== "student") {
      toast.error("Student access required");
      router.replace("/admin/dashboard");
    }
  }, [pathname, user, isAuthenticated, isCheckingAuth, router]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("লগআউট সফল হয়েছে");
      router.push("/");
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "লগআউট করতে সমস্যা হয়েছে"
      );
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#F06122] mx-auto mb-4" />
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const userRole = user.role?.toLowerCase() || "student";
  const items = sidebarItems[userRole as keyof typeof sidebarItems] || [];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {isMobile ? (
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64"
              style={{ backgroundColor: "#232323" }}
            >
              <SidebarContent
                user={user}
                items={items}
                pathname={pathname}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      ) : (
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64" style={{ backgroundColor: "#232323" }}>
            <SidebarContent
              user={user}
              items={items}
              pathname={pathname}
              onLogout={handleLogout}
            />
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {items.find((item) => item.href === pathname)?.label ||
                  "ড্যাশবোর্ড"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">হোমপেজ</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

// Separate sidebar content component
function SidebarContent({
  user,
  items,
  pathname,
  onClose,
  onLogout,
}: {
  user: {
    fullNameEnglish: string;
    fullNameBangla?: string;
    role: string;
  } | null;
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  pathname: string;
  onClose?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-[55px] h-[50px] bg-[#fff] rounded-lg flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={500}
              height={500}
              className="h-[30px] w-full object-contain"
            />
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#F06122] rounded-full flex items-center justify-center font-semibold text-white">
            {user?.fullNameEnglish?.charAt(0) ||
              user?.fullNameBangla?.charAt(0) ||
              "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.fullNameEnglish || user?.fullNameBangla}
            </p>
            <p className="text-xs text-gray-300 truncate">
              {user?.role === "admin" ? "এডমিন" : "শিক্ষার্থী"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-[#F06122] bg-opacity-20 border-l-4 border-[#F06122]"
                  : "hover:bg-[#F06122] hover:bg-opacity-10 border-l-4 border-transparent"
              }`}
              onClick={() => onClose?.()}
            >
              <Icon
                className={`w-5 h-5 transition-colors text-gray-300 group-hover:text-white" ${
                  isActive
                    ? "text-[#F06122]"
                    : "text-gray-300 group-hover:text-[#fff]"
                }`}
              />
              <span
                className={`text-sm font-medium transition-colors text-gray-300 group-hover:text-white"${
                  isActive
                    ? "text-[#F06122]"
                    : "text-gray-300 group-hover:text-white"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 w-full px-3 py-3 rounded-lg transition-all duration-200 hover:bg-[#F06122] hover:bg-opacity-10 group"
        >
          <LogOut className="w-5 h-5 text-gray-300 group-hover:text-[#F06122] transition-colors" />
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            লগআউট
          </span>
        </button>
      </div>
    </div>
  );
}

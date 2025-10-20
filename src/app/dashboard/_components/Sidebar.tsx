"use client";

import { Button } from "@/components/ui/button";
import {
  ChartCandlestick,
  Home,
  Menu,
  MonitorCog,
  Settings,
  User2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";

// Nested menu configuration
const menuItems = [
  {
    label: "Appearance",
    icon: <MonitorCog />,
    routes: [
      { label: "Banner", href: "/dashboard/appearance/banner" },
      { label: "Offer", href: "/dashboard/appearance/offer" },
      { label: "Quiz Data", href: "/dashboard/appearance/quizData" },
      { label: "Judge Panel", href: "/dashboard/appearance/judge-panel" },
      {
        label: "Time Instruction",
        href: "/dashboard/appearance/time-instruction",
      },
      { label: "FaQ", href: "/dashboard/appearance/faq" },
    ],
  },
  {
    label: "Users",
    icon: <User2 />,
    routes: [
      { label: "Users", href: "/dashboard/users" },
      { label: "Payroll List", href: "/dashboard/payroll-list" },
      { label: "Withdraw List", href: "/dashboard/withdraw-request-list" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  collapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  collapsed,
  toggleCollapse,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 !overflow-y-scroll  scrollbar-hide  left-0 z-50  h-screen bg-gray-800 text-white
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-14" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex sticky top-0 w-full bg-gray-800 items-center justify-between p-3 border-b border-white/20">
          {!collapsed && <h2 className="text-lg font-bold">Admin Panel</h2>}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="text-white hover:bg-orange-600/90"
            >
              <Menu />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-white lg:hidden hover:bg-orange-600/90"
            >
              <X />
            </Button>
          </div>
        </div>

        <nav className="mt-4 space-y-1 ">
          {/* Main routes */}
          {[
            { href: "/dashboard", icon: <Home />, label: "Dashboard" },
            {
              href: "/analytics",
              icon: <ChartCandlestick />,
              label: "Analytics",
            },
            { href: "/users", icon: <Users />, label: "Users" },
            { href: "/settings", icon: <Settings />, label: "Settings" },
          ].map(({ href, icon, label }) => (
            <Link href={href} key={href}>
              <Button
                variant="ghost"
                className="w-full justify-start hover:text-white text-white !hover:text-white hover:bg-orange-600/90"
              >
                <span className="mr-2">{icon}</span>
                {!collapsed && label}
              </Button>
            </Link>
          ))}

          {/* Nested dropdown menus */}
          {menuItems.map((item) => (
            <div key={item.label}>
              <Button
                variant="ghost"
                className="w-full justify-start hover:text-white text-white hover:bg-orange-600/90"
                onClick={() => toggleDropdown(item.label)}
              >
                <span className="mr-2">{item.icon}</span>
                {!collapsed && (
                  <>
                    {item.label}
                    <span className="ml-auto">
                      {openDropdown === item.label ? "▲" : "▼"}
                    </span>
                  </>
                )}
              </Button>
              {!collapsed && openDropdown === item.label && (
                <div className="ml-6 space-y-1">
                  {item.routes.map((route) => (
                    <Link href={route.href} key={route.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:text-white hover:bg-orange-600/90 text-sm"
                      >
                        {route.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

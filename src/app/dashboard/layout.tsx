

"use client";

import { FC, ReactNode, useState } from "react";
import Header from "./_components/Header";
import Sidebar from "./_components/Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // mobile toggle
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false); // lg toggle
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setSidebarCollapsed(!isSidebarCollapsed);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const sidebarWidth = isSidebarCollapsed ? "lg:ml-14" : "lg:ml-64";

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        collapsed={isSidebarCollapsed}
        toggleCollapse={toggleCollapse}
      />
      <div className={`transition-all duration-300 ${sidebarWidth}`}>
        <Header
          toggleTheme={toggleTheme}
          theme={theme}
          toggleSidebar={toggleSidebar}
        />
        <main className="p-4 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-all">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

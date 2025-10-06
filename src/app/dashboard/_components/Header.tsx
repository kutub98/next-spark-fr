

import { FC } from "react";
import { Bell, Menu, MoonIcon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProfileDropdown from "./Profile";

interface HeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

const Header: FC<HeaderProps> = ({ theme, toggleTheme, toggleSidebar }) => {
  return (
    <header className="sticky top-0 bg-white dark:bg-gray-800 shadow px-4 py-3 flex items-center justify-between z-30">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-lg">Dashboard</h1>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search here..." />
        <Bell />
        <Button onClick={toggleTheme} variant="ghost">
          {theme === "dark" ? <MoonIcon /> : <Sun />}
        </Button>
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;

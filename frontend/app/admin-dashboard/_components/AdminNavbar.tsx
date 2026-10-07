"use client";

import { Home, ChevronRight, ChevronDown, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/lib/AuthContext";
import NotificationBell from "@/components/NotificationBell";

export default function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getPageName = () => {
    if (pathname.includes("/property-listings")) return "Property Listings";
    if (pathname.includes("/property-audit")) return "Property Audit";
    if (pathname.includes("/builders")) return "Builder Management";
    if (pathname.includes("/leads")) return "Leads Management";
    if (pathname.includes("/meetings")) return "Meetings";
    if (pathname.includes("/analytics")) return "Reports & Analytics";
    if (pathname.includes("/settings")) return "Settings";
    return "Dashboard Overview";
  };

  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between pr-4 md:pr-8 text-black sticky top-0 z-50 shadow-sm transition-all w-full">
      <div className="flex items-center h-full">
        <button
          onClick={onMenuClick}
          className="p-2 ml-4 mr-2 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center md:w-[272px] h-full pr-4 md:pr-8 md:border-r border-gray-100">
          <Link href="/" className="flex items-center">
            <img
              src="/images/linktwobuilderlogo.jpeg"
              alt="Link2Builder"
              className="h-15pro md:h-15 w-auto object-contain"
            />
          </Link>
        </div>
        <div className="hidden sm:flex items-center gap-2 pl-4 md:pl-8">
          <div className="p-1.5 bg-purple-600 rounded text-white shadow-sm">
            <Home size={14} />
          </div>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-bold">{getPageName()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <NotificationBell />
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="flex items-center gap-2 pr-4 border-r border-gray-100 dark:border-gray-800">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="admin"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs ring-2 ring-white shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-900 leading-none">{user?.name || "Global Admin"}</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{user?.role || "Super User"}</p>
            </div>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        {dropdownOpen && (
          <div className="absolute top-12 right-0 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in duration-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

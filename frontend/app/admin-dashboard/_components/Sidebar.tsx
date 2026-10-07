"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Building,
  Home,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Briefcase,
  Video,
  PieChart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/AuthContext";

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Persistence logic
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
    setIsMounted(true);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("admin-sidebar-collapsed", String(newState));
  };

  const navLinks = [
    { href: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin-dashboard/builders", label: "User Management", icon: Users },
    { href: "/admin-dashboard/property-listings", label: "Property Listings", icon: Home },
    { href: "/admin-dashboard/property-audit", label: "Audit Workspace", icon: Building },
    { href: "/admin-dashboard/leads", label: "Leads Management", icon: Briefcase },
    { href: "/admin-dashboard/meetings", label: "Meetings", icon: Video },
    { href: "/admin-dashboard/site-visits", label: "Site Visit History", icon: PieChart },
    ...(user?.role === "SUPER_ADMIN" ? [{ href: "/admin-dashboard/team-management", label: "Team Management", icon: ShieldCheck }] : [])
  ];

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay - Mobile Only */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Dark Professional Theme */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 288,
          x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -288 : 0)
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          fixed md:relative z-50 top-0 left-0 h-full shrink-0
          bg-[#111827] text-gray-300 flex flex-col
          md:border-r border-gray-800 shadow-2xl
        `}
      >
        {/* Toggle Button - Desktop Only */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-purple-600 rounded-full items-center justify-center text-white border-2 border-[#111827] hover:bg-purple-500 transition-colors z-[60] shadow-lg cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-6 border-b border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && <span className="font-black text-xl text-white tracking-tighter">ADMIN</span>}
          {isCollapsed && <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black">A</div>}
          
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-xl hover:bg-gray-800 text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-2 mt-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin-dashboard" && link.href !== "/" && pathname?.startsWith(link.href));

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => { if (window.innerWidth < 768) onClose(); }}
                title={isCollapsed ? link.label : ""}
                className={`flex items-center rounded-xl transition-all duration-200 group relative
                  ${isCollapsed ? 'justify-center p-3.5' : 'gap-4 p-3.5'}
                  ${isActive
                    ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-900/40"
                    : "hover:bg-gray-800/50 hover:text-white"
                  }`}
              >
                <link.icon
                  size={20}
                  className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-purple-400"} transition-colors shrink-0`}
                />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm tracking-wide whitespace-nowrap"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Collapsed Tooltip (Simple using title) */}
              </Link>
            );
          })}
        </nav>

        {/* Footer info or profile can go here */}
        {!isCollapsed && (
          <div className="p-6 border-t border-gray-800">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {user?.name?.[0] || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                </div>
             </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}

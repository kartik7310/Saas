"use client";

import Image from "next/image";
import { Bell, Clock, Menu, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user, logout, switchRole } = useAuth();
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="w-full h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 relative z-50">

            {/* LEFT SECTION */}
            <div className="flex items-center gap-2 md:gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                    <Menu size={20} className="text-gray-600" />
                </button>

                <Link href="/" className="flex items-center gap-2">
                    <img 
                      src="/images/linktwobuilderlogo.jpeg" 
                      alt="Link2Builder" 
                      className="h-18 w-auto object-contain"
                    />
                </Link>
            </div>


            {/* RIGHT SECTION */}
            <div className="flex items-center gap-6">
                <NotificationBell />




                {/* USER PROFILE */}
                <div className="relative" ref={dropdownRef}>
                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => setProfileOpen(!profileOpen)}
                    >
                        {user?.avatar ? (
                            <Image
                                src={user.avatar}
                                alt="user"
                                width={34}
                                height={34}
                                className="rounded-full object-cover border border-purple-100"
                            />
                        ) : (
                            <div className="w-8.5 h-8.5 w-[34px] h-[34px] rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm border border-purple-200 shadow-sm">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                        )}

                        <span className="text-gray-700 font-medium group-hover:text-blue-500 transition-colors">
                            {user?.name || "User"}
                        </span>

                        <ChevronDown size={16} className={`text-gray-600 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                    </div>

                    {/* Profile Dropdown */}
                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200 overflow-hidden">
                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Signed in as</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || "User"}</p>
                                <p className="text-[11px] font-medium text-purple-600 lowercase">{user?.role || "BROKER"}</p>
                            </div>

                            <div className="py-1">
                                <p className="px-4 py-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">Switch Account Type</p>
                                <button
                                    onClick={() => switchRole('BUYER')}
                                    className="w-full text-left flex items-center px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                >
                                    Switch to Buyer Account
                                </button>
                            </div>

                            <div className="border-t border-gray-50 mt-1 pt-1">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
}
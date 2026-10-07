"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    SquareCheckBig,
    FileText,
    User,
    Video,
    BarChart3,
    Megaphone,
    Settings,
    X,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
    name: string;
    icon: any;
    path: string;
    children?: {
        name: string;
        icon: any;
        path: string;
    }[];
}

const menu: MenuItem[] = [
    {
        name: "Dashboard",
        icon: Home,
        path: "/builder-dashboard"
    },
    {
        name: "Add Property",
        icon: SquareCheckBig,
        path: "/builder-dashboard/add-property",
    },

    {
        name: "My Projects",
        icon: FileText,
        path: "/builder-dashboard/projects"
    },
    {
        name: "Leads",
        icon: User,
        path: "/builder-dashboard/leads"
    },
    {
        name: "Video Meetings",
        icon: Video,
        path: "/builder-dashboard/meetings"
    },
    {
        name: "Subscription",
        icon: Sparkles,
        path: "/builder-dashboard/subscription"
    },
];

export default function BuilderSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem("builder-sidebar-collapsed");
        if (saved !== null) {
            setIsCollapsed(saved === "true");
        }
        setIsMounted(true);
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem("builder-sidebar-collapsed", String(newState));
    };

    if (!isMounted) return null;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Content */}
            <motion.div 
                initial={false}
                animate={{ width: isCollapsed ? 80 : 260 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`
                    fixed lg:relative inset-y-0 left-0 z-50
                    bg-white border-r flex flex-col transition-all
                    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                {/* Desktop Toggle Button */}
                <button
                    onClick={toggleCollapse}
                    className="hidden lg:flex absolute -right-3 top-12 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50 hover:text-blue-600 transition-all z-[60] cursor-pointer"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <div className={`p-6 border-b flex items-center ${isCollapsed ? 'justify-center' : 'justify-between font-black text-xl text-blue-600 tracking-tighter'}`}>
                    <span className={isCollapsed ? "hidden" : "block"}>BUILDER</span>
                    {isCollapsed && <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">B</div>}
                    
                    <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="flex flex-col gap-2 p-4 mt-4 flex-1">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        const active = (item.path === "/builder-dashboard" || item.path === "/") ? pathname === item.path : pathname.startsWith(item.path);

                        return (
                            <div key={item.name} className="relative group">
                                {/* Parent Menu */}
                                <Link
                                    href={item.path}
                                    onClick={() => {
                                        if (window.innerWidth < 1024) onClose();
                                    }}
                                    title={isCollapsed ? item.name : ""}
                                    className={`flex items-center rounded-xl transition-all duration-200
                                        ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'}
                                        ${active ? "bg-blue-50 text-blue-600 font-bold shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                                >
                                    <Icon size={20} className={active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"} />
                                    
                                    <AnimatePresence mode="wait">
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="whitespace-nowrap overflow-hidden text-[13.5px]"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>

                                {/* Children Menu - Hide in collapsed mode for simplicity or show as hover menu */}
                                {item.children && !isCollapsed && (
                                    <div className="ml-8 mt-1 flex flex-col gap-1">
                                        {item.children.map((child) => {
                                            const ChildIcon = child.icon;
                                            const childActive = pathname === child.path;

                                            return (
                                                <Link
                                                    key={child.name}
                                                    href={child.path}
                                                    onClick={() => {
                                                        if (window.innerWidth < 1024) onClose();
                                                    }}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
                                                        ${childActive ? "bg-blue-50/50 text-blue-600 font-bold" : "text-gray-500 hover:bg-gray-100"}`}
                                                >
                                                    <ChildIcon size={16} />
                                                    {child.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </>
    );
}
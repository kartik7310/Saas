"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "./_components/Sidebar";
import AdminNavbar from "./_components/AdminNavbar";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
            <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
                <AdminNavbar onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="flex flex-1 overflow-hidden relative">
                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                    <main className="flex-1 overflow-y-auto w-full h-full relative p-4 md:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}

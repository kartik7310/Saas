"use client";

import { useState } from "react";
import BuilderSidebar from "./_components/BuilderSidebar";
import Navbar from "./_components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <ProtectedRoute allowedRoles={["BUILDER"]}>
            <div className="h-screen flex flex-col bg-gray-100 font-sans">

                {/* Top Navbar */}
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Sidebar + Content */}
                <div className="flex flex-1 overflow-hidden relative">

                    <BuilderSidebar 
                        isOpen={isSidebarOpen} 
                        onClose={() => setIsSidebarOpen(false)} 
                    />

                    <main className="flex-1 p-4 md:p-6 overflow-y-auto ">
                        {children}
                    </main>

                </div>

            </div>
        </ProtectedRoute>
    );
}
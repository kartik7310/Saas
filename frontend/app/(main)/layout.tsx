"use client";

import Navbar from "@/components/Navbar";
import Footer from "./components/Footer";
import { FloatingCompareBar } from "@/components/FloatingCompareBar";
import { useAuth, getRoleRoute } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mt-20">
        {children}
      </div>
      <FloatingCompareBar />
      <Footer />
    </>
  );
}

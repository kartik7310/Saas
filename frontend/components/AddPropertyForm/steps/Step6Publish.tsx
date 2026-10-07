"use client";

import { Check, Eye, Mail, LayoutGrid, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function Step6Publish({ isEdit }: { isEdit?: boolean }) {
   const { user } = useAuth();
   
   const getDashboardLink = () => {
      const role = user?.role;
      if (role === "SUPER_ADMIN" || role === "ADMIN") return "/admin-dashboard";
      if (role === "SELLER") return "/seller";
      if (role === "BUILDER") return "/builder-dashboard";
      if (role === "BROKER") return "/broker";
      return "/";
   };

   return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-12 shadow-sm flex flex-col items-center text-center">

         {/* Confetti */}
         <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => (
               <span
                  key={i}
                  className="confetti absolute"
                  style={{
                     left: `${Math.random() * 100}%`,
                     animationDelay: `${Math.random() * 3}s`,
                     backgroundColor: [
                        "#ff007f",
                        "#00d4ff",
                        "#9d00ff",
                        "#ffd700",
                        "#ff6b6b",
                        "#00ff9d",
                     ][i % 6],
                  }}
               />
            ))}
         </div>

         {/* Success Icon */}
         <div className="mb-6 relative">
            <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-pulse">
               <Check className="h-12 w-12 text-white stroke-[3]" />
            </div>
         </div>

         {/* Heading */}
         <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
            {isEdit ? "Property Successfully Updated!" : "Property Listed for Admin Approval!"}
         </h1>

         <p className="text-slate-500 mb-10">
            Your property listing has been successfully saved and updated.
         </p>

         {/* Actions */}
         <div className="w-full max-w-xl space-y-3 mb-10">

            {/* View All Projects */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border rounded-xl bg-white hover:border-blue-200 hover:shadow-sm transition">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                     <LayoutGrid className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-slate-700 text-sm md:text-base">
                     View All Projects
                  </span>
               </div>

               <Link href={getDashboardLink() === "/seller" ? "/seller/projects" : getDashboardLink()}>
                  <Button
                     variant="outline"
                     className="w-full sm:w-auto text-xs font-semibold h-9 px-4 border-slate-200"
                  >
                     Go to Projects
                  </Button>
               </Link>
            </div>

         </div>

         {/* Dashboard Button */}
         <Link href={getDashboardLink()}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-11 rounded-xl font-semibold shadow-md">
               Back to Dashboard
            </Button>
         </Link>
      </div>
   );
}
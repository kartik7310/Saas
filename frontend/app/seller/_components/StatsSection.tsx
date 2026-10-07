"use client";

import { useState, useEffect } from "react";
import { Home, Users, Calendar, Tag, Loader2, Target, TrendingUp } from "lucide-react";
import StatsCard from "./StatsCard";
import { api } from "@/lib/api";

interface SellerStats {
  publishedProjects: number;
  newLeads: number;
  meetings: number;
  totalSales: string;
}

export default function StatsSection() {
    const [stats, setStats] = useState<SellerStats>({
        publishedProjects: 0,
        newLeads: 0,
        meetings: 0,
        totalSales: "₹ 0"
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const data = await api("/auth/dashboard-stats");
                // The API returns { publishedProjects, newLeads, meetings, totalSales }
                if (data) {
                  setStats({
                    publishedProjects: data.publishedProjects || 0,
                    newLeads: data.newLeads || 0,
                    meetings: data.meetings || 0,
                    totalSales: data.totalSales || "₹ 0"
                  });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse border border-gray-50" />
            ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <StatsCard
                icon={Home}
                value={stats.publishedProjects.toString()}
                label="Total Projects"
                sub=""
                bg="#eef2ff"
                iconColor="text-blue-500"
            />

            <StatsCard
                icon={Target}
                value={stats.newLeads.toString()}
                label="Total Leads"
                sub=""
                bg="#ecfdf5"
                iconColor="text-emerald-500"
            />

            <StatsCard
                icon={Calendar}
                value={stats.meetings.toString()}
                label="Scheduled VCs"
                sub=""
                bg="#f5f3ff"
                iconColor="text-purple-500"
            />
        </div>
    );
}
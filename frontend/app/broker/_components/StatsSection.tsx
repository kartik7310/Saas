"use client";

import { useState, useEffect } from "react";
import { Home, Users, Calendar, Tag, BarChart3, Loader2 } from "lucide-react";
import StatsCard from "./StatsCard";
import { api } from "@/lib/api";

export default function StatsSection() {
    const [stats, setStats] = useState({
        publishedProjects: 0,
        newLeads: 0,
        meetings: 0,
        totalSales: "₹ 0"
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api("/auth/dashboard-stats");
                setStats(data);
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
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 bg-white p-3 rounded-xl shadow-sm border border-slate-100">

            <StatsCard
                icon={Home}
                value={(stats.publishedProjects || 0).toString()}
                label="Published Project"
                sub=""
                bg="#eef2ff"
                iconColor="text-blue-500"
            />

            <StatsCard
                icon={Users}
                value={(stats.newLeads || 0).toString()}
                label="New Leads"
                sub=""
                bg="#ecfdf5"
                iconColor="text-green-500"
            />

            <StatsCard
                icon={Calendar}
                value={(stats.meetings || 0).toString()}
                label="Meetings"
                sub="Today"
                bg="#f5f3ff"
                iconColor="text-purple-500"
            />

        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Area,
    AreaChart,
} from "recharts";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { UserIcon, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const placeholderData = [
    { month: "J", leads: 0, revenue: 0 },
    { month: "F", leads: 0, revenue: 0 },
    { month: "M", leads: 0, revenue: 0 },
    { month: "A", leads: 0, revenue: 0 },
    { month: "M", leads: 0, revenue: 0 },
    { month: "J", leads: 0, revenue: 0 },
];

export default function AnalyticsOverview() {
    const [chartData, setChartData] = useState(placeholderData);
    const [stats, setStats] = useState({ newLeads: 0, totalSales: "₹ 0" });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await api("/auth/dashboard-stats");
                if (data.chartData) setChartData(data.chartData);
                setStats({ newLeads: data.newLeads, totalSales: data.totalSales });
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <Card className="w-full lg:w-[420px] rounded-2xl shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                    Analytics Overview
                </CardTitle>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    Leads
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="leads" stroke="#2563eb" fill="url(#blueGradient)" strokeWidth={3} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="flex flex-col sm:flex-row justify-between gap-4 border-t pt-4 mt-4">
                    <div className="flex items-center gap-3">
                        <div className="text-blue-500 text-xl">
                            <UserIcon />
                        </div>
                        <div>
                            <p className="text-xl font-semibold">{stats.newLeads}</p>
                            <p className="text-sm text-gray-500">
                                Total Leads <span className="text-gray-400 text-xs">(all time)</span>
                            </p>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}